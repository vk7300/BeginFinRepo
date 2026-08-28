
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle, ChevronRight, ChevronDown, Award, Globe, BookOpen, Library, ShieldCheck, Mail, ArrowRight, DollarSign, Info, Users, Map, Search, Share2, FileText, CreditCard, TrendingUp, Home, Shield, Calendar, Clock, Zap, Newspaper, Heart, Menu, Star, Quote, User as UserSilhouette, Linkedin, ArrowUpRight, Instagram, Gauge, Lightbulb, School, Coins, GraduationCap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CookieBanner } from './CookieBanner';
import { Modal } from './Modal';
import { Language, uiTranslations, languageNames } from '../data/uiTranslations';
import { User, db, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Article } from '../types';

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
      className="h-8 md:h-9 w-auto max-w-[130px] max-h-9 object-contain rounded-md grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
      referrerPolicy="no-referrer" 
    />
  );

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0 h-9"
        title={title}
      >
        {imgElement}
      </a>
    );
  }

  return (
    <div className="group transition-all duration-300 flex items-center justify-center shrink-0 h-9" title={title}>
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
  language, 
  setLanguage, 
  user, 
  onLogin, 
  onLogout, 
  onOpenSettings, 
  onOpenGuide,
  modules 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<'map' | 'ios' | null>(null);
  const navigate = useNavigate();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const contentRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  const reviews = useMemo(() => {
    const raw = [
      { text: "I don’t know where I’d be without taking these courses.", connotation: 5, author: "Student from LBHS" },
      { text: "They taught me how to budget and how to pay my taxes.", connotation: 4, author: "Student from LBHS" },
      { text: "I now don’t have to depend on my parents to help me with this stuff.", connotation: 5, author: "Student from LBHS" },
      { text: "Taught me my rights and financial literacy.", connotation: 4, author: "Student from LBHS" },
      { text: "This is such a great website to help with financial literacy.", connotation: 5, author: "Student from LBHS" },
      { text: "They taught me how to compute compound interest, budget, and pay my taxes.", connotation: 4, author: "Student from LBHS" },
    ];
    return raw.map((r, idx) => {
      // Connotation determines standard rating, slight variation clamped 3-5
      const drift = Math.random() < 0.35 ? -1 : 0;
      const stars = Math.max(3, Math.min(5, r.connotation + drift));
      return {
        id: idx,
        text: r.text,
        stars,
        name: r.author
      };
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        const queryPath = 'articles';
        const q = query(
          collection(db, queryPath), 
          where('status', '==', 'published'),
          where('isFeatured', '==', true)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
          docs.sort((a, b) => {
            const timeA = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.updatedAt || 0).getTime();
            const timeB = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.updatedAt || 0).getTime();
            return timeA - timeB;
          });
          setFeaturedArticles(docs);
        } else {
          // Fallback to latest article if none featured
          const fallbackQ = query(
            collection(db, queryPath),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc'),
            limit(1)
          );
          const fallbackSnapshot = await getDocs(fallbackQ);
          if (!fallbackSnapshot.empty) {
            setFeaturedArticles(fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
          }
        }
      } catch (err) {
        console.error("Error fetching featured articles:", err);
        if (err instanceof Error && err.message.toLowerCase().includes('permission')) {
          try {
            handleFirestoreError(err, OperationType.GET, 'articles');
          } catch (e) {
            // Logged
          }
        }
      }
    };
    fetchFeaturedArticles();
  }, []);

  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentArticleIndex(prev => (prev + 1) % featuredArticles.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  const t = uiTranslations[language];

  const benefits = [
    { 
      title: 'Media Recognized', 
      desc: 'By regional outlets like FOX44 and KCEN TV', 
      icon: <Newspaper className="w-5 h-5" /> 
    },
    { 
      title: 'Visitors Worldwide', 
      desc: 'In over 25+ countries', 
      icon: <Globe className="w-5 h-5" /> 
    },
    { 
      title: 'Standards-Aligned', 
      desc: 'Vetted for alignment with national standards', 
      icon: <ShieldCheck className="w-5 h-5" /> 
    },
    { 
      title: 'Credentialed Outcomes', 
      desc: 'LinkedIn-addable badge', 
      icon: <Award className="w-5 h-5" /> 
    }
  ];

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FA] text-[#3C3C3C] overflow-x-hidden">
      {/* Glassmorphic Header */}
      <header>
        <nav className={`fixed left-3 right-3 sm:left-4 sm:right-4 z-[150] max-w-6xl mx-auto transition-all duration-500 transform-gpu ${
          isScrolled 
            ? 'top-3 sm:top-4 bg-white/95 backdrop-blur-xl shadow-lg py-2 sm:py-2.5 px-3.5 sm:px-6 border-slate-200/70' 
            : 'top-3.5 sm:top-5 bg-[#0d0f18]/90 backdrop-blur-2xl border-white/15 shadow-2xl py-2 sm:py-3 px-3.5 sm:px-6'
        } border rounded-full flex items-center justify-between`}>
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img 
            src="https://media.licdn.com/dms/image/v2/D560BAQHnYQWitFITCg/company-logo_100_100/B56Z8a8HsJHUAI-/0/1782863395852/begin_fin_logo?e=1789603200&v=beta&t=soL_gMehzor_b0etxBts8yvUj1R5KENX3NvnUCvSH34" 
            alt="BeginFin Logo" 
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-xl shadow-sm" 
            referrerPolicy="no-referrer" 
          />
          <span className={`font-extrabold tracking-tight text-lg sm:text-xl ${isScrolled ? 'text-[#3C3C3C]' : 'text-white'}`}>BeginFin</span>
        </div>

        <div className="hidden lg:flex items-center gap-7">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`text-[11px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-[#3C3C3C] hover:text-[#7F7FFA]' : 'text-slate-200 hover:text-white'} transition-colors`}>HOME</button>
          <button onClick={onViewCurriculum} className={`text-[11px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-[#3C3C3C] hover:text-[#7F7FFA]' : 'text-slate-200 hover:text-white'} transition-colors`}>CURRICULUM</button>
          <button 
            onClick={() => {
              if (onViewTools) onViewTools();
              else navigate('/tools');
            }} 
            className={`text-[11px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-[#3C3C3C] hover:text-[#7F7FFA]' : 'text-slate-200 hover:text-white'} transition-colors`}
          >
            TOOLS
          </button>
          <button onClick={onViewResources} className={`text-[11px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-[#3C3C3C] hover:text-[#7F7FFA]' : 'text-slate-200 hover:text-white'} transition-colors`}>RESOURCES</button>
          {onViewAbout && <button onClick={onViewAbout} className={`text-[11px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-[#3C3C3C] hover:text-[#7F7FFA]' : 'text-slate-200 hover:text-white'} transition-colors`}>ABOUT</button>}
          <button onClick={onOpenGuide} className={`text-[11px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-[#7F7FFA] bg-[#F4F8FA] hover:bg-[#ECECFC]' : 'text-white bg-[#222536] hover:bg-[#2c3046] border border-white/5'} transition-all px-4 py-1.5 rounded-full shadow-sm`}>
            GUIDE
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button 
            onClick={user ? onStart : onLogin}
            className="bg-[#7F7FFA] text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full font-bold sm:font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wide sm:tracking-wider shadow-md hover:bg-[#6868EB] transition-all active:scale-95 whitespace-nowrap"
          >
            {user ? 'CONTINUE' : 'GET STARTED'}
          </button>

          {!user ? (
            <button 
              onClick={onStart}
              className={`hidden sm:flex items-center px-4 py-2 rounded-full border ${isScrolled ? 'border-slate-200 bg-white/80 text-[#3C3C3C]' : 'border-white/30 bg-white/10 text-white'} backdrop-blur-md hover:bg-white/20 transition-all text-[11px] font-extrabold uppercase tracking-wider`}
            >
              GUEST MODE
            </button>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 ${isScrolled ? 'bg-[#F4F8FA] border-slate-200' : 'bg-[#181b2a] border-white/20'} backdrop-blur-md px-3 py-1.5 rounded-full border hover:bg-white/20 transition-all`}
              >
                <div className="w-5 h-5 rounded-full bg-[#7F7FFA] flex items-center justify-center text-[9px] font-bold text-white uppercase">
                  {user.displayName?.[0] || 'U'}
                </div>
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-[#3C3C3C]' : 'text-white'} hidden sm:inline`}>
                  {user.displayName?.split(' ')[0]}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 w-40 z-[160] overflow-hidden">
                  <button 
                    onClick={() => {
                      onOpenSettings();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[10px] font-bold text-[#3C3C3C] hover:bg-[#F4F8FA] transition-colors flex items-center gap-2"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => { onLogout(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`lg:hidden p-2 sm:p-2.5 rounded-full ${isScrolled ? 'text-[#3C3C3C] border-slate-200/40 bg-white/50' : 'text-white border-white/20 bg-white/10'} hover:bg-white/20 transition-all flex items-center justify-center border shrink-0`}
            aria-label="Toggle Mobile Menu"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 z-[140] bg-slate-950/20 backdrop-blur-sm"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            {/* Drawer */}
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed inset-x-4 top-20 z-[145] bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 lg:hidden flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2c5282]">Navigation Menu</span>
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                >
                  <Home className="w-4 h-4 shrink-0" /> Home
                </button>
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    onViewCurriculum();
                  }} 
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                >
                  <BookOpen className="w-4 h-4 shrink-0" /> Curriculum
                </button>
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    if (onViewTools) onViewTools();
                    else navigate('/tools');
                  }} 
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                >
                  <Sparkles className="w-4 h-4 shrink-0" /> Tools & Simulators
                </button>
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    onViewResources();
                  }} 
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA] transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <Library className="w-4 h-4 shrink-0" /> Resources
                </button>
                {onViewAbout && (
                  <button 
                    onClick={() => {
                      setShowMobileMenu(false);
                      onViewAbout();
                    }} 
                    className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <Users className="w-4 h-4 shrink-0" /> About
                  </button>
                )}
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenGuide();
                  }} 
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#7F7FFA] bg-[#F4F8FA] hover:bg-[#7F7FFA]/10 transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 shrink-0 text-[#7F7FFA]" /> Guide
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </header>

      <main id="main-content" className="flex-grow">
      {/* Hero Outer Wrapper */}
      <section className="relative bg-gradient-to-b from-[#2b2d35] via-[#1a1c22] to-[#101115] pt-28 pb-14 px-4 sm:px-6 lg:px-8 min-h-[90vh] md:min-h-screen flex flex-col justify-center items-center">
        
        {/* Rounded-Corner Hero Box Container */}
        <div 
          ref={sectionRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full max-w-6xl rounded-[2.5rem] md:rounded-[3.2rem] bg-gradient-to-br from-[#3b437e] via-[#353c70] to-[#252a55] border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden select-none cursor-default py-16 sm:py-20 md:py-24 px-6 sm:px-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700"
        >
          {/* Dynamic Interactive Cursor Tracking Glow */}
          <div 
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle 650px at ${mousePosition.x}px ${mousePosition.y}px, rgba(165, 180, 252, 0.28) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 75%)`
            }}
          />

          {/* Hero Glow Backdrop */}
          <div 
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle 650px at ${mousePosition.x}px ${mousePosition.y}px, rgba(127, 127, 250, 0.28) 0%, rgba(104, 104, 235, 0.12) 45%, transparent 75%)`
            }}
          />

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center px-6 py-2 sm:px-8 sm:py-2.5 bg-[#F4F8FA] text-[#3C3C3C] border border-[#7F7FFA]/20 rounded-full font-bold text-xs sm:text-sm md:text-base shadow-lg mb-8 md:mb-10 tracking-tight">
              Personal Finance Certification
            </div>

            {/* Main Headline (One line) */}
            <h1 className="text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.75rem] font-extrabold text-white mb-8 md:mb-10 tracking-tight leading-tight text-center w-full max-w-5xl mx-auto whitespace-nowrap">
              Financial literacy <span className="italic font-normal">for all.</span>
            </h1>

            {/* Segmented Button Capsule */}
            <div className="flex items-center bg-black rounded-full p-1.5 shadow-2xl border border-white/10 mb-6">
              <button 
                onClick={user ? onStart : onLogin}
                className="px-6 py-3 sm:px-9 sm:py-3.5 bg-white text-black font-extrabold text-sm sm:text-base rounded-full hover:bg-slate-100 transition-all active:scale-[0.98] shadow-md flex items-center justify-center whitespace-nowrap"
              >
                Get Started
              </button>

              <button 
                onClick={onStart}
                className="px-6 py-3 sm:px-9 sm:py-3.5 text-white font-extrabold text-sm sm:text-base rounded-full hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center whitespace-nowrap"
              >
                Guest Mode
              </button>
            </div>
            
            {/* Terms Disclaimer Subtext */}
            <p className="text-slate-300/85 text-xs sm:text-sm font-medium tracking-tight">
              By proceeding, you agree to our{' '}
              <Link to="/termsofuse" className="font-bold text-white hover:underline transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacypolicy" className="font-bold text-white hover:underline transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        {/* Cookie Notice Preserved */}
        <CookieBanner />
      </section>

      {/* Impact & Media Recognition Bento Grid */}
      <section className="pt-8 pb-4 md:pt-10 md:pb-6 bg-[#F4F8FA] border-t border-slate-200/60 relative z-20">
        <div className="container mx-auto px-6 max-w-6xl space-y-5">

          {/* Metrics & Media Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Bento Metric 1 */}
            <div className="md:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 hover:shadow-[0_12px_35px_rgba(127,127,250,0.12)] transition-all duration-500 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-[#F4F8FA] rounded-xl border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-normal text-[#3C3C3C] tracking-tight">10,000+</h3>
                  <p className="text-xs font-semibold text-[#3C3C3C] mt-1">Unique Visitors</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">Empowered since launch in 2026</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Bento Metric 2 - Dark Gradient Featured */}
            <div className="md:col-span-4 bg-gradient-to-br from-slate-950 via-[#0d1029] to-slate-900 text-white p-8 rounded-[2rem] shadow-xl border border-slate-800 hover:border-[#7F7FFA]/40 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-[#7F7FFA]/20 rounded-full blur-2xl group-hover:bg-[#7F7FFA]/30 transition-all duration-500" />
              
              <div className="space-y-4 relative z-10">
                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-normal text-white tracking-tight">8 Units</h3>
                  <p className="text-xs font-semibold text-indigo-200 mt-1">National Standards Aligned</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-normal">Aligned with CEE and Jump$tart.</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end relative z-10">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Bento Metric 3 */}
            <div className="md:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 hover:shadow-[0_12px_35px_rgba(127,127,250,0.12)] transition-all duration-500 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-[#F4F8FA] rounded-xl border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-normal text-[#3C3C3C] tracking-tight">25+</h3>
                  <p className="text-xs font-semibold text-[#3C3C3C] mt-1">Countries Reached</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">Spreading financial literacy globally</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <Globe className="w-3.5 h-3.5 text-[#7F7FFA]" />
              </div>
            </div>

            {/* Bento Card 4: Media & Press Row */}
            <div className="md:col-span-12 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/30 transition-all duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left shrink-0">
                  <h4 className="text-lg font-medium text-[#3C3C3C] tracking-tight">Featured by</h4>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-8">
                  {/* Literacy Texas */}
                  <MediaLogoItem 
                    href="https://www.instagram.com/p/DYZuVOcnGEB/" 
                    title="Literacy Texas"
                    src="https://www.literacytexas.org/wp-content/uploads/literacy-texas-logo.jpg"
                    alt="Literacy Texas"
                  />

                  {/* Temple Daily Telegram */}
                  <MediaLogoItem 
                    href="https://www.tdtnews.com/news/central_texas_news/article_47d078fc-2521-4f6f-aa27-a51c58e72187.html" 
                    title="Temple Daily Telegram"
                    src="https://media.licdn.com/dms/image/v2/C560BAQGPLHhas9gbCQ/company-logo_200_200/company-logo_200_200/0/1647986352845/temple_daily_telegram_logo?e=2147483647&v=beta&t=6Hios5svRkG-smp5s2iCSRiipIBBvMqBqBfwKAlxpC4"
                    alt="Temple Daily Telegram"
                  />

                  {/* KCEN TV */}
                  <MediaLogoItem 
                    href="https://www.kcentv.com/article/news/local/belton-isd-student-launch-financial-literacy-platform-beginfin/500-23379de3-4535-450b-8aa5-8d78d91b39f8" 
                    title="KCEN TV (NBC)"
                    src="https://yt3.googleusercontent.com/859DfZu1p9946RUWnCBaryuftO2zxsBadlF0F7oDcz_I-7PvHK-2lK2OI_WpiQQf5z__Wo0o=s900-c-k-c0x00ffffff-no-rj"
                    alt="KCEN TV"
                  />

                  {/* Jump$tart */}
                  <MediaLogoItem 
                    href="https://jumpstartclearinghouse.org/resource/beginfin-financial-literacy-certification/" 
                    title="Jump$tart Clearinghouse"
                    src="https://www.nationaldisabilityinstitute.org/wp-content/uploads/2019/04/jumpstart-kids-logo.jpg"
                    alt="Jump$tart Clearinghouse"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Platform Features Bento Grid */}
      <section ref={contentRef} className="pt-8 pb-16 md:pt-10 md:pb-24 px-6 bg-[#F4F8FA] border-t border-slate-200/60">
        <div className="container mx-auto max-w-6xl space-y-12">
          
          <div className="space-y-3 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-normal text-[#3C3C3C] tracking-tight leading-tight">
              Structured for mastery.
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-normal max-w-xl mx-auto">
              Every tool and module is crafted to build lasting financial confidence.
            </p>
          </div>

          {/* Apple-style Product Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Feature Bento 1: Large Featured Dark Gradient Card */}
            <div className="lg:col-span-8 bg-gradient-to-br from-slate-950 via-[#0d1029] to-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#7F7FFA]/15 rounded-full blur-3xl group-hover:bg-[#7F7FFA]/25 transition-all duration-700 pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-[#7F7FFA]">
                  <BookOpen className="w-6 h-6" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7F7FFA]">8 Units</span>
                  <h3 className="text-2xl md:text-4xl font-normal text-white tracking-tight leading-snug">
                    National Standards-Aligned Curriculum
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 font-normal leading-relaxed">
                    Master paychecks, taxes, 50/30/20 budgeting, credit building, compound interest, ETFs, and long-term retirement strategy.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-semibold text-white">
                    Free Forever
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> No Credit Card Required
                  </span>
                </div>

                <button 
                  onClick={onViewCurriculum}
                  className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-medium text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5 active:scale-95 shadow-md cursor-pointer"
                >
                  <span>Explore Units</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Feature Bento 2: Light Calculator Card */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 bg-[#F4F8FA] rounded-2xl border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                  <Lightbulb className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7F7FFA]">Interactive Tools</span>
                  <h3 className="text-xl md:text-2xl font-normal text-[#3C3C3C] tracking-tight">
                    Financial Calculators & Simulations
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Real-world scenarios for budgeting, compound interest, debt payoff, and paychecks.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hands-On Practice</span>
                <ChevronRight className="w-4 h-4 text-[#7F7FFA] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Bento 3: Light Credential Card */}
            <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 bg-[#F4F8FA] rounded-2xl border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                  <Award className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7F7FFA]">Verified Outcome</span>
                  <h3 className="text-xl md:text-2xl font-normal text-[#3C3C3C] tracking-tight">
                    LinkedIn-Shareable Certificate
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Earn an official certificate of financial literacy upon completing the 8 core modules.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
                <Award className="w-4 h-4 text-[#7F7FFA]" />
              </div>
            </div>

            {/* Feature Bento 4: Dark CTA Callout */}
            <div className="lg:col-span-7 bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 text-center sm:text-left relative z-10 max-w-sm">
                <h3 className="text-xl md:text-2xl font-normal text-white tracking-tight">
                  Ready to build financial confidence?
                </h3>
                <p className="text-xs text-slate-400 font-normal">
                  No installation or credit card required. Use guest mode or create a free account.
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10 shrink-0">
                <button 
                  onClick={onStart}
                  className="px-7 py-3 bg-white text-slate-900 rounded-full font-medium text-xs hover:bg-slate-100 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  Start Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Student Reviews Bento */}
      <section className="py-16 md:py-24 px-6 bg-[#F4F8FA] border-t border-slate-200/60">
        <div className="container mx-auto max-w-6xl space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-normal text-[#3C3C3C] tracking-tight">
              Real results from real learners.
            </h2>
          </div>

          {/* Student Quote Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.slice(0, 3).map((rev) => (
              <div key={rev.id} className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#7F7FFA]">
                    {[...Array(rev.stars)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-[#7F7FFA] text-[#7F7FFA]" />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-[#3C3C3C] font-normal leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{rev.name}</span>
                  <span className="text-[#7F7FFA] font-semibold">Verified Learner</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      </main>

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
