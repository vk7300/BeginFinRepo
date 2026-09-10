import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle
} from 'lucide-react';
import { apUnit1 } from '../data/ap/unit1.js';
import { apTranslations } from '../data/translations.js';

export const APTopicView = ({ 
  topicId, 
  onBackToUnit, 
  onSelectTopic 
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [topicId]);

  const t = apTranslations.en;
  const currentTopic = apUnit1.topics.find((tp) => tp.id === topicId) || apUnit1.topics[0];
  const currentIndex = apUnit1.topics.findIndex((tp) => tp.id === currentTopic.id);
  const prevTopic = currentIndex > 0 ? apUnit1.topics[currentIndex - 1] : null;
  const nextTopic = currentIndex < apUnit1.topics.length - 1 ? apUnit1.topics[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-slate-800 flex flex-col font-sans pb-24 pt-20 sm:pt-24 px-4 sm:px-6">
      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Back button top-left */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBackToUnit}
            className="btn-ghost -ml-4 gap-2 cursor-pointer"
            aria-label="Back to Unit 1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToUnits}</span>
          </button>
        </div>

        {/* Topic Header */}
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wide text-indigo-500 font-bold mb-2">
            Topic {currentTopic.topicNumber} · Unit {apUnit1.unitNumber}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {currentTopic.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full">
              Aligns to {currentTopic.loCodes.map(code => `LO ${code}`).join(', ')}
            </span>
            {currentTopic.nspfe && currentTopic.nspfe.length > 0 && (
              <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                NSPFE: {currentTopic.nspfe.join(', ')}
              </span>
            )}
            <span className="text-slate-600">
              {apUnit1.alignmentClaim}
            </span>
          </div>
        </header>

        {/* The 6 Content Cards */}
        <div className="space-y-6 mb-12">
          {/* 1. Hook */}
          <section className="card p-6 sm:p-7 border-slate-200/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              The big picture
            </h2>
            <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
              {currentTopic.hook}
            </p>
          </section>

          {/* 2. Core Idea */}
          <section className="card p-6 sm:p-7 border-slate-200/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Core concept
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {currentTopic.coreIdea}
            </p>
          </section>

          {/* 3. Breakdown (Vocabulary) */}
          <section className="card p-6 sm:p-7 border-slate-200/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Vocabulary breakdown
            </h2>
            <div className="divide-y divide-slate-100">
              {currentTopic.breakdown.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 text-sm leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">{item.term}</span>: {item.plain}
                </div>
              ))}
            </div>
          </section>

          {/* 4. Worked Scenario */}
          <section className="card p-6 sm:p-7 border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                In practice: Cedar & Sprout
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {currentTopic.worked}
            </p>
          </section>

          {/* 5. Common Confusion */}
          <section className="card p-6 sm:p-7 border-amber-200/70 bg-amber-50/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Common misconception
              </h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {currentTopic.confusion}
            </p>
          </section>

          {/* 6. Recall Bullets */}
          <section className="card p-6 sm:p-7 border-slate-200/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Key recall points
            </h2>
            <ul className="space-y-2.5">
              {currentTopic.recall.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Previous & Next Navigation Controls */}
        <nav aria-label="Topic navigation" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 mb-12">
          {prevTopic ? (
            <button
              type="button"
              onClick={() => onSelectTopic(prevTopic.id)}
              className="btn-secondary w-full sm:w-auto gap-2 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Topic {prevTopic.topicNumber}: {prevTopic.title}</span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextTopic && (
            <button
              type="button"
              onClick={() => onSelectTopic(nextTopic.id)}
              className="btn-primary w-full sm:w-auto gap-2 text-xs"
            >
              <span>Topic {nextTopic.topicNumber}: {nextTopic.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </nav>

        {/* Muted Trademark Footer Disclaimer */}
        <footer className="mt-auto pt-6 text-center">
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            AP® is a trademark registered by the College Board. BeginFin is licensed to use the AP® trademark. BeginFin is not endorsed by the College Board.
          </p>
        </footer>
      </main>
    </div>
  );
};
