
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle, ChevronRight, ChevronDown, Award, Globe, BookOpen, Library, ShieldCheck, ArrowRight, DollarSign, Info, Users, Map, Search, Share2, FileText, CreditCard, TrendingUp, Home, Calendar, Clock, Zap, Newspaper, Heart, Menu, Star, Quote, User as UserSilhouette, ArrowUpRight, Gauge, Lightbulb, School, Coins, GraduationCap, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CookieBanner } from './CookieBanner';
import { Modal } from './Modal';
import { Language, uiTranslations } from '../data/uiTranslations';
import { User, db, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Article } from '../types';
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
  const [activeModal, setActiveModal] = useState<'map' | 'ios' | null>(null);
  const navigate = useNavigate();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const { notice } = useSystemStatus();
  const hasBanner = Boolean(notice && notice.show && (notice.title || notice.message));

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FA] text-[#3C3C3C] overflow-x-hidden">
      <main id="main-content" className="flex-grow">
      {/* Hero Section - Full-Screen Interactive Purple Background */}
      <section 
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-full overflow-hidden select-none cursor-default bg-gradient-to-br from-[#3b437e] via-[#353c70] to-[#252a55] ${hasBanner ? 'pt-44 sm:pt-52' : 'pt-32 sm:pt-36'} pb-16 sm:pb-24 min-h-[92vh] md:min-h-screen flex flex-col justify-center items-center`}
      >
        {/* Dynamic Interactive Cursor Tracking Glow - Fills Entire Hero Screen */}
        <div 
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(165, 180, 252, 0.35) 0%, rgba(99, 102, 241, 0.16) 45%, transparent 75%)`
          }}
        />

        {/* Hero Glow Backdrop - Fills Entire Hero Screen */}
        <div 
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(127, 127, 250, 0.32) 0%, rgba(104, 104, 235, 0.14) 45%, transparent 75%)`
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl xl:max-w-6xl mx-auto px-6 sm:px-12 text-center animate-in fade-in duration-700">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center px-6 py-2 sm:px-8 sm:py-2.5 bg-[#F4F8FA] text-[#3C3C3C] border border-[#7F7FFA]/20 rounded-full font-bold text-xs sm:text-sm md:text-base shadow-lg mb-8 md:mb-10 tracking-tight">
            Personal Finance Certification
          </div>

          {/* Main Headline */}
          <h1 
            id="hero-tagline"
            className="text-2xl min-[380px]:text-3xl sm:text-[1.85rem] md:text-4xl lg:text-[2.85rem] xl:text-[3.65rem] font-normal text-white mb-8 md:mb-10 tracking-tight leading-[1.2] sm:leading-tight md:leading-normal text-center w-full max-w-5xl mx-auto sm:whitespace-nowrap"
          >
            <span className="block sm:inline">Financial confidence </span>
            <span className="block sm:inline italic">starts here.</span>
          </h1>

          {/* Segmented Button Capsule */}
          <div className="flex items-center bg-black rounded-full p-1.5 shadow-2xl border border-white/10 mb-6">
            <button 
              onClick={user ? onStart : onLogin}
              className="px-6 py-3 sm:px-9 sm:py-3.5 bg-white text-black font-extrabold text-sm sm:text-base rounded-full hover:bg-slate-100 transition-all active:scale-[0.98] shadow-md flex items-center justify-center whitespace-nowrap cursor-pointer"
            >
              Get Started
            </button>

            <button 
              onClick={onStart}
              className="px-6 py-3 sm:px-9 sm:py-3.5 text-white font-extrabold text-sm sm:text-base rounded-full hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center whitespace-nowrap cursor-pointer"
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
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">Empowered since launch</p>
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
                    src="/press/literacy-texas.jpg"
                    alt="Literacy Texas"
                  />

                  {/* Temple Daily Telegram */}
                  <MediaLogoItem 
                    href="https://www.tdtnews.com/news/central_texas_news/article_47d078fc-2521-4f6f-aa27-a51c58e72187.html" 
                    title="Temple Daily Telegram"
                    src="/press/temple-daily-telegram.jpg"
                    alt="Temple Daily Telegram"
                  />

                  {/* KCEN TV */}
                  <MediaLogoItem 
                    href="https://www.kcentv.com/article/news/local/belton-isd-student-launch-financial-literacy-platform-beginfin/500-23379de3-4535-450b-8aa5-8d78d91b39f8" 
                    title="KCEN TV (NBC)"
                    src="/press/kcen-tv.png"
                    alt="KCEN TV"
                  />

                  {/* Jump$tart */}
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
