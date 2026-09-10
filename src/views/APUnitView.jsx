import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Store, 
  TrendingUp, 
  Globe2, 
  Lightbulb, 
  Compass, 
  ShieldCheck, 
  Users, 
  Truck, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { apUnit1 } from '../data/ap/unit1.js';
import { apTranslations } from '../data/translations.js';

const getTopicIcon = (iconName) => {
  const props = { className: "w-5 h-5 text-indigo-700" };
  switch (iconName) {
    case 'Store':
      return <Store {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Globe2':
      return <Globe2 {...props} />;
    case 'Lightbulb':
      return <Lightbulb {...props} />;
    case 'Compass':
      return <Compass {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'Users':
      return <Users {...props} />;
    case 'Truck':
      return <Truck {...props} />;
    default:
      return <Store {...props} />;
  }
};

export const APUnitView = ({ onBackToTools, onSelectTopic }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const t = apTranslations.en;

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col font-sans pb-24 pt-20 sm:pt-24 px-4 sm:px-6">
      <main className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        {/* Navigation back button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBackToTools}
            className="btn-ghost -ml-3 gap-2 cursor-pointer"
            aria-label="Back to tools"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToTools}</span>
          </button>
        </div>

        {/* Unit Header Banner */}
        <header className="card p-6 sm:p-8 md:p-10 mb-8 border-slate-200/80 bg-white">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Unit {apUnit1.unitNumber} review
              </span>
              <span className="text-xs text-slate-500 font-medium">
                8 topics
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {apUnit1.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {apUnit1.description}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-500">
              <div className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{apUnit1.alignmentClaim}</span>
              </div>
            </div>

            {/* Note badge */}
            <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                {apUnit1.note}
              </p>
            </div>
          </div>
        </header>

        {/* Bento Grid of 8 Topics */}
        <section aria-label="Unit topics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {apUnit1.topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelectTopic(topic.id)}
              className="card p-5 text-left flex flex-col justify-between group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50"
            >
              <div>
                {/* Top bar with icon tile and topic number */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                    {getTopicIcon(topic.icon)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/60 px-2.5 py-1 rounded-md border border-indigo-100/60">
                    Topic {topic.topicNumber}
                  </span>
                </div>

                {/* Topic Title */}
                <h2 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-700 transition-colors mb-2">
                  {topic.title}
                </h2>

                {/* Hook preview */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {topic.hook}
                </p>
              </div>

              {/* Bottom footer bar with LO count and CTA */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  {topic.loCodes.join(', ')}
                </span>
                <span className="text-indigo-600 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Review</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </section>

        {/* Muted Trademark Footer Disclaimer */}
        <footer className="mt-auto pt-8 border-t border-slate-200/80 text-center">
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            AP® is a trademark registered by the College Board. BeginFin is licensed to use the AP® trademark. BeginFin is not endorsed by the College Board.
          </p>
        </footer>
      </main>
    </div>
  );
};
