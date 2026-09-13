import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Activity, 
  BookOpen, 
  Award, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  RotateCcw, 
  Download, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Loader2, 
  ExternalLink, 
  Layers, 
  Globe, 
  RefreshCw, 
  Clock, 
  Lock, 
  LogOut, 
  ArrowLeft,
  ChevronRight,
  Database,
  Radio
} from 'lucide-react';
import { 
  db, 
  auth, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  googleProvider, 
  signInWithRedirect, 
  signOut,
  User 
} from '../firebase';
import { DEFAULT_ADMIN_EMAILS, isEmailAdmin, checkIsAdmin } from '../config/adminConfig';
import { modules } from '../data/courseData';
import { ServiceStatus, ServiceItem, CustomCategoryItem, SystemStatusData } from './StatusView';

// Supported curriculum languages
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  bn: 'Bengali (বাংলা)',
  uk: 'Ukrainian (Українська)',
  mr: 'Marathi (मराठी)',
  th: 'Thai (ไทย)',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  hi: 'Hindi (हिन्दी)',
  zh: 'Chinese (中文)',
  te: 'Telugu (తెలుగు)',
  de: 'German (Deutsch)',
  pt: 'Portuguese (Português)',
  tl: 'Tagalog (Filipino)',
  ar: 'Arabic (العربية)',
  vi: 'Vietnamese (Tiếng Việt)',
  ta: 'Tamil (தமிழ்)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)'
};

export interface CustomQuestion {
  id: string;
  moduleId: string;
  language: string;
  question: string;
  options: string[];
  correctIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_STATUS_DATA: SystemStatusData = {
  overall: 'Operational',
  lastUpdated: new Date().toISOString(),
  customMessageTitle: '',
  customMessage: '',
  customMessageType: 'info',
  showCustomMessage: false,
  services: {
    googleSso: {
      id: 'googleSso',
      name: 'Google SSO',
      category: 'Authentication',
      status: 'Operational',
      description: 'Google Identity Services (GIS), One Tap prompt, and OAuth 2.0 credential verification.'
    },
    emailPhoneAuth: {
      id: 'emailPhoneAuth',
      name: 'Email/Phone Sign-In',
      category: 'Authentication',
      status: 'Operational',
      description: 'Password login, email verification dispatch, password reset links, and SMS verification.'
    },
    modules: {
      id: 'modules',
      name: 'Modules & Simulation Engines',
      category: 'Curriculum & Engines',
      status: 'Operational',
      description: 'Interactive budgeting modules, Wage Simulator, AP topics, and client progress persistence.'
    },
    teacherFeatures: {
      id: 'teacherFeatures',
      name: 'Teacher Features',
      category: 'Classrooms & Analytics',
      status: 'Operational',
      description: 'Classroom creation, real-time alert notifications, CSV gradebook export, and Google Classroom sync.'
    },
    certificateDownload: {
      id: 'certificateDownload',
      name: 'Certificate Generation & Verification',
      category: 'Credentials & Verifications',
      status: 'Operational',
      description: 'PDF issuance, serial number verification, and graduate credential delivery.'
    }
  },
  customCategory: {
    name: 'Custom Service / Incident Notice',
    category: 'Auxiliary System',
    status: 'Operational',
    description: 'Managed incident communication or maintenance window notice.',
    enabled: false
  }
};

interface Props {
  user: User | null;
  onBack?: () => void;
}

export const BeginFinAdminView: React.FC<Props> = ({ user, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Admin verification state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return isEmailAdmin(user?.email || auth.currentUser?.email);
  });
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'status' | 'qms' | 'security'>('status');

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------
  // 1. ADMIN AUTHORIZATION VERIFICATION
  // -------------------------------------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      setIsVerifyingAdmin(true);
      const currentUser = auth.currentUser || user;
      
      if (!currentUser) {
        setIsAdmin(false);
        setIsVerifyingAdmin(false);
        return;
      }

      if (isEmailAdmin(currentUser.email)) {
        setIsAdmin(true);
        setIsVerifyingAdmin(false);
        return;
      }

