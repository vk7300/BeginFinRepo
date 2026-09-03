import { auth, GoogleAuthProvider, signInWithCredential, signInWithPopup, googleProvider, User } from '../firebase';
import firebaseConfigJson from '../firebase-applet-config.json';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  (firebaseConfigJson as Record<string, string | undefined>).oAuthClientId ||
  '910198173440-3veu2i1nuj4fkjp2ki6gam0gdj5kc9tl.apps.googleusercontent.com';

type AuthSuccessCallback = (user: User) => void;
type AuthErrorCallback = (error: Error) => void;

let globalAuthSuccessCallbacks: Set<AuthSuccessCallback> = new Set();
let isGsiInitialized = false;

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
 * Programmatically trigger Google Sign-In using GIS Token Client or GSI Prompt or fallback
 */
export async function triggerGoogleSignIn(): Promise<User> {
  // 1. Try Google Identity Services OAuth2 Token Client (direct JS callback, no stuck popup!)
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    try {
      const user = await new Promise<User>((resolve, reject) => {
        let isResolved = false;
        
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: async (tokenResponse: any) => {
              if (isResolved) return;
              if (tokenResponse.error) {
                isResolved = true;
                if (tokenResponse.error === 'popup_closed_by_user' || tokenResponse.error === 'access_denied') {
                  const err: any = new Error('Sign-in cancelled.');
                  err.code = 'auth/popup-closed-by-user';
                  reject(err);
                  return;
                }
                reject(new Error(tokenResponse.error_description || tokenResponse.error));
                return;
              }

              if (tokenResponse.access_token) {
                isResolved = true;
                try {
                  const credential = GoogleAuthProvider.credential(null, tokenResponse.access_token);
                  const userCredential = await signInWithCredential(auth, credential);
                  const u = userCredential.user;
                  globalAuthSuccessCallbacks.forEach(cb => {
                    try { cb(u); } catch {}
                  });
                  resolve(u);
                } catch (authErr) {
                  reject(authErr);
                }
              }
            },
            error_callback: (nonOAuthErr: any) => {
              if (isResolved) return;
              isResolved = true;
              reject(new Error(nonOAuthErr?.message || 'Google Sign-In prompt was closed.'));
            }
          });

          client.requestAccessToken({ prompt: 'select_account' });
        } catch (initErr) {
          reject(initErr);
        }
      });

      return user;
    } catch (gsiErr: any) {
      if (gsiErr.code === 'auth/popup-closed-by-user') {
        throw gsiErr;
      }
      console.warn("Google OAuth2 Token Client note:", gsiErr?.message || gsiErr);
    }
  }

  // 2. Fallback to Firebase standard popup
  try {
    const result = await signInWithPopup(auth, googleProvider);
    globalAuthSuccessCallbacks.forEach(cb => {
      try { cb(result.user); } catch {}
    });
    return result.user;
  } catch (popupErr: any) {
    console.error("Firebase signInWithPopup error:", popupErr);
    throw popupErr;
  }
}
