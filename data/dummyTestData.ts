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

export const DUMMY_CREDENTIALS = {
  email: 'test@test.com',
  password: 'testtest8',
  uid: 'dummy-test-user-id',
  displayName: 'Test User',
};

export const INITIAL_DUMMY_MODULES = ['m1', 'm2', 'm3'];

export const DEFAULT_DUMMY_CLASSES: DummyClass[] = [
  {
    id: 'dummy-class-2nd-period',
    className: '2nd Period',
    joinCode: 'BF2NDP',
    teacherId: DUMMY_CREDENTIALS.uid,
    isFullScreenLockEnabled: false,
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'dummy-class-3rd-period',
    className: '3rd Period',
    joinCode: 'BF3RDP',
    teacherId: DUMMY_CREDENTIALS.uid,
    isFullScreenLockEnabled: false,
    createdAt: '2026-09-01T09:00:00.000Z',
  },
];

export const DEFAULT_DUMMY_STUDENTS: DummyStudent[] = [
  // 2nd Period (13 students)
  {
    uid: 's-2p-01',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    completedModules: ['m1', 'm2', 'm3'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-02',
    displayName: 'Jane Doe',
    email: 'jane.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5'],
    creditScoreMaster: true,
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-03',
    displayName: 'Alex Doe',
    email: 'alex.doe@example.com',
    completedModules: ['m1', 'm2'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-04',
    displayName: 'Emily Doe',
    email: 'emily.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-05',
    displayName: 'Michael Doe',
    email: 'michael.doe@example.com',
    completedModules: ['m1'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-06',
    displayName: 'Sarah Doe',
    email: 'sarah.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
    creditScoreMaster: true,
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-07',
    displayName: 'David Doe',
    email: 'david.doe@example.com',
    completedModules: ['m1', 'm2', 'm3'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-08',
    displayName: 'Emma Doe',
    email: 'emma.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-09',
    displayName: 'James Doe',
    email: 'james.doe@example.com',
    completedModules: ['m1', 'm2'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-10',
    displayName: 'Olivia Doe',
    email: 'olivia.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    creditScoreMaster: true,
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-11',
    displayName: 'Daniel Doe',
    email: 'daniel.doe@example.com',
    completedModules: ['m1', 'm2', 'm3'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-12',
    displayName: 'Sophia Doe',
    email: 'sophia.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-2p-13',
    displayName: 'Lucas Doe',
    email: 'lucas.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5'],
    classId: 'dummy-class-2nd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },

  // 3rd Period (12 students)
  {
    uid: 's-3p-01',
    displayName: 'Ava Doe',
    email: 'ava.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-02',
    displayName: 'Ethan Doe',
    email: 'ethan.doe@example.com',
    completedModules: ['m1', 'm2'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-03',
    displayName: 'Mia Doe',
    email: 'mia.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
    creditScoreMaster: true,
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-04',
    displayName: 'Noah Doe',
    email: 'noah.doe@example.com',
    completedModules: ['m1', 'm2', 'm3'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-05',
    displayName: 'Isabella Doe',
    email: 'isabella.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-06',
    displayName: 'Liam Doe',
    email: 'liam.doe@example.com',
    completedModules: ['m1'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-07',
    displayName: 'Charlotte Doe',
    email: 'charlotte.doe@example.com',
    completedModules: ['m1', 'm2', 'm3'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-08',
    displayName: 'Benjamin Doe',
    email: 'benjamin.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-09',
    displayName: 'Harper Doe',
    email: 'harper.doe@example.com',
    completedModules: ['m1', 'm2'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-10',
    displayName: 'Mason Doe',
    email: 'mason.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-11',
    displayName: 'Evelyn Doe',
    email: 'evelyn.doe@example.com',
    completedModules: ['m1', 'm2', 'm3'],
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
  {
    uid: 's-3p-12',
    displayName: 'Elijah Doe',
    email: 'elijah.doe@example.com',
    completedModules: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
    creditScoreMaster: true,
    classId: 'dummy-class-3rd-period',
    teacherId: DUMMY_CREDENTIALS.uid,
  },
];

export const DEFAULT_DUMMY_ALERTS: DummyAlert[] = [
  {
    id: 'alert-1',
    classId: 'dummy-class-2nd-period',
    className: '2nd Period',
    userId: 's-2p-02',
    userName: 'Jane Doe',
    type: 'unit_completion',
    moduleTitle: 'Credit & Debt Management',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    message: 'completed unit: Credit & Debt Management',
  },
  {
    id: 'alert-2',
    classId: 'dummy-class-2nd-period',
    className: '2nd Period',
    userId: 's-2p-01',
    userName: 'John Doe',
    type: 'unit_completion',
    moduleTitle: 'Bank Accounts & Savings',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    message: 'completed unit: Bank Accounts & Savings',
  },
  {
    id: 'alert-3',
    classId: 'dummy-class-3rd-period',
    className: '3rd Period',
    userId: 's-3p-03',
    userName: 'Mia Doe',
    type: 'unit_completion',
    moduleTitle: 'Insurance & Risk',
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
    message: 'completed unit: Insurance & Risk',
  },
];

export function createDummyUser(): any {
  return {
    uid: DUMMY_CREDENTIALS.uid,
    email: DUMMY_CREDENTIALS.email,
    displayName: DUMMY_CREDENTIALS.displayName,
    emailVerified: true,
    isAnonymous: false,
    isDummy: true,
    providerData: [
      {
        providerId: 'password',
        uid: DUMMY_CREDENTIALS.email,
        displayName: DUMMY_CREDENTIALS.displayName,
        email: DUMMY_CREDENTIALS.email,
        phoneNumber: null,
        photoURL: null,
      },
    ],
    getIdToken: async () => 'dummy-mock-token-beginfin',
    reload: async () => {},
  };
}

export function isDummyUser(user: any): boolean {
  if (!user) return false;
  return (
    user.isDummy === true ||
    user.email?.toLowerCase().trim() === DUMMY_CREDENTIALS.email ||
    user.uid === DUMMY_CREDENTIALS.uid
  );
}

export function isDummyCredential(email: string, pass: string): boolean {
  return (
    email.toLowerCase().trim() === DUMMY_CREDENTIALS.email &&
    pass === DUMMY_CREDENTIALS.password
  );
}

export function loadDummyProgress(): string[] {
  try {
    const raw = localStorage.getItem('beginfin-dummy-progress');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read dummy progress from localStorage', e);
  }
  // Initialize with the first 3 modules marked as "done"
  try {
    localStorage.setItem('beginfin-dummy-progress', JSON.stringify(INITIAL_DUMMY_MODULES));
  } catch (e) {}
  return [...INITIAL_DUMMY_MODULES];
}

export function saveDummyProgress(modules: string[]): void {
  try {
    localStorage.setItem('beginfin-dummy-progress', JSON.stringify(modules));
  } catch (e) {
    console.warn('Could not save dummy progress to localStorage', e);
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
    console.warn('Could not read dummy classes from localStorage', e);
  }
  try {
    localStorage.setItem('beginfin-dummy-classes', JSON.stringify(DEFAULT_DUMMY_CLASSES));
  } catch (e) {}
  return [...DEFAULT_DUMMY_CLASSES];
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all student last names are Doe
        const normalized = parsed.map((s: DummyStudent) => {
          const parts = (s.displayName || '').trim().split(/\s+/);
          const firstName = parts[0] || 'Student';
          return {
            ...s,
            displayName: `${firstName} Doe`,
            email: `${firstName.toLowerCase()}.doe@example.com`,
          };
        });
        return normalized;
      }
    }
  } catch (e) {
    console.warn('Could not read dummy students from localStorage', e);
  }
  try {
    localStorage.setItem('beginfin-dummy-students', JSON.stringify(DEFAULT_DUMMY_STUDENTS));
  } catch (e) {}
  return [...DEFAULT_DUMMY_STUDENTS];
}

export function saveDummyStudents(students: DummyStudent[]): void {
  try {
    localStorage.setItem('beginfin-dummy-students', JSON.stringify(students));
  } catch (e) {}
}

export function loadDummyAlerts(): DummyAlert[] {
  return [...DEFAULT_DUMMY_ALERTS];
}
