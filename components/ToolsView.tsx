import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Layout, Compass, ShieldCheck } from 'lucide-react';
import { Language } from '../data/uiTranslations';
import { User } from '../firebase';

interface ToolsViewProps {
  language: Language;
  onBackToDashboard: () => void;
  user: User | null;
  initialTool?: 'wage' | 'credit';
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  language,
  onBackToDashboard,
  user
}) => {
  return (
    <div className="min-h-[85vh] bg-[#FAFAFC] text-slate-900 flex flex-col font-sans">
      {/* Sub-Header Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>

          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Interactive Tools
          </span>
        </div>
      </div>

      {/* Main Announcement Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl text-center space-y-8"
        >
          {/* Bento Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col items-center justify-center space-y-6">
            
            {/* Subtle Periwinkle Glow Backdrop */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-[#7F7FFA]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-[#7F7FFA]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#7F7FFA]" />
              <span>Under Active Development</span>
            </div>

            {/* Main Message */}
            <div className="space-y-3 max-w-lg mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Interactive Simulators
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                We are currently updating our interactive tools to ensure the best experience. Stay tuned.
              </p>
            </div>

            {/* Decorative divider */}
            <div className="w-16 h-0.5 bg-slate-100 rounded-full my-2" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
              <button
                onClick={onBackToDashboard}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Layout className="w-4 h-4" />
                <span>Go to Curriculum</span>
              </button>
            </div>
          </div>

          {/* Compliance & Standards Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Aligned with National Standards for Personal Financial Education (NSPFE)</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
