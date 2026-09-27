import React, { useEffect } from 'react';
import { User } from '../firebase';

interface GoogleOneTapProps {
  user: User | null;
  onSuccess?: (user: User) => void;
  disabled?: boolean;
}

/**
 * Google SSO is temporarily disabled.
 * GoogleOneTap cleanly cancels any outstanding prompts and renders nothing.
 */
export const GoogleOneTap: React.FC<GoogleOneTapProps> = () => {
  useEffect(() => {
    try {
      window.google?.accounts?.id?.cancel();
    } catch {
      // ignore
    }
  }, []);

  return null;
};