      // Check token custom claims
      try {
        const tokenRes = await currentUser.getIdTokenResult(true);
        if (tokenRes?.claims?.admin === true || tokenRes?.claims?.role === 'admin') {
          setIsAdmin(true);
          setIsVerifyingAdmin(false);
          return;
        }
      } catch (err) {
        console.warn("Error checking admin claims:", err);
      }

      // Check Firestore doc
      try {
        const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists() && docSnap.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setIsVerifyingAdmin(false);
        }, () => {
          setIsAdmin(false);
          setIsVerifyingAdmin(false);
        });
        return () => unsub();
      } catch {
        setIsAdmin(false);
        setIsVerifyingAdmin(false);
      }
    };

    checkAuth();
  }, [user]);

  // -------------------------------------------------------------
  // 2. SYSTEM STATUS STATE & FIRESTORE SYNC
  // -------------------------------------------------------------
  const [statusData, setStatusData] = useState<SystemStatusData>(DEFAULT_STATUS_DATA);
  const [editStatusData, setEditStatusData] = useState<SystemStatusData>(DEFAULT_STATUS_DATA);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const statusDocRef = doc(db, 'system', 'status');
    const unsubscribe = onSnapshot(statusDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SystemStatusData>;
        const merged: SystemStatusData = {
          ...DEFAULT_STATUS_DATA,
          ...data,
          services: {
            ...DEFAULT_STATUS_DATA.services,
            ...(data.services || {})
          },
          customCategory: {
            ...DEFAULT_STATUS_DATA.customCategory!,
            ...(data.customCategory || {})
          }
        };
        setStatusData(merged);
        setEditStatusData(merged);
      }
    }, (err) => {
      console.warn("Status sync notice:", err);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleSaveStatus = async () => {
    setIsSavingStatus(true);
    try {
      const updatedPayload: SystemStatusData = {
        ...editStatusData,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(doc(db, 'system', 'status'), updatedPayload, { merge: true });
      showToast('success', 'System status and incident notices published successfully.');
    } catch (err: any) {
      console.error("Error saving status:", err);
      showToast('error', err?.message || 'Failed to update system status.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  // -------------------------------------------------------------
  // 3. CURRICULUM QMS STATE & SYNC
  // -------------------------------------------------------------
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || 'm1');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionFilterStatus, setQuestionFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  
  // Question Editor modal state
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<CustomQuestion> | null>(null);
  const [questionFormError, setQuestionFormError] = useState<string | null>(null);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  
  // Preview modal state
  const [previewQuestion, setPreviewQuestion] = useState<CustomQuestion | null>(null);

  // Bulk deletion state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || isVerifyingAdmin) return;
    const qCol = collection(db, 'questions');
    const q = query(
      qCol,
      where('moduleId', '==', selectedModuleId),
      where('language', '==', selectedLanguage)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: CustomQuestion[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          moduleId: data.moduleId || selectedModuleId,
          language: data.language || selectedLanguage,
          question: data.question || '',
          options: data.options || ['', '', '', ''],
          correctIndex: typeof data.correctIndex === 'number' ? data.correctIndex : 0,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });
      loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setQuestions(loaded);
      setSelectedQuestionIds([]);
    }, (err) => {
      console.warn("QMS Firestore sync notice:", err);
    });

    return () => unsubscribe();
  }, [isAdmin, isVerifyingAdmin, selectedModuleId, selectedLanguage]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (questionFilterStatus === 'published' && !q.isPublished) return false;
      if (questionFilterStatus === 'draft' && q.isPublished) return false;
      if (questionSearchQuery.trim()) {
        const queryLower = questionSearchQuery.toLowerCase();
        const matchesQuestion = q.question.toLowerCase().includes(queryLower);
        const matchesOptions = q.options.some((opt) => opt.toLowerCase().includes(queryLower));
        return matchesQuestion || matchesOptions;
      }
      return true;
    });
  }, [questions, questionFilterStatus, questionSearchQuery]);

  const handleOpenCreateQuestion = () => {
    setEditingQuestion({
      moduleId: selectedModuleId,
      language: selectedLanguage,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      isPublished: true
    });
    setQuestionFormError(null);
    setIsEditingQuestion(true);
  };

  const handleOpenEditQuestion = (q: CustomQuestion) => {
    setEditingQuestion({ ...q });
    setQuestionFormError(null);
    setIsEditingQuestion(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    if (!editingQuestion.question?.trim()) {
      setQuestionFormError('Question prompt cannot be empty.');
      return;
    }

    const opts = editingQuestion.options || [];
    if (opts.length < 2 || opts.some((o) => !o.trim())) {
      setQuestionFormError('All 4 question answer choices must be populated.');
      return;
    }

    setIsSubmittingQuestion(true);
    setQuestionFormError(null);

    try {
      const now = new Date().toISOString();
      const questionId = editingQuestion.id || doc(collection(db, 'questions')).id;

      const payload: CustomQuestion = {
        id: questionId,
        moduleId: editingQuestion.moduleId || selectedModuleId,
        language: editingQuestion.language || selectedLanguage,
        question: editingQuestion.question.trim(),
        options: opts.map((o) => o.trim()),
        correctIndex: Number(editingQuestion.correctIndex) || 0,
        isPublished: editingQuestion.isPublished !== undefined ? editingQuestion.isPublished : true,
        createdAt: editingQuestion.createdAt || now,
        updatedAt: now
      };

      await setDoc(doc(db, 'questions', questionId), payload);
      setIsEditingQuestion(false);
      setEditingQuestion(null);
      showToast('success', editingQuestion.id ? 'Question updated successfully.' : 'New question published to curriculum.');
    } catch (err: any) {
      console.error("Error saving question:", err);
      setQuestionFormError(err?.message || 'Failed to save question to Firestore.');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
      setDeletingQuestionId(null);
      showToast('success', 'Question deleted.');
    } catch (err: any) {
      console.error("Error deleting question:", err);
      showToast('error', 'Failed to delete question.');
    }
  };

  const handleTogglePublishQuestion = async (q: CustomQuestion) => {
    try {
      await setDoc(doc(db, 'questions', q.id), {
        isPublished: !q.isPublished,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast('success', `Question set to ${!q.isPublished ? 'Published' : 'Draft'}.`);
    } catch (err) {
      console.error("Error toggling question status:", err);
      showToast('error', 'Failed to update publication status.');
    }
  };

  const handleBulkDeleteQuestions = async () => {
    if (selectedQuestionIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(
        selectedQuestionIds.map((id) => deleteDoc(doc(db, 'questions', id)))
      );
      setSelectedQuestionIds([]);
      setShowBulkDeleteConfirm(false);
      showToast('success', `Deleted ${selectedQuestionIds.length} questions.`);
    } catch (err) {
      console.error("Error during bulk delete:", err);
      showToast('error', 'Bulk deletion encountered an error.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // -------------------------------------------------------------
  // 5. UNAUTHORIZED / VERIFYING STATE
  // -------------------------------------------------------------
  if (isVerifyingAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#7F7FFA] animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#7F7FFA]/10 border border-[#7F7FFA]/20 flex items-center justify-center mx-auto text-[#7F7FFA]">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7F7FFA]/10 text-[#7F7FFA] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Restricted Access</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            BeginFin Administrator Portal
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            This administration panel is restricted to authorized curriculum directors and platform administrators.
          </p>
        </div>

        {user ? (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Signed in as non-administrator:</span>
            </div>
            <p className="text-rose-700 font-mono break-all">{user.email}</p>
            <p className="text-slate-500 pt-1 border-t border-rose-200/60">
              Your Google or BeginFin account is not recognized in the platform admin whitelist.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 text-xs text-slate-600 text-left">
            Please sign in using an authorized administrator account to manage curriculum and system status.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!user ? (
            <button
              onClick={() => signInWithRedirect(auth, googleProvider)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In with Admin Google Account</span>
            </button>
          ) : (
            <button
              onClick={() => signOut(auth)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Switch Account</span>
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Platform</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6. AUTHORIZED ADMIN MAIN VIEW
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Feedback Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] max-w-md p-4 rounded-2xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-bottom duration-200 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-semibold leading-relaxed">
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admin Portal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="truncate max-w-[180px] font-mono text-[11px]">{user?.email || 'admin'}</span>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High-Level Operational Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1: System Health */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Health</span>
            <Activity className="w-4 h-4 text-[#7F7FFA]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              editStatusData.overall === 'Operational' ? 'bg-emerald-500' :
              editStatusData.overall === 'Issues Observed' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{editStatusData.overall}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">5 Core services monitored</span>
        </div>

        {/* Metric 2: Live QMS Questions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Module Qs</span>
            <BookOpen className="w-4 h-4 text-[#7F7FFA]" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{questions.length}</span>
            <span className="text-xs text-slate-500 ml-1">in {selectedModuleId.toUpperCase()} ({LANGUAGE_NAMES[selectedLanguage] || selectedLanguage})</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">{questions.filter(q => q.isPublished).length} published live</span>
        </div>

        {/* Metric 3: Admin Directory */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Designated Admins</span>
            <ShieldCheck className="w-4 h-4 text-[#7F7FFA]" />
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{DEFAULT_ADMIN_EMAILS.length}</span>
            <span className="text-xs text-slate-500 ml-1">accounts</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1">RBAC Enforced</span>
        </div>
      </div>

      {/* Navigation Control Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
            activeTab === 'status'
              ? 'border-[#7F7FFA] bg-[#7F7FFA]/5 shadow-xs'
              : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Section 1</span>
            {activeTab === 'status' && <CheckCircle2 className="w-4 h-4 text-[#7F7FFA] shrink-0" />}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">System Status & Notices</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Control live services, alerts, and public notices</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qms')}
          className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
            activeTab === 'qms'
              ? 'border-[#7F7FFA] bg-[#7F7FFA]/5 shadow-xs'
              : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Section 2</span>
            {activeTab === 'qms' && <CheckCircle2 className="w-4 h-4 text-[#7F7FFA] shrink-0" />}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Curriculum & QMS</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage quiz questions across 18 languages</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
            activeTab === 'security'
              ? 'border-[#7F7FFA] bg-[#7F7FFA]/5 shadow-xs'
              : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Section 3</span>
            {activeTab === 'security' && <CheckCircle2 className="w-4 h-4 text-[#7F7FFA] shrink-0" />}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Security & Diagnostics</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Admin whitelist, cache tools, and links</p>
          </div>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: SYSTEM STATUS & INCIDENT NOTICES                       */}
      {/* ============================================================= */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  System Health & Incident Notice Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update individual infrastructure components and publish global banner announcements.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/status"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public Page</span>
                </a>

                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={isSavingStatus}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingStatus ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingStatus ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>
            </div>

            {/* Overall Health Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overall System State
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Operational', 'Issues Observed', 'Not Operational'] as ServiceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatusData({ ...editStatusData, overall: st })}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                      editStatusData.overall === st
                        ? st === 'Operational'
                          ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900'
                          : st === 'Issues Observed'
                          ? 'border-amber-500 bg-amber-50/40 text-amber-900'
                          : 'border-rose-500 bg-rose-50/40 text-rose-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        st === 'Operational' ? 'bg-emerald-500' :
                        st === 'Issues Observed' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                      <span className="text-xs font-bold">{st}</span>
                    </div>
                    {editStatusData.overall === st && <Check className="w-4 h-4 text-slate-900" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Global Notice Banner Controls */}
            <div className="p-5 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#7F7FFA]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Platform Alert Banner (Visible Site-Wide)
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-600">Enable Banner</span>
                  <input
                    type="checkbox"
                    checked={editStatusData.showCustomMessage}
                    onChange={(e) => setEditStatusData({ ...editStatusData, showCustomMessage: e.target.checked })}
                    className="w-4 h-4 accent-[#7F7FFA] rounded cursor-pointer"
                  />
                </label>
              </div>

              {editStatusData.showCustomMessage && (
                <div className="space-y-4 pt-2 border-t border-slate-200/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Notice Style / Severity</label>
                      <select
                        value={editStatusData.customMessageType || 'info'}
                        onChange={(e) => setEditStatusData({ 
                          ...editStatusData, 
                          customMessageType: e.target.value as any 
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                      >
                        <option value="info">Info (Iris Pulse #7F7FFA)</option>
                        <option value="warning">Warning (Amber)</option>
                        <option value="alert">Critical Alert (Rose)</option>
                        <option value="success">Success (Emerald)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Notice Title / Label</label>
                      <input
                        type="text"
                        value={editStatusData.customMessageTitle || ''}
                        onChange={(e) => setEditStatusData({ ...editStatusData, customMessageTitle: e.target.value })}
                        placeholder="e.g., Scheduled Maintenance Notice"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Notice Message Details</label>
                    <textarea
                      rows={2}
                      value={editStatusData.customMessage || ''}
                      onChange={(e) => setEditStatusData({ ...editStatusData, customMessage: e.target.value })}
                      placeholder="e.g., We are updating our database infrastructure between 10 PM and 11 PM CST."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed"
                    />
                  </div>

                  {/* Live Preview of Banner */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Banner Preview</span>
                    <div className={`mt-1.5 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      editStatusData.customMessageType === 'warning' ? 'bg-amber-500 border-amber-600 text-slate-950 font-semibold' :
                      editStatusData.customMessageType === 'alert' ? 'bg-rose-600 border-rose-700 text-white font-semibold' :
                      editStatusData.customMessageType === 'success' ? 'bg-emerald-600 border-emerald-700 text-white font-semibold' :
                      'bg-[#7F7FFA] border-[#6868EB] text-white font-semibold'
                    }`}>
                      <div className="flex items-center gap-2 truncate">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-extrabold uppercase text-[11px] tracking-wide">
                          {editStatusData.customMessageTitle || 'Notice'}:
                        </span>
                        <span className="truncate opacity-95">
                          {editStatusData.customMessage || 'Announcement text preview'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider underline shrink-0">View Status</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Individual Core Services Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Individual Service Components
              </h4>

              <div className="space-y-3">
                {Object.entries(editStatusData.services).map(([key, service]) => (
                  <div key={key} className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">{service.name}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['Operational', 'Issues Observed', 'Not Operational'] as ServiceStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setEditStatusData({
                              ...editStatusData,
                              services: {
                                ...editStatusData.services,
                                [key]: { ...service, status: st }
                              }
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            service.status === st
                              ? st === 'Operational'
                                ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400'
                                : st === 'Issues Observed'
                                ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-400'
                                : 'bg-rose-100 text-rose-800 ring-1 ring-rose-400'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st === 'Operational' ? 'Active' : st === 'Issues Observed' ? 'Degraded' : 'Down'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Category / Auxiliary Service */}
            {editStatusData.customCategory && (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#7F7FFA]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Auxiliary Service / Custom Module Notice
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-slate-600">Show on Public Page</span>
                    <input
                      type="checkbox"
                      checked={editStatusData.customCategory.enabled}
                      onChange={(e) => setEditStatusData({
                        ...editStatusData,
                        customCategory: {
                          ...editStatusData.customCategory!,
                          enabled: e.target.checked
                        }
                      })}
                      className="w-4 h-4 accent-[#7F7FFA] rounded cursor-pointer"
                    />
                  </label>
                </div>

                {editStatusData.customCategory.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Service Name (e.g., Gemini AI Explanations)"
                      value={editStatusData.customCategory.name}
                      onChange={(e) => setEditStatusData({
                        ...editStatusData,
                        customCategory: {
                          ...editStatusData.customCategory!,
                          name: e.target.value
                        }
                      })}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g., Intelligence)"
                      value={editStatusData.customCategory.category}
                      onChange={(e) => setEditStatusData({
                        ...editStatusData,
                        customCategory: {
                          ...editStatusData.customCategory!,
                          category: e.target.value
                        }
                      })}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                    <select
                      value={editStatusData.customCategory.status}
                      onChange={(e) => setEditStatusData({
                        ...editStatusData,
                        customCategory: {
                          ...editStatusData.customCategory!,
                          status: e.target.value as ServiceStatus
                        }
                      })}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Issues Observed">Issues Observed</option>
                      <option value="Not Operational">Not Operational</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: CURRICULUM & QMS (QUIZ MANAGEMENT SYSTEM)               */}
      {/* ============================================================= */}
      {activeTab === 'qms' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Curriculum Quiz Management System (QMS)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create, translate, edit, and publish end-of-module assessment questions with real-time student sync.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCreateQuestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Filter & Selector Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Module Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Module / Topic</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  {modules.map((m, idx) => (
                    <option key={m.id} value={m.id}>
                      Unit {idx + 1}: {m.translations?.en?.title || m.id}
                    </option>
                  ))}
                  <option value="ap-unit1">AP Business & Personal Finance: Unit 1</option>
                </select>
              </div>

              {/* Language Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Curriculum Language</label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#7F7FFA] shrink-0" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Publish Status Filter */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Publication Filter</label>
                <select
                  value={questionFilterStatus}
                  onChange={(e) => setQuestionFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="all">All Statuses ({questions.length})</option>
                  <option value="published">Published Live ({questions.filter(q => q.isPublished).length})</option>
                  <option value="draft">Drafts ({questions.filter(q => !q.isPublished).length})</option>
                </select>
              </div>

              {/* Search Questions */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search Questions</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={questionSearchQuery}
                    onChange={(e) => setQuestionSearchQuery(e.target.value)}
                    placeholder="Search prompt or choices..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar (if any questions selected) */}
            {selectedQuestionIds.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#F4F8FA] border border-[#7F7FFA]/20 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {selectedQuestionIds.length} question{selectedQuestionIds.length > 1 ? 's' : ''} selected
                </span>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedQuestionIds.length})</span>
                </button>
              </div>
            )}

            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">
                  No custom questions created yet for this module and language.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateQuestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7F7FFA] text-white text-xs font-bold hover:bg-[#6868EB] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Question</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((q, idx) => {
                  const isSelected = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isSelected ? 'border-[#7F7FFA] bg-[#7F7FFA]/5' : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                              } else {
                                setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                              }
                            }}
                            className="w-4 h-4 accent-[#7F7FFA] rounded mt-1 cursor-pointer"
                          />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                q.isPublished 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {q.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {q.question}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewQuestion(q)}
                            title="Preview question in learner mode"
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePublishQuestion(q)}
                            title={q.isPublished ? 'Unpublish to draft' : 'Publish live'}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            {q.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(q)}
                            title="Edit question"
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingQuestionId(q.id)}
                            title="Delete question"
                            className="p-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 4 Choices Render */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctIndex;
                          return (
                            <div
                              key={oIdx}
                              className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
                                isCorrect 
                                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-semibold' 
                                  : 'bg-slate-50/50 border-slate-200/60 text-slate-700'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="truncate">{opt}</span>
                              {isCorrect && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: SECURITY & PLATFORM DIAGNOSTICS                         */}
      {/* ============================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Platform Security, Whitelist & Diagnostics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of designated administrator accounts, database connection settings, and system utilities.
              </p>
            </div>

            {/* Admin Whitelist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Designated Administrator Whitelist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEFAULT_ADMIN_EMAILS.map((adminEmail) => {
                  const isCurrent = user?.email?.toLowerCase().trim() === adminEmail.toLowerCase().trim();
                  return (
                    <div
                      key={adminEmail}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'border-[#7F7FFA] bg-[#7F7FFA]/5' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-7 h-7 rounded-full bg-[#7F7FFA]/10 text-[#7F7FFA] flex items-center justify-center font-bold text-xs shrink-0">
                          {adminEmail[0].toUpperCase()}
                        </div>
                        <span className="font-mono text-xs text-slate-800 truncate">{adminEmail}</span>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#7F7FFA] text-white text-[10px] font-bold shrink-0">
                          Current Session
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Environment & Database Diagnostics */}
            <div className="p-5 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#7F7FFA]" />
                <span>Connected Infrastructure Diagnostics</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Firestore Database ID</span>
                  <p className="font-mono text-xs text-slate-800 mt-0.5">ai-studio-815a8484-ccb3-4aa6-90b6-77fad11b53ba</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Firebase Transport</span>
                  <p className="font-mono text-xs text-slate-800 mt-0.5">experimentalForceLongPolling (Sandboxed)</p>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Platform Utilities & Quick Links
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('beginfin-progress');
                    showToast('success', 'Local student progress cache cleared.');
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-left transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500 mb-1" />
                  <h5 className="text-xs font-bold text-slate-900">Reset Local Storage Cache</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Flush client-side simulated student test state</p>
                </button>

                <a
                  href="/tools"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-left transition-colors"
                >
                  <Sliders className="w-4 h-4 text-[#7F7FFA] mb-1" />
                  <h5 className="text-xs font-bold text-slate-900">Living Costs & Wage Tool</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Open interactive salary simulation model</p>
                </a>

                <a
                  href="/mcp"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-left transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-500 mb-1" />
                  <h5 className="text-xs font-bold text-slate-900">MCP Protocol Hub</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Inspect Claude, Cursor, and AI tool endpoints</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE / EDIT QUESTION                                  */}
      {/* ============================================================= */}
      {isEditingQuestion && editingQuestion && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingQuestion.id ? 'Edit Curriculum Question' : 'Create New Curriculum Question'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unit {selectedModuleId.toUpperCase()} · Language: {LANGUAGE_NAMES[selectedLanguage]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingQuestion(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {questionFormError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{questionFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Question Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.question || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  placeholder="Enter the scenario-based or conceptual question prompt..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Answer Options (Select the correct choice)
                </label>
                {(editingQuestion.options || ['', '', '', '']).map((opt, idx) => {
                  const isCorrect = editingQuestion.correctIndex === idx;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion({ ...editingQuestion, correctIndex: idx })}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                          isCorrect 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to designate as the correct answer"
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...(editingQuestion.options || ['', '', '', ''])];
                          nextOpts[idx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: nextOpts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs ${
                          isCorrect ? 'border-emerald-500 bg-emerald-50/20 font-semibold' : 'border-slate-200'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingQuestion.isPublished !== false}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-[#7F7FFA] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">Publish immediately to live students</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingQuestion(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQuestion}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#7F7FFA] hover:bg-[#6868EB] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSubmittingQuestion ? 'Saving...' : 'Save Question'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: PREVIEW QUESTION                                       */}
      {/* ============================================================= */}
      {previewQuestion && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7F7FFA]">
                Student View Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {previewQuestion.question}
            </h4>

            <div className="space-y-2">
              {previewQuestion.options.map((opt, idx) => {
                const isCorrect = idx === previewQuestion.correctIndex;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                      isCorrect 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold' 
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                    {isCorrect && (
                      <span className="ml-auto text-[10px] uppercase font-bold text-emerald-700">Correct Answer</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CONFIRM SINGLE QUESTION DELETE                         */}
      {/* ============================================================= */}
      {deletingQuestionId && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Delete Curriculum Question?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This question will be permanently removed from this module's live student assessments.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuestionId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(deletingQuestionId)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CONFIRM BULK QUESTION DELETE                           */}
      {/* ============================================================= */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Delete {selectedQuestionIds.length} Selected Questions?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This bulk operation is irreversible and removes all selected questions from live module exams.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteQuestions}
                disabled={isBulkDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isBulkDeleting ? 'Deleting...' : `Confirm Delete (${selectedQuestionIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
