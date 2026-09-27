import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, Target, Award, AlertCircle, Download, Loader2, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// No-op utility removed

interface CurriculumUnit {
  title: string;
  focus: string;
  outcomes: string[];
}

const curriculumData: CurriculumUnit[] = [
  {
    title: "Personal Finance Fundamentals",
    focus: "Establishing a secure financial foundation through banking tips and structured spending.",
    outcomes: [
      "Analyze the fundamental economic concepts of scarcity, opportunity cost, and trade-offs in financial decision-making.",
      "Evaluate the impact of inflation on purchasing power over time and its significance in long-term planning (NSPFE 2.1).",
      "Categorize expenses into needs, wants, and financial goals using the 50/30/20 framework.",
      "Differentiate between checking, savings, and high-yield savings accounts (HYSA) to determine optimal liquidity and interest-bearing strategies."
    ]
  },
  {
    title: "Job Finance & USA Taxes",
    focus: "Navigating employee compensation, payroll deductions, and foundational tax reporting.",
    outcomes: [
      "Interpret standard payroll documents, including W-4 withholding certificates and W-2 annual earnings statements.",
      "Calculate the difference between gross pay and net pay by accounting for mandatory and voluntary deductions.",
      "Identify the functions of FICA taxes and their role in funding Social Security and Medicare programs (NSPFE 1.3).",
      "Model real-world Austin, TX wage scenarios against true-to-life local variables and cost-of-living indicators.",
      "Adhere to formal tax reporting timelines following IRS guidelines for federal income tax returns."
    ]
  },
  {
    title: "Debt & Credit Mastery",
    focus: "Building a strong credit profile, understanding leverage, and executing debt elimination strategies.",
    outcomes: [
      "Explain the components of credit scores and the long-term cost of borrowing based on interest rates and terms (NSPFE 5.1).",
      "Analyze the impact of credit reports on future financial opportunities, such as housing and employment.",
      "Simulate critical debt decisions under the Credit Score Game to witness real-time score fluctuations.",
      "Evaluate debt management strategies, including the debt avalanche and snowball methods, to minimize interest payments.",
      "Distinguish between revolving credit and installment loans, prioritizing low utilization to maximize creditworthiness."
    ]
  },
  {
    title: "Retirement Planning & Taxes",
    focus: "Preparing for financial independence through tax-advantaged accounts and strategic tax optimization.",
    outcomes: [
      "Compare the benefits of tax-deferred versus tax-exempt investment accounts (e.g., Traditional vs. Roth IRA/401k).",
      "Assess the power of compounding and the 'time value of money' in retirement wealth accumulation (NSPFE 4.1).",
      "Identify employer matching contributions as a critical component of total compensation and retirement strategy.",
      "Analyze the relationship between age, risk tolerance, and asset allocation in retirement portfolios."
    ]
  },
  {
    title: "Filing Taxes Roadmap",
    focus: "Executing the end-to-end US Federal Tax Return lifecycle.",
    outcomes: [
      "Complete a 1040 form simulation, identifying common deductions and credits to reduce taxable income.",
      "Compare various tax filing methods, including IRS Free File, VITA programs, and commercial software solutions.",
      "Compile and organize primary tax documentation (W-2, 1099, 1098) for accurate financial reporting.",
      "Explain the legal obligations of citizens regarding federal income tax and the consequences of non-compliance."
    ]
  },
  {
    title: "Investing Basics",
    focus: "Strategies for long-term wealth creation, asset class identification, and risk management.",
    outcomes: [
      "Evaluate primary asset classes: equities (ownership), fixed-income (lending), and diversified funds (ETFs/Index Funds) (NSPFE 4.2).",
      "Analyze the risk-reward tradeoff and the necessity of diversification for portfolio stability.",
      "Explain the mechanics of the stock market and the role of public corporations in the global economy.",
      "Identify factors that influence investment performance, including economic indicators and market sentiment."
    ]
  },
  {
    title: "Insurance & Risk Management",
    focus: "Protective strategies for preserving wealth and mitigating financial loss.",
    outcomes: [
      "Assess individual risk exposure and evaluate the role of health, auto, life, and homeowners/renters insurance.",
      "Define key insurance terms: premiums, deductibles, and coverage limits, in relation to out-of-pocket costs (NSPFE 6.1).",
      "Analyze the necessity of an emergency fund as a primary risk mitigation strategy.",
      "Evaluate the long-term financial consequences of being underinsured or uninsured."
    ]
  },
  {
    title: "Consumer Rights & Philanthropy",
    focus: "Ethical financial behavior, consumer protection, and the impact of charitable giving.",
    outcomes: [
      "Identify common consumer fraud schemes and develop proactive defense strategies against identity theft (NSPFE 2.2).",
      "Analyze the laws protecting consumers in the financial marketplace, including the Fair Credit Reporting Act.",
      "Evaluate the societal and personal benefits of charitable giving and philanthropy within a legacy plan.",
      "Analyze the tax advantages of qualified charitable contributions in accordance with IRS regulations."
    ]
  }
];

