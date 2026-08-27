import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, Trophy, Lock, FileBadge, Share2, Users, ArrowRight, Loader2, Info, LogOut, Zap, Calendar, Clock, User as UserIcon, X, BookOpen, Layout, AlertCircle, Sparkles, Briefcase, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Module } from '../data/courseData';
import { Language, uiTranslations } from '../data/uiTranslations';
import { db, doc, updateDoc, collection, query, where, getDocs, onSnapshot, setDoc, handleFirestoreError, OperationType, getDoc } from '../firebase';

import { User } from '../firebase';

interface Props {
  modules: Module[];
  completedIds: string[];
  onSelect: (m: Module) => void;
  onClaimCertificate: () => void;
  onViewCurriculum: () => void;
  allCompleted: boolean;
  language: Language;
  user: User | null;
  onLogin: () => void;
  classId: string | null;
  userRole: 'student' | 'teacher' | null;
  triggerLoading?: (message: string, duration?: number) => void;
  onOpenGuide?: () => void;
  onReturnToTeacherMode?: () => void;
  onViewTools?: () => void;
}

import { GuestJoinModal } from './GuestJoinModal';
import { getModuleIcon } from './CurriculumView';

export const Dashboard: React.FC<Props> = ({ 
  modules, 
  completedIds, 
  onSelect, 
  onClaimCertificate, 
  onViewCurriculum, 
  allCompleted, 
  language, 
  user, 
  onLogin, 
  classId, 
  userRole, 
  triggerLoading, 
  onOpenGuide, 
  onReturnToTeacherMode,
  onViewTools 
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState<{ status: 'idle' | 'joined' | 'not_found' | 'error'; message: string; className?: string }>({ status: 'idle', message: '' });
  const [className, setClassName] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<{ title: string; deadline: string; moduleIds?: string[] } | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isAskingName, setIsAskingName] = useState<{ classId: string; teacherId: string; className: string } | null>(null);
  const [tempName, setTempName] = useState('');

  // Find next module
  const requiredModules = modules.filter(m => !m.isOptional);
  const nextModule = requiredModules.find(m => !completedIds.includes(m.id)) || modules.find(m => !completedIds.includes(m.id)) || null;


  useEffect(() => {
    if (classId) {
      const classRef = doc(db, 'classes', classId);
      const unsubscribe = onSnapshot(classRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setClassName(data.className);
          if (data.challenge?.isActive) {
            setActiveChallenge({
              title: data.challenge.title,
              deadline: data.challenge.deadline,
              moduleIds: data.challenge.moduleIds
            });
          } else {
            setActiveChallenge(null);
          }
        }
      }, (err) => {
        console.error('Dashboard Class Snapshot Error:', err);
      });
      return () => unsubscribe();
    }
  }, [classId]);

  const handleJoinClass = async () => {
    if (!user) {
      setJoinFeedback({ status: 'error', message: 'You must be signed in to join a class.' });
      return;
    }
    if (!joinCode || joinCode.trim().length !== 6) {
      setJoinFeedback({ status: 'error', message: 'Please enter a valid 6-character code.' });
      return;
    }
    setIsJoining(true);
    setJoinFeedback({ status: 'idle', message: '' });
    if (triggerLoading) triggerLoading("Joining class...", 2500);
    try {
      const classRef = doc(db, 'classes', joinCode.toUpperCase());
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        setJoinFeedback({ 
          status: 'not_found', 
          message: `Couldn't Find Class: No active class found with code "${joinCode.toUpperCase()}". Check the code with your teacher.` 
        });
        setIsJoining(false);
        return;
      }
      
      const classData = classDoc.data();
      
      if (user) {
        // If user doesn't have a display name, or we want to confirm it for the class
        if (!user.displayName || user.displayName === 'Learner' || user.displayName === 'Anonymous') {
          setIsAskingName({ 
            classId: classDoc.id, 
            teacherId: classData.teacherId,
            className: classData.className
          });
          setTempName(user.displayName || '');
        } else {
          await setDoc(doc(db, 'users', user.uid), {
            classId: classDoc.id,
            teacherId: classData.teacherId,
            joinCode: joinCode.toUpperCase()
          }, { merge: true });
          setJoinFeedback({ 
            status: 'joined', 
            message: `Joined ${classData.className || 'Class'}!`, 
            className: classData.className 
          });
          setTimeout(() => {
            setShowJoinInput(false);
            setJoinFeedback({ status: 'idle', message: '' });
            setJoinCode('');
          }, 1800);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'classes');
      setJoinFeedback({ status: 'error', message: 'Failed to join class. Please try again.' });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!user || !classId) return;
    setIsJoining(true);
    if (triggerLoading) triggerLoading("Leaving class...", 2000);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        classId: null,
        teacherId: null
      }, { merge: true });
      setClassName(null);
      setActiveChallenge(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleConfirmName = async () => {
    if (!user || !isAskingName || !tempName.trim()) return;
    setIsJoining(true);
    try {
      // Sanitize input: Character limit (80 max) and clean up HTML tags to prevent XSS/Payload injection
      const cleaned = tempName.trim().replace(/<\/?[^>]+(>|$)/g, "");
      const finalName = cleaned.substring(0, 80);
      await setDoc(doc(db, 'users', user.uid), {
        displayName: finalName,
        classId: isAskingName.classId,
        teacherId: isAskingName.teacherId,
        joinCode: joinCode.toUpperCase()
      }, { merge: true });
      setJoinFeedback({ 
        status: 'joined', 
        message: `Joined ${isAskingName.className || 'Class'}!`, 
        className: isAskingName.className 
      });
      setIsAskingName(null);
      setTempName('');
      setTimeout(() => {
        setShowJoinInput(false);
        setJoinFeedback({ status: 'idle', message: '' });
        setJoinCode('');
      }, 1800);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      setJoinFeedback({ status: 'error', message: 'Failed to save name. Please try again.' });
    } finally {
      setIsJoining(false);
    }
  };

  const requiredCompletedCount = completedIds.filter(id => requiredModules.some(m => m.id === id)).length;
  const progress = Math.min(100, (requiredCompletedCount / (requiredModules.length || 1)) * 100);
  const t = uiTranslations[language];

  const handleShare = () => {
    const text = t.shareText || `I just mastered the fundamentals of finance with BeginFin! 🎓 I've completed units on budgeting, taxes, and investing. Check out this free platform to start your journey: https://begin-fin.com/ #FinancialLiteracy #BeginFin #Education`;
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-7xl mx-auto px-3 sm:px-4 pb-6 font-sans">
      <GuestJoinModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
      
      {/* Prominent Join Class Modal */}
      <AnimatePresence>
        {showJoinInput && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#7F7FFA]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Join a Class</h3>
                    <p className="text-xs text-slate-500">Enter the 6-character code from your teacher</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowJoinInput(false);
                    setJoinFeedback({ status: 'idle', message: '' });
                    setJoinCode('');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!user ? (
                <div className="space-y-4 text-center py-2">
                  <p className="text-sm text-slate-600">You must be signed in to your BeginFin account to join a class.</p>
                  <button
                    onClick={() => {
                      setShowJoinInput(false);
                      onLogin();
                    }}
                    className="w-full py-3 bg-[#7F7FFA] hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                  >
                    Sign In to Continue
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="join-class-code" className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                      Classroom Join Code
                    </label>
                    <input 
                      id="join-class-code"
                      type="text" 
                      placeholder="ABC123"
                      aria-label="Class Invite Code"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        if (joinFeedback.status !== 'idle') {
                          setJoinFeedback({ status: 'idle', message: '' });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && joinCode.trim().length === 6 && !isJoining) {
                          handleJoinClass();
                        }
                      }}
                      maxLength={6}
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#7F7FFA] focus:bg-white rounded-2xl text-2xl font-black font-mono uppercase text-center tracking-[0.3em] text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Feedback states */}
                  {joinFeedback.status === 'not_found' && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-900 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">Couldn't Find</p>
                        <p className="text-rose-700 mt-0.5">{joinFeedback.message}</p>
                      </div>
                    </div>
                  )}

                  {joinFeedback.status === 'joined' && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-900 animate-in zoom-in-95">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">Joined!</p>
                        <p className="text-emerald-700 mt-0.5">{joinFeedback.message}</p>
                      </div>
                    </div>
                  )}

                  {joinFeedback.status === 'error' && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">Notice</p>
                        <p className="text-amber-800 mt-0.5">{joinFeedback.message}</p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleJoinClass}
                    disabled={isJoining || joinCode.trim().length !== 6 || joinFeedback.status === 'joined'}
                    className="w-full py-3.5 bg-[#7F7FFA] hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Joining...
                      </>
                    ) : joinFeedback.status === 'joined' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Joined!
                      </>
                    ) : (
                      <>
                        Join Class <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Name Request Modal */}
      {isAskingName && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7F7FFA]">
              <UserIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-1.5 tracking-tight">One Last Step</h3>
            <p className="text-slate-500 text-center font-medium text-xs sm:text-sm mb-6">
              You're joining <span className="text-[#7F7FFA] font-bold">{isAskingName.className}</span>. Please enter your full name so your teacher can identify you.
            </p>
            
            <div className="space-y-3.5">
              <input 
                id="join-full-name"
                type="text" 
                placeholder="Your Full Name"
                aria-label="Your Full Name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none text-slate-900 text-sm"
                autoFocus
              />
              <button 
                onClick={handleConfirmName}
                disabled={isJoining || !tempName.trim()}
                className="w-full py-3.5 bg-[#7F7FFA] text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2 text-sm"
              >
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Join'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Challenge Banner (Compact) */}
      {activeChallenge && (
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">Live Class Challenge</p>
              <h3 className="text-sm md:text-base font-black tracking-tight text-white">{activeChallenge.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">Deadline:</span>
            <span className="font-bold text-white text-xs">{new Date(activeChallenge.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Main Bento Container: Compact, zero-scroll on Chromebook & 1080p */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
        
        {/* Top Progress & Actions Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 mb-4 border-b border-slate-100">
          
          {/* Left: Overall Progress Bar */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{t.courseCurriculum}</h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-[#7F7FFA] px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {requiredCompletedCount}/{requiredModules.length} Completed
                </span>
              </div>
              <span className="text-base font-black text-[#7F7FFA] font-mono">{Math.round(progress)}%</span>
            </div>
            
            {/* Slim Animated Progress Bar */}
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-[#7F7FFA] transition-all duration-700 ease-out rounded-full shadow-xs"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button 
              onClick={onViewCurriculum}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-slate-700 font-bold hover:text-[#7F7FFA] hover:bg-slate-100 transition-colors text-xs px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl"
            >
              <Layout className="w-3.5 h-3.5 text-slate-500" /> Curriculum
            </button>

            {onViewTools && (
              <button 
                onClick={onViewTools}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-slate-700 font-bold hover:text-[#7F7FFA] hover:bg-slate-100 transition-colors text-xs px-3.5 py-2 bg-slate-50 border border-slate-200/60 rounded-xl cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Tools & Simulators
              </button>
            )}
            
            {/* Join Class Action */}
            <button 
              onClick={() => {
                setShowJoinInput(true);
                setJoinFeedback({ status: 'idle', message: '' });
                setJoinCode('');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-bold transition-colors text-xs px-3.5 py-2 rounded-xl border text-[#7F7FFA] bg-indigo-50/70 border-indigo-100 hover:bg-indigo-100 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" /> Join Class
            </button>

            {/* Certificate Action */}
            <button 
              onClick={onClaimCertificate}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-bold transition-colors text-xs px-3.5 py-2 rounded-xl border ${
                allCompleted 
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm' 
                  : 'text-[#7F7FFA] bg-indigo-50/70 border-indigo-100 hover:bg-indigo-100'
              }`}
            >
              {allCompleted ? <Trophy className="w-3.5 h-3.5 text-amber-300" /> : <FileBadge className="w-3.5 h-3.5" />}
              {allCompleted ? 'Certificate Ready' : t.viewCertProgress}
            </button>

            {onOpenGuide && (
              <button 
                onClick={onOpenGuide}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-rose-600 font-bold hover:text-rose-800 hover:bg-rose-100 transition-colors text-xs px-3.5 py-2 bg-rose-50 border border-rose-100 rounded-xl"
              >
                <BookOpen className="w-3.5 h-3.5" /> Guide
              </button>
            )}
          </div>
        </div>

        {/* 9 Modules Bento Grid: 3x3 layout on medium/large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {modules.map((m, idx) => {
            const isCompleted = completedIds.includes(m.id);
            const isChallengeModule = activeChallenge?.moduleIds ? activeChallenge.moduleIds.includes(m.id) : !!activeChallenge;
            const isOptional = m.isOptional || m.id === 'm9';
            const isLocked = !isOptional && idx > 0 && !completedIds.includes(modules[idx-1].id) && !isChallengeModule;
            const authRequired = m.requiresAuth && !user;
            const moduleData = m.translations[language] || m.translations.en;
            const rawTitle = moduleData.title.includes(': ') ? moduleData.title.split(': ')[1] : moduleData.title;
            
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  if (authRequired) {
                    onLogin();
                  } else if (!isLocked || isChallengeModule) {
                    onSelect(m);
                  }
                }}
                disabled={isLocked && !authRequired && !isChallengeModule}
                data-incomplete={!isCompleted && !isLocked ? "true" : "false"}
                className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group relative overflow-hidden min-h-[72px] sm:min-h-[76px] ${
                  isCompleted 
                    ? 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300' 
                    : isLocked && !authRequired
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-60 grayscale cursor-not-allowed'
                      : authRequired
                        ? 'bg-indigo-50/40 border-indigo-200 border-dashed hover:bg-indigo-50'
                        : isChallengeModule
                          ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400 hover:shadow-xs'
                          : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xs'
                }`}
              >
                {/* Challenge ribbon if active */}
                {isChallengeModule && !isCompleted && !isLocked && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-amber-500 text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg shadow-xs flex items-center gap-0.5">
                      <Zap className="w-2 h-2 fill-current" />
                      Challenge
                    </div>
                  </div>
                )}

                {/* Left: Icon Badge */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : authRequired 
                      ? 'bg-indigo-100 text-[#7F7FFA]' 
                      : isChallengeModule 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-[#7F7FFA]'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : authRequired ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    getModuleIcon(m.id, "w-4 h-4 sm:w-4.5 sm:h-4.5")
                  )}
                </div>

                {/* Middle: Title & Metadata with increased font size */}
                <div className="flex-1 min-w-0 pr-1">
                  <h4 className={`font-bold text-xs sm:text-sm leading-snug line-clamp-1 ${
                    isCompleted ? 'text-emerald-950' : isChallengeModule && !isCompleted ? 'text-amber-950' : 'text-slate-900'
                  }`}>
                    {rawTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                      Unit {idx + 1}
                    </span>
                    {isOptional && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                        Optional
                      </span>
                    )}
                    {authRequired && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-50 text-[#7F7FFA] px-1.5 py-0.5 rounded border border-indigo-200">
                        Sign In Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Action / Status Indicator */}
                <div className="shrink-0 flex items-center">
                  {isCompleted ? (
                    <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : isLocked && !authRequired ? (
                    <Lock className="w-4 h-4 text-slate-300" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#7F7FFA] group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Celebratory Banner if 100% completed */}
        {allCompleted && (
          <div className="mt-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-800">All Units Completed!</p>
                <p className="text-xs font-medium text-emerald-700">{t.claimCertDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={onClaimCertificate}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <FileBadge className="w-3.5 h-3.5" /> Claim Certificate
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 sm:flex-none px-3 py-2 bg-white text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100/50 transition-all flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
