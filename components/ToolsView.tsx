import React from 'react';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../data/uiTranslations';
import { User } from '../firebase';
import { SalarySimulator } from './SalarySimulator';

interface ToolsViewProps {
  language: Language;
  onBackToDashboard: () => void;
  user: User | null;
  initialTool?: 'wage' | 'credit';
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  onBackToDashboard
}) => {
  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#3C3C3C] flex flex-col font-sans pb-24">
      {/* Sub-Header Navigation Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#7F7FFA]/10 text-[#7F7FFA] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Interactive Simulators</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8">
        <SalarySimulator />

        {/* Footer info note */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7F7FFA]" />
            <span>National Standards for Personal Financial Education (NSPFE) Aligned</span>
          </div>
          <span>BeginFin Student-Led Open Educational Resource</span>
        </div>
      </main>
    </div>
  );
};