export const CurriculumModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    // Wait for the off-screen component to render
    setTimeout(async () => {
      const element = document.getElementById('curriculum-pdf-content');
      if (!element) {
        setIsExporting(false);
        return;
      }
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`BeginFin_Core_Curriculum.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl my-8 shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#0b0f19] rounded-t-[2.5rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-indigo-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Core Curriculum Syllabus</h2>
              <p className="text-slate-400 font-medium text-xs tracking-wide">Open-source curriculum free for non-commercial use</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-full transition-all font-semibold text-xs cursor-pointer shadow-md"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-900" /> : <Download className="w-4 h-4 text-slate-700" />}
              <span>Export PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Alignment & Sources Section */}
          <section className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-black text-slate-900">Standardized Rigor</h3>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  The BeginFin curriculum is designed for alignment with and fully vetted against the <span className="text-indigo-600 font-black">National Standards for Personal Finance Education (NSPFE)</span>.
                </p>
                <div className="p-4 bg-white/50 border border-indigo-100 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                    BeginFin is a student-led educational initiative. While we are vetted for alignment with national financial education standards, BeginFin is provided on an "as-is" basis and does not claim official statutory certification.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-white border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600">National Standards Goal</span>
                  <span className="px-3 py-1 bg-white border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600">NSPFE Vetted & Aligned</span>
                </div>
              </div>
              <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Primary Sources</p>
                <ul className="space-y-3">
                  <li className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    National Standards Frameworks
                  </li>
                  <li className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Jump$tart Coalition / CEE
                  </li>
                  <li className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Internal Revenue Service (IRS.gov)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Units Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {curriculumData.map((unit, idx) => (
              <div key={idx} className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">
                      {idx + 1}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{unit.title}</h4>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Focus Area</p>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">{unit.focus}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Competency Outcomes</p>
                  {unit.outcomes.map((outcome, oIdx) => (
                    <div key={oIdx} className="flex gap-3 items-start">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                      <p className="text-slate-600 text-xs font-medium leading-relaxed">{outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Remediation Policy */}
          <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-black text-slate-900">Mastery-Based Assessment</h3>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              BeginFin follows a strict <span className="text-slate-900 font-bold">100% Mastery Required</span> policy. Users must achieve a perfect score on module quizzes to progress, ensuring no foundational concepts are missed. If a user fails, the platform identifies the missed standard and provides targeted remediation options.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[2.5rem] flex justify-center">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
          >
            Acknowledge Curriculum
          </button>
        </div>
      </div>

      {/* Off-screen PDF content (Updated) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div id="curriculum-pdf-content" className="w-[800px] bg-white p-12 font-sans text-slate-900">
          <div className="flex items-center justify-between mb-10 border-b-4 border-indigo-600 pb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1">BeginFin Core Curriculum</h1>
              <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">Standards Alignment: NSPFE & CEE • Last Updated: June 16, 2026</p>
              <p className="mt-2 text-[10px] font-bold text-slate-400 italic">
                BeginFin is a student-led educational initiative. While we are vetted for alignment with national financial education standards, BeginFin is provided on an "as-is" basis and does not claim official statutory certification.
              </p>
            </div>
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
 
          <div className="bg-slate-900 text-white p-8 rounded-3xl mb-10">
            <h2 className="text-xl font-black mb-4">Curriculum Methodology</h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              This curriculum was developed with national educational frameworks in mind to support practical college and career readiness. Every module maps to specific performance indicators designed to foster long-term financial autonomy.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {curriculumData.map((unit, idx) => (
              <div key={idx} className="page-break-inside-avoid">
                <div className="flex items-center gap-4 mb-4 border-b-2 border-slate-100 pb-2">
                  <span className="text-3xl font-black text-indigo-600">{idx + 1}</span>
                  <h3 className="text-2xl font-black text-slate-900">{unit.title}</h3>
                </div>
                
                <div className="mb-6 bg-slate-50 p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Focus Area</p>
                  <p className="text-slate-700 font-bold leading-relaxed">{unit.focus}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alignment Outcomes</p>
                  <div className="grid grid-cols-1 gap-2">
                    {unit.outcomes.map((outcome, oIdx) => (
                      <div key={oIdx} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-slate-100">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                        <p className="text-slate-800 text-sm font-medium leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-8 border-t-2 border-slate-100 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
            Official Academic Standards Alignment Document • Last Updated: June 16, 2026 • © 2026 BeginFin
          </div>
        </div>
      </div>
    </div>
  );
};
