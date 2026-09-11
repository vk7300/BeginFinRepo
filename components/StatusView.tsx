import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  KeyRound, 
  Mail, 
  BookOpen, 
  GraduationCap, 
  Award, 
  ExternalLink,
  MessageSquare,
  Sliders,
  Sparkles,
  Save, 
  X, 
  Layers,
  AlertCircle,
  ShieldCheck,
  Lock,
  Edit3,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, doc, onSnapshot, setDoc, auth, onAuthStateChanged, User } from '../firebase';
import { DEFAULT_ADMIN_EMAILS, isEmailAdmin, checkIsAdmin } from '../config/adminConfig';
import { useNavPadding } from './Navbar';
import { useNavigate } from 'react-router-dom';

export type ServiceStatus = 'Operational' | 'Issues Observed' | 'Not Operational';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  status: ServiceStatus;
  description: string;
}

export interface CustomCategoryItem {
  name: string;
  category: string;
  status: ServiceStatus;
  description: string;
  enabled: boolean;
}

export interface SystemStatusData {
  overall: ServiceStatus;
  lastUpdated: string;
  customMessageTitle?: string;
  customMessage?: string;
  customMessageType?: 'info' | 'warning' | 'alert' | 'success';
  showCustomMessage?: boolean;
  services: {
    googleSso: ServiceItem;
    emailPhoneAuth: ServiceItem;
    modules: ServiceItem;
    teacherFeatures: ServiceItem;
    certificateDownload: ServiceItem;
  };
  customCategory?: CustomCategoryItem;
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
      name: 'Modules',
      category: 'Curriculum & Engines',
      status: 'Operational',
      description: 'Interactive budgeting modules, tax roadmap, investment calculators, and lesson state persistence.'
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
      name: 'Certificate Download',
      category: 'Credentials',
      status: 'Operational',
      description: 'Verifiable PDF certificate rendering and Certifier.io credential delivery.'
    }
  },
  customCategory: {
    name: 'Custom Service / Notice',
    category: 'Custom Section',
    status: 'Operational',
    description: 'Custom platform announcement or additional service status managed by BeginFin administrators.',
    enabled: true
  }
};

interface StatusViewProps {
  user: User | null;
  onBackToApp: () => void;
  onOpenLogin?: () => void;
}

