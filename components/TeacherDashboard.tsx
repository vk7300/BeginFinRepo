import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Copy, CheckCircle2, BookOpen, Trophy, Loader2, Search, User as UserIcon, Trash2, ChevronDown, ChevronUp, AlertCircle, FileText, Download, Zap, Calendar, X, Lock, Unlock, Bell, Award, Share2, GraduationCap, Send, RefreshCw, Link as LinkIcon, ExternalLink, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, where, getDocs, addDoc, doc, onSnapshot, setDoc, deleteDoc, writeBatch, handleFirestoreError, OperationType, updateDoc } from '../firebase';
import { modules } from '../data/courseData';
import { User as FirebaseUser } from 'firebase/auth';
import { ClassReportPDF } from './ClassReportPDF';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { googleClassroomService, ClassroomCourse, ClassroomStudent } from '../services/googleClassroomService';
import { GuillocheBorder } from './GuillocheBorder';
import { GuillocheBackground } from './GuillocheBackground';
import { 
  isDummyUser, 
  loadDummyClasses, 
  saveDummyClasses, 
  loadDummyStudents, 
  saveDummyStudents, 
  loadDummyAlerts 
} from '../data/dummyTestData';

interface ClassData {
  id: string;
  className: string;
  joinCode: string;
  teacherId: string;
  createdAt?: string;
  linkedCourseId?: string;
  linkedCourseName?: string;
  isFullScreenLockEnabled?: boolean;
  rosterEmails?: string[];
  rosterSyncedAt?: string;
  challenge?: {
    title: string;
    deadline: string;
    isActive: boolean;
    moduleIds?: string[];
    createdAt: string;
  };
}

interface StudentProgress {
  uid: string;
  displayName: string;
  email: string;
  completedModules: string[];
  creditScoreMaster?: boolean;
  classId: string;
  teacherId: string;
}

interface AlertData {
  id: string;
  userId: string;
  userName: string;
  type: string;
  moduleTitle: string;
  timestamp: any;
  message: string;
}

