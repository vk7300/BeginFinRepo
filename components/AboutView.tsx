import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavPadding } from './Navbar';
import { 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  CircleDollarSign, 
  GraduationCap, 
  Lock, 
  Users, 
  Landmark, 
  Award, 
  Globe2, 
  Mail, 
  Linkedin, 
  Instagram, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface FounderPhoto {
  id: string;
  src: string;
  fallbackSrcs: string[];
  alt: string;
  credit: string;
  objectPosition: string;
}

const FOUNDER_PHOTOS: FounderPhoto[] = [
  {
    id: 'library-portrait',
    src: 'https://begin-fin.com/vishnuandkruz.png',
    fallbackSrcs: [
      '/vishnuandkruz.png',
      '/0S1A6490.jpg',
      'https://i.postimg.cc/13DzymGX/0S1A6490.jpg'
    ],
    alt: 'Kruz Smith and Vishnu Kakarla standing in the Lake Belton High School Library',
    credit: '© BISD Comms Dept.',
    objectPosition: 'object-top'
  },
  {
    id: 'classroom-collaboration',
    src: 'https://begin-fin.com/vishnuandkruz2.jpg',
    fallbackSrcs: [
      '/vishnuandkruz2.jpg',
      'https://live.staticflickr.com/65535/55544320403_6b5a72134e_b.jpg'
    ],
    alt: 'Vishnu Kakarla and Kruz Smith working together on BeginFin digital modules in Belton',
    credit: '© BISD Comms Dept.',
    objectPosition: 'object-center'
  },
  {
    id: 'founders-showcase',
    src: 'https://begin-fin.com/vishnuandkruz3.jpg',
    fallbackSrcs: [
      '/vishnuandkruz3.jpg',
      'https://live.staticflickr.com/65535/55544320323_1e1b7908ac_b.jpg'
    ],
    alt: 'Vishnu Kakarla and Kruz Smith smiling at Lake Belton High School',
    credit: '© BISD Comms Dept.',
    objectPosition: 'object-top'
  }
];

interface AboutViewProps {
  onBack?: () => void;
  onViewCurriculum?: () => void;
  onViewTools?: () => void;
  onViewResources?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = () => {
  const navigate = useNavigate();
  const navPadding = useNavPadding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideSrcs, setSlideSrcs] = useState<string[]>(() => FOUNDER_PHOTOS.map(p => p.src));
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % FOUNDER_PHOTOS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + FOUNDER_PHOTOS.length) % FOUNDER_PHOTOS.length);
  }, []);

  const handleImageError = (index: number) => {
    const currentSrc = slideSrcs[index];
    const photo = FOUNDER_PHOTOS[index];
    const nextFallback = photo.fallbackSrcs.find(f => f !== currentSrc);
    if (nextFallback && !slideSrcs[index].includes(nextFallback)) {
      setSlideSrcs(prev => {
        const next = [...prev];
        next[index] = nextFallback;
        return next;
      });
    } else {
      setFailedSlides(prev => ({ ...prev, [index]: true }));
    }
  };

  // Auto-advance carousel every 6 seconds, pausing on hover/interaction
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToStory = () => {
    const el = document.getElementById('story-and-vision');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-[#3C3C3C] selection:bg-[#7F7FFA]/20 selection:text-indigo-950 font-sans overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* HERO SECTION with Periwinkle (#7F7FFA) Gradient           */}
      {/* ========================================================= */}
      <section 
        className={`relative w-full overflow-hidden bg-gradient-to-b from-[#7F7FFA] via-[#A8A8FC] via-35% via-[#D8DBFD] via-70% to-white pb-16 sm:pb-24 ${navPadding}`}
      >
        {/* Fluid Ambient Glow Blobs for Tandem Motion */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] sm:w-[54rem] h-[26rem] sm:h-[32rem] bg-radial from-white/35 via-[#7F7FFA]/20 to-transparent blur-3xl opacity-80" 
        />
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute top-1/4 -left-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/20 blur-2xl animate-pulse" 
          style={{ animationDuration: '6s' }}
        />
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-full bg-[#7F7FFA]/20 blur-2xl animate-pulse" 
          style={{ animationDuration: '8s' }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center pt-8 sm:pt-14 md:pt-16">
          
          {/* Centered Pill: About us */}
          <div className="inline-flex items-center justify-center mb-6 sm:mb-8">
            <span className="px-5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/70 shadow-xs text-slate-800 text-xs sm:text-sm font-semibold tracking-normal font-sans">
              About us
            </span>
          </div>

          {/* Display Headline in Source Serif 4 */}
          <h1 
            className="text-3xl min-[400px]:text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-normal text-slate-900 tracking-tight leading-[1.14] font-serif max-w-4xl mx-auto"
            style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
          >
            <span>Building toward a future where</span>
            <span className="block italic text-slate-900 mt-1 sm:mt-2">
              BeginFin is not needed.
            </span>
          </h1>

          {/* Subtitle in Source Sans 3 */}
          <p className="mt-5 sm:mt-7 text-base sm:text-lg md:text-xl text-slate-700 font-sans font-normal max-w-xl mx-auto leading-relaxed">
            A student-built open access
            <br />
            initiative from Temple, TX.
          </p>

          {/* Gentle Down Chevron / Cue */}
          <div className="mt-8 sm:mt-12 flex justify-center">
            <button
              type="button"
              onClick={scrollToStory}
              aria-label="Scroll to Our Story and Vision"
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-full hover:bg-white/40 active:scale-95"
            >
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* MAIN CONTENT CANVAS: Fluid Off-White Background           */}
      {/* ========================================================= */}
      <div className="relative bg-[#FAF9FD] pb-16 sm:pb-24">
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-16 sm:space-y-24">

          {/* ----------------------------------------------------- */}
          {/* SECTION 1: Our Story & Vision                         */}
          {/* ----------------------------------------------------- */}
          <section id="story-and-vision" className="pt-4 sm:pt-8 scroll-mt-28">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#7F7FFA] font-serif tracking-tight mb-6 sm:mb-8"
              style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
            >
              Our Story & Vision
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 landscape:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center landscape:items-center">
              
              {/* Left Column: Narrative paragraphs (vertically centered relative to photo) */}
              <div className="md:col-span-7 lg:col-span-7 landscape:col-span-7 space-y-4 sm:space-y-5 text-slate-700 font-sans text-sm sm:text-base leading-relaxed flex flex-col justify-center">
                <p>
                  BeginFin was founded by Vishnu Kakarla, a student at Lake Belton High School in December 2025. BeginFin is an open-access initiative dedicated to dismantling the barriers to financial literacy through engaging modules and certifications. Inspired by the mission, fellow Lake Belton student Kruz Smith joined in June 2026 as a co-founder.
                </p>
                <p>
                  Our vision is to live in a world where financial education is a universal right, not a luxury, enabling every individual to navigate their economic future with dignity, resilience, and confidence. Through zero paywalls, zero ads, zero user data monetization, we want to empower high school and college students, young professionals, and everyone in between.
                </p>
                <p>
                  BeginFin operates as a fiscally sponsored project of The Hack Foundation (dba Hack Club), EIN 81-2908499.
                </p>
              </div>

              {/* Right Column: Founder Carousel Card */}
              <div className="md:col-span-5 lg:col-span-5 landscape:col-span-5 flex flex-col items-center justify-center">
                
                <div 
                  className="w-full max-w-[280px] sm:max-w-[310px] md:max-w-[320px] lg:max-w-[340px] mx-auto focus:outline-hidden"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  onKeyDown={onKeyDown}
                  tabIndex={0}
                  role="region"
                  aria-label="BeginFin Co-Founders photo carousel"
                >
                  {/* Photo Frame Container */}
                  <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-slate-900 group">
                    {/* Slides Track */}
                    <div 
                      className="w-full h-full flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {FOUNDER_PHOTOS.map((photo, index) => {
                        const isFailed = failedSlides[index];
                        const src = slideSrcs[index];
                        return (
                          <div 
                            key={photo.id}
                            className="w-full h-full shrink-0 relative bg-slate-950 flex items-center justify-center overflow-hidden"
                            aria-hidden={currentSlide !== index}
                          >
                            {!isFailed ? (
                              <img 
                                src={src} 
                                alt={photo.alt}
                                className={`w-full h-full object-cover ${photo.objectPosition} block transition-transform duration-700 group-hover:scale-105`}
                                referrerPolicy="no-referrer"
                                loading={index === 0 ? "eager" : "lazy"}
                                onError={() => handleImageError(index)}
                              />
                            ) : (
                              /* Fallback portrait card */
                              <div className="w-full h-full bg-gradient-to-b from-[#7F7FFA]/15 via-white to-white p-4 flex flex-col items-center justify-between text-center select-none">
                                <div className="my-auto space-y-2">
                                  <div className="w-12 h-12 rounded-full bg-[#7F7FFA]/15 text-[#7F7FFA] mx-auto flex items-center justify-center shadow-inner">
                                    <Users className="w-6 h-6" />
                                  </div>
                                  <h3 
                                    className="text-sm font-serif text-slate-900 leading-snug font-medium"
                                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                                  >
                                    Kruz Smith & Vishnu Kakarla
                                  </h3>
                                </div>
                                <div className="w-full pt-2 border-t border-slate-200/80">
                                  <span className="text-[10px] font-sans text-slate-400">
                                    {photo.credit}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Slide Counter Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                      <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/15">
                        {currentSlide + 1} / {FOUNDER_PHOTOS.length}
                      </span>
                    </div>

                    {/* Navigation Buttons (Left & Right) */}
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous team photo"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next team photo"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dot Indicators */}
                  <div className="flex items-center justify-center gap-1.5 mt-2.5">
                    {FOUNDER_PHOTOS.map((photo, i) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setCurrentSlide(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 transition-all rounded-full cursor-pointer ${
                          currentSlide === i ? 'w-5 bg-[#7F7FFA]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Caption underneath photo */}
                  <div className="text-[11px] sm:text-xs text-slate-400 mt-2 text-center font-sans w-full max-w-[280px] sm:max-w-[310px] md:max-w-[320px] lg:max-w-[340px] mx-auto">
                    <span>© BISD Comms Dept.</span>
                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* ----------------------------------------------------- */}
          {/* SECTION 2: Our Values (Left) & BeginFin IRL (Right)   */}
          {/* ----------------------------------------------------- */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Our Values */}
            <div className="lg:col-span-6 space-y-6">
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#7F7FFA] font-serif tracking-tight"
                style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
              >
                Our Values
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Value 1: Open Access */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-start">
                  <div className="w-9 h-9 rounded-xl bg-[#7F7FFA]/15 text-[#7F7FFA] flex items-center justify-center mb-3 shrink-0">
                    <CircleDollarSign className="w-5 h-5" />
                  </div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif mb-1"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Open Access
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    BeginFin will always be free, with no ads or product placements.
                  </p>
                </div>

                {/* Value 2: Learners first */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-start">
                  <div className="w-9 h-9 rounded-xl bg-[#7F7FFA]/15 text-[#7F7FFA] flex items-center justify-center mb-3 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif mb-1"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Learners first
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    Our goal is to make BeginFin practical and engaging.
                  </p>
                </div>

                {/* Value 3: Trust */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-start">
                  <div className="w-9 h-9 rounded-xl bg-[#7F7FFA]/15 text-[#7F7FFA] flex items-center justify-center mb-3 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif mb-1"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Trust
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    We never sell data, and users get complete control over theirs.
                  </p>
                </div>

                {/* Value 4: Student-led */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-start">
                  <div className="w-9 h-9 rounded-xl bg-[#7F7FFA]/15 text-[#7F7FFA] flex items-center justify-center mb-3 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif mb-1"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Student-led
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    Run by students in Temple, TX. Not a company.
                  </p>
                </div>

              </div>
            </div>

            {/* Right Column: BeginFin IRL & Media Coverage */}
            <div className="lg:col-span-6 space-y-6">
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#7F7FFA] font-serif tracking-tight"
                style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
              >
                BeginFin IRL
              </h2>

              {/* YouTube Video Frame */}
              <div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-950 group">
                  <iframe 
                    src="https://www.youtube.com/embed/rtoiGuFXk1s?rel=0" 
                    title="At The Core - Pursuing Excellence: Belton ISD BeginFin Feature"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    className="w-full h-full border-0"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 px-1 text-[11px] sm:text-xs text-slate-400 font-sans">
                  <span>Via YouTube – © Belton ISD, Dept. of Communications</span>
                  <a 
                    href="https://www.youtube.com/watch?v=rtoiGuFXk1s" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#7F7FFA] hover:underline font-semibold"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Also featured by Section */}
              <div className="pt-2">
                <h3 
                  className="text-base sm:text-lg font-serif italic text-slate-500 text-center mb-4"
                  style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                >
                  Also featured by
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                  
                  {/* Temple Daily Telegram */}
                  <a
                    href="https://www.tdtnews.com/news/central_texas_news/article_47d078fc-2521-4f6f-aa27-a51c58e72187.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-[#7F7FFA]/40 transition-all flex items-center justify-center group"
                    title="Temple Daily Telegram"
                  >
                    <img 
                      src="/press/temple-daily-telegram.jpg" 
                      alt="Temple Daily Telegram" 
                      className="max-h-9 max-w-full object-contain grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all"
                    />
                  </a>

                  {/* KCEN-TV */}
                  <a
                    href="https://www.kcentv.com/article/news/local/beginfin-financial-literacy-high-schoolers/500-d8cb7863-7182-4f05-88bf-9efd98e57147"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-[#7F7FFA]/40 transition-all flex items-center justify-center group"
                    title="KCEN-TV News"
                  >
                    <img 
                      src="/press/kcen-tv.png" 
                      alt="KCEN-TV" 
                      className="max-h-9 max-w-full object-contain grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all"
                    />
                  </a>

                  {/* Literacy Texas */}
                  <a
                    href="https://literacytexas.org/financial-literacy-month/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-[#7F7FFA]/40 transition-all flex items-center justify-center group"
                    title="Literacy Texas"
                  >
                    <img 
                      src="/press/literacy-texas.jpg" 
                      alt="Literacy Texas" 
                      className="max-h-9 max-w-full object-contain grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all"
                    />
                  </a>

                  {/* Jump$tart Clearinghouse */}
                  <a
                    href="https://jumpstartclearinghouse.org/resource/beginfin-financial-literacy-certification/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-[#7F7FFA]/40 transition-all flex items-center justify-center group"
                    title="Jump$tart Coalition Clearinghouse"
                  >
                    <img 
                      src="/press/jumpstart.png" 
                      alt="Jump$tart Clearinghouse" 
                      className="max-h-9 max-w-full object-contain grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all"
                    />
                  </a>

                </div>
              </div>

            </div>

          </section>

          {/* ----------------------------------------------------- */}
          {/* SECTION 3: Impact & Recognition                       */}
          {/* ----------------------------------------------------- */}
          <section>
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#7F7FFA] font-serif tracking-tight mb-6 sm:mb-8"
              style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
            >
              Impact & Recognition
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Recognition 1: City of Temple Mayoral Proclamation */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#7F7FFA]/15 text-[#7F7FFA] flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif leading-snug"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Mayoral Proclamation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                    City of Temple, TX (2026)
                  </p>
                </div>
              </div>

              {/* Recognition 2: City of Belton Mayoral Proclamation */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#7F7FFA]/15 text-[#7F7FFA] flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif leading-snug"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Mayoral Proclamation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                    City of Belton, TX (2026)
                  </p>
                </div>
              </div>

              {/* Recognition 3: Gubernatorial Commendation */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#7F7FFA]/15 text-[#7F7FFA] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif leading-snug"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Gubernatorial Commendation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                    Governor of the State of Texas (2026)
                  </p>
                </div>
              </div>

              {/* Recognition 4: Global Reach */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 
                    className="text-base sm:text-lg font-semibold text-slate-900 font-serif leading-snug"
                    style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                  >
                    Global Reach
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                    15,000+ Unique Visitors across 25+ countries
                  </p>
                </div>
              </div>

            </div>

            {/* Jump$tart National Standards Alignment Verification */}
            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#EEF0FE]/60 border border-[#7F7FFA]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[#7F7FFA] shrink-0" />
                <span>
                  Vetted by the <strong>Jump$tart Clearinghouse</strong> for alignment with the <em>National Standards for Personal Finance Education</em>.
                </span>
              </div>
              <a
                href="https://jumpstartclearinghouse.org/resource/beginfin-financial-literacy-certification/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#7F7FFA] hover:underline shrink-0"
              >
                <span>View Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>

          {/* ----------------------------------------------------- */}
          {/* SECTION 4: Contact & Social Capsule (Matches Design)  */}
          {/* ----------------------------------------------------- */}
          <section className="flex justify-center pt-2 sm:pt-4">
            <div className="inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-2.5 rounded-full bg-white border border-slate-200/90 shadow-md">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-[#7F7FFA]" />
                <a 
                  href="mailto:support@begin-fin.com"
                  className="text-xs sm:text-sm font-sans font-medium text-slate-700 hover:text-[#7F7FFA] transition-colors"
                >
                  support@begin-fin.com
                </a>
              </div>

              <div className="w-px h-4 bg-slate-200" />

              <div className="flex items-center gap-2">
                <a 
                  href="https://www.linkedin.com/company/begin-fin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="BeginFin on LinkedIn"
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#7F7FFA]/15 text-slate-600 hover:text-[#7F7FFA] flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.instagram.com/begin_fin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="BeginFin on Instagram"
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#7F7FFA]/15 text-slate-600 hover:text-[#7F7FFA] flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* Fluid transition into the Black Footer */}
      <div className="w-full h-12 sm:h-16 bg-gradient-to-b from-white to-black" />

    </div>
  );
};
