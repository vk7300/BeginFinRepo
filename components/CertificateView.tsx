import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, ArrowLeft, Award, CheckCircle, Send, Check, AlertCircle, ShieldCheck, Loader2, LogIn, Lock, AlertTriangle, Globe, EyeOff } from 'lucide-react';
import { modules } from '../data/courseData';
import { Language } from '../data/uiTranslations';
import { db, doc, getDoc, setDoc, auth, handleFirestoreError, OperationType } from '../firebase';

interface Props {
  userName: string;
  setUserName: (name: string) => void;
  completedIds: string[];
  onBack: () => void;
  language: Language;
  userId: string;
  onLogin?: () => void;
}

export const CertificateView: React.FC<Props> = ({ 
  userName, 
  setUserName, 
  completedIds, 
  onBack, 
  language, 
  userId, 
  onLogin 
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [inputName, setInputName] = useState('');
  const [isNameSet, setIsNameSet] = useState(!!userName);
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublicVerification, setIsPublicVerification] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const requiredModules = useMemo(() => modules.filter(m => !m.isOptional), []);
  const completedCount = useMemo(() => requiredModules.filter(m => completedIds.includes(m.id)).length, [requiredModules, completedIds]);
  const allCompleted = useMemo(() => completedCount >= requiredModules.length, [completedCount, requiredModules.length]);

  // Load existing credential settings on mount
  useEffect(() => {
    if (!userId) return;
    const fetchCredential = async () => {
      try {
        const credRef = doc(db, 'credentials', userId);
        const credSnap = await getDoc(credRef);
        if (credSnap.exists()) {
          const data = credSnap.data();
          if (typeof data.isPublic === 'boolean') {
            setIsPublicVerification(data.isPublic);
          }
        }
      } catch (err) {
        console.warn('Could not fetch existing credential:', err);
      }
    };
    fetchCredential();
  }, [userId]);

  // Auto-sync credential document via server endpoint when all modules completed and userName is set
  useEffect(() => {
    if (!userId || !userName || !allCompleted) return;

    const syncCredential = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) return;

        const response = await fetch('/api/issue-certificate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            graduateName: userName,
            isPublic: isPublicVerification,
            completedModules: completedIds
          })
        });

        if (response.ok) {
          const resData = await response.json().catch(() => ({}));
          if (resData.credential) {
            const credRef = doc(db, 'credentials', userId);
            await setDoc(credRef, resData.credential, { merge: true });
          }
        }
      } catch (err) {
        console.warn('Auto credential sync notice:', err);
      }
    };

    syncCredential();
  }, [userId, userName, allCompleted, isPublicVerification]);

  const requestDigitalCredential = () => {
    if (!allCompleted) {
      setShowIncompleteNotice(true);
      return;
    }
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScSI5QWSR0q6TtTMC9SWeK00cle6_Jmz6zM3rTpAM8YMPG4Zw/viewform?usp=publish-editor", "_blank");
  };

  const handleDownloadPDF = () => {
    if (!allCompleted) {
      setShowIncompleteNotice(true);
      return;
    }
    window.print();
  };

  useEffect(() => {
    if (userName) {
      setIsNameSet(true);
    }
  }, [userName]);

  const dateStr = useMemo(() => new Date().toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  }), []);

  const handleTogglePublic = async () => {
    if (!userId || isTogglingPublic) return;
    const nextStatus = !isPublicVerification;
    setIsTogglingPublic(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Authentication required");

      const response = await fetch('/api/issue-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          graduateName: userName || "BeginFin Student",
          isPublic: nextStatus,
          completedModules: completedIds
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update credential visibility");
      }

      const resData = await response.json().catch(() => ({}));
      const credRef = doc(db, 'credentials', userId);
      if (resData.credential) {
        await setDoc(credRef, resData.credential, { merge: true });
      } else {
        await setDoc(credRef, { isPublic: nextStatus, updatedAt: new Date().toISOString() }, { merge: true });
      }

      setIsPublicVerification(nextStatus);
    } catch (err) {
      console.error('Error toggling credential visibility:', err);
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleSetName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (inputName.trim()) {
      const cleaned = inputName.trim().replace(/<\/?[^>]+(>|$)/g, "");
      const finalName = cleaned.substring(0, 80);
      setIsSaving(true);

      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          displayName: finalName,
          lastUpdated: new Date().toISOString()
        }, { merge: true });

        const idToken = await auth.currentUser?.getIdToken();
        if (idToken && allCompleted) {
          const response = await fetch('/api/issue-certificate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              graduateName: finalName,
              isPublic: isPublicVerification,
              completedModules: completedIds
            })
          });
          if (response.ok) {
            const resData = await response.json().catch(() => ({}));
            if (resData.credential) {
              const credRef = doc(db, 'credentials', userId);
              await setDoc(credRef, resData.credential, { merge: true });
            }
          }
        }

        setUserName(finalName);
        setIsNameSet(true);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Guest view requesting account creation
  if (!userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 no-print">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100 max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl flex items-center justify-center mx-auto text-[#7F7FFA]">
            <AlertCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#3C3C3C] tracking-tight">Account Required for Certificate</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              To maintain credential integrity, certificates of completion are exclusive to registered BeginFin accounts.
            </p>
          </div>

          <div className="bg-[#F4F8FA] border border-slate-200/80 rounded-2xl p-4 text-left space-y-3">
            <h4 className="text-xs font-bold text-[#3C3C3C] uppercase tracking-wider">Account Benefits:</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#3C3C3C]">Progress Sync:</strong> Your current module progress will automatically synchronize to your account.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#3C3C3C]">Official Credential:</strong> Download verified certificates of completion upon completing all units.</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onLogin}
              className="flex-1 bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all min-h-[44px] cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Sign In / Create Account
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-[#F4F8FA] hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl border border-slate-200/80 transition-all min-h-[44px] cursor-pointer"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Input view to set name on certificate
  if (!isNameSet) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-[#7F7FFA]" />
            </div>
            <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Claim Your Certificate</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Enter your full legal name. This will appear on your certificate.
            </p>
          </div>
          
          <form onSubmit={handleSetName} className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Full Name</label>
              <input 
                id="full-name"
                autoFocus
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Johnathan Q. Public"
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-white focus:border-[#7F7FFA] outline-none transition-all font-medium text-lg text-slate-900 placeholder:text-slate-400 disabled:opacity-60 disabled:bg-slate-50"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Generate Certificate <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
          
          <button 
            onClick={onBack}
            className="w-full mt-6 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors cursor-pointer"
          >
            I'll do this later
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 pb-20 relative font-sans">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
        
        <div className="flex flex-wrap items-center gap-3 relative">
          {showIncompleteNotice && (
            <div className="absolute -top-12 right-0 md:left-auto bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
              <AlertTriangle className="w-3.5 h-3.5 text-[#7F7FFA]" />
              Finish all {requiredModules.length} units to unlock download! ({completedCount}/{requiredModules.length} complete)
              <div className="absolute top-full right-6 border-8 border-transparent border-t-slate-900" />
            </div>
          )}

          <button 
            onClick={requestDigitalCredential}
            disabled={!allCompleted}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
              allCompleted 
                ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Request Digital Credential
          </button>

          <button 
            onClick={handleDownloadPDF}
            disabled={!allCompleted}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all shadow-md ${
              allCompleted 
                ? 'bg-[#7F7FFA] text-white hover:bg-[#6868EB] cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={allCompleted ? "Download official PDF certificate" : "Complete all units to unlock download"}
          >
            {allCompleted ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />}
            <span>Download PDF Certificate</span>
          </button>
        </div>
      </div>

      {/* Completion status notification */}
      {!allCompleted && (
        <div className="no-print bg-[#F4F8FA] border border-[#7F7FFA]/30 rounded-2xl p-4 text-[#3C3C3C] flex items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#7F7FFA] shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs sm:text-sm font-medium">
            <span className="font-bold">Course In Progress: </span>
            You have completed {completedCount} of {requiredModules.length} modules. Finish all modules to remove the "NOT COMPLETED" watermark and unlock official PDF certificate downloads.
          </div>
        </div>
      )}

      {/* Certificate Card */}
      <div 
        ref={certificateRef} 
        className="bg-white border-[12px] md:border-[18px] border-[#2c5282] shadow-2xl p-5 md:p-8 relative overflow-hidden rounded-sm mx-auto max-w-[1000px] aspect-[1.414/1] flex flex-col items-center justify-between text-slate-900 certificate-print-card"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Ornate Inner Double Border */}
        <div className="absolute inset-2 border border-[#ca8a04]/40 pointer-events-none rounded-xs" />
        <div className="absolute inset-3 border-2 border-double border-[#ca8a04]/20 pointer-events-none rounded-xs" />

        {/* Ornate subtle background design watermark */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0 flex items-center justify-center">
          <Award className="w-[50%] h-[50%] text-slate-900" />
        </div>

        {/* Incomplete Watermark: displayed when not all modules are complete, prevents Ctrl+P print bypass */}
        {!allCompleted && (
          <div 
            className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            <div className="transform -rotate-[30deg] border-8 border-rose-600/30 px-12 py-6 rounded-3xl bg-rose-500/5 text-center backdrop-blur-[0.5px]">
              <div className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.2em] text-rose-600/35 uppercase font-sans">
                NOT COMPLETED
              </div>
              <div className="text-xs sm:text-sm md:text-base font-bold tracking-[0.3em] text-rose-600/40 uppercase mt-2 font-sans">
                UNOFFICIAL PREVIEW • ALL UNITS REQUIRED
              </div>
            </div>
          </div>
        )}

        <div className="w-full h-full flex flex-col items-center justify-between py-6 px-4 md:py-10 md:px-8 text-center relative z-10 font-sans">
          
          {/* Top Logo and Header */}
          <div className="space-y-2 md:space-y-4">
            <div className="flex items-center justify-center gap-2.5">
               <img src="/logo.png" alt="BeginFin Logo" className="w-7 h-7 md:w-11 md:h-11 object-contain rounded-lg shadow-xs" referrerPolicy="no-referrer" />
               <span className="text-[12px] md:text-lg font-sans font-black tracking-widest text-[#2c5282] uppercase">BeginFin</span>
            </div>
            
            <div className="space-y-1.5 pt-1.5">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-[#2c5282] uppercase tracking-[0.15em] leading-none">
                Certificate
              </h1>
              <h2 className="text-[7px] md:text-[13px] text-slate-500 font-sans tracking-[0.25em] uppercase font-bold pt-1">
                of Financial Literacy Completion
              </h2>
            </div>
          </div>
          
          {/* Certificate Body Content */}
          <div className="w-full space-y-4 md:space-y-6 flex flex-col items-center">
            <p className="text-slate-400 italic text-[10px] md:text-lg leading-none">
              This is to certify that
            </p>
            
            <div className="w-full max-w-[80%] flex flex-col items-center pt-2 pb-4">
              <span className="text-xl sm:text-3xl md:text-5xl font-bold text-amber-700 font-sans italic leading-relaxed block text-center">
                {userName}
              </span>
              <div className="w-3/5 h-[1.5px] bg-[#ca8a04]/30 mt-2" />
            </div>

            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto text-[8px] sm:text-xs md:text-sm italic">
              has successfully completed all personal finance modules within BeginFin, which are vetted and aligned with the National Standards for Personal Finance Education published by the Council for Economic Education.
            </p>
          </div>

          {/* Certificate Footer Signature and Identification Column Block */}
          <div className="grid grid-cols-2 gap-6 sm:gap-12 w-full max-w-2xl mx-auto items-end pt-4 font-sans px-4">
            {/* Date Column */}
            <div className="text-center">
              <div className="font-sans font-bold text-[8px] md:text-sm text-slate-800 leading-tight">
                {dateStr}
              </div>
              <div className="h-[1px] bg-slate-300 mt-1 mb-1.5" />
              <div className="text-[5px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Date of Completion
              </div>
            </div>
            
            {/* Signature Column */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 md:gap-5 text-base sm:text-xl md:text-2xl text-slate-800 leading-tight tracking-tight font-serif italic">
                <span>Vishnu Kakarla</span>
                <span className="font-sans text-slate-400 text-xs md:text-sm font-normal not-italic">&amp;</span>
                <span>Kruz Smith</span>
              </div>
              <div className="h-[1px] bg-slate-300 mt-1 mb-1.5" />
              <div className="text-[5px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Founders, BeginFin
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="no-print flex flex-col items-center gap-3 mt-6">
        {allCompleted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-center max-w-lg mx-auto shadow-sm space-y-2">
            <p className="text-xs md:text-sm font-semibold text-emerald-900 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              Your certificate is verified and complete! You can download your official PDF copy.
            </p>
            {userId && (
              <div className="pt-1 flex items-center justify-center gap-2 text-xs">
                <button
                  onClick={handleTogglePublic}
                  disabled={isTogglingPublic}
                  aria-label={isPublicVerification ? "Disable public verification" : "Enable public verification"}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all border text-slate-700 hover:bg-white bg-slate-50 border-slate-200 cursor-pointer disabled:opacity-60"
                >
                  {isPublicVerification ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Public Verification Link: <strong className="text-emerald-700">Enabled</strong></span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Public Verification Link: <strong className="text-slate-600">Private Only</strong></span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
          <button 
            onClick={() => setIsNameSet(false)}
            className="text-slate-500 hover:text-[#6868EB] hover:underline underline-offset-4 transition-all cursor-pointer py-1"
          >
            Need to change the name? Edit Certificate Name
          </button>
          {allCompleted && (
            <>
              <span className="text-slate-300">•</span>
              <button 
                onClick={requestDigitalCredential}
                className="text-[#7F7FFA] hover:text-[#6868EB] hover:underline underline-offset-4 transition-all flex items-center gap-1.5 cursor-pointer py-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Request Digital Credential
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="no-print py-10"></div>
    </div>
  );
};
