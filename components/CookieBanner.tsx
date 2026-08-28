import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = (function(){try{return localStorage.getItem('beginfin_data_consent')}catch(e){return null}})();
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem('beginfin_data_consent', 'true'); } catch(e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:bottom-6 z-30 w-[calc(100%-2rem)] max-w-xs sm:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-xl p-3 sm:p-3.5 shadow-xl flex flex-col gap-2.5 text-left">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 bg-[#7F7FFA]/20 rounded-lg border border-[#7F7FFA]/30 flex items-center justify-center shrink-0 text-[#7F7FFA] mt-0.5">
            <Cookie className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-slate-300 leading-normal font-normal">
            We use essential cookies & storage to save your progress.{' '}
            <Link to="/privacypolicy" className="underline text-[#7F7FFA] hover:text-white transition-colors">
              View more in the privacy policy.
            </Link>
          </p>
        </div>

        <div className="flex justify-end pt-1 border-t border-white/10">
          <button 
            onClick={handleAccept}
            className="px-3.5 py-1.5 bg-[#7F7FFA] hover:bg-[#7F7FFA]/80 text-white font-medium rounded-lg text-[11px] transition-colors shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};


