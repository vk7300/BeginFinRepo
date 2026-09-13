
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal } from './components/Modal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Dashboard } from './components/Dashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { QuickStartGuide } from './components/QuickStartGuide';
import { ModuleView } from './components/ModuleView';
import { TaxRoadmap } from './components/TaxRoadmap';
import { CertificateView } from './components/CertificateView';
import { CurriculumView } from './components/CurriculumView';
import { modules, Module } from './data/courseData';
import { Language, uiTranslations } from './data/uiTranslations';
import { LogOut, User as UserIcon, BookOpen, AlertTriangle, Users, Zap, X, Loader2, Bell, Trophy, CheckCircle2, Settings, Phone, Repeat, Menu, Home, Sparkles, ExternalLink } from 'lucide-react';
import { auth, db, googleProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, collection, query, where, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, doc, setDoc, onSnapshot } from './firebase';
import { sendEmailVerification, GoogleAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsModal } from './components/SettingsModal';
import { VerificationNotice } from './components/VerificationNotice';
import { NotFound } from './components/NotFound';
import { HelmetProvider } from 'react-helmet-async';
import { TermsOfUse } from './components/TermsOfUse';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CrudQmsView } from './components/CrudQmsView';
import { BeginFinAdminView } from './components/BeginFinAdminView';
import { ResourcesView } from './components/ResourcesView';
import { AboutView } from './components/AboutView';
import { McpServerView } from './components/McpServerView';
import { ToolsView } from './components/ToolsView';
import { APUnitView } from './components/APUnitView';
import { APTopicView } from './components/APTopicView';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { GoogleOneTap } from './components/GoogleOneTap';
import { StatusView } from './components/StatusView';
import { ModeSelectionView } from './components/ModeSelectionView';
import { triggerGoogleSignIn } from './services/googleAuthService';

const orderedModules = [
  modules.find(m => m.id === 'm1'),
  modules.find(m => m.id === 'm2'),
  modules.find(m => m.id === 'm4'),
  modules.find(m => m.id === 'm5'),
  modules.find(m => m.id === 'm6'),
  modules.find(m => m.id === 'm3'),
  modules.find(m => m.id === 'm7'),
  modules.find(m => m.id === 'm8'),
  modules.find(m => m.id === 'm9')
].filter((m): m is Module => !!m);

export type View = 'welcome' | 'dashboard' | 'module' | 'certificate' | 'tax-roadmap' | 'onboarding' | 'guide' | 'terms' | 'privacy' | 'not-found' | 'curriculum' | 'crud-qms' | 'admin' | 'resources' | 'about' | 'mcp' | 'teacher-mcp' | 'bradley-mcp' | 'tools' | 'status' | 'ap-unit' | 'ap-topic';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let message = "An unexpected error occurred.";
      if (this.state.error) {
        try {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) message = `Firebase Error: ${parsed.error}`;
        } catch (e) {
          message = this.state.error.message || message;
        }
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ConfirmModal: React.FC<{ onCancel: () => void; onConfirm: () => void }> = ({ onCancel, onConfirm }) => {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
      </div>
      <p className="text-slate-500 font-medium mb-8">
        Returning to the home screen will reset your current session. Unsaved progress will be lost. Are you sure?
      </p>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onCancel}
          className="py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

