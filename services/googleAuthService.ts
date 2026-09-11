import { auth, GoogleAuthProvider, signInWithCredential, signInWithPopup, signInWithRedirect, onAuthStateChanged, googleProvider, User } from '../firebase';
import firebaseConfigJson from '../firebase-applet-config.json';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  (firebaseConfigJson as Record<string, string | undefined>).oAuthClientId ||
  '910198173440-3veu2i1nuj4fkjp2ki6gam0gdj5kc9tl.apps.googleusercontent.com';

type AuthSuccessCallback = (user: User) => void;
type AuthErrorCallback = (error: Error) => void;

let globalAuthSuccessCallbacks: Set<AuthSuccessCallback> = new Set();
let isGsiInitialized = false;
let activeAuthPromise: Promise<User> | null = null;

export function registerGlobalGoogleAuthSuccess(callback: AuthSuccessCallback): () => void {
  globalAuthSuccessCallbacks.add(callback);
  return () => {
    globalAuthSuccessCallbacks.delete(callback);
  };
}

/**
 * Handle credential returned by Google Identity Services
 */
export async function handleGsiCredential(credentialJwt: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(credentialJwt);
  const userCredential = await signInWithCredential(auth, credential);
  const user = userCredential.user;
  
  globalAuthSuccessCallbacks.forEach(cb => {
    try {
      cb(user);
    } catch (e) {
      console.warn("Auth callback error:", e);
    }
  });

  return user;
}

/**
 * Initialize Google Identity Services (GSI)
 */
export function initGoogleIdentityServices(onCredentialReceived?: (credential: string) => void) {
  if (typeof window === 'undefined' || !window.google?.accounts?.id) {
    return false;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential?: string }) => {
        if (!response?.credential) return;
        if (onCredentialReceived) {
          onCredentialReceived(response.credential);
        } else {
          await handleGsiCredential(response.credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      itp_support: true,
    });
    isGsiInitialized = true;
    return true;
  } catch (err) {
    console.warn("Failed to initialize Google Identity Services:", err);
    return false;
  }
}

/**
 * Render the official Google Sign-In button into a DOM container
 */
export function renderGoogleButton(
  container: HTMLElement,
  options: {
    width?: number;
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  } = {}
): boolean {
  if (typeof window === 'undefined' || !window.google?.accounts?.id) {
    return false;
  }

  try {
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: options.theme || 'outline',
      size: options.size || 'large',
      text: options.text || 'continue_with',
      shape: options.shape || 'pill',
      logo_alignment: 'left',
      width: options.width || 340,
    });
    return true;
  } catch (err) {
    console.warn("Error rendering Google button:", err);
    return false;
  }
}

/**
 * Check if the current device is touch or mobile
 */
export function isTouchOrMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const isTouchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const uaMatches = /iPhone|iPad|iPod|Android|Mobile|Tablet|Silk|Kindle/i.test(navigator.userAgent);
  return isTouchMac || uaMatches;
}

/**
 * Helper to authenticate using Google Identity Services (GIS) Token Client.
 * Bypasses third-party cookie restrictions and Firebase auth popup helpers.
 */
