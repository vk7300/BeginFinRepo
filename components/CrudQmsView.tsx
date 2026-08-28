import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, 
  Settings, HelpCircle, Save, ToggleLeft, ToggleRight, X, Eye, EyeOff, Globe,
  Upload, FileText, Check, Loader2, ShieldCheck, Award, Clock, Mail, Copy, Search, Filter, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db, collection, doc, setDoc, deleteDoc, onSnapshot, query, where, auth, googleProvider, signInWithRedirect, signOut } from '../firebase';
import { modules } from '../data/courseData';
import { Language } from '../data/uiTranslations';

// Map of language codes to friendly names
const languageNames: Record<string, string> = {
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

export interface CertifierRequestItem {
  id: string;
  graduateName: string;
  email: string;
  serialNumber: string;
  consent: boolean;
  userId: string;
  requestedAt: string;
  status: 'pending' | 'fulfilled' | string;
}

interface Props {
  user: any; // User object from App.tsx
  onBack: () => void;
}

export const CrudQmsView: React.FC<Props> = ({ user, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Top-level tab state
  const [activeTab, setActiveTab] = useState<'qms' | 'certifier'>('qms');

  // Certifier.io requests state
  const [certifierRequests, setCertifierRequests] = useState<CertifierRequestItem[]>([]);
  const [requestFilterStatus, setRequestFilterStatus] = useState<'all' | 'pending' | 'fulfilled'>('all');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || 'm1');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<CustomQuestion> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Confirmation state
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Bulk selection & deletion state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bulk import state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkPastedText, setBulkPastedText] = useState('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkImportModuleId, setBulkImportModuleId] = useState<string>(selectedModuleId);
  const [bulkImportLanguage, setBulkImportLanguage] = useState<string>('en');
  const [bulkFirstRowHeader, setBulkFirstRowHeader] = useState(true);
  const [bulkPublishImmediately, setBulkPublishImmediately] = useState(false);
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState<{
    question: string;
    options: string[];
    correctIndex: number;
    isValid: boolean;
    error?: string;
  }[]>([]);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkImportTab, setBulkImportTab] = useState<'upload' | 'paste'>('upload');

  // Helper to parse the correct choice value
  const cleanCorrect = (correctVal: any, options: string[]): number => {
    if (correctVal === undefined || correctVal === null) return 0;
    const strVal = String(correctVal).trim().toLowerCase();
    
    // 1. Try to find an exact case-insensitive match in options
    const exactIdx = options.findIndex(opt => opt.trim().toLowerCase() === strVal);
    if (exactIdx !== -1) return exactIdx;
    
    // 2. Try to see if it's a number (1-based index)
    const numVal = parseInt(strVal, 10);
    if (!isNaN(numVal)) {
      if (numVal >= 1 && numVal <= options.length) {
        return numVal - 1;
      }
      if (numVal >= 0 && numVal < options.length) {
        return numVal;
      }
    }
    
    // 3. Try to see if it's a letter (A, B, C, D)
    if (strVal.length === 1) {
      const charCode = strVal.charCodeAt(0);
      if (charCode >= 97 && charCode <= 102) { // a-f
        const letterIdx = charCode - 97;
        if (letterIdx < options.length) return letterIdx;
      }
    }
    
    return 0; // Default fallback
  };

  // CSV parsing helper
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleParseRows = (rawRows: any[][]) => {
    if (!rawRows || rawRows.length === 0) {
      setParsedBulkQuestions([]);
      return;
    }

    let startIndex = 0;
    if (bulkFirstRowHeader) {
      startIndex = 1;
    } else {
      // Auto-detect header
      const firstCell = String(rawRows[0]?.[0] || '').trim().toLowerCase();
      if (firstCell.startsWith('question') || firstCell === 'q') {
        startIndex = 1;
      }
    }

    const resultList: any[] = [];
    for (let i = startIndex; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;
      
      const rowStr = row.map(cell => String(cell || '').trim()).join('');
      if (!rowStr) continue;

      const questionText = String(row[0] || '').trim();
      const options: string[] = [];
      
      // Look for up to 4 answer choices at indices 1, 2, 3, 4
      for (let j = 1; j <= 4; j++) {
        const opt = String(row[j] || '').trim();
        if (opt) {
          options.push(opt);
        }
      }

      const correctChoiceRaw = row[5];
      
      let isValid = true;
      let errorMsg = '';

      if (!questionText) {
        isValid = false;
        errorMsg = 'Missing question text.';
      } else if (options.length < 2) {
        isValid = false;
        errorMsg = 'At least 2 choices required.';
      }

      const correctIndex = isValid ? cleanCorrect(correctChoiceRaw, options) : 0;

      resultList.push({
        question: questionText,
        options,
        correctIndex,
        isValid,
        error: errorMsg
      });
    }

    setParsedBulkQuestions(resultList);
  };

  const handleParsePastedText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const rows: string[][] = [];
    
    for (const line of lines) {
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else {
        parts = parseCSVLine(line);
      }
      rows.push(parts);
    }
    handleParseRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBulkFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        handleParseRows(jsonRows);
      } catch (err: any) {
        console.error(err);
        showToast('error', 'Failed to parse Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const reparseFile = () => {
    if (!bulkFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        handleParseRows(jsonRows);
      } catch (err: any) {
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(bulkFile);
  };

  useEffect(() => {
    if (bulkPastedText) {
      handleParsePastedText(bulkPastedText);
    } else if (!bulkFile) {
      setParsedBulkQuestions([]);
    }
  }, [bulkPastedText, bulkFirstRowHeader]);

  useEffect(() => {
    if (bulkFile) {
      reparseFile();
    }
  }, [bulkFirstRowHeader]);

  const handleBulkSave = async () => {
    const validQuestions = parsedBulkQuestions.filter(q => q.isValid);
    if (validQuestions.length === 0) {
      showToast('error', 'No valid questions to import.');
      return;
    }

    setIsBulkSaving(true);
    try {
      let successCount = 0;
      let currentLiveCount = questions.filter(
        q => q.moduleId === bulkImportModuleId && q.isPublished
      ).length;

      for (const q of validQuestions) {
        const questionId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        let shouldPublish = false;
        if (bulkPublishImmediately && currentLiveCount < 4) {
          shouldPublish = true;
          currentLiveCount++;
        }

        const payload: CustomQuestion = {
          id: questionId,
          moduleId: bulkImportModuleId,
          language: bulkImportLanguage,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          isPublished: shouldPublish,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'questions', questionId), payload);
        successCount++;
      }

      showToast('success', `Successfully imported ${successCount} questions to ${bulkImportModuleId.toUpperCase()}!`);
      setIsBulkImportOpen(false);
      setParsedBulkQuestions([]);
      setBulkPastedText('');
      setBulkFile(null);
    } catch (err: any) {
      console.error("Bulk save error:", err);
      showToast('error', 'Failed to save imported questions: ' + err.message);
    } finally {
      setIsBulkSaving(false);
    }
  };

  // Authenticate status & role verification
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    let isMounted = true;
    setIsCheckingAdmin(true);

    // Helper to evaluate custom claims from ID token
    const checkClaims = async (): Promise<boolean> => {
      try {
        const tokenResult = await user.getIdTokenResult?.();
        if (tokenResult?.claims?.admin === true || tokenResult?.claims?.role === 'admin') {
          if (isMounted) {
            setIsAdmin(true);
            setIsCheckingAdmin(false);
          }
          return true;
        }
      } catch (err) {
        console.warn("Error verifying token claims:", err);
      }
      return false;
    };

    checkClaims();

    // Real-time listener for user profile role in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (!isMounted) return;
      if (snap.exists()) {
        const data = snap.data();
        if (data?.role === 'admin') {
          setIsAdmin(true);
          setIsCheckingAdmin(false);
          return;
        }
      }
      // If Firestore role is not admin, fallback to claims check
      checkClaims().then((hasAdminClaim) => {
        if (isMounted) {
          setIsAdmin(Boolean(hasAdminClaim));
          setIsCheckingAdmin(false);
        }
      });
    }, (err) => {
      console.warn("Error listening to user admin status:", err);
      checkClaims().then((hasAdminClaim) => {
        if (isMounted) {
          setIsAdmin(Boolean(hasAdminClaim));
          setIsCheckingAdmin(false);
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  // Handle Toast Auto-Dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Real-time listener for questions
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'questions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CustomQuestion[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as CustomQuestion);
      });
      // Sort questions: published first, then by updatedAt descending
      list.sort((a, b) => {
        if (a.isPublished !== b.isPublished) {
          return a.isPublished ? -1 : 1;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      });
      setQuestions(list);
    }, (error) => {
      console.error("Error fetching questions:", error);
      showToast('error', 'Failed to sync database updates in real-time.');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Real-time listener for certifier credential requests
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'certifierRequests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CertifierRequestItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          graduateName: data.graduateName || data.name || 'N/A',
          email: data.email || 'N/A',
          serialNumber: data.serialNumber || 'N/A',
          consent: data.consent !== undefined ? data.consent : true,
          userId: data.userId || 'N/A',
          requestedAt: data.requestedAt || new Date().toISOString(),
          status: data.status || 'pending'
        });
      });
      // Sort newest requests first
      list.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
      setCertifierRequests(list);
    }, (error) => {
      console.error("Error fetching certifier requests:", error);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Request management handlers
  const handleToggleRequestStatus = async (reqItem: CertifierRequestItem) => {
    setUpdatingRequestId(reqItem.id);
    const newStatus = reqItem.status === 'fulfilled' ? 'pending' : 'fulfilled';
    try {
      await setDoc(doc(db, 'certifierRequests', reqItem.id), {
        status: newStatus
      }, { merge: true });
      showToast('success', `Request marked as ${newStatus}.`);
    } catch (err: any) {
      console.error("Error updating request status:", err);
      showToast('error', 'Failed to update request status.');
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'certifierRequests', id));
      showToast('success', 'Credential request deleted.');
      setDeletingRequestId(null);
    } catch (err: any) {
      console.error("Error deleting request:", err);
      showToast('error', 'Failed to delete request.');
    }
  };

  const handleExportRequestsToExcel = () => {
    if (certifierRequests.length === 0) {
      showToast('error', 'No requests available to export.');
      return;
    }
    const exportData = certifierRequests.map((r, i) => ({
      'No.': i + 1,
      'Graduate Name': r.graduateName,
      'Email': r.email,
      'Certificate Serial #': r.serialNumber,
      'Status': r.status.toUpperCase(),
      'Consent Granted': r.consent ? 'YES' : 'NO',
      'User ID': r.userId,
      'Requested At': new Date(r.requestedAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Certifier Requests');
    XLSX.writeFile(workbook, `Certifier_Requests_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('success', 'Certifier requests exported to Excel!');
  };

  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    showToast('success', `Copied ${email} to clipboard!`);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Filtered requests
  const filteredCertifierRequests = useMemo(() => {
    return certifierRequests.filter((r) => {
      // Filter by status
      if (requestFilterStatus === 'pending' && r.status !== 'pending') return false;
      if (requestFilterStatus === 'fulfilled' && r.status !== 'fulfilled') return false;

      // Filter by search query
      if (requestSearchQuery.trim()) {
        const q = requestSearchQuery.toLowerCase().trim();
        const matchName = r.graduateName.toLowerCase().includes(q);
        const matchEmail = r.email.toLowerCase().includes(q);
        const matchSerial = r.serialNumber.toLowerCase().includes(q);
        return matchName || matchEmail || matchSerial;
      }
      return true;
    });
  }, [certifierRequests, requestFilterStatus, requestSearchQuery]);

  // Count published questions per module
  const publishedCountByModule = useMemo(() => {
    const counts: Record<string, number> = {};
    modules.forEach(m => {
      counts[m.id] = questions.filter(q => q.moduleId === m.id && q.isPublished).length;
    });
    return counts;
  }, [questions]);

  // Filtered questions for the selected view parameters
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => q.moduleId === selectedModuleId);
  }, [questions, selectedModuleId]);

  // Clear selections when active module changes
  useEffect(() => {
    setSelectedQuestionIds([]);
  }, [selectedModuleId]);

  const handleBulkDeleteQuestions = async () => {
    if (selectedQuestionIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      for (const id of selectedQuestionIds) {
        await deleteDoc(doc(db, 'questions', id));
      }
      showToast('success', `Successfully deleted ${selectedQuestionIds.length} custom questions.`);
      setSelectedQuestionIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (err: any) {
      console.error("Bulk delete error:", err);
      showToast('error', 'Failed to complete bulk deletion.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
      showToast('success', 'Logged in successfully!');
    } catch (err: any) {
      console.error("Login error:", err);
      showToast('error', err.message || 'Authentication failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('success', 'Logged out successfully.');
    } catch (err: any) {
      console.error("Logout error:", err);
      showToast('error', 'Logout failed.');
    }
  };

  const handleOpenCreate = () => {
    setEditingQuestion({
      id: `q_${Date.now()}`,
      moduleId: selectedModuleId,
      language: selectedLanguage,
      question: '',
      options: ['', ''],
      correctIndex: 0,
      isPublished: false
    });
    setFormError(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (q: CustomQuestion) => {
    setEditingQuestion({ ...q });
    setFormError(null);
    setIsEditing(true);
  };

  const handleOptionChange = (index: number, val: string) => {
    if (!editingQuestion || !editingQuestion.options) return;
    const nextOpts = [...editingQuestion.options];
    nextOpts[index] = val;
    setEditingQuestion({ ...editingQuestion, options: nextOpts });
  };

  const handleAddOption = () => {
    if (!editingQuestion || !editingQuestion.options) return;
    if (editingQuestion.options.length >= 6) {
      showToast('error', 'Maximum of 6 choices allowed per question.');
      return;
    }
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, '']
    });
  };

  const handleRemoveOption = (index: number) => {
    if (!editingQuestion || !editingQuestion.options) return;
    if (editingQuestion.options.length <= 2) {
      showToast('error', 'A question must have at least 2 choices.');
      return;
    }
    const nextOpts = editingQuestion.options.filter((_, i) => i !== index);
    let nextCorrect = editingQuestion.correctIndex || 0;
    if (nextCorrect >= nextOpts.length) {
      nextCorrect = nextOpts.length - 1;
    }
    setEditingQuestion({
      ...editingQuestion,
      options: nextOpts,
      correctIndex: nextCorrect
    });
  };

  const handleTogglePublishInline = async (q: CustomQuestion) => {
    const isNowPublishing = !q.isPublished;
    
    // Check module limit of 4 live questions
    if (isNowPublishing) {
      const activeLiveCount = questions.filter(item => item.moduleId === q.moduleId && item.isPublished).length;
      if (activeLiveCount >= 4) {
        showToast('error', `Cannot publish. Module has already reached the limit of 4 live questions.`);
        return;
      }
    }

    try {
      const updated: CustomQuestion = {
        ...q,
        isPublished: isNowPublishing,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'questions', q.id), updated);
      showToast('success', isNowPublishing ? 'Question is now live!' : 'Question retracted to drafts.');
    } catch (err: any) {
      console.error("Error toggling publish status:", err);
      showToast('error', 'Failed to update publication status.');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    // Validation
    if (!editingQuestion.question?.trim()) {
      setFormError('Question text/title is required.');
      return;
    }

    const validOpts = editingQuestion.options?.map(o => o.trim()).filter(Boolean) || [];
    if (validOpts.length < 2) {
      setFormError('At least 2 choices must be filled in.');
      return;
    }

    if (editingQuestion.correctIndex === undefined || editingQuestion.correctIndex < 0 || editingQuestion.correctIndex >= validOpts.length) {
      setFormError('Please select a valid correct answer choice.');
      return;
    }

    const moduleID = editingQuestion.moduleId || selectedModuleId;
    
    // Check live count limits if they are publishing
    if (editingQuestion.isPublished) {
      // Find how many other questions are published in this module (excluding current editing one)
      const otherLiveCount = questions.filter(
        q => q.moduleId === moduleID && q.isPublished && q.id !== editingQuestion.id
      ).length;

      if (otherLiveCount >= 4) {
        setFormError('Cannot publish. This module already has 4 live questions. Unpublish one first.');
        return;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const questionId = editingQuestion.id || `q_${Date.now()}`;
      const payload: CustomQuestion = {
        id: questionId,
        moduleId: moduleID,
        language: editingQuestion.language || selectedLanguage,
        question: editingQuestion.question.trim(),
        options: validOpts,
        correctIndex: editingQuestion.correctIndex,
        isPublished: !!editingQuestion.isPublished,
        createdAt: editingQuestion.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'questions', questionId), payload);
      showToast('success', 'Question saved successfully!');
      setIsEditing(false);
      setEditingQuestion(null);
    } catch (err: any) {
      console.error("Save question error:", err);
      setFormError(err.message || 'An error occurred while saving the question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
      showToast('success', 'Question deleted.');
      setDeletingQuestionId(null);
    } catch (err: any) {
      console.error("Delete question error:", err);
      showToast('error', 'Failed to delete the question.');
    }
  };

  // Render loading state while checking administrator authorization
  if (user && isCheckingAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl text-center space-y-4 animate-in fade-in duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-slate-600 text-sm font-medium">Verifying administrator permissions...</p>
      </div>
    );
  }

  // Render unauthorized state
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-2xl text-center space-y-6 animate-in fade-in duration-300" id="admin-unauth-card">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-normal text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            The question management system (QMS) is restricted to course administrators only.
          </p>
        </div>

        {user ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs text-slate-600 space-y-2">
            <p className="font-semibold">Logged in as:</p>
            <p className="font-mono bg-white p-1.5 rounded border text-slate-800 break-all">{user.email || user.uid}</p>
            <p className="text-rose-500 font-semibold flex items-center gap-1 mt-1">
              <XCircle className="w-3.5 h-3.5" /> This account does not have administrator privileges.
            </p>
          </div>
        ) : (
          <p className="text-slate-400 text-xs">You are currently not signed in.</p>
        )}

        <div className="space-y-3">
          {!user ? (
            <button 
              id="admin-signin-btn"
              onClick={handleGoogleSignIn}
              className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
            >
              <Globe className="w-4 h-4" /> Sign In with Google
            </button>
          ) : (
            <button 
              id="admin-switch-btn"
              onClick={handleSignOut}
              className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Switch Account / Sign Out
            </button>
          )}
          <button 
            id="admin-back-btn"
            onClick={onBack}
            className="w-full text-slate-500 hover:text-slate-700 font-semibold text-xs py-2 block transition-colors"
          >
            Return to Curriculum
          </button>
        </div>
      </div>
    );
  }

  // Active module detailed representation
  const activeModule = modules.find(m => m.id === selectedModuleId);
  const activeModuleTitle = activeModule?.translations[selectedLanguage as Language]?.title || activeModule?.translations.en.title || selectedModuleId;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 relative px-4 sm:px-6" id="qms-container">
      {/* Toast notifications */}
      {toast && (
        <div 
          id="qms-toast"
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-xl transition-all duration-300 animate-in slide-in-from-top-4 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Header Bento */}
      <div className="bg-gradient-to-br from-slate-950 via-[#0d1029] to-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button 
            id="qms-back-btn"
            onClick={onBack}
            className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95 text-white shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/30 flex items-center gap-1.5 shadow-sm w-fit mb-2">
              <ShieldCheck className="w-3 h-3" /> Admin Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-normal text-white tracking-tight flex items-center gap-3">
              <Settings className="w-6 h-6 text-indigo-400 animate-spin-slow" />
              Administrative Controls
            </h1>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-3 self-end md:self-auto flex-wrap justify-end">
          <button 
            id="qms-signout-btn"
            onClick={handleSignOut}
            className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all backdrop-blur-md"
          >
            Sign Out
          </button>
          <button 
            id="qms-bulk-btn"
            onClick={() => {
              setIsBulkImportOpen(true);
              setBulkImportModuleId(selectedModuleId);
              setBulkImportLanguage(selectedLanguage);
              setBulkPastedText('');
              setBulkFile(null);
              setParsedBulkQuestions([]);
            }}
            className="px-5 py-2.5 bg-white border border-transparent text-slate-900 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <Upload className="w-4 h-4 text-indigo-600 stroke-[2.5px]" /> Bulk Import
          </button>
          <button 
            id="qms-create-btn"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3px]" /> Create Question
          </button>
        </div>
      </div>

      {/* Top Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 bg-white/60 p-2 rounded-3xl border border-slate-200/80 backdrop-blur-xl shadow-lg w-fit" id="qms-top-nav-tabs">
        <button
          id="qms-tab-questions"
          onClick={() => setActiveTab('qms')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'qms'
              ? 'bg-white text-indigo-600 shadow-md border border-slate-200/80 scale-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 scale-95 opacity-80 hover:opacity-100 hover:scale-100'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'qms' ? 'text-indigo-500' : 'text-slate-400'}`} />
          <span>Question Manager (QMS)</span>
        </button>

        <button
          id="qms-tab-requests"
          onClick={() => setActiveTab('certifier')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all relative ${
            activeTab === 'certifier'
              ? 'bg-white text-indigo-600 shadow-md border border-slate-200/80 scale-100'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 scale-95 opacity-80 hover:opacity-100 hover:scale-100'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === 'certifier' ? 'text-indigo-500' : 'text-slate-400'}`} />
          <span>Credential Requests</span>
          {certifierRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse shadow-sm">
              {certifierRequests.filter(r => r.status === 'pending').length} Pending
            </span>
          )}
        </button>
      </div>

      {activeTab === 'qms' ? (
        /* Question Manager Layout */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8" id="qms-layout">
        {/* Module selection column */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Curriculum Units</h2>
          <div className="flex overflow-x-auto lg:flex-col gap-3 pb-2 lg:pb-0 scrollbar-none" id="qms-module-tabs">
            {modules.map((m) => {
              const count = publishedCountByModule[m.id] || 0;
              const isSelected = m.id === selectedModuleId;
              const mData = m.translations[selectedLanguage as Language] || m.translations.en;
              
              return (
                <button
                  key={m.id}
                  id={`tab-${m.id}`}
                  onClick={() => {
                    setSelectedModuleId(m.id);
                    if (isEditing && editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, moduleId: m.id });
                    }
                  }}
                  className={`shrink-0 lg:shrink flex flex-col items-start gap-1 p-4 rounded-[1.5rem] text-left transition-all relative overflow-hidden border ${
                    isSelected 
                      ? 'bg-white text-slate-900 border-indigo-200 shadow-xl' 
                      : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-full" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                    Module {m.id.replace('m', '')}
                  </span>
                  <span className={`font-semibold text-sm leading-snug line-clamp-2 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {mData.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${
                    count > 0 
                      ? isSelected ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {count} published
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Pane list */}
        <div className="space-y-6 lg:col-span-3">
          {/* Active Unit Description Banner */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/65 flex flex-col md:flex-row md:items-center justify-between gap-4" id="qms-active-unit-banner">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-indigo-100 inline-block">
                Active Selection
              </span>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {selectedModuleId.toUpperCase()}: {activeModuleTitle}
              </h3>
              <p className="text-slate-500 text-xs">
                Students will answer live questions published below instead of the default hardcoded quiz questions.
              </p>
            </div>
            
            {/* Limit Warning Widget */}
            <div className="shrink-0 flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Limit</p>
                <p className="text-base font-black text-slate-800">
                  {publishedCountByModule[selectedModuleId] || 0} / 4 Live
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                {(publishedCountByModule[selectedModuleId] || 0) * 25}%
              </div>
            </div>
          </div>

          {/* Table / List view of questions */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4" id="qms-empty-state">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">No custom questions in this unit</h4>
                <p className="text-slate-500 text-xs">
                  There are no custom questions created for this module yet. Students will continue to take the module's standard static quiz.
                </p>
              </div>
              <button 
                id="qms-empty-create-btn"
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 text-xs font-bold rounded-lg transition-all"
              >
                Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4" id="qms-questions-list">
              {/* Bulk Action / Selection Bar */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="bulk-select-all"
                    checked={filteredQuestions.length > 0 && selectedQuestionIds.length === filteredQuestions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuestionIds(filteredQuestions.map(q => q.id));
                      } else {
                        setSelectedQuestionIds([]);
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {selectedQuestionIds.length > 0 
                      ? `${selectedQuestionIds.length} of ${filteredQuestions.length} Selected` 
                      : `Select All Questions (${filteredQuestions.length})`}
                  </span>
                </label>

                {selectedQuestionIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm animate-in fade-in slide-in-from-right-2 duration-150"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Selected ({selectedQuestionIds.length})
                  </button>
                )}
              </div>

              {filteredQuestions.map((q) => {
                const isCorrectIndex = (idx: number) => q.correctIndex === idx;
                const isSelected = selectedQuestionIds.includes(q.id);
                
                return (
                  <div 
                    key={q.id}
                    id={`question-card-${q.id}`}
                    className={`bg-white rounded-2xl p-6 border transition-all ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/[0.01] ring-4 ring-indigo-100'
                        : q.isPublished 
                          ? 'border-emerald-200 hover:border-emerald-300 shadow-md shadow-emerald-500/[0.02]' 
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuestionIds(prev => [...prev, q.id]);
                            } else {
                              setSelectedQuestionIds(prev => prev.filter(id => id !== q.id));
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-[9px] rounded uppercase tracking-wider">
                          {q.id.slice(0, 8)}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[9px] rounded flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-slate-400" />
                          {languageNames[q.language] || q.language.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Publication slider toggle */}
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${q.isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {q.isPublished ? 'Live / Published' : 'Draft'}
                        </span>
                        <button
                          id={`publish-toggle-${q.id}`}
                          onClick={() => handleTogglePublishInline(q)}
                          className={`focus:outline-none transition-colors rounded-full ${q.isPublished ? 'text-emerald-500' : 'text-slate-300'}`}
                        >
                          {q.isPublished ? (
                            <ToggleRight className="w-10 h-10 stroke-[1.5]" />
                          ) : (
                            <ToggleLeft className="w-10 h-10 stroke-[1.5]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Question and Options list */}
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-800 text-sm leading-snug">
                        {q.question}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {q.options.map((option, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between gap-2 ${
                              isCorrectIndex(idx)
                                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                                : 'bg-slate-50/50 border-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="truncate">{option}</span>
                            {isCorrectIndex(idx) && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded tracking-widest shrink-0">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions and Footer */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                      <span className="text-[10px] font-medium text-slate-400">
                        Updated {new Date(q.updatedAt).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          id={`edit-btn-${q.id}`}
                          onClick={() => handleOpenEdit(q)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-btn-${q.id}`}
                          onClick={() => setDeletingQuestionId(q.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      ) : (
        /* Credential Requests Dashboard */
        <div className="space-y-6" id="certifier-requests-dashboard">
          {/* Summary Stats Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Requests</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{certifierRequests.length}</h3>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Pending Action</p>
                <h3 className="text-2xl font-black text-amber-900 mt-1">
                  {certifierRequests.filter(r => r.status === 'pending').length}
                </h3>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Fulfilled Credentials</p>
                <h3 className="text-2xl font-black text-emerald-900 mt-1">
                  {certifierRequests.filter(r => r.status === 'fulfilled').length}
                </h3>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search, Filter, and Export Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="certifier-search-input"
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                placeholder="Search by name, email, or serial #..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            {/* Filter Buttons & Export */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  id="filter-all-btn"
                  onClick={() => setRequestFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    requestFilterStatus === 'all'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({certifierRequests.length})
                </button>
                <button
                  id="filter-pending-btn"
                  onClick={() => setRequestFilterStatus('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    requestFilterStatus === 'pending'
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({certifierRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  id="filter-fulfilled-btn"
                  onClick={() => setRequestFilterStatus('fulfilled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    requestFilterStatus === 'fulfilled'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fulfilled ({certifierRequests.filter(r => r.status === 'fulfilled').length})
                </button>
              </div>

              <button
                id="export-requests-btn"
                onClick={handleExportRequestsToExcel}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          {/* Requests List Table */}
          {filteredCertifierRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Credential Requests Found</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                {requestSearchQuery || requestFilterStatus !== 'all'
                  ? 'Try clearing your search terms or changing your filter criteria.'
                  : 'When course graduates request digital credentials via Certifier.io on their Certificate page, they will show up here.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">Graduate Info</th>
                      <th className="p-4">Certificate Serial</th>
                      <th className="p-4">Consent</th>
                      <th className="p-4">Date Requested</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCertifierRequests.map((reqItem, index) => (
                      <tr key={reqItem.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 text-center font-mono font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="p-4 space-y-0.5">
                          <p className="font-bold text-slate-900 text-xs">{reqItem.graduateName}</p>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-[11px]">{reqItem.email}</span>
                            <button
                              onClick={() => handleCopyEmail(reqItem.id, reqItem.email)}
                              title="Copy email to clipboard"
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-indigo-600 text-xs">
                          {reqItem.serialNumber}
                        </td>
                        <td className="p-4">
                          {reqItem.consent ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Granted
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold text-[10px]">
                              Not Provided
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 text-xs font-medium">
                          {new Date(reqItem.requestedAt).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4 text-center">
                          {reqItem.status === 'fulfilled' ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Fulfilled
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-extrabold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`toggle-status-btn-${reqItem.id}`}
                              onClick={() => handleToggleRequestStatus(reqItem)}
                              disabled={updatingRequestId === reqItem.id}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                                reqItem.status === 'fulfilled'
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                              }`}
                            >
                              {updatingRequestId === reqItem.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : reqItem.status === 'fulfilled' ? (
                                'Mark Pending'
                              ) : (
                                'Mark Fulfilled'
                              )}
                            </button>
                            <button
                              id={`delete-request-btn-${reqItem.id}`}
                              onClick={() => setDeletingRequestId(reqItem.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Form Overlay / Modal for Editor */}
      {isEditing && editingQuestion && createPortal(
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto" id="qms-editor-modal">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-black text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  {editingQuestion.createdAt ? 'Edit Question' : 'Create Question'}
                </h3>
                <p className="text-slate-500 text-xs">
                  Configure question title, choices, translation, and live status.
                </p>
              </div>
              <button 
                id="editor-close-btn"
                onClick={() => { setIsEditing(false); setEditingQuestion(null); }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              {/* Module selection and language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Module</label>
                  <select
                    id="editor-moduleId-select"
                    value={editingQuestion.moduleId}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, moduleId: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                  >
                    {modules.map(m => {
                      const mTitle = m.translations[selectedLanguage as Language]?.title || m.translations.en.title;
                      return (
                        <option key={m.id} value={m.id}>
                          {m.id.toUpperCase()}: {mTitle}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Language Translation</label>
                  <select
                    id="editor-language-select"
                    value={editingQuestion.language}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, language: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                  >
                    {Object.entries(languageNames).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Question Title / Text</label>
                <textarea
                  id="editor-question-textarea"
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  placeholder="e.g. Which of the following is a primary feature of a High-Yield Savings Account?"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
                />
              </div>

              {/* Choices */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Answer Choices & Correct Selection
                  </label>
                  <button
                    type="button"
                    id="editor-add-option-btn"
                    onClick={handleAddOption}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {editingQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {/* Radio Selection for correct option */}
                      <label className="cursor-pointer shrink-0" title="Mark as correct answer">
                        <input
                          type="radio"
                          id={`editor-radio-opt-${idx}`}
                          name="correctOptionRadio"
                          checked={editingQuestion.correctIndex === idx}
                          onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: idx })}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          editingQuestion.correctIndex === idx 
                            ? 'border-indigo-600 bg-indigo-600 text-white' 
                            : 'border-slate-300 hover:border-slate-400 text-transparent'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      </label>

                      {/* Text Input for option text */}
                      <input
                        type="text"
                        id={`editor-input-opt-${idx}`}
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
                      />

                      {/* Delete option button */}
                      <button
                        type="button"
                        id={`editor-remove-opt-btn-${idx}`}
                        onClick={() => handleRemoveOption(idx)}
                        disabled={(editingQuestion.options?.length || 0) <= 2}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  * Select the circular button next to the choice to declare it as the correct answer.
                </p>
              </div>

              {/* Status & Options */}
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">Publish Immediately</h4>
                  <p className="text-[10px] text-slate-500 max-w-[350px]">
                    Checking this will make the question live in the active curriculum automatically (Max 4 per module allowed).
                  </p>
                </div>
                
                <button
                  type="button"
                  id="editor-publish-toggle"
                  onClick={() => setEditingQuestion({ ...editingQuestion, isPublished: !editingQuestion.isPublished })}
                  className={`focus:outline-none transition-colors rounded-full ${editingQuestion.isPublished ? 'text-indigo-600' : 'text-slate-300'}`}
                >
                  {editingQuestion.isPublished ? (
                    <ToggleRight className="w-10 h-10 stroke-[1.5]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 stroke-[1.5]" />
                  )}
                </button>
              </div>

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  id="editor-cancel-btn"
                  onClick={() => { setIsEditing(false); setEditingQuestion(null); }}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold text-xs transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  id="editor-submit-btn"
                  disabled={isSubmitting}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Question
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal for Delete */}
      {deletingQuestionId && createPortal(
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" id="qms-delete-modal">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-sm">Delete Question?</h4>
              <p className="text-slate-500 text-xs">
                Are you sure you want to permanently delete this question? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="delete-cancel-btn"
                onClick={() => setDeletingQuestionId(null)}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                id="delete-confirm-btn"
                onClick={() => deletingQuestionId && handleDeleteQuestion(deletingQuestionId)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/15"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal for Bulk Delete */}
      {showBulkDeleteConfirm && createPortal(
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" id="qms-bulk-delete-modal">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-sm">Bulk Delete Questions?</h4>
              <p className="text-slate-500 text-xs text-center">
                Are you sure you want to permanently delete the <span className="font-bold text-slate-800">{selectedQuestionIds.length}</span> selected custom questions? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="bulk-delete-cancel-btn"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-colors"
                disabled={isBulkDeleting}
              >
                Cancel
              </button>
              <button
                id="bulk-delete-confirm-btn"
                onClick={handleBulkDeleteQuestions}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/15 flex items-center justify-center gap-2"
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete All'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Question Importer Modal */}
      {isBulkImportOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto" id="qms-bulk-modal">
          <div className="bg-white rounded-3xl w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-black text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  Bulk Question Importer
                </h3>
                <p className="text-slate-500 text-xs font-semibold">
                  Upload a spreadsheet (.xlsx) or paste text containing multiple questions for quick management.
                </p>
              </div>
              <button 
                id="bulk-close-btn"
                onClick={() => { setIsBulkImportOpen(false); }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area: scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Import Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Destination Module / Unit</label>
                  <select
                    id="bulk-module-select"
                    value={bulkImportModuleId}
                    onChange={(e) => setBulkImportModuleId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                  >
                    {modules.map(m => {
                      const mTitle = m.translations[selectedLanguage as Language]?.title || m.translations.en.title;
                      return (
                        <option key={m.id} value={m.id}>
                          {m.id.toUpperCase()}: {mTitle}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Language Translation</label>
                  <select
                    id="bulk-language-select"
                    value={bulkImportLanguage}
                    onChange={(e) => setBulkImportLanguage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                  >
                    {Object.entries(languageNames).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="bulk-header-check"
                    checked={bulkFirstRowHeader}
                    onChange={(e) => setBulkFirstRowHeader(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">First row is header row</p>
                    <p className="text-[10px] text-slate-500">Skips column labels like "Question, Option A, ..."</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="bulk-publish-check"
                    checked={bulkPublishImmediately}
                    onChange={(e) => setBulkPublishImmediately(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Auto-publish immediately</p>
                    <p className="text-[10px] text-slate-500">Toggles questions live up to the limit of 4 per module.</p>
                  </div>
                </label>
              </div>

              {/* Tabs for XLSX vs Paste */}
              <div className="border-b border-slate-100">
                <nav className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkImportTab('upload');
                      setBulkPastedText('');
                      setParsedBulkQuestions([]);
                    }}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      bulkImportTab === 'upload'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Upload Excel Sheet (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkImportTab('paste');
                      setBulkFile(null);
                      setParsedBulkQuestions([]);
                    }}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      bulkImportTab === 'paste'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Paste Raw Data / TSV / CSV
                  </button>
                </nav>
              </div>

              {/* Tabs Content */}
              {bulkImportTab === 'upload' ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-3xl p-8 text-center transition-all bg-slate-50/20 relative group">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      id="bulk-file-input"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-500 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">
                          {bulkFile ? bulkFile.name : 'Drag & drop your Excel file here, or click to browse'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Supports standard .xlsx or .xls spreadsheets
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Excel Template Guidance */}
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] text-blue-700 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Spreadsheet Format Guidelines:
                    </p>
                    <p>
                      Ensure your sheet columns are arranged as: <span className="font-bold font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-blue-200">Question | Option 1 | Option 2 | Option 3 | Option 4 | Correct Answer Choice</span>
                    </p>
                    <p>
                      The <span className="italic font-bold">Correct Answer Choice</span> can be either the exact text of the correct choice, the letter (A, B, C, D) or index (1, 2, 3, 4).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Paste Questions</label>
                  <textarea
                    id="bulk-paste-textarea"
                    rows={6}
                    value={bulkPastedText}
                    onChange={(e) => setBulkPastedText(e.target.value)}
                    placeholder="Paste your lines here. Direct Excel Copy-Paste is supported!&#10;Format per line:&#10;What is 2+2?, 3, 4, 5, 6, 4&#10;What is a bond?, Debt, Equity, Real estate, Cash, Debt"
                    className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
                  />
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] text-blue-700 space-y-1">
                    <p className="font-bold">💡 Pro-Tip for pasting:</p>
                    <p>
                      You can select a block of cells in Excel or Google Sheets, copy them (Ctrl+C), and paste them directly above. The tabs and spacing will be handled automatically!
                    </p>
                  </div>
                </div>
              )}

              {/* Parsed Preview Section */}
              {parsedBulkQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Parsed Preview ({parsedBulkQuestions.length} Questions Found)
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      Please check the list below before completing the import
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3 w-12 text-center">No.</th>
                          <th className="p-3 w-20">Status</th>
                          <th className="p-3">Question Text</th>
                          <th className="p-3">Answer Choices (Correct in green)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedBulkQuestions.map((pq, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3">
                              {pq.isValid ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 font-bold text-[10px]">
                                  Valid
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-100 font-bold text-[10px] flex items-center gap-1 w-max" title={pq.error}>
                                  <AlertCircle className="w-3 h-3" /> Error
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-semibold text-slate-800 max-w-xs truncate" title={pq.question}>
                              {pq.question || <span className="text-rose-400 italic">No question text</span>}
                            </td>
                            <td className="p-3">
                              {pq.options.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {pq.options.map((opt, oIdx) => {
                                    const isCorrect = pq.correctIndex === oIdx;
                                    return (
                                      <span 
                                        key={oIdx} 
                                        className={`px-2 py-0.5 rounded text-[10px] ${
                                          isCorrect 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' 
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {opt}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No choices</span>
                              )}
                              {pq.error && <p className="text-[10px] text-rose-500 font-semibold mt-1">{pq.error}</p>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsBulkImportOpen(false)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleBulkSave}
                disabled={isBulkSaving || parsedBulkQuestions.filter(q => q.isValid).length === 0}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3px]" />
                    Import {parsedBulkQuestions.filter(q => q.isValid).length} Valid Questions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal for Delete Request */}
      {deletingRequestId && createPortal(
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" id="request-delete-modal">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-sm">Delete Credential Request?</h4>
              <p className="text-slate-500 text-xs">
                Are you sure you want to permanently delete this request record? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="delete-request-cancel-btn"
                onClick={() => setDeletingRequestId(null)}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                id="delete-request-confirm-btn"
                onClick={() => deletingRequestId && handleDeleteRequest(deletingRequestId)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/15"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
