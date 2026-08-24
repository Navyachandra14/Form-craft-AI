import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import defaultConfig from '../../firebase-applet-config.json';

export const STORAGE_KEY_FIREBASE = 'formcraft_custom_firebase_api_key';

export const getFirebaseApiKey = (): string => {
  try {
    const customKey = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return (import.meta as any).env?.VITE_FIREBASE_API_KEY || defaultConfig.apiKey || '';
};

// Reads from custom key in localStorage, Vercel / Vite Environment Variables, or default config file
export const getActiveFirebaseConfig = () => ({
  apiKey: getFirebaseApiKey(),
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || defaultConfig.appId,
});

const app = getApps().length === 0 ? initializeApp(getActiveFirebaseConfig()) : getApp();
export const auth = getAuth(app);

