import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, BookOpen, SlidersHorizontal, Sparkles, GraduationCap } from 'lucide-react';
import { CookieBanner } from './CookieBanner';
import { Language } from '../data/uiTranslations';
import { User } from '../firebase';
import { useSystemStatus } from '../services/systemStatusService';
import { Footer } from './Footer';

interface Props {
  onStart: () => void;
  onViewCurriculum: () => void;
  onViewResources: () => void;
  onViewAbout?: () => void;
  onViewTools?: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  modules: any[];
}

// Media logo helper component for press images & logos
interface MediaLogoItemProps {
  href?: string;
  title: string;
  src: string;
  alt: string;
}

const MediaLogoItem: React.FC<MediaLogoItemProps> = ({ href, title, src, alt }) => {
  const imgElement = (
    <img 
      src={src} 
      alt={alt} 
      className="h-7 sm:h-8 w-auto max-w-[120px] max-h-8 object-contain rounded-md grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
      referrerPolicy="no-referrer" 
    />
  );

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0 h-8"
        title={title}
      >
        {imgElement}
      </a>
    );
  }

  return (
    <div className="flex items-center justify-center shrink-0 h-8" title={title}>
      {imgElement}
    </div>
  );
};

export const WelcomeScreen: React.FC<Props> = ({ 
  onStart, 
  onViewCurriculum, 
  onViewResources,
  onViewAbout,
  onViewTools,
  user, 
  onLogin, 
  onOpenGuide
}) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const contrastRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const { notice } = useSystemStatus();
  const hasBanner = Boolean(notice && notice.show && (notice.title || notice.message));

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden bg-[#3C3C3C]">
      <main id="main-content" className="flex-grow">
        
        {/* ========================================================= */}
        {/* SECTION 1: HERO                                           */}
        {/* Gradient: BeginFin Iris Pulse (#7F7FFA) --> Slate Grey    */}
        {/* ========================================================= */}
        <section 
          ref={heroRef}
          onMouseMove={handleMouseMove}
          className={`relative w-full overflow-hidden select-none cursor-default bg-gradient-to-b from-[#7F7FFA] via-[#7575FA] to-[#3C3C3C] ${
            hasBanner ? 'pt-36 sm:pt-48 md:pt-52' : 'pt-28 sm:pt-36 md:pt-40'
          } pb-16 sm:pb-24 md:pb-28 min-h-[90vh] sm:min-h-[92vh] flex flex-col justify-center items-center text-center px-4 sm:px-6`}
        >
          {/* Fluid Ambient Glow that tracks mouse cursor */}
          <div 
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle 750px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.16) 0%, rgba(127, 127, 250, 0.08) 40%, transparent 75%)`
            }}
          />

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
            
            {/* Centered Logo Badge */}
            <div className="inline-flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <img 
                src="/logo.png" 
                alt="BeginFin Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl shadow-md p-1 bg-white" 
                referrerPolicy="no-referrer" 
              />
              <span className="text-white text-xl sm:text-2xl md:text-3xl font-serif font-normal tracking-tight">
                BeginFin
              </span>
            </div>

            {/* Headline */}
            <h1 
              id="hero-tagline"
              className="text-3xl min-[360px]:text-4xl min-[480px]:text-5xl sm:text-6xl md:text-7xl font-normal text-white tracking-tight leading-[1.14] font-serif mb-6 sm:mb-8 max-w-3xl mx-auto px-1"
            >
              <span className="block">Financial Confidence</span>
              <span className="block italic mt-1 sm:mt-2">Starts Here</span>
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5 mb-6 w-full max-w-xs sm:max-w-none px-2">
              <button 
                type="button"
                onClick={user ? onStart : onLogin}
                className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 sm:px-10 sm:py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-full font-semibold text-sm sm:text-base transition-all active:scale-[0.98] shadow-xl hover:shadow-2xl cursor-pointer text-center flex items-center justify-center"
              >
                Get Started
              </button>

              <button 
                type="button"
                onClick={onStart}
                className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 sm:px-10 sm:py-4 bg-white hover:bg-slate-50 text-slate-950 rounded-full font-semibold text-sm sm:text-base transition-all active:scale-[0.98] shadow-xl hover:shadow-2xl cursor-pointer text-center flex items-center justify-center"
              >
                Guest Mode
              </button>
            </div>

            {/* Terms Disclaimer Subtext */}
            <p className="text-white/80 text-xs sm:text-sm font-normal tracking-tight mb-8 sm:mb-12 max-w-md px-2">
              By proceeding, you agree to our{' '}
              <Link to="/termsofuse" className="underline hover:text-white transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacypolicy" className="underline hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </p>

            {/* Downward Chevron */}
            <button 
              type="button"
              onClick={() => contrastRef.current?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Scroll to next section"
              className="text-white/70 hover:text-white transition-colors p-2.5 rounded-full hover:bg-white/10 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>

          </div>

          <CookieBanner />
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: CONTRAST / PAIN POINTS                         */}
        {/* Gradient: Slate Grey (#3C3C3C) --> Slate Grey Solid       */}
        {/* Transitioning at bottom into BeginFin Iris Pulse          */}
        {/* ========================================================= */}
        <section 
          ref={contrastRef}
          className="relative w-full bg-gradient-to-b from-[#3C3C3C] via-[#3C3C3C] to-[#7F7FFA] py-14 sm:py-24 md:py-28 px-4 sm:px-8 md:px-14 text-white"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Pain points with gradual gradient from #7F7FFA to white */}
            <div className="lg:col-span-5 space-y-1.5 sm:space-y-3 text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.2] sm:leading-[1.22] font-serif font-normal select-none">
              <div style={{ color: '#7F7FFA' }}>Paywalls.</div>
              <div style={{ color: '#9494FB' }}>Ad breaks.</div>
              <div style={{ color: '#AAAAFC' }}>Outdated info.</div>
              <div style={{ color: '#BFBFFD' }}>No certificate.</div>
              <div style={{ color: '#D4D4FD' }}>Boring lectures.</div>
              <div style={{ color: '#EAEAFE' }}>No Interactives.</div>
              <div style={{ color: '#FFFFFF' }} className="italic pt-1 sm:pt-2">And other gaps.</div>
            </div>

            {/* Right Column: White Card + Featured Logos */}
            <div className="lg:col-span-7 flex flex-col">
              
              {/* White Card */}
              <div className="bg-white rounded-[1.75rem] sm:rounded-[2.25rem] p-6 sm:p-10 shadow-2xl text-slate-900 border border-white/20">
                <h2 className="text-xl min-[400px]:text-2xl sm:text-3xl md:text-4xl font-normal text-[#3C3C3C] font-serif leading-snug tracking-tight mb-6 sm:mb-8">
                  A free foundation<br />
                  in personal finance,<br />
                  <span className="italic">without the gaps.</span>
                </h2>

                {/* 3 Pills */}
                <div className="space-y-3 sm:space-y-3.5">
                  <div className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-full border-2 border-[#7F7FFA] text-[#3C3C3C] font-semibold text-center text-xs min-[380px]:text-sm sm:text-base hover:bg-[#7F7FFA]/5 transition-colors">
                    Free with zero ads
                  </div>
                  <div className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-full border-2 border-[#7F7FFA] text-[#3C3C3C] font-semibold text-center text-xs min-[380px]:text-sm sm:text-base hover:bg-[#7F7FFA]/5 transition-colors">
                    10,000+ Unique Visitors
                  </div>
                  <div className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-full border-2 border-[#7F7FFA] text-[#3C3C3C] font-semibold text-center text-xs min-[380px]:text-sm sm:text-base hover:bg-[#7F7FFA]/5 transition-colors">
                    25+ countries reached
                  </div>
                </div>
              </div>

              {/* Featured by Press Capsule beneath the card */}
              <div className="mt-4 sm:mt-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:py-3.5 sm:px-6 shadow-lg border border-white/40 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <span className="font-serif italic text-sm sm:text-base text-slate-700 font-normal shrink-0">
                  Featured by
                </span>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <MediaLogoItem 
                    href="https://www.tdtnews.com/news/central_texas_news/article_47d078fc-2521-4f6f-aa27-a51c58e72187.html" 
                    title="Temple Daily Telegram"
                    src="/press/temple-daily-telegram.jpg"
                    alt="Temple Daily Telegram"
                  />
                  <MediaLogoItem 
                    href="https://www.kcentv.com/article/news/local/belton-isd-student-launch-financial-literacy-platform-beginfin/500-23379de3-4535-450b-8aa5-8d78d91b39f8" 
                    title="KCEN TV (NBC)"
                    src="/press/kcen-tv.png"
                    alt="KCEN TV"
                  />
                  <MediaLogoItem 
                    href="https://www.instagram.com/p/DYZuVOcnGEB/" 
                    title="Literacy Texas"
                    src="/press/literacy-texas.jpg"
                    alt="Literacy Texas"
                  />
                  <MediaLogoItem 
                    href="https://jumpstartclearinghouse.org/resource/beginfin-financial-literacy-certification/" 
                    title="Jump$tart Clearinghouse"
                    src="/press/jumpstart.png"
                    alt="Jump$tart Clearinghouse"
                  />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: FEATURES GRID                                  */}
        {/* Gradient: BeginFin Iris Pulse (#7F7FFA) continued         */}
        {/* Flowing seamlessly down towards Slate Grey at footer      */}
        {/* ========================================================= */}
        <section className="relative w-full bg-gradient-to-b from-[#7F7FFA] via-[#8B8BFA] to-[#7F7FFA] py-14 sm:py-24 md:py-28 px-4 sm:px-8 md:px-14 text-white">
          <div className="max-w-6xl mx-auto">
            
            {/* Section Title */}
            <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight text-center font-serif mb-8 sm:mb-14 md:mb-16 px-2">
              Built by students, <span className="italic">for students.</span>
            </h2>

            {/* 2x2 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              
              {/* Card 1: Curriculum */}
              <div 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (onViewCurriculum) onViewCurriculum();
                  else navigate('/curriculum');
                }}
                className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
              >
                <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[#7F7FFA] group-hover:scale-110 transition-transform mb-5 sm:mb-6" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-normal text-[#3C3C3C] leading-snug font-serif">
                  A curriculum that meets national standards
                </h3>
              </div>

              {/* Card 2: Interactives */}
              <div 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (onViewTools) onViewTools();
                  else navigate('/tools');
                }}
                className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
              >
                <SlidersHorizontal className="w-7 h-7 sm:w-8 sm:h-8 text-[#7F7FFA] group-hover:scale-110 transition-transform mb-5 sm:mb-6" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-normal text-[#3C3C3C] leading-snug font-serif">
                  Interactives to help you visualize personal finances
                </h3>
              </div>

              {/* Card 3: AI / MCP */}
              <div 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/mcp');
                }}
                className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
              >
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#7F7FFA] group-hover:scale-110 transition-transform mb-5 sm:mb-6" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-normal text-[#3C3C3C] leading-snug font-serif">
                  Stuck? Get help in your preferred AI tools, via MCP and SSE
                </h3>
              </div>

              {/* Card 4: For Teachers */}
              <div 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/teacher');
                }}
                className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
              >
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-[#7F7FFA] group-hover:scale-110 transition-transform mb-5 sm:mb-6" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-normal text-[#3C3C3C] leading-snug font-serif">
                  For teachers: <span className="italic">a full suite of classroom-ready tools.</span>
                </h3>
              </div>

            </div>

          </div>
        </section>

        {/* Transition zone: Iris Pulse flowing into Slate Grey footer */}
        <div className="w-full h-16 sm:h-24 bg-gradient-to-b from-[#7F7FFA] to-[#3C3C3C]" />

      </main>

      {/* ========================================================= */}
      {/* SECTION 4: FOOTER                                         */}
      {/* Ending with Slate Grey                                    */}
      {/* ========================================================= */}
      <Footer 
        onViewCurriculum={onViewCurriculum}
        onViewResources={onViewResources}
        onViewAbout={onViewAbout}
        onViewTools={onViewTools}
        onOpenGuide={onOpenGuide}
      />

    </div>
  );
};
