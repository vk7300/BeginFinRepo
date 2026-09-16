import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavPadding } from './Navbar';
import { 
  ExternalLink, 
  GraduationCap, 
  Book, 
  Library, 
  Globe, 
  Sparkles, 
  BookOpen, 
  Building2, 
  FileText, 
  Award,
  ChevronRight,
  Info,
  X,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ResourcesViewProps {
  onBack: () => void;
  onNavigateToAP?: () => void;
}

interface ResourceItem {
  id: string;
  title: string;
  url?: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  featured?: boolean;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ onNavigateToAP }) => {
  const [isAPModalOpen, setIsAPModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOpenAPGuide = () => {
    setIsAPModalOpen(false);
    if (onNavigateToAP) {
      onNavigateToAP();
    } else {
      window.location.href = '/tools/beginfinsguidetoapbusinesswithpf';
    }
  };

  const resources: ResourceItem[] = [
    {
      id: 'yis-cyfls-exam',
      title: "Young Investors Society — Certified Young Financial Literacy Scholar Exam",
      url: "https://www.flexiquiz.com/SC/N/YISCYFLS",
      type: "Advanced Certification Exam",
      description: "Rigorous personal finance and investment examination designed by Young Investors Society for high school scholars seeking an advanced financial literacy testing experience.",
      icon: <Award className="w-6 h-6" />,
      badge: "Certification Exam",
      featured: true
    },
    {
      id: 'khan-academy',
      title: "Khan Academy Personal Finance",
      url: "https://www.khanacademy.org/college-careers-more/personal-finance",
      type: "Online Course",
      description: "Interactive, self-paced learning path covering budgeting, building credit, managing debt, tax returns, and basic investment principles.",
      icon: <GraduationCap className="w-6 h-6" />,
      badge: "Online Course",
      featured: true
    },
    {
      id: 'stanford-library',
      title: "Stanford University Financial Wellness Library",
      url: "https://mindovermoney.stanford.edu/library",
      type: "Academic Library",
      description: "Stanford University's Mind Over Money resource library offering research-backed guides, articles, and financial planning calculators.",
      icon: <Library className="w-6 h-6" />,
      badge: "University Library",
      featured: true
    },
    {
      id: 'rich-dad-poor-dad',
      title: "Rich Dad Poor Dad by Robert Kiyosaki",
      type: "Book",
      description: "Foundational personal finance text focusing on financial education, building assets, cash flow management, and financial independence.",
      icon: <Book className="w-6 h-6" />,
      badge: "Book"
    },
    {
      id: 'openstax-finance',
      title: "OpenStax Principles of Finance",
      url: "https://openstax.org/details/books/principles-finance",
      type: "Academic Textbook",
      description: "Peer-reviewed, open-licensed introductory college textbook providing a comprehensive academic foundation in financial principles.",
      icon: <Globe className="w-6 h-6" />,
      badge: "Textbook"
    },
    {
      id: 'intuit-education',
      title: "Intuit Education Personal Finance & Tax Course",
      url: "https://education.intuit.com/learner/course/personal_finance",
      type: "Professional Program",
      description: "Real-world finance and tax course designed to prepare students for budgeting, income taxes, and practical money habits.",
      icon: <Sparkles className="w-6 h-6" />,
      badge: "Program"
    },
    {
      id: 'irs-education',
      title: "IRS Tax Withholding Estimator & Guides",
      url: "https://www.irs.gov/individuals/tax-withholding-estimator",
      type: "Government Portal",
      description: "Internal Revenue Service tax calculators, W-4 withholding guidance, and tax filing resources designed for wage earners.",
      icon: <FileText className="w-6 h-6" />,
      badge: "Tax Utility"
    },
    {
      id: 'cfpb-tools',
      title: "Consumer Financial Protection Bureau (CFPB) Tools",
      url: "https://www.consumerfinance.gov/consumer-tools/educator-resources/",
      type: "Consumer Protection",
      description: "Federal guidelines and tools for understanding credit reports, evaluating borrowing terms, and defending consumer rights under the FCRA.",
      icon: <Building2 className="w-6 h-6" />,
      badge: "Consumer Resource"
    },
    {
      id: 'lukes-lemonade',
      title: "Luke's Lemonade Stand",
      url: "https://books.apple.com/us/book/lukes-lemonade-stand/id6751520538",
      type: "eBook",
      description: "A FREE Apple® eBook introducing you to the basics of business, operations, and entrepreneurship.",
      icon: <Book className="w-6 h-6" />,
      badge: "Free Book"
    }
  ];

  const navPadding = useNavPadding();

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#3C3C3C] font-sans pb-24">
      <Helmet>
        <title>BeginFin Resources | Financial Education & AP® Business Guide</title>
      </Helmet>

      {/* Main Content */}
      <section className={`max-w-7xl mx-auto px-6 ${navPadding}`}>
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#3C3C3C] mb-5 leading-[1.1]">
            Resources
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-normal leading-relaxed">
            Educational courses, exam review companions, university research libraries, and open-access textbooks for personal finance.
          </p>
        </motion.div>

        {/* TOP FEATURED: BeginFin's Guide to AP® Business with Personal Finance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 lg:p-10 relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100">
                  Course Review Resource
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Unit 1 Available Now
                </span>
                <span className="text-xs text-slate-400">
                  •
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Open Educational Companion
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/30 flex items-center justify-center text-[#7F7FFA] shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span>BeginFin's Guide to AP® Business with Personal Finance</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Independently aligned to the publicly available AP® Business with Personal Finance Course Framework. Explore bite-sized topic summaries, vocabulary definitions, and practical business scenarios designed for student mastery.
              </p>

              {/* In-Card AP Trademark Notice */}
              <div className="pt-2 text-[11px] text-slate-400 leading-relaxed font-normal">
                *AP® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this resource.
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center min-w-[200px]">
              <button
                type="button"
                onClick={handleOpenAPGuide}
                className="btn-primary w-full gap-2 text-xs py-3 px-5 shadow-sm justify-center cursor-pointer"
              >
                <span>Explore Guide (Unit 1)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAPModalOpen(true)}
                className="btn-ghost w-full gap-1.5 text-xs py-3 px-4 justify-center border border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer"
              >
                <Info className="w-4 h-4 text-slate-500" />
                <span>Resource Details</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Resources Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {resources.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#7F7FFA]/40 hover:shadow-[0_12px_35px_rgba(127,127,250,0.12)] transition-all duration-500 group"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] group-hover:scale-105 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4F8FA] text-slate-600 border border-slate-200/60">
                    {item.badge}
                  </span>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-widest text-[#7F7FFA] block mb-2">
                  {item.type}
                </span>

                <h3 className="text-xl font-bold tracking-tight text-[#3C3C3C] mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed font-normal mb-8">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0b0f19] hover:bg-[#7F7FFA] text-white rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md group/link"
                  >
                    <span>Visit Resource</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-white transition-colors" />
                  </a>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Available in Libraries</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Attribution and AP Trademark Citation Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-8 bg-white border border-slate-200/80 rounded-[28px] shadow-sm flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#3C3C3C]">Resource Attribution & Trademark Notices</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-normal">
              External courses, textbooks, and university libraries referenced above belong to their respective authors and publishers. BeginFin does not monetize or claim ownership of external content.
            </p>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-400 leading-relaxed font-normal">
              <p>
                *AP® is a trademark registered by the College Board, which was not involved in the production of, and does not endorse, this resource. BeginFin is licensed by the College Board to use the AP® trademark for upcoming AP® Business with Personal Finance resources.
              </p>
              <div className="flex items-center gap-2 mt-1 text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7F7FFA]" />
                <span>BeginFin is independently aligned with the National Standards for Personal Financial Education (NSPFE).</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* AP Guide Resource Details Modal */}
      {isAPModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ap-modal-title"
        >
          <div className="card max-w-lg w-full p-6 sm:p-8 bg-white border-slate-200 shadow-xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setIsAPModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                Exam Preparation & Review
              </span>
              <h3 id="ap-modal-title" className="text-xl font-bold text-slate-900 tracking-tight">
                BeginFin's Guide to AP® Business with Personal Finance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                An open, student-friendly review companion independently aligned to the publicly available AP® Business with Personal Finance Course Framework.
              </p>
            </div>

            {/* Note badge */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Current Availability</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unit 1 is available now, with additional units and review tools launching progressively.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">What's included in Unit 1:</div>
              <ul className="space-y-1.5 list-disc ml-5">
                <li>8 bite-sized review topics (1.1 through 1.8)</li>
                <li>Core concept definitions and vocabulary breakdowns</li>
                <li>Fictional startup scenarios with Cedar & Sprout</li>
                <li>Common misconceptions and key recall points</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAPGuide}
                className="btn-primary w-full py-3 text-xs justify-center cursor-pointer"
              >
                Go to Guide (Unit 1)
              </button>
              <button
                type="button"
                onClick={() => setIsAPModalOpen(false)}
                className="btn-ghost w-full sm:w-auto text-xs py-3 justify-center cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Required Trademark Line */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 leading-normal font-normal">
                AP® is a trademark registered by the College Board. BeginFin is licensed to use the AP® trademark. BeginFin is not endorsed by the College Board.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
