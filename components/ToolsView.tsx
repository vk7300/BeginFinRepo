import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Language } from '../data/uiTranslations';
import { User } from '../firebase';
import { SalarySimulator } from './SalarySimulator';
import { useNavPadding } from './Navbar';

interface ToolsViewProps {
  language: Language;
  onBackToDashboard: () => void;
  user: User | null;
  initialTool?: 'wage' | 'credit';
}

export const ToolsView: React.FC<ToolsViewProps> = () => {
  const navPadding = useNavPadding();

  return (
    <div className={`min-h-screen bg-[#F4F8FA] text-[#3C3C3C] flex flex-col font-sans pb-24 ${navPadding}`}>
      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <SalarySimulator />

        {/* Footer info note */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
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
