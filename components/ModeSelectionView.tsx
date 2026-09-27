import React from 'react';
import { BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModeSelectionViewProps {
  onSelectMode: (mode: 'student' | 'teacher') => void | Promise<void>;
  currentMode?: 'student' | 'teacher' | null;
  isSwitching?: boolean;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ModeSelectionView: React.FC<ModeSelectionViewProps> = ({
  onSelectMode,
  currentMode,
  isSwitching = false,
  onCancel,
  isLoading = false
}) => {
  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Outer Floating Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-[2.25rem] p-7 sm:p-11 md:p-14 max-w-2xl lg:max-w-[42rem] w-full border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.04)] text-center relative"
      >
        {/* Header Title with Signature Indigo/Iris Gradient */}
        <h2 
          id="mode-selection-title"
          className={`text-3xl sm:text-4xl md:text-[2.65rem] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-[#212457] via-[#4148A6] to-[#7176E5] bg-clip-text text-transparent select-none ${
            isSwitching ? 'mb-6 sm:mb-8' : 'mb-2 sm:mb-2.5'
          }`}
        >
          {isSwitching ? 'Mode Selection' : 'Welcome to BeginFin'}
        </h2>

        {/* Subtitle */}
        {!isSwitching && (
          <p 
            id="mode-selection-subtitle"
            className="text-[#3C3C3C]/80 text-sm sm:text-base font-normal max-w-md mx-auto mb-8 sm:mb-10 select-none"
          >
            Choose a mode to get started (you can switch anytime).
          </p>
        )}

        {/* Two-Column Mode Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-left">
          
          {/* Student Mode Card */}
          <button
            id="mode-card-student"
            type="button"
            disabled={isLoading}
            onClick={() => onSelectMode('student')}
            className="group w-full bg-white border border-slate-200/90 hover:border-[#7F7FFA] hover:shadow-[0_16px_36px_rgba(127,127,250,0.14)] hover:-translate-y-0.5 rounded-[1.75rem] p-7 sm:p-8 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7F7FFA]/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              {/* Soft Iris Icon Badge */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF0FD] border border-[#E0E4FB] flex items-center justify-center mb-8 group-hover:scale-105 group-hover:bg-[#E5E9FC] transition-all duration-300">
                <BookOpen className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-[#5358D4] stroke-[1.8]" />
              </div>

              {/* Card Title */}
              <h3 className="text-xl sm:text-[1.35rem] font-bold text-[#1E2022] tracking-tight mb-1">
                Student Mode
              </h3>

              {/* Card Subtitle */}
              <p className="text-slate-500 text-sm sm:text-base font-normal leading-relaxed">
                Learn at your own pace.
              </p>
            </div>
          </button>

          {/* Teacher Mode Card */}
          <button
            id="mode-card-teacher"
            type="button"
            disabled={isLoading}
            onClick={() => onSelectMode('teacher')}
            className="group w-full bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-[0_16px_36px_rgba(16,185,129,0.14)] hover:-translate-y-0.5 rounded-[1.75rem] p-7 sm:p-8 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              {/* Soft Emerald Icon Badge */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#E8F8F0] border border-[#D1F2E3] flex items-center justify-center mb-8 group-hover:scale-105 group-hover:bg-[#DCF4E8] transition-all duration-300">
                <Users className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-[#10B981] stroke-[1.8]" />
              </div>

              {/* Card Title */}
              <h3 className="text-xl sm:text-[1.35rem] font-bold text-[#1E2022] tracking-tight mb-1">
                Teacher Mode
              </h3>

              {/* Card Subtitle */}
              <p className="text-slate-500 text-sm sm:text-base font-normal leading-relaxed">
                Teach your way
              </p>
            </div>
          </button>

        </div>

        {/* Optional Cancel for Modal Context */}
        {isSwitching && onCancel && (
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
