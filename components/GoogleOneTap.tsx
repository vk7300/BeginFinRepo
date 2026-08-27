import React, { useEffect, useRef } from 'react';
import { auth, GoogleAuthProvider, signInWithCredential, User } from '../firebase';
import firebaseConfigJson from '../firebase-applet-config.json';

interface GoogleOneTapProps {
  user: User | null;
  onSuccess?: (user: User) => void;
  disabled?: boolean;
}

// Module-level flags to track global GSI initialization
let isGsiInitialized = false;
let globalSuccessCallback: ((user: User) => void) | undefined;

export const GoogleOneTap: React.FC<GoogleOneTapProps> = ({
  user,
  onSuccess,
  disabled = false
}) => {
  const isPromptedRef = useRef(false);
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    (firebaseConfigJson as any).oAuthClientId ||
    '910198173440-3veu2i1nuj4fkjp2ki6gam0gdj5kc9tl.apps.googleusercontent.com';

  // Keep global success callback reference updated without triggering re-initialization
  useEffect(() => {
    globalSuccessCallback = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (user || disabled) {
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // ignore
      }
      return;
    }

    let intervalId: any;
    let isCancelled = false;

    const isFedCmAllowedInDocument = (): boolean => {
      try {
        if (window.self === window.top) {
          return true;
        }
        const docAny = document as any;
        if (typeof docAny.permissionsPolicy?.allowsFeature === 'function') {
          return docAny.permissionsPolicy.allowsFeature('identity-credentials-get');
        }
        if (typeof docAny.featurePolicy?.allowsFeature === 'function') {
          return docAny.featurePolicy.allowsFeature('identity-credentials-get');
        }
        return false;
      } catch {
        return false;
      }
    };

    const handleCredentialResponse = async (response: { credential?: string }) => {
      if (!response?.credential) return;
      try {
        const credential = GoogleAuthProvider.credential(response.credential);
        const userCredential = await signInWithCredential(auth, credential);
        if (globalSuccessCallback && userCredential.user) {
          globalSuccessCallback(userCredential.user);
        }
      } catch (error) {
        console.error('Google One Tap credential sign-in error:', error);
      }
    };

    const initAndPromptGsi = () => {
      if (isCancelled) return;
      if (window.google?.accounts?.id && clientId) {
        try {
          // Initialize strictly once per application lifecycle
          if (!isGsiInitialized) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: 'signin',
              itp_support: true,
            });
            isGsiInitialized = true;
          }

          // Prompt once when allowed and not authenticated
          if (!isPromptedRef.current && isFedCmAllowedInDocument()) {
            isPromptedRef.current = true;
            window.google.accounts.id.prompt((notification: any) => {
              if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
                // Handled gracefully
              }
            });
          }
        } catch (err) {
          console.warn('Google One Tap initialization note:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initAndPromptGsi();
    } else {
      intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(intervalId);
          initAndPromptGsi();
        }
      }, 300);
    }

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // ignore
      }
    };
  }, [user, disabled, clientId]);

  // Google's native SDK manages prompt rendering
  return null;
};
