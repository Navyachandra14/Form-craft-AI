import { auth } from './firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';

export const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  try {
    return onAuthStateChanged(
      auth,
      async (user: User | null) => {
        try {
          if (user) {
            if (cachedAccessToken) {
              if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
            } else if (!isSigningIn) {
              // If user is logged into Firebase Auth, we need a fresh token from a sign-in or cached
              if (onAuthFailure) onAuthFailure();
            }
          } else {
            cachedAccessToken = null;
            if (onAuthFailure) onAuthFailure();
          }
        } catch (e) {
          console.warn('onAuthStateChanged error handled:', e);
        }
      },
      (error) => {
        console.warn('Firebase Auth state error:', error);
        if (onAuthFailure) onAuthFailure();
      }
    );
  } catch (err) {
    console.warn('initAuth error handled:', err);
    return () => {};
  }
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google OAuth access token. Please check required permissions.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.warn('Google Sign-in exception:', error);
    const msg = String(error?.message || error?.code || '');
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed before completing. Please try again.');
    } else if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in request was cancelled. Please try again.');
    } else if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by browser. Please allow popups for this site.');
    } else if (
      msg.includes('api-keys-are-not-supported') ||
      msg.includes('api-key-not-valid') ||
      msg.includes('invalid-api-key') ||
      error?.code === 'auth/invalid-api-key' ||
      error?.code === 'auth/api-key-not-valid'
    ) {
      throw new Error(
        'Google Authentication requires a Firebase Web API Key with Identity Toolkit enabled (from Firebase Console). If you have your Firebase Web API key, you can enter it in the top navigation "API Key" -> "Firebase & Auth" tab.'
      );
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
