const DB_NAME = 'FormCraftDB';
const DB_VERSION = 1;
const STORE_NAME = 'schemaStore';
const BACKUP_STORAGE_KEY = 'formcraft_saved_schema_backup';

let cachedDb: IDBDatabase | null = null;
let isOpening = false;
const pendingOpenResolvers: Array<(db: IDBDatabase | null) => void> = [];

function closeCachedDb() {
  if (cachedDb) {
    try {
      cachedDb.close();
    } catch {
      // Ignore cleanup error
    }
    cachedDb = null;
  }
}

// Clean up database connection if the page unloads or is hidden to prevent closing conflicts
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => closeCachedDb());
}

export const openDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        return resolve(null);
      }

      // Check if existing connection is still open and healthy
      if (cachedDb) {
        try {
          // Quick probe to verify if connection is closing
          if (cachedDb.objectStoreNames.contains(STORE_NAME)) {
            return resolve(cachedDb);
          }
        } catch {
          closeCachedDb();
        }
      }

      if (isOpening) {
        pendingOpenResolvers.push(resolve);
        return;
      }

      isOpening = true;
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        try {
          if (!request.result.objectStoreNames.contains(STORE_NAME)) {
            request.result.createObjectStore(STORE_NAME);
          }
        } catch (e) {
          console.warn('ObjectStore creation notice:', e);
        }
      };

      request.onsuccess = () => {
        isOpening = false;
        const db = request.result;

        // Monitor connection events to prevent InvalidStateError on close
        db.onversionchange = () => {
          try {
            db.close();
          } catch {}
          cachedDb = null;
        };

        db.onclose = () => {
          cachedDb = null;
        };

        db.onerror = () => {
          // Non-fatal, reset cache
          cachedDb = null;
        };

        cachedDb = db;
        resolve(db);

        // Resolve any concurrent callers
        while (pendingOpenResolvers.length > 0) {
          const r = pendingOpenResolvers.shift();
          if (r) r(db);
        }
      };

      request.onerror = (event) => {
        // Prevent event bubbling/unhandled errors
        event.preventDefault();
        event.stopPropagation();
        isOpening = false;
        closeCachedDb();
        resolve(null);

        while (pendingOpenResolvers.length > 0) {
          const r = pendingOpenResolvers.shift();
          if (r) r(null);
        }
      };

      request.onblocked = () => {
        isOpening = false;
        closeCachedDb();
        resolve(null);
      };
    } catch {
      isOpening = false;
      closeCachedDb();
      resolve(null);
    }
  });
};

export const saveSchema = async (schema: any): Promise<void> => {
  // 1. Always write to localStorage backup immediately and safely
  try {
    if (typeof localStorage !== 'undefined') {
      if (schema) {
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(schema));
      } else {
        localStorage.removeItem(BACKUP_STORAGE_KEY);
      }
    }
  } catch (lsErr) {
    console.warn('LocalStorage save fallback notice:', lsErr);
  }

  // 2. Safely attempt to persist to IndexedDB if available and not closing
  try {
    const db = await openDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        if (schema) {
          store.put(schema, 'currentSchema');
        } else {
          store.delete('currentSchema');
        }

        tx.oncomplete = () => resolve();
        tx.onerror = (e) => {
          e.preventDefault?.();
          e.stopPropagation?.();
          resolve();
        };
        tx.onabort = () => resolve();
      } catch (txErr) {
        // If the database connection was in the process of closing, reset cached handle
        closeCachedDb();
        resolve();
      }
    });
  } catch (err) {
    closeCachedDb();
    // Non-fatal, localStorage has already succeeded
  }
};

export const getSchema = async (): Promise<any | null> => {
  try {
    const db = await openDB();
    if (!db) {
      return getLocalStorageBackup();
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get('currentSchema');

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            resolve(getLocalStorageBackup());
          }
        };

        request.onerror = (e) => {
          e.preventDefault?.();
          e.stopPropagation?.();
          resolve(getLocalStorageBackup());
        };
      } catch (txErr) {
        closeCachedDb();
        resolve(getLocalStorageBackup());
      }
    });
  } catch {
    closeCachedDb();
    return getLocalStorageBackup();
  }
};

function getLocalStorageBackup(): any | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.warn('LocalStorage draft retrieval notice:', e);
  }
  return null;
}

/**
 * Specifically purges test/lab records from IndexedDB without affecting actual application drafts
 */
export const clearTestIndexedDBRecords = async (): Promise<{ purgedKeys: string[] }> => {
  const purgedKeys: string[] = [];
  try {
    const db = await openDB();
    if (!db) return { purgedKeys };

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();

        req.onsuccess = () => {
          const keys = req.result || [];
          for (const key of keys) {
            const keyStr = String(key);
            // Only purge test/lab/synthetic records, NEVER 'currentSchema' (actual user draft)
            if (
              keyStr.startsWith('test_') ||
              keyStr.startsWith('lab_') ||
              keyStr.startsWith('synthetic_') ||
              keyStr.startsWith('stress_') ||
              keyStr.startsWith('benchmark_') ||
              keyStr === 'testSchema'
            ) {
              store.delete(key);
              purgedKeys.push(keyStr);
            }
          }
          resolve({ purgedKeys });
        };

        req.onerror = () => {
          resolve({ purgedKeys });
        };
      } catch {
        resolve({ purgedKeys });
      }
    });
  } catch {
    return { purgedKeys };
  }
};

