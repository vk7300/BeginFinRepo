import React, { useState } from 'react';
import { Mail, ArrowRight, LogOut, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { auth } from '../firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';

export const VerificationNotice: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setIsResending(true);
    setError('');
    try {
      await sendEmailVerification(auth.currentUser);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefresh = async () => {
    if (!auth.currentUser) return;
    setIsResending(true);
    setError('');
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setResent(false);
        // We'll let the parent component's auth state update handle the transition
        // But for immediate feedback:
        window.location.reload();
      } else {
        setError('Verification pending. Please check your inbox and click the link.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to refresh status');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200/80 text-center"
      >
        <div className="w-20 h-20 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Mail className="w-10 h-10 text-[#7F7FFA]" />
        </div>

        <h2 className="text-3xl font-black text-[#3C3C3C] tracking-tight mb-4">Check your email!</h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          We've sent a verification link to <span className="text-[#7F7FFA] font-bold">{auth.currentUser?.email}</span>. 
          Please click the link in your email to unlock your financial journey.
        </p>

        {resent && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            Verification email resent!
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleRefresh}
            className="w-full py-4 bg-[#7F7FFA] text-white font-black rounded-2xl hover:bg-[#7F7FFA]/90 transition-all shadow-xl shadow-[#7F7FFA]/20 flex items-center justify-center gap-3 group cursor-pointer"
          >
            <span>I've verified my email</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs border border-slate-100 cursor-pointer"
            >
              {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Resend Email
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="py-3 bg-slate-50 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2 text-xs border border-rose-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Don't see it? Check your spam folder or wait a few minutes.
        </p>
      </motion.div>
    </div>
  );
};
