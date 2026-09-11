import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Download, 
  ArrowLeft, 
  Award, 
  CheckCircle, 
  Send, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  LogIn, 
  RefreshCw,
  Linkedin
} from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>('/logo.png');
  const hasSyncedRef = useRef(false);
  
  // Element references for capture
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const [containerScale, setContainerScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const docW = document.documentElement?.clientWidth || window.innerWidth || 1120;
    const availableW = Math.max(260, Math.min(1120, docW - 32));
    return Math.min(1, Math.max(0.25, availableW / 1120));
  });

  const requiredModules = useMemo(() => modules.filter(m => !m.isOptional), []);
  const completedCount = useMemo(() => requiredModules.filter(m => completedIds.includes(m.id)).length, [requiredModules, completedIds]);
  const allCompleted = useMemo(() => completedCount >= requiredModules.length, [completedCount, requiredModules.length]);

  // Pre-load logo as base64 to ensure 100% taint-free canvas rendering across all browsers
  useEffect(() => {
    let isMounted = true;
    const preloadLogo = async () => {
      try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted && typeof reader.result === 'string') {
            setLogoBase64(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        // Keep fallback relative URL
      }
    };
    preloadLogo();
    return () => { isMounted = false; };
  }, []);

  // Handle responsive scaling so preview fits mobile, iPad, and desktop viewports without layout overflow
  useEffect(() => {
    const handleResize = () => {
      const docW = document.documentElement?.clientWidth || window.innerWidth || 1120;
      const visualW = window.visualViewport?.width || docW;
      const trueWidth = Math.min(docW, visualW);
      const availableWidth = Math.max(260, Math.min(1120, trueWidth - 32));
      const calculatedScale = Math.min(1, Math.max(0.25, availableWidth / 1120));
      setContainerScale(calculatedScale);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Sync credential document when all modules completed and userName is set
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
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScSI5QWSR0q6TtTMC9SWeK00cle6_Jmz6zM3rTpAM8YMPG4Zw/viewform?usp=publish-editor", "_blank");
  };

  const issueDateString = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, []);

  const credentialId = useMemo(() => {
    const seed = userId || 'STUDENT';
    return `BF-${new Date().getFullYear()}-${seed.slice(0, 8).toUpperCase()}`;
  }, [userId]);

  // Helper for cross-platform PDF file saving on iOS Safari, iPadOS, Android, and Desktop
  const triggerPdfDownload = (pdf: jsPDF, filename: string) => {
    try {
      const isIOSOrIPad = typeof navigator !== 'undefined' && (
        /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      );

      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      if (isIOSOrIPad) {
        // iOS and iPad Safari ignore the <a download> attribute on blob URLs.
        // Opening the blob URL navigates or opens the native PDF viewer and save/share sheet.
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          window.location.href = blobUrl;
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      }

      // Android, Windows, macOS Desktop support <a download>
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 8000);
    } catch {
      pdf.save(filename);
    }
  };

  // Pure Vector PDF fallback for Certificate if html2canvas ever encounters an issue
  const generateVectorCertificatePDF = (learner: string, safeName: string) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    // Borders & Background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, width, height, 'F');
    pdf.setDrawColor(127, 127, 250);
    pdf.setLineWidth(1.5);
    pdf.rect(8, 8, width - 16, height - 16, 'S');
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.rect(12, 12, width - 24, height - 24, 'S');

    // Title
    pdf.setTextColor(127, 127, 250);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BEGINFIN', width / 2, 32, { align: 'center' });

    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(26);
    pdf.text('CERTIFICATE OF COMPLETION', width / 2, 45, { align: 'center' });

    // Divider
    pdf.setDrawColor(127, 127, 250);
    pdf.setLineWidth(0.8);
    pdf.line(width / 2 - 30, 50, width / 2 + 30, 50);

    // Presentation text
    pdf.setFontSize(11);
    pdf.setTextColor(100, 116, 139);
    pdf.text('THIS IS PROUDLY PRESENTED TO', width / 2, 65, { align: 'center' });

    // Learner Name
    pdf.setFontSize(30);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text(learner, width / 2, 85, { align: 'center' });

    // Body
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const bodyText = 'has successfully completed all modules in BeginFin, an open-access financial literacy initiative with a curriculum that is vetted for alignment with the National Standards for Personal Finance Education developed by the Jump$tart Coalition and the Council for Economic Education.';
    const splitBody = pdf.splitTextToSize(bodyText, 200);
    pdf.text(splitBody, width / 2, 105, { align: 'center' });

    // Signatures
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Vishnu Kakarla', 60, 150, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setTextColor(127, 127, 250);
    pdf.text('FOUNDER', 60, 156, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    pdf.text('Kruz Smith', width - 60, 150, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setTextColor(127, 127, 250);
    pdf.text('CO-FOUNDER', width - 60, 156, { align: 'center' });

    // Metadata
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Issued: ${issueDateString}`, 20, height - 16);
    pdf.text(`Credential ID: ${credentialId}`, width - 20, height - 16, { align: 'right' });

    triggerPdfDownload(pdf, `BeginFin_Certificate_${safeName}.pdf`);
  };

  // High-DPI export function for Certificate
  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadSuccessNotice(null);

    const safeLearner = (userName || 'Learner').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      // Certificate rasterization via unscaled off-screen capture
      const targetElement = certificateRef.current;
      if (!targetElement) {
        generateVectorCertificatePDF(userName || 'BeginFin Scholar', safeLearner);
        setDownloadSuccessNotice('Downloaded PDF Certificate');
        setIsDownloading(false);
        return;
      }

      // 1. Create an unscaled off-screen clone to guarantee pixel-perfect capture regardless of viewport size
      const clone = targetElement.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.position = 'fixed';
      clone.style.left = '-99999px';
      clone.style.top = '0';
      clone.style.margin = '0';
      clone.style.zIndex = '-1000';
      clone.style.width = '1120px';
      clone.style.height = '792px';
      clone.style.display = 'block';
      document.body.appendChild(clone);

      // 2. Render canvas at 2x scale for crisp typography
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#FFFFFF',
        width: 1120,
        height: 792,
        onclone: (clonedDoc) => {
          // Sanitize any modern CSS color strings (oklch, oklab, color-mix) in clone
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent) {
              styleTag.textContent = styleTag.textContent
                .replace(/oklch\([^)]+\)/gi, '#7F7FFA')
                .replace(/oklab\([^)]+\)/gi, '#3C3C3C')
                .replace(/color-mix\([^)]+\)/gi, '#7F7FFA');
            }
          });
        }
      });

      // Remove the off-screen clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const filename = `BeginFin_Certificate_${safeLearner}.pdf`;
      triggerPdfDownload(pdf, filename);
      setDownloadSuccessNotice('Downloaded PDF Certificate');
    } catch (err) {
      console.warn('PDF export notice, using pure vector generator:', err);
      generateVectorCertificatePDF(userName || 'BeginFin Scholar', safeLearner);
      setDownloadSuccessNotice('Downloaded PDF Certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddToLinkedIn = () => {
    const certName = 'BeginFin Financial Literacy Certificate';
    const orgName = 'BeginFin';
    const now = new Date();
    const issueYear = now.getFullYear();
    const issueMonth = now.getMonth() + 1;
    const certUrl = 'https://begin-fin.com';
    
    // Official LinkedIn direct Add Certification to Profile URL
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certName)}&organizationName=${encodeURIComponent(orgName)}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(credentialId)}`;
    
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    setDownloadSuccessNotice('Opened LinkedIn to add credential to profile');
  };

  const handlePrint = () => {
    window.print();
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
            <h2 className="text-2xl font-black text-[#3C3C3C] tracking-tight">Account Required</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Official certificates are awarded to registered BeginFin student accounts.
            </p>
          </div>

          <div className="bg-[#F4F8FA] border border-slate-200/80 rounded-2xl p-4 text-left space-y-3">
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#3C3C3C]">Progress Sync:</strong> Current module milestones automatically sync to your permanent account.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#3C3C3C]">Verifiable Credentials:</strong> Download print-ready certificates and add directly to LinkedIn.</span>
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
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#F4F8FA] border border-[#7F7FFA]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7F7FFA]">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#3C3C3C] tracking-tight">Name on Credential</h2>
            <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
              Enter your legal or preferred name as it should appear on your Certificate.
            </p>
          </div>
          
          <form onSubmit={handleSetName} className="space-y-4">
            <div>
              <input 
                id="full-name"
                autoFocus
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:border-[#7F7FFA] outline-none transition-all font-medium text-lg text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Save &amp; View Credential <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
          
          <button 
            onClick={onBack}
            className="w-full mt-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors cursor-pointer"
          >
            I'll do this later
          </button>
        </div>
      </div>
    );
  }

  // Target dimensions based on Certificate
  const targetDocWidth = 1120;
  const targetDocHeight = 792;
  const scaledWidth = Math.round(targetDocWidth * containerScale);
  const scaledHeight = Math.round(targetDocHeight * containerScale);

  return (
    <div className="space-y-5 w-full max-w-6xl mx-auto px-2 sm:px-4 pb-20 relative font-sans min-w-0 overflow-x-hidden">
      
      {/* Top Navigation */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-[#3C3C3C] hover:text-[#7F7FFA] font-bold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>

      {/* Action Download Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Learner:</span>
          <span className="text-xs font-bold text-[#7F7FFA] bg-[#F4F8FA] px-2.5 py-1 rounded-lg border border-[#7F7FFA]/20 truncate max-w-[200px]">
            {userName || 'BeginFin Scholar'}
          </span>
          <button
            onClick={() => setIsNameSet(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit name"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Replaced Print button with LinkedIn logo for adding to LinkedIn */}
          <button 
            onClick={handleAddToLinkedIn}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0A66C2] hover:bg-[#004182] text-white transition-all shadow-xs cursor-pointer min-h-[38px]"
            title="Add certificate directly to your LinkedIn profile"
          >
            <Linkedin className="w-4 h-4 fill-current" />
            <span>Add to LinkedIn</span>
          </button>

          {/* Replaced Certificate PDF with "Digital Credential" (request form) */}
          <button 
            onClick={requestDigitalCredential}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#7F7FFA] border border-[#7F7FFA]/40 transition-all shadow-xs cursor-pointer min-h-[38px]"
            title="Request official digital credential (request form)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#7F7FFA]" />
            <span>Digital Credential</span>
            <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">(request form)</span>
          </button>

          {/* Replaced Completion Letter button with "PDF Certificate" */}
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#7F7FFA] hover:bg-[#6868EB] text-white transition-all shadow-sm cursor-pointer min-h-[38px] disabled:opacity-50"
            title="Download official PDF Certificate"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>PDF Certificate</span>
          </button>
        </div>
      </div>

      {/* Feedback Notice */}
      {downloadSuccessNotice && (
        <div className="no-print p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessNotice}</span>
        </div>
      )}

      {/* Incomplete / Progress notification */}
      {!allCompleted && (
        <div className="no-print bg-[#FFFBEB] border border-amber-300 rounded-2xl p-3.5 text-[#78350F] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200/80 px-2 py-0.5 rounded-md">Provisional:</span>
            <span>{completedCount} of {requiredModules.length} core units completed. Full completion verifies the permanent digital credential.</span>
          </div>
        </div>
      )}

      {/* 
        Responsive Scaling Wrapper:
        - Parent calculates the exact scaledWidth and scaledHeight.
        - The inner element is positioned top-left and scaled with CSS transform.
        - Result: ZERO horizontal layout overflow on iPad and Mobile!
      */}
      <div 
        ref={containerWrapperRef} 
        className="w-full max-w-full min-w-0 overflow-hidden flex flex-col items-center justify-start py-2 select-none"
      >
        <div 
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            maxWidth: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="rounded-2xl shadow-md border border-slate-200/80 bg-white"
        >
          <div
            style={{
              width: `${targetDocWidth}px`,
              height: `${targetDocHeight}px`,
              transform: `scale(${containerScale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {/* 1. DIPLOMA CERTIFICATE VIEW (LANDSCAPE 1120x792) */}
            <div 
              ref={certificateRef}
                id="beginfin-certificate"
                className="w-[1120px] h-[792px] relative overflow-hidden flex flex-col justify-between p-10 select-none bg-white"
                style={{
                  boxSizing: 'border-box',
                  color: '#3C3C3C',
                  fontFamily: "'Inter', sans-serif",
                  border: '3px solid #7F7FFA',
                  borderRadius: '14px',
                }}
              >
                {/* Background Accent */}
                <div 
                  className="absolute inset-0 pointer-events-none" 
                  style={{
                    background: 'radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #FAFCFD 70%, #F4F8FA 100%)',
                  }}
                />

                {/* Inset Border */}
                <div 
                  className="absolute pointer-events-none"
                  style={{
                    inset: '12px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                  }}
                />

                {/* Ornate Diploma Corners */}
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute top-3 left-3 pointer-events-none">
                  <path d="M4 38V12C4 7.58172 7.58172 4 12 4H38" stroke="#7F7FFA" strokeWidth="2.5" />
                  <circle cx="7" cy="7" r="3" fill="#7F7FFA" />
                </svg>
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute top-3 right-3 pointer-events-none">
                  <path d="M38 38V12C38 7.58172 34.4183 4 30 4H4" stroke="#7F7FFA" strokeWidth="2.5" />
                  <circle cx="35" cy="7" r="3" fill="#7F7FFA" />
                </svg>
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute bottom-3 left-3 pointer-events-none">
                  <path d="M4 4V30C4 34.4183 7.58172 38 12 38H38" stroke="#7F7FFA" strokeWidth="2.5" />
                  <circle cx="7" cy="35" r="3" fill="#7F7FFA" />
                </svg>
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="absolute bottom-3 right-3 pointer-events-none">
                  <path d="M38 4V30C38 34.4183 34.4183 38 30 38H4" stroke="#7F7FFA" strokeWidth="2.5" />
                  <circle cx="35" cy="35" r="3" fill="#7F7FFA" />
                </svg>

                {/* Provisional Badge if incomplete */}
                {!allCompleted && (
                  <div 
                    className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none select-none rounded-[14px]"
                    style={{ backgroundColor: 'rgba(244, 248, 250, 0.65)' }}
                    aria-hidden="true"
                  >
                    <div 
                      className="px-8 py-4 rounded-2xl text-center shadow-lg"
                      style={{
                        border: '2px solid #F59E0B',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <div className="text-xl font-black tracking-widest uppercase" style={{ color: '#B45309' }}>
                        PROVISIONAL PREVIEW
                      </div>
                      <div className="text-xs font-bold tracking-wider uppercase mt-1" style={{ color: '#92400E' }}>
                        {completedCount}/{requiredModules.length} UNITS COMPLETED
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificate Content */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center px-6 py-2">
                  
                  {/* Top Header */}
                  <div className="flex flex-col items-center">
                    <img 
                      src={logoBase64} 
                      alt="BeginFin Logo" 
                      className="w-16 h-16 object-contain mb-1.5"
                    />
                    <div className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#7F7FFA' }}>
                      BeginFin
                    </div>
                    <h1 
                      className="font-diploma-title text-4xl font-black uppercase tracking-wider mt-1 mb-1.5"
                      style={{ color: '#3C3C3C', fontFamily: "'Cinzel', serif" }}
                    >
                      Certificate of Completion
                    </h1>
                    <div className="flex items-center justify-center gap-3 my-1">
                      <div style={{ width: '70px', height: '1.5px', backgroundColor: '#7F7FFA' }} />
                      <div style={{ width: '6px', height: '6px', transform: 'rotate(45deg)', backgroundColor: '#7F7FFA' }} />
                      <div style={{ width: '70px', height: '1.5px', backgroundColor: '#7F7FFA' }} />
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="w-full flex flex-col items-center my-auto">
                    <div className="text-[11px] font-bold uppercase tracking-[0.28em] mb-1.5" style={{ color: '#64748B' }}>
                      This is proudly presented to
                    </div>
                    <div className="text-[44px] font-black tracking-tight leading-tight px-6 my-1" style={{ color: '#3C3C3C' }}>
                      {userName || "BeginFin Scholar"}
                    </div>
                    <div 
                      style={{ 
                        width: '140px', 
                        height: '2.5px', 
                        backgroundColor: '#7F7FFA', 
                        borderRadius: '999px', 
                        margin: '6px auto 16px auto' 
                      }} 
                    />
                    <p 
                      style={{
                        color: '#3C3C3C',
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        lineHeight: '1.85',
                        fontSize: '15.5px',
                        maxWidth: '820px',
                        margin: '0 auto',
                        padding: '0 20px',
                      }}
                    >
                      has successfully completed all modules in BeginFin, an open access financial literacy initiative with a curriculum that is vetted for alignment with the National Standards for Personal Finance Education developed by the Jump$tart Coalition and the Council for Economic Education.
                    </p>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="w-full max-w-[880px] flex items-end justify-between px-4 mt-4">
                    {/* Founder */}
                    <div className="flex flex-col items-center text-center" style={{ width: '220px' }}>
                      <div 
                        className="font-diploma-script select-none" 
                        style={{ fontSize: '38px', color: '#3C3C3C', lineHeight: 1, height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                      >
                        Vishnu Kakarla
                      </div>
                      <div style={{ width: '180px', height: '1.5px', backgroundColor: '#94A3B8', marginTop: '6px', marginBottom: '6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#3C3C3C' }}>Vishnu Kakarla</div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7F7FFA', marginTop: '2px' }}>Founder</div>
                    </div>

                    {/* Seal */}
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
                            }}
                          >
                            BEGINFIN<br />VERIFIED
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#7F7FFA', marginTop: '6px' }}>Official Seal</span>
                    </div>

                    {/* Co-Founder */}
                    <div className="flex flex-col items-center text-center" style={{ width: '220px' }}>
                      <div 
                        className="font-diploma-script select-none" 
                        style={{ fontSize: '38px', color: '#3C3C3C', lineHeight: 1, height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                      >
                        Kruz Smith
                      </div>
                      <div style={{ width: '180px', height: '1.5px', backgroundColor: '#94A3B8', marginTop: '6px', marginBottom: '6px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#3C3C3C' }}>Kruz Smith</div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7F7FFA', marginTop: '2px' }}>Co-Founder</div>
                    </div>
                  </div>

                  {/* Metadata Strip */}
                  <div 
                    className="w-full max-w-[960px] flex items-center justify-between pt-3 mt-3" 
                    style={{ borderTop: '1px solid #E2E8F0', fontSize: '10px', color: '#64748B' }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>Date Issued: </span>
                      <span style={{ fontWeight: 700, color: '#3C3C3C' }}>{issueDateString}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#7F7FFA' }}>
                      National Standards for Personal Finance Education
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>Credential ID: </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3C3C3C' }}>{credentialId}</span>
                    </div>
                  </div>

                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Quick Access Badges & Bottom Links */}
      <div className="no-print flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-2">
        <button 
          onClick={requestDigitalCredential}
          className="text-[#7F7FFA] hover:text-[#6868EB] hover:underline underline-offset-4 transition-all flex items-center gap-1.5 cursor-pointer py-1"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Request Digital Credential (Certifier.io)
        </button>
      </div>
      
      <div className="no-print py-4"></div>
    </div>
  );
};