const LoginModalContent: React.FC<{ 
  onClose: () => void; 
  onGoogleLogin: (agreedToTerms: boolean) => Promise<void>;
  onEmailAuth: (email: string, pass: string, isSignUp: boolean, agreedToTerms: boolean) => Promise<void>;
}> = ({ onClose, onGoogleLogin, onEmailAuth }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'input' | 'verify'>('input');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const mapAuthError = (error: any) => {
    const code = error.code || error.message || '';
    if (code.includes('auth/unauthorized-domain')) {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain "${host}" is not authorized in Firebase Authentication. Please add "${host}" to Firebase Console > Authentication > Settings > Authorized domains.`;
    }
    if (code.includes('auth/popup-blocked')) {
      return "Pop-up was blocked by your browser. Please allow pop-ups for this site.";
    }
    if (code.includes('auth/popup-timeout')) {
      return "Google Sign-In window took too long. Please try again or sign in with email.";
    }
    if (code.includes('auth/cancelled-popup-request')) {
      return "Another sign-in window is already active. Please finish or close that window.";
    }
    if (code.includes('auth/operation-not-allowed')) {
      return "Google Sign-In is not enabled in Firebase Console. Please enable Google under Authentication > Sign-in method.";
    }
    if (code.includes('reCAPTCHA has already been rendered') || code.includes('auth/reCAPTCHA-has-already-been-rendered')) {
      return "Security check is ready. Please try clicking the button again.";
    }
    if (code.includes('auth/invalid-phone-number')) {
      return "The phone number you entered is invalid. Please use the format +1234567890.";
    }
    if (code.includes('auth/too-many-requests')) {
      return "Too many attempts. Please wait a few minutes and try again.";
    }
    if (code.includes('auth/user-not-found') || code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (code.includes('auth/email-already-in-use')) {
      return "An account with this email already exists. Try signing in instead.";
    }
    if (code.includes('auth/weak-password')) {
      return "Your password is too weak. Please use at least 6 characters.";
    }
    if (code.includes('auth/network-request-failed')) {
      return "Network error. Please check your internet connection.";
    }
    if (code.includes('auth/popup-closed-by-user')) {
      return "Sign-in window was closed. Please try again.";
    }
    return error.message || "An unexpected error occurred. Please try again.";
  };

  const formatPhoneNumber = (input: string) => {
    let cleaned = input.replace(/[\s-()]/g, '');
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    } else if (!cleaned.startsWith('+')) {
      // If it's 10 digits, assume US/Canada and add +1
      if (cleaned.length === 10) {
        cleaned = '+1' + cleaned;
      } else if (cleaned.length > 0) {
        cleaned = '+' + cleaned;
      }
    }
    return cleaned;
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!emailOrPhone.includes('@')) {
      setError("Please enter your email address first");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { sendPasswordResetEmail } = await import('./firebase');
      await sendPasswordResetEmail(auth, emailOrPhone);
      setResetSent(true);
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (!agreedToTerms) {
      setError("Please confirm you are at least 14 years old and agree to the Terms of Use and Privacy Policy to continue.");
      return;
    }
    setError('');
    setIsGoogleLoading(true);
    try {
      await onGoogleLogin(agreedToTerms);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(mapAuthError(err));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAuthSubmit = async (isSignUpChoice: boolean, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSignUpChoice && !agreedToTerms) {
      setError("Please confirm you are at least 14 years old and agree to the Terms of Use and Privacy Policy to create an account.");
      return;
    }
    setError('');
    setIsLoading(true);

    const isEmail = emailOrPhone.includes('@');
    const cleanedPhone = formatPhoneNumber(emailOrPhone);
    const isPhone = /^\+[1-9]\d{1,14}$/.test(cleanedPhone);

    try {
      if (isEmail) {
        if (!emailOrPhone || !password) {
          throw new Error("Please enter both your email address and password.");
        }
        await onEmailAuth(emailOrPhone, password, isSignUpChoice, agreedToTerms);
        onClose();
      } else if (isPhone) {
        if (!cleanedPhone.startsWith('+1')) {
          throw new Error("Phone verification is currently only available for US/Canada (+1) numbers.");
        }
        setupRecaptcha();
        const appVerifier = (window as any).recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, cleanedPhone, appVerifier);
        setConfirmationResult(result);
        setAuthMethod('verify');
      } else {
        throw new Error("Please enter a valid email or phone number (e.g., +1234567890)");
      }
    } catch (err: any) {
      setError(mapAuthError(err));
      if ((window as any).recaptchaVerifier && !err.message?.includes('reCAPTCHA')) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!confirmationResult) throw new Error("No confirmation result");
      await confirmationResult.confirm(verificationCode);
      onClose();
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-sm mx-auto px-2 py-4">
      <div id="recaptcha-container"></div>
      
      <div className="text-center mb-6">
        <h3 className="text-3xl font-normal text-slate-900 tracking-tight mb-2">
          Welcome to <span className="font-medium text-indigo-600">BeginFin</span>
        </h3>
        <p className="text-slate-500 font-medium text-sm">
          Sign in to track your progress and earn your certificate
        </p>
      </div>

      {/* Age & Consent Checkbox */}
      <div className="p-3.5 mb-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
        <label className="flex items-start gap-2.5 cursor-pointer select-none group">
          <input 
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) setError('');
            }}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer shrink-0"
          />
          <span className="text-[12px] text-slate-600 leading-snug">
            I certify that I am at least <strong className="text-slate-900">14 years old</strong> and agree to BeginFin's{' '}
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

      {/* Google SSO on Top */}
      <button 
        type="button"
        onClick={handleGoogleClick}
        disabled={isGoogleLoading || isLoading}
        className="w-full py-4 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-slate-800 hover:border-[#7F7FFA] hover:bg-slate-50 hover:shadow-md transition-all flex items-center justify-center gap-3 shadow-xs active:scale-[0.98] text-base mb-6 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#7F7FFA]" />
        ) : (
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 transition-transform group-hover:scale-110" alt="Google" referrerPolicy="no-referrer" />
        )}
        <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      <div className="relative py-1 mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
        <div className="relative flex justify-center">
          <span className="text-[10px] font-bold text-slate-400 bg-white px-4 uppercase tracking-[0.2em]">
            Or continue with Email
          </span>
        </div>
      </div>

      {resetSent && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-medium"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Password reset link sent to your email!
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-sm font-medium"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1 text-xs leading-relaxed">{error}</div>
        </motion.div>
      )}

      {authMethod === 'input' ? (
        <form onSubmit={(e) => handleAuthSubmit(true, e)} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Email or phone number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-medium text-slate-900 text-base placeholder:text-slate-400 shadow-sm"
              />
              <p className="mt-1.5 text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-wider">
                Phone login: US/Canada (+1) only
              </p>
            </div>
            
            {emailOrPhone.includes('@') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative group"
              >
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-medium text-slate-900 text-base placeholder:text-slate-400 shadow-sm"
                />
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="button"
              onClick={(e) => handleAuthSubmit(true, e)}
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] text-base"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create an Account'}
            </button>
            <button 
              type="button"
              onClick={(e) => handleAuthSubmit(false, e)}
              disabled={isLoading}
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-[1.5rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-base"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
          </div>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-slate-500 font-medium text-sm underline underline-offset-4 decoration-slate-200 hover:text-indigo-600 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 ml-2">Verification Code</label>
            <div className="relative">
              <input 
                type="text" 
                maxLength={6}
                placeholder="0 0 0 0 0 0"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full px-6 py-5 bg-slate-50/50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-mono font-black text-slate-900 text-3xl text-center tracking-[0.5em] placeholder:text-slate-300 shadow-sm"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] text-lg"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
          </button>
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => {
                setAuthMethod('input');
                setVerificationCode('');
              }}
              className="text-slate-500 font-medium text-sm hover:text-slate-700 transition-colors"
            >
              Back to login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const SwitchRoleModalContent: React.FC<{ 
  onClose: () => void; 
  onConfirm: (role: 'student' | 'teacher') => void;
  currentRole: 'student' | 'teacher' | null;
}> = ({ onClose, onConfirm, currentRole }) => {
  return (
    <div className="py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {/* Student Mode Card */}
        <button
          type="button"
          onClick={() => onConfirm('student')}
          className={`group bg-white border rounded-2xl p-5 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7F7FFA]/40 active:scale-[0.99] ${
            currentRole === 'student'
              ? 'border-[#7F7FFA] ring-1 ring-[#7F7FFA] shadow-md bg-indigo-50/20'
              : 'border-slate-200/90 hover:border-[#7F7FFA] hover:shadow-md'
          }`}
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-[#EEF0FD] border border-[#E0E4FB] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-[#5358D4] stroke-[1.8]" />
            </div>
            <h4 className="text-base font-bold text-[#1E2022] mb-0.5">Student Mode</h4>
            <p className="text-slate-500 text-xs leading-relaxed">Learn at your own pace.</p>
          </div>
          {currentRole === 'student' && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-[#7F7FFA] uppercase tracking-wider">
              <span>Current</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7F7FFA]" />
            </div>
          )}
        </button>

        {/* Teacher Mode Card */}
        <button
          type="button"
          onClick={() => onConfirm('teacher')}
          className={`group bg-white border rounded-2xl p-5 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 active:scale-[0.99] ${
            currentRole === 'teacher'
              ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-md bg-emerald-50/20'
              : 'border-slate-200/90 hover:border-emerald-500 hover:shadow-md'
          }`}
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-[#E8F8F0] border border-[#D1F2E3] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-[#10B981] stroke-[1.8]" />
            </div>
            <h4 className="text-base font-bold text-[#1E2022] mb-0.5">Teacher Mode</h4>
            <p className="text-slate-500 text-xs leading-relaxed">Teach your way</p>
          </div>
          {currentRole === 'teacher' && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              <span>Current</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          )}
        </button>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(() => {
    try {
      return (localStorage.getItem('beginfin-user-role') as 'student' | 'teacher' | null) || null;
    } catch {
      return null;
    }
  });
  const [classId, setClassId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isFullScreenLockEnabled, setIsFullScreenLockEnabled] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('beginfin-username') || '';
    } catch(e) {
      return '';
    }
  });
  const [currentView, setCurrentView] = useState<View>('welcome');
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem('beginfin-lang') as Language) || 'en';
    } catch(e) {
      return 'en';
    }
  });
  const [showConfirmHome, setShowConfirmHome] = useState(false);
  const [showTaxWarning, setShowTaxWarning] = useState(false);
  const [pendingModule, setPendingModule] = useState<Module | null>(null);
  const [isTeacherInStudentMode, setIsTeacherInStudentMode] = useState(false);
  const [moduleStep, setModuleStep] = useState<'content' | 'quiz'>('content');
  const [isPseudoLoading, setIsPseudoLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparing your journey...");
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMobileDashboardNav, setShowMobileDashboardNav] = useState(false);
  const userAgreedConsentRef = useRef(false);
  const [selectedApTopic, setSelectedApTopic] = useState<string>('1.1');
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardView = ['dashboard', 'module', 'certificate', 'tax-roadmap', 'onboarding'].includes(currentView);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/termsofuse') {
      setCurrentView('terms');
    } else if (path === '/privacypolicy' || path === '/privacynotice') {
      setCurrentView('privacy');
      if (path === '/privacynotice') {
        navigate('/privacypolicy', { replace: true });
      }
    } else if (path === '/curriculum') {
      setCurrentView('curriculum');
    } else if (path === '/resources') {
      setCurrentView('resources');
    } else if (path === '/about') {
      setCurrentView('about');
    } else if (path === '/tools/beginfinsguidetoapbusinesswithpf' || path.startsWith('/tools/beginfinsguidetoapbusinesswithpf/')) {
      const topicSub = path.replace('/tools/beginfinsguidetoapbusinesswithpf', '').replace(/^\//, '');
      if (topicSub) {
        const formattedTopic = topicSub.replace('-', '.');
        setSelectedApTopic(formattedTopic || '1.1');
        setCurrentView('ap-topic');
      } else {
        setCurrentView('ap-unit');
      }
    } else if (path === '/tools' || path.startsWith('/tools/') || path === '/simulator' || path === '/simulators') {
      setCurrentView('tools');
    } else if (
      path === '/mcp' || 
      path.startsWith('/mcp/') || 
      path === '/teacher/mcp' || 
      path.startsWith('/teacher/mcp') || 
      path === '/bradley/mcp' || 
      path.startsWith('/bradley/mcp') || 
      path === '/bradley' || 
      path.startsWith('/bradley/') || 
      path === '/mcp.json' || 
      path === '/beginfin-mcp'
    ) {
      setCurrentView('mcp');
    } else if (path === '/guide' || path.startsWith('/guide') || path === '/quickstart') {
      setCurrentView('guide');
    } else if (path === '/beginfin-admins' || path.startsWith('/beginfin-admins')) {
      setCurrentView('admin');
    } else if (path === '/status' || path.startsWith('/status')) {
      setCurrentView('status');
    } else if (path === '/crud-qms' || path.startsWith('/crud-qms')) {
      navigate('/beginfin-admins', { replace: true });
      setCurrentView('admin');
    } else if (path === '/onboarding' || path === '/mode' || path === '/choose-mode' || path === '/select-mode') {
      setCurrentView('onboarding');
    } else if (path === '/teacher' || path === '/teachers' || path === '/teacher-portal') {
      if (user) {
        setUserRole('teacher');
        setIsTeacherInStudentMode(false);
        try { localStorage.setItem('beginfin-user-role', 'teacher'); } catch(e) {}
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    } else if (path === '/') {
      setHasStarted(false);
      setCurrentView('welcome');
    } else if (path === '/app' || path.startsWith('/app/')) {
      setHasStarted(true);
      if (currentView === 'welcome' || currentView === 'not-found' || currentView === 'terms' || currentView === 'privacy' || currentView === 'curriculum' || currentView === 'crud-qms' || currentView === 'admin' || currentView === 'guide' || currentView === 'resources' || currentView === 'tools' || currentView === 'status' || currentView === 'mcp' || currentView === 'teacher-mcp' || currentView === 'bradley-mcp') {
        if (user) {
          if (!userRole) {
            setCurrentView('onboarding');
          } else {
            setCurrentView('dashboard');
          }
        } else {
          setCurrentView('dashboard');
        }
      }
    } else {
      setCurrentView('not-found');
    }
  }, [location.pathname, user, userRole]);
  
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('beginfin-progress');
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  });
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const needsVerification = user && 
    user.providerData.some(p => p.providerId === 'password') && 
    !user.emailVerified;

  const t = uiTranslations[language];

  // Dynamically update the browser tab title according to the current section
  useEffect(() => {
    let sectionTitle = 'Home';

    switch (currentView) {
      case 'welcome':
        sectionTitle = 'Home';
        break;
      case 'dashboard':
        sectionTitle = userRole === 'teacher' && !isTeacherInStudentMode ? 'Teacher Dashboard' : 'Dashboard';
        break;
      case 'module':
        if (activeModule) {
          const modTitle = (activeModule.translations as any)[language]?.title || activeModule.translations.en.title;
          sectionTitle = moduleStep === 'quiz' ? `Quiz: ${modTitle}` : modTitle;
        } else {
          sectionTitle = 'Module';
        }
        break;
      case 'about':
        sectionTitle = 'About';
        break;
      case 'tools':
        sectionTitle = 'Tools';
        break;
      case 'status':
        sectionTitle = 'Status';
        break;
      case 'curriculum':
        sectionTitle = 'Curriculum';
        break;
      case 'resources':
        sectionTitle = 'Resources';
        break;
      case 'tax-roadmap':
        sectionTitle = 'Tax Roadmap';
        break;
      case 'certificate':
        sectionTitle = 'Certificate';
        break;
      case 'crud-qms':
      case 'admin':
        sectionTitle = 'Admin Portal · BeginFin';
        break;
      case 'mcp':
      case 'teacher-mcp':
      case 'bradley-mcp':
        sectionTitle = 'MCP Server';
        break;
      case 'ap-unit':
        sectionTitle = 'Unit 1 Review · AP® Business with Personal Finance';
        break;
      case 'ap-topic':
        sectionTitle = `Topic ${selectedApTopic} · AP® Business with Personal Finance`;
        break;
      case 'guide':
        sectionTitle = 'Quick Start Guide';
        break;
      case 'onboarding':
        sectionTitle = 'Choose Mode';
        break;
      case 'terms':
        sectionTitle = 'Terms of Service';
        break;
      case 'privacy':
        sectionTitle = 'Privacy Policy';
        break;
      case 'not-found':
        sectionTitle = 'Page Not Found';
        break;
      default:
        sectionTitle = 'Home';
    }

    document.title = `${sectionTitle} | BeginFin`;
  }, [currentView, activeModule, moduleStep, language, userRole, isTeacherInStudentMode]);

  // Auth Listener and Redirect Handler
  useEffect(() => {
    // Process any incoming redirect authentication (e.g., from signInWithRedirect fallback or Classroom link)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // If it was a Google Classroom connection, extract access token
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            import('./services/googleClassroomService').then(({ googleClassroomService }) => {
              googleClassroomService.setAccessToken(credential.accessToken);
            });
          }
          setShowLoginModal(false);
          setHasStarted(true);
          if (currentView === 'welcome') {
            handleStart(true);
          }
        }
      })
      .catch((error) => {
        console.warn("Google redirect sign-in result check:", error?.message || error);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        setUserName(currentUser.displayName || '');
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore
  useEffect(() => {
    // Suppress unnecessary Vite HMR WebSocket errors
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason;
      if (reason && typeof reason === 'string' && (
        reason.includes('WebSocket') || 
        reason.includes('closed without opened') ||
        reason.includes('failed to connect to websocket') ||
        reason.includes('connection was closed')
      )) {
        event.preventDefault();
        // Silent suppression for production-like feel in dev
      }
    };
    
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || '';
      if (msg.includes('WebSocket') || msg.includes('closed without opened') || msg.includes('vite')) {
        event.preventDefault();
        return;
      }
    };
    
    // Also override console.error for these specific benign strings
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const msg = args.join(' ');
      if (msg.includes('WebSocket') || msg.includes('closed without opened') || msg.includes('failed to connect to websocket')) {
        return; 
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const msg = args.join(' ');
      if (msg.includes('WebSocket') || msg.includes('hmr')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleError);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);


  useEffect(() => {
    if (!isAuthReady || !user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        let loadedModules = data.completedModules || [];
        
        // Save guest progress on log in
        const guestProgressRaw = localStorage.getItem('beginfin-progress');
        if (guestProgressRaw) {
          try {
            const guestModules: string[] = JSON.parse(guestProgressRaw);
            if (Array.isArray(guestModules) && guestModules.length > 0) {
              const previousLength = loadedModules.length;
              loadedModules = Array.from(new Set([...loadedModules, ...guestModules]));
              
              if (loadedModules.length > previousLength) {
                // Save to Firestore and update state
                setDoc(userDocRef, {
                  completedModules: loadedModules,
                  lastUpdated: new Date().toISOString()
                }, { merge: true }).then(() => {
                  try { localStorage.removeItem('beginfin-progress') } catch(e) {};
                }).catch((e) => {
                  console.error("Error saving guest progress to firebase:", e);
                });
              } else {
                try { localStorage.removeItem('beginfin-progress') } catch(e) {};
              }
            } else {
              try { localStorage.removeItem('beginfin-progress') } catch(e) {};
            }
          } catch (e) {
            console.error("Error parsing guest progress list:", e);
          }
        }

        setCompletedModules(loadedModules);
        setUserRole(data.role || null);
        try {
          if (data.role) {
            localStorage.setItem('beginfin-user-role', data.role);
          } else {
            localStorage.removeItem('beginfin-user-role');
          }
        } catch(e) {}
        setClassId(data.classId || null);
        setTeacherId(data.teacherId || null);
        if (data.displayName) {
          setUserName(data.displayName);
        }
        
        if (!data.role && currentView !== 'onboarding' && location.pathname.startsWith('/app')) {
          setCurrentView('onboarding');
        }
      } else {
        // Initialize user in Firestore if not exists
        // We'll check guest local progress too
        const guestProgressRaw = localStorage.getItem('beginfin-progress');
        let initialModules: string[] = [];
        if (guestProgressRaw) {
          try {
            initialModules = JSON.parse(guestProgressRaw) || [];
          } catch(e) {}
        }
        
        // Create user doc with actual user consent
        const consentGranted = userAgreedConsentRef.current;
        setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          completedModules: initialModules,
          role: 'student', // Default to student
          agreedToTerms: consentGranted,
          agreedToTermsAt: consentGranted ? new Date().toISOString() : null,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).then(() => {
          try { localStorage.removeItem('beginfin-progress') } catch(e) {};
        }).catch(err => {
          console.error("Error initializing user doc with guest progress:", err);
        });

        setCompletedModules(initialModules);
        setUserRole('student');
        if (location.pathname.startsWith('/app')) {
          setCurrentView('dashboard');
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    return () => unsubscribe();
  }, [isAuthReady, user]);

  // Listen for class document changes to get fullScreenLock setting
  useEffect(() => {
    if (!classId) {
        setIsFullScreenLockEnabled(false);
        return;
    }
    const classDocRef = doc(db, 'classes', classId);
    const unsubscribe = onSnapshot(classDocRef, (snapshot) => {
        if (snapshot.exists()) {
            setIsFullScreenLockEnabled(snapshot.data().isFullScreenLockEnabled || false);
        }
    });
    return () => unsubscribe();
  }, [classId]);

  // Listen for all alerts for teacher's classes
  useEffect(() => {
    if (!user || userRole !== 'teacher') {
      setAllAlerts([]);
      return;
    }

    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('teacherId', '==', user.uid));
    
    // Use a ref to track inner unsubscribes to clean them up properly
    const innerUnsubscribes = new Map<string, () => void>();

    const unsubscribeClasses = onSnapshot(q, (snapshot) => {
      const classIds = snapshot.docs.map(doc => doc.id);
      
      // Remove unsubscribes for classes that are no longer there
      for (const [cid, unsub] of innerUnsubscribes.entries()) {
        if (!classIds.includes(cid)) {
          unsub();
          innerUnsubscribes.delete(cid);
          setAllAlerts(prev => prev.filter(a => a.classId !== cid));
        }
      }

      // Add new listeners for new classes
      snapshot.docs.forEach(classDoc => {
        const cid = classDoc.id;
        const className = classDoc.data().className;

        if (!innerUnsubscribes.has(cid)) {
          const alertsRef = collection(db, 'classes', cid, 'alerts');
          const unsub = onSnapshot(alertsRef, (alertSnap) => {
            const classAlerts = alertSnap.docs.map(doc => ({ 
              id: doc.id, 
              classId: cid,
              className: className,
              ...doc.data() 
            }));
            
            setAllAlerts(prev => {
              const otherAlerts = prev.filter(a => a.classId !== cid);
              return [...otherAlerts, ...classAlerts].sort((a, b) => {
                const t1 = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
                const t2 = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
                return t2.getTime() - t1.getTime();
              });
            });
          });
          innerUnsubscribes.set(cid, unsub);
        }
      });
    });

    return () => {
      unsubscribeClasses();
      innerUnsubscribes.forEach(unsub => unsub());
    };
  }, [user, userRole]);

  // Local Storage Fallback
  useEffect(() => {
    if (!user) {
      localStorage.setItem('beginfin-progress', JSON.stringify(completedModules));
      localStorage.setItem('beginfin-username', userName);
    }
    localStorage.setItem('beginfin-lang', language);
  }, [completedModules, userName, language, user]);

  const triggerPseudoLoading = (message: string, duration: number = 3000) => {
    // No-op to avoid artificial delay and proceed directly to the site
  };

  const handleLogin = async () => {
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async (agreed?: boolean) => {
    if (typeof agreed === 'boolean') {
      userAgreedConsentRef.current = agreed;
    }
    // 1. Cancel any active Google One Tap prompt to prevent concurrent GIS collisions
    try {
      window.google?.accounts?.id?.cancel();
    } catch {
      // ignore
    }

    try {
      await triggerGoogleSignIn();
      setShowLoginModal(false);
      if (currentView === 'welcome') {
        handleStart(true);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      console.warn("Google sign-in error note:", error?.message || error);

      // If popup was blocked or interrupted, attempt redirect fallback IF top-level window
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (!isIframe && (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/network-request-failed'
      )) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error("Redirect fallback error:", redirectErr);
          throw redirectErr;
        }
      }

      // Rethrow to surface to LoginModalContent UI
      throw error;
    }
  };

  const handleEmailAuth = async (email: string, pass: string, isSignUp: boolean, agreed?: boolean) => {
    if (typeof agreed === 'boolean') {
      userAgreedConsentRef.current = agreed;
    }
    try {
      if (isSignUp) {
        // User clicked "Create an Account"
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          await sendEmailVerification(userCredential.user);
          triggerPseudoLoading("Creating your account & sending verification email...");
        } catch (error: any) {
          const code = error.code || error.message || '';
          if (code.includes('auth/email-already-in-use')) {
            // Existing user clicked create account -> log them in as usual
            try {
              await signInWithEmailAndPassword(auth, email, pass);
              triggerPseudoLoading("Account exists — signing you in...");
            } catch (signInErr: any) {
              const signInCode = signInErr.code || signInErr.message || '';
              if (signInCode.includes('wrong-password') || signInCode.includes('invalid-credential')) {
                throw new Error("An account with this email already exists, but the password entered was incorrect.");
              }
              throw signInErr;
            }
          } else {
            throw error;
          }
        }
      } else {
        // User clicked "Log In"
        try {
          await signInWithEmailAndPassword(auth, email, pass);
          triggerPseudoLoading("Signing you in...");
        } catch (error: any) {
          const code = error.code || error.message || '';
          if (code.includes('auth/user-not-found') || code.includes('auth/invalid-credential')) {
            throw new Error("You do not have an account yet. Please click 'Create an Account' above to sign up.");
          }
          throw error;
        }
      }
      setShowLoginModal(false);
      if (currentView === 'welcome') {
        handleStart(true);
      }
    } catch (error: any) {
      console.error("Email auth failed", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCompletedModules([]);
      setUserName('');
      setUserRole(null);
      try {
        localStorage.removeItem('beginfin-user-role');
      } catch(e) {}
      setClassId(null);
      setHasStarted(false);
      setCurrentView('welcome');
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSwitchRole = async (targetRole?: 'student' | 'teacher') => {
    const nextRole = targetRole || (userRole === 'student' ? 'teacher' : 'student');
    if (userRole === nextRole && userRole !== null) {
      setShowSwitchRoleModal(false);
      return;
    }
    
    triggerPseudoLoading(`Switching to ${nextRole === 'teacher' ? 'Teacher' : 'Student'} Mode...`, 2000);
    
    try {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          role: nextRole,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } else {
        localStorage.setItem('beginfin-guest-role', nextRole);
      }
      
      setUserRole(nextRole);
      try {
        localStorage.setItem('beginfin-user-role', nextRole);
      } catch(e) {}
      if (nextRole === 'teacher') {
        setIsTeacherInStudentMode(false);
      }
      setShowSwitchRoleModal(false);
      setShowUserMenu(false);
      setCurrentView('dashboard');
    } catch (err) {
      if (user) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
      setUserRole(nextRole);
      setShowSwitchRoleModal(false);
      setShowUserMenu(false);
      setCurrentView('dashboard');
    }
  };

  const handleStart = (skipLoading = false) => {
    if (!skipLoading) {
      triggerPseudoLoading("Preparing your dashboard...");
    }
    setHasStarted(true);
    if (user && !userRole) {
      setCurrentView('onboarding');
    } else {
      setCurrentView('dashboard');
    }
    navigate('/app');
  };

  const handleSelectModule = (module: Module) => {
    if (module.id === 'm6') {
      setPendingModule(module);
      setShowTaxWarning(true);
    } else {
      triggerPseudoLoading(`Loading ${module.translations[language]?.title || module.translations.en.title}...`, 2000);
      setActiveModule(module);
      setCurrentView('module');
    }
  };

  const confirmTaxModule = () => {
    if (pendingModule) {
      setActiveModule(pendingModule);
      setCurrentView('tax-roadmap');
      setShowTaxWarning(false);
      setPendingModule(null);
    }
  };

  const saveProgress = useCallback(async (updatedModules: string[]) => {
    if (!user) {
      try {
        localStorage.setItem('beginfin-progress', JSON.stringify(updatedModules));
      } catch (e) {
        console.warn("Error saving guest progress to localStorage:", e);
      }
    }
  }, [user]);

  const handleCompleteModule = async (moduleId: string) => {
    const updatedModules = completedModules.includes(moduleId) 
      ? completedModules 
      : [...completedModules, moduleId];
    
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(updatedModules);
      saveProgress(updatedModules);

      // Send notification if in a class
      if (classId) {
        try {
          const module = modules.find(m => m.id === moduleId);
          const moduleTitle = module?.translations[language]?.title || module?.translations.en.title || moduleId;
          const reqMods = modules.filter(m => !m.isOptional);
          const isCourseComplete = reqMods.every(m => updatedModules.includes(m.id));
          
          const { addDoc, collection } = await import('./firebase');
          await addDoc(collection(db, 'classes', classId, 'alerts'), {
            userId: user!.uid,
            userName: userName || user!.displayName || 'Student',
            type: isCourseComplete ? 'course_completion' : 'unit_completion',
            moduleTitle,
            timestamp: new Date(),
            message: isCourseComplete 
              ? `completed the entire course!` 
              : `completed unit: ${moduleTitle}`
          });
        } catch (err) {
          console.error('Error sending completion alert:', err);
        }
      }
    }
    
    setCurrentView('dashboard');
  };

  const handleLogoClick = () => {
    if (hasStarted) {
      if (user && userRole) {
        proceedToHome();
      } else if (user && !userRole) {
        proceedToHome();
      } else {
        setShowConfirmHome(true);
      }
    } else {
      setHasStarted(false);
      setCurrentView('welcome');
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const proceedToHome = () => {
    setHasStarted(false);
    setCurrentView('welcome');
    setActiveModule(null);
    setShowConfirmHome(false);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const requiredModules = modules.filter(m => !m.isOptional);
  const allCompleted = requiredModules.every(m => completedModules.includes(m.id));

  // Animation variants
  const pageVariants = {
    initial: { opacity: 1, filter: 'blur(0px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' }
  };

  const modalVariants = {
    initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.95, filter: 'blur(10px)' }
  };

  const pageTransition: any = {
    duration: 0.5,
    ease: "easeInOut"
  };

  return (
    <HelmetProvider>
      <ErrorBoundary>
        {/* Main App Content */}
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
        {/* Skip to main content link for keyboard navigation compliance */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:bg-indigo-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:shadow-2xl focus:outline-none transition-all"
        >
          Skip to main content
        </a>
        {/* Loading overlay and auth screen removed to proceed directly to the site */}
        {/* Google SSO One Tap Container */}

        <Modal 
          isOpen={showConfirmHome} 
          onClose={() => setShowConfirmHome(false)} 
          title="Warning"
          size="sm"
        >
          <ConfirmModal 
            onCancel={() => setShowConfirmHome(false)} 
            onConfirm={proceedToHome} 
          />
        </Modal>

        {/* Magic Google One Tap Login */}
        <GoogleOneTap
          user={user}
          disabled={showLoginModal || !!user}
          onSuccess={(signedInUser) => {
            if (currentView === 'welcome') {
              handleStart(true);
            }
          }}
        />

        <Modal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          title=""
          size="sm"
        >
          <LoginModalContent 
            onClose={() => setShowLoginModal(false)} 
            onGoogleLogin={handleGoogleLogin}
            onEmailAuth={handleEmailAuth}
          />
        </Modal>

        <Modal 
          isOpen={showSwitchRoleModal} 
          onClose={() => setShowSwitchRoleModal(false)} 
          title="Mode Selection"
          size="md"
        >
          <SwitchRoleModalContent
            onClose={() => setShowSwitchRoleModal(false)}
            onConfirm={(role) => handleSwitchRole(role)}
            currentRole={userRole}
          />
        </Modal>

        <Modal 
          isOpen={showTaxWarning} 
          onClose={() => { setShowTaxWarning(false); setPendingModule(null); }} 
          title="Legal Disclaimer"
          size="sm"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              The following information is not tax advice and is for informational purposes only. BeginFin is not responsible for any financial losses incurred. Consult a real tax professional for advice. The information in this module may not be accurate due to the fast-evolving nature of US Taxes.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setShowTaxWarning(false); setPendingModule(null); }}
                className="py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={confirmTaxModule}
                className="py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
              >
                I Understand
              </button>
            </div>
          </div>
        </Modal>

        {!isDashboardView && (
          <Navbar
            user={user}
            currentView={currentView}
            variant={currentView === 'welcome' ? 'auto' : 'light'}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onStart={() => handleStart()}
            onOpenSettings={() => setShowSettingsModal(true)}
            onViewCurriculum={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/curriculum'); setCurrentView('curriculum'); }}
            onViewTools={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/tools'); setCurrentView('tools'); }}
            onViewResources={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/resources'); setCurrentView('resources'); }}
            onViewAbout={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/about'); setCurrentView('about'); }}
            onOpenGuide={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/guide'); setCurrentView('guide'); }}
          />
        )}

        <AnimatePresence mode="wait">
          {currentView === 'not-found' ? (
            <motion.div
              key="not-found"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <NotFound onReturn={() => {
                if (user) {
                  navigate('/app');
                  setCurrentView(userRole ? 'dashboard' : 'onboarding');
                } else {
                  navigate('/');
                  setCurrentView('welcome');
                }
              }} />
            </motion.div>
          ) : currentView === 'welcome' ? (
            <motion.div
              key="welcome"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <WelcomeScreen  
                onStart={handleStart} 
                language={language}
                setLanguage={setLanguage}
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onOpenSettings={() => setShowSettingsModal(true)}
                onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                onOpenGuide={() => { window.scrollTo(0,0); navigate('/guide'); setCurrentView('guide'); }}
                modules={orderedModules}
              />
            </motion.div>
          ) : currentView === 'guide' ? (
            <motion.div
              key="guide"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <QuickStartGuide 
                onBack={() => {
                  if (hasStarted) {
                    setCurrentView('dashboard');
                    navigate('/');
                  } else {
                    setCurrentView('welcome');
                    navigate('/');
                  }
                }}
              />
            </motion.div>
          ) : currentView === 'terms' ? (
            <motion.div
              key="terms"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <TermsOfUse 
                onBack={() => {
                  if (hasStarted) {
                    setCurrentView('dashboard');
                    navigate('/');
                  } else {
                    setCurrentView('welcome');
                    navigate('/');
                  }
                }}
              />
            </motion.div>
          ) : currentView === 'privacy' ? (
            <motion.div
              key="privacy"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <PrivacyPolicy 
                onBack={() => {
                  if (hasStarted) {
                    setCurrentView('dashboard');
                    navigate('/');
                  } else {
                    setCurrentView('welcome');
                    navigate('/');
                  }
                }}
              />
            </motion.div>
          ) : currentView === 'curriculum' ? (
            <motion.div
              key={currentView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <main className="flex-1">
                  <div className="min-h-screen bg-white">
                    <CurriculumView
                      language={language}
                      onBack={() => {
                        navigate('/');
                        setCurrentView(user ? (userRole ? 'dashboard' : 'onboarding') : 'welcome');
                      }}
                    />
                  </div>
                </main>
                <Footer 
                  onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                  onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                  onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
                />
              </div>
            </motion.div>
          ) : currentView === 'resources' ? (
            <motion.div
              key={currentView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <main className="flex-1">
                  <div className="min-h-screen bg-white">
                    <ResourcesView
                      onBack={() => {
                        navigate('/');
                        setCurrentView(user ? (userRole ? 'dashboard' : 'onboarding') : 'welcome');
                      }}
                    />
                  </div>
                </main>
                <Footer 
                  onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                  onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                  onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                  onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
                />
              </div>
            </motion.div>

          ) : currentView === 'about' ? (
            <motion.div
              key={currentView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <main className="flex-1">
                  <div className="min-h-screen bg-white">
                    <AboutView
                      onBack={() => {
                        navigate('/');
                        setCurrentView(user ? (userRole ? 'dashboard' : 'onboarding') : 'welcome');
                      }}
                    />
                  </div>
                </main>
                <Footer 
                  onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                  onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                  onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                  onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
                />
              </div>
            </motion.div>
          ) : (currentView === 'mcp' || currentView === 'teacher-mcp' || currentView === 'bradley-mcp') ? (
            <motion.div
              key="mcp-view"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <main className="flex-1">
                  <McpServerView 
                    onBack={() => {
                      navigate('/');
                      setCurrentView(user ? (userRole ? 'dashboard' : 'onboarding') : 'welcome');
                    }}
                    onOpenTeacherDashboard={() => {
                      navigate('/app');
                      setCurrentView('dashboard');
                    }}
                  />
                </main>
                <Footer 
                  onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                  onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                  onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                  onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                  onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
                />
              </div>
            </motion.div>
          ) : currentView === 'tools' ? (
            <motion.div
              key={currentView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <main className="flex-1">
                  <div className="min-h-screen bg-[#FAFAFC]">
                    <ToolsView
                      language={language}
                      onBackToDashboard={() => {
                        navigate('/');
                        setCurrentView(user ? (userRole ? 'dashboard' : 'onboarding') : 'welcome');
                      }}
                      user={user}
                      initialTool={location.pathname.includes('credit') ? 'credit' : 'wage'}
                      onNavigateToAP={() => {
                        window.scrollTo(0,0);
                        navigate('/tools/beginfinsguidetoapbusinesswithpf');
                        setCurrentView('ap-unit');
                      }}
                    />
                  </div>
                </main>
                <Footer 
                  onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                  onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                  onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                  onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                  onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
                />
              </div>
            </motion.div>
          ) : currentView === 'ap-unit' ? (
            <motion.div
              key="ap-unit"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <APUnitView
                onBackToTools={() => {
                  window.scrollTo(0,0);
                  navigate('/tools');
                  setCurrentView('tools');
                }}
                onSelectTopic={(id) => {
                  window.scrollTo(0,0);
                  setSelectedApTopic(id);
                  navigate(`/tools/beginfinsguidetoapbusinesswithpf/${id}`);
                  setCurrentView('ap-topic');
                }}
              />
              <Footer 
                onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
              />
            </motion.div>
          ) : currentView === 'ap-topic' ? (
            <motion.div
              key="ap-topic"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <APTopicView
                topicId={selectedApTopic}
                onBackToUnit={() => {
                  window.scrollTo(0,0);
                  navigate('/tools/beginfinsguidetoapbusinesswithpf');
                  setCurrentView('ap-unit');
                }}
                onSelectTopic={(id) => {
                  window.scrollTo(0,0);
                  setSelectedApTopic(id);
                  navigate(`/tools/beginfinsguidetoapbusinesswithpf/${id}`);
                }}
              />
              <Footer 
                onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
              />
            </motion.div>
          ) : currentView === 'status' ? (
            <motion.div
              key={currentView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <main className="flex-1">
                  <StatusView 
                    user={user}
                    onOpenLogin={() => setShowLoginModal(true)}
                    onBackToApp={() => {
                      navigate('/');
                      setCurrentView(user ? (userRole ? 'dashboard' : 'onboarding') : 'welcome');
                    }}
                  />
                </main>
                <Footer 
                  onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                  onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                  onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                  onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                  onOpenGuide={() => { window.scrollTo(0,0); setCurrentView('guide'); }}
                />
              </div>
            </motion.div>
          ) : currentView === 'admin' || currentView === 'crud-qms' ? (
            <motion.div
              key="admin-dashboard-view"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col p-3 sm:p-6 bg-[#F4F8FA] min-h-screen overflow-y-auto"
            >
              <BeginFinAdminView 
                user={user}
                onBack={() => {
                  navigate('/');
                  setCurrentView(user ? (userRole ? 'dashboard' : 'onboarding') : 'welcome');
                }}
              />
            </motion.div>
          ) : needsVerification ? (
            <motion.div
              key="verification"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col"
            >
              <VerificationNotice />
            </motion.div>
          ) : (
            <motion.div
              key="main-content-wrapper"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="flex-1 flex flex-col"
            >
              {currentView === 'onboarding' && (
                <div key="onboarding-view" className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#F4F8FA] min-h-[85vh]">
                  <ModeSelectionView
                    onSelectMode={async (role) => {
                      try {
                        triggerPseudoLoading(role === 'teacher' ? "Setting up your teacher profile..." : "Setting up your student profile...", 2000);
                        if (user) {
                          const userDocRef = doc(db, 'users', user.uid);
                          await setDoc(userDocRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            role: role,
                            completedModules: completedModules || [],
                            lastUpdated: new Date().toISOString()
                          }, { merge: true });
                        } else {
                          localStorage.setItem('beginfin-guest-role', role);
                        }
                        setUserRole(role);
                        setHasStarted(true);
                        setCurrentView('dashboard');
                        navigate('/app');
                      } catch (err) {
                        console.error('Onboarding failed:', err);
                        if (user) {
                          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
                        }
                        setUserRole(role);
                        setHasStarted(true);
                        setCurrentView('dashboard');
                        navigate('/app');
                      }
                    }}
                    currentMode={userRole}
                  />
                </div>
              )}

              {hasStarted && !needsVerification && currentView !== 'onboarding' && (
                <div key="app-view" className="flex-1 flex flex-col">
                  {/* ... existing header and main content ... */}
              <header className="h-16 fixed top-0 left-0 right-0 z-50 border-b border-slate-200 px-6 flex items-center justify-between no-print bg-white/70 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" onClick={handleLogoClick}>
                    <div className="flex items-center gap-2">
                       <img src="/logo.png" alt="BeginFin Logo" className="w-6 h-6 object-contain rounded-md shadow-xs" referrerPolicy="no-referrer" />
                       <span className="font-bold text-slate-900 tracking-tight text-lg">BeginFin</span>
                    </div>
                  </div>

                  {/* Desktop App Nav Links */}
                  <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => {
                        window.scrollTo(0,0);
                        navigate('/app');
                        setCurrentView('dashboard');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        (currentView as string) === 'dashboard' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo(0,0);
                        navigate('/curriculum');
                        setCurrentView('curriculum');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        (currentView as string) === 'curriculum' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Curriculum
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo(0,0);
                        navigate('/tools');
                        setCurrentView('tools');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        (currentView as string) === 'tools' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Tools & Simulators
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo(0,0);
                        navigate('/resources');
                        setCurrentView('resources');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        (currentView as string) === 'resources' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Resources
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo(0,0);
                        navigate('/about');
                        setCurrentView('about');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        (currentView as string) === 'about' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      About
                    </button>
                  </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  {/* Dashboard mobile menu toggle button */}
                  <button 
                    onClick={() => setShowMobileDashboardNav(!showMobileDashboardNav)}
                    className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                    aria-label="Toggle Dashboard Menu"
                  >
                    {showMobileDashboardNav ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                  </button>

                  {user && userRole === 'teacher' && isTeacherInStudentMode && (
                    <button 
                      onClick={() => {
                        setIsTeacherInStudentMode(false);
                        triggerPseudoLoading("Welcome back, Teacher!", 1500);
                      }}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all text-[10px] md:text-xs"
                    >
                      <Users className="w-4 h-4" /> <span className="hidden sm:inline">Exit Student View</span><span className="sm:hidden">Exit</span>
                    </button>
                  )}
                  {user && userRole === 'teacher' && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                      >
                        <Bell className="w-5 h-5" />
                        {allAlerts.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                            {allAlerts.length}
                          </span>
                        )}
                      </button>

                      <AnimatePresence>
                        {showNotifications && (
                          <div key="notification-container">
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                            >
                              <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h4>
                                <span className="text-[10px] font-bold text-slate-400">{allAlerts.length} Active</span>
                              </div>
                              <div className="max-h-96 overflow-y-auto">
                                {allAlerts.length === 0 ? (
                                  <div className="p-8 text-center">
                                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-400">No new notifications</p>
                                  </div>
                                ) : (
                                  <div className="divide-y divide-slate-50">
                                    {allAlerts.map(alert => (
                                      <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex gap-3">
                                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                                            alert.type === 'fullscreen_exit' ? 'bg-rose-50 text-rose-600' :
                                            alert.type === 'course_completion' ? 'bg-emerald-50 text-emerald-600' :
                                            alert.type === 'unit_completion' ? 'bg-indigo-50 text-indigo-600' :
                                            'bg-amber-50 text-amber-600'
                                          }`}>
                                            {alert.type === 'fullscreen_exit' ? <AlertTriangle className="w-4 h-4" /> :
                                             alert.type === 'course_completion' ? <Trophy className="w-4 h-4" /> :
                                             alert.type === 'unit_completion' ? <CheckCircle2 className="w-4 h-4" /> :
                                             <Zap className="w-4 h-4" />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 leading-tight">
                                              {alert.userName ? <span className="text-indigo-600">{alert.userName}</span> : 'System'} {alert.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{alert.className}</span>
                                              <span className="text-[10px] text-slate-300">•</span>
                                              <span className="text-[10px] font-medium text-slate-400">
                                                {alert.timestamp?.toDate ? alert.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                                              </span>
                                            </div>
                                          </div>
                                          <button 
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              const { deleteDoc, doc } = await import('./firebase');
                                              await deleteDoc(doc(db, 'classes', alert.classId, 'alerts', alert.id));
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded transition-all"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {allAlerts.length > 0 && (
                                <button 
                                  onClick={async () => {
                                    const { writeBatch, doc } = await import('./firebase');
                                    const batch = writeBatch(db);
                                    allAlerts.forEach(a => {
                                      batch.delete(doc(db, 'classes', a.classId, 'alerts', a.id));
                                    });
                                    await batch.commit();
                                  }}
                                  className="w-full p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border-t border-slate-50"
                                >
                                  Clear All Notifications
                                </button>
                              )}
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {user ? (
                    <div className="relative">
                      <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-100 rounded-full transition-colors border border-slate-200 bg-white"
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {user.displayName?.[0] || user.email?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-700 hidden sm:inline truncate max-w-[100px]">{user.displayName || user.email}</span>
                      </button>
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-6 py-4 border-b border-slate-50 mb-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Account</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              {userRole === 'teacher' ? 'Teacher Account' : 'Student Account'}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setShowSettingsModal(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full px-6 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3"
                          >
                            <Settings className="w-4 h-4" /> Settings
                          </button>

                          <button 
                            onClick={() => {
                              setShowSwitchRoleModal(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full px-6 py-3 text-left text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-3"
                          >
                            <Repeat className="w-4 h-4" /> Switch to {userRole === 'student' ? 'Teacher' : 'Student'} Mode
                          </button>

                          <button 
                            onClick={handleLogout}
                            className="w-full px-6 py-3 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-3"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={handleLogin}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </header>

              {/* Mobile Dashboard Nav Panel */}
              <AnimatePresence>
                {showMobileDashboardNav && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowMobileDashboardNav(false)}
                      className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-xs"
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="fixed inset-x-4 top-20 z-50 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:hidden flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#2c5282]">Dashboard Menu</span>
                        <button 
                          onClick={() => setShowMobileDashboardNav(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            setCurrentView('dashboard');
                            navigate('/');
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                        >
                          <Home className="w-4 h-4 shrink-0" /> Dashboard
                        </button>
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            setCurrentView('curriculum');
                            navigate('/curriculum');
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                        >
                          <BookOpen className="w-4 h-4 shrink-0" /> Curriculum
                        </button>
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            setCurrentView('tools');
                            navigate('/tools');
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                        >
                          <Sparkles className="w-4 h-4 shrink-0 text-[#7F7FFA]" /> Tools & Simulators
                        </button>
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            navigate('/guide');
                            setCurrentView('guide');
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-[#e11d48] transition-colors flex items-center gap-3"
                        >
                          <BookOpen className="w-4 h-4 shrink-0 text-[#e11d48]" /> Quick Guide
                        </button>
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            setCurrentView('certificate');
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                        >
                          <Trophy className="w-4 h-4 shrink-0" /> Certificate
                        </button>
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            setCurrentView('about');
                            navigate('/about');
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                        >
                          <Users className="w-4 h-4 shrink-0" /> About
                        </button>
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            setShowSettingsModal(true);
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                        >
                          <Settings className="w-4 h-4 shrink-0" /> Settings
                        </button>
                        <button 
                          onClick={() => {
                            setShowMobileDashboardNav(false);
                            handleLogout();
                          }} 
                          className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-3 border-t border-slate-50 pt-3"
                        >
                          <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <main className="flex-grow flex flex-col pt-16">
                <AnimatePresence mode="wait">
                  {(userRole === 'teacher' && !isTeacherInStudentMode && (currentView as string === 'dashboard' || currentView as string === 'welcome')) ? (
                    <motion.div 
                      key="teacher-dash" 
                      variants={pageVariants} 
                      initial="initial" 
                      animate="animate" 
                      exit="exit" 
                      transition={pageTransition}
                      className="flex-1 flex flex-col"
                    >
                      <TeacherDashboard 
                        user={user!} 
                        onSwitchToStudentView={() => setIsTeacherInStudentMode(true)}
                        triggerLoading={triggerPseudoLoading}
                        onOpenGuide={() => { window.scrollTo(0,0); navigate('/guide'); setCurrentView('guide'); }}
                        language={language}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentView}
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                      className="flex-1 flex flex-col"
                    >
                      {currentView === 'dashboard' && (
                        <Dashboard 
                          modules={orderedModules}
                          completedIds={completedModules}
                          onSelect={handleSelectModule}
                          onClaimCertificate={() => setCurrentView('certificate')}
                          onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                          onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                          allCompleted={allCompleted}
                          language={language}
                          user={user}
                          onLogin={handleLogin}
                          classId={classId}
                          userRole={userRole}
                          triggerLoading={triggerPseudoLoading}
                          onOpenGuide={() => { window.scrollTo(0,0); navigate('/guide'); setCurrentView('guide'); }}
                          onReturnToTeacherMode={() => setIsTeacherInStudentMode(false)}
                        />
                      )}
                      {currentView === 'module' && activeModule && (
                        <ModuleView 
                          module={activeModule}
                          onComplete={() => handleCompleteModule(activeModule.id)}
                          onBack={() => setCurrentView('dashboard')}
                          language={language}
                          isFullScreenLockEnabled={isFullScreenLockEnabled}
                          userRole={userRole}
                          user={user}
                          classId={classId}
                          onStepChange={setModuleStep}
                        />
                      )}
                      {currentView === 'tax-roadmap' && (
                        <TaxRoadmap 
                          onComplete={() => handleCompleteModule('m6')}
                          onBack={() => setCurrentView('dashboard')}
                        />
                      )}
                      {currentView === 'certificate' && (
                        <CertificateView 
                          userName={userName}
                          setUserName={setUserName}
                          completedIds={completedModules}
                          onBack={() => setCurrentView('dashboard')}
                          language={language}
                          userId={user?.uid || ''}
                          onLogin={() => setShowLoginModal(true)}
                        />
                      )}
                      {((currentView as string) === 'tools') && (
                        <ToolsView
                          language={language}
                          onBackToDashboard={() => {
                            window.scrollTo(0,0);
                            navigate('/app');
                            setCurrentView('dashboard');
                          }}
                          user={user}
                          initialTool={location.pathname.includes('credit') ? 'credit' : 'wage'}
                          onNavigateToAP={() => {
                            window.scrollTo(0,0);
                            navigate('/tools/beginfinsguidetoapbusinesswithpf');
                            setCurrentView('ap-unit');
                          }}
                        />
                      )}
                      {((currentView as string) === 'ap-unit') && (
                        <APUnitView
                          onBackToTools={() => {
                            window.scrollTo(0,0);
                            navigate('/tools');
                            setCurrentView('tools');
                          }}
                          onSelectTopic={(id) => {
                            window.scrollTo(0,0);
                            setSelectedApTopic(id);
                            navigate(`/tools/beginfinsguidetoapbusinesswithpf/${id}`);
                            setCurrentView('ap-topic');
                          }}
                        />
                      )}
                      {((currentView as string) === 'ap-topic') && (
                        <APTopicView
                          topicId={selectedApTopic}
                          onBackToUnit={() => {
                            window.scrollTo(0,0);
                            navigate('/tools/beginfinsguidetoapbusinesswithpf');
                            setCurrentView('ap-unit');
                          }}
                          onSelectTopic={(id) => {
                            window.scrollTo(0,0);
                            setSelectedApTopic(id);
                            navigate(`/tools/beginfinsguidetoapbusinesswithpf/${id}`);
                          }}
                        />
                      )}
                      {((currentView as string) === 'curriculum') && (
                        <CurriculumView
                          onBack={() => setCurrentView('dashboard')}
                          language={language}
                          onSelectModule={(moduleId) => {
                            const mod = modules.find(m => m.id === moduleId);
                            if (mod) {
                              setActiveModule(mod);
                              setCurrentView('module');
                            }
                          }}
                        />
                      )}
                      {((currentView as string) === 'resources') && (
                        <ResourcesView
                          onBack={() => setCurrentView('dashboard')}
                        />
                      )}
                      {((currentView as string) === 'about') && (
                        <AboutView
                          onBack={() => setCurrentView('dashboard')}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

              <Footer 
                onViewCurriculum={() => { window.scrollTo(0,0); navigate('/curriculum'); setCurrentView('curriculum'); }}
                onViewTools={() => { window.scrollTo(0,0); navigate('/tools'); setCurrentView('tools'); }}
                onViewResources={() => { window.scrollTo(0,0); navigate('/resources'); setCurrentView('resources'); }}
                onViewAbout={() => { window.scrollTo(0,0); navigate('/about'); setCurrentView('about'); }}
                onOpenGuide={() => { window.scrollTo(0,0); navigate('/guide'); setCurrentView('guide'); }}
              />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
      />
    </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
