
import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Preparing your journey..." }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xl text-white"
        >
          <div className="relative">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
            />
            {/* Inner spinning ring (reverse) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
            />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="https://i.postimg.cc/qvTKKNQJ/New-Begin-Fin-Logo(White-BG).png" alt="BeginFin Logo" className="w-10 h-10 object-contain rounded-md" referrerPolicy="no-referrer" />
            </div>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <h3 className="text-2xl font-black tracking-tight mb-2">{message}</h3>
            <div className="flex items-center justify-center gap-1">
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
              />
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, times: [0, 0.5, 1] }}
                className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
              />
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, times: [0, 0.5, 1] }}
                className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
              />
            </div>
          </motion.div>
          
          <div className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
            BeginFin Global Education
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
