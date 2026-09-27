import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, ArrowLeft, Award, CheckCircle, Send, Check, AlertCircle, ShieldCheck, Loader2, LogIn, Lock, AlertTriangle, RefreshCw, Linkedin, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { modules } from '../data/courseData';
import { Language } from '../data/uiTranslations';
import { db, doc, setDoc, auth, handleFirestoreError, OperationType } from '../firebase';
import { GuillocheBorder } from './GuillocheBorder';
import { GuillocheBackground } from './GuillocheBackground';

interface Props {
  userName: string;
  setUserName: (name: string) => void;
  completedIds: string[];
  onBack: () => void;
  language: Language;
  userId: string;
  onLogin?: () => void;
  onViewResources?: () => void;
}

export const CertificateView: React.FC<Props> = ({ 
  userName, 
  setUserName, 
  completedIds, 
  onBack, 
  userId, 
  onLogin,
  onViewResources
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
  
  // Certificate container & scaling (Portrait US Letter: 816px x 1056px)
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const [containerScale, setContainerScale] = useState<number>(1);

  const requiredModules = useMemo(() => modules.filter(m => !m.isOptional), []);
  const completedCount = useMemo(() => requiredModules.filter(m => completedIds.includes(m.id)).length, [requiredModules, completedIds]);
  const allCompleted = useMemo(() => completedCount >= requiredModules.length, [completedCount, requiredModules.length]);

  // Handle responsive scaling so portrait preview matches the 816x1056 px certificate cleanly
  useEffect(() => {
    const handleResize = () => {
      if (!containerWrapperRef.current) return;
      const availableWidth = containerWrapperRef.current.clientWidth;
      const targetWidth = 816;
      const calculatedScale = Math.min(1, Math.max(0.3, (availableWidth - 16) / targetWidth));
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

  // Direct PDF download using html2canvas & jsPDF with high DPI rendering and color sanitization
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

      // Ensure fonts are ready
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      // Render canvas at 2x scale for crisp, official-grade typography
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 816,
        windowHeight: 1056,
        ignoreElements: (el) => {
          return el.classList ? el.classList.contains('no-print') : false;
        },
        onclone: (clonedDoc) => {
          // 1. Sanitize all <style> tags to eliminate any modern color spaces (oklch, oklab, color-mix, etc.)
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent) {
              styleTag.textContent = styleTag.textContent
                .replace(/oklch\([^)]+\)/gi, '#4A6FA5')
                .replace(/oklab\([^)]+\)/gi, '#1E293B')
                .replace(/color-mix\([^)]+\)/gi, '#4A6FA5')
                .replace(/color\(display-p3[^)]+\)/gi, '#4A6FA5')
                .replace(/color\(srgb[^)]+\)/gi, '#4A6FA5');
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
                ctx.fillStyle = '#1E293B';
                ctx.fillStyle = colorStr;
                ctx.fillRect(0, 0, 1, 1);
                const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
              } catch {
                return '#1E293B';
              }
            }
            return '#1E293B';
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
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter' // 612 x 792 pt, matching 8.5 x 11 inch portrait
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const safeGraduate = (userName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`BeginFin_Certificate_${safeGraduate}.pdf`);
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareLinkedIn = () => {
    const shareUrl = "https://begin-fin.com";
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGoToResources = () => {
    if (onViewResources) {
      onViewResources();
    } else {
      window.location.href = '/resources';
    }
  };

  useEffect(() => {
    if (userName) {
      setIsNameSet(true);
    }
  }, [userName]);

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
    <div className="space-y-6 max-w-5xl mx-auto px-4 pb-20 relative font-sans">
      {/* Top Toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 pb-3">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-[#3C3C3C] hover:text-[#7F7FFA] font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
        
        <div className="flex flex-wrap items-center gap-3 relative">
          {showIncompleteNotice && (
            <div className="absolute -top-12 right-0 bg-[#3C3C3C] text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Complete all {requiredModules.length} units to unlock download! ({completedCount}/{requiredModules.length} complete)
              <div className="absolute top-full right-8 border-8 border-transparent border-t-[#3C3C3C]" />
            </div>
          )}

          {/* Only offer PDF download (Print option removed as requested) */}
          <button 
            onClick={handleDownloadPDF}
            disabled={!allCompleted || isDownloading}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              allCompleted 
                ? 'bg-[#7F7FFA] hover:bg-[#6868EB] text-white cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={allCompleted ? "Download official PDF certificate" : "Complete all units to unlock download"}
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

          {/* Request Credential button pointing to certifier request form */}
          <button
            onClick={requestDigitalCredential}
            disabled={!allCompleted}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              allCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={allCompleted ? "Request digital credential via Certifier request form" : "Complete all units to request credential"}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Request Credential</span>
          </button>

          {/* Share on LinkedIn button */}
          <button
            onClick={handleShareLinkedIn}
            disabled={!allCompleted}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              allCompleted
                ? 'bg-[#0A66C2] hover:bg-[#004182] text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={allCompleted ? "Share certificate achievement on LinkedIn" : "Complete all units to share"}
          >
            <Linkedin className="w-4 h-4" />
            <span>Share on LinkedIn</span>
          </button>
        </div>
      </div>

      {/* Congratulations Note / Modal */}
      <div className="no-print bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[#7F7FFA] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Congratulations!
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-0 sm:pl-10">
              Thank you for using BeginFin. You now have a strong base in Personal Finance Fundamentals. To keep going, visit the &quot;Resources&quot; tab to view BeginFin-curated personal finance resources. Don&apos;t forget to share BeginFin with your family and friends!
            </p>
          </div>
          <div className="shrink-0 pt-1 sm:pt-0 sm:self-center pl-0 sm:pl-2">
            <button
              onClick={handleGoToResources}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7F7FFA] hover:bg-[#6868EB] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to Resources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
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

      {/* Responsive Scaling Wrapper: Guarantees preview is identical to final 816x1056 px export */}
      <div 
        ref={containerWrapperRef} 
        className="w-full flex justify-center items-start overflow-hidden py-2 select-none"
      >
        <div 
          style={{
            width: '816px',
            height: '1056px',
            transform: `scale(${containerScale})`,
            transformOrigin: 'top center',
            marginBottom: `${(containerScale - 1) * 1056}px`,
          }}
          className="transition-transform duration-100 ease-out"
        >
          {/* Main 816x1056 Portrait Certificate Card: Exact replica of official BeginFin certificate design */}
          <div 
            ref={certificateRef}
            id="beginfin-certificate"
            className="w-[816px] h-[1056px] relative overflow-hidden flex flex-col justify-between select-none certificate-print-card shadow-lg"
            style={{
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
            }}
          >
            {/* Guilloche Security Border with Corner Rosettes (Faint Periwinkle) */}
            <GuillocheBorder width={816} height={1056} color="#8F9CEE" />

            {/* Faint Guilloche Background Watermark */}
            <GuillocheBackground width={816} height={1056} color="#8F9CEE" opacity={0.065} />

            {/* Incomplete Provisional Watermark (if not finished) */}
            {!allCompleted && (
              <div 
                className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none select-none"
                style={{ backgroundColor: 'rgba(244, 248, 250, 0.72)', backdropFilter: 'blur(2px)' }}
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

            {/* Certificate Content - Positioned inside the inner guilloche border with generous breathing room */}
            <div 
              className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center select-none"
              style={{
                padding: '62px 76px 74px 76px',
                boxSizing: 'border-box'
              }}
            >
              {/* Top Section: BeginFin Logo & Certificate Title */}
              <div className="w-full flex flex-col items-center">
                {/* Logo: Just "BeginFin" in Source Serif 4 (dollar sign removed) */}
                <div className="flex items-center justify-center mb-1">
                  <span 
                    style={{ 
                      fontSize: '44px', 
                      fontWeight: 600, 
                      fontFamily: "'Source Serif 4', Georgia, serif", 
                      color: '#0F172A', 
                      letterSpacing: '-0.01em', 
                      lineHeight: 1 
                    }}
                  >
                    BeginFin
                  </span>
                </div>

                {/* Title */}
                <h1 
                  style={{ 
                    fontSize: '25px', 
                    fontWeight: 600, 
                    fontFamily: "'Source Serif 4', Georgia, serif", 
                    letterSpacing: '0.12em', 
                    color: '#1E293B', 
                    textTransform: 'uppercase', 
                    marginTop: '26px', 
                    marginBottom: '30px' 
                  }}
                >
                  CERTIFICATE OF COMPLETION
                </h1>
              </div>

              {/* Middle Section: Recipient Calligraphy & Exact Body Text in Source Serif 4 */}
              <div className="w-full flex flex-col items-center my-auto">
                {/* Recipient Full Name in Source Serif 4 */}
                <div 
                  style={{ 
                    fontSize: '46px', 
                    fontFamily: "'Source Serif 4', Georgia, serif", 
                    fontStyle: 'italic', 
                    fontWeight: 600, 
                    color: '#1E293B', 
                    lineHeight: 1.2, 
                    marginBottom: '30px',
                    padding: '0 24px'
                  }}
                >
                  {userName || "VK"}
                </div>

                {/* Body Paragraph - Matches exact wording in Source Serif 4, brought inward and centered */}
                <p 
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.75', 
                    fontFamily: "'Source Serif 4', Georgia, serif", 
                    color: '#1E293B', 
                    maxWidth: '560px', 
                    margin: '0 auto', 
                    textAlign: 'center', 
                    fontWeight: 400 
                  }}
                >
                  has successfully completed a curriculum that is vetted for alignment with the National Standards for Personal Finance Education on the BeginFin platform at begin-fin.com. Through modules that require 100% mastery to continue, the recipient has received a strong base in several personal finance topics like Investing, Credit, and more.
                </p>
              </div>

              {/* Bottom Section: Dual Signatures & About BeginFin */}
              <div className="w-full flex flex-col items-center mt-auto">
                {/* Dual Signatures - Centered, Source Serif 4 */}
                <div className="w-full flex items-end justify-center gap-12 sm:gap-16 px-4 mb-7">
                  {/* Left: Vishnu Kakarla - Founder */}
                  <div className="flex flex-col items-center text-center" style={{ width: '240px' }}>
                    <div 
                      style={{ 
                        fontFamily: "'Source Serif 4', Georgia, serif", 
                        fontSize: '24px', 
                        fontStyle: 'italic', 
                        fontWeight: 600, 
                        color: '#1E293B', 
                        height: '36px', 
                        display: 'flex', 
                        alignItems: 'flex-end', 
                        justifyContent: 'center' 
                      }}
                    >
                      Vishnu Kakarla
                    </div>
                    <div style={{ width: '220px', height: '1px', backgroundColor: '#94A3B8', marginTop: '4px', marginBottom: '6px' }} />
                    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '14px', color: '#334155' }}>
                      Founder, Vishnu Kakarla
                    </div>
                  </div>

                  {/* Right: Kruz Smith - Co-Founder */}
                  <div className="flex flex-col items-center text-center" style={{ width: '240px' }}>
                    <div 
                      style={{ 
                        fontFamily: "'Source Serif 4', Georgia, serif", 
                        fontSize: '24px', 
                        fontStyle: 'italic', 
                        fontWeight: 600, 
                        color: '#1E293B', 
                        height: '36px', 
                        display: 'flex', 
                        alignItems: 'flex-end', 
                        justifyContent: 'center' 
                      }}
                    >
                      Kruz Smith
                    </div>
                    <div style={{ width: '220px', height: '1px', backgroundColor: '#94A3B8', marginTop: '4px', marginBottom: '6px' }} />
                    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '14px', color: '#334155' }}>
                      Co-Founder, Kruz Smith
                    </div>
                  </div>
                </div>

                {/* About BeginFin Section - Brought inward, centered */}
                <div className="w-full text-center flex flex-col items-center px-4">
                  <div 
                    style={{ 
                      fontFamily: "'Source Serif 4', Georgia, serif", 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: '#1E293B', 
                      marginBottom: '3px',
                      textAlign: 'center'
                    }}
                  >
                    About BeginFin
                  </div>
                  <p 
                    style={{ 
                      fontFamily: "'Source Serif 4', Georgia, serif", 
                      fontSize: '12.5px', 
                      lineHeight: '1.55', 
                      color: '#334155', 
                      maxWidth: '520px', 
                      margin: '0 auto',
                      textAlign: 'center'
                    }}
                  >
                    BeginFin is a student-built open access initiative that provides a free foundation in Personal Finance Fundamentals. For more about BeginFin, visit begin-fin.com/about.
                  </p>
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
