import React from 'react';
import { Mail, Instagram, Linkedin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSystemStatus } from '../services/systemStatusService';

interface FooterProps {
  onViewCurriculum: () => void;
  onViewResources: () => void;
  onOpenGuide: () => void;
  onViewAbout?: () => void;
  onViewTools?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onViewCurriculum, 
  onViewResources, 
  onOpenGuide,
  onViewAbout,
  onViewTools
}) => {
  const navigate = useNavigate();
  const { overall: systemStatus } = useSystemStatus();

  const statusDotColor = 
    systemStatus === 'Operational' ? 'bg-emerald-500' :
    systemStatus === 'Issues Observed' ? 'bg-amber-400' :
    'bg-rose-500';

  const handleGoHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/');
  };

  const handleGoCurriculum = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onViewCurriculum) onViewCurriculum();
    else navigate('/curriculum');
  };

  const handleGoTools = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onViewTools) onViewTools();
    else navigate('/tools');
  };

  const handleGoResources = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onViewResources) onViewResources();
    else navigate('/resources');
  };

  const handleGoAbout = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onViewAbout) onViewAbout();
    else navigate('/about');
  };

  const handleGoGuide = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onOpenGuide) onOpenGuide();
    else navigate('/guide');
  };

  return (
    <footer 
      className="bg-[#3C3C3C] text-white pt-12 sm:pt-16 pb-10 px-4 sm:px-8 md:px-14 border-t border-white/10 no-print font-sans"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: White Card with Logo & Mission */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-5 sm:space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src="/logo.png" 
                    alt="BeginFin Logo" 
                    className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl p-1 bg-slate-50 border border-slate-200/80 shadow-xs shrink-0" 
                    referrerPolicy="no-referrer" 
                  />
                  <div>
                    <h3 className="font-serif text-xl text-slate-900 font-normal tracking-tight leading-tight">
                      BeginFin
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      By Vishnu Kakarla &amp; Kruz Smith
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mt-3.5 sm:mt-4">
                  An open-access personal finance initiative designed to empower individuals with financial confidence, 100% free, forever.
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-4 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={handleGoAbout}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-xs font-semibold transition-all cursor-pointer shadow-md active:scale-95 inline-flex items-center justify-center"
                >
                  About Us
                </button>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusDotColor} animate-pulse shrink-0`} />
                  <Link
                    to="/status"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    System Status: {systemStatus === 'Operational' ? 'Working' : systemStatus}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Center & Right: Navigation Columns + Socials */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between h-full pt-1 sm:pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10">
              
              {/* Column 1 */}
              <div className="space-y-2 sm:space-y-3.5">
                <button 
                  type="button"
                  onClick={handleGoHome} 
                  className="block w-full py-1 text-sm text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
                <button 
                  type="button"
                  onClick={handleGoTools} 
                  className="block w-full py-1 text-sm text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Simulators
                </button>
                <button 
                  type="button"
                  onClick={handleGoCurriculum} 
                  className="block w-full py-1 text-sm text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Curriculum
                </button>
                <button 
                  type="button"
                  onClick={handleGoResources} 
                  className="block w-full py-1 text-sm text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Resources
                </button>
                <button 
                  type="button"
                  onClick={handleGoGuide} 
                  className="block w-full py-1 text-sm text-slate-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Quick Start Guide
                </button>
              </div>

              {/* Column 2 */}
              <div className="space-y-2 sm:space-y-3.5">
                <Link 
                  to="/status" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  className="block py-1 text-sm text-slate-200 hover:text-white transition-colors text-left"
                >
                  System Status
                </Link>
                <Link 
                  to="/mcp" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  className="block py-1 text-sm text-slate-200 hover:text-white transition-colors text-left"
                >
                  MCP Tools
                </Link>
                <Link 
                  to="/termsofuse" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  className="block py-1 text-sm text-slate-200 hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacypolicy" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  className="block py-1 text-sm text-slate-200 hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </Link>
                <a 
                  href="mailto:support@beginfin.com"
                  className="block py-1 text-sm text-slate-200 hover:text-white transition-colors text-left"
                >
                  Support Email
                </a>
              </div>

              {/* Column 3: Social Icons */}
              <div className="col-span-2 sm:col-span-1 flex flex-row sm:flex-col sm:items-end gap-3 pt-2 sm:pt-0">
                <a 
                  href="https://www.linkedin.com/company/begin-fin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="LinkedIn"
                  aria-label="BeginFin on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.instagram.com/begin_fin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Instagram"
                  aria-label="BeginFin on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="mailto:support@beginfin.com"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                  title="Email Support"
                  aria-label="Send email to BeginFin Support"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Location */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-normal text-center sm:text-left">
          <div>© BeginFin 2026 | All Rights Reserved</div>
          <div className="flex items-center gap-1.5">
            <span>Made with</span>
            <span className="text-rose-500">❤️</span>
            <span>in Texas</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
