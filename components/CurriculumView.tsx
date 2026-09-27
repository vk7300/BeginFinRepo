import React, { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { modules } from '../data/courseData';
import { Language, uiTranslations } from '../data/uiTranslations';
import { useNavPadding } from './Navbar';
import { 
  BookOpen, 
  ArrowLeft, 
  GraduationCap, 
  FileText, 
  Wallet, 
  Briefcase, 
  CreditCard, 
  PiggyBank, 
  FileText as FileIcon, 
  TrendingUp, 
  Shield, 
  Heart, 
  Stethoscope,
  Award,
  ArrowRight,
  ShieldCheck,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export const getModuleIcon = (id: string, className?: string) => {
  const normId = id.toLowerCase();
  if (normId.includes('m1') || normId === '1') return <Wallet className={className} />;
  if (normId.includes('m2') || normId === '2') return <Briefcase className={className} />;
  if (normId.includes('m3') || normId === '3') return <TrendingUp className={className} />;
  if (normId.includes('m4') || normId === '4') return <CreditCard className={className} />;
  if (normId.includes('m5') || normId === '5') return <PiggyBank className={className} />;
  if (normId.includes('m6') || normId === '6') return <FileIcon className={className} />;
  if (normId.includes('m7') || normId === '7') return <Shield className={className} />;
  if (normId.includes('m8') || normId === '8') return <Heart className={className} />;
  if (normId.includes('m9') || normId === '9' || normId.includes('medical')) return <Stethoscope className={className} />;
  return <BookOpen className={className} />;
};

const moduleOutcomes: Record<string, string[]> = {
  m1: [
    "Construct a monthly 50/30/20 budget allocating net earnings across needs, wants, and savings.",
    "Compare checking, savings, and high-yield savings accounts based on liquidity and annual percentage yield.",
    "Analyze opportunity costs and scarcity principles when making daily consumption trade-offs.",
    "Verify FDIC and NCUA deposit insurance protections to secure personal liquid assets."
  ],
  m2: [
    "Deconstruct earnings statements to evaluate gross pay, net pay, and mandatory FICA withholdings.",
    "Complete IRS Form W-4 accurately to optimize tax withholding and avoid tax penalties.",
    "Interpret Form W-2 annual summary statements and prepare personal Form 1040 tax returns.",
    "Assess total compensation packages including healthcare, benefits, and employer matches."
  ],
  m3: [
    "Differentiate asset classes including individual equities, fixed-income bonds, and index funds.",
    "Calculate compound interest growth across multi-year investment horizons.",
    "Apply portfolio diversification to mitigate single-asset volatility and market risk.",
    "Align asset allocation strategies with individual risk tolerance and investment timeframes."
  ],
  m4: [
    "Evaluate FICO score calculation factors including payment history and credit utilization.",
    "Differentiate structured debt repayment strategies using the Debt Avalanche and Debt Snowball methods.",
    "Calculate the total cost of borrowing across varied APRs, loan terms, and interest structures.",
    "Navigate credit card billing cycles and revolving lines of credit to prevent fee accumulation."
  ],
  m5: [
    "Compare Traditional and Roth tax structures regarding current deductions and future withdrawals.",
    "Maximize employer retirement matching contributions to capture guaranteed initial returns.",
    "Assess the time value of money when establishing long-term tax-deferred wealth strategies.",
    "Calculate net taxable income after applying standard deductions and tax credits."
  ],
  m6: [
    "Audit payroll tax withholdings and update W-4 allowances following significant life events.",
    "Collect and organize year-end tax documentation including Form W-2 and 1099 statements.",
    "Determine optimal deduction choices between the Standard Deduction and itemized expenses.",
    "Utilize free filing utilities to accurately submit federal tax returns and set up direct deposit."
  ],
  m7: [
    "Select health, auto, renters, and life insurance policies tailored to personal liability exposures.",
    "Calculate out-of-pocket medical and property costs across premiums, deductibles, and co-pays.",
    "Establish a liquid emergency reserve covering three to six months of essential living expenses.",
    "Implement proactive risk mitigation strategies to protect accumulated net worth against loss."
  ],
  m8: [
    "Exercise legal rights under the Fair Credit Reporting Act (FCRA) to dispute credit errors.",
    "Deploy credit freeze protocols with credit bureaus to defend against identity theft.",
    "Incorporate structured charitable contributions into personal financial planning.",
    "Understand 501(c)(3) tax deductions and legal guidelines governing philanthropic giving."
  ],
  m9: [
    "Interpret Explanation of Benefits (EOB) statements and itemized medical billing statements.",
    "Compare HMO, PPO, HSA, and FSA health insurance plan features and tax advantages.",
    "Apply rights under the No Surprises Act to challenge out-of-network balance billing.",
    "Negotiate interest-free hospital payment plans and apply for charity care assistance."
  ]
};

export const getTopicsForModule = (moduleId: string, _lang?: Language): string[] => {
  return moduleOutcomes[moduleId] || [];
};

export const stripUnitPrefix = (title: string): string => title;

interface CurriculumViewProps {
  onBack: () => void;
  language: Language;
  onSelectModule?: (moduleId: string) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onBack, language, onSelectModule }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const t = uiTranslations[language] || uiTranslations['en'];

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
      doc.setTextColor(148, 163, 184);
      
      doc.text('BEGINFIN CORE CURRICULUM', margin, 12);
      doc.text('ACADEMIC SYLLABUS', pageWidth - margin - 40, 12);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);

      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.text(`Page ${pageNum} of ${totalPages}`, margin, pageHeight - 10);
      doc.text('begin-fin.com', pageWidth - margin - 25, pageHeight - 10);
    };

    // Dark header block in PDF
    doc.setFillColor(11, 15, 25);
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 28, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('BeginFin Core Curriculum', margin + 8, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(199, 210, 254);
    doc.text('Personal Finance Mastery & Learning Outcomes', margin + 8, y + 16);

    y += 36;

    modules.forEach((module, index) => {
      const data = module.translations[language] || module.translations['en'];
      const outcomes = getTopicsForModule(module.id, language);

      if (y + 45 > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }

      // Unit Card background line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Unit Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(127, 127, 250);
      doc.text(`UNIT ${index + 1}`, margin, y);
      y += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(data.title, margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      
      const splitDesc = doc.splitTextToSize(data.description, pageWidth - margin * 2);
      doc.text(splitDesc, margin, y);
      y += (splitDesc.length * 4) + 4;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('SPECIFIC LEARNING OUTCOMES:', margin, y);
      y += 5;

      outcomes.forEach((outcome) => {
        if (y + 10 > pageHeight - 20) {
          doc.addPage();
          y = 25;
        }

        doc.setFillColor(127, 127, 250);
        doc.circle(margin + 2, y - 1, 0.7, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        
        const splitText = doc.splitTextToSize(outcome, pageWidth - margin * 2 - 8);
        doc.text(splitText, margin + 6, y);
        y += (splitText.length * 3.8) + 2;
      });

      y += 6;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHeaderFooter(i, totalPages);
    }

    doc.save('BeginFin_Curriculum_Syllabus.pdf');
  };

  const navPadding = useNavPadding();

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#3C3C3C] font-sans pb-24">
      {/* Hero Section */}
      <section className={`max-w-7xl mx-auto px-6 ${navPadding} pb-10`}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.1]">
            Curriculum
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-normal leading-relaxed mb-4">
            Every module is engineered to build lasting financial independence through practical, real-world applications.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-xs text-slate-500 font-medium bg-slate-100 border border-slate-200/80 rounded-full px-4 py-2 inline-block">
              BeginFin's curriculum is open-source and free for anyone to use for non-commercial purposes.
            </p>
            <button
              onClick={generatePDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b0f19] hover:bg-[#7F7FFA] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer group"
            >
              <FileText className="w-3.5 h-3.5 text-[#7F7FFA] group-hover:text-white transition-colors" />
              <span>Export PDF Curriculum</span>
            </button>
          </div>
        </motion.div>

        {/* Top Bento Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          {/* Main Dark Bento Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="md:col-span-8 bg-[#0b0f19] text-white p-8 md:p-10 rounded-[32px] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col justify-between group"
          >
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/40 transition-all duration-700" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-600/20 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-indigo-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-md border border-white/10">
                    8 Core Units + Medical Module
                  </span>
                </div>
              </div>

              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
                Personal Finance Framework
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-normal mb-8">
                Master paychecks, taxes, budgeting, credit scores, compound growth, index funds, and medical bill negotiation in an interactive, self-paced learning environment.
              </p>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
              <button
                onClick={generatePDF}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-full text-xs font-semibold tracking-wide transition-all shadow-lg cursor-pointer whitespace-nowrap"
              >
                <span>Download Syllabus (PDF)</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </motion.div>

          {/* Secondary Light Bento Card - Certificate Outcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-4 bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#7F7FFA]/40 transition-all group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] mb-6 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">
                LinkedIn-Shareable Certificate
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-normal">
                Earn an official certificate of completion upon achieving full mastery across core financial units.
              </p>
            </div>
          </motion.div>

          {/* Third Light Bento Card - Quiz Mastery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="md:col-span-4 bg-white p-8 rounded-[32px] border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#7F7FFA]/40 transition-all group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">
                Mastery Evaluation
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-normal">
                Students retake randomized quizzes until mastery is demonstrated.
              </p>
            </div>
          </motion.div>

          {/* Fourth Dark Bento Card - Global Reach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="md:col-span-8 bg-gradient-to-br from-[#0a0d18] via-[#0f1426] to-[#070912] p-8 md:p-10 rounded-[32px] border border-white/10 text-white relative overflow-hidden shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-200 text-xs font-medium mb-4">
                <Globe className="w-3.5 h-3.5 text-[#7F7FFA]" />
                <span>Global Reach</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                Empowering Students Worldwide
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Adopted across 25+ countries and supported by educator tools, class progress reporting, and PDF exports.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <div className="text-3xl font-extrabold text-white mb-1">15,000+</div>
              <div className="text-xs text-[#7F7FFA] font-medium uppercase tracking-wider">Active Learners</div>
            </div>
          </motion.div>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {modules.map((module, index) => {
            const data = module.translations[language] || module.translations['en'];
            const outcomes = getTopicsForModule(module.id, language);
            const isDarkCard = index % 3 === 0;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={`rounded-[28px] p-8 transition-all duration-300 break-inside-avoid print:break-inside-avoid ${
                  isDarkCard
                    ? 'bg-[#0b0f19] text-white border border-white/10 shadow-xl'
                    : 'bg-white text-slate-900 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#7F7FFA]/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Icon & Title Group */}
                  <div className="flex items-start gap-5 flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDarkCard
                        ? 'bg-white/10 text-[#7F7FFA] border border-white/10'
                        : 'bg-[#F4F8FA] text-[#7F7FFA] border border-[#7F7FFA]/20'
                    }`}>
                      {getModuleIcon(module.id, "w-7 h-7")}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isDarkCard
                            ? 'bg-white/10 text-indigo-200 border border-white/10'
                            : 'bg-[#F4F8FA] text-[#7F7FFA] border border-[#7F7FFA]/20'
                        }`}>
                          UNIT {index + 1}
                        </span>
                      </div>

                      <h3 className={`text-2xl font-bold tracking-tight ${isDarkCard ? 'text-white' : 'text-slate-900'}`}>
                        {data.title}
                      </h3>

                      <p className={`text-sm leading-relaxed max-w-3xl font-normal ${isDarkCard ? 'text-slate-300' : 'text-slate-600'}`}>
                        {data.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="shrink-0 self-start md:self-auto no-print">
                    {onSelectModule && (
                      <button
                        onClick={() => onSelectModule(module.id)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                          isDarkCard
                            ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-md'
                            : 'bg-[#0b0f19] text-white hover:bg-[#7F7FFA] shadow-md'
                        }`}
                      >
                        <span>Start Unit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Specific Learning Outcomes Grid */}
                <div className="mt-8 pt-6 border-t border-slate-200/20">
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
                    isDarkCard ? 'text-[#7F7FFA]' : 'text-[#7F7FFA]'
                  }`}>
                    Specific Learning Outcomes
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {outcomes.map((outcome, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border text-xs leading-relaxed font-normal flex items-start gap-3 transition-colors ${
                          isDarkCard
                            ? 'bg-white/5 border-white/10 text-slate-200'
                            : 'bg-slate-50/80 border-slate-200/60 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isDarkCard ? 'text-[#7F7FFA]' : 'text-[#7F7FFA]'
                        }`} />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 p-10 md:p-12 bg-gradient-to-br from-[#0b0f19] via-[#0d1222] to-[#080b14] rounded-[32px] border border-white/10 text-center relative overflow-hidden shadow-2xl no-print"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to build financial confidence?
            </h2>
            <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed font-normal">
              No credit card required. Master real-world budgeting, taxes, investing, and debt management today.
            </p>
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-full text-sm tracking-wide transition-all shadow-xl cursor-pointer"
            >
              <span>Begin Learning Now</span>
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
