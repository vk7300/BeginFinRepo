import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, ArrowLeft, Award, CheckCircle, Send, Check, AlertCircle, ShieldCheck, Loader2, LogIn, Lock, AlertTriangle, Printer, RefreshCw, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { modules } from '../data/courseData';
import { Language } from '../data/uiTranslations';
import { db, doc, setDoc, auth, handleFirestoreError, OperationType } from '../firebase';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const hasSyncedRef = useRef(false);
  
  // Certificate container & scaling
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const [containerScale, setContainerScale] = useState<number>(1);

  const requiredModules = useMemo(() => modules.filter(m => !m.isOptional), []);
  const completedCount = useMemo(() => requiredModules.filter(m => completedIds.includes(m.id)).length, [requiredModules, completedIds]);
  const allCompleted = useMemo(() => completedCount >= requiredModules.length, [completedCount, requiredModules.length]);

  // Handle responsive scaling so preview matches the 1120x792 mm certificate at all viewport widths
  useEffect(() => {
    const handleResize = () => {
      if (!containerWrapperRef.current) return;
      const availableWidth = containerWrapperRef.current.clientWidth;
      const targetWidth = 1120;
      const calculatedScale = Math.min(1, Math.max(0.28, availableWidth / targetWidth));
      setContainerScale(calculatedScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync credential document when all modules completed and userName is set (only once per session)
  useEffect(() => {
    if (!userId || !userName || !allCompleted || hasSyncedRef.current) return;

    const syncCredential = async () => {
      try {
        hasSyncedRef.current = true;
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
            isPublic: true,
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
        // Fallback silently if offline or sync fails
      }
    };

    syncCredential();
  }, [userId, userName, allCompleted, completedIds]);

  const requestDigitalCredential = () => {
    if (!allCompleted) {
      setShowIncompleteNotice(true);
      return;
    }
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScSI5QWSR0q6TtTMC9SWeK00cle6_Jmz6zM3rTpAM8YMPG4Zw/viewform?usp=publish-editor", "_blank");
  };

  // Direct PDF download using html2canvas & jsPDF with high DPI rendering and oklab-safe color sanitizer
  const handleDownloadPDF = async () => {
    if (!allCompleted) {
      setShowIncompleteNotice(true);
      return;
    }
    if (!certificateRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const element = certificateRef.current;
      if (!element) return;
      
      // Render canvas at 2x scale for crisp typography
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 1120,
        ignoreElements: (el) => {
          return el.classList ? el.classList.contains('no-print') : false;
        },
        onclone: (clonedDoc) => {
          // 1. Sanitize all <style> tags to eliminate any modern color spaces (oklch, oklab, color-mix, etc.)
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent) {
              styleTag.textContent = styleTag.textContent
                .replace(/oklch\([^)]+\)/gi, '#7F7FFA')
                .replace(/oklab\([^)]+\)/gi, '#3C3C3C')
                .replace(/color-mix\([^)]+\)/gi, '#7F7FFA')
                .replace(/color\(display-p3[^)]+\)/gi, '#7F7FFA')
                .replace(/color\(srgb[^)]+\)/gi, '#7F7FFA');
            }
          });

          // 2. Fallback color converter using 2D canvas getImageData (guaranteed to return standard rgb/rgba numbers)
          const testCanvas = document.createElement('canvas');
          testCanvas.width = 1;
          testCanvas.height = 1;
          const ctx = testCanvas.getContext('2d', { willReadFrequently: true });
          
          const convertColor = (colorStr: string): string => {
            if (!colorStr || (!colorStr.includes('oklab') && !colorStr.includes('oklch') && !colorStr.includes('color(') && !colorStr.includes('color-mix'))) {
              return colorStr;
            }
            if (ctx) {
              try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = '#3C3C3C';
                ctx.fillStyle = colorStr;
                ctx.fillRect(0, 0, 1, 1);
                const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
              } catch {
                return '#3C3C3C';
              }
            }
            return '#3C3C3C';
          };

          const certEl = clonedDoc.getElementById('beginfin-certificate');
          const targetNodes = certEl ? [certEl, ...Array.from(certEl.querySelectorAll('*'))] : Array.from(clonedDoc.querySelectorAll('*'));
          
          const colorProps = [
            'color', 'background-color', 'border-color', 
            'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
            'outline-color', 'text-decoration-color', 'fill', 'stroke'
          ];

          targetNodes.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl && htmlEl.style) {
              try {
                const computed = window.getComputedStyle(htmlEl);
                colorProps.forEach((prop) => {
                  const val = computed.getPropertyValue(prop);
                  if (val && (val.includes('oklab') || val.includes('oklch') || val.includes('color(') || val.includes('color-mix'))) {
                    htmlEl.style.setProperty(prop, convertColor(val), 'important');
                  }
                });
                const shadow = computed.getPropertyValue('box-shadow');
                if (shadow && (shadow.includes('oklab') || shadow.includes('oklch') || shadow.includes('color(') || shadow.includes('color-mix'))) {
                  htmlEl.style.setProperty('box-shadow', 'none', 'important');
                }
              } catch {
                // ignore
              }
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const safeGraduate = (userName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`BeginFin_Certificate_Financial_Literacy_${safeGraduate}.pdf`);
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
      // Fallback to standard window.print if canvas generation fails
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
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

  // Clean, standard formatted issue date
  const issueDateString = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, []);

  const credentialId = useMemo(() => {
    const seed = userId || 'STUDENT';
    return `BF-${new Date().getFullYear()}-${seed.slice(0, 8).toUpperCase()}`;
  }, [userId]);

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
              isPublic: true,
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
      <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 no-print font-sans">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100 max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl flex items-center justify-center mx-auto text-[#7F7FFA]">
            <AlertCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#3C3C3C] tracking-tight">Account Required for Certificate</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Official certificates of completion are awarded to registered BeginFin student accounts upon fulfilling all curriculum requirements.
            </p>
          </div>

          <div className="bg-[#F4F8FA] border border-slate-200/80 rounded-2xl p-4 text-left space-y-3">
            <h4 className="text-xs font-bold text-[#3C3C3C] uppercase tracking-wider">Account Benefits:</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#3C3C3C]">Progress Sync:</strong> Current module milestones automatically sync to your permanent account.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#3C3C3C]">Verifiable Certificate:</strong> Download print-ready high-resolution certificates upon fulfilling all curriculum requirements.</span>
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
      <div className="min-h-[60vh] flex items-center justify-center p-4 no-print font-sans">
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F4F8FA] border border-[#7F7FFA]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7F7FFA]">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Claim Your Certificate</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Enter your name as it should appear on your official Certificate of Completion.
            </p>
          </div>
          
          <form onSubmit={handleSetName} className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-xs font-bold text-[#3C3C3C] mb-2 uppercase tracking-widest">Name on Certificate</label>
              <input 
                id="full-name"
                autoFocus
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
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
                <>Save &amp; Preview Certificate <Send className="w-4 h-4" /></>
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
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-20 relative font-sans">
      {/* Top Toolbar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-[#3C3C3C] hover:text-[#7F7FFA] font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
        
        <div className="flex flex-wrap items-center gap-2.5 relative">
          {showIncompleteNotice && (
            <div className="absolute -top-12 right-0 bg-[#3C3C3C] text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Complete all {requiredModules.length} units to unlock download! ({completedCount}/{requiredModules.length} complete)
              <div className="absolute top-full right-8 border-8 border-transparent border-t-[#3C3C3C]" />
            </div>
          )}

          <button 
            onClick={requestDigitalCredential}
            disabled={!allCompleted}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              allCompleted 
                ? 'bg-white text-[#3C3C3C] hover:bg-[#F4F8FA] border border-slate-200 cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Request Digital Badge
          </button>

          <button 
            onClick={handlePrint}
            disabled={!allCompleted}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              allCompleted 
                ? 'bg-white text-[#3C3C3C] hover:bg-[#F4F8FA] border border-slate-200 cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title="Print via browser dialog"
          >
            <Printer className="w-4 h-4 text-[#3C3C3C]" /> Print
          </button>

          <button 
            onClick={handleDownloadPDF}
            disabled={!allCompleted || isDownloading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              allCompleted 
                ? 'bg-[#7F7FFA] hover:bg-[#6868EB] text-white cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={allCompleted ? "Download high-resolution PDF certificate" : "Complete all units to unlock download"}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Rendering High-DPI PDF...</span>
              </>
            ) : (
              <>
                {allCompleted ? <Download className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-slate-400" />}
                <span>Download Certificate (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Completion status notification */}
      {!allCompleted && (
        <div className="no-print bg-[#FFFBEB] border border-amber-300 rounded-2xl p-4 text-[#78350F] flex items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs sm:text-sm font-medium">
            <span className="font-bold">Provisional Preview: </span>
            You have completed {completedCount} of {requiredModules.length} core units. Finish all units to remove the provisional watermark and unlock official verified PDF downloads.
          </div>
        </div>
      )}

      {/* Responsive Scaling Wrapper: Guarantees preview is identical to final 1120x792 export */}
      <div 
        ref={containerWrapperRef} 
        className="w-full flex justify-center items-start overflow-hidden py-2 select-none"
      >
        <div 
          style={{
            width: '1120px',
            height: '792px',
            transform: `scale(${containerScale})`,
            transformOrigin: 'top center',
            marginBottom: `${(containerScale - 1) * 792}px`,
          }}
          className="transition-transform duration-100 ease-out"
        >
          {/* Main 1120x792 Certificate Card: Authentic Certificate Design with Official Logo and BeginFin Brand Aesthetic */}
          <div 
            ref={certificateRef}
            id="beginfin-certificate"
            className="w-[1120px] h-[792px] relative overflow-hidden flex flex-col justify-between p-10 certificate-print-card select-none"
            style={{
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              color: '#3C3C3C',
              fontFamily: "'Inter', sans-serif",
              border: '3px solid #7F7FFA',
              borderRadius: '14px',
            }}
          >
            {/* Subtle Glacial White Ambient Gradient Fill */}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{
                background: 'radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #FAFCFD 70%, #F4F8FA 100%)',
              }}
            />

            {/* Inset Hairline Certificate Border */}
            <div 
              className="absolute pointer-events-none"
              style={{
                inset: '12px',
                border: '1.5px solid #CBD5E1',
                borderRadius: '10px',
              }}
            />

            {/* Ornate Diploma Corner Accents (4 Corners) */}
            {/* Top-Left */}
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute top-3 left-3 pointer-events-none">
              <path d="M4 38V12C4 7.58172 7.58172 4 12 4H38" stroke="#7F7FFA" strokeWidth="2.5" />
              <path d="M10 38V16C10 12.6863 12.6863 10 16 10H38" stroke="#9B9BFF" strokeWidth="1" />
              <circle cx="7" cy="7" r="3" fill="#7F7FFA" />
            </svg>

            {/* Top-Right */}
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute top-3 right-3 pointer-events-none">
              <path d="M38 38V12C38 7.58172 34.4183 4 30 4H4" stroke="#7F7FFA" strokeWidth="2.5" />
              <path d="M32 38V16C32 12.6863 29.3137 10 26 10H4" stroke="#9B9BFF" strokeWidth="1" />
              <circle cx="35" cy="7" r="3" fill="#7F7FFA" />
            </svg>

            {/* Bottom-Left */}
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute bottom-3 left-3 pointer-events-none">
              <path d="M4 4V30C4 34.4183 7.58172 38 12 38H38" stroke="#7F7FFA" strokeWidth="2.5" />
              <path d="M10 4V26C10 29.3137 12.6863 32 16 32H38" stroke="#9B9BFF" strokeWidth="1" />
              <circle cx="7" cy="35" r="3" fill="#7F7FFA" />
            </svg>

            {/* Bottom-Right */}
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute bottom-3 right-3 pointer-events-none">
              <path d="M38 4V30C38 34.4183 34.4183 38 30 38H4" stroke="#7F7FFA" strokeWidth="2.5" />
              <path d="M32 4V26C32 29.3137 29.3137 32 26 32H4" stroke="#9B9BFF" strokeWidth="1" />
              <circle cx="35" cy="35" r="3" fill="#7F7FFA" />
            </svg>

            {/* Incomplete Provisional Watermark (if not finished) */}
            {!allCompleted && (
              <div 
                className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none select-none rounded-[14px]"
                style={{ backgroundColor: 'rgba(244, 248, 250, 0.7)', backdropFilter: 'blur(2px)' }}
                aria-hidden="true"
              >
                <div 
                  className="px-10 py-5 rounded-2xl text-center shadow-xl"
                  style={{
                    border: '2px solid #F59E0B',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div 
                    className="text-2xl font-black tracking-widest uppercase"
                    style={{ color: '#B45309' }}
                  >
                    PROVISIONAL PREVIEW
                  </div>
                  <div 
                    className="text-xs font-semibold tracking-wider uppercase mt-1.5"
                    style={{ color: '#92400E' }}
                  >
                    COMPLETE ALL UNITS TO UNLOCK OFFICIAL DOWNLOAD • {completedCount}/{requiredModules.length} UNITS
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Content - Structured with Authentic Diploma Typography & Balance */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center px-6 py-2">
              
              {/* Top Section: Official Logo, Subtitle & Title */}
              <div className="flex flex-col items-center">
                {/* Official BeginFin Logo */}
                <img 
                  src="/logo.png" 
                  alt="BeginFin Official Logo" 
                  className="w-16 h-16 object-contain mb-1.5"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />

                {/* Subtitle */}
                <div 
                  className="text-xs font-bold uppercase tracking-[0.3em]"
                  style={{ color: '#7F7FFA', fontFamily: "'Inter', sans-serif" }}
                >
                  BeginFin
                </div>

                {/* Title */}
                <h1 
                  className="font-diploma-title text-4xl font-black uppercase tracking-wider mt-1 mb-1.5"
                  style={{ color: '#3C3C3C', fontFamily: "'Cinzel', serif" }}
                >
                  Certificate of Completion
                </h1>

                {/* Delicate Ornamental Divider */}
                <div className="flex items-center justify-center gap-3 my-1">
                  <div style={{ width: '70px', height: '1.5px', backgroundColor: '#7F7FFA' }} />
                  <div style={{ width: '6px', height: '6px', transform: 'rotate(45deg)', backgroundColor: '#7F7FFA' }} />
                  <div style={{ width: '70px', height: '1.5px', backgroundColor: '#7F7FFA' }} />
                </div>
              </div>

              {/* Middle Section: Recipient & Blurb */}
              <div className="w-full flex flex-col items-center my-auto">
                <div 
                  className="text-[11px] font-bold uppercase tracking-[0.28em] mb-1.5"
                  style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}
                >
                  This is proudly presented to
                </div>

                {/* Recipient Full Name */}
                <div 
                  className="text-[44px] font-black tracking-tight leading-tight px-6 my-1"
                  style={{ color: '#3C3C3C', fontFamily: "'Inter', sans-serif" }}
                >
                  {userName || "BeginFin Scholar"}
                </div>

                {/* Elegant Iris Pulse Accent Underline */}
                <div 
                  style={{ 
                    width: '140px', 
                    height: '2.5px', 
                    backgroundColor: '#7F7FFA', 
                    borderRadius: '999px', 
                    margin: '6px auto 16px auto' 
                  }} 
                />

                {/* Required Blurb Text - Justified with balanced inter-word spacing and zero awkward gaps */}
                <p 
                  style={{
                    color: '#3C3C3C',
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    hyphens: 'none',
                    lineHeight: '1.85',
                    fontSize: '15.5px',
                    maxWidth: '820px',
                    margin: '0 auto',
                    padding: '0 20px',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  has successfully completed all modules in BeginFin, an open access financial literacy initiative with a curriculum that is vetted for alignment with the National Standards for Personal Finance Education developed by the Jump$tart Coalition and the Council for Economic Education.
                </p>
              </div>

              {/* Bottom Section: Dual Cursive Signatures & Official Verification Seal */}
              <div className="w-full max-w-[880px] flex items-end justify-between px-4 mt-4">
                {/* Vishnu Kakarla - Founder */}
                <div className="flex flex-col items-center text-center" style={{ width: '220px' }}>
                  <div 
                    className="font-diploma-script select-none" 
                    style={{ 
                      fontSize: '38px', 
                      color: '#3C3C3C', 
                      lineHeight: 1, 
                      height: '42px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    Vishnu Kakarla
                  </div>
                  <div style={{ width: '180px', height: '1.5px', backgroundColor: '#94A3B8', marginTop: '6px', marginBottom: '6px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#3C3C3C', fontFamily: "'Inter', sans-serif" }}>
                    Vishnu Kakarla
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7F7FFA', marginTop: '2px', fontFamily: "'Inter', sans-serif" }}>
                    Founder
                  </div>
                </div>

                {/* Center: Official Verification Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div 
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      border: '2.5px solid #7F7FFA',
                      padding: '3px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(127, 127, 250, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <div 
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '50%',
                        border: '1px dashed #7F7FFA',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F8FAFC',
                      }}
                    >
                      <ShieldCheck style={{ width: '24px', height: '24px', color: '#7F7FFA' }} />
                      <span 
                        style={{
                          fontSize: '7px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color: '#3C3C3C',
                          marginTop: '2px',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        BEGINFIN<br />VERIFIED
                      </span>
                    </div>
                  </div>
                  <span 
                    style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: '#7F7FFA',
                      marginTop: '6px',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Official Seal
                  </span>
                </div>

                {/* Kruz Smith - Co-Founder */}
                <div className="flex flex-col items-center text-center" style={{ width: '220px' }}>
                  <div 
                    className="font-diploma-script select-none" 
                    style={{ 
                      fontSize: '38px', 
                      color: '#3C3C3C', 
                      lineHeight: 1, 
                      height: '42px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    Kruz Smith
                  </div>
                  <div style={{ width: '180px', height: '1.5px', backgroundColor: '#94A3B8', marginTop: '6px', marginBottom: '6px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#3C3C3C', fontFamily: "'Inter', sans-serif" }}>
                    Kruz Smith
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7F7FFA', marginTop: '2px', fontFamily: "'Inter', sans-serif" }}>
                    Co-Founder
                  </div>
                </div>
              </div>

              {/* Bottom Credential Metadata Strip */}
              <div 
                className="w-full max-w-[960px] flex items-center justify-between pt-3 mt-3" 
                style={{ 
                  borderTop: '1px solid #E2E8F0',
                  fontSize: '10px',
                  color: '#64748B',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date Issued: </span>
                  <span style={{ fontWeight: 700, color: '#3C3C3C' }}>{issueDateString}</span>
                </div>
                <div style={{ fontWeight: 600, color: '#7F7FFA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  National Standards for Personal Finance Education
                </div>
                <div>
                  <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Credential ID: </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3C3C3C' }}>{credentialId}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Management Controls */}
      <div className="no-print flex flex-col items-center gap-3 mt-4">
        {allCompleted && (
          <div className="bg-[#F4F8FA] border border-[#7F7FFA]/30 rounded-2xl px-5 py-3 text-center max-w-lg mx-auto shadow-xs">
            <p className="text-xs md:text-sm font-semibold text-[#3C3C3C] flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#7F7FFA] shrink-0" />
              Your certificate has been issued and verified!
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-1">
          <button 
            onClick={() => setIsNameSet(false)}
            className="text-slate-500 hover:text-[#3C3C3C] hover:underline underline-offset-4 transition-all cursor-pointer py-1 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Edit Name on Certificate
          </button>
          {allCompleted && (
            <>
              <span className="text-slate-300">•</span>
              <button 
                onClick={requestDigitalCredential}
                className="text-[#7F7FFA] hover:text-[#6868EB] hover:underline underline-offset-4 transition-all flex items-center gap-1.5 cursor-pointer py-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Request Digital Badge (Certifier.io)
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="no-print py-8"></div>
    </div>
  );
};
