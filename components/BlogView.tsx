import React, { useState } from 'react';
import { Linkedin, ArrowUpRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

interface BlogViewProps {
  onSelectArticle?: (slug: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = () => {
  const [copied, setCopied] = useState(false);
  const feedUrl = "https://www.linkedin.com/company/begin-fin/posts/?feedView=all";

  const handleCopy = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50/50 py-16 px-6 font-sans">
      <Helmet>
        <meta name="description" content="Stay updated with educational personal finance resources, announcements, and micro-lessons from BeginFin's Financial Literacy Fundamentals." />
      </Helmet>

      <div className="max-w-2xl w-full text-center">
        {/* Core Headers */}
        <motion.h1 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6"
        >
          The BeginFin Blog
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-xl mx-auto mb-12"
        >
          The latest in BeginFin News
        </motion.p>

        {/* Central Card with CTA Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white p-10 sm:p-12 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden text-center mb-10"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 opacity-70" />
          
          <div className="w-20 h-20 bg-[#0a66c2] text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20 group">
            <Linkedin className="w-10 h-10 fill-white" />
          </div>

          <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">
            Read Our Latest Feed
          </h3>
          <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto mb-10 leading-normal">
            Join the discussion on LinkedIn
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <a 
              href={feedUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all shadow-xl shadow-blue-500/20 active:scale-98"
            >
              <span>Visit LinkedIn Feed</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button 
              onClick={handleCopy}
              className="px-6 py-5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-2xl font-black uppercase tracking-wider text-xs transition-all border border-slate-250/50 active:scale-98"
            >
              {copied ? "Copied Feed URL" : "Share Channel"}
            </button>
          </div>
        </motion.div>

        {/* Policy Notice */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-slate-400 text-xs font-bold tracking-wide"
        >
          * External Link - LinkedIn Policies Apply
        </motion.p>
      </div>
    </div>
  );
};
