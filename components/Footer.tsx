import React from 'react';
import { Mail, Instagram, Linkedin, Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';
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

  return (
    <footer 
      id="main-footer"
      className="bg-[#F4F8FA] text-[#3C3C3C] py-12 md:py-16 px-4 sm:px-6 border-t border-[#3C3C3C]/10 no-print"
    >
      <div className="container mx-auto max-w-6xl space-y-6">
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Bento Card 1: Brand & Mission */}
          <div className="md:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border border-[#3C3C3C]/10 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F4F8FA] rounded-2xl border border-[#7F7FFA]/20 shadow-xs">
                  <img 
                    src="/logo.png" 
                    alt="BeginFin Logo" 
                    className="w-8 h-8 object-contain rounded-xl" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#3C3C3C] tracking-tight">
                    BeginFin
                  </h3>
                  <p className="text-xs text-[#3C3C3C]/60 font-medium">
                    By Vishnu Kakarla &amp; Kruz Smith
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#3C3C3C]/70 font-normal leading-relaxed">
                An open-access personal finance initiative designed to empower individuals with real-world financial confidence, 100% free, forever.
              </p>
            </div>

            <div className="pt-4 border-t border-[#3C3C3C]/10 flex items-center">
              <Link 
                to="/status" 
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F8FA] hover:bg-[#7F7FFA]/10 border border-[#3C3C3C]/10 text-xs font-semibold text-[#3C3C3C] transition-colors cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full ${statusDotColor} animate-pulse`}></span>
                <span>System: {systemStatus}</span>
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Sections Navigation */}
          <div className="md:col-span-4 bg-white p-7 sm:p-8 rounded-3xl border border-[#3C3C3C]/10 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7F7FFA] mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sections</span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-medium text-[#3C3C3C]/80">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="text-left hover:text-[#7F7FFA] transition-colors cursor-pointer py-1"
                >
                  Home
                </button>
                <button 
                  onClick={onViewCurriculum} 
                  className="text-left hover:text-[#7F7FFA] transition-colors cursor-pointer py-1"
                >
                  Curriculum
                </button>
                <button 
                  onClick={() => {
                    if (onViewTools) {
                      onViewTools();
                    } else {
                      navigate('/tools');
                    }
                  }} 
                  className="text-left hover:text-[#7F7FFA] transition-colors cursor-pointer py-1"
                >
                  Simulators
                </button>
                <button 
                  onClick={onViewResources} 
                  className="text-left hover:text-[#7F7FFA] transition-colors cursor-pointer py-1"
                >
                  Resources
                </button>
                <Link 
                  to="/status" 
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
                  className="text-left hover:text-[#7F7FFA] transition-colors cursor-pointer py-1 block"
                >
                  System Status
                </Link>
                <button 
                  onClick={onOpenGuide} 
                  className="text-left hover:text-[#7F7FFA] transition-colors cursor-pointer py-1"
                >
                  Quick Guide
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#3C3C3C]/10">
              <Link 
                to="/mcp" 
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
                className="inline-flex items-center justify-between w-full p-2.5 rounded-xl bg-[#F4F8FA] hover:bg-[#7F7FFA]/10 border border-[#3C3C3C]/10 text-xs font-semibold text-[#3C3C3C] hover:text-[#7F7FFA] transition-colors"
              >
                <span>Connect AI Assistant (MCP)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#7F7FFA]" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: About & Policies */}
          <div className="md:col-span-3 bg-white p-7 sm:p-8 rounded-3xl border border-[#3C3C3C]/10 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#7F7FFA] mb-4">
                About
              </div>

              <div className="space-y-2.5 text-xs font-medium text-[#3C3C3C]/80">
                <div>
                  <Link 
                    to="/termsofuse" 
                    onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
                    className="hover:text-[#7F7FFA] transition-colors cursor-pointer block py-0.5"
                  >
                    Terms of Service
                  </Link>
                </div>
                <div>
                  <Link 
                    to="/privacypolicy" 
                    onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
                    className="hover:text-[#7F7FFA] transition-colors cursor-pointer block py-0.5"
                  >
                    Privacy Policy
                  </Link>
                </div>
                <div>
                  {onViewAbout ? (
                    <button 
                      onClick={onViewAbout} 
                      className="hover:text-[#7F7FFA] transition-colors cursor-pointer block py-0.5 text-left"
                    >
                      About Story
                    </button>
                  ) : (
                    <Link 
                      to="/about" 
                      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
                      className="hover:text-[#7F7FFA] transition-colors cursor-pointer block py-0.5"
                    >
                      About Story
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Socials */}
            <div className="pt-4 border-t border-[#3C3C3C]/10 space-y-3">
              <a 
                href="mailto:support@begin-fin.com"
                className="w-full px-3.5 py-2 bg-[#F4F8FA] hover:bg-[#7F7FFA]/10 border border-[#3C3C3C]/10 rounded-xl text-xs font-semibold text-[#7F7FFA] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@begin-fin.com</span>
              </a>

              <div className="flex items-center justify-center gap-2">
                <a 
                  href="https://www.instagram.com/begin_fin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#F4F8FA] hover:bg-[#7F7FFA]/15 border border-[#3C3C3C]/10 rounded-xl text-[#3C3C3C]/70 hover:text-[#7F7FFA] transition-colors flex items-center justify-center cursor-pointer"
                  title="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/begin-fin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#F4F8FA] hover:bg-[#7F7FFA]/15 border border-[#3C3C3C]/10 rounded-xl text-[#3C3C3C]/70 hover:text-[#7F7FFA] transition-colors flex items-center justify-center cursor-pointer"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-4 border-t border-[#3C3C3C]/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] font-medium text-[#3C3C3C]/60">
          <div>
            © 2026 BeginFin. All rights reserved. Open Educational Resource.
          </div>
          <div className="flex items-center gap-2">
            <span>Made with <span className="text-rose-500">❤️</span> in Texas</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
