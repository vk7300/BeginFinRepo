import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestJoinModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-7 shadow-2xl animate-in zoom-in duration-200 my-auto max-h-[min(90vh,520px)] overflow-y-auto">
        <div className="w-14 h-14 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-[#7F7FFA]" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[#3C3C3C] text-center mb-2 tracking-tight">Account Required</h3>
        <p className="text-slate-500 text-center font-medium text-xs sm:text-sm mb-6">
          Looking to join a class? An account is required. Head back to the home page and click "Sign In."
        </p>
        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-[#7F7FFA] text-white font-bold rounded-xl hover:bg-[#6868EB] transition-colors shadow-md cursor-pointer text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
