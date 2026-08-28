import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, ArrowRight, RotateCcw, XCircle, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { getModuleIcon } from './CurriculumView';
import { Module, QuizQuestion } from '../data/courseData';
import { Language, uiTranslations } from '../data/uiTranslations';

import { db, collection, addDoc, serverTimestamp } from '../firebase';
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

interface ServerGradingResult {
  questionIdx: number;
  selectedIdx: number;
  isCorrect: boolean;
  correctIndex: number;
}

export const ModuleView: React.FC<Props> = ({ module, onComplete, onBack, language, isFullScreenLockEnabled, userRole, user, classId, onStepChange }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [step, setStep] = useState<'content' | 'quiz'>('content');
  const t = uiTranslations[language];
  const moduleData = module.translations[language] || module.translations.en;

  const [serverQuestions, setServerQuestions] = useState<{
    quiz: QuizQuestion[];
    quizAlternative: QuizQuestion[];
  } | null>(null);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  // Fetch stripped questions from server API
  useEffect(() => {
    let active = true;
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/questions/${module.id}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data) {
            setServerQuestions({
              quiz: data.quiz || [],
              quizAlternative: data.quizAlternative || []
            });
          }
        }
      } catch (err) {
        console.error("Error loading server questions:", err);
      }
    };

    fetchQuestions();
    return () => {
      active = false;
    };
  }, [module.id]);

  const [quizVersion, setQuizVersion] = useState<'standard' | 'alternative'>('standard');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finishedQuiz, setFinishedQuiz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ questionIdx: number; selectedIdx: number }[]>([]);
  const [gradingResults, setGradingResults] = useState<ServerGradingResult[]>([]);
  const [showReview, setShowReview] = useState(false);

  const activeQuiz = useMemo(() => {
    if (serverQuestions) {
      if (quizVersion === 'alternative' && serverQuestions.quizAlternative && serverQuestions.quizAlternative.length > 0) {
        return serverQuestions.quizAlternative;
      }
      if (serverQuestions.quiz && serverQuestions.quiz.length > 0) {
        return serverQuestions.quiz;
      }
    }
    if (quizVersion === 'alternative' && moduleData.quizAlternative && moduleData.quizAlternative.length > 0) {
      return moduleData.quizAlternative;
    }
    return moduleData.quiz || [];
  }, [quizVersion, serverQuestions, moduleData]);

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
      if (line.endsWith(':') && line.length < 45) {
        if (currentSection.paragraphs.length > 0 || currentSection.title) {
          if (currentSection.paragraphs.length > 0) {
            sections.push(currentSection);
          }
        }
        currentSection = { title: line.slice(0, -1).trim(), paragraphs: [] };
      } else {
        currentSection.paragraphs.push(line);
      }
    });

    if (currentSection.paragraphs.length > 0) {
      sections.push(currentSection);
    } else if (currentSection.title && sections.length > 0) {
      sections[sections.length - 1].paragraphs.push(currentSection.title);
    }

    return sections.length > 0 ? sections : [{ title: null, paragraphs: [] }];
  }, [moduleData.content]);

  const currentOptions = useMemo(() => {
    if (step !== 'quiz' || finishedQuiz || !activeQuiz[currentQuestionIdx]) return [];
    const question = activeQuiz[currentQuestionIdx];
    return question.options.map((text, originalIndex) => ({
      text,
      originalIndex
    }));
  }, [activeQuiz, currentQuestionIdx, step, finishedQuiz]);

  const handleAnswer = (originalIndex: number) => {
    if (isSubmitting) return;

    setUserAnswers(prev => {
      const existingIdx = prev.findIndex(a => a.questionIdx === currentQuestionIdx);
      const newAnswer = {
        questionIdx: currentQuestionIdx,
        selectedIdx: originalIndex
      };

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newAnswer;
        return next;
      }
      return [...prev, newAnswer];
    });
  };

  const handleFinishQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let idToken = '';
      if (user) {
        try {
          idToken = await user.getIdToken();
        } catch (tokenErr) {
          console.warn("Could not retrieve Firebase ID token:", tokenErr);
        }
      }

      const res = await fetch('/api/grade-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          moduleId: module.id,
          quizVersion,
          answers: userAnswers
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server grading failed with status ${res.status}`);
      }

      const gradeResult = await res.json();
      setScore(gradeResult.score);
      setGradingResults(gradeResult.results || []);
      setFinishedQuiz(true);

      if (gradeResult.passed) {
        onComplete();
      }
    } catch (err: any) {
      console.error("Grading submission error:", err);
      setSubmitError(err.message || "Failed to submit quiz for server grading. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < activeQuiz.length - 1) {
      setCurrentQuestionIdx(q => q + 1);
    } else {
      handleFinishQuiz();
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
        handleFinishQuiz();
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
    setGradingResults([]);
    setShowReview(false);
    setSubmitError(null);
    setQuizVersion(Math.random() > 0.5 ? 'alternative' : 'standard');
    setStep('quiz');
  };

  const handleReview = () => {
    setScore(0);
    setCurrentQuestionIdx(0);
    setCurrentSectionIdx(0);
    setFinishedQuiz(false);
    setUserAnswers([]);
    setGradingResults([]);
    setShowReview(false);
    setSubmitError(null);
    setStep('content');
  };

  const isPerfectScore = activeQuiz.length > 0 && score === activeQuiz.length;

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
        /* Quiz Container */
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
                    {Math.round(((currentQuestionIdx + 1) / Math.max(activeQuiz.length, 1)) * 100)}% Completed
                  </span>
                </div>
                
                {/* Thin progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / Math.max(activeQuiz.length, 1)) * 100}%` }}
                  />
                </div>

                {/* Question Prompt */}
                {activeQuiz[currentQuestionIdx] && (
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug pt-1">
                    {activeQuiz[currentQuestionIdx].question}
                  </h3>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {currentOptions.map((option, i) => {
                  const answerObj = userAnswers.find(a => a.questionIdx === currentQuestionIdx);
                  const isSelected = answerObj?.selectedIdx === option.originalIndex;
                  
                  let btnStyle = 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-800 bg-white';
                  let badgeStyle = 'border-slate-300';
                  let dotStyle = 'bg-indigo-600 opacity-0 scale-50';

                  if (isSelected) {
                    btnStyle = 'border-[#7F7FFA] bg-indigo-50/60 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20';
                    badgeStyle = 'border-[#7F7FFA] bg-[#7F7FFA]';
                    dotStyle = 'bg-white scale-100 opacity-100';
                  }

                  return (
                    <button
                      key={`${currentQuestionIdx}-${i}`}
                      type="button"
                      onClick={() => handleAnswer(option.originalIndex)}
                      disabled={isSubmitting}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 outline-none flex items-center justify-between gap-2.5 group min-h-[58px] ${btnStyle}`}
                    >
                      <span className="text-xs sm:text-sm md:text-[15px] font-semibold leading-snug pr-2">
                        {option.text}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${badgeStyle}`}>
                        <div className={`w-2 h-2 rounded-full transition-all ${dotStyle}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Quiz Navigation */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button 
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIdx === 0 || isSubmitting}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                    currentQuestionIdx === 0 || isSubmitting
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> {t.prevQuestion}
                </button>
                <button 
                  onClick={handleNextQuestion}
                  disabled={!userAnswers.find(a => a.questionIdx === currentQuestionIdx) || isSubmitting}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] ${
                    !userAnswers.find(a => a.questionIdx === currentQuestionIdx) || isSubmitting
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#7F7FFA] text-white hover:bg-indigo-700 shadow-indigo-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting & Grading...
                    </>
                  ) : currentQuestionIdx < activeQuiz.length - 1 ? (
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
            /* Quiz Completion / Results View */
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
                    {gradingResults.filter(a => !a.isCorrect).map((result, i) => {
                      const question = activeQuiz[result.questionIdx];
                      if (!question) return null;
                      return (
                        <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <p className="font-bold text-xs sm:text-sm text-slate-900">{question.question}</p>
                          <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                            <p className="font-medium text-rose-600 flex items-start gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                              <span>Your Answer: {question.options[result.selectedIdx] || 'None'}</span>
                            </p>
                            <p className="font-medium text-emerald-700 flex items-start gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                              <span>Correct: {question.options[result.correctIndex]}</span>
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
                      {gradingResults.some(r => !r.isCorrect) && (
                        <button 
                          onClick={() => setShowReview(true)}
                          className="w-full bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 text-xs"
                        >
                          Review Mistakes
                        </button>
                      )}
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
