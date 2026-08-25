import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  Globe, 
  HandHeart, 
  Award, 
  Trophy, 
  Medal, 
  School, 
  CheckCircle2, 
  Zap, 
  Bot, 
  HeartHandshake, 
  Rocket, 
  Target, 
  Unlock, 
  AlertTriangle,
  Check,
  X as XIcon,
  Share2
} from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeStoryTab, setActiveStoryTab] = useState<'origin' | 'solution' | 'difference' | 'traction' | 'future'>('origin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const storyChapters = [
    {
      id: 'origin' as const,
      label: 'The Problem',
      icon: AlertTriangle,
    },
    {
      id: 'solution' as const,
      label: 'Our Solution',
      icon: Zap,
    },
    {
      id: 'difference' as const,
      label: 'Why We Are Unique',
      icon: Unlock,
    },
    {
      id: 'traction' as const,
      label: 'Traction & Honors',
      icon: Trophy,
    },
    {
      id: 'future' as const,
      label: '2026 Roadmap',
      icon: Rocket,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans pb-24">
      {/* Back Button */}
      <div className="absolute top-0 left-0 right-0 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-all font-medium text-xs sm:text-sm bg-white/10 px-4 py-2 rounded-full border border-white/15 backdrop-blur-md hover:bg-white/20 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero Section - Centered and Vertically Expanded for Mobile Phones */}
      <section 
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative min-h-[520px] sm:min-h-[460px] md:min-h-[420px] pt-32 pb-24 sm:pt-36 sm:pb-24 md:pt-40 md:pb-24 flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-[#060814] via-[#0b0e26] to-[#12163b] text-white select-none cursor-default"
      >
        {/* Dynamic Interactive Cursor Tracking Glow */}
        <div 
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle 650px at ${mousePosition.x}px ${mousePosition.y}px, rgba(129, 140, 248, 0.25) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 80%)`,
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Centered Hero Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 flex flex-col items-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white whitespace-nowrap">
              Financial Literacy for All
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
              Eliminating barriers to real-world personal finance education through interactive modules, free certifications, and artificial intelligence.
            </p>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl pt-2"
          >
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">10,000+</div>
              <div className="text-[11px] sm:text-xs text-white/80 font-medium">Visitors</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">25+</div>
              <div className="text-[11px] sm:text-xs text-white/80 font-medium">Countries Reached</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">100%</div>
              <div className="text-[11px] sm:text-xs text-white/80 font-medium">Free & Open Access</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">Governor</div>
              <div className="text-[11px] sm:text-xs text-white/80 font-medium">Commendation</div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 relative z-20 space-y-16">

        {/* Founders Spotlight Cards */}
        <section className="space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">The Co-Founders</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Vishnu Kakarla Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-200 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
                  <img 
                    src="https://i.ibb.co/23X3wFbV/vishnu-beginfin.png" 
                    alt="Vishnu Kakarla" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    Founder
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Vishnu Kakarla</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Triple-Certified in Personal Finance · BPA National Top 20%
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  Having seen firsthand the impact of financial illiteracy across India, Canada, and the United States, I founded BeginFin in December 2025 after seeing avoidable debt hold people back. Triple-certified in personal finance, I placed in the top 20% nationally in BPA's Personal Financial Management competition.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Global Perspective
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    BPA Top 20% Nationally
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Triple-Certified
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Kruz Smith Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:border-purple-200 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
                  <img 
                    src="https://i.ibb.co/V4xWgRv/kruz-beginfin.png" 
                    alt="Kruz Smith" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
                    Co-Founder
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kruz Smith</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    NHS & Student Council Treasurer · Interactives Lead
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  I joined the mission in Summer 2026 after realizing our shared vision for financial literacy. As treasurer for NHS and Student Council, I lead the development of our interactive tools, simulators, and educator outreach to make learning hands-on.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Interactive Simulators
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    NHS & STUCO Treasurer
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Community Outreach
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Interactive Story Section with Navigation Tabs */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">The BeginFin Story</h2>
            </div>
            
            {/* Interactive Chapter Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {storyChapters.map((chapter) => {
                const IconComponent = chapter.icon;
                const isActive = activeStoryTab === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveStoryTab(chapter.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{chapter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chapter Details */}
          <div className="min-h-[260px]">
            <AnimatePresence mode="wait">
              {activeStoryTab === 'origin' && (
                <motion.div
                  key="origin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Why Personal Finance Education Fails Young People
                    </h3>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      Most finance education fails young people: lessons are either locked behind expensive paywalls, overly long, unstructured, or offer no completion credential. While preparing for the BPA Personal Finance competition, we saw this gap firsthand.
                    </p>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      With Americans losing billions to avoidable debt, financial illiteracy is an urgent crisis. We built BeginFin to solve this through free, structured, and interactive learning paired with recognized certifications.
                    </p>
                  </div>
                  <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 text-sm">The 4 Education Flaws We Solve</div>
                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>Expensive Paywalls:</strong> Gating life-saving money skills behind subscriptions.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>Dense & Overlong:</strong> Hundreds of static text pages with zero engagement.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>Teacher-Gated:</strong> Platforms that lock out self-directed learners.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>No Credentials:</strong> Spending weeks learning with no certificate to prove mastery.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStoryTab === 'solution' && (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Bite-Sized Modules & National Standard Alignment
                    </h3>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      We turn complex financial concepts into interactive, bite-sized lessons and rapid quizzes that make learning practical. Replacing dense textbooks with digital modules, learners master a curriculum vetted for alignment with national standards.
                    </p>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      Crucially, our platform features integrated certifications that validate mastery. Because BeginFin is completely free, lightweight, and open-access, it removes financial and technical barriers for everyone worldwide.
                    </p>
                  </div>
                  <div className="lg:col-span-5 bg-indigo-50/70 rounded-2xl p-6 border border-indigo-100 space-y-3">
                    <div className="font-bold text-slate-900 text-sm">The BeginFin Standard</div>
                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-indigo-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Interactive Simulators:</strong> Tax filing, credit building, and job budgeting.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-indigo-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Jump$tart Aligned:</strong> 9 comprehensive units mapped to national benchmarks.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-indigo-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Direct Certification:</strong> Official PDF certificates issued instantly upon completion.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-indigo-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Zero Tech Barrier:</strong> Instant browser access on any phone, laptop, or Chromebook.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStoryTab === 'difference' && (
                <motion.div
                  key="difference"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Why We Are Unique
                    </h3>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-4xl">
                      BeginFin uniquely combines interactive lessons with aligned national certification without requiring a teacher. We also feature native Google Classroom integration, a custom Claude Educator Skill for teachers, and "Bradley," our Gemini-powered AI tutor delivering free, instant mentorship.
                    </p>
                  </div>

                  {/* Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div className="p-5 rounded-2xl bg-indigo-900 text-white space-y-3 relative overflow-hidden border border-indigo-700 shadow-md">
                      <div className="font-bold text-base text-white">BeginFin</div>
                      <ul className="text-xs space-y-2 text-indigo-100">
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Free & Open Access</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Instant Master Certification</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Interactive Simulators & AI</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Direct to Learners</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="font-bold text-base text-slate-800">Video Lectures</h4>
                      <ul className="text-xs space-y-2 text-slate-600">
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Free video libraries</li>
                        <li className="flex items-center gap-1.5 text-slate-400"><XIcon className="w-3.5 h-3.5 text-rose-500" /> No completion credentials</li>
                        <li className="flex items-center gap-1.5 text-slate-400"><XIcon className="w-3.5 h-3.5 text-rose-500" /> Passive video formats</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="font-bold text-base text-slate-800">Traditional Certifications</h4>
                      <ul className="text-xs space-y-2 text-slate-600">
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Industry credentials</li>
                        <li className="flex items-center gap-1.5 text-slate-400"><XIcon className="w-3.5 h-3.5 text-rose-500" /> Weeks of dense prep</li>
                        <li className="flex items-center gap-1.5 text-slate-400"><XIcon className="w-3.5 h-3.5 text-rose-500" /> Impractical textbook exams</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="font-bold text-base text-slate-800">Educator-Gated</h4>
                      <ul className="text-xs space-y-2 text-slate-600">
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Classroom curricula</li>
                        <li className="flex items-center gap-1.5 text-slate-400"><XIcon className="w-3.5 h-3.5 text-rose-500" /> Gated behind school logins</li>
                        <li className="flex items-center gap-1.5 text-slate-400"><XIcon className="w-3.5 h-3.5 text-rose-500" /> Inaccessible for independent youth</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStoryTab === 'traction' && (
                <motion.div
                  key="traction"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Recognized by Governors, Mayors & National Directories
                    </h3>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      Founded in late 2025, BeginFin has served 10,000+ visitors across 25+ countries. We've been honored with a Texas Gubernatorial Commendation from Governor Abbott and two local Mayoral Proclamations, backed by state news features and inclusion in the national Jump$tart Directory.
                    </p>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      We reach learners directly through organic outreach, social platforms, and word-of-mouth driven by our free certification pathways.
                    </p>
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <Trophy className="w-4 h-4" /> Official Commendations
                      </div>
                      <div className="text-sm font-semibold text-white">Texas Gubernatorial Commendation</div>
                      <div className="text-xs text-slate-400">Awarded by Governor Greg Abbott for expanding financial literacy.</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                        <Medal className="w-4 h-4" /> Proclamations & Inclusion
                      </div>
                      <div className="text-sm font-bold text-slate-900">2 Mayoral Proclamations & Jump$tart</div>
                      <div className="text-xs text-slate-600">Featured in state news and listed in the national Jump$tart Coalition directory.</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStoryTab === 'future' && (
                <motion.div
                  key="future"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Scaling to 20,000 Visitors & Grassroots Pilots
                    </h3>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      By the end of 2026, we aim to reach 20,000 visitors while expanding our grassroots impact. We want to pilot BeginFin across local school districts, integrating our tools into classrooms to serve middle and high school students.
                    </p>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                      Additionally, we plan to partner with regional educational non-profits to distribute resources and co-host workshops, deepening our footprint and scaling free certification pathways to underserved youth.
                    </p>
                  </div>
                  <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" /> 2026 Objectives
                    </h4>
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <Rocket className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>20,000 Global Visitors:</strong> Doubling our reach.</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>School District Pilots:</strong> Classroom adoption across local districts.</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <HeartHandshake className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>Non-Profit Workshops:</strong> Free certifications for underserved youth.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Core Values Bento Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Our Core Values</h2>
            <p className="mt-2 text-base text-slate-500 font-normal max-w-xl mx-auto">The principles guiding every decision at BeginFin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Value 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 relative overflow-hidden group hover:border-indigo-200 transition-all"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">100% Free & Open Access</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                BeginFin is, and always will be, an open educational resource (OER). We believe no young person should ever have to pay for the financial skills that shape their future.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden group"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Privacy</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                We collect only what is strictly needed to save your progress. We never sell your data, and we offer a Guest Mode for complete privacy.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 relative overflow-hidden group hover:border-rose-200 transition-all"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Learners First</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Learners are at the heart of everything we build. Every simulator, quiz, and tool is built to be engaging, practical, and intuitive.
              </p>
            </motion.div>

            {/* Value 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-indigo-50/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-100 relative overflow-hidden group hover:border-indigo-200 transition-all"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-700">
                <HandHeart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Universal Accessibility</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Designed for anyone with zero prior financial background, translating dense financial jargon into plain, actionable concepts.
              </p>
            </motion.div>

          </div>
        </section>

      </div>
    </div>
  );
};
