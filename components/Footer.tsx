import React from 'react';
import { Mail, Instagram, Linkedin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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
  return (
    <footer 
       
      className="bg-gradient-to-br from-[#060814] via-[#0b0e26] to-[#12163b] text-white py-14 md:py-20 px-6 border-t border-white/10 no-print"
    >
      <div className="container mx-auto max-w-5xl flex flex-col items-center text-center space-y-10">
        
        {/* Logo & Tagline */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-2 bg-white rounded-2xl shadow-xl">
            <img 
              src="/logo.png" 
              alt="BeginFin Logo" 
              className="w-10 h-10 object-contain rounded-xl" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-normal tracking-tight text-white whitespace-nowrap">
              BeginFin by Vishnu Kakarla and Kruz Smith
            </h3>
            <p className="text-xs md:text-sm text-slate-400 font-normal leading-relaxed">
              We want to empower individuals with financial confidence.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs font-medium text-slate-300">
          <span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Home</span>
          <span onClick={onViewCurriculum} className="hover:text-white transition-colors cursor-pointer">Curriculum</span>
          <span 
            onClick={() => {
              if (onViewTools) {
                onViewTools();
              } else {
                navigate('/tools');
              }
            }} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Tools & Simulators
          </span>
          <span onClick={onViewResources} className="hover:text-white transition-colors cursor-pointer">Resources</span>
          {onViewAbout && <span onClick={onViewAbout} className="hover:text-white transition-colors cursor-pointer">About</span>}
          <span onClick={onOpenGuide} className="hover:text-white transition-colors cursor-pointer">Quick Guide</span>
          <Link 
            to="/status" 
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            System Status
          </Link>
          <Link 
            to="/bradley/mcp" 
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            Bradley MCP
          </Link>
          <Link 
            to="/teacher/mcp" 
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            Teacher MCP
          </Link>
          <Link 
            to="/termsofuse" 
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms of Use
          </Link>
          <Link 
            to="/privacypolicy" 
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Contact & Socials */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <a 
            href="mailto:support@begin-fin.com"
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[11px] font-semibold text-[#7F7FFA] tracking-wider flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" /> support@begin-fin.com
          </a>
          <a 
            href="https://www.instagram.com/begin_fin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-white/5 border border-white/10 rounded-full text-[#7F7FFA] hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            title="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a 
            href="https://www.linkedin.com/company/begin-fin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-white/5 border border-white/10 rounded-full text-[#7F7FFA] hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        {/* Footer Copyright */}
        <div className="pt-8 border-t border-white/10 w-full flex flex-col sm:flex-row justify-center items-center gap-3 text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase">
          <div>© 2026 BEGINFIN. ALL RIGHTS RESERVED.</div>
          <div className="hidden sm:block text-slate-700">•</div>
          <div>MADE WITH <span className="text-rose-500">❤️</span> IN TEXAS</div>
        </div>

      </div>
    </footer>
  );
};
