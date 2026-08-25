import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface CompletionToastProps {
  isVisible: boolean;
  onClose: () => void;
  onAction: () => void;
}

export const CompletionToast: React.FC<CompletionToastProps> = ({ isVisible, onClose, onAction }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-in slide-in-from-top duration-500">
      <div className="bg-white/90 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl p-5 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.4)] flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 via-emerald-500 to-indigo-500" />
        
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Course Mastered!</h4>
          <p className="text-xs text-slate-500 font-medium">You've mastered all units. Claim your certificate now!</p>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={onAction}
            className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1 whitespace-nowrap"
          >
            Claim <ArrowRight className="w-3 h-3" />
          </button>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors self-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};