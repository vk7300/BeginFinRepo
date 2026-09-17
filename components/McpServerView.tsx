import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Copy, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  MessageSquare,
  Calculator,
  Compass,
  Scale,
  Calendar,
  Layers,
  FileText,
  Percent,
  CheckCircle2,
  ShieldCheck,
  Code2,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useNavPadding } from './Navbar';

export interface McpServerViewProps {
  onBack: () => void;
  onOpenTeacherDashboard?: () => void;
}

export const McpServerView: React.FC<McpServerViewProps> = ({ 
  onBack, 
  onOpenTeacherDashboard
}) => {
  const navigate = useNavigate();

  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'windsurf' | 'http'>('claude');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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

  const SERVER_URL = 'https://begin-fin.com/mcp';
  const SSE_URL = 'https://begin-fin.com/sse';

  const configSnippets = {
    claude: JSON.stringify({
      mcpServers: {
        beginfin: {
          url: SERVER_URL
        }
      }
    }, null, 2),
    cursor: JSON.stringify({
      mcpServers: {
        beginfin: {
          url: SERVER_URL
        }
      }
    }, null, 2),
    windsurf: JSON.stringify({
      mcpServers: {
        beginfin: {
          serverUrl: SERVER_URL
        }
      }
    }, null, 2),
    http: `curl -X POST ${SERVER_URL} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`
  };

  const samplePrompts = [
    {
      role: 'Student / Learner',
      prompt: 'I earn $22/hr working 35 hours a week in Texas. Can you break down my mandatory FICA taxes, estimated net take-home pay, and generate a 50/30/20 monthly budget?',
      icon: <Calculator className="w-4 h-4 text-emerald-500" />
    },
    {
      role: 'Teacher / Educator',
      prompt: 'Draft an interactive 50-minute lesson plan on paycheck deductions, Form W-4, and FICA taxes using BeginFin Unit 2, including a hands-on hook and formative quiz.',
      icon: <FileText className="w-4 h-4 text-indigo-500" />
    },
    {
      role: 'Curriculum & Concepts',
      prompt: 'Explain the difference between a Roth IRA and a Traditional 401(k) using plain, judgment-free language without corporate jargon.',
      icon: <Compass className="w-4 h-4 text-amber-500" />
    },
    {
      role: 'National Standards',
      prompt: 'Which National Standards for Personal Finance Education (NSPFE) benchmarks align with BeginFin Unit 4 on credit scores and debt payoff?',
      icon: <Scale className="w-4 h-4 text-purple-500" />
    }
  ];

  const navPadding = useNavPadding();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FA] text-[#3C3C3C] font-sans selection:bg-[#7F7FFA]/20 selection:text-[#7F7FFA]">
      <Helmet>
        <title>BeginFin MCP — All-Purpose Personal Finance & Classroom Tools</title>
        <meta 
          name="description" 
          content="Connect your AI tools (Claude, Cursor, Windsurf, ChatGPT) to BeginFin's all-purpose Model Context Protocol server. Access personal finance tutoring, paycheck tax calculators, 50/30/20 budget tools, quiz practice, and lesson plans." 
        />
        <meta property="og:title" content="BeginFin MCP — All-Purpose Personal Finance & Classroom Tools" />
        <meta property="og:description" content="One unified MCP server for personal finance tutoring, budgeting calculators, quizzes, lesson planning, and national curriculum standards." />
      </Helmet>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className={`relative bg-gradient-to-b from-[#2b2d35] via-[#1a1c22] to-[#101115] ${navPadding} pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center`}>
          
          {/* Rounded Hero Box */}
          <div 
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            className="relative w-full max-w-6xl rounded-[2.5rem] md:rounded-[3.2rem] bg-gradient-to-br from-[#3b437e] via-[#353c70] to-[#252a55] border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden select-none cursor-default py-14 sm:py-20 px-6 sm:px-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500"
          >
            {/* Dynamic Interactive Cursor Glow */}
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
                <span>Unified Model Context Protocol Server</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight text-center max-w-4xl">
                Personal finance tutoring & teaching, <span className="italic font-normal">now directly in your AI tools.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
                One cohesive, all-purpose MCP server. Access personal finance tutoring, compute paychecks and 50/30/20 budgets, practice quizzes, generate classroom lesson plans, and explore National Standards.
              </p>

              {/* Segmented Capsule for Server URL Copying */}
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

              {/* SSE Alternative Note */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300/90 text-xs font-medium tracking-tight">
                <span>Also supports Server-Sent Events (SSE):</span>
                <button
                  onClick={() => handleCopyText(SSE_URL, 'sse-url')}
                  className="font-mono text-[11px] text-[#A5B4FC] hover:text-white underline underline-offset-4 cursor-pointer flex items-center gap-1"
                >
                  <span>{SSE_URL}</span>
                  {copiedSnippet === 'sse-url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pt-10 pb-20 bg-[#F4F8FA] border-t border-slate-200/60 relative z-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-12">

            {/* Quick Connection Card */}
            <div className="bg-white p-7 sm:p-9 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#3C3C3C] tracking-tight">
                  How to connect in 3 steps
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Compatible with Claude Desktop, Claude Code, Cursor, Windsurf, Cline, and any MCP-compliant client.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2.5 p-5 rounded-[1.75rem] bg-[#F4F8FA] border border-slate-200/60">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#7F7FFA] font-extrabold flex items-center justify-center text-sm shadow-xs border border-slate-200/60">
                    1
                  </div>
                  <h3 className="text-base font-bold text-[#3C3C3C]">Open MCP Settings</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Open your AI tool's settings and locate the Model Context Protocol (MCP) or external tools configuration.
                  </p>
                </div>

                <div className="space-y-2.5 p-5 rounded-[1.75rem] bg-[#F4F8FA] border border-slate-200/60">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#7F7FFA] font-extrabold flex items-center justify-center text-sm shadow-xs border border-slate-200/60">
                    2
                  </div>
                  <h3 className="text-base font-bold text-[#3C3C3C]">Add BeginFin MCP URL</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Add a new server with URL <code className="font-mono text-[11px] text-[#7F7FFA] bg-white px-1.5 py-0.5 rounded border border-slate-200 select-all">{SERVER_URL}</code>.
                  </p>
                </div>

                <div className="space-y-2.5 p-5 rounded-[1.75rem] bg-[#F4F8FA] border border-slate-200/60">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#7F7FFA] font-extrabold flex items-center justify-center text-sm shadow-xs border border-slate-200/60">
                    3
                  </div>
                  <h3 className="text-base font-bold text-[#3C3C3C]">Start Prompting</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ask financial literacy questions, run paycheck tax math, generate lesson plans, or review curriculum standards.
                  </p>
                </div>
              </div>

              {/* Client Config Code Snippet Box */}
              <div className="pt-2">
                <div className="bg-[#0b0e26] rounded-[2rem] p-5 sm:p-6 text-slate-200 border border-white/10 shadow-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#7F7FFA]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Configuration Snippet</span>
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                      <button
                        onClick={() => setActiveTab('claude')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'claude' ? 'bg-[#7F7FFA] text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                      >
                        Claude
                      </button>
                      <button
                        onClick={() => setActiveTab('cursor')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'cursor' ? 'bg-[#7F7FFA] text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                      >
                        Cursor
                      </button>
                      <button
                        onClick={() => setActiveTab('windsurf')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'windsurf' ? 'bg-[#7F7FFA] text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                      >
                        Windsurf
                      </button>
                      <button
                        onClick={() => setActiveTab('http')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'http' ? 'bg-[#7F7FFA] text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                      >
                        cURL
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 bg-black/40 rounded-xl border border-white/5 leading-relaxed">
                      {configSnippets[activeTab]}
                    </pre>
                    <button
                      onClick={() => handleCopyText(configSnippets[activeTab], `tab-${activeTab}`)}
                      className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
                    >
                      {copiedSnippet === `tab-${activeTab}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippet === `tab-${activeTab}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Interactive Prompt Examples */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#3C3C3C] tracking-tight">
                  Sample prompts to try
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Copy any of these prompts into your connected AI tool to test the capabilities immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {samplePrompts.map((p, idx) => (
                  <div 
                    key={idx}
                    className="bg-white p-5 rounded-[1.75rem] border border-slate-200/70 shadow-xs flex flex-col justify-between gap-3 hover:border-[#7F7FFA]/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {p.icon}
                        <span>{p.role}</span>
                      </div>
                      <p className="text-xs text-[#3C3C3C] font-medium italic leading-relaxed">
                        "{p.prompt}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleCopyPromptText(p.prompt, `sample-${idx}`)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#7F7FFA]/10 text-slate-700 hover:text-[#7F7FFA] rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedPrompt === `sample-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPrompt === `sample-${idx}` ? 'Copied' : 'Copy Prompt'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full All-in-One Capabilities Showcase */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#3C3C3C] tracking-tight">
                  Unified Toolset (15 Built-in Tools)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Everything both students and teachers need, accessible in a single server connection.
                </p>
              </div>

              {/* Student & Personal Finance Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#7F7FFA]">
                  <Sparkles className="w-4 h-4" />
                  <span>Student Mentorship & Calculation Tools</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Financial Literacy Mentorship</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ask any money question. Translates complex financial topics into clear, plain language grounded in BeginFin's verified 9-unit curriculum without corporate pretense or sales pitches.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: ask_bradley
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Paycheck & 50/30/20 Math</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Calculates mandatory FICA taxes (Social Security 6.2% + Medicare 1.45%), estimated federal withholding, and monthly 50/30/20 targets.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: calculate_paycheck_and_budget
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Explain Concepts</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Structured breakdowns of compound interest, FICO credit factors, Roth vs Traditional IRAs, emergency funds, and HSA tax benefits.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: explain_concept
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Compare Financial Options</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Side-by-side trade-offs between options like Debt Avalanche vs Snowball, Roth vs Traditional, or HYSA vs Certificates of Deposit.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: compare_financial_options
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Curriculum Glossary</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instant definitions for financial vocabulary like APY, amortization, FICA, deductible, out-of-pocket maximum, and mutual funds.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: get_curriculum_glossary
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <Percent className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Practice Quizzes</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Multiple-choice questions with answer keys and complete educational explanations across all 9 BeginFin units.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: practice_quiz_question
                    </div>
                  </div>
                </div>
              </div>

              {/* Educator & Classroom Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#10B981]">
                  <GraduationCap className="w-4 h-4" />
                  <span>Educator & Curriculum Tools</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Lesson Plan Generator</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Produce structured 45–90 minute classroom lesson plans with interactive hooks, group activities, and formative checks.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: generate_lesson_plan
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Curriculum Overview</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Access all 9 BeginFin curriculum units, learning outcomes, lesson outlines, and Spanish language translations.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: get_curriculum, get_unit_details
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Standards Alignment</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Maps any BeginFin unit directly to the National Standards for Personal Finance Education (NSPFE) and Jump$tart benchmarks.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: get_standards_alignment
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Pacing Sequences</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Semester, quarter, elective, or intensive bootcamp schedule templates covering all 9 core personal finance units.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: get_pacing_guide
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Classroom Activity Bank</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ready-to-use simulations, stock market games, budgeting challenges, and debt payoff scenarios for student engagement.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: suggest_activities
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#3C3C3C]">Teacher Portal Guide</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Guidance on Google Classroom sync, class codes, student gradebook monitoring, and official completion certificates.
                    </p>
                    <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-400">
                      tool: get_teacher_dashboard_guide
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Approachable FAQ Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl sm:text-3xl font-normal text-[#3C3C3C] tracking-tight">
                Frequently Asked Questions
              </h2>

              <div className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#7F7FFA] font-bold text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>Why does BeginFin offer an MCP server instead of an in-app chatbot?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Rather than confining learners to a walled-garden web chatbot, BeginFin's Model Context Protocol (MCP) server integrates natively into whatever AI environment you already use—Claude Desktop, Cursor, Windsurf, ChatGPT, or custom agents. You get direct access to BeginFin's verified 9-unit curriculum, financial calculators, and lesson planning tools with zero paywalls, zero ads, and zero daily caps.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Is any user, student, or personal financial data collected or tracked?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No. The MCP server is completely stateless and exchanges only open educational curriculum data and calculations. BeginFin never tracks, collects, or logs your prompts, personal figures, student rosters, or private chats.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Does BeginFin provide individualized financial advice?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No. BeginFin provides objective financial literacy education and explains foundational principles so learners can make their own informed decisions. We never provide stock picks, legal advice, or individualized tax preparation.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8 px-6 text-center text-xs text-neutral-400 space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-neutral-300">
          <Link to="/termsofuse" className="hover:text-white transition-colors">Terms of Use</Link>
          <span>•</span>
          <Link to="/privacypolicy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/status" className="hover:text-white transition-colors">System Status</Link>
          <span>•</span>
          <a href="mailto:support@begin-fin.com" className="hover:text-white transition-colors">support@begin-fin.com</a>
        </div>
        <p>© 2026 BeginFin. Open Educational Resource.</p>
      </footer>
    </div>
  );
};
