import React from 'react';
import { ArrowLeft, Download, Printer, ChevronRight, BookOpen, Users, Shield, CheckCircle2, Info, Mail, Terminal, Server, Code2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { jsPDF } from 'jspdf';
import { useNavPadding } from './Navbar';

interface Props {
  onBack: () => void;
}

export const QuickStartGuide: React.FC<Props> = ({ onBack }) => {
  const sections = [
    { id: 'intro', title: '1. Overview' },
    { id: 'teacher', title: '2. Teacher Account Setup' },
    { id: 'classroom', title: '3. Google Classroom Integration' },
    { id: 'assignments', title: '4. Managing Assignments & Challenges' },
    { id: 'mcp', title: '5. Model Context Protocol (MCP) Infrastructure' },
    { id: 'student', title: '6. Student Account Setup' },
    { id: 'privacy', title: '7. Privacy & Data Governance' },
    { id: 'checklist', title: '8. Implementation Checklist' },
    { id: 'support', title: '9. Support & Contact' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 25;

    const addHeaderFooter = (pageNum: number, totalPages: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      
      doc.text('BEGINFIN EDUCATOR RESOURCES', margin, 12);
      doc.text('QUICK START GUIDE', pageWidth - margin - 35, 12);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);

      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.text(`Page ${pageNum} of ${totalPages}`, margin, pageHeight - 10);
      doc.text('begin-fin.com', pageWidth - margin - 25, pageHeight - 10);
    };

    // Header block
    doc.setFillColor(11, 15, 25);
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 26, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('BeginFin Educator Quick Start Guide', margin + 8, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(127, 127, 250);
    doc.text('Classroom Setup, MCP Infrastructure, Student Management & Implementation', margin + 8, y + 16);

    y += 32;

    const addSectionHeader = (num: string, title: string) => {
      if (y + 25 > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(127, 127, 250);
      doc.text(`${num}. ${title}`, margin, y);
      y += 2;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    };

    const addParagraph = (text: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      if (y + lines.length * 4 > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }
      doc.text(lines, margin, y);
      y += lines.length * 4 + 4;
    };

    // 1. Overview
    addSectionHeader('1', 'OVERVIEW');
    addParagraph('BeginFin provides interactive personal finance education tailored for classroom and self-paced instruction. The platform combines student learning modules with educator progress reporting tools.');
    addParagraph('- Interactive Modules: Step-by-step instruction with concept validation quizzes.\n- Class Dashboard: Real-time completion tracking and performance summaries.\n- Browser-Based: Runs directly in standard web browsers with zero software installation.\n- Embedded Simulators: Includes Career & Budget Simulator (Austin, TX) and Credit Score Game.');

    // 2. Teacher Account Setup
    addSectionHeader('2', 'TEACHER ACCOUNT SETUP');
    addParagraph('1. Register Account: Select Teacher account type during registration using your preferred email.\n2. Create Class: Define class sections corresponding to your teaching schedule.\n3. Share Class Code: Distribute the generated class code for students to join your roster.');

    // 3. Google Classroom Integration
    addSectionHeader('3', 'GOOGLE CLASSROOM INTEGRATION');
    addParagraph('Educators can link Google Classroom courses via OAuth to import student rosters, publish NSPFE-aligned coursework, and automatically sync completed module grades with one click.');

    // 4. Managing Assignments
    addSectionHeader('4', 'MANAGING ASSIGNMENTS & CHALLENGES');
    addParagraph('Creating Challenges: Select required financial units, set target completion dates, and assign to individual class periods.\n\nReviewing Progress: Monitor completion rates, review quiz attempt summaries, and export grade summaries to CSV.');

    // 5. Model Context Protocol (MCP) Infrastructure
    addSectionHeader('5', 'MODEL CONTEXT PROTOCOL (MCP) INFRASTRUCTURE');
    addParagraph('BeginFin utilizes an open Model Context Protocol (MCP) architecture ($0 cost, zero data transfer). Educators and students can integrate the BeginFin curriculum directly into Claude Desktop, Cursor, Windsurf, or custom AI agents:\n\n- Stateless Protocol: Zero student records, personal information, or chat histories are ever collected or stored.\n- Curricular Scope: Delivers all 9 NSPFE-aligned modules, 50/30/20 budget calculations, tax withholding formulas, and lesson plan generators.\n- Server Endpoints: Connect via SSE (https://begin-fin.com/sse) or HTTP POST (https://begin-fin.com/mcp).');

    // 6. Student Account Setup
    addSectionHeader('6', 'STUDENT ACCOUNT SETUP');
    addParagraph('Students register using email credentials or permitted SSO options and input the teacher\'s class code during sign-up to join the class roster.\n\nGuest Mode: Allows immediate exploration of learning units without account creation. Guest progress is not saved to a class gradebook.');

    // 7. Privacy & Data Governance
    addSectionHeader('7', 'PRIVACY & DATA GOVERNANCE');
    addParagraph('Privacy Protocols: Minimal operational data is collected solely for student progress tracking. Student records are not sold or used for third-party advertising. We will share your name and email with Certifier.io, a trusted 3rd party digital credential provider, if the user requests.\n\nTerms of Service: Designed for educational instruction. Users maintain full control over account credentials and data deletion requests.');

    // 8. Implementation Checklist
    addSectionHeader('8', 'IMPLEMENTATION CHECKLIST');
    addParagraph('Step 1: Create Teacher account\nStep 2: Set up class section and generate code\nStep 3: Connect Google Classroom (Optional)\nStep 4: Distribute class code to students\nStep 5: Students sign up and enter class code\nStep 6: Create and assign learning challenge\nStep 7: Connect BeginFin MCP server to AI assistant (Optional)\nStep 8: Review completion stats on teacher dashboard');

    // 9. Support Contacts
    addSectionHeader('9', 'SUPPORT & CONTACTS');
    addParagraph('For any general inquiries, classroom assistance, account support, or media requests, please contact our team:\n\nEmail: support@begin-fin.com\nWebsite: https://begin-fin.com');

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHeaderFooter(i, totalPages);
    }

    doc.save('BeginFin_Educator_Quick_Start_Guide.pdf');
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn("window.print() prevented, falling back to PDF download", err);
      generatePDF();
    }
  };

  const navPadding = useNavPadding();

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-24 ${navPadding}`}>
      <Helmet>
        <title>Quick Start Guide | BeginFin Educator Resources</title>
      </Helmet>

      {/* Guide Sub-Bar Actions */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-2 flex items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#7F7FFA]/10 text-[#7F7FFA] font-extrabold uppercase tracking-wider">
            Educator & Student Handbook
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
            title="Print Guide"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={generatePDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b0f19] hover:bg-[#7F7FFA] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#7F7FFA]" />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-6 flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 no-print sticky top-28 h-fit">
          <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#7F7FFA] mb-3 px-3">
              Guide Navigation
            </div>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-[#7F7FFA] hover:bg-[#F4F8FA] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>{section.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#7F7FFA]" />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Guide Article Content */}
        <article className="flex-1 space-y-12">
          
          {/* Cover Hero Bento Section */}
          <section className="bg-[#0b0f19] text-white p-8 md:p-12 rounded-[32px] border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7F7FFA]/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-[#7F7FFA] border border-white/10 inline-block mb-6">
                Educator Guide
              </span>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                Quick Start Guide
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                An overview for teachers and program leaders to set up classrooms, assign modules, track progress, and facilitate personal finance education.
              </p>
            </div>
          </section>

          {/* 1. Overview */}
          <section id="intro" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                01
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Overview</h2>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              BeginFin provides interactive personal finance education tailored for classroom and self-paced instruction. The platform combines student learning modules with educator progress reporting tools.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {[
                { icon: BookOpen, title: 'Interactive Modules', desc: 'Step-by-step instruction with concept validation quizzes.' },
                { icon: Users, title: 'Class Dashboard', desc: 'Real-time completion tracking and performance summaries.' },
                { icon: Shield, title: 'Browser-Based', desc: 'Runs directly in standard web browsers with zero software installation.' }
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                  <item.icon className="w-5 h-5 text-[#7F7FFA]" />
                  <h3 className="font-bold text-[#3C3C3C] text-xs">{item.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-normal">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-[#F4F8FA] rounded-2xl border border-[#7F7FFA]/20 space-y-3">
              <h3 className="font-bold text-[#3C3C3C] text-xs uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[#7F7FFA]" /> Embedded Simulators
              </h3>
              <ul className="space-y-2 text-slate-700 text-xs font-normal">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7F7FFA] shrink-0 mt-0.5" />
                  <span><strong>Career & Budget Simulator:</strong> Allows students to examine gross income, taxes, local housing costs, and savings rates across sample professions in Austin, TX.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7F7FFA] shrink-0 mt-0.5" />
                  <span><strong>Credit Score Game:</strong> Evaluates decision-making scenarios regarding borrowing, credit utilization, and timely payments.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 2. Teacher Account Setup */}
          <section id="teacher" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                02
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Teacher Account Setup</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Register Account', text: 'Select Teacher account type during registration using your preferred email.' },
                { step: '2', title: 'Create Class', text: 'Define class sections corresponding to your teaching schedule.' },
                { step: '3', title: 'Share Class Code', text: 'Distribute the generated class code for students to join your roster.' }
              ].map((s) => (
                <div key={s.step} className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-3">
                  <span className="w-7 h-7 rounded-full bg-[#7F7FFA] text-white font-bold text-xs flex items-center justify-center">
                    {s.step}
                  </span>
                  <h3 className="font-bold text-[#3C3C3C] text-sm">{s.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-normal">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Google Classroom Integration */}
          <section id="classroom" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                03
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Google Classroom Integration</h2>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              BeginFin connects directly with Google Classroom, allowing educators to streamline class section management, import student rosters, and publish NSPFE-aligned coursework with one click.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <h3 className="font-bold text-[#3C3C3C] text-sm">1. OAuth Connection</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Click "Sign in with Google" on your Teacher Dashboard to grant permission to read courses and sync assignments.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <h3 className="font-bold text-[#3C3C3C] text-sm">2. Course & Roster Import</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Select your active Google Classroom courses to import student rosters directly into your BeginFin class sections.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <h3 className="font-bold text-[#3C3C3C] text-sm">3. Direct Coursework & Posts</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Assign BeginFin learning units with custom point values and due dates or broadcast announcements straight to student streams.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Managing Assignments */}
          <section id="assignments" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                04
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Managing Assignments</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-3">
                <h3 className="font-bold text-[#3C3C3C] text-sm">Creating Challenges</h3>
                <ul className="space-y-2 text-slate-600 text-xs font-normal">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#7F7FFA]" /> Select required financial units</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#7F7FFA]" /> Set target completion dates</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#7F7FFA]" /> Assign to individual class periods</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-3">
                <h3 className="font-bold text-[#3C3C3C] text-sm">Reviewing Progress</h3>
                <ul className="space-y-2 text-slate-600 text-xs font-normal">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#7F7FFA]" /> Monitor completion rates</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#7F7FFA]" /> Review quiz attempt summaries</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#7F7FFA]" /> Export grade summaries to CSV</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Model Context Protocol (MCP) Infrastructure */}
          <section id="mcp" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                05
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Model Context Protocol (MCP) Infrastructure</h2>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              BeginFin is powered exclusively by a 100% free, stateless Model Context Protocol (MCP) architecture. Rather than relying on proprietary chat interfaces or transmitting sensitive student prompts to cloud providers, BeginFin exposes its full 9-unit NSPFE-aligned financial curriculum and calculation tools directly to open AI environments.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#7F7FFA] shadow-sm mb-3">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#3C3C3C] text-sm">Zero Data Collection</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  The MCP server is stateless. No student accounts, gradebook records, or personal queries are ever stored, indexed, or shared.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#7F7FFA] shadow-sm mb-3">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#3C3C3C] text-sm">Everyday AI Integration</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Connect effortlessly to Claude Desktop, Cursor, Windsurf, or custom school LLM agents via standard Server-Sent Events (SSE) or HTTP POST.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#7F7FFA] shadow-sm mb-3">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#3C3C3C] text-sm">Curricular Scope</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Query 50/30/20 budget allocations, FICA paycheck tax calculations, loan amortization schedules, and unit mastery quizzes in real time.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#7F7FFA] uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> MCP Server Configuration
                </span>
                <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">claude_desktop_config.json</span>
              </div>
              <pre className="text-xs font-mono bg-black/40 p-4 rounded-xl text-slate-200 overflow-x-auto">
{`{
  "mcpServers": {
    "beginfin": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://begin-fin.com/sse"]
    }
  }
}`}
              </pre>
              <p className="text-[11px] text-slate-400 font-medium">
                Live HTTP POST endpoint: <code className="text-indigo-300">https://begin-fin.com/mcp</code> • Open config: <code className="text-indigo-300">https://begin-fin.com/beginfin-mcp-config.json</code>
              </p>
            </div>
          </section>

          {/* 6. Student Account Setup */}
          <section id="student" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                06
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Student Account Setup</h2>
            </div>

            <div className="space-y-4 text-slate-600 text-sm font-normal leading-relaxed">
              <p>
                Students register using email credentials or permitted SSO options and input the teacher's class code during sign-up to join the class roster.
              </p>
              <p className="text-xs text-slate-500 bg-[#F4F8FA] p-4 rounded-xl border border-slate-200/60">
                <strong>Guest Mode:</strong> Allows immediate exploration of learning units without account creation. Guest progress is not saved to a class gradebook.
              </p>
            </div>
          </section>

          {/* 7. Privacy & Terms */}
          <section id="privacy" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                07
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Privacy & Data Governance</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="p-5 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <h3 className="font-bold text-[#3C3C3C]">Privacy Protocols</h3>
                <p className="text-slate-500 leading-relaxed font-normal">
                  Minimal operational data is collected solely for student progress tracking. Student records are not sold or used for third-party advertising. We will share your name and email with Certifier.io, a trusted 3rd party digital credential provider, if the user requests.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F4F8FA] border border-slate-200/60 space-y-2">
                <h3 className="font-bold text-[#3C3C3C]">Terms of Service</h3>
                <p className="text-slate-500 leading-relaxed font-normal">
                  Designed for educational instruction. Users maintain full control over account credentials and data deletion requests.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Implementation Checklist */}
          <section id="checklist" className="bg-white rounded-[32px] border border-slate-200/80 p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                08
              </div>
              <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Implementation Checklist</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Step</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { step: 1, task: 'Create Teacher account', role: 'Teacher' },
                    { step: 2, task: 'Set up class section and generate code', role: 'Teacher' },
                    { step: 3, task: 'Connect Google Classroom and import courses (Optional)', role: 'Teacher' },
                    { step: 4, task: 'Distribute class code to students', role: 'Teacher' },
                    { step: 5, task: 'Students sign up and enter class code', role: 'Student' },
                    { step: 6, task: 'Create and assign learning challenge / Classroom coursework', role: 'Teacher' },
                    { step: 7, task: 'Integrate BeginFin MCP server with AI workspace (Optional)', role: 'Teacher / Student' },
                    { step: 8, task: 'Students complete assigned units', role: 'Student' },
                    { step: 9, task: 'Review completion stats and export CSV on teacher dashboard', role: 'Teacher' },
                  ].map((row) => (
                    <tr key={row.step} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-400">{row.step}</td>
                      <td className="py-3 px-4 font-medium">{row.task}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          row.role === 'Teacher' ? 'bg-[#F4F8FA] text-[#7F7FFA] border border-[#7F7FFA]/20' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 9. Support & Contact */}
          <section id="support" className="bg-[#0b0f19] text-white rounded-[32px] border border-white/10 p-8 md:p-10 shadow-xl space-y-6 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-[#7F7FFA] font-bold text-sm">
                09
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Support & Inquiry Contacts</h2>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-[10px] uppercase font-bold text-[#7F7FFA] tracking-wider block">Direct Support</span>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                For general questions, teacher support, media relations, or account assistance:
              </p>
              <a href="mailto:support@begin-fin.com" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 w-fit">
                <Mail className="w-4 h-4 text-[#7F7FFA]" />
                <span>support@begin-fin.com</span>
              </a>
            </div>
          </section>

        </article>
      </main>
    </div>
  );
};
