import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestJoinModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-md p-7 sm:p-8 border border-[#3C3C3C]/10 shadow-lg animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-9 h-9 text-[#7F7FFA]" />
        </div>
        <h3 className="text-2xl font-bold text-[#3C3C3C] text-center mb-2 tracking-tight">Account Required</h3>
        <p className="text-[#3C3C3C]/70 text-center font-normal text-sm sm:text-base mb-8 leading-relaxed">
          Looking to join a class? An account is required. Head back to the home page and click "Sign In."
        </p>
        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-[#7F7FFA] text-white font-bold rounded-xl hover:bg-[#6868EB] transition-colors shadow-sm cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