export const StatusView: React.FC<StatusViewProps> = ({ user, onBackToApp, onOpenLogin }) => {
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState<SystemStatusData>(DEFAULT_STATUS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<User | null>(user || auth.currentUser);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return isEmailAdmin(user?.email || auth.currentUser?.email);
  });
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync active user state with auth listeners
  useEffect(() => {
    if (user) {
      setActiveUser(user);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setActiveUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Admin form state
  const [editServices, setEditServices] = useState(DEFAULT_STATUS_DATA.services);
  const [editCustomCategory, setEditCustomCategory] = useState<CustomCategoryItem>(
    DEFAULT_STATUS_DATA.customCategory || {
      name: 'Custom Service / Notice',
      category: 'Custom Section',
      status: 'Operational',
      description: '',
      enabled: true
    }
  );
  const [editCustomTitle, setEditCustomTitle] = useState('');
  const [editCustomMessage, setEditCustomMessage] = useState('');
  const [editCustomType, setEditCustomType] = useState<'info' | 'warning' | 'alert' | 'success'>('info');
  const [editShowCustom, setEditShowCustom] = useState<boolean>(false);

  // Verify Admin Privileges
  useEffect(() => {
    if (!activeUser) {
      setIsAdmin(false);
      return;
    }

    if (isEmailAdmin(activeUser.email)) {
      setIsAdmin(true);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const tokenRes = await activeUser.getIdTokenResult?.(true);
        if (tokenRes?.claims?.admin === true || tokenRes?.claims?.role === 'admin') {
          setIsAdmin(true);
          return;
        }
      } catch (err) {
        console.warn("Token check error:", err);
      }

      // Check Firestore user doc
      try {
        const userRef = doc(db, 'users', activeUser.uid);
        const unsub = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.role === 'admin' || data?.isAdmin === true) {
              setIsAdmin(true);
            }
          }
        }, () => {});
        return () => unsub();
      } catch (e) {
        console.warn("Firestore admin check error:", e);
      }
    };

    checkAdminStatus();
  }, [activeUser]);

  // Realtime Firestore Listener for Status
  useEffect(() => {
    setIsLoading(true);
    const statusRef = doc(db, 'system', 'status');

    const unsubscribe = onSnapshot(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as Partial<SystemStatusData>;
        
        const merged: SystemStatusData = {
          overall: remoteData.overall || 'Operational',
          lastUpdated: remoteData.lastUpdated || new Date().toISOString(),
          customMessageTitle: remoteData.customMessageTitle || '',
          customMessage: remoteData.customMessage || '',
          customMessageType: remoteData.customMessageType || 'info',
          showCustomMessage: remoteData.showCustomMessage ?? false,
          services: {
            googleSso: { ...DEFAULT_STATUS_DATA.services.googleSso, ...(remoteData.services?.googleSso || {}) },
            emailPhoneAuth: { ...DEFAULT_STATUS_DATA.services.emailPhoneAuth, ...(remoteData.services?.emailPhoneAuth || {}) },
            modules: { ...DEFAULT_STATUS_DATA.services.modules, ...(remoteData.services?.modules || {}) },
            teacherFeatures: { ...DEFAULT_STATUS_DATA.services.teacherFeatures, ...(remoteData.services?.teacherFeatures || {}) },
            certificateDownload: { 
              ...DEFAULT_STATUS_DATA.services.certificateDownload, 
              ...(remoteData.services?.certificateDownload || {}),
              description: 'Verifiable PDF certificate rendering and Certifier.io credential delivery.'
            }
          },
          customCategory: {
            ...DEFAULT_STATUS_DATA.customCategory!,
            ...(remoteData.customCategory || {})
          }
        };

        // Automatically compute overall status if any service is down or degraded
        const allStatuses = [
          ...Object.values(merged.services).map(s => s.status),
          ...(merged.customCategory?.enabled ? [merged.customCategory.status] : [])
        ];

        if (allStatuses.includes('Not Operational')) {
          merged.overall = 'Not Operational';
        } else if (allStatuses.includes('Issues Observed')) {
          merged.overall = 'Issues Observed';
        } else {
          merged.overall = 'Operational';
        }

        setStatusData(merged);
      } else {
        setStatusData(DEFAULT_STATUS_DATA);
      }
      setIsLoading(false);
    }, (err) => {
      console.warn("Error listening to status doc:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Manual Refresh Handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setStatusData(prev => ({
            ...prev,
            ...json.data,
            services: {
              ...prev.services,
              ...(json.data.services || {})
            },
            customCategory: {
              ...(prev.customCategory || DEFAULT_STATUS_DATA.customCategory!),
              ...(json.data.customCategory || {})
            }
          }));
        }
      }
    } catch (e) {
      console.warn("Manual refresh failed:", e);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 400);
    }
  };

  // Navigate to Unified Admin Portal
  const handleOpenAdminModal = () => {
    navigate('/beginfin-admins');
  };

  // Save Admin Changes to Firestore
  const handleSaveStatus = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const allStatuses = [
        ...Object.values(editServices).map(s => s.status),
        ...(editCustomCategory.enabled ? [editCustomCategory.status] : [])
      ];

      let calculatedOverall: ServiceStatus = 'Operational';
      if (allStatuses.includes('Not Operational')) {
        calculatedOverall = 'Not Operational';
      } else if (allStatuses.includes('Issues Observed')) {
        calculatedOverall = 'Issues Observed';
      }

      const payload: Partial<SystemStatusData> = {
        overall: calculatedOverall,
        lastUpdated: new Date().toISOString(),
        customMessageTitle: editCustomTitle.trim(),
        customMessage: editCustomMessage.trim(),
        customMessageType: editCustomType,
        showCustomMessage: editShowCustom && !!editCustomMessage.trim(),
        services: editServices,
        customCategory: editCustomCategory
      };

      try {
        const statusDocRef = doc(db, 'system', 'status');
        await setDoc(statusDocRef, payload, { merge: true });
      } catch (firestoreErr) {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/status/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to update system status.');
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setShowAdminModal(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (err: any) {
      console.error("Save status error:", err);
      setSaveError(err?.message || 'Failed to save updates.');
    } finally {
      setIsSaving(false);
    }
  };

  const overallMeta = useMemo(() => {
    switch (statusData.overall) {
      case 'Operational':
        return {
          title: 'All Systems Operational',
          badgeText: 'Operational',
          bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
          borderColor: 'border-emerald-500/30',
          dotColor: 'bg-emerald-500',
          icon: CheckCircle2
        };
      case 'Issues Observed':
        return {
          title: 'Issues Observed',
          badgeText: 'Issues Observed',
          bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
          borderColor: 'border-amber-500/30',
          dotColor: 'bg-amber-500',
          icon: AlertTriangle
        };
      case 'Not Operational':
        return {
          title: 'Service Disruption',
          badgeText: 'Not Operational',
          bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
          borderColor: 'border-rose-500/30',
          dotColor: 'bg-rose-500',
          icon: XCircle
        };
    }
  }, [statusData.overall]);

  const getServiceStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        );
      case 'Issues Observed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Issues Observed
          </span>
        );
      case 'Not Operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Not Operational
          </span>
        );
    }
  };

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'googleSso':
        return <KeyRound className="w-5 h-5 text-[#7F7FFA]" />;
      case 'emailPhoneAuth':
        return <Mail className="w-5 h-5 text-[#7F7FFA]" />;
      case 'modules':
        return <BookOpen className="w-5 h-5 text-[#7F7FFA]" />;
      case 'teacherFeatures':
        return <GraduationCap className="w-5 h-5 text-[#7F7FFA]" />;
      case 'certificateDownload':
        return <Award className="w-5 h-5 text-[#7F7FFA]" />;
      default:
        return <Layers className="w-5 h-5 text-[#7F7FFA]" />;
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return isoString;
    }
  };

  const navPadding = useNavPadding();

  return (
    <div className={`min-h-screen bg-[#F4F8FA] text-[#3C3C3C] selection:bg-[#7F7FFA]/20 pb-20 ${navPadding}`}>
      {/* Top Status Sub-Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#7F7FFA]/10 text-[#7F7FFA] font-extrabold uppercase tracking-wider">
            Live System Health
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#7F7FFA]' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          {/* Admin Controls Trigger (when authenticated as Admin) */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAdminModal}
                id="admin-status-controls-btn"
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#7F7FFA] text-white text-xs font-bold hover:bg-[#7F7FFA]/90 shadow-md shadow-[#7F7FFA]/20 transition-all active:scale-95 cursor-pointer ring-2 ring-[#7F7FFA]/30"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Controls</span>
              </button>
            </div>
          ) : activeUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200 truncate max-w-[150px]">
                <UserIcon className="w-3 h-3 text-slate-400" />
                <span className="truncate">{activeUser.email || 'User'}</span>
              </span>
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/80 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Login</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenLogin) {
                  onOpenLogin();
                } else {
                  onBackToApp();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#7F7FFA]" />
              <span>Admin Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Floating Banner (if Admin) */}
      {isAdmin && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-2 mb-4">
          <div className="bg-gradient-to-r from-[#7F7FFA] to-indigo-600 text-white px-4 py-2.5 rounded-2xl text-xs font-medium border border-[#7F7FFA]/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/20 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Mode
              </span>
              <span>
                Signed in as <strong className="underline">{activeUser?.email}</strong>. You have authorization to manage live service health & notices in the unified Admin Portal.
              </span>
            </div>
            <button
              onClick={handleOpenAdminModal}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" /> Admin Portal &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        
        {/* Bento Card 1: Platform Health Hero Banner */}
        <section className={`relative overflow-hidden rounded-3xl bg-white border ${overallMeta.borderColor} p-6 sm:p-8 shadow-2xs transition-all`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${overallMeta.bgGradient} pointer-events-none`} />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/80 border border-slate-200/80 shadow-2xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${overallMeta.dotColor} animate-pulse`} />
                  {overallMeta.badgeText}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3C3C3C]">
                {overallMeta.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400 font-medium">
                Updated: {formatDateTime(statusData.lastUpdated)}
              </div>
              {isAdmin && (
                <button
                  onClick={handleOpenAdminModal}
                  className="px-3 py-1.5 bg-[#7F7FFA]/10 hover:bg-[#7F7FFA]/20 text-[#7F7FFA] text-xs font-bold rounded-xl border border-[#7F7FFA]/30 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit System</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Bento Card 2: Custom Broadcast Announcement / Notice (if enabled) */}
        {statusData.showCustomMessage && statusData.customMessage && (
          <section className="rounded-3xl bg-white border border-[#7F7FFA]/30 p-6 sm:p-7 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#7F7FFA]" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-2xl bg-[#7F7FFA]/10 text-[#7F7FFA] shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                {statusData.customMessageTitle && (
                  <h3 className="text-base font-bold text-[#3C3C3C] tracking-tight">
                    {statusData.customMessageTitle}
                  </h3>
                )}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {statusData.customMessage}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={handleOpenAdminModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-[#7F7FFA] hover:bg-[#7F7FFA]/10 transition-colors"
                  title="Edit notice"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>
        )}

        {/* Bento Grid 3: Core Service Categories Breakdown */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-[#3C3C3C] tracking-tight">
              View by Section
            </h2>
            {isAdmin && (
              <button
                onClick={handleOpenAdminModal}
                className="text-xs font-bold text-[#7F7FFA] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit All Sections</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statusData.services).map(([key, service]) => (
              <div 
                key={key} 
                className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-[#7F7FFA]/40 transition-all shadow-2xs flex flex-col justify-between group ${isAdmin ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={isAdmin ? handleOpenAdminModal : undefined}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#F4F8FA] border border-slate-100 group-hover:bg-[#7F7FFA]/10 transition-colors">
                        {getCategoryIcon(key)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#3C3C3C] tracking-tight">
                          {service.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getServiceStatusBadge(service.status)}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAdminModal();
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-[#7F7FFA] hover:bg-[#7F7FFA]/10 transition-colors"
                          title={`Edit ${service.name} status`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Custom Category / Section Card (Admin Configurable) */}
            {statusData.customCategory && statusData.customCategory.enabled && (
              <div 
                className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-[#7F7FFA]/40 transition-all shadow-2xs flex flex-col justify-between group ${isAdmin ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={isAdmin ? handleOpenAdminModal : undefined}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#F4F8FA] border border-slate-100 group-hover:bg-[#7F7FFA]/10 transition-colors">
                        <Layers className="w-5 h-5 text-[#7F7FFA]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#3C3C3C] tracking-tight">
                          {statusData.customCategory.name || 'Custom Section'}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {statusData.customCategory.category || 'Custom Category'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getServiceStatusBadge(statusData.customCategory.status)}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAdminModal();
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-[#7F7FFA] hover:bg-[#7F7FFA]/10 transition-colors"
                          title="Edit custom section"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {statusData.customCategory.description || 'Custom category details managed by administrators.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7F7FFA]/10 text-[#7F7FFA]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3C3C3C] tracking-tight">
                Need assistance?
              </h3>
              <p className="text-xs text-slate-500">
                Contact BeginFin Support
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a 
              href="mailto:support@begin-fin.com"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#3C3C3C] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-[#7F7FFA]" />
              support@begin-fin.com
            </a>
          </div>
        </section>

      </main>

      {/* Admin Status Management Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 text-left"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#7F7FFA]/10 text-[#7F7FFA]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#3C3C3C] tracking-tight">
                      Admin Status Control
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update component statuses and announcement notices.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {saveError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Status published successfully!</span>
                </div>
              )}

              {/* Service Categories Configuration */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Section Statuses
                </h4>
                <div className="space-y-3">
                  {Object.entries(editServices).map(([key, service]) => (
                    <div 
                      key={key}
                      className="p-4 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-[#3C3C3C] flex items-center gap-2">
                          {getCategoryIcon(key)}
                          <span>{service.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {service.description}
                        </p>
                      </div>

                      {/* Status Toggle Radio Group */}
                      <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                        {(['Operational', 'Issues Observed', 'Not Operational'] as ServiceStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setEditServices(prev => ({
                                ...prev,
                                [key]: {
                                  ...prev[key as keyof typeof prev],
                                  status: st
                                }
                              }));
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              service.status === st 
                                ? st === 'Operational' ? 'bg-emerald-600 text-white shadow-2xs' :
                                  st === 'Issues Observed' ? 'bg-amber-500 text-white shadow-2xs' :
                                  'bg-rose-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Section / Category Configuration */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    2. Custom Category Card
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C3C3C]">
                    <input 
                      type="checkbox"
                      checked={editCustomCategory.enabled}
                      onChange={(e) => setEditCustomCategory({ ...editCustomCategory, enabled: e.target.checked })}
                      className="rounded border-slate-300 text-[#7F7FFA] focus:ring-[#7F7FFA]"
                    />
                    <span>Show Custom Category</span>
                  </label>
                </div>

                {editCustomCategory.enabled && (
                  <div className="p-4 rounded-2xl bg-[#F4F8FA] border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Category Title
                        </label>
                        <input 
                          type="text"
                          value={editCustomCategory.name}
                          onChange={(e) => setEditCustomCategory({ ...editCustomCategory, name: e.target.value })}
                          placeholder="e.g. Cloud Database / Partner API"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-[#7F7FFA] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Sub-Tag / Category
                        </label>
                        <input 
                          type="text"
                          value={editCustomCategory.category}
                          onChange={(e) => setEditCustomCategory({ ...editCustomCategory, category: e.target.value })}
                          placeholder="e.g. Infrastructure or Integration"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-[#7F7FFA] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Description
                      </label>
                      <input 
                        type="text"
                        value={editCustomCategory.description}
                        onChange={(e) => setEditCustomCategory({ ...editCustomCategory, description: e.target.value })}
                        placeholder="Brief summary of status or service scope"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-[#7F7FFA] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category Status
                      </label>
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 inline-flex">
                        {(['Operational', 'Issues Observed', 'Not Operational'] as ServiceStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setEditCustomCategory({ ...editCustomCategory, status: st })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              editCustomCategory.status === st 
                                ? st === 'Operational' ? 'bg-emerald-600 text-white shadow-2xs' :
                                  st === 'Issues Observed' ? 'bg-amber-500 text-white shadow-2xs' :
                                  'bg-rose-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Announcement Message Configuration */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    3. Announcement Notice Banner
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C3C3C]">
                    <input 
                      type="checkbox"
                      checked={editShowCustom}
                      onChange={(e) => setEditShowCustom(e.target.checked)}
                      className="rounded border-slate-300 text-[#7F7FFA] focus:ring-[#7F7FFA]"
                    />
                    <span>Show Notice Banner</span>
                  </label>
                </div>

                {editShowCustom && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Title (Optional)
                      </label>
                      <input 
                        type="text"
                        value={editCustomTitle}
                        onChange={(e) => setEditCustomTitle(e.target.value)}
                        placeholder="e.g. Scheduled Maintenance Notice"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#7F7FFA] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Notice Message
                      </label>
                      <textarea 
                        rows={3}
                        value={editCustomMessage}
                        onChange={(e) => setEditCustomMessage(e.target.value)}
                        placeholder="Enter notice details..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#7F7FFA] outline-none resize-y"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Authorized Admin Accounts Information */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7F7FFA]" />
                    4. Authorized Administrator Accounts
                  </h4>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Users with the following email addresses or with <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-600 font-mono text-[11px]">role: "admin"</code> in Firestore have full administrative privileges across BeginFin:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DEFAULT_ADMIN_EMAILS.map((admEmail) => (
                      <span 
                        key={admEmail}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold shadow-2xs"
                      >
                        <UserIcon className="w-2.5 h-2.5 text-indigo-500" />
                        {admEmail}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    💡 To add or edit admin accounts, update <code className="font-mono text-slate-600">/config/adminConfig.ts</code> or assign <code className="font-mono text-slate-600">role: "admin"</code> on the user's Firestore document under <code className="font-mono text-slate-600">users/{'{uid}'}</code>.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#7F7FFA] text-white hover:bg-[#7F7FFA]/90 text-xs font-bold transition-all shadow-md shadow-[#7F7FFA]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Publish Status</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

