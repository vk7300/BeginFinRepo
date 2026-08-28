import React from 'react';
import { motion } from 'framer-motion';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

interface Props {
  onReturn: () => void;
}

export const NotFound: React.FC<Props> = ({ onReturn }) => {
  return (
    <div className="min-h-screen bg-[#F4F8FA] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-8 border border-slate-100">
          <AlertCircle className="w-12 h-12 text-[#7F7FFA]" />
        </div>
        
        <h1 className="text-4xl font-black text-[#3C3C3C] tracking-tight mb-4">Uh oh!</h1>
        <p className="text-xl font-bold text-slate-600 mb-2">We don't seem to have that page.</p>
        <p className="text-slate-500 font-medium mb-12">The link you followed might be broken or the page may have been moved.</p>

        <button 
          onClick={onReturn}
          className="w-full py-4 bg-[#0b0f19] text-white font-black rounded-2xl hover:bg-[#7F7FFA] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Take me home</span>
        </button>

        <div className="mt-12 flex justify-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#7F7FFA]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#7F7FFA]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#7F7FFA]/30" />
        </div>
      </motion.div>
    </div>
  );
};
