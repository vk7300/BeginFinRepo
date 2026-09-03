import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  GraduationCap, 
  Server, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  HelpCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Mail,
  Users,
  Award,
  Globe,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface McpServerViewProps {
  onBack: () => void;
  onOpenTeacherDashboard?: () => void;
}

export const CLAUDE_DESKTOP_CONFIG_SNIPPET = `{
  "mcpServers": {
    "beginfin": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://begin-fin.com/sse"]
    }
  }
}`;

export const CURSOR_CONFIG_SNIPPET = `{
  "mcpServers": {
    "beginfin": {
      "url": "https://begin-fin.com/sse"
    }
  }
}`;

export const McpServerView: React.FC<McpServerViewProps> = ({ onBack, onOpenTeacherDashboard }) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'capabilities' | 'curriculum' | 'faq'>('connect');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
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

  const SERVER_URL = 'https://begin-fin.com/mcp';
  const SSE_URL = 'https://begin-fin.com/sse';

  const handleCopyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(identifier);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleDownloadConfig = () => {
    const config = `{
  "mcpServers": {
    "beginfin": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${SSE_URL}"]
    }
  }
}`;
    const element = document.createElement('a');
    const file = new Blob([config], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'claude_desktop_config.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FA] text-[#3C3C3C] font-sans selection:bg-[#7F7FFA]/20 selection:text-[#7F7FFA]">
      <Helmet>
        <title>BeginFin MCP Server: Connect AI to Financial Literacy Curriculum</title>
        <meta name="description" content="Connect Claude, Cursor, or your AI workspace to BeginFin's National Standards-aligned personal finance curriculum via Model Context Protocol (MCP)." />
        <meta property="og:title" content="BeginFin MCP Server - AI Curriculum Connection" />
        <meta property="og:description" content="Empower your AI assistant with BeginFin's 9-unit financial literacy curriculum and Wage & Living Cost Simulator." />
      </Helmet>

      {/* Glassmorphic Top Nav Header matching WelcomeScreen */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="BeginFin Logo" 
                className="w-7 h-7 object-contain rounded-xl shadow-xs" 
                referrerPolicy="no-referrer"
              />
              <span className="font-extrabold text-[#3C3C3C] text-base tracking-tight">BeginFin</span>
              <span className="text-slate-300 font-light">/</span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7F7FFA]/10 text-[#7F7FFA] font-bold text-xs border border-[#7F7FFA]/20">
                <Server className="w-3.5 h-3.5" />
                <span>MCP Server</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Free ($0 Cost)
            </span>
            {onOpenTeacherDashboard && (
              <button
                onClick={onOpenTeacherDashboard}
                className="flex px-3.5 py-1.5 bg-[#7F7FFA] hover:bg-[#6868EB] text-white rounded-full text-xs font-bold transition-all shadow-xs items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Teacher Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section matching WelcomeScreen Hero Frame */}
        <section className="relative bg-gradient-to-b from-[#2b2d35] via-[#1a1c22] to-[#101115] pt-10 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
          
          {/* Rounded-Corner Hero Box Container with Dynamic Tracking Glow */}
          <div 
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-full max-w-6xl rounded-[2.5rem] md:rounded-[3.2rem] bg-gradient-to-br from-[#3b437e] via-[#353c70] to-[#252a55] border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden select-none cursor-default py-14 sm:py-18 px-6 sm:px-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700"
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
              
              {/* Top Pill Badge matching WelcomeScreen */}
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#F4F8FA] text-[#3C3C3C] border border-[#7F7FFA]/20 rounded-full font-bold text-xs sm:text-sm shadow-lg tracking-tight">
                <Sparkles className="w-4 h-4 text-[#7F7FFA]" />
                <span>Model Context Protocol (MCP)</span>
              </div>

              {/* Main Headline styled in Inter */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight text-center max-w-4xl">
                BeginFin, <span className="italic font-normal">now in your favorite AI tools.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
                Empower Claude, Cursor, or your AI workspace with BeginFin’s 9-unit National Standards-aligned curriculum and Wage & Living Cost Simulator.
              </p>

              {/* Segmented Button Capsule for Endpoint Copying */}
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
                    <span>{copiedSnippet === 'hero-url' ? 'Copied!' : 'Copy Server URL'}</span>
                  </button>
                </div>
              </div>

              {/* Terms Subtext */}
              <p className="text-slate-300/80 text-xs font-medium tracking-tight pt-2">
                100% Free Open Educational Resource • No API Keys Required • Zero User Data Transferred
              </p>

            </div>
          </div>
        </section>

        {/* Bento Grid Content Section */}
        <section className="pt-8 pb-20 bg-[#F4F8FA] border-t border-slate-200/60 relative z-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
            
            {/* Top Row Bento Stat Metrics (matching WelcomeScreen Bento Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Bento Metric 1: 100% Free / $0 Cost */}
              <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 hover:shadow-[0_12px_35px_rgba(127,127,250,0.12)] transition-all duration-500 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-11 h-11 bg-[#F4F8FA] rounded-xl border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-normal text-[#3C3C3C] tracking-tight">$0 Cost</h3>
                    <p className="text-xs font-bold text-[#3C3C3C] mt-1">100% Free & Open Access</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">Zero subscription, credits, or marginal cost</p>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Always Free
                  </span>
                </div>
              </div>

              {/* Bento Metric 2: 9 Standards-Aligned Units */}
              <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 hover:shadow-[0_12px_35px_rgba(127,127,250,0.12)] transition-all duration-500 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-11 h-11 bg-[#F4F8FA] rounded-xl border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-normal text-[#3C3C3C] tracking-tight">9 Units</h3>
                    <p className="text-xs font-bold text-[#3C3C3C] mt-1">National Standards Aligned</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">Mapped to CEE & Jump$tart frameworks</p>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <CheckCircle2 className="w-4 h-4 text-[#7F7FFA]" />
                </div>
              </div>

            </div>

            {/* Section Switcher Tabs formatted as Segmented Capsule */}
            <div className="flex justify-center">
              <div className="bg-white rounded-full p-1.5 shadow-md border border-slate-200 flex flex-wrap gap-1">
                {[
                  { id: 'connect', label: 'Connect Assistant', icon: <Zap className="w-3.5 h-3.5" /> },
                  { id: 'capabilities', label: 'AI Capabilities', icon: <Sparkles className="w-3.5 h-3.5" /> },
                  { id: 'curriculum', label: 'Curriculum & Tools', icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { id: 'faq', label: 'Architecture & FAQ', icon: <HelpCircle className="w-3.5 h-3.5" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#7F7FFA] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: CONNECT YOUR AI (BENTO GRID LAYOUT) */}
            {activeTab === 'connect' && (
              <div className="space-y-6">
                
                {/* 12-Column Main Connection Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Bento Card 1: Claude.ai Web Connector (col-span-7) */}
                  <div className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-lg border border-amber-200">
                            ⚡
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">Web Browser Integration</span>
                            <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">Claude.ai Web Connector</h3>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyText(SERVER_URL, 'claude-web')}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedSnippet === 'claude-web' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSnippet === 'claude-web' ? 'Copied' : 'Copy Server URL'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="bg-[#F4F8FA] p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Step 1</span>
                          <h4 className="text-xs font-bold text-[#3C3C3C]">Open Settings</h4>
                          <p className="text-[11px] text-slate-500">In Claude.ai, open <strong>Settings &rarr; Integrations</strong>.</p>
                        </div>
                        <div className="bg-[#F4F8FA] p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Step 2</span>
                          <h4 className="text-xs font-bold text-[#3C3C3C]">Add Server</h4>
                          <p className="text-[11px] text-slate-500">Name: <strong>BeginFin</strong><br />Type: <strong>Streamable HTTP</strong></p>
                        </div>
                        <div className="bg-[#F4F8FA] p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Step 3</span>
                          <h4 className="text-xs font-bold text-[#3C3C3C]">Paste URL</h4>
                          <p className="text-[11px] font-mono text-[#7F7FFA] break-all">{SERVER_URL}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl p-4 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#7F7FFA] shrink-0" />
                      <p className="text-xs text-[#3C3C3C] font-medium leading-relaxed">
                        <strong>Example prompt:</strong> <em>"Plan a 45-minute lesson on take-home pay and tax deductions using BeginFin Unit 2."</em>
                      </p>
                    </div>
                  </div>

                  {/* Bento Card 2: Claude Desktop Config (col-span-5) */}
                  <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#7F7FFA] font-bold flex items-center justify-center text-lg border border-indigo-100">
                            💻
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7F7FFA]">macOS & Windows</span>
                            <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">Claude Desktop App</h3>
                          </div>
                        </div>
                        <button
                          onClick={handleDownloadConfig}
                          className="px-3.5 py-1.5 bg-[#7F7FFA] hover:bg-[#6868EB] text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download config.json</span>
                        </button>
                      </div>

                      <div className="relative">
                        <pre className="bg-slate-950 text-indigo-200 text-xs font-mono p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed">
                          {CLAUDE_DESKTOP_CONFIG_SNIPPET}
                        </pre>
                        <button
                          onClick={() => handleCopyText(CLAUDE_DESKTOP_CONFIG_SNIPPET, 'desktop-snippet')}
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                        >
                          {copiedSnippet === 'desktop-snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSnippet === 'desktop-snippet' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Save in <code className="text-slate-700 font-mono">claude_desktop_config.json</code> and restart Claude.
                    </p>
                  </div>

                  {/* Bento Card 3: Cursor & AI Workspaces (col-span-6) */}
                  <div className="lg:col-span-6 bg-white p-7 sm:p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-lg border border-purple-100">
                            🛠️
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-700">Developer Tools</span>
                            <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">Cursor & AI Code Editors</h3>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyText(SSE_URL, 'cursor-url')}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedSnippet === 'cursor-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSnippet === 'cursor-url' ? 'Copied' : 'Copy SSE URL'}</span>
                        </button>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600">
                        <p>In Cursor <strong>Settings &rarr; Features &rarr; MCP Servers</strong>, add a server with type <strong>SSE</strong> and URL:</p>
                        <code className="block bg-[#F4F8FA] p-3 rounded-2xl text-xs font-mono text-purple-700 border border-slate-200 select-all">
                          {SSE_URL}
                        </code>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Server-Sent Events (SSE) Protocol</span>
                      <CheckCircle2 className="w-4 h-4 text-[#7F7FFA]" />
                    </div>
                  </div>

                  {/* Bento Card 4: Wage and Living Cost Simulator (col-span-6) */}
                  <div className="lg:col-span-6 bg-white p-7 sm:p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-lg border border-emerald-100">
                            📊
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">Interactive Browser Tool</span>
                            <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">Wage & Living Cost Simulator</h3>
                          </div>
                        </div>
                        <a 
                          href="https://begin-fin.com/tools" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-[#7F7FFA]/10 text-[#7F7FFA] hover:bg-[#7F7FFA]/20 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <span>Open Tool</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        Calculates take-home pay, federal income taxes, FICA (Social Security & Medicare) withholdings, and balances real-world living expenses across career choices and metropolitan living costs.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">Unit 1 & 2 Aligned</span>
                      <Sliders className="w-4 h-4 text-[#7F7FFA]" />
                    </div>
                  </div>

                </div>

                {/* Student-Led Application & Inaccuracy Reporting Bento Notice */}
                <div className="bg-white p-7 rounded-[2rem] border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#3C3C3C] text-sm">Student-Led Open Resource Notice</h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        BeginFin is an educational project created and maintained by high school students with limited resources. Our MCP server, website content, Bradley AI tutor, and simulators may contain unintentional inaccuracies.
                      </p>
                    </div>
                  </div>
                  <a
                    href="mailto:support@begin-fin.com?subject=BeginFin%20Inaccuracy%20Report"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-all shrink-0 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#7F7FFA]" />
                    <span>Report to support@begin-fin.com</span>
                  </a>
                </div>

              </div>
            )}

            {/* TAB 2: AI CAPABILITIES */}
            {activeTab === 'capabilities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold text-lg border border-indigo-100">
                    🎓
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7F7FFA]">Instant Lesson Plans</span>
                    <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">Structured Classroom Lesson Plans</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Generate structured 45–90 minute lesson plans with real-world hooks, student activities, and checks for understanding grounded in BeginFin units.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
                    📊
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Simulators & Math</span>
                    <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">Wage & Living Cost Simulator</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your AI assistant automatically references take-home pay, federal/state tax calculations, and cost-of-living breakdowns with direct links to begin-fin.com/tools.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100">
                    ⚖️
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">Framework Alignment</span>
                    <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">National Standards Alignment</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Instantly map lessons to the National Standards for Personal Finance Education (NSPFE) and Jump$tart Coalition benchmarks.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40 transition-all duration-500 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100">
                    🗺️
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600">Syllabus & Calendars</span>
                    <h3 className="text-xl font-normal text-[#3C3C3C] tracking-tight">Custom Pacing Guides</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tailor multi-week course schedules for full semester certifications, high school bootcamps, or career readiness.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: CURRICULUM & TOOLS */}
            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                
                {/* 9-Unit Curriculum Overview */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7F7FFA]">Core Modules</span>
                    <h3 className="text-2xl font-normal text-[#3C3C3C] tracking-tight">BeginFin 9-Unit Curriculum</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Comprehensive, 100% free curriculum vetted for National Standards alignment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { num: 1, title: 'Personal Finance Fundamentals', desc: 'Bank accounts, budgeting, net worth, and 50/30/20 rule.' },
                      { num: 2, title: 'Job Finance & USA Taxes', desc: 'Paychecks, gross vs net pay, W-2 vs W-4, and tax brackets.' },
                      { num: 3, title: 'Investing Basics', desc: 'Stocks, bonds, index funds, ETFs, and compound interest.' },
                      { num: 4, title: 'Debt & Credit Mastery', desc: 'FICO credit scores, APR, and Avalanche vs Snowball payoff.' },
                      { num: 5, title: 'Retirement Planning & Taxes', desc: 'Traditional vs Roth 401(k) & IRA, employer matches.' },
                      { num: 6, title: 'Filing Taxes Roadmap', desc: '5-step guide to filing a first US Federal Tax Return.' },
                      { num: 7, title: 'Insurance & Risk Management', desc: 'Premiums, deductibles, liability, and emergency funds.' },
                      { num: 8, title: 'Consumer Rights & Philanthropy', desc: 'Credit freezes, FCRA rights, identity protection, giving.' },
                      { num: 9, title: 'Medical Finances', desc: 'Health plans, reading EOB bills, and the No Surprises Act.' }
                    ].map((unit) => (
                      <div key={unit.num} className="p-4 rounded-2xl border border-slate-200/70 bg-[#F4F8FA] space-y-1.5 hover:border-[#7F7FFA]/40 transition-colors">
                        <span className="text-[10px] font-extrabold text-[#7F7FFA] bg-[#7F7FFA]/10 px-2 py-0.5 rounded-full border border-[#7F7FFA]/20">
                          Unit {unit.num}
                        </span>
                        <h4 className="font-bold text-[#3C3C3C] text-xs pt-1">{unit.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{unit.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: ARCHITECTURE & FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                
                <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#7F7FFA] font-bold text-sm">
                    <HelpCircle className="w-4 h-4" />
                    <span>How does the Model Context Protocol (MCP) work?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Model Context Protocol (MCP) is an open standard that connects your AI assistant (like Claude or Cursor) directly to BeginFin's verified curriculum. Your AI can query unit outlines, learning objectives, and lesson plan templates in real time without hallucination.
                  </p>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>How much does the BeginFin MCP server cost?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>$0 — Completely Free.</strong> The MCP server runs on BeginFin's open infrastructure with zero extra marginal cost. It does not use paid API keys, paid credits, or paid database queries. Connecting and using it with your AI assistant is 100% free.
                  </p>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>What data is transferred over MCP?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Only curriculum and educational expertise.</strong> The server only exchanges public unit outlines, standards alignments, lesson plan templates, and simulator links. Zero student or user personal data is ever collected, tracked, or transferred.
                  </p>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Are outputs guaranteed to be 100% accurate?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    BeginFin is a high school student-led open educational resource built with limited resources. While our materials are vetted against national standards, AI responses and materials may contain unintentional inaccuracies. Please independently verify facts and report any issues to <strong>support@begin-fin.com</strong>.
                  </p>
                </div>

              </div>
            )}

          </div>
        </section>
      </main>

      {/* Footer matching standard BeginFin footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <Link to="/termsofuse" className="hover:text-[#7F7FFA] transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/privacypolicy" className="hover:text-[#7F7FFA] transition-colors">Privacy Policy</Link>
          <span>•</span>
          <a href="mailto:support@begin-fin.com" className="hover:text-[#7F7FFA] transition-colors">support@begin-fin.com</a>
        </div>
        <p>© 2026 BeginFin. Student-led open educational resource. Founded in Temple, Texas.</p>
      </footer>
    </div>
  );
};
