import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavPadding } from './Navbar';
import { 
  ArrowLeft, 
  ExternalLink, 
  GraduationCap, 
  Book, 
  Library, 
  Globe, 
  Sparkles, 
  BookOpen, 
  AlertTriangle,
  Building2,
  FileText,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ResourcesViewProps {
  onBack: () => void;
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

export const ResourcesView: React.FC<ResourcesViewProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <title>BeginFin Resources | Financial Education Tools</title>
      </Helmet>

      {/* Main Content */}
      <section className={`max-w-7xl mx-auto px-6 ${navPadding}`}>
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#3C3C3C] mb-5 leading-[1.1]">
            Resources
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-normal leading-relaxed">
            Educational courses, university research libraries, and open-access textbooks for personal finance.
          </p>
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

        {/* Disclaimer Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-8 bg-white border border-slate-200/80 rounded-[28px] shadow-sm flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#3C3C3C] mb-1">Resource Attribution Notice</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-normal">
              External courses, textbooks, and university libraries referenced above belong to their respective authors and publishers. BeginFin does not monetize or claim ownership of external content.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
