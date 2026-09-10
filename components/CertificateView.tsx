import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Download, ArrowLeft, Award, CheckCircle, Send, Check, AlertCircle, ShieldCheck, Loader2, LogIn, Lock, AlertTriangle, Printer, RefreshCw, Sparkles, ExternalLink, FileText } from 'lucide-react';
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
  
  // Completion Letter container & scaling refs
  const letterRef = useRef<HTMLDivElement>(null);
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const [containerScale, setContainerScale] = useState<number>(1);

  const requiredModules = useMemo(() => modules.filter(m => !m.isOptional), []);
  const completedCount = useMemo(() => requiredModules.filter(m => completedIds.includes(m.id)).length, [requiredModules, completedIds]);
  const allCompleted = useMemo(() => completedCount >= requiredModules.length, [completedCount, requiredModules.length]);

  // Handle responsive scaling so preview matches the 816x1056 px (8.5x11 inch) portrait letter at all viewports
  useEffect(() => {
    const handleResize = () => {
      if (!containerWrapperRef.current) return;
      const availableWidth = containerWrapperRef.current.clientWidth;
      const targetWidth = 816; // Standard Letter width
      const calculatedScale = Math.min(1, Math.max(0.32, availableWidth / targetWidth));
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
      } catch {
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

  // Direct PDF download using html2canvas & jsPDF with high DPI portrait 8.5x11 rendering
  const handleDownloadPDF = async () => {
    if (!allCompleted) {
      setShowIncompleteNotice(true);
      return;
    }
    if (!letterRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const element = letterRef.current;
      if (!element) return;
      
      // Ensure fonts are ready before rendering
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Render canvas at 2x scale for crisp, publication-grade typography
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 816,
        ignoreElements: (el) => {
          return el.classList ? el.classList.contains('no-print') : false;
        },
        onclone: (clonedDoc) => {
          // 1. Sanitize all <style> tags to eliminate modern color spaces (oklch, oklab, color-mix) that break html2canvas
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent) {
              styleTag.textContent = styleTag.textContent
                .replace(/oklch\([^)]+\)/gi, '#7F7FFA')
                .replace(/oklab\([^)]+\)/gi, '#1E293B')
                .replace(/color-mix\([^)]+\)/gi, '#7F7FFA')
                .replace(/color\(display-p3[^)]+\)/gi, '#7F7FFA')
                .replace(/color\(srgb[^)]+\)/gi, '#7F7FFA');
            }
          });

          // 2. Fallback color converter using 2D canvas getImageData (guaranteed standard rgb/rgba)
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

          const targetNodes = Array.from(clonedDoc.querySelectorAll('*'));
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
      // US Letter portrait format (8.5 x 11 inches)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const safeGraduate = (userName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`BeginFin_Completion_Letter_${safeGraduate}.pdf`);
    } catch (err) {
      console.error('Error generating completion letter PDF:', err);
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

  // Formatted issue date: MM/DD/YYYY matching exact design
  const issueDateMMDDYYYY = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }, []);

  // Format name as LAST, FIRST NAME for Certificant Details line
  const formattedLastFirst = useMemo(() => {
    if (!userName || !userName.trim()) return 'LAST, FIRST NAME';
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].toUpperCase();
    const lastName = parts[parts.length - 1].toUpperCase();
    const firstNames = parts.slice(0, parts.length - 1).join(' ').toUpperCase();
    return `${lastName}, ${firstNames}`;
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
            <FileText className="w-9 h-9" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Required for Completion Letter</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Official institutional completion letters are awarded to registered BeginFin students upon fulfilling all curriculum requirements.
            </p>
          </div>

          <div className="bg-[#F4F8FA] border border-slate-200/80 rounded-2xl p-4 text-left space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Account Benefits:</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-800">Progress Sync:</strong> Current module milestones automatically sync to your permanent account.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-800">Verifiable Letter:</strong> Download print-ready high-resolution completion letters upon fulfilling all curriculum requirements.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-800">Certifier.io Infrastructure:</strong> Complements your completion letter with a tamper-proof digital badge verifiable on LinkedIn.</span>
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

  // Input view to set name on completion letter
  if (!isNameSet) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 no-print font-sans">
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F4F8FA] border border-[#7F7FFA]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7F7FFA]">
              <FileText className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Claim Your Completion Letter</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Enter your legal name as it should appear on your official BeginFin Completion Letter.
            </p>
          </div>
          
          <form onSubmit={handleSetName} className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">Full Name on Letter</label>
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
                <>Save &amp; Preview Completion Letter <Send className="w-4 h-4" /></>
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
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-700 hover:text-[#7F7FFA] font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
        
        <div className="flex flex-wrap items-center gap-2.5 relative">
          {showIncompleteNotice && (
            <div className="absolute -top-12 right-0 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Complete all {requiredModules.length} units to unlock download! ({completedCount}/{requiredModules.length} complete)
              <div className="absolute top-full right-8 border-8 border-transparent border-t-slate-900" />
            </div>
          )}

          {/* Complements Certifier.io Digital Badge Infrastructure */}
          <button 
            onClick={requestDigitalCredential}
            disabled={!allCompleted}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              allCompleted 
                ? 'bg-white text-slate-800 hover:bg-[#F4F8FA] border border-slate-200 cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title="Claim your digital verifiable badge via Certifier.io for LinkedIn"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 
            <span>Request Digital Badge (Certifier.io)</span>
          </button>

          <button 
            onClick={handlePrint}
            disabled={!allCompleted}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              allCompleted 
                ? 'bg-white text-slate-800 hover:bg-[#F4F8FA] border border-slate-200 cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title="Print completion letter"
          >
            <Printer className="w-4 h-4 text-slate-700" /> Print
          </button>

          {/* Primary In-App Action: High-DPI PDF Download */}
          <button 
            onClick={handleDownloadPDF}
            disabled={!allCompleted || isDownloading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              allCompleted 
                ? 'bg-[#7F7FFA] hover:bg-[#6868EB] text-white cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={allCompleted ? "Download high-resolution portrait PDF completion letter" : "Complete all units to unlock download"}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Rendering High-DPI PDF...</span>
              </>
            ) : (
              <>
                {allCompleted ? <Download className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-slate-400" />}
                <span>Download Letter (PDF)</span>
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

      {/* Responsive Scaling Wrapper: Centers and scales the 816x1056 px (8.5x11 in) portrait letter on any device */}
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
          className="transition-transform duration-100 ease-out shadow-2xl rounded-sm border border-slate-200"
        >
          {/* Main 816x1056 px Official Completion Letter Card: Exact design attached by user */}
          <div 
            ref={letterRef}
            id="beginfin-completion-letter"
            className="w-[816px] h-[1056px] relative overflow-hidden flex flex-col justify-between p-16 completion-letter-print-card select-none"
            style={{
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Incomplete Provisional Watermark (if not finished) */}
            {!allCompleted && (
              <div 
                className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none select-none"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(1.5px)' }}
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

            {/* Top Content Area */}
            <div>
              {/* Top Header: Stylized Dollar Sign Graphic + Initiative Title */}
              <div className="flex items-center gap-6">
                {/* Stylized Black Dollar Sign with Soft Iris / Lavender Drop Shadow */}
                <div className="relative w-12 h-16 flex items-center justify-center shrink-0">
                  {/* Lavender/Iris soft blurred glow behind dollar sign */}
                  <span 
                    className="absolute font-bold select-none"
                    style={{
                      fontSize: '62px',
                      lineHeight: 1,
                      color: '#7F7FFA',
                      opacity: 0.55,
                      filter: 'blur(5px)',
                      transform: 'translate(4px, 4px)',
                      fontFamily: "'Inter', sans-serif"
                    }}
                    aria-hidden="true"
                  >
                    $
                  </span>
                  {/* Sharp solid black dollar sign */}
                  <span 
                    className="relative font-bold text-black select-none"
                    style={{
                      fontSize: '62px',
                      lineHeight: 1,
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    $
                  </span>
                </div>

                {/* Header Text */}
                <div className="flex flex-col justify-center">
                  <h1 
                    className="text-[21px] font-bold text-black tracking-tight leading-snug"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Personal Finance Fundamentals Certification
                  </h1>
                  <p 
                    className="text-[16px] text-slate-800 leading-snug mt-0.5"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    BeginFin: An Open–Access Financial Literacy Initiative
                  </p>
                </div>
              </div>

              {/* Salutation */}
              <div 
                className="mt-12 text-[16px] text-black font-normal"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                To Whom It May Concern,
              </div>

              {/* Official Attestation Body Paragraph */}
              <p 
                className="mt-6 text-[15.5px] text-black leading-[1.68]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  textAlign: 'left'
                }}
              >
                This certificate officially attests that <span className="font-bold text-black">{userName ? userName.toUpperCase() : '[FIRST NAME LAST NAME]'}</span> has successfully completed the BeginFin Personal Finance Fundamentals certification. Aligned with the National Standards for Personal Finance Education established by the Jump$tart Coalition and the Council for Economic Education, this program demonstrates verified competency across eight mandatory modules: Introduction to Personal Finance Fundamentals, Job Finances and USA Taxes, Debt &amp; Credit Systems, Retirement Planning, Philanthropy, Budgeting, Investing, and Risk Management. Certification requires 100% mastery across all evaluated units.
              </p>

              {/* Certificant Details Section */}
              <div className="mt-10">
                <h3 
                  className="text-[17px] font-bold"
                  style={{ color: '#7F7FFA', fontFamily: "'Inter', sans-serif" }}
                >
                  Certificant Details
                </h3>

                {/* Details Row: Name and Issue Date */}
                <div 
                  className="mt-4 flex items-center justify-between text-[15.5px] text-black"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <div>
                    <span className="font-bold">Name: </span>
                    <span>{formattedLastFirst}</span>
                  </div>
                  <div className="pr-12">
                    <span className="font-bold">Issue Date: </span>
                    <span>{issueDateMMDDYYYY}</span>
                  </div>
                </div>
              </div>

              {/* Signatures Section: Vishnu Kakarla & Kruz Smith */}
              <div className="mt-14 flex items-start justify-between">
                {/* Column 1: Vishnu Kakarla */}
                <div className="flex flex-col">
                  {/* Cursive Signature */}
                  <div 
                    className="font-diploma-script select-none text-black"
                    style={{
                      fontSize: '34px',
                      height: '42px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'flex-end',
                      fontFamily: "'Dancing Script', 'Great Vibes', cursive",
                    }}
                  >
                    Vishnu Kakarla
                  </div>
                  {/* Horizontal solid line */}
                  <div 
                    className="w-[230px] h-[1.5px] bg-black mt-2 mb-2"
                  />
                  {/* Name in #7F7FFA */}
                  <div 
                    className="text-[16px] font-bold"
                    style={{ color: '#7F7FFA', fontFamily: "'Inter', sans-serif" }}
                  >
                    Vishnu Kakarla
                  </div>
                  {/* Title */}
                  <div 
                    className="text-[14px] text-black font-normal mt-0.5"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Founder, BeginFin
                  </div>
                </div>

                {/* Column 2: Kruz Smith */}
                <div className="flex flex-col pr-8">
                  {/* Cursive Signature */}
                  <div 
                    className="font-diploma-script select-none text-black"
                    style={{
                      fontSize: '34px',
                      height: '42px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'flex-end',
                      fontFamily: "'Dancing Script', 'Great Vibes', cursive",
                    }}
                  >
                    Kruz Smith
                  </div>
                  {/* Horizontal solid line */}
                  <div 
                    className="w-[230px] h-[1.5px] bg-black mt-2 mb-2"
                  />
                  {/* Name in #7F7FFA */}
                  <div 
                    className="text-[16px] font-bold"
                    style={{ color: '#7F7FFA', fontFamily: "'Inter', sans-serif" }}
                  >
                    Kruz Smith
                  </div>
                  {/* Title */}
                  <div 
                    className="text-[14px] text-black font-normal mt-0.5"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Co-Founder, BeginFin
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer: Page marker matching exact design */}
            <div 
              className="w-full text-center text-[13px] font-medium pt-8"
              style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}
            >
              BeginFin Personal Finance Fundamentals Certification | begin-fin.com | Page 1 of 1
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Management & Certifier.io Integration Card */}
      <div className="no-print flex flex-col items-center gap-4 mt-6">
        {allCompleted && (
          <div className="bg-white border border-emerald-200/90 rounded-2xl p-5 max-w-xl w-full shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Completion Letter Issued &amp; Verified</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your official BeginFin Completion Letter is ready for high-resolution PDF download. To complement this with a tamper-proof digital badge on Certifier.io for LinkedIn sharing, request your badge below.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={requestDigitalCredential}
                    className="text-xs font-bold text-[#7F7FFA] hover:text-[#6868EB] flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Request Digital Badge (Certifier.io) &rarr;
                  </button>
                  <button 
                    onClick={() => setIsNameSet(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Edit Name on Letter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500 pt-1">
          <button 
            onClick={() => setIsNameSet(false)}
            className="hover:text-slate-800 hover:underline underline-offset-4 transition-all cursor-pointer py-1 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Edit Name on Letter
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

// Export alias for seamless integration
export const CompletionLetterView = CertificateView;
export default CertificateView;
