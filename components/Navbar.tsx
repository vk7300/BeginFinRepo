import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronRight, 
  AlertTriangle, 
  Info, 
  Home, 
  BookOpen, 
  Sparkles, 
  Library, 
  Users, 
  Terminal, 
  Activity, 
  Settings, 
  LogOut,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { User } from '../firebase';
import { useSystemStatus } from '../services/systemStatusService';
import { isEmailAdmin } from '../config/adminConfig';

export interface NavbarProps {
  user: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onStart?: () => void;
  onOpenSettings?: () => void;
  onViewCurriculum?: () => void;
  onViewTools?: () => void;
  onViewResources?: () => void;
  onViewAbout?: () => void;
  onOpenGuide?: () => void;
  currentView?: string;
  variant?: 'auto' | 'light';
}

export const useNavPadding = (isHero: boolean = false) => {
  const { notice } = useSystemStatus();
  const hasBanner = isHero && Boolean(notice && notice.show && (notice.title || notice.message));
  return hasBanner ? 'pt-36 sm:pt-40' : 'pt-24 sm:pt-28';
};

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  onStart,
  onOpenSettings,
  onViewCurriculum,
  onViewTools,
  onViewResources,
  onViewAbout,
  onOpenGuide,
  currentView,
  variant = 'auto'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pathname = location.pathname.toLowerCase();
  const isHero = (pathname === '/' || pathname === '') && (currentView === 'welcome' || !currentView);

  const { notice } = useSystemStatus();
  // Status alert is strictly shown ONLY on the hero view; removed in all other tabs
  const hasBanner = isHero && Boolean(notice && notice.show && (notice.title || notice.message));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // For 'light' variant (all non-welcome views), always render in the crisp light pill theme
  const effectiveIsScrolled = variant === 'light' ? true : isScrolled;

  const isHomeActive = (pathname === '/' || pathname === '') && (currentView === 'welcome' || !currentView);
  const isCurriculumActive = pathname.startsWith('/curriculum') || currentView === 'curriculum';
  const isToolsActive = pathname.startsWith('/tools') || pathname.startsWith('/simulator') || currentView === 'tools';
  const isResourcesActive = pathname.startsWith('/resources') || currentView === 'resources';
  const isAboutActive = pathname.startsWith('/about') || currentView === 'about';
  const isGuideActive = pathname.startsWith('/guide') || currentView === 'guide';

  const handleGoHome = () => {
    setShowMobileMenu(false);
    if (pathname === '/' || currentView === 'welcome') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoCurriculum = () => {
    setShowMobileMenu(false);
    if (onViewCurriculum) {
      onViewCurriculum();
    } else {
      navigate('/curriculum');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoTools = () => {
    setShowMobileMenu(false);
    if (onViewTools) {
      onViewTools();
    } else {
      navigate('/tools');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoResources = () => {
    setShowMobileMenu(false);
    if (onViewResources) {
      onViewResources();
    } else {
      navigate('/resources');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoAbout = () => {
    setShowMobileMenu(false);
    if (onViewAbout) {
      onViewAbout();
    } else {
      navigate('/about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoGuide = () => {
    setShowMobileMenu(false);
    if (onOpenGuide) {
      onOpenGuide();
    } else {
      navigate('/guide');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthAction = () => {
    if (user) {
      if (onStart) onStart();
      else navigate('/app');
    } else {
      if (onLogin) onLogin();
      else navigate('/app');
    }
  };

  const handleGuestAction = () => {
    if (onStart) onStart();
    else navigate('/app');
  };

  return (
    <>
      {/* System Status Announcement Banner (Always sits above menu bar without covering it) */}
      {hasBanner && notice && (
        <aside 
          aria-label="System status notice"
          className={`fixed left-3 right-3 sm:left-4 sm:right-4 z-[170] max-w-6xl mx-auto top-2 sm:top-2.5 rounded-full border shadow-xl flex items-center justify-between gap-3 px-3.5 sm:px-6 py-2 sm:py-2.5 backdrop-blur-2xl transition-all duration-300 ${
            notice.type === 'alert' 
              ? 'bg-rose-600/95 text-white border-rose-300/40 shadow-rose-950/25' 
              : notice.type === 'warning'
              ? 'bg-amber-500/95 text-slate-950 border-amber-300/60 shadow-amber-950/25' 
              : notice.type === 'success'
              ? 'bg-emerald-600/95 text-white border-emerald-300/40 shadow-emerald-950/25' 
              : 'bg-[#7F7FFA]/95 text-white border-indigo-200/40 shadow-indigo-950/25'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className={`p-1 rounded-full shrink-0 flex items-center justify-center ${
              notice.type === 'warning' ? 'bg-black/10 text-slate-950' : 'bg-white/20 text-white'
            }`}>
              {notice.type === 'alert' || notice.type === 'warning' ? (
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              ) : (
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 min-w-0 text-xs sm:text-[13px] leading-tight truncate">
              {notice.title && (
                <span className="font-extrabold uppercase tracking-wide shrink-0">
                  {notice.title}:
                </span>
              )}
              <span className="font-medium truncate opacity-95">
                {notice.message}
              </span>
            </div>
          </div>
          <Link 
            to="/status" 
            className={`inline-flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 transition-all shadow-sm active:scale-95 whitespace-nowrap ${
              notice.type === 'warning'
                ? 'bg-slate-950 text-white hover:bg-slate-800'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>View Details</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </aside>
      )}

      {/* Persistent Menu Bar */}
      <header aria-label="Main Site Navigation">
        <nav 
          id="main-nav-bar"
          className={`fixed left-3 right-3 sm:left-4 sm:right-4 z-[150] max-w-6xl mx-auto transition-all duration-300 transform-gpu ${
            hasBanner
              ? (effectiveIsScrolled 
                  ? 'top-16 sm:top-[4.5rem] bg-white/95 backdrop-blur-xl shadow-lg py-2 sm:py-2.5 px-3.5 sm:px-6 border-slate-200/70' 
                  : 'top-16 sm:top-[4.75rem] bg-[#0d0f18]/90 backdrop-blur-2xl border-white/15 shadow-2xl py-2 sm:py-3 px-3.5 sm:px-6')
              : (effectiveIsScrolled 
                  ? 'top-3 sm:top-4 bg-white/95 backdrop-blur-xl shadow-lg py-2 sm:py-2.5 px-3.5 sm:px-6 border-slate-200/70' 
                  : 'top-3.5 sm:top-5 bg-[#0d0f18]/90 backdrop-blur-2xl border-white/15 shadow-2xl py-2 sm:py-3 px-3.5 sm:px-6')
          } border rounded-full flex items-center justify-between`}
        >
          {/* Brand Logo & Name */}
          <button 
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-2 cursor-pointer shrink-0 text-left focus:outline-hidden"
            aria-label="BeginFin Home"
          >
            <img 
              src="/logo.png" 
              alt="BeginFin Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-xl shadow-xs" 
              referrerPolicy="no-referrer" 
            />
            <span className={`font-extrabold tracking-tight text-lg sm:text-xl transition-colors ${
              effectiveIsScrolled ? 'text-[#3C3C3C]' : 'text-white'
            }`}>
              BeginFin
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-7">
            <button 
              type="button"
              onClick={handleGoHome} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                effectiveIsScrolled 
                  ? (isHomeActive ? 'text-[#7F7FFA]' : 'text-[#3C3C3C] hover:text-[#7F7FFA]') 
                  : (isHomeActive ? 'text-[#7F7FFA]' : 'text-slate-200 hover:text-white')
              }`}
            >
              HOME
            </button>
            <button 
              type="button"
              onClick={handleGoCurriculum} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                effectiveIsScrolled 
                  ? (isCurriculumActive ? 'text-[#7F7FFA]' : 'text-[#3C3C3C] hover:text-[#7F7FFA]') 
                  : (isCurriculumActive ? 'text-[#7F7FFA]' : 'text-slate-200 hover:text-white')
              }`}
            >
              CURRICULUM
            </button>
            <button 
              type="button"
              onClick={handleGoTools} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                effectiveIsScrolled 
                  ? (isToolsActive ? 'text-[#7F7FFA]' : 'text-[#3C3C3C] hover:text-[#7F7FFA]') 
                  : (isToolsActive ? 'text-[#7F7FFA]' : 'text-slate-200 hover:text-white')
              }`}
            >
              TOOLS
            </button>
            <button 
              type="button"
              onClick={handleGoResources} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                effectiveIsScrolled 
                  ? (isResourcesActive ? 'text-[#7F7FFA]' : 'text-[#3C3C3C] hover:text-[#7F7FFA]') 
                  : (isResourcesActive ? 'text-[#7F7FFA]' : 'text-slate-200 hover:text-white')
              }`}
            >
              RESOURCES
            </button>
            <button 
              type="button"
              onClick={handleGoAbout} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                effectiveIsScrolled 
                  ? (isAboutActive ? 'text-[#7F7FFA]' : 'text-[#3C3C3C] hover:text-[#7F7FFA]') 
                  : (isAboutActive ? 'text-[#7F7FFA]' : 'text-slate-200 hover:text-white')
              }`}
            >
              ABOUT
            </button>
            <button 
              type="button"
              onClick={handleGoGuide} 
              className={`text-[11px] font-bold uppercase tracking-widest transition-all px-4 py-1.5 rounded-full shadow-xs cursor-pointer ${
                effectiveIsScrolled 
                  ? (isGuideActive 
                      ? 'text-[#7F7FFA] bg-[#ECECFC] ring-1 ring-[#7F7FFA]/40' 
                      : 'text-[#7F7FFA] bg-[#F4F8FA] hover:bg-[#ECECFC]') 
                  : (isGuideActive 
                      ? 'text-white bg-[#2c3046] ring-1 ring-white/30 border border-white/10' 
                      : 'text-white bg-[#222536] hover:bg-[#2c3046] border border-white/5')
              }`}
            >
              GUIDE
            </button>
          </div>

          {/* Action CTAs & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button 
              type="button"
              id="navbar-cta-btn"
              onClick={handleAuthAction}
              className="bg-[#7F7FFA] text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-wide sm:tracking-wider shadow-sm hover:bg-[#6868EB] transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              {user ? 'CONTINUE' : 'GET STARTED'}
            </button>

            {!user ? (
              <button 
                type="button"
                id="navbar-guest-btn"
                onClick={handleGuestAction}
                className={`hidden sm:flex items-center px-4 py-2 rounded-full border cursor-pointer ${
                  effectiveIsScrolled 
                    ? 'border-[#3C3C3C]/10 bg-white text-[#3C3C3C] hover:bg-[#F4F8FA]' 
                    : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                } backdrop-blur-md transition-all text-[11px] font-bold uppercase tracking-wider`}
              >
                GUEST MODE
              </button>
            ) : (
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 cursor-pointer ${
                    effectiveIsScrolled ? 'bg-[#F4F8FA] border-[#3C3C3C]/10' : 'bg-[#181b2a] border-white/20'
                  } backdrop-blur-md px-3 py-1.5 rounded-full border hover:bg-white/20 transition-all`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#7F7FFA] flex items-center justify-center text-[9px] font-bold text-white uppercase shrink-0">
                    {user.displayName?.[0] || 'U'}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    effectiveIsScrolled ? 'text-[#3C3C3C]' : 'text-white'
                  } hidden sm:inline max-w-[90px] truncate`}>
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-[#3C3C3C]/10 rounded-2xl shadow-md py-2 w-48 z-[160] overflow-hidden">
                    <div className="px-4 py-1.5 border-b border-[#3C3C3C]/10 text-[10px] font-bold text-[#3C3C3C]/50 uppercase tracking-wider">
                      {user.email || 'My Account'}
                    </div>
                    {isEmailAdmin(user.email) && (
                      <button 
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/beginfin-admins');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-[#7F7FFA] hover:bg-[#7F7FFA]/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#7F7FFA]" />
                        <span>Admin Portal</span>
                      </button>
                    )}
                    {onOpenSettings && (
                      <button 
                        type="button"
                        onClick={() => {
                          onOpenSettings();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings</span>
                      </button>
                    )}
                    {onLogout && (
                      <button 
                        type="button"
                        onClick={() => { 
                          onLogout(); 
                          setShowUserMenu(false); 
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 sm:p-2.5 rounded-full cursor-pointer ${
                effectiveIsScrolled 
                  ? 'text-[#3C3C3C] border-slate-200/40 bg-white/50' 
                  : 'text-white border-white/20 bg-white/10'
              } hover:bg-white/20 transition-all flex items-center justify-center border shrink-0`}
              aria-label="Toggle Mobile Menu"
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {showMobileMenu && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileMenu(false)}
                className="fixed inset-0 z-[140] bg-slate-950/30 backdrop-blur-xs"
              />
              {/* Menu Container */}
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`fixed inset-x-4 ${hasBanner ? 'top-28 sm:top-32' : 'top-20'} z-[145] bg-white rounded-2xl border border-[#3C3C3C]/10 shadow-lg p-6 lg:hidden flex flex-col gap-4 max-h-[85vh] overflow-y-auto`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#3C3C3C]/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7F7FFA]">Navigation Menu</span>
                  <button 
                    type="button"
                    onClick={() => setShowMobileMenu(false)}
                    className="p-1 rounded-lg text-[#3C3C3C]/60 hover:text-[#3C3C3C] hover:bg-[#F4F8FA] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button 
                    type="button"
                    onClick={handleGoHome} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer ${
                      isHomeActive ? 'bg-[#7F7FFA]/10 text-[#7F7FFA]' : 'text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA]'
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0" /> Home
                  </button>
                  <button 
                    type="button"
                    onClick={handleGoCurriculum} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer ${
                      isCurriculumActive ? 'bg-[#7F7FFA]/10 text-[#7F7FFA]' : 'text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" /> Curriculum
                  </button>
                  <button 
                    type="button"
                    onClick={handleGoTools} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer ${
                      isToolsActive ? 'bg-[#7F7FFA]/10 text-[#7F7FFA]' : 'text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" /> Tools & Simulators
                  </button>
                  <button 
                    type="button"
                    onClick={handleGoResources} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer ${
                      isResourcesActive ? 'bg-[#7F7FFA]/10 text-[#7F7FFA]' : 'text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA]'
                    }`}
                  >
                    <Library className="w-4 h-4 shrink-0" /> Resources
                  </button>
                  <button 
                    type="button"
                    onClick={handleGoAbout} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer ${
                      isAboutActive ? 'bg-[#7F7FFA]/10 text-[#7F7FFA]' : 'text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA]'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" /> About
                  </button>
                  <button 
                    type="button"
                    onClick={handleGoGuide} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 cursor-pointer ${
                      isGuideActive ? 'bg-[#7F7FFA]/10 text-[#7F7FFA]' : 'text-[#7F7FFA] bg-[#F4F8FA] hover:bg-[#7F7FFA]/10'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0 text-[#7F7FFA]" /> Educator Guide
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowMobileMenu(false);
                      navigate('/mcp');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 shrink-0" /> MCP Server
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowMobileMenu(false);
                      navigate('/status');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#3C3C3C] hover:bg-[#F4F8FA] hover:text-[#7F7FFA] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <Activity className="w-4 h-4 shrink-0" /> System Status
                  </button>
                  {isEmailAdmin(user?.email) && (
                    <button 
                      type="button"
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate('/beginfin-admins');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#7F7FFA] bg-[#7F7FFA]/10 hover:bg-[#7F7FFA]/20 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0 text-[#7F7FFA]" /> Admin Portal
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-[#3C3C3C]/10 flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleAuthAction();
                    }}
                    className="w-full py-3 bg-[#7F7FFA] text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-md hover:bg-[#6868EB] transition-all text-center cursor-pointer"
                  >
                    {user ? 'Continue Learning' : 'Get Started'}
                  </button>
                  {!user && (
                    <button 
                      type="button"
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleGuestAction();
                      }}
                      className="w-full py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-slate-200 transition-all text-center cursor-pointer"
                    >
                      Guest Mode
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
