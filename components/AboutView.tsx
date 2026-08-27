import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Users, 
  Award, 
  ExternalLink,
  BookOpen,
  Eye,
  Lock,
  Globe2,
  Building2
} from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#3C3C3C] selection:bg-[#7F7FFA]/20 selection:text-indigo-950 font-sans pb-24">
      {/* Sticky Sub-Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#7F7FFA] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portal</span>
          </button>

          <div className="flex items-center gap-2">
            <img 
              src="https://media.licdn.com/dms/image/v2/D560BAQHnYQWitFITCg/company-logo_100_100/B56Z8a8HsJHUAI-/0/1782863395852/begin_fin_logo?e=1789603200&v=beta&t=soL_gMehzor_b0etxBts8yvUj1R5KENX3NvnUCvSH34" 
              alt="BeginFin Logo" 
              className="w-6 h-6 object-contain rounded-md shadow-xs" 
              referrerPolicy="no-referrer"
            />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">About BeginFin</span>
          </div>
        </div>
      </header>

      {/* Main Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-10">
        
        {/* Article Headline Header */}
        <section className="space-y-4 border-b border-slate-200/80 pb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7F7FFA]/10 border border-[#7F7FFA]/20 text-[#7F7FFA] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Two high school students, one mission</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            About BeginFin
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-500 pt-1">
            <span>Founded by <strong>Vishnu Kakarla</strong> (Dec 2025) & Joined by <strong>Kruz Smith</strong> (June 2026)</span>
            <span>•</span>
            <span>Lake Belton High School</span>
          </div>
        </section>

        {/* Section 1: Our Story and Vision */}
        <section className="bg-white p-6 sm:p-9 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#7F7FFA]">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Our Story and Vision
            </h2>
          </div>

          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
            <p>
              BeginFin was founded by <strong>Vishnu Kakarla</strong>, a student at Lake Belton High School in December 2025. BeginFin is an open-access initiative dedicated to dismantling the systemic barriers to financial literacy through engaging modules and completion certifications. Inspired by the mission, fellow Lake Belton student <strong>Kruz Smith</strong> joined in June 2026 as a co-founder.
            </p>
            <p>
              Our vision is to live in a world where financial education is a universal right, not a luxury, enabling every individual to navigate their economic future with dignity, resilience, and confidence. Through zero paywalls, zero ads, zero user data monetization, we want to empower high school, collegiate, and adult learners globally.
            </p>
          </div>
        </section>

        {/* Section 2: Our Values and Commitments */}
        <section className="bg-white p-6 sm:p-9 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#7F7FFA]">
            <Heart className="w-5 h-5" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Our Values and Commitments
            </h2>
          </div>

          <div className="space-y-4">
            {/* Value 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#7F7FFA]" />
                <span>Education belongs to the community, not behind a paywall.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                We reject paywalls, restrictive access, advertisements, and hidden fees. Every tool, lesson, and certificate we create is, and always will be, a 100% free open educational resource accessible to anyone ready to learn.
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Trust is paramount, especially when navigating personal finance.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                We operate on a strict data-minimization framework, collecting only what is vital to deliver an excellent learning experience. We never monetize or sell user data, and we offer a seamless Guest Mode so learners can build their financial confidence with even more peace of mind.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Learners are at the heart of everything we build.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                We intentionally design our tools, modules, and quizzes to be deeply practical, intuitive, and engaging. If our technology does not immediately simplify a user's journey or respect their time, we go back to the drawing board.
              </p>
            </div>

            {/* Value 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>We answer directly to our learners, not to investors or other stakeholders.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Our roadmap is entirely shaped by the real-world needs of the people using our tools. We remain fiercely protective of our users' interests, ensuring our platform evolves solely to empower the public good.
              </p>
            </div>

            {/* Value 5 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>BeginFin has never generated a single dollar in revenue, and we never plan to.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Our work is guided entirely by helping people, not making money. By keeping commercial interests away from our platform, we ensure that our only goal is the success and freedom of our learners.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Community Impact and Recognition */}
        <section className="bg-white p-6 sm:p-9 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-[#7F7FFA]">
            <Award className="w-5 h-5" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Community Impact and Recognition
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#7F7FFA] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mayoral Proclamation</h3>
                <p className="text-xs text-slate-600">City of Temple, TX (2026)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#7F7FFA] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mayoral Proclamation</h3>
                <p className="text-xs text-slate-600">City of Belton, TX (2026)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Gubernatorial Commendation</h3>
                <p className="text-xs text-slate-600">Governor of the State of Texas (2026)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <Globe2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Global Reach</h3>
                <p className="text-xs text-slate-600">10,000+ Unique Visitors across 25+ countries</p>
              </div>
            </div>
          </div>

          {/* Jump$tart Clearinghouse Alignment Box */}
          <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-3">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              BeginFin’s open-source curriculum is vetted for alignment by the <strong>Jump$tart Clearinghouse</strong> for alignment with the <em>National Standards for Personal Finance Education</em>.
            </p>
            <div>
              <a 
                href="https://jumpstartclearinghouse.org/resource/beginfin-financial-literacy-certification/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7F7FFA] hover:underline"
              >
                <span>View our listing on Jump$tart Clearinghouse</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
