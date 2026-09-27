import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, Trophy, Lock, FileBadge, Users, ArrowRight, Loader2, Info, LogOut, Zap, Calendar, Clock, User as UserIcon, X, BookOpen, Layout, AlertCircle, Sparkles, Briefcase, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Module } from '../data/courseData';
import { Language, uiTranslations } from '../data/uiTranslations';
import { db, doc, updateDoc, collection, query, where, getDocs, onSnapshot, setDoc, handleFirestoreError, OperationType, auth } from '../firebase';

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
  const [autoEnrolledNotification, setAutoEnrolledNotification] = useState<{
    className: string;
    classId: string;
  } | null>(null);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showJoinInput || isAskingName) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showJoinInput, isAskingName]);

  // Check if student was automatically added to class by a teacher's roster
  useEffect(() => {
    if (!user) return;

    const checkAutoEnrollment = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/check-roster-enrollment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.autoEnrolled && data.className && data.classId) {
            const dismissedKey = `beginfin_dismissed_auto_enroll_${data.classId}`;
            if (!localStorage.getItem(dismissedKey)) {
              setAutoEnrolledNotification({
                className: data.className,
                classId: data.classId
              });
              setClassName((prev) => prev || data.className);
            }
          }
        }
      } catch (err) {
        console.warn('Check roster enrollment note:', err);
      }
    };

    checkAutoEnrollment();
  }, [user]);

  const dismissAutoEnroll = () => {
    if (autoEnrolledNotification) {
      localStorage.setItem(`beginfin_dismissed_auto_enroll_${autoEnrolledNotification.classId}`, 'true');
      setAutoEnrolledNotification(null);
    }
  };

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
      if (!user.displayName || user.displayName === 'Learner' || user.displayName === 'Anonymous') {
        setIsAskingName({ 
          classId: 'pending', 
          teacherId: '',
          className: 'Class'
        });
        setTempName(user.displayName || '');
        setIsJoining(false);
        return;
      }

      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Authentication required");

      const response = await fetch('/api/join-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          joinCode: joinCode.trim().toUpperCase(),
          displayName: user.displayName || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          setJoinFeedback({ 
            status: 'not_found', 
            message: errData.error || `Couldn't Find Class: No active class found with code "${joinCode.toUpperCase()}". Check the code with your teacher.` 
          });
          return;
        }
        throw new Error(errData.error || 'Failed to join class.');
      }

      const result = await response.json();
      setJoinFeedback({ 
        status: 'joined', 
        message: result.message || `Joined ${result.className || 'Class'}!`, 
        className: result.className 
      });
      setTimeout(() => {
        setShowJoinInput(false);
        setJoinFeedback({ status: 'idle', message: '' });
        setJoinCode('');
      }, 1800);
    } catch (err: any) {
      console.error("Error joining class:", err);
      setJoinFeedback({ status: 'error', message: err?.message || 'Failed to join class. Please try again.' });
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
    if (!user || !tempName.trim() || !joinCode.trim()) return;
    setIsJoining(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Authentication required");

      const response = await fetch('/api/join-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          joinCode: joinCode.trim().toUpperCase(),
          displayName: tempName.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to join class with provided name.');
      }

      const result = await response.json();
      setJoinFeedback({ 
        status: 'joined', 
        message: result.message || `Joined ${result.className || 'Class'}!`, 
        className: result.className 
      });
      setIsAskingName(null);
      setTempName('');
      setTimeout(() => {
        setShowJoinInput(false);
        setJoinFeedback({ status: 'idle', message: '' });
        setJoinCode('');
      }, 1800);
    } catch (err: any) {
      console.error("Error saving name and joining class:", err);
      setJoinFeedback({ status: 'error', message: err?.message || 'Failed to save name. Please try again.' });
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden my-auto max-h-[min(90vh,600px)] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-center text-[#7F7FFA]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#3C3C3C] tracking-tight">Join a Classroom</h3>
                    <p className="text-xs text-slate-500">Enter the 6-character code from your teacher or instructor</p>
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
                  <p className="text-sm text-slate-600">Please sign in to your learner account to join your classroom.</p>
                  <button
                    onClick={() => {
                      setShowJoinInput(false);
                      onLogin();
                    }}
                    className="w-full py-3 bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                  >
                    Sign In as Learner
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* One-time notification: added automatically to class by teacher */}
                  {autoEnrolledNotification && (
                    <div className="p-3.5 bg-indigo-50 border border-[#7F7FFA]/30 rounded-2xl flex items-start justify-between gap-3 text-indigo-950 animate-in fade-in">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#7F7FFA] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 shadow-xs">
                          ✓
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">Added to Class!</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            Your teacher added you automatically to <strong className="text-slate-900">{autoEnrolledNotification.className}</strong>.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={dismissAutoEnroll}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="join-class-code" className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Classroom Join Code
                      </label>
                      {autoEnrolledNotification && (
                        <span className="text-[11px] font-semibold text-[#7F7FFA]">
                          Enrolled in {autoEnrolledNotification.className}
                        </span>
                      )}
                    </div>
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
                        <p className="font-bold">Class Code Not Found</p>
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
                    className="w-full py-3.5 bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold rounded-xl transition-all text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
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
                        Join Classroom <ArrowRight className="w-4 h-4" />
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl animate-in zoom-in duration-200 my-auto max-h-[min(90vh,600px)] overflow-y-auto">
            <div className="w-14 h-14 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7F7FFA]">
              <UserIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#3C3C3C] text-center mb-1.5 tracking-tight">Welcome to the Classroom!</h3>
            <p className="text-slate-500 text-center font-medium text-xs sm:text-sm mb-6">
              You're joining <span className="text-[#7F7FFA] font-bold">{isAskingName.className}</span>. Please confirm your name so your instructor can recognize your progress.
            </p>
            
            <div className="space-y-3.5">
              <input 
                id="join-full-name"
                type="text" 
                placeholder="Your Full Name"
                aria-label="Your Full Name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-5 py-3.5 bg-[#F4F8FA] border-2 border-slate-100 rounded-xl font-bold focus:border-[#7F7FFA] focus:bg-white transition-all outline-none text-[#3C3C3C] text-sm"
                autoFocus
              />
              <button 
                onClick={handleConfirmName}
                disabled={isJoining || !tempName.trim()}
                className="w-full py-3.5 bg-[#7F7FFA] text-white font-bold rounded-xl hover:bg-[#6868EB] transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Join Classroom'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Challenge Banner */}
      {activeChallenge && (
        <div className="relative overflow-hidden bg-[#0b0f19] rounded-2xl p-4 text-white shadow-md border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#7F7FFA] rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7F7FFA]">Live Class Challenge</p>
              <h3 className="text-sm md:text-base font-black tracking-tight text-white">{activeChallenge.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 text-xs">
            <Clock className="w-3.5 h-3.5 text-[#7F7FFA]" />
            <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">Deadline:</span>
            <span className="font-bold text-white text-xs">{new Date(activeChallenge.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Main Bento Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm relative overflow-hidden text-[#3C3C3C]">
        
        {/* Top Progress & Actions Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          
          {/* Left: Overall Animated Progress Bar in Iris Pulse and Glacial White Track */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#3C3C3C] tracking-tight">{t.courseCurriculum}</h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#F4F8FA] text-[#7F7FFA] px-2.5 py-0.5 rounded-full border border-[#7F7FFA]/20">
                  {requiredCompletedCount}/{requiredModules.length} Units Mastered
                </span>
              </div>
              <span className="text-base font-black text-[#7F7FFA] font-mono">{Math.round(progress)}%</span>
            </div>
            
            {/* Animated Iris Pulse Progress Track (Glacial White / light Slate Gray track, strictly no amber) */}
            <div className="h-3 w-full bg-[#F4F8FA] border border-slate-200/70 rounded-full overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-[#7F7FFA] rounded-full shadow-xs relative"
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              </motion.div>
            </div>

            {/* Encouraging Mentor Micro-Copy */}
            {progress < 100 && (
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                {progress === 0 
                  ? "Welcome! Start with Unit 1 to begin your path to financial confidence."
                  : progress < 50
                    ? "Great momentum! You're making real progress toward full certification."
                    : "More than halfway there! Keep going — mastery is within reach."
                }
              </p>
            )}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button 
              onClick={onViewCurriculum}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[#3C3C3C] font-bold hover:text-[#7F7FFA] hover:bg-[#F4F8FA] transition-colors text-xs px-3.5 py-2.5 bg-[#F4F8FA] border border-slate-200/60 rounded-xl cursor-pointer"
            >
              <Layout className="w-3.5 h-3.5 text-slate-500" /> Syllabus
            </button>

            {onViewTools && (
              <button 
                onClick={onViewTools}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[#3C3C3C] font-bold hover:text-[#7F7FFA] hover:bg-[#F4F8FA] transition-colors text-xs px-3.5 py-2.5 bg-[#F4F8FA] border border-slate-200/60 rounded-xl cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Tools
              </button>
            )}
            
            {/* Join Class Action & Auto-enroll Notification on the side */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setShowJoinInput(true);
                  setJoinFeedback({ status: 'idle', message: '' });
                  setJoinCode('');
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-bold transition-colors text-xs px-3.5 py-2.5 rounded-xl border text-[#7F7FFA] bg-[#F4F8FA] border-[#7F7FFA]/20 hover:bg-[#ECECFC] cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" /> Join Class
              </button>

              {autoEnrolledNotification && (
                <div 
                  id="auto-enrolled-toast"
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-[#7F7FFA]/30 rounded-xl text-xs text-indigo-950 shadow-xs animate-in fade-in"
                >
                  <span className="w-2 h-2 rounded-full bg-[#7F7FFA] shrink-0" />
                  <span className="text-slate-700 font-medium">
                    Added to <strong className="text-slate-900 font-bold">{autoEnrolledNotification.className}</strong>
                  </span>
                  <button
                    onClick={dismissAutoEnroll}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                    title="Dismiss notification"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Certificate Action */}
            <button 
              onClick={onClaimCertificate}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-bold transition-colors text-xs px-3.5 py-2.5 rounded-xl border cursor-pointer ${
                allCompleted 
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm' 
                  : 'text-[#7F7FFA] bg-[#F4F8FA] border-[#7F7FFA]/20 hover:bg-[#ECECFC]'
              }`}
            >
              {allCompleted ? <Trophy className="w-3.5 h-3.5 text-white" /> : <FileBadge className="w-3.5 h-3.5" />}
              {allCompleted ? 'Claim Certificate' : t.viewCertProgress}
            </button>

            {onOpenGuide && (
              <button 
                onClick={onOpenGuide}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[#3C3C3C] font-bold hover:text-[#7F7FFA] hover:bg-[#F4F8FA] transition-colors text-xs px-3.5 py-2.5 bg-[#F4F8FA] border border-slate-200/60 rounded-xl cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Guide
              </button>
            )}
          </div>
        </div>

        {/* Bento Grid: Restructured module overview with mixed card sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Celebratory Hero Bento Card when 100% Completed */}
          {allCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/60 rounded-2xl p-5 border border-emerald-200/90 shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-950 tracking-tight">Mastery Achieved!</h3>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Congratulations! You have completed all personal finance modules.
                </p>
              </div>
            </motion.div>
          )}

          {/* Module Bento Cards */}
          {modules.map((m, idx) => {
            const isCompleted = completedIds.includes(m.id);
            const isNext = nextModule?.id === m.id && !allCompleted;
            const isChallengeModule = activeChallenge?.moduleIds ? activeChallenge.moduleIds.includes(m.id) : !!activeChallenge;
            const isOptional = m.isOptional || m.id === 'm9';
            const isLocked = !isOptional && idx > 0 && !completedIds.includes(modules[idx-1].id) && !isChallengeModule;
            const authRequired = m.requiresAuth && !user;
            const moduleData = m.translations[language] || m.translations.en;
            const rawTitle = moduleData.title.includes(': ') ? moduleData.title.split(': ')[1] : moduleData.title;

            // Bento Layout Rule:
            // Current / Next active module is rendered as a prominent, featured Bento Card (spanning 2 columns on lg viewports)
            if (isNext) {
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white via-white to-white border-2 border-[#7F7FFA] rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#7F7FFA]/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />

                  {/* Header Row */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#7F7FFA] text-white shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Current Focus · Up Next
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Unit {idx + 1} of {requiredModules.length}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        ~12 min
                      </span>
                    </div>

                    {/* Main Content Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-13 h-13 rounded-2xl bg-[#7F7FFA] text-white flex items-center justify-center shrink-0 shadow-md">
                        {getModuleIcon(m.id, "w-6 h-6 text-white")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-[#3C3C3C] tracking-tight leading-snug">
                          {rawTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {moduleData.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="pt-4 border-t border-slate-100/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#7F7FFA]" />
                      <span>100% mastery required to unlock next unit</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (authRequired) onLogin();
                        else onSelect(m);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Start Unit {idx + 1}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            }

            // Compact Bento Card for Completed Modules
            if (isCompleted) {
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m)}
                  className="col-span-1 text-left p-4 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-50/90 hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between gap-3 group cursor-pointer min-h-[110px]"
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Unit {idx + 1} · Mastered
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      Review <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      {getModuleIcon(m.id, "w-4.5 h-4.5 text-white")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-emerald-950 line-clamp-1">
                        {rawTitle}
                      </h4>
                      <p className="text-[11px] text-emerald-700 line-clamp-1 mt-0.5">
                        {moduleData.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            }

            // Standard Bento Card for Locked or Upcoming Modules
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
                className={`col-span-1 text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 group relative overflow-hidden min-h-[110px] ${
                  isLocked && !authRequired
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-65 cursor-not-allowed'
                    : authRequired
                      ? 'bg-[#F4F8FA] border-[#7F7FFA]/30 border-dashed hover:bg-[#ECECFC] cursor-pointer'
                      : isChallengeModule
                        ? 'bg-[#F4F8FA] border-[#7F7FFA] hover:shadow-xs cursor-pointer'
                        : 'bg-white border-slate-200/80 hover:border-[#7F7FFA]/60 hover:shadow-xs cursor-pointer'
                }`}
              >
                {/* Challenge ribbon if active */}
                {isChallengeModule && !isLocked && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#7F7FFA] text-white text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg shadow-xs flex items-center gap-0.5">
                      <Zap className="w-2 h-2 fill-current" />
                      Challenge
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Unit {idx + 1}
                    </span>
                    {isOptional && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                        Optional
                      </span>
                    )}
                    {authRequired && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-[#F4F8FA] text-[#7F7FFA] px-1.5 py-0.5 rounded border border-[#7F7FFA]/20">
                        Sign In Required
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 text-slate-400">
                    {isLocked && !authRequired ? (
                      <Lock className="w-3.5 h-3.5 text-slate-300" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 group-hover:text-[#7F7FFA] group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    authRequired
                      ? 'bg-[#F4F8FA] text-[#7F7FFA] border border-[#7F7FFA]/20'
                      : isChallengeModule
                        ? 'bg-[#7F7FFA] text-white'
                        : 'bg-[#F4F8FA] text-[#3C3C3C] group-hover:bg-[#7F7FFA] group-hover:text-white transition-colors'
                  }`}>
                    {authRequired ? (
                      <Lock className="w-4 h-4" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      getModuleIcon(m.id, "w-4.5 h-4.5")
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[#3C3C3C] line-clamp-1">
                      {rawTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {isLocked ? "Complete preceding units to unlock" : moduleData.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