async function authenticateViaGisTokenClient(): Promise<User> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      return reject(new Error('Google Identity Services oauth2 client is not loaded.'));
    }

    let isFinished = false;
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (isFinished) return;
          if (tokenResponse?.error) {
            isFinished = true;
            if (tokenResponse.error === 'popup_closed_by_user' || tokenResponse.error === 'access_denied') {
              const err: any = new Error('Google Sign-In window was closed.');
              err.code = 'auth/popup-closed-by-user';
              return reject(err);
            }
            return reject(new Error(tokenResponse.error_description || tokenResponse.error));
          }
          if (tokenResponse?.access_token) {
            isFinished = true;
            try {
              const credential = GoogleAuthProvider.credential(null, tokenResponse.access_token);
              const userCredential = await signInWithCredential(auth, credential);
              resolve(userCredential.user);
            } catch (credErr) {
              reject(credErr);
            }
          } else {
            isFinished = true;
            reject(new Error('No access token received from Google authorization.'));
          }
        },
        error_callback: (err: any) => {
          if (isFinished) return;
          isFinished = true;
          const errorObj: any = new Error(err?.message || 'Google authorization prompt was closed.');
          errorObj.code = 'auth/popup-closed-by-user';
          reject(errorObj);
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Programmatically trigger Google Sign-In with device-optimized routing:
 * - Mutex-protected: prevents duplicate concurrent requests or rapid double-clicks from throwing auth/cancelled-popup-request.
 * - Checks authStateReady to guarantee Firebase internal auth worker is ready.
 * - Primary path: Firebase signInWithPopup with fresh GoogleAuthProvider.
 * - Robust Fallback 1: Google Identity Services (GIS) Token Client (bypasses popup blockers and 3rd-party cookie issues).
 * - Robust Fallback 2: signInWithRedirect for top-level browser windows when popups are completely restricted.
 * - Instant real-time resolution via onAuthStateChanged listener.
 */
export async function triggerGoogleSignIn(): Promise<User> {
  // If an authentication request is already in progress, return the existing active Promise
  if (activeAuthPromise) {
    return activeAuthPromise;
  }

  // Ensure Firebase Auth persistence & worker state is ready
  try {
    if (typeof (auth as any).authStateReady === 'function') {
      await (auth as any).authStateReady();
    }
  } catch {
    // Continue if authStateReady is unavailable
  }

  // If already signed in, return current user immediately
  if (auth.currentUser) {
    globalAuthSuccessCallbacks.forEach(cb => {
      try { cb(auth.currentUser!); } catch {}
    });
    return auth.currentUser;
  }

  // Cancel any lingering GSI One-Tap prompts to prevent concurrent window conflicts
  try {
    (window as any).google?.accounts?.id?.cancel();
  } catch {
    // ignore
  }

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  activeAuthPromise = new Promise<User>(async (resolve, reject) => {
    let isSettled = false;

    const cleanup = () => {
      clearTimeout(safetyTimeout);
      unsubAuth();
      activeAuthPromise = null;
    };

    const finalizeSuccess = (user: User) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      globalAuthSuccessCallbacks.forEach(cb => {
        try { cb(user); } catch {}
      });
      resolve(user);
    };

    const finalizeError = (err: any) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(err);
    };

    // 1. Listen for auth state change in real time (triggers immediately when popup/redirect completes)
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        finalizeSuccess(user);
      }
    });

    // 2. 45-second overall safety timeout (accommodates mobile account selection & 2FA)
    const safetyTimeout = setTimeout(() => {
      if (!isSettled) {
        if (auth.currentUser) {
          finalizeSuccess(auth.currentUser);
        } else {
          const timeoutErr: any = new Error('Sign-in timed out. Please try again or use email sign-in.');
          timeoutErr.code = 'auth/popup-timeout';
          finalizeError(timeoutErr);
        }
      }
    }, 45000);

    // Create a fresh GoogleAuthProvider instance to avoid stale scopes or mutated params
    const freshProvider = new GoogleAuthProvider();
    freshProvider.setCustomParameters({ prompt: 'select_account' });
    freshProvider.addScope('email');
    freshProvider.addScope('profile');

    // 3. Initiate Firebase signInWithPopup
    try {
      const result = await signInWithPopup(auth, freshProvider);
      if (result?.user) {
        finalizeSuccess(result.user);
        return;
      }
    } catch (popupErr: any) {
      if (isSettled) return;

      // User intentionally closed the popup
      if (popupErr?.code === 'auth/popup-closed-by-user') {
        finalizeError(popupErr);
        return;
      }

      // Check if user actually signed in despite popup error (common on mobile WebKit)
      if (auth.currentUser) {
        finalizeSuccess(auth.currentUser);
        return;
      }

      console.warn("Firebase popup sign-in note, evaluating fallbacks:", popupErr?.code || popupErr?.message);

      // 4. Fallback 1: Attempt Google Identity Services (GIS) Token Client
      // This is especially powerful when 3rd-party cookies are blocked or in iframe environments
      try {
        const gisUser = await authenticateViaGisTokenClient();
        if (gisUser) {
          finalizeSuccess(gisUser);
          return;
        }
      } catch (gisErr: any) {
        if (isSettled) return;
        if (gisErr?.code === 'auth/popup-closed-by-user') {
          finalizeError(gisErr);
          return;
        }
        console.warn("GIS token client note:", gisErr?.message || gisErr);
      }

      // 5. Fallback 2: Attempt signInWithRedirect if not in an iframe
      if (!isIframe && (
        popupErr?.code === 'auth/popup-blocked' ||
        popupErr?.code === 'auth/cancelled-popup-request' ||
        popupErr?.code === 'auth/network-request-failed' ||
        String(popupErr?.message || '').toLowerCase().includes('popup')
      )) {
        try {
          await signInWithRedirect(auth, freshProvider);
          // Browser is navigating away, keep promise open
          return;
        } catch (redirectErr) {
          finalizeError(redirectErr);
          return;
        }
      }

      finalizeError(popupErr);
    }
  });

  return activeAuthPromise;
}
