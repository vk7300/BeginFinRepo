export interface DummyStudent {
  uid: string;
  displayName: string;
  email: string;
  completedModules: string[];
  creditScoreMaster?: boolean;
  classId: string;
  teacherId: string;
}

export interface DummyClass {
  id: string;
  className: string;
  joinCode: string;
  teacherId: string;
  linkedCourseId?: string;
  linkedCourseName?: string;
  isFullScreenLockEnabled?: boolean;
  createdAt: string;
}

export interface DummyAlert {
  id: string;
  classId: string;
  className: string;
  userId: string;
  userName: string;
  type: string;
  moduleTitle: string;
  timestamp: any;
  message: string;
}

// Test credentials and example data removed
export const DUMMY_CREDENTIALS = {
  email: '',
  password: '',
  uid: '',
  displayName: '',
};

export const INITIAL_DUMMY_MODULES: string[] = [];

export const DEFAULT_DUMMY_CLASSES: DummyClass[] = [];

export const DEFAULT_DUMMY_STUDENTS: DummyStudent[] = [];

export const DEFAULT_DUMMY_ALERTS: DummyAlert[] = [];

export function createDummyUser(): any {
  return {
    uid: 'anonymous-user',
    displayName: 'BeginFin Learner',
    email: null,
    isAnonymous: true,
    isDummy: false,
    emailVerified: false,
    providerData: [],
    getIdToken: async () => '',
    reload: async () => {},
  };
}

export function isDummyUser(user: any): boolean {
  if (!user) return false;
  return user.isDummy === true;
}

export function isDummyCredential(_email: string, _pass: string): boolean {
  return false;
}

export function loadDummyProgress(): string[] {
  try {
    const raw = localStorage.getItem('beginfin-dummy-progress');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read progress from localStorage', e);
  }
  return [];
}

export function saveDummyProgress(modules: string[]): void {
  try {
    localStorage.setItem('beginfin-dummy-progress', JSON.stringify(modules));
  } catch (e) {
    console.warn('Could not save progress to localStorage', e);
  }
}

export function loadDummyClasses(): DummyClass[] {
  try {
    const raw = localStorage.getItem('beginfin-dummy-classes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read classes from localStorage', e);
  }
  return [];
}

export function saveDummyClasses(classes: DummyClass[]): void {
  try {
    localStorage.setItem('beginfin-dummy-classes', JSON.stringify(classes));
  } catch (e) {}
}

export function loadDummyStudents(): DummyStudent[] {
  try {
    const raw = localStorage.getItem('beginfin-dummy-students');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read students from localStorage', e);
  }
  return [];
}

export function saveDummyStudents(students: DummyStudent[]): void {
  try {
    localStorage.setItem('beginfin-dummy-students', JSON.stringify(students));
  } catch (e) {}
}

export function loadDummyAlerts(): DummyAlert[] {
  return [];
}
