import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Loader2, X } from 'lucide-react';
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
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [agreed, setAgreed] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [consentError, setConsentError] = useState<string>('');

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    firebaseConfigJson.oAuthClientId ||
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
      // Gate sign-in behind 14+ age and Terms/Privacy confirmation
      setPendingCredential(response.credential);
      setAgreed(false);
      setConsentError('');
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

  const handleConfirmConsent = async () => {
    if (!pendingCredential) return;
    if (!agreed) {
      setConsentError('You must confirm you are at least 14 years old and agree to the Terms of Use and Privacy Policy to continue.');
      return;
    }

    setIsSigningIn(true);
    setConsentError('');
    try {
      const credential = GoogleAuthProvider.credential(pendingCredential);
      const userCredential = await signInWithCredential(auth, credential);
      if (globalSuccessCallback && userCredential.user) {
        globalSuccessCallback(userCredential.user);
      }
      setPendingCredential(null);
    } catch (error) {
      console.error('Google One Tap credential sign-in error:', error);
      setConsentError('Sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCancelConsent = () => {
    setPendingCredential(null);
    setAgreed(false);
    setConsentError('');
  };

  if (!pendingCredential) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 text-left">
        <button 
          onClick={handleCancelConsent}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Confirm Age & Agreement
        </h3>
        
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Before completing your sign-in with Google, please confirm you meet the age requirement and accept our platform policies.
        </p>

        {consentError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
            {consentError}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setConsentError('');
              }}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-700 leading-snug">
              I certify that I am at least <strong className="text-slate-900">14 years of age</strong> and agree to BeginFin's{' '}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-700"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Use
              </a>
              {' '}and{' '}
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-700"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>.
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={handleCancelConsent}
            disabled={isSigningIn}
            className="py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleConfirmConsent}
            disabled={!agreed || isSigningIn}
            className="py-3 px-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isSigningIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Agree & Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