export const TeacherDashboard: React.FC<{ 
  user: FirebaseUser | null;
  onSwitchToStudentView: () => void;
  triggerLoading?: (message: string, duration?: number) => void;
  onOpenGuide?: () => void;
  language: string;
}> = ({ user, onSwitchToStudentView, triggerLoading, onOpenGuide, language }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [alerts, setAlerts] = useState<Record<string, AlertData[]>>({});

  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [collapsedClasses, setCollapsedClasses] = useState<Set<string>>(new Set());
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<string | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState<StudentProgress | null>(null);
  const [reportData, setReportData] = useState<{ className: string; students: StudentProgress[] } | null>(null);
  
  const [isCreatingChallenge, setIsCreatingChallenge] = useState<string | null>(null);
  const [isEditingChallenge, setIsEditingChallenge] = useState<string | null>(null);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDeadline, setChallengeDeadline] = useState('');
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [isSavingChallenge, setIsSavingChallenge] = useState(false);

  // Google Classroom Integration States
  const [isConnectedClassroom, setIsConnectedClassroom] = useState(false);
  const [classroomUserEmail, setClassroomUserEmail] = useState<string | null>(null);
  const [classroomCourses, setClassroomCourses] = useState<ClassroomCourse[]>([]);
  const [isConnectingClassroom, setIsConnectingClassroom] = useState(false);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);
  const [showCourseImportModal, setShowCourseImportModal] = useState(false);
  
  // Modals for Google Classroom Coursework, Announcements & Roster
  const [courseworkClass, setCourseworkClass] = useState<ClassData | null>(null);
  const [announcementClass, setAnnouncementClass] = useState<ClassData | null>(null);
  const [rosterSyncClass, setRosterSyncClass] = useState<ClassData | null>(null);
  const [classRosterPreview, setClassRosterPreview] = useState<ClassroomStudent[]>([]);
  const [isAddingRosterToBeginFin, setIsAddingRosterToBeginFin] = useState(false);
  const [rosterSyncSuccess, setRosterSyncSuccess] = useState<string | null>(null);
  
  // Manual Roster States
  const [manualRosterClass, setManualRosterClass] = useState<ClassData | null>(null);
  const [manualRosterText, setManualRosterText] = useState('');
  const [manualRosterSaving, setManualRosterSaving] = useState(false);
  const [manualRosterFeedback, setManualRosterFeedback] = useState<string | null>(null);
  
  // Form fields for Coursework
  const [courseworkTitle, setCourseworkTitle] = useState('');
  const [courseworkDesc, setCourseworkDesc] = useState('');
  const [courseworkModuleId, setCourseworkModuleId] = useState('');
  const [courseworkPoints, setCourseworkPoints] = useState(100);
  const [courseworkDueDate, setCourseworkDueDate] = useState('');
  
  // Form fields for Announcement
  const [announcementText, setAnnouncementText] = useState('');
  
  // Submission & Confirmation Modal
  const [isSubmittingClassroom, setIsSubmittingClassroom] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    title: string;
    message: string;
    badgeText?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Lock body scroll whenever any modal/panel is open to eliminate background scrolling
  const isAnyModalOpen = Boolean(
    deletingClassId ||
    pendingConfirmation ||
    showCourseImportModal ||
    courseworkClass ||
    announcementClass ||
    rosterSyncClass ||
    manualRosterClass ||
    isCreatingClass ||
    isCreatingChallenge ||
    isEditingChallenge ||
    reportData ||
    isGeneratingCertificate
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isAnyModalOpen]);


  // Automatic background grade sync
  const [hasAutoSynced, setHasAutoSynced] = useState(false);

  // Auto-restore Google Classroom cached session and courses on mount
  useEffect(() => {
    const cachedToken = googleClassroomService.getAccessToken();
    const cachedEmail = googleClassroomService.getCachedEmail();
    const cachedCourses = googleClassroomService.getCachedCourses();

    if (cachedCourses && cachedCourses.length > 0) {
      setClassroomCourses(cachedCourses);
      setIsConnectedClassroom(true);
    }
    if (cachedEmail) {
      setClassroomUserEmail(cachedEmail);
      setIsConnectedClassroom(true);
    }
    if (cachedToken) {
      setIsConnectedClassroom(true);
      // Silently refresh courses in the background to ensure up-to-date data
      googleClassroomService.fetchCourses(cachedToken)
        .then((courses) => {
          if (courses && courses.length > 0) {
            setClassroomCourses(courses);
          }
        })
        .catch((e) => {
          console.warn("Silent Google Classroom courses refresh note:", e);
        });
    }
  }, []);

  // When course import modal opens, ensure courses are loaded
  useEffect(() => {
    if (showCourseImportModal && classroomCourses.length === 0 && !isFetchingCourses) {
      fetchClassroomCourses().catch(() => {});
    }
  }, [showCourseImportModal]);

  useEffect(() => {
    if (isConnectedClassroom && classes.length > 0 && students.length > 0 && !hasAutoSynced) {
      const linkedClasses = classes.filter(cls => cls.linkedCourseId);
      if (linkedClasses.length > 0) {
        setHasAutoSynced(true);
        linkedClasses.forEach(cls => {
          handleSyncGradesToClassroom(cls, true).catch(console.error);
        });
      }
    }
  }, [isConnectedClassroom, classes.length, students.length, hasAutoSynced]);
  useEffect(() => {
    if (!user) return;

    if (isDummyUser(user)) {
      const dummyClasses = loadDummyClasses();
      setClasses(dummyClasses as ClassData[]);
      setIsLoading(false);
      return;
    }

    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('teacherId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const classList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
      setClasses(classList);
      setIsLoading(false);
    }, (err) => {
      console.error('TeacherDashboard Classes Snapshot Error:', err);
      setIsLoading(false);
      if (err.message.includes('insufficient permissions')) {
        handleFirestoreError(err, OperationType.LIST, 'classes');
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || classes.length === 0) {
      setStudents([]);
      return;
    }

    if (isDummyUser(user)) {
      const dummyStudents = loadDummyStudents();
      setStudents(dummyStudents as StudentProgress[]);
      return;
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('teacherId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = snapshot.docs.map(doc => ({ ...doc.data() } as StudentProgress));
      console.log('Fetched students for teacher:', user.uid, studentList);
      setStudents(studentList);
    }, (err) => {
      console.error('TeacherDashboard Students Snapshot Error:', err);
      if (err.message.includes('insufficient permissions')) {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
    });

    return () => unsubscribe();
  }, [classes, user]);

  useEffect(() => {
    if (!user || classes.length === 0) return;

    if (isDummyUser(user)) {
      const dummyAlerts = loadDummyAlerts();
      const map: Record<string, AlertData[]> = {};
      dummyAlerts.forEach(a => {
        if (!map[a.classId]) map[a.classId] = [];
        map[a.classId].push(a as any);
      });
      setAlerts(map);
      return;
    }

    const unsubscribes = classes.map(cls => {
      const alertsRef = collection(db, 'classes', cls.id, 'alerts');
      const q = query(alertsRef, where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))); // Last 24 hours
      
      return onSnapshot(q, (snapshot) => {
        const classAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertData));
        setAlerts(prev => ({ ...prev, [cls.id]: classAlerts }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [classes, user]);

  // Google Classroom Handlers
  const handleConnectGoogleClassroom = async () => {
    setIsConnectingClassroom(true);
    try {
      if (triggerLoading) triggerLoading("Connecting to Google Classroom...", 3000);
      const { user: googleUser, accessToken } = await googleClassroomService.connectGoogleClassroom();
      setIsConnectedClassroom(true);
      setClassroomUserEmail(googleUser.email);
      if (triggerLoading) triggerLoading("Fetching your Google Classroom courses...", 2000);
      await fetchClassroomCourses(accessToken);
    } catch (err: any) {
      console.error("Google Classroom Connection Error:", err);
      if (triggerLoading) triggerLoading(`Failed to connect Google Classroom: ${err.message || 'Error occurred'}`, 3000);
    } finally {
      setIsConnectingClassroom(false);
    }
  };

  const fetchClassroomCourses = async (tokenOverride?: string) => {
    setIsFetchingCourses(true);
    try {
      const fetchedCourses = await googleClassroomService.fetchCourses(tokenOverride);
      setClassroomCourses(fetchedCourses);
      setIsConnectedClassroom(true);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      if (triggerLoading) triggerLoading(`Error fetching courses: ${err.message}`, 3000);
    } finally {
      setIsFetchingCourses(false);
    }
  };

  const handleImportClassroomCourse = async (course: ClassroomCourse) => {
    if (!user) return;
    try {
      if (triggerLoading) triggerLoading(`Importing "${course.name}" from Google Classroom...`, 2500);
      let joinCode = generateJoinCode();
      const classRef = doc(collection(db, 'classes'));
      
      await setDoc(classRef, {
        classId: classRef.id,
        className: course.name + (course.section ? ` (${course.section})` : ''),
        teacherId: user.uid,
        joinCode,
        linkedCourseId: course.id,
        linkedCourseName: course.name,
        createdAt: new Date().toISOString()
      });

      setShowCourseImportModal(false);
      if (triggerLoading) triggerLoading(`Successfully linked Google Classroom course "${course.name}"!`, 3000);
    } catch (err) {
      console.error("Error importing course:", err);
      if (triggerLoading) triggerLoading("Failed to import course. Please try again.", 3000);
    }
  };

  const executePublishCoursework = async (cls: ClassData) => {
    if (!cls.linkedCourseId) return;
    setIsSubmittingClassroom(true);
    try {
      if (triggerLoading) triggerLoading("Publishing coursework to Google Classroom...", 3000);

      const mod = modules.find(m => m.id === courseworkModuleId);
      const appUrl = window.location.origin;

      let dueDateObj: { year: number; month: number; day: number } | undefined = undefined;
      let dueTimeObj: { hours: number; minutes: number } | undefined = undefined;
      if (courseworkDueDate) {
        const d = new Date(courseworkDueDate);
        dueDateObj = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
        dueTimeObj = { hours: 23, minutes: 59 };
      }

      await googleClassroomService.createCourseWork(cls.linkedCourseId, {
        title: courseworkTitle || (mod ? `BeginFin Module: ${mod.translations?.en?.title || ''}` : 'BeginFin Financial Literacy Coursework'),
        description: courseworkDesc || (mod ? mod.translations?.en?.description || '' : 'Complete this BeginFin module to earn your NSPFE financial literacy certification.'),
        maxPoints: courseworkPoints,
        dueDate: dueDateObj,
        dueTime: dueTimeObj,
        linkUrl: `${appUrl}?classId=${cls.id}&moduleId=${courseworkModuleId || ''}`,
      });

      setCourseworkClass(null);
      setCourseworkTitle('');
      setCourseworkDesc('');
      setCourseworkModuleId('');
      if (triggerLoading) triggerLoading("Coursework assignment published successfully to Google Classroom!", 3500);
    } catch (err: any) {
      console.error("Error publishing coursework:", err);
      if (triggerLoading) triggerLoading(`Failed to publish assignment: ${err.message}`, 4000);
    } finally {
      setIsSubmittingClassroom(false);
      setPendingConfirmation(null);
    }
  };

  const handleConfirmPublishCoursework = (cls: ClassData) => {
    if (!cls.linkedCourseId) {
      if (triggerLoading) triggerLoading("This class is not linked to a Google Classroom course.", 3000);
      return;
    }
    setPendingConfirmation({
      title: "Publish Coursework to Google Classroom?",
      message: `You are about to publish the assignment "${courseworkTitle || 'BeginFin Assignment'}" to your enrolled students in Google Classroom (${cls.linkedCourseName || cls.className}).`,
      badgeText: "Google Classroom Assignment",
      onConfirm: () => executePublishCoursework(cls)
    });
  };

  const executePublishAnnouncement = async (cls: ClassData) => {
    if (!cls.linkedCourseId) return;
    setIsSubmittingClassroom(true);
    try {
      if (triggerLoading) triggerLoading("Posting announcement to Google Classroom stream...", 3000);

      await googleClassroomService.createAnnouncement(cls.linkedCourseId, {
        text: announcementText,
        linkUrl: 'https://begin-fin.com/app'
      });

      setAnnouncementClass(null);
      setAnnouncementText('');
      if (triggerLoading) triggerLoading("Announcement posted to Google Classroom stream!", 3500);
    } catch (err: any) {
      console.error("Error publishing announcement:", err);
      if (triggerLoading) triggerLoading(`Failed to post announcement: ${err.message}`, 4000);
    } finally {
      setIsSubmittingClassroom(false);
      setPendingConfirmation(null);
    }
  };

  const handleSyncGradesToClassroom = async (cls: ClassData, silent: boolean = false) => {
    if (!cls.linkedCourseId) return;
    setIsSubmittingClassroom(true);
    try {
      if (triggerLoading && !silent) triggerLoading(`Syncing grades for ${cls.className} to Google Classroom...`, 3000);

      const classStudents = students.filter(s => s.classId === cls.id);
      if (classStudents.length === 0) {
        if (triggerLoading && !silent) triggerLoading("No students enrolled in this class to sync grades.", 3000);
        return;
      }

      // Fetch coursework items for this linked course
      const courseWorks = await googleClassroomService.fetchCourseWorkList(cls.linkedCourseId);
      if (courseWorks.length === 0) {
        if (triggerLoading && !silent) triggerLoading("No active coursework found in Google Classroom. Publish coursework first to sync grades.", 4000);
        return;
      }

      // Fetch Google Classroom student roster
      const roster = await googleClassroomService.fetchCourseRoster(cls.linkedCourseId);

      let syncedCount = 0;

      for (const cw of courseWorks) {
        const submissions = await googleClassroomService.fetchStudentSubmissions(cls.linkedCourseId, cw.id);
        const maxPoints = cw.maxPoints || 100;

        for (const student of classStudents) {
          const rosterStudent = roster.find(r => 
            (r.profile?.emailAddress && student.email && r.profile.emailAddress.toLowerCase() === student.email.toLowerCase()) ||
            (r.profile?.name?.fullName && student.displayName && r.profile.name.fullName.toLowerCase() === student.displayName.toLowerCase())
          );

          if (!rosterStudent) continue;

          const submission = submissions.find(sub => sub.userId === rosterStudent.userId);
          if (!submission) continue;

          // Calculate grade percentage based on completed modules (6 core NSPFE modules)
          const completedCount = student.completedModules ? student.completedModules.length : 0;
          const totalModules = 6;
          const scorePercentage = Math.min(100, Math.round((completedCount / totalModules) * 100));
          const assignedGrade = Math.round((scorePercentage / 100) * maxPoints);

          await googleClassroomService.patchStudentGrade(
            cls.linkedCourseId,
            cw.id,
            submission.id,
            assignedGrade
          );
          syncedCount++;
        }
      }

      if (triggerLoading && !silent) {
        triggerLoading(`Successfully synced grades for ${syncedCount} student submission(s) to Google Classroom!`, 4000);
      }
    } catch (err: any) {
      console.error("Grade Sync Error:", err);
      if (triggerLoading && !silent) triggerLoading(`Grade Sync Note: ${err.message || 'Grades updated.'}`, 4000);
    } finally {
      setIsSubmittingClassroom(false);
    }
  };

  const handleConfirmPublishAnnouncement = (cls: ClassData) => {
    if (!cls.linkedCourseId) return;
    setPendingConfirmation({
      title: "Post Announcement to Google Classroom Stream?",
      message: `Are you sure you want to broadcast this announcement to class stream in Google Classroom (${cls.linkedCourseName || cls.className})?`,
      badgeText: "Google Classroom Announcement",
      onConfirm: () => executePublishAnnouncement(cls)
    });
  };

  const handleOpenRosterSync = async (cls: ClassData) => {
    if (!cls.linkedCourseId) return;
    try {
      if (triggerLoading) triggerLoading("Fetching student roster from Google Classroom...", 2500);
      const studentsList = await googleClassroomService.fetchCourseRoster(cls.linkedCourseId);
      setClassRosterPreview(studentsList);
      setRosterSyncClass(cls);
    } catch (err: any) {
      console.error("Error fetching roster:", err);
      if (triggerLoading) triggerLoading(`Error reading roster: ${err.message}`, 3000);
    }
  };

  const handleAddRosterToBeginFin = async () => {
    if (!rosterSyncClass || !user) return;
    setIsAddingRosterToBeginFin(true);
    setRosterSyncSuccess(null);
    try {
      const emails = classRosterPreview
        .map(s => s.profile?.emailAddress?.toLowerCase().trim())
        .filter(Boolean) as string[];

      if (emails.length === 0) {
        if (triggerLoading) triggerLoading("No student emails found in this Google Classroom roster.", 3000);
        return;
      }

      if (triggerLoading) triggerLoading(`Adding ${emails.length} student emails to BeginFin class...`, 2500);

      const idToken = await user.getIdToken();
      const response = await fetch('/api/sync-class-roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          classId: rosterSyncClass.id,
          rosterEmails: emails
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to sync roster to BeginFin.');
      }

      const resData = await response.json();
      setRosterSyncSuccess(`Added ${resData.count} students! They will be automatically enrolled and greeted with a notification upon login.`);
      if (triggerLoading) {
        triggerLoading(`✓ ${resData.count} students added to BeginFin roster!`, 4000);
      }
    } catch (err: any) {
      console.error("Error adding roster to BeginFin:", err);
      if (triggerLoading) triggerLoading(`Failed to add roster: ${err.message}`, 4000);
    } finally {
      setIsAddingRosterToBeginFin(false);
    }
  };

  const handleSaveManualRoster = async () => {
    if (!manualRosterClass || !user) return;
    setManualRosterSaving(true);
    setManualRosterFeedback(null);
    try {
      const emails = manualRosterText
        .split(/[\n,;]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.includes('@'));

      if (emails.length === 0) {
        setManualRosterFeedback("Please enter at least one valid email address.");
        setManualRosterSaving(false);
        return;
      }

      if (isDummyUser(user)) {
        setClasses(prev => {
          const updated = prev.map(c => c.id === manualRosterClass.id ? { ...c, rosterEmails: emails } : c);
          saveDummyClasses(updated as any);
          return updated;
        });
        setManualRosterFeedback(`✓ Saved ${emails.length} students to roster!`);
        if (triggerLoading) {
          triggerLoading(`✓ Roster updated with ${emails.length} students.`, 2000);
        }
        setTimeout(() => {
          setManualRosterClass(null);
          setManualRosterFeedback(null);
        }, 1500);
        setManualRosterSaving(false);
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/sync-class-roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          classId: manualRosterClass.id,
          rosterEmails: emails
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save roster.');
      }

      const resData = await response.json();
      setManualRosterFeedback(`✓ Saved ${resData.count} students! Enrolled students will receive a one-time notification on their first login.`);
      if (triggerLoading) {
        triggerLoading(`✓ Roster updated with ${resData.count} students.`, 3000);
      }
      setTimeout(() => {
        setManualRosterClass(null);
        setManualRosterFeedback(null);
      }, 2000);
    } catch (err: any) {
      console.error("Error saving manual roster:", err);
      setManualRosterFeedback(`Error: ${err.message}`);
    } finally {
      setManualRosterSaving(false);
    }
  };

  const generateJoinCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    const randomArray = new Uint8Array(6);
    crypto.getRandomValues(randomArray);
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    return result;
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !user) return;
    setIsCreatingClass(true);
    if (triggerLoading) triggerLoading("Creating your class...", 2500);
    try {
      // Sanitize input class name and limit length to 80 characters
      const cleaned = newClassName.trim().replace(/<\/?[^>]+(>|$)/g, "");
      const finalClassName = cleaned.substring(0, 80);
      if (finalClassName.length === 0) {
        setIsCreatingClass(false);
        return;
      }
      
      let joinCode = generateJoinCode();

      if (isDummyUser(user)) {
        const newClass: ClassData = {
          id: 'dummy-class-' + Date.now(),
          className: finalClassName,
          joinCode,
          teacherId: user.uid,
          createdAt: new Date().toISOString()
        };
        const updated = [...classes, newClass];
        setClasses(updated);
        saveDummyClasses(updated as any);
        setNewClassName('');
        setIsCreatingClass(false);
        if (triggerLoading) triggerLoading(`Class "${finalClassName}" created!`, 2000);
        return;
      }
      
      // Check for uniqueness
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        const q = query(collection(db, 'classes'), where('joinCode', '==', joinCode));
        const snap = await getDocs(q);
        if (snap.empty) {
          isUnique = true;
        } else {
          joinCode = generateJoinCode();
          attempts++;
        }
      }

      const classRef = doc(collection(db, 'classes'));
      await setDoc(classRef, {
        classId: classRef.id,
        className: finalClassName,
        teacherId: user.uid,
        joinCode,
        createdAt: new Date().toISOString()
      });
      setNewClassName('');
      setIsCreatingClass(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'classes');
    } finally {
      setIsCreatingClass(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCollapse = (classId: string) => {
    const newCollapsed = new Set(collapsedClasses);
    if (newCollapsed.has(classId)) {
      newCollapsed.delete(classId);
    } else {
      newCollapsed.add(classId);
    }
    setCollapsedClasses(newCollapsed);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!user) return;
    setIsDeleting(true);
    try {
      if (triggerLoading) triggerLoading("Deleting class and updating student records...", 3000);
      
      if (isDummyUser(user)) {
        setClasses(prev => {
          const updated = prev.filter(c => c.id !== classId);
          saveDummyClasses(updated as any);
          return updated;
        });
        setStudents(prev => {
          const updated = prev.filter(s => s.classId !== classId);
          saveDummyStudents(updated as any);
          return updated;
        });
        setDeletingClassId(null);
        setDeleteConfirmationText('');
        setIsDeleting(false);
        if (triggerLoading) triggerLoading("Class deleted successfully!", 2000);
        return;
      }

      // 1. Safely unenroll all students belonging to this class
      // Using students in memory avoids the Firestore permission failure from querying without teacherId
      const targetStudents = students.filter(s => s.classId === classId);
      if (targetStudents.length > 0) {
        await Promise.allSettled(
          targetStudents.map(student =>
            updateDoc(doc(db, 'users', student.uid), {
              classId: null,
              teacherId: null
            }).catch(e => console.warn(`Notice: Could not unenroll student ${student.uid}:`, e))
          )
        );
      }
      
      // 2. Delete alerts subcollection safely
      try {
        const alertsRef = collection(db, 'classes', classId, 'alerts');
        const alertsSnapshot = await getDocs(alertsRef);
        await Promise.allSettled(
          alertsSnapshot.docs.map(alertDoc => deleteDoc(alertDoc.ref))
        );
      } catch (alertErr) {
        console.warn("Notice: could not clear alerts subcollection:", alertErr);
      }
      
      // 3. Delete the class document
      await deleteDoc(doc(db, 'classes', classId));
      
      // 4. Update local state immediately for instant responsive UI
      setClasses(prev => prev.filter(c => c.id !== classId));
      setStudents(prev => prev.filter(s => s.classId !== classId));
      setDeletingClassId(null);
      setDeleteConfirmationText('');
      if (triggerLoading) triggerLoading("Class deleted successfully!", 3000);
    } catch (err) {
      console.error('Error deleting class:', err);
      if (triggerLoading) triggerLoading("Failed to delete class. Please check your permissions.", 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadReport = async (cls: ClassData) => {
    setIsGeneratingReport(cls.id);
    const classStudents = students.filter(s => s.classId === cls.id);
    setReportData({ className: cls.className, students: classStudents });
    
    // Wait for the off-screen component to render
    setTimeout(async () => {
      const element = document.getElementById('class-report-pdf');
      if (!element) {
        setIsGeneratingReport(null);
        return;
      }
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${cls.className.replace(/\s+/g, '_')}_Report.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsGeneratingReport(null);
        setReportData(null);
      }
    }, 500);
  };

  const toggleScreenLock = async (classId: string, enabled: boolean) => {
    if (isDummyUser(user)) {
      setClasses(prev => {
        const updated = prev.map(c => c.id === classId ? { ...c, isFullScreenLockEnabled: enabled } : c);
        saveDummyClasses(updated as any);
        return updated;
      });
      if (triggerLoading) triggerLoading(enabled ? "Locking student screens..." : "Unlocking student screens...", 1500);
      return;
    }
    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, {
        isFullScreenLockEnabled: enabled
      });
      if (triggerLoading) triggerLoading(enabled ? "Locking student screens..." : "Unlocking student screens...", 1500);
    } catch (err) {
      console.error('Error toggling screen lock:', err);
    }
  };

  const handleCreateChallenge = async () => {
    if (!isCreatingChallenge || !challengeTitle || !challengeDeadline) return;
    setIsSavingChallenge(true);
    if (triggerLoading) triggerLoading("Launching your challenge...", 2500);
    try {
      // Sanitize challenge title of HTML tags and limit length of title
      const cleaned = challengeTitle.trim().replace(/<\/?[^>]+(>|$)/g, "");
      const finalTitle = cleaned.substring(0, 100);
      if (finalTitle.length === 0) {
        setIsSavingChallenge(false);
        return;
      }

      if (isDummyUser(user)) {
        const updated = classes.map(c => c.id === isCreatingChallenge ? {
          ...c,
          challenge: {
            title: finalTitle,
            deadline: new Date(challengeDeadline).toISOString(),
            isActive: true,
            moduleIds: selectedModuleIds.length > 0 ? selectedModuleIds : undefined,
            createdAt: new Date().toISOString()
          }
        } : c);
        setClasses(updated);
        saveDummyClasses(updated as any);
        setIsCreatingChallenge(null);
        setChallengeTitle('');
        setChallengeDeadline('');
        setSelectedModuleIds([]);
        setIsSavingChallenge(false);
        if (triggerLoading) triggerLoading("Challenge launched successfully!", 2000);
        return;
      }

      const classRef = doc(db, 'classes', isCreatingChallenge);
      await updateDoc(classRef, {
        challenge: {
          title: finalTitle,
          deadline: new Date(challengeDeadline).toISOString(),
          isActive: true,
          moduleIds: selectedModuleIds.length > 0 ? selectedModuleIds : null,
          createdAt: new Date().toISOString()
        }
      });

      // Send notification
      await addDoc(collection(db, 'classes', isCreatingChallenge, 'alerts'), {
        type: 'challenge_start',
        title: finalTitle,
        timestamp: new Date(),
        message: `started a new challenge: ${finalTitle}`
      });

      setIsCreatingChallenge(null);
      setChallengeTitle('');
      setChallengeDeadline('');
      setSelectedModuleIds([]);
      // Use triggerLoading for confirmation instead of blocking alert
      if (triggerLoading) triggerLoading("Challenge launched successfully!", 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `classes/${isCreatingChallenge}`);
    } finally {
      setIsSavingChallenge(false);
    }
  };

  const handleUpdateChallenge = async () => {
    if (!isEditingChallenge || !challengeTitle || !challengeDeadline) return;
    setIsSavingChallenge(true);
    if (triggerLoading) triggerLoading("Updating challenge...", 2000);
    try {
      // Sanitize challenge title of HTML tags and limit length of title
      const cleaned = challengeTitle.trim().replace(/<\/?[^>]+(>|$)/g, "");
      const finalTitle = cleaned.substring(0, 100);
      if (finalTitle.length === 0) {
        setIsSavingChallenge(false);
        return;
      }

      if (isDummyUser(user)) {
        const updated = classes.map(c => c.id === isEditingChallenge ? {
          ...c,
          challenge: {
            title: finalTitle,
            deadline: new Date(challengeDeadline).toISOString(),
            isActive: true,
            moduleIds: selectedModuleIds.length > 0 ? selectedModuleIds : undefined,
            createdAt: c.challenge?.createdAt || new Date().toISOString()
          }
        } : c);
        setClasses(updated);
        saveDummyClasses(updated as any);
        setIsEditingChallenge(null);
        setChallengeTitle('');
        setChallengeDeadline('');
        setSelectedModuleIds([]);
        setIsSavingChallenge(false);
        if (triggerLoading) triggerLoading("Challenge updated successfully!", 2000);
        return;
      }

      const classRef = doc(db, 'classes', isEditingChallenge);
      await updateDoc(classRef, {
        'challenge.title': finalTitle,
        'challenge.deadline': new Date(challengeDeadline).toISOString(),
        'challenge.moduleIds': selectedModuleIds.length > 0 ? selectedModuleIds : null
      });

      setIsEditingChallenge(null);
      setChallengeTitle('');
      setChallengeDeadline('');
      setSelectedModuleIds([]);
      if (triggerLoading) triggerLoading("Challenge updated successfully!", 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `classes/${isEditingChallenge}`);
    } finally {
      setIsSavingChallenge(false);
    }
  };

  const handleEndChallenge = async (classId: string) => {
    if (isDummyUser(user)) {
      setClasses(prev => {
        const updated = prev.map(c => c.id === classId && c.challenge ? { ...c, challenge: { ...c.challenge, isActive: false } } : c);
        saveDummyClasses(updated as any);
        return updated;
      });
      return;
    }
    try {
      const classRef = doc(db, 'classes', classId);
      const cls = classes.find(c => c.id === classId);
      await updateDoc(classRef, {
        'challenge.isActive': false
      });

      // Send notification
      await addDoc(collection(db, 'classes', classId, 'alerts'), {
        type: 'challenge_end',
        title: cls?.challenge?.title || 'Challenge',
        timestamp: new Date(),
        message: `The challenge "${cls?.challenge?.title || 'Challenge'}" has ended.`
      });
    } catch (err) {
      console.error('Error ending challenge:', err);
    }
  };

  const handleDeleteChallenge = async (classId: string) => {
    if (isDummyUser(user)) {
      setClasses(prev => {
        const updated = prev.map(c => c.id === classId ? { ...c, challenge: undefined } : c);
        saveDummyClasses(updated as any);
        return updated;
      });
      return;
    }
    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, {
        challenge: null
      });
    } catch (err) {
      console.error('Error deleting challenge:', err);
    }
  };

  const dismissAlert = async (classId: string, alertId: string) => {
    if (isDummyUser(user)) {
      setAlerts(prev => {
        const classAlerts = prev[classId] || [];
        return {
          ...prev,
          [classId]: classAlerts.filter(a => a.id !== alertId)
        };
      });
      return;
    }
    try {
      await deleteDoc(doc(db, 'classes', classId, 'alerts', alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const handleDownloadCertificate = async (student: StudentProgress) => {
    setIsGeneratingCertificate(student);
    
    setTimeout(async () => {
      const element = document.getElementById('student-certificate-pdf');
      if (!element) {
        setIsGeneratingCertificate(null);
        return;
      }
      
      try {
        if (document.fonts) {
          await document.fonts.ready;
        }
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 816,
          windowHeight: 1056
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'letter'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        const safeName = student.displayName.replace(/[^a-zA-Z0-9_-]/g, '_');
        pdf.save(`BeginFin_Certificate_${safeName}.pdf`);
      } catch (err) {
        console.error('Error generating certificate:', err);
      } finally {
        setIsGeneratingCertificate(null);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9FD] p-4 sm:p-6 md:p-10 font-sans text-slate-900 relative">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#ECECFC]/80 via-[#F4F8FA]/90 to-transparent pointer-events-none z-0" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[52rem] h-64 bg-radial from-white/80 via-[#7F7FFA]/10 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header - Styled in Hero & About Section Design Language */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 font-sans mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-[#7F7FFA]" />
              <span>Educator Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif text-slate-900 tracking-tight leading-tight">
              Teacher Dashboard
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-sans mt-1">
              Bring the power of BeginFin to your classroom.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => navigate('/teacher/mcp')} 
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-bold rounded-full transition-all flex items-center gap-2 shadow-xs text-sm cursor-pointer hover:shadow-md"
              title="Integrate BeginFin Lesson Planner with your AI tool via MCP"
            >
              <Sparkles className="w-4 h-4 text-[#7F7FFA]" /> AI Lesson Planner (MCP)
            </button>
            {onOpenGuide && (
              <button 
                onClick={onOpenGuide} 
                className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 font-semibold rounded-full hover:bg-slate-50 hover:text-slate-950 transition-all flex items-center gap-2 text-sm shadow-xs cursor-pointer"
              >
                Quickstart Guide
              </button>
            )}
            <button 
              onClick={onSwitchToStudentView} 
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-xs text-sm cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" /> Take Course
            </button>
            <button 
              onClick={() => setIsCreatingClass(true)} 
              className="px-6 py-2.5 bg-[#7F7FFA] hover:bg-[#6868EB] text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Class
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Classes */}
          <div className="lg:col-span-2 space-y-6">
            {classes.length === 0 && !isCreatingClass ? (
              <div className="bg-white rounded-[32px] p-12 text-center text-slate-900 h-full flex flex-col items-center justify-center border border-slate-200/80 shadow-md">
                <div className="w-20 h-20 bg-[#7F7FFA]/10 rounded-3xl flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-[#7F7FFA]" />
                </div>
                <h3 className="text-2xl font-black mb-2">No classes yet</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-sm">Create your first class to start tracking student progress.</p>
                <div className="w-full max-w-sm space-y-4">
                  <input 
                    type="text" 
                    placeholder="Enter Class Name (e.g. Economics 101)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-[#7F7FFA] focus:bg-white transition-all outline-none text-slate-900"
                  />
                  <button 
                    onClick={handleCreateClass}
                    disabled={!newClassName.trim()}
                    className="w-full py-4 bg-black text-white font-bold rounded-full hover:bg-gray-900 transition-all disabled:opacity-50"
                  >
                    Create My First Class
                  </button>
                </div>
              </div>
            ) : (
              classes.map(cls => {
                const isCollapsed = collapsedClasses.has(cls.id);
                const classStudents = students.filter(s => s.classId === cls.id);
                const hasAlerts = alerts[cls.id] && alerts[cls.id].length > 0;
                
                return (
                  <div key={cls.id} className="bg-white rounded-[32px] p-2 relative shadow-lg border border-slate-200/80">
                    {/* Collapsed/Header View */}
                    <div className="bg-gradient-to-r from-[#3B346E] via-[#484285] to-[#7F7FFA] rounded-[24px] p-6 relative overflow-hidden shadow-sm">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            {cls.className}
                            {cls.linkedCourseName && (
                              <span className="px-2 py-1 bg-white/20 text-white text-[10px] uppercase font-bold rounded-full backdrop-blur-md">
                                Google Classroom
                              </span>
                            )}
                          </h3>
                          {hasAlerts && (
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                          )}
                        </div>

                        {/* Status Indicators / Active State Badges */}
                        <div className="flex flex-wrap gap-2 mb-6 items-center">
                          {cls.isFullScreenLockEnabled && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" /> Screen Lock Active
                            </span>
                          )}
                          {cls.challenge?.isActive && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Challenge Active: {cls.challenge.title}
                            </span>
                          )}
                          {cls.rosterEmails && cls.rosterEmails.length > 0 && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-300" /> {cls.rosterEmails.length} Enrolled
                            </span>
                          )}
                          {!cls.isFullScreenLockEnabled && !cls.challenge?.isActive && (!cls.rosterEmails || cls.rosterEmails.length === 0) && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-white/70 border border-white/10 backdrop-blur-md">
                              Ready for instruction
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="bg-white/10 px-6 py-3 rounded-full text-white/90 font-medium tracking-widest text-sm backdrop-blur-md flex items-center gap-3">
                            <span className="opacity-70">CODE:</span> <span className="font-bold">{cls.joinCode}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(cls.joinCode);
                                setCopiedCode(cls.id);
                                setTimeout(() => setCopiedCode(null), 2000);
                              }}
                              className="p-1.5 hover:bg-white/20 rounded-full transition-colors ml-2"
                              title="Copy Class Code"
                            >
                              {copiedCode === cls.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <button 
                            onClick={() => toggleCollapse(cls.id)}
                            className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center"
                          >
                            {isCollapsed ? 'View Controls & Students' : 'Hide Details'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-4 text-slate-900">
                             
                             {/* Alerts Section inside Class */}
                             {alerts[cls.id]?.length > 0 && (
                               <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl space-y-2 mb-6">
                                 <div className="flex items-center gap-2 text-rose-600 mb-2">
                                   <AlertCircle className="w-5 h-5" />
                                   <span className="font-black text-xs uppercase tracking-widest">Security Alerts ({alerts[cls.id].length})</span>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                   {alerts[cls.id].map(alert => (
                                     <div key={alert.id} className="bg-white p-3 rounded-xl border border-rose-100 flex justify-between items-center shadow-sm">
                                       <div>
                                         <p className="text-sm font-bold text-slate-900">
                                           <span className="text-rose-600">{alert.userName}</span> exited full screen
                                         </p>
                                         <p className="text-[10px] text-slate-500 font-medium">
                                           Module: {alert.moduleTitle} • {alert.timestamp?.toDate ? alert.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                                         </p>
                                       </div>
                                       <button 
                                         onClick={() => dismissAlert(cls.id, alert.id)}
                                         className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                       >
                                         <X className="w-4 h-4" />
                                       </button>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}

                             {/* Unified Teacher Controls Toolbar */}
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                               <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                                  <button
                                    onClick={() => toggleScreenLock(cls.id, !cls.isFullScreenLockEnabled)}
                                    className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 whitespace-nowrap ${cls.isFullScreenLockEnabled ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                  >
                                    {cls.isFullScreenLockEnabled ? <Lock className="w-3.5 h-3.5 text-amber-700" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                                    {cls.isFullScreenLockEnabled ? 'Screen Lock Active' : 'Enable Screen Lock'}
                                  </button>
                                  
                                  {cls.challenge?.isActive ? (
                                    <button
                                      onClick={() => handleEndChallenge(cls.id)}
                                      className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-full hover:bg-rose-100 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                    >
                                      <X className="w-3.5 h-3.5" /> End Challenge
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => { setIsCreatingChallenge(cls.id); }}
                                      className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs rounded-full hover:bg-amber-100 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                    >
                                      <Zap className="w-3.5 h-3.5 text-amber-600" /> Launch Challenge
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDownloadReport(cls)}
                                    disabled={isGeneratingReport === cls.id}
                                    className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-full transition-all shadow-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                  >
                                    {isGeneratingReport === cls.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                    Download CSV
                                  </button>

                                  <button
                                    onClick={() => {
                                      setManualRosterClass(cls);
                                      setManualRosterText(cls.rosterEmails ? cls.rosterEmails.join('\n') : '');
                                      setManualRosterFeedback(null);
                                    }}
                                    className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-full transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                  >
                                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                                    {cls.rosterEmails && cls.rosterEmails.length > 0
                                      ? `Roster (${cls.rosterEmails.length})`
                                      : 'Manage Roster'}
                                  </button>
                               </div>

                               <div className="flex gap-2 w-full md:w-auto justify-end">
                                  <button
                                    onClick={() => { setDeletingClassId(cls.id); setDeleteConfirmationText(''); }}
                                    className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-full transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                                    title="Delete this class section"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete Class</span>
                                  </button>
                               </div>
                             </div>

                             {/* Google Classroom Actions (Inside Expansion) */}
                             {isConnectedClassroom && (
                               <div className="flex flex-wrap items-center gap-2 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 mb-6">
                                 <button
                                   onClick={() => {
                                     setCourseworkClass(cls);
                                     setCourseworkTitle(`BeginFin Module Assignment - ${cls.className}`);
                                   }}
                                   className="px-4 py-2 bg-white text-indigo-700 font-bold text-xs rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5 border border-indigo-200"
                                 >
                                   <Send className="w-3.5 h-3.5" /> Post Coursework
                                 </button>
                                 <button
                                   onClick={() => {
                                     setAnnouncementClass(cls);
                                     setAnnouncementText(`📢 Announcement for ${cls.className}: Please check your BeginFin Financial Literacy dashboard for new certification modules!`);
                                   }}
                                   className="px-4 py-2 bg-white text-indigo-700 font-bold text-xs rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5 border border-indigo-200"
                                 >
                                   <Share2 className="w-3.5 h-3.5" /> Stream Post
                                 </button>
                                 {cls.linkedCourseId && (
                                   <>
                                     <button
                                       onClick={() => handleOpenRosterSync(cls)}
                                       className="px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-all shadow-sm flex items-center gap-1.5 border border-slate-200"
                                     >
                                       <Users className="w-3.5 h-3.5 text-[#7F7FFA]" /> Sync Roster
                                     </button>
                                     <button
                                       onClick={() => handleSyncGradesToClassroom(cls)}
                                       className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-full hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-1.5"
                                     >
                                       <RefreshCw className="w-3.5 h-3.5" /> Sync Grades
                                     </button>
                                   </>
                                 )}
                               </div>
                             )}

                             {/* Student Table */}
                             {classStudents.length === 0 ? (
                               <div className="py-12 text-center text-slate-500">
                                 <UserIcon className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                 <p className="font-medium text-sm">No students have joined this class yet.</p>
                                 <p className="text-xs mt-1">Share the code <strong>{cls.joinCode}</strong></p>
                               </div>
                             ) : (
                               <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                 <table className="w-full text-left border-collapse">
                                   <thead>
                                     <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                       <th className="p-4 border-b border-slate-100 rounded-tl-2xl">Student</th>
                                       <th className="p-4 border-b border-slate-100">Progress</th>
                                       <th className="p-4 border-b border-slate-100">Status</th>
                                       <th className="p-4 border-b border-slate-100 rounded-tr-2xl text-right">Actions</th>
                                     </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                     {classStudents.map((student, i) => {
                                       const completedCount = student.completedModules ? student.completedModules.length : 0;
                                       const totalModules = 6;
                                       const progressPercent = Math.round((completedCount / totalModules) * 100);
                                       const isComplete = completedCount >= totalModules;
                                       const canDownloadCert = isComplete;

                                       return (
                                         <tr key={student.uid || i} className="hover:bg-slate-50/50 transition-colors">
                                           <td className="p-4">
                                             <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                 {student.displayName?.charAt(0).toUpperCase() || '?'}
                                               </div>
                                               <div>
                                                 <p className="font-bold text-slate-900 text-sm">{student.displayName}</p>
                                                 <p className="text-xs text-slate-500">{student.email}</p>
                                               </div>
                                             </div>
                                           </td>
                                           <td className="p-4">
                                             <div className="flex items-center gap-3">
                                               <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                                                 <div 
                                                   className="bg-[#7F7FFA] h-2 rounded-full" 
                                                   style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                                 ></div>
                                               </div>
                                               <span className="text-xs font-bold text-slate-600 min-w-[40px]">{progressPercent}%</span>
                                             </div>
                                           </td>
                                           <td className="p-4">
                                              {isComplete ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                                  <CheckCircle2 className="w-3 h-3" /> Completed
                                                </span>
                                              ) : (
                                               <span className="text-slate-400 text-xs font-medium">In Progress ({completedCount}/{totalModules})</span>
                                             )}
                                           </td>
                                           <td className="p-4 text-right">
                                              {canDownloadCert ? (
                                                <button
                                                  onClick={() => handleDownloadCertificate(student)}
                                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#7F7FFA] text-white rounded-md hover:bg-[#5656D4] transition-colors"
                                                  title="Download Certificate"
                                                >
                                                  <Award className="w-3.5 h-3.5" /> Certificate
                                                </button>
                                              ) : (
                                                <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-400 rounded-md opacity-50 cursor-not-allowed">
                                                  <Award className="w-3.5 h-3.5" /> Incomplete
                                                </button>
                                              )}
                                           </td>
                                         </tr>
                                       );
                                     })}
                                   </tbody>
                                 </table>
                               </div>
                             )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Google Classroom Only */}
          <div className="space-y-6">

            <div className="bg-white rounded-[32px] p-8 text-black relative overflow-hidden shadow-xl">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 relative z-10">
                <Users className="text-white w-8 h-8" />
              </div>

              {!isConnectedClassroom ? (
                <div className="relative z-10">
                  <button 
                    onClick={handleConnectGoogleClassroom}
                    disabled={isConnectingClassroom}
                    className="bg-slate-800 text-white px-6 py-3 rounded-full font-medium mb-6 w-auto inline-flex justify-center items-center gap-3 hover:bg-slate-900 transition-colors disabled:opacity-50"
                  >
                    {isConnectingClassroom ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    )}
                    Sign-In with Google
                  </button>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 tracking-tight">Connect Google® Classroom</h3>
                  <p className="text-slate-500 leading-snug text-sm">Assign modules and sync grades directly from BeginFin.</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="px-4 py-2 bg-indigo-50 text-indigo-900 rounded-full flex items-center gap-2 mb-6 w-fit text-sm font-bold border border-indigo-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {classroomUserEmail || 'Connected'}
                  </div>
                  <button
                    onClick={() => setShowCourseImportModal(true)}
                    className="w-full py-3 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mb-3 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Import Course
                  </button>
                  <button
                    onClick={() => fetchClassroomCourses()}
                    disabled={isFetchingCourses}
                    className="w-full py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetchingCourses ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                  <h3 className="text-xl font-bold mb-2 mt-6 text-slate-900 tracking-tight">Google® Classroom Connected</h3>
                  <p className="text-slate-500 leading-snug text-sm">Your BeginFin account is linked. Use class actions to sync grades and assignments.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {(isCreatingChallenge || isEditingChallenge) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {isEditingChallenge ? 'Edit Challenge' : 'Create Challenge'}
              </h3>
              <button 
                onClick={() => { 
                  setIsCreatingChallenge(null); 
                  setIsEditingChallenge(null);
                  setChallengeTitle('');
                  setChallengeDeadline('');
                  setSelectedModuleIds([]); 
                }} 
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto pr-2 custom-scrollbar max-h-[60vh] pb-4">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Challenge Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Weekend Budgeting Sprint"
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none shadow-sm"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" /> Deadline
                  </label>
                  <input 
                    type="datetime-local" 
                    value={challengeDeadline}
                    onChange={(e) => setChallengeDeadline(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none shadow-sm"
                  />
                  <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider italic">Austin, TX (CST) Time Suggested</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-500" /> Included Modules
                  </label>
                  <p className="text-[10px] text-slate-500 font-medium ml-6">Select specific modules or leave all for total mastery.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {modules.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModuleIds(prev => 
                          prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                        );
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${selectedModuleIds.includes(m.id) ? 'border-amber-400 bg-amber-50/50 shadow-sm' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${selectedModuleIds.includes(m.id) ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        {modules.indexOf(m) + 1}
                      </div>
                      <span className={`text-sm font-bold tracking-tight ${selectedModuleIds.includes(m.id) ? 'text-amber-900' : 'text-slate-700'}`}>
                        {m.translations[language].title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button 
                onClick={isEditingChallenge ? handleUpdateChallenge : handleCreateChallenge}
                disabled={isSavingChallenge || !challengeTitle || !challengeDeadline}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
              >
                {isSavingChallenge ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> {isEditingChallenge ? 'Update Challenge' : 'Launch Challenge'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreatingClass && classes.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Create New Class</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Class Name (e.g. Finance 101)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none text-slate-900"
              />
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsCreatingClass(false)}
                  className="py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateClass}
                  disabled={!newClassName.trim()}
                  className="py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Classroom Import Modal */}
      <AnimatePresence>
        {showCourseImportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Import Google Classroom Course</h3>
                    <p className="text-xs text-slate-500 font-medium">Select a class to link directly with BeginFin</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCourseImportModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isFetchingCourses ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-600">Fetching courses from Google Classroom...</p>
                </div>
              ) : classroomCourses.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <p className="text-slate-600 font-bold">No active Google Classroom courses found.</p>
                  <button
                    onClick={() => fetchClassroomCourses()}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100"
                  >
                    Refresh List
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {classroomCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 rounded-2xl flex justify-between items-center transition-all group"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {c.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {c.section ? `Section: ${c.section} • ` : ''}Room: {c.room || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleImportClassroomCourse(c)}
                        className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
                      >
                        Link & Import
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Coursework Modal */}
      <AnimatePresence>
        {courseworkClass && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Publish Google Classroom Assignment</h3>
                    <p className="text-xs text-slate-500 font-medium">For {courseworkClass.className}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCourseworkClass(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Select BeginFin Module (Optional)</label>
                  <select
                    value={courseworkModuleId}
                    onChange={(e) => {
                      setCourseworkModuleId(e.target.value);
                      const mod = modules.find(m => m.id === e.target.value);
                      if (mod) {
                        setCourseworkTitle(`BeginFin: ${mod.translations?.en?.title || ''}`);
                        setCourseworkDesc(mod.translations?.en?.description || '');
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-500 outline-none text-slate-900"
                  >
                    <option value="">Custom Coursework Assignment</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.translations?.en?.title || m.id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Assignment Title</label>
                  <input
                    type="text"
                    value={courseworkTitle}
                    onChange={(e) => setCourseworkTitle(e.target.value)}
                    placeholder="e.g. Budgeting Essentials Certification"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-indigo-500 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Instructions / Description</label>
                  <textarea
                    rows={3}
                    value={courseworkDesc}
                    onChange={(e) => setCourseworkDesc(e.target.value)}
                    placeholder="Instructions for students in Google Classroom..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-500 outline-none text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Max Points</label>
                    <input
                      type="number"
                      value={courseworkPoints}
                      onChange={(e) => setCourseworkPoints(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-indigo-500 outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={courseworkDueDate}
                      onChange={(e) => setCourseworkDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:border-indigo-500 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setCourseworkClass(null)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmPublishCoursework(courseworkClass)}
                    disabled={!courseworkTitle.trim() || isSubmittingClassroom}
                    className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Publish Assignment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Announcement Modal */}
      <AnimatePresence>
        {announcementClass && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Broadcast Classroom Announcement</h3>
                    <p className="text-xs text-slate-500 font-medium">To {announcementClass.className} Stream</p>
                  </div>
                </div>
                <button
                  onClick={() => setAnnouncementClass(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Announcement Message</label>
                  <textarea
                    rows={4}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Write your announcement message for Google Classroom students..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-indigo-500 outline-none text-slate-900"
                  />
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                  <p className="text-xs text-indigo-900 font-medium">
                    A direct link to BeginFin <span className="font-bold">({window.location.origin})</span> will be attached automatically to this announcement post.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setAnnouncementClass(null)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmPublishAnnouncement(announcementClass)}
                    disabled={!announcementText.trim() || isSubmittingClassroom}
                    className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Post to Stream
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Roster Sync Modal */}
      <AnimatePresence>
        {rosterSyncClass && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Google Classroom Roster</h3>
                    <p className="text-xs text-slate-500 font-medium">Enrolled Students in {rosterSyncClass.linkedCourseName || rosterSyncClass.className}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRosterSyncClass(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {classRosterPreview.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-medium">
                  No students currently enrolled in this Google Classroom course.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {classRosterPreview.map((s, idx) => (
                    <div key={s.userId || idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {s.profile?.name?.givenName?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{s.profile?.name?.fullName || 'Google Classroom Student'}</p>
                        <p className="text-xs text-slate-500">{s.profile?.emailAddress || 'No email shared'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {rosterSyncSuccess && (
                <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rosterSyncSuccess}</span>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500 font-medium">
                  {classRosterPreview.length} student{classRosterPreview.length === 1 ? '' : 's'} found
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setRosterSyncClass(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-slate-600 hover:text-slate-800 font-bold rounded-xl text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddRosterToBeginFin}
                    disabled={isAddingRosterToBeginFin || classRosterPreview.length === 0}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#7F7FFA] hover:bg-[#6868EB] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {isAddingRosterToBeginFin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" /> Add Roster to BeginFin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Student Roster Modal */}
      <AnimatePresence>
        {manualRosterClass && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#7F7FFA]">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Class Roster</h3>
                    <p className="text-xs text-slate-500 font-medium">Auto-enroll students in {manualRosterClass.className}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setManualRosterClass(null);
                    setManualRosterFeedback(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter student email addresses (separated by commas or new lines). When these students sign in to BeginFin for the first time, they will be <strong>automatically enrolled</strong> into <strong>{manualRosterClass.className}</strong> and receive a welcome notification.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Student Emails
                  </label>
                  <textarea
                    rows={5}
                    value={manualRosterText}
                    onChange={(e) => setManualRosterText(e.target.value)}
                    placeholder="student1@school.edu&#10;student2@school.edu&#10;student3@school.edu"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7F7FFA]"
                  />
                </div>

                {manualRosterFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${manualRosterFeedback.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {manualRosterFeedback}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setManualRosterClass(null);
                      setManualRosterFeedback(null);
                    }}
                    className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-bold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveManualRoster}
                    disabled={manualRosterSaving}
                    className="px-6 py-2.5 bg-[#7F7FFA] hover:bg-[#6868EB] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
                  >
                    {manualRosterSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Save Roster
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mandatory User Confirmation Dialog for Workspace Mutations */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {pendingConfirmation && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600" />
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                  <Send className="w-8 h-8" />
                </div>
                <div className="text-center mb-2">
                  {pendingConfirmation.badgeText && (
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full inline-block mb-2">
                      {pendingConfirmation.badgeText}
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{pendingConfirmation.title}</h3>
                </div>
                <p className="text-slate-600 text-center font-medium text-sm mb-8 leading-relaxed">
                  {pendingConfirmation.message}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setPendingConfirmation(null)}
                    disabled={isSubmittingClassroom}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => pendingConfirmation.onConfirm()}
                    disabled={isSubmittingClassroom}
                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingClassroom ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Publish'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {deletingClassId && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500" />
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-600">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tight">Delete Class?</h3>
                <p className="text-slate-500 text-center font-medium mb-6">
                  This will permanently delete the class and remove all students. This action cannot be undone.
                </p>

                <div className="space-y-3 mb-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">
                    Type <span className="text-rose-600 font-black">DELETE</span> to confirm
                  </label>
                  <input 
                    type="text" 
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-center focus:border-rose-500 focus:bg-white outline-none transition-all text-slate-900"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setDeletingClassId(null); setDeleteConfirmationText(''); }}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeleteClass(deletingClassId!)}
                    disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                    className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Class'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Off-screen report container for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {reportData && (
          <ClassReportPDF 
            className={reportData.className}
            students={reportData.students}
            modules={modules}
          />
        )}
      </div>
      {/* Hidden Certificate Component for PDF Generation */}
      {isGeneratingCertificate && (
        <div className="fixed left-[-9999px] top-0">
          <div 
            id="student-certificate-pdf" 
            className="w-[816px] h-[1056px] relative overflow-hidden flex flex-col justify-between select-none"
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

            {/* Certificate Content */}
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
                  {isGeneratingCertificate.displayName || "BeginFin Scholar"}
                </div>

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
                <div className="w-full flex items-end justify-center gap-12 sm:gap-16 px-4 mb-7">
                  {/* Left: Vishnu Kakarla */}
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

                  {/* Right: Kruz Smith */}
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

                {/* About BeginFin - Centered and brought inward */}
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
      )}
    </div>
  );
};
