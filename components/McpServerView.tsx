import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Copy, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  ArrowRight,
  MessageSquare,
  Calculator,
  Compass,
  Scale,
  Calendar,
  Layers,
  FileText,
  Percent,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Modal } from './Modal';

export interface McpServerViewProps {
  onBack: () => void;
  onOpenTeacherDashboard?: () => void;
  mode?: 'student' | 'teacher';
  onSwitchMode?: (newMode: 'student' | 'teacher') => void;
}

export const McpServerView: React.FC<McpServerViewProps> = ({ 
  onBack, 
  onOpenTeacherDashboard,
  mode: propMode,
  onSwitchMode
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current mode from props or current pathname without merging
  const isTeacherRoute = location.pathname.startsWith('/teacher');
  const isTeacher = propMode ? propMode === 'teacher' : isTeacherRoute;

  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [showSwitchModal, setShowSwitchModal] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [isTeacher, location.pathname]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCopyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(identifier);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleCopyPromptText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(identifier);
    setTimeout(() => setCopiedPrompt(null), 2500);
  };

  const handleSwitchTarget = () => {
    setShowSwitchModal(false);
    if (isTeacher) {
      if (onSwitchMode) onSwitchMode('student');
      navigate('/bradley/mcp');
    } else {
      if (onSwitchMode) onSwitchMode('teacher');
      navigate('/teacher/mcp');
    }
  };

  const SERVER_URL = isTeacher ? 'https://begin-fin.com/teacher/mcp' : 'https://begin-fin.com/bradley/mcp';

  // Sample copyable prompts for the connection card
  const samplePrompt = isTeacher
    ? 'Draft a 45-minute lesson plan on paycheck deductions, W-4 withholdings, and FICA taxes using BeginFin Unit 2.'
    : 'I earn $20/hr working 35 hours a week. Can you break down my estimated payroll taxes and create a 50/30/20 budget for me?';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FA] text-[#3C3C3C] font-sans selection:bg-[#7F7FFA]/20 selection:text-[#7F7FFA]">
      <Helmet>
        <title>{isTeacher ? "Teacher MCP — Lesson Planning | BeginFin" : "Bradley MCP — Personal Finance AI Tutor | BeginFin"}</title>
        <meta 
          name="description" 
          content={isTeacher 
            ? "Connect your AI tool to BeginFin's National Standards-aligned personal finance curriculum, structured lesson plan generators, and simulator references." 
            : "Connect your AI tool to Bradley, BeginFin's encouraging personal finance tutor. Ask questions, compute 50/30/20 budgets, and practice quizzes."
          } 
        />
        <meta property="og:title" content={isTeacher ? "Teacher MCP — BeginFin" : "Bradley MCP — BeginFin"} />
        <meta property="og:description" content={isTeacher ? "Lesson planning, now directly in your AI tools." : "Bradley, now directly in your AI tools."} />
      </Helmet>

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-[#3C3C3C] hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="BeginFin Logo" 
                className="w-7 h-7 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
              />
              <span className="font-extrabold text-[#3C3C3C] text-base tracking-tight">BeginFin</span>
              <span className="text-slate-300 font-light">/</span>
              <span className="text-xs font-bold text-[#7F7FFA] tracking-tight">
                {isTeacher ? "Teacher MCP" : "Bradley MCP"}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {isTeacher && onOpenTeacherDashboard && (
              <button
                onClick={onOpenTeacherDashboard}
                className="px-4 py-2 bg-[#7F7FFA] hover:bg-[#6868EB] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Teacher Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section matching WelcomeScreen hero design language */}
        <section className="relative bg-gradient-to-b from-[#2b2d35] via-[#1a1c22] to-[#101115] pt-10 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
          
          {/* Rounded-Corner Hero Box Container with Interactive Cursor Glow */}
          <div 
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            className="relative w-full max-w-6xl rounded-[2.5rem] md:rounded-[3.2rem] bg-gradient-to-br from-[#3b437e] via-[#353c70] to-[#252a55] border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden select-none cursor-default py-14 sm:py-20 px-6 sm:px-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500"
          >
            {/* Dynamic Interactive Cursor Tracking Glow */}
            <div 
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle 650px at ${mousePosition.x}px ${mousePosition.y}px, rgba(165, 180, 252, 0.28) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 75%)`
              }}
            />

            {/* Ambient Hero Glow */}
            <div 
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle 650px at 50% 50%, rgba(127, 127, 250, 0.25) 0%, rgba(104, 104, 235, 0.10) 45%, transparent 75%)`
              }}
            />

            {/* Hero Inner Content */}
            <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6">
              
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#F4F8FA] text-[#3C3C3C] border border-[#7F7FFA]/20 rounded-full font-bold text-xs sm:text-sm shadow-lg tracking-tight">
                <Sparkles className="w-4 h-4 text-[#7F7FFA]" />
                <span>{isTeacher ? "Classroom Lesson Planning" : "Personal Finance AI Tutor"}</span>
              </div>

              {/* Main Headline with italic accent (NO 'favorite' before 'AI tools') */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight text-center max-w-4xl">
                {isTeacher ? (
                  <>Lesson planning, <span className="italic font-normal">now directly in your AI tools.</span></>
                ) : (
                  <>Bradley, <span className="italic font-normal">now directly in your AI tools.</span></>
                )}
              </h1>

              {/* Subtitle in plain, encouraging language */}
              <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
                {isTeacher 
                  ? "Empower your AI tool with BeginFin's National Standards-aligned curriculum, structured lesson plan generators, and simulator references."
                  : "Ask personal finance questions, calculate take-home pay, compute 50/30/20 budgets, and practice quizzes directly inside your AI tool."
                }
              </p>

              {/* Segmented Button Capsule for Server URL Copying */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-xl justify-center">
                <div className="flex items-center bg-black/90 rounded-full p-1.5 shadow-2xl border border-white/15 w-full justify-between">
                  <div className="flex items-center gap-2 pl-4 text-left min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7F7FFA]">URL:</span>
                    <span className="text-xs font-mono text-white truncate select-all">{SERVER_URL}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(SERVER_URL, 'hero-url')}
                    className="px-5 py-2.5 bg-white text-black font-extrabold text-xs rounded-full hover:bg-slate-100 transition-all active:scale-95 shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSnippet === 'hero-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'hero-url' ? 'Copied!' : 'Copy MCP URL'}</span>
                  </button>
                </div>
              </div>

              {/* Subtle Helper Text */}
              <p className="text-slate-300/80 text-xs font-medium tracking-tight">
                Add this URL to your AI tool's MCP settings to connect.
              </p>

            </div>
          </div>
        </section>

        {/* Approachable Bento Content Section */}
        <section className="pt-10 pb-20 bg-[#F4F8FA] border-t border-slate-200/60 relative z-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-10">

            {/* Quick Connection Bento Card */}
            <div className="bg-white p-7 sm:p-9 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#3C3C3C] tracking-tight">
                  How to connect to your AI tool
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Connect in three simple steps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2.5 p-5 rounded-[1.75rem] bg-[#F4F8FA] border border-slate-200/60">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#7F7FFA] font-extrabold flex items-center justify-center text-sm shadow-xs border border-slate-200/60">
                    1
                  </div>
                  <h3 className="text-base font-bold text-[#3C3C3C]">Open Integrations</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Open your AI tool's settings and look for the MCP or server connections section.
                  </p>
                </div>

                <div className="space-y-2.5 p-5 rounded-[1.75rem] bg-[#F4F8FA] border border-slate-200/60">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#7F7FFA] font-extrabold flex items-center justify-center text-sm shadow-xs border border-slate-200/60">
                    2
                  </div>
                  <h3 className="text-base font-bold text-[#3C3C3C]">Add BeginFin MCP URL</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Add a new server and paste <code className="font-mono text-[11px] text-[#7F7FFA] bg-white px-1.5 py-0.5 rounded border border-slate-200">{SERVER_URL}</code> as the server URL.
                  </p>
                </div>

                <div className="space-y-2.5 p-5 rounded-[1.75rem] bg-[#F4F8FA] border border-slate-200/60">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#7F7FFA] font-extrabold flex items-center justify-center text-sm shadow-xs border border-slate-200/60">
                    3
                  </div>
                  <h3 className="text-base font-bold text-[#3C3C3C]">Start Chatting</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTeacher 
                      ? "Prompt your AI tool to draft lesson plans, outline pacing guides, or map standards." 
                      : "Ask questions, compute wages, or practice quizzes right in your conversation."
                    }
                  </p>
                </div>
              </div>

              {/* Sample Prompt Capsule */}
              <div className="pt-2">
                <div className="bg-slate-900 text-slate-200 p-5 rounded-[1.75rem] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7F7FFA]">Sample prompt to try</span>
                    <p className="text-xs sm:text-sm text-white font-medium italic">
                      "{samplePrompt}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyPromptText(samplePrompt, 'sample-p')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedPrompt === 'sample-p' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt === 'sample-p' ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Capabilities Bento Grid */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#3C3C3C] tracking-tight">
                  {isTeacher ? "Teacher Capabilities" : "What Bradley can do for you"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {isTeacher 
                    ? "Grounded in BeginFin's verified 9-unit personal finance curriculum and National Standards."
                    : "Encouraging, judgment-free mentorship to build financial confidence in plain language."
                  }
                </p>
              </div>

              {/* Student Capabilities (6 cards) */}
              {!isTeacher && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Ask Bradley</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ask any money question. Bradley translates complex financial topics into relatable language without corporate jargon.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "How do I start building credit safely as an 18-year-old?"
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Paycheck & Budget Math</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Calculates mandatory payroll taxes (FICA), net take-home pay, and generates a personalized 50/30/20 monthly budget breakdown.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Calculate my take-home pay on a $48,000 annual salary."
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Explain Concepts</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Deep-dive explanations of compound interest, FICO credit factors, emergency funds, and tax brackets with real-world scenarios.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Explain how compound interest works over 30 years."
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Compare Financial Options</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Objective side-by-side trade-offs between options like Roth vs Traditional IRA, or Debt Avalanche vs Debt Snowball.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Compare a High-Yield Savings Account with a CD."
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Curriculum Glossary</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instant definitions for confusing terms like APY, FICA, deductible, out-of-pocket maximum, and index funds.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "What does FICA stand for on my paystub?"
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <Percent className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Quiz Practice</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Check your understanding with multiple-choice practice questions and clear educational explanations from all 9 units.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Give me a practice quiz question on credit scores."
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Capabilities (4 cards) */}
              {isTeacher && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Structured Lesson Plans</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Generate structured 45–90 minute lesson plans complete with real-world hooks, student activities, and formative checks for understanding.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Create a 60-minute lesson on compound interest and index funds."
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Wage & Living Cost Simulator</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      References take-home pay formulas, federal and state tax withholding calculations, and cost-of-living breakdowns with BeginFin tools.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Outline a classroom activity using the salary simulator."
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">National Standards Alignment</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instantly map classroom units to the National Standards for Personal Finance Education (NSPFE) and Jump$tart Coalition benchmarks.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Which NSPFE standards align with Unit 4 on debt and credit?"
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3C3C3C]">Custom Pacing Guides</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Build tailored multi-week course schedules for full-semester certifications, high school electives, or career readiness bootcamps.
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      "Generate a 9-week pacing guide covering all BeginFin modules."
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Approachable FAQ Section */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-normal text-[#3C3C3C] tracking-tight">
                Frequently Asked Questions
              </h2>

              <div className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#7F7FFA] font-bold text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>How does this compare to chatting directly on BeginFin?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  On the BeginFin website, Bradley has a 5-message daily quota to protect our community servers. By connecting the MCP server to your AI tool, you can ask unlimited questions and run calculations directly inside your own workflow.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Is my personal or student data tracked?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No. The MCP server exchanges only educational data and calculations. BeginFin does not track, collect, or store your queries, numbers, or conversations. All calculations are completely stateless.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Does Bradley give individualized investment or legal advice?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No. BeginFin provides objective financial education and explains foundational principles so learners can make informed decisions. We do not provide personalized stock picks, legal advice, or individualized tax preparation.
                </p>
              </div>
            </div>

            {/* Cross-Link Switcher Section at the End */}
            <div className="pt-6 pb-4">
              <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] text-center space-y-4 max-w-2xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F8FA] text-[#7F7FFA] flex items-center justify-center mx-auto border border-[#7F7FFA]/20">
                  {isTeacher ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#3C3C3C]">
                    {isTeacher ? "Looking for the student tutor?" : "Teaching personal finance in the classroom?"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {isTeacher
                      ? "Switch to our Bradley Student MCP for personal finance questions, budgeting calculations, and quiz practice."
                      : "Switch to our Teacher MCP for structured lesson plans, pacing guides, and National Standards alignment."
                    }
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowSwitchModal(true)}
                    className="px-6 py-3 bg-[#F4F8FA] hover:bg-[#7F7FFA]/10 text-[#7F7FFA] border border-[#7F7FFA]/30 rounded-full text-xs font-extrabold transition-all shadow-xs hover:border-[#7F7FFA] flex items-center gap-2 mx-auto cursor-pointer active:scale-95"
                  >
                    <span>
                      {isTeacher 
                        ? "Are you a student? View our student MCP instead." 
                        : "Are you a teacher? View our teacher MCP instead."
                      }
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Switcher Modal */}
      <Modal
        isOpen={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
        title={isTeacher ? "Switch to Student MCP" : "Switch to Teacher MCP"}
        size="sm"
      >
        <div className="p-6 space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center mx-auto border border-indigo-100">
            {isTeacher ? <MessageSquare className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-[#3C3C3C]">
              {isTeacher 
                ? "Are you a student? View our student MCP instead." 
                : "Are you a teacher? View our teacher MCP instead."
              }
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isTeacher 
                ? "Looking for Bradley, our personal finance AI tutor? You can connect Bradley directly to your AI tool to practice budgeting, calculate take-home pay, and master key financial concepts."
                : "Teaching personal finance? Our Teacher MCP lets your AI tool generate classroom lesson plans, reference National Standards, and build course pacing guides."
              }
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowSwitchModal(false)}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Stay Here
            </button>
            <button
              onClick={handleSwitchTarget}
              className="px-6 py-2.5 bg-[#7F7FFA] hover:bg-[#6868EB] text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{isTeacher ? "Go to Student MCP" : "Go to Teacher MCP"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <Link to="/termsofuse" className="hover:text-[#7F7FFA] transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/privacypolicy" className="hover:text-[#7F7FFA] transition-colors">Privacy Policy</Link>
          <span>•</span>
          <a href="mailto:support@begin-fin.com" className="hover:text-[#7F7FFA] transition-colors">support@begin-fin.com</a>
        </div>
        <p>© 2026 BeginFin. Open Educational Resource.</p>
      </footer>
    </div>
  );
};
