import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavPadding } from './Navbar';
import { 
  ChevronDown, 
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
  ShieldCheck,
  Info
} from 'lucide-react';

interface AboutViewProps {
  onBack?: () => void;
  onViewCurriculum?: () => void;
  onViewTools?: () => void;
  onViewResources?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = () => {
  const navigate = useNavigate();
  const navPadding = useNavPadding();
  const [photoSrc, setPhotoSrc] = useState<string>('https://begin-fin.com/vishnuandkruz.png');
  const [photoError, setPhotoError] = useState(false);

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
              </div>

              {/* Right Column: Founder Portrait Photo Card */}
              <div className="md:col-span-5 lg:col-span-5 landscape:col-span-5 flex flex-col items-center justify-center">
                
                <div className="w-full max-w-[180px] sm:max-w-[195px] md:max-w-[190px] lg:max-w-[200px] mx-auto rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-white">
                  {!photoError ? (
                    <div className="relative overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img 
                        src={photoSrc} 
                        alt="Kruz Smith and Vishnu Kakarla standing in the Lake Belton High School Library"
                        className="w-full h-auto object-cover object-top block transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          if (photoSrc === 'https://begin-fin.com/vishnuandkruz.png') {
                            setPhotoSrc('/vishnuandkruz.png');
                          } else if (photoSrc === '/vishnuandkruz.png') {
                            setPhotoSrc('/0S1A6490.jpg');
                          } else if (photoSrc === '/0S1A6490.jpg') {
                            setPhotoSrc('https://i.postimg.cc/13DzymGX/0S1A6490.jpg');
                          } else {
                            setPhotoError(true);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    /* Fallback portrait card */
                    <div className="w-full aspect-[2/3] bg-gradient-to-b from-[#7F7FFA]/15 via-white to-white p-3 sm:p-3.5 flex flex-col items-center justify-between text-center select-none">
                      <div className="w-full flex justify-end">
                        <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#7F7FFA]/10 text-[#7F7FFA]">
                          LBHS
                        </span>
                      </div>
                      <div className="my-auto space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-[#7F7FFA]/15 text-[#7F7FFA] mx-auto flex items-center justify-center shadow-inner">
                          <Users className="w-5 h-5" />
                        </div>
                        <h3 
                          className="text-xs sm:text-sm font-serif text-slate-900 leading-snug font-medium"
                          style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
                        >
                          Kruz & Vishnu
                        </h3>
                        <p className="text-[10px] text-slate-500 font-sans leading-tight">
                          Co-Founders of BeginFin
                        </p>
                      </div>
                      <div className="w-full pt-1.5 border-t border-slate-200/80">
                        <span className="text-[9px] font-sans text-slate-400">
                          © Belton ISD
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Caption underneath photo */}
                <div className="text-[11px] sm:text-xs text-slate-400 mt-2 text-center font-sans w-full max-w-[180px] sm:max-w-[195px] md:max-w-[190px] lg:max-w-[200px] mx-auto flex flex-col gap-0.5">
                  <span className="font-medium text-slate-600">Kruz Smith & Vishnu Kakarla</span>
                  <span className="text-[10px] text-slate-400">© Belton ISD Dept. of Comm.</span>
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
          {/* SECTION 4: Advisory & Educational Disclosure Notes    */}
          {/* ----------------------------------------------------- */}
          <section className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-[#7F7FFA]">
              <Info className="w-4 h-4" />
              <h3 
                className="text-sm sm:text-base font-semibold text-slate-900 font-serif"
                style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
              >
                Educational Advisory & Standard Alignment
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              BeginFin is an independent open-access educational initiative founded by students to advance universal financial literacy. All interactive simulators, lesson modules, and certification materials are engineered strictly for instructional and educational purposes and do not constitute personalized financial, tax, legal, or investment advice. Curriculum alignment is evaluated against the National Standards for Personal Finance Education (Jump$tart Coalition & CEE).
            </p>
          </section>

          {/* ----------------------------------------------------- */}
          {/* SECTION 5: Contact & Social Capsule (Matches Design)  */}
          {/* ----------------------------------------------------- */}
          <section className="flex justify-center pt-2">
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
