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
        className="bg-white rounded-3xl p-7 sm:p-10 md:p-12 max-w-2xl lg:max-w-[42rem] w-full border border-[#3C3C3C]/10 shadow-sm text-center relative"
      >
        {/* Header Title with Signature Iris Pulse Gradient */}
        <h2 
          id="mode-selection-title"
          className={`text-3xl sm:text-4xl md:text-[2.65rem] font-bold tracking-tight leading-tight bg-gradient-to-r from-[#5358D4] via-[#7F7FFA] to-[#A3A3FC] bg-clip-text text-transparent select-none ${
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
            className={`group w-full bg-white border rounded-2xl p-6 sm:p-7 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7F7FFA]/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
              currentMode === 'student' 
                ? 'border-[#7F7FFA] ring-1 ring-[#7F7FFA] bg-[#F4F8FA]' 
                : 'border-[#3C3C3C]/10 hover:border-[#7F7FFA] hover:bg-[#F4F8FA]/40'
            }`}
          >
            <div>
              {/* Soft Iris Icon Badge */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-white transition-all duration-200">
                <BookOpen className="w-6 h-6 text-[#7F7FFA]" />
              </div>

              {/* Card Title */}
              <h3 className="text-xl font-bold text-[#3C3C3C] tracking-tight mb-1">
                Student Mode
              </h3>

              {/* Card Subtitle */}
              <p className="text-[#3C3C3C]/70 text-sm font-normal leading-relaxed">
                Learn at your own pace.
              </p>
            </div>

            {currentMode === 'student' && (
              <div className="mt-4 pt-3 border-t border-[#3C3C3C]/10 flex items-center justify-between text-[11px] font-bold text-[#7F7FFA] uppercase tracking-wider">
                <span>Current Mode</span>
                <span className="w-2 h-2 rounded-full bg-[#7F7FFA]" />
              </div>
            )}
          </button>

          {/* Teacher Mode Card */}
          <button
            id="mode-card-teacher"
            type="button"
            disabled={isLoading}
            onClick={() => onSelectMode('teacher')}
            className={`group w-full bg-white border rounded-2xl p-6 sm:p-7 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7F7FFA]/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
              currentMode === 'teacher' 
                ? 'border-[#7F7FFA] ring-1 ring-[#7F7FFA] bg-[#F4F8FA]' 
                : 'border-[#3C3C3C]/10 hover:border-[#7F7FFA] hover:bg-[#F4F8FA]/40'
            }`}
          >
            <div>
              {/* Soft Iris Icon Badge */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-white transition-all duration-200">
                <Users className="w-6 h-6 text-[#7F7FFA]" />
              </div>

              {/* Card Title */}
              <h3 className="text-xl font-bold text-[#3C3C3C] tracking-tight mb-1">
                Teacher Mode
              </h3>

              {/* Card Subtitle */}
              <p className="text-[#3C3C3C]/70 text-sm font-normal leading-relaxed">
                Teach your way.
              </p>
            </div>

            {currentMode === 'teacher' && (
              <div className="mt-4 pt-3 border-t border-[#3C3C3C]/10 flex items-center justify-between text-[11px] font-bold text-[#7F7FFA] uppercase tracking-wider">
                <span>Current Mode</span>
                <span className="w-2 h-2 rounded-full bg-[#7F7FFA]" />
              </div>
            )}
          </button>

        </div>

        {/* Optional Cancel for Modal Context */}
        {isSwitching && onCancel && (
          <div className="mt-8 pt-4 border-t border-[#3C3C3C]/10 flex justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-[#3C3C3C]/70 hover:text-[#3C3C3C] hover:bg-[#F4F8FA] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
