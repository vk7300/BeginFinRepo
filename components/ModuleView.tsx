import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, ArrowRight, RotateCcw, XCircle, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, Check } from 'lucide-react';
import { getModuleIcon } from './CurriculumView';
import { Module } from '../data/courseData';
import { Language, uiTranslations } from '../data/uiTranslations';

import { db, collection, addDoc, serverTimestamp, query, where, getDocs } from '../firebase';
import { User } from '../firebase';

interface Props {
  module: Module;
  onComplete: () => void;
  onBack: () => void;
  language: Language;
  isFullScreenLockEnabled: boolean;
  userRole: 'student' | 'teacher' | null;
  user: User | null;
  classId: string | null;
  onStepChange?: (step: 'content' | 'quiz') => void;
}

export const ModuleView: React.FC<Props> = ({ module, onComplete, onBack, language, isFullScreenLockEnabled, userRole, user, classId, onStepChange }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [step, setStep] = useState<'content' | 'quiz'>('content');
  const t = uiTranslations[language];
  const moduleData = module.translations[language] || module.translations.en;

  const [customQuestions, setCustomQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  // Load published custom questions from API
  useEffect(() => {
    let active = true;
    const fetchCustomQuestions = async () => {
      try {
        const token = user ? await user.getIdToken() : '';
        const res = await fetch(`/api/questions/${module.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch questions');
        const list = await res.json();
        
        if (!active) return;
        
        // Filter by active language. If none for active language, fallback to English ('en')
        const langFiltered = list.filter((item: any) => item.language === language);
        const finalQuestions = langFiltered.length > 0 
          ? langFiltered 
          : list.filter((item: any) => item.language === 'en' || !item.language);
          
        // Limit to maximum of 4 live questions per module
        setCustomQuestions(finalQuestions.slice(0, 4));
      } catch (err) {
        console.error("Error loading custom questions:", err);
      }
    };

    fetchCustomQuestions();
    return () => {
      active = false;
    };
  }, [module.id, language, user]);

  const [quizVersion, setQuizVersion] = useState<'standard' | 'alternative'>('standard');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finishedQuiz, setFinishedQuiz] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{questionIdx: number, selectedIdx: number, isCorrect: boolean, correctIndex?: number}[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const activeQuiz = useMemo(() => {
    if (customQuestions.length > 0) {
      return customQuestions;
    }
    if (quizVersion === 'alternative' && moduleData.quizAlternative && moduleData.quizAlternative.length > 0) {
      return moduleData.quizAlternative;
    }
    return moduleData.quiz;
  }, [quizVersion, moduleData, customQuestions]);

  useEffect(() => {
    const answered = userAnswers.find(a => a.questionIdx === currentQuestionIdx);
    setShowFeedback(!!answered);
  }, [currentQuestionIdx, userAnswers]);

  // Auto-advance 3 seconds after feedback is shown
  useEffect(() => {
    if (step !== 'quiz' || finishedQuiz || !showFeedback) return;

    const timer = setTimeout(() => {
      if (currentQuestionIdx < activeQuiz.length - 1) {
        setCurrentQuestionIdx(q => q + 1);
      } else {
        const finalScore = userAnswers.filter(a => a.isCorrect).length;
        setScore(finalScore);
        setFinishedQuiz(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [step, finishedQuiz, showFeedback, currentQuestionIdx, activeQuiz.length, userAnswers]);

  useEffect(() => {
      if (step === 'quiz' && isFullScreenLockEnabled && userRole === 'student') {
          // Request full screen safely on user interaction
          if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
          }
      }
      
      // Handle exit full screen
      const handleFullscreenChange = async () => {
          if (step === 'quiz' && isFullScreenLockEnabled && userRole === 'student' && !document.fullscreenElement && !finishedQuiz) {
              // Report event to teacher
              if (classId && user) {
                  try {
                      await addDoc(collection(db, 'classes', classId, 'alerts'), {
                          userId: user.uid,
                          userName: user.displayName || 'Anonymous',
                          type: 'fullscreen_exit',
                          moduleTitle: moduleData.title,
                          timestamp: serverTimestamp(),
                          message: 'Exited full screen mode during quiz.'
                      });
                  } catch (err) {
                      console.error('Error reporting alert:', err);
                  }
              }
          }
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => {
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          // Exit full screen when leaving quiz or module
          if (document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
          }
      };
  }, [step, isFullScreenLockEnabled, userRole, finishedQuiz, classId, user, moduleData.title]);

  const contentSections = useMemo(() => {
    const sections: { title: string | null; paragraphs: string[] }[] = [];
    const lines = moduleData.content.split('\n').map(l => l.trim()).filter(l => l);
    
    let currentSection: { title: string | null; paragraphs: string[] } = { title: null, paragraphs: [] };
    
    lines.forEach(line => {
      // Short lines ending in ':' are headings. Normal longer lines ending in ':' are treated as standard paragraphs.
      if (line.endsWith(':') && line.length < 45) {
        if (currentSection.paragraphs.length > 0 || currentSection.title) {
          if (currentSection.paragraphs.length > 0) {
            sections.push(currentSection);
          }
        }
        // Slice off the trailing colon for a clean typography display
        currentSection = { title: line.slice(0, -1).trim(), paragraphs: [] };
      } else {
        currentSection.paragraphs.push(line);
      }
    });
    
    if (currentSection.paragraphs.length > 0) {
      sections.push(currentSection);
    } else if (currentSection.title && sections.length > 0) {
      // If there is a trailing title with no paragraphs, treat it as a bold takeaway inside the last section
      sections[sections.length - 1].paragraphs.push(currentSection.title);
    }
    
    return sections.length > 0 ? sections : [{ title: null, paragraphs: [] }];
  }, [moduleData.content]);

  const currentShuffledOptions = useMemo(() => {
    if (step !== 'quiz' || finishedQuiz || !activeQuiz[currentQuestionIdx]) return [];
    const question = activeQuiz[currentQuestionIdx];
    const optionsWithIndices = question.options.map((text, originalIndex) => ({
      text,
      originalIndex
    }));
    
    for (let i = optionsWithIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndices[i], optionsWithIndices[j]] = [optionsWithIndices[j], optionsWithIndices[i]];
    }
    return optionsWithIndices;
  }, [activeQuiz, currentQuestionIdx, step, finishedQuiz]);

  const [isGrading, setIsGrading] = useState(false);
  const [gradedResults, setGradedResults] = useState<any>(null);

  const handleAnswer = (originalIndex: number) => {
    if (isTransitioning) return;

    setUserAnswers(prev => {
      const existingIdx = prev.findIndex(a => a.questionIdx === currentQuestionIdx);
      const newAnswer = {
        questionIdx: currentQuestionIdx,
        selectedIdx: originalIndex,
        isCorrect: false // will be updated by server
      };
      
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newAnswer;
        return next;
      }
      return [...prev, newAnswer];
    });

    // Advance to next question automatically after a short delay for smoothness
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentQuestionIdx < activeQuiz.length - 1) {
        setCurrentQuestionIdx(q => q + 1);
      }
      setIsTransitioning(false);
    }, 400);
  };

  const submitQuiz = async () => {
    setIsGrading(true);
    try {
      const token = user ? await user.getIdToken() : '';
      
      // Build answers map: { [questionId]: selectedIndex }
      const answersMap: Record<string, number> = {};
      userAnswers.forEach(a => {
        const q = activeQuiz[a.questionIdx];
        if (q && q.id) {
          answersMap[q.id] = a.selectedIdx;
        } else {
          // If using static standard quiz without IDs, fallback to local grading (just in case)
          // But wait, the standard quizzes don't have DB IDs! They are static.
        }
      });
      
      // Send standard or alternative quizzes to the server for secure grading
      const res = await fetch('/api/grade-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          moduleId: module.id,
          answers: answersMap,
          isAlternative: quizVersion === 'alternative' && activeQuiz.some(q => q.id)
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setGradedResults(data);
        setScore(data.correctCount);
        
        // Update userAnswers with server truths for review
        const updatedAnswers = userAnswers.map(a => {
          const q = activeQuiz[a.questionIdx];
          const resultKey = q.id || a.questionIdx.toString();
          if (data.results[resultKey]) {
            return {
              ...a,
              isCorrect: data.results[resultKey].correct,
              correctIndex: data.results[resultKey].correctIndex
            };
          }
          return a;
        });
        setUserAnswers(updatedAnswers);
      } else {
        console.error("Grading failed:", data.error);
      }
    } catch (err) {
      console.error("Failed to grade quiz:", err);
    } finally {
      setIsGrading(false);
      setFinishedQuiz(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < activeQuiz.length - 1) {
      setCurrentQuestionIdx(q => q + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(q => q - 1);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIdx < contentSections.length - 1) {
      setCurrentSectionIdx(i => i + 1);
    } else {
      if (!activeQuiz || activeQuiz.length === 0) {
        onComplete();
      } else {
        setQuizVersion(Math.random() > 0.5 ? 'alternative' : 'standard');
        setStep('quiz');
      }
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(i => i - 1);
    }
  };

  const handleRetry = () => {
    setScore(0);
    setCurrentQuestionIdx(0);
    setCurrentSectionIdx(0);
    setFinishedQuiz(false);
    setUserAnswers([]);
    setShowReview(false);
    setQuizVersion(Math.random() > 0.5 ? 'alternative' : 'standard');
    setStep('quiz');
  };

  const handleReview = () => {
    setScore(0);
    setCurrentQuestionIdx(0);
    setCurrentSectionIdx(0);
    setFinishedQuiz(false);
    setUserAnswers([]);
    setShowReview(false);
    setStep('content');
  };

  const isPerfectScore = score === activeQuiz.length;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12 px-3 sm:px-4 font-sans">
      {/* Header Bento */}
      <div className="bg-gradient-to-br from-slate-950 via-[#0d1029] to-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden flex items-center justify-between gap-4">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3.5 min-w-0">
          <button 
            onClick={onBack}
            disabled={step === 'quiz' && isFullScreenLockEnabled && userRole === 'student'}
            className={`p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 transition-all shrink-0 ${step === 'quiz' && isFullScreenLockEnabled && userRole === 'student' ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/20 hover:scale-105 active:scale-95 text-white'}`}
            title="Return to modules"
            aria-label="Return to modules"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/30 inline-flex items-center gap-1 mb-1">
              {getModuleIcon(module.id, "w-2.5 h-2.5")} Focus Area
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              {moduleData.title}
            </h2>
          </div>
        </div>

        {/* Top Progress in Header for Quick Context */}
        <div className="relative z-10 hidden sm:flex items-center gap-3 shrink-0 bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-md">
          {step === 'content' ? (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300">Lesson</span>
              <p className="text-xs font-bold text-white">Section {currentSectionIdx + 1} / {contentSections.length}</p>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">Quiz</span>
              <p className="text-xs font-bold text-white">Q {currentQuestionIdx + 1} of {activeQuiz.length}</p>
            </div>
          )}
        </div>
      </div>

      {step === 'quiz' && isFullScreenLockEnabled && userRole === 'student' && (
        <div className="bg-rose-50 border border-rose-100 py-2.5 px-4 rounded-2xl flex items-center gap-2.5 text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Navigation locked by teacher during quiz. Exiting full screen will be reported.</span>
        </div>
      )}

      {step === 'quiz' ? (
        /* Streamlined Quiz Container (Fits without scrolling on 1080p & iPad) */
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-md animate-in fade-in duration-300">
          {!finishedQuiz ? (
            <div key={`q-${currentQuestionIdx}`} className="space-y-4">
              {/* Question Header & Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200/60">
                    Question {currentQuestionIdx + 1} of {activeQuiz.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {Math.round(((currentQuestionIdx + 1) / activeQuiz.length) * 100)}% Completed
                  </span>
                </div>
                
                {/* Thin progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.length) * 100}%` }}
                  />
                </div>

                {/* Question Prompt with increased readability */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug pt-1">
                  {activeQuiz[currentQuestionIdx].question}
                </h3>
              </div>

              {/* 2x2 Options Grid on Tablet/Desktop for compact height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {currentShuffledOptions.map((option, i) => {
                  const answerObj = userAnswers.find(a => a.questionIdx === currentQuestionIdx);
                  const isSelected = answerObj?.selectedIdx === option.originalIndex;
                  const isCorrectOption = option.originalIndex === (userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.correctIndex ?? activeQuiz[currentQuestionIdx].correctIndex);
                  
                  let btnStyle = 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-800 bg-white';
                  let badgeStyle = 'border-slate-300';
                  let dotStyle = 'bg-indigo-600 opacity-0 scale-50';

                  if (showFeedback) {
                    if (isCorrectOption) {
                      btnStyle = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-xs';
                      badgeStyle = 'border-emerald-500 bg-emerald-500';
                      dotStyle = 'bg-white scale-100 opacity-100';
                    } else if (isSelected) {
                      btnStyle = 'border-rose-400 bg-rose-50/90 text-rose-950 shadow-xs';
                      badgeStyle = 'border-rose-400 bg-rose-400';
                      dotStyle = 'bg-white scale-100 opacity-100';
                    } else {
                      btnStyle = 'border-slate-100 text-slate-400 opacity-50 cursor-not-allowed bg-slate-50/40';
                      badgeStyle = 'border-slate-200 opacity-40';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-[#7F7FFA] bg-indigo-50/60 text-indigo-950 shadow-xs';
                    badgeStyle = 'border-[#7F7FFA] bg-[#7F7FFA]';
                    dotStyle = 'bg-white scale-100 opacity-100';
                  }

                  return (
                    <button
                      key={`${currentQuestionIdx}-${i}`}
                      type="button"
                      onClick={() => handleAnswer(option.originalIndex)}
                      disabled={showFeedback}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 outline-none flex items-center justify-between gap-2.5 group min-h-[58px] ${btnStyle}`}
                    >
                      <span className="text-xs sm:text-sm md:text-[15px] font-semibold leading-snug pr-2">
                        {option.text}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${badgeStyle}`}>
                        {showFeedback && isCorrectOption ? (
                          <Check className="w-3 h-3 text-white stroke-[4px]" />
                        ) : showFeedback && isSelected ? (
                          <span className="text-white text-xs font-black leading-none">×</span>
                        ) : (
                          <div className={`w-2 h-2 rounded-full transition-all ${dotStyle}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Compact Inline Feedback Banner */}
              {showFeedback && (
                <div 
                  role="status"
                  aria-live="polite"
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 animate-in slide-in-from-top-1 duration-200 relative overflow-hidden ${
                  userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.isCorrect 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.isCorrect 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                    }`}>
                      {userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.isCorrect ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 text-xs sm:text-sm">
                      <span className="font-bold mr-1.5">
                        {userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.isCorrect ? 'Correct!' : 'Incorrect.'}
                      </span>
                      <span className="opacity-90">
                        {userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.isCorrect 
                          ? `"${activeQuiz[currentQuestionIdx].options[userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.correctIndex ?? activeQuiz[currentQuestionIdx].correctIndex]}" is the right answer.` 
                          : `The correct answer is "${activeQuiz[currentQuestionIdx].options[userAnswers.find(a => a.questionIdx === currentQuestionIdx)?.correctIndex ?? activeQuiz[currentQuestionIdx].correctIndex]}".`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 shrink-0 text-[10px] font-bold text-slate-500 bg-white/60 px-2 py-0.5 rounded-md border border-slate-200/50">
                    <span>Advancing in 3s</span>
                    <ChevronRight className="w-3 h-3 text-[#7F7FFA]" />
                  </div>
                </div>
              )}

              {/* Compact Quiz Navigation */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button 
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                    currentQuestionIdx === 0 
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> {t.prevQuestion}
                </button>
                <button 
                  onClick={handleNextQuestion}
                  disabled={!userAnswers.find(a => a.questionIdx === currentQuestionIdx)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] ${
                    !userAnswers.find(a => a.questionIdx === currentQuestionIdx)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#7F7FFA] text-white hover:bg-indigo-700 shadow-indigo-500/20'
                  }`}
                >
                  {currentQuestionIdx < activeQuiz.length - 1 ? (
                    <>
                      {t.nextQuestion} <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      {t.finishQuiz} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Completion / Results View (Fits completely without scrolling) */
            <div className="text-center space-y-4 animate-in zoom-in duration-300 py-2">
              {showReview ? (
                <div className="text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Review Mistakes</h3>
                    <button 
                      onClick={() => setShowReview(false)}
                      className="text-[#7F7FFA] font-bold text-xs sm:text-sm hover:underline"
                    >
                      Back to Results
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {userAnswers.filter(a => !a.isCorrect).map((answer, i) => {
                      const question = activeQuiz[answer.questionIdx];
                      return (
                        <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <p className="font-bold text-xs sm:text-sm text-slate-900">{question.question}</p>
                          <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                            <p className="font-medium text-rose-600 flex items-start gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                              <span>Your Answer: {question.options[answer.selectedIdx]}</span>
                            </p>
                            <p className="font-medium text-emerald-700 flex items-start gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                              <span>Correct: {question.options[answer.correctIndex ?? question.correctIndex]}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {isPerfectScore ? (
                    <div className="space-y-3">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                        <GraduationCap className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t.masteryAchieved}</h3>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
                          {t.perfectScore}: <span className="text-emerald-600 font-bold">{score}/{activeQuiz.length}</span>
                        </p>
                      </div>
                      <button 
                        onClick={() => onComplete()}
                        className="w-full max-w-sm mx-auto bg-[#7F7FFA] text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                      >
                        {t.completeUnit} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-md mx-auto">
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
                        <XCircle className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{t.reviewRequired}</h3>
                        <p className="text-rose-600 mt-1 font-bold bg-rose-50 py-1 px-4 rounded-full inline-block text-sm border border-rose-100">
                          Score: {score}/{activeQuiz.length} (100% Required)
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        {t.masteryRequirement}
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button 
                          onClick={handleRetry}
                          className="bg-[#7F7FFA] text-white font-bold py-2.5 px-3 rounded-xl hover:bg-indigo-700 transition-all shadow-xs flex items-center justify-center gap-1.5 text-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> {t.retryQuiz}
                        </button>
                        <button 
                          onClick={handleReview}
                          className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> {t.reviewUnit}
                        </button>
                      </div>
                      <button 
                        onClick={() => setShowReview(true)}
                        className="w-full bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 text-xs"
                      >
                        Review Mistakes
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Main Bento Grid for Lesson Content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar Tracker Card */}
          <div className="lg:col-span-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-4 sticky top-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F7FFA]">Lesson Progress</span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                  Section {currentSectionIdx + 1} of {contentSections.length}
                </h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center text-[#7F7FFA] shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">
                      {contentSections[currentSectionIdx].title || `Part ${currentSectionIdx + 1}`}
                    </p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-[#7F7FFA] h-full rounded-full transition-all duration-500"
                        style={{ width: `${((currentSectionIdx + 1) / contentSections.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content Card */}
          <div className="lg:col-span-8 bg-white text-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col min-h-[480px]">
            <div className="flex-1 text-slate-700 leading-relaxed space-y-4 mb-6 text-sm sm:text-base">
              <div key={currentSectionIdx} className="animate-in fade-in slide-in-from-right-4 duration-300">
                {contentSections[currentSectionIdx].title && (
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                    {contentSections[currentSectionIdx].title}
                  </h3>
                )}
                
                <div className="space-y-3.5">
                  {contentSections[currentSectionIdx].paragraphs.map((rawPara, i) => {
                    // Sanitize any accidental HTML tags
                    const para = rawPara.replace(/<[^>]*>/g, '').trim();
                    const isBullet = para.startsWith('•') || para.startsWith('-');
                    const cleanText = isBullet ? para.replace(/^[•\-]\s*/, '') : para;
                    const parts = cleanText.split(/(\*\*.*?\*\*)/g);

                    if (isBullet) {
                      return (
                        <div key={i} className="flex items-start gap-2.5 pl-1.5 py-0.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7F7FFA] mt-2.5 shrink-0" />
                          <div className="text-slate-700 text-sm sm:text-base flex-1">
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p key={i} className="leading-relaxed text-slate-700 text-sm sm:text-base">
                        {parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-slate-100">
              {currentSectionIdx > 0 && (
                <button 
                  onClick={handlePrevSection}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> {t.prevSection}
                </button>
              )}
              <button 
                onClick={handleNextSection}
                className="flex-[2] bg-[#7F7FFA] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] text-sm group"
              >
                {currentSectionIdx < contentSections.length - 1 ? (
                  <>
                    {t.nextSection} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : !activeQuiz || activeQuiz.length === 0 ? (
                  <>
                    Complete Unit <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {t.takeQuiz} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};