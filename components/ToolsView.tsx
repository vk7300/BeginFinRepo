import React, { useState } from 'react';
import { Sparkles, ShieldCheck, GraduationCap, X, ChevronRight, Info, BookOpen } from 'lucide-react';
import { Language } from '../data/uiTranslations';
import { User } from '../firebase';
import { SalarySimulator } from './SalarySimulator';
import { useNavPadding } from './Navbar';

interface ToolsViewProps {
  language: Language;
  onBackToDashboard: () => void;
  user: User | null;
  initialTool?: 'wage' | 'credit';
  onNavigateToAP?: () => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  onBackToDashboard,
  onNavigateToAP
}) => {
  const navPadding = useNavPadding();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAPGuide = () => {
    setIsModalOpen(false);
    if (onNavigateToAP) {
      onNavigateToAP();
    } else {
      window.location.href = '/tools/beginfinsguidetoapbusinesswithpf';
    }
  };

  return (
    <div className={`min-h-screen bg-[#F4F8FA] text-[#3C3C3C] flex flex-col font-sans pb-24 ${navPadding}`}>
      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <SalarySimulator />

        {/* Section Divider */}
        <div className="my-10 border-t border-slate-200/80" />

        {/* BeginFin's Guide to AP Business with Personal Finance Card */}
        <section aria-label="AP course resources" className="card p-6 sm:p-8 border-slate-200/80 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  Course Review Resource
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Unit 1 Available Now
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-[#7F7FFA]" />
                <span>BeginFin's Guide to AP® Business with Personal Finance</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Independently aligned to the publicly available AP® Business with Personal Finance Course Framework. Explore bite-sized topic summaries, vocabulary definitions, and practical business scenarios.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-primary w-full md:w-auto gap-2 text-xs py-3 px-5 shadow-sm"
              >
                <span>View Resource Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer info note */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7F7FFA]" />
            <span>National Standards for Personal Financial Education (NSPFE) Aligned</span>
          </div>
          <span>BeginFin Student-Led Open Educational Resource</span>
        </div>
      </main>

      {/* AP Guide Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ap-modal-title"
        >
          <div className="card max-w-lg w-full p-6 sm:p-8 bg-white border-slate-200 shadow-xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                Exam Preparation & Review
              </span>
              <h3 id="ap-modal-title" className="text-xl font-bold text-slate-900 tracking-tight">
                BeginFin's Guide to AP® Business with Personal Finance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                An open, student-friendly review companion independently aligned to the publicly available AP® Business with Personal Finance Course Framework.
              </p>
            </div>

            {/* Note badge */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Current Availability</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only Unit 1 is available now, with more units and BeginFin tools to be supported soon.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">What's included in Unit 1:</div>
              <ul className="space-y-1.5 list-disc ml-5">
                <li>8 bite-sized review topics (1.1 through 1.8)</li>
                <li>Core concept definitions and vocabulary breakdowns</li>
                <li>Fictional startup scenarios with Cedar & Sprout</li>
                <li>Common misconceptions and key recall points</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAPGuide}
                className="btn-primary w-full py-3 text-xs"
              >
                Go to Guide (Unit 1)
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-ghost w-full sm:w-auto text-xs py-3"
              >
                Close
              </button>
            </div>

            {/* Required Trademark Line */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 leading-normal font-normal">
                AP® is a trademark registered by the College Board. BeginFin is licensed to use the AP® trademark. BeginFin is not endorsed by the College Board.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
