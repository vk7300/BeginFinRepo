import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Target, 
  Compass, 
  Award, 
  ShieldCheck, 
  Globe2, 
  BookOpen, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  FileCheck2,
  ExternalLink,
  GraduationCap
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
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">BeginFin Overview</span>
          </div>
        </div>
      </header>

      {/* Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
        
        {/* Article Header */}
        <section className="space-y-4 text-center sm:text-left border-b border-slate-200/80 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7F7FFA]/10 border border-[#7F7FFA]/20 text-[#7F7FFA] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About BeginFin • Open Educational Resource</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Building Universal Economic Confidence for Every Learner
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            Founded in Temple, Texas, BeginFin is a student-led, open-access initiative dedicated to dismantling the systemic barriers of financial illiteracy through rigorous, standard-aligned education and verifiable credentials.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-2">
            <span>By <strong>Vishnu Kakarla</strong> & <strong>Kruz Smith</strong></span>
            <span>•</span>
            <span>Founded December 2025</span>
            <span>•</span>
            <span>Temple & Belton, TX</span>
          </div>
        </section>

        {/* Mission & Vision Bento Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#7F7FFA]/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7F7FFA]/10 border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA]">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Our Mission</h2>
              <blockquote className="text-slate-700 text-sm sm:text-base leading-relaxed italic border-l-2 border-[#7F7FFA] pl-3.5 py-0.5">
                "To eliminate barriers to economic opportunity by providing every individual with free, open-access financial education and the credentials they need to build lasting financial confidence."
              </blockquote>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-6 pt-4 border-t border-slate-100">
              Commitment: Zero paywalls, zero ads, zero user data monetized.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#7F7FFA]/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#7F7FFA]">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Our Vision</h2>
              <blockquote className="text-slate-700 text-sm sm:text-base leading-relaxed italic border-l-2 border-indigo-400 pl-3.5 py-0.5">
                "A world where financial education is a universal right, not a luxury, enabling every individual to navigate their economic future with dignity, resilience, and confidence."
              </blockquote>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-6 pt-4 border-t border-slate-100">
              Aspiration: Empowering high school, collegiate, and adult learners globally.
            </p>
          </div>
        </section>

        {/* Section 1: The Origin Story */}
        <section className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 text-[#7F7FFA]">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">The Origin Story</h2>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            In late 2025, high school students <strong>Vishnu Kakarla</strong> and <strong>Kruz Smith</strong> identified a critical void in public education: millions of students graduate each year without essential life competencies—such as understanding marginal income tax brackets, evaluating high-interest revolving credit, navigating health insurance deductibles, or investing systematically for retirement.
          </p>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            Rather than creating another subscription-locked prep app or ad-cluttered portal, they architected <strong>BeginFin</strong> as a 100% free, student-authored Open Educational Resource (OER). Designed from the ground up to be accessible across any modern web browser without friction, BeginFin combines national standard-aligned curriculum units with practical simulation engines, instant feedback, and verifiable digital certificates.
          </p>
        </section>

        {/* Section 2: Core Values Bento Grid */}
        <section className="space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7F7FFA]">Guiding Principles</span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Core Institutional Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Globe2 className="w-4 h-4 text-[#7F7FFA]" />
                <h3>Open & Universal Access</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Educational materials, interactive modules, and certification exams are permanently free for individuals, classrooms, and community organizations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3>Absolute Privacy & Trust</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We never monetize learner data, sell ads, or ask for sensitive financial accounts or Social Security Numbers. All financial simulators run strictly on your local device.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h3>Learners First</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Designed with empathetic, clear, and judgment-free language. Complex economic topics are broken down into practical, actionable concepts.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h3>Standards Alignment</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Curriculum mapped to the National Standards for Personal Finance Education developed by the Council for Economic Education (CEE) and Jump$tart Coalition.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Official Recognition & Impact */}
        <section className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[#7F7FFA] text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Civic & Academic Accolades</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Community Impact & Official Recognition
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
              <Building2 className="w-5 h-5 text-[#7F7FFA]" />
              <h3 className="font-bold text-sm text-slate-900">Mayoral Proclamations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Formally recognized by Mayoral Proclamations from the City of Temple, TX and City of Belton, TX for contributions to youth financial literacy.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Gubernatorial Commendation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Awarded a formal Gubernatorial Commendation from Governor Greg Abbott, Office of the Governor of the State of Texas.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
              <Globe2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Global Reach</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Serving over 10,000 unique learners across 25+ countries, supporting classrooms, independent students, and self-paced educators.
              </p>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-slate-700 leading-relaxed space-y-1.5">
            <p className="font-bold text-indigo-950">Academic Trademark & Accreditation Disclaimers:</p>
            <p>
              • <strong>Jump$tart Coalition:</strong> BeginFin curriculum is vetted and indexed in the National Financial Education Clearinghouse maintained by the Jump$tart Coalition for Personal Financial Literacy.
            </p>
            <p>
              • <strong>College Board AP® Trademark:</strong> BeginFin is licensed by the College Board to utilize the AP® trademark for upcoming AP Business with Personal Finance curriculum resources. BeginFin is not owned, operated, or directly endorsed by the College Board.
            </p>
          </div>
        </section>

        {/* Section 4: Founders Biography */}
        <section className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7F7FFA]">Leadership</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">About the Co-Founders</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vishnu Kakarla</h3>
                <p className="text-xs font-semibold text-[#7F7FFA]">Co-Founder & Curriculum Architect</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Vishnu is a high school student in Central Texas and a 2026 Business Professionals of America (BPA) Personal Finance Nationals qualifier. Passionate about economic equity, he leads curriculum design, standards compliance, and platform architecture.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kruz Smith</h3>
                <p className="text-xs font-semibold text-[#7F7FFA]">Co-Founder & Community Director</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kruz serves as the 2025–26 Lake Belton High School National Honor Society chapter treasurer. He directs community outreach, institutional partnerships, and educator support resources.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Institutional Disclaimers & Non-Guarantees */}
        <section className="p-6 rounded-3xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 space-y-3 leading-relaxed">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Institutional Scope & Compliance Notice
          </h3>
          <p>
            BeginFin is an independently maintained, student-led open educational resource and is not a registered 501(c)(3) non-profit entity or financial advisory firm. The platform operates with zero revenue and does not provide individual financial, legal, tax, or investment advice.
          </p>
          <p>
            While BeginFin enforces strict data isolation, encryption, and no-sale data policies, as a bootstrapped educational project with limited resources, it does not certify formal third-party audits (such as FERPA, COPPA, or SOC 2 compliance certifications). Educators and institutions should evaluate the tool in accordance with local district guidelines.
          </p>
        </section>

      </main>
    </div>
  );
};
