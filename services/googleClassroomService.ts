import { auth, GoogleAuthProvider, signInWithCredential, signInWithPopup, User } from '../firebase';
import { GOOGLE_CLIENT_ID } from './googleAuthService';

// Google Classroom API Scopes
export const CLASSROOM_READ_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
];

export const CLASSROOM_WRITE_SCOPES = [
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.announcements',
];

export const CLASSROOM_SCOPES = [
  ...CLASSROOM_READ_SCOPES,
  ...CLASSROOM_WRITE_SCOPES
];

// Token and session storage keys
const TOKEN_STORAGE_KEY = 'beginfin_classroom_access_token';
const EXPIRY_STORAGE_KEY = 'beginfin_classroom_token_expiry';
const EMAIL_STORAGE_KEY = 'beginfin_classroom_user_email';
const COURSES_STORAGE_KEY = 'beginfin_classroom_courses_cache';

// In-memory token cache with short expiration TTL (45 minutes)
let cachedAccessToken: string | null = null;
let cachedTokenExpiresAt: number = 0;
const TOKEN_CACHE_TTL_MS = 45 * 60 * 1000; // 45 minutes lifetime

// Initialize from storage if available
if (typeof window !== 'undefined') {
  try {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedExpiry = sessionStorage.getItem(EXPIRY_STORAGE_KEY) || localStorage.getItem(EXPIRY_STORAGE_KEY);
    if (storedToken && storedExpiry) {
      const exp = parseInt(storedExpiry, 10);
      if (exp > Date.now()) {
        cachedAccessToken = storedToken;
        cachedTokenExpiresAt = exp;
      }
    }
  } catch (e) {
    console.warn('Could not initialize Google Classroom token from storage:', e);
  }
}

/**
 * Request OAuth token using Google Identity Services (GIS) Token Client
 * This avoids iframe SSO redirects and popup hanging issues.
 */
export function requestClassroomToken(scopes: string[], prompt: string = 'consent select_account'): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Check if GIS oauth2 is available on window
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        let isSettled = false;
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: scopes.join(' '),
          callback: (response: any) => {
            if (isSettled) return;
            if (response.error) {
              isSettled = true;
              if (response.error === 'popup_closed_by_user' || response.error === 'access_denied') {
                const err: any = new Error('Google Classroom connection was cancelled.');
                err.code = 'auth/popup-closed-by-user';
                return reject(err);
              }
              return reject(new Error(response.error_description || response.error));
            }
            if (response.access_token) {
              isSettled = true;
              return resolve(response.access_token);
            }
            isSettled = true;
            reject(new Error('No access token received from Google Classroom authorization.'));
          },
          error_callback: (err: any) => {
            if (isSettled) return;
            isSettled = true;
            reject(new Error(err?.message || 'Google authorization prompt was closed.'));
          }
        });

        client.requestAccessToken({ prompt });
        return;
      } catch (gisErr) {
        console.warn('GIS Token client error, falling back to Firebase popup:', gisErr);
      }
    }

    // 2. Fallback to Firebase signInWithPopup if GIS is not available
    const provider = new GoogleAuthProvider();
    scopes.forEach((scope) => provider.addScope(scope));
    provider.setCustomParameters({ prompt });
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          resolve(credential.accessToken);
        } else {
          reject(new Error('Failed to obtain Google Classroom access token.'));
        }
      })
      .catch(reject);
  });
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  alternateLink?: string;
  courseState?: string;
}

export interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile?: {
    name?: {
      fullName?: string;
      givenName?: string;
      familyName?: string;
    };
    emailAddress?: string;
    photoUrl?: string;
  };
}

export interface CourseWorkPayload {
  title: string;
  description: string;
  maxPoints?: number;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  linkUrl?: string;
}

export interface AnnouncementPayload {
  text: string;
  linkUrl?: string;
}

export const googleClassroomService = {
  // Retrieve cached token (from memory or storage, valid for up to 45 minutes)
  getAccessToken: (): string | null => {
    if (cachedAccessToken && Date.now() > cachedTokenExpiresAt) {
      googleClassroomService.clearAccessToken();
      return null;
    }
    if (!cachedAccessToken && typeof window !== 'undefined') {
      try {
        const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedExpiry = sessionStorage.getItem(EXPIRY_STORAGE_KEY) || localStorage.getItem(EXPIRY_STORAGE_KEY);
        if (storedToken && storedExpiry) {
          const exp = parseInt(storedExpiry, 10);
          if (exp > Date.now()) {
            cachedAccessToken = storedToken;
            cachedTokenExpiresAt = exp;
          } else {
            googleClassroomService.clearAccessToken();
          }
        }
      } catch (e) {
        console.warn('Could not read cached token:', e);
      }
    }
    return cachedAccessToken;
  },

  // Set cached token manually if obtained through another auth flow
  setAccessToken: (token: string | null, ttlMs: number = TOKEN_CACHE_TTL_MS) => {
    cachedAccessToken = token;
    cachedTokenExpiresAt = token ? Date.now() + ttlMs : 0;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
          sessionStorage.setItem(EXPIRY_STORAGE_KEY, String(cachedTokenExpiresAt));
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
          localStorage.setItem(EXPIRY_STORAGE_KEY, String(cachedTokenExpiresAt));
        } else {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          sessionStorage.removeItem(EXPIRY_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(EXPIRY_STORAGE_KEY);
        }
      } catch (e) {
        console.warn('Storage write error for token:', e);
      }
    }
  },

  // Get cached user email
  getCachedEmail: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(EMAIL_STORAGE_KEY) || localStorage.getItem(EMAIL_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  setCachedEmail: (email: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (email) {
        sessionStorage.setItem(EMAIL_STORAGE_KEY, email);
        localStorage.setItem(EMAIL_STORAGE_KEY, email);
      } else {
        sessionStorage.removeItem(EMAIL_STORAGE_KEY);
        localStorage.removeItem(EMAIL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Storage write error for email:', e);
    }
  },

  // Get cached courses
  getCachedCourses: (): ClassroomCourse[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(COURSES_STORAGE_KEY) || sessionStorage.getItem(COURSES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setCachedCourses: (courses: ClassroomCourse[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
      sessionStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.warn('Storage write error for courses:', e);
    }
  },

  // Clear in-memory and stored token on logout
  clearAccessToken: () => {
    cachedAccessToken = null;
    cachedTokenExpiresAt = 0;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(EXPIRY_STORAGE_KEY);
        sessionStorage.removeItem(EMAIL_STORAGE_KEY);
        sessionStorage.removeItem(COURSES_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(EXPIRY_STORAGE_KEY);
        localStorage.removeItem(EMAIL_STORAGE_KEY);
        localStorage.removeItem(COURSES_STORAGE_KEY);
      } catch (e) {
        console.warn('Storage clear error:', e);
      }
    }
  },

  // Connect Google Classroom via GIS Token Client requesting READ scopes
  connectGoogleClassroom: async (): Promise<{ user: User; accessToken: string }> => {
    const scopesToRequest = [
      'openid',
      'email',
      'profile',
      ...CLASSROOM_READ_SCOPES
    ];

    try {
      const accessToken = await requestClassroomToken(scopesToRequest, 'consent select_account');
      googleClassroomService.setAccessToken(accessToken);

      // Link or authenticate with Firebase Auth
      let currentUser = auth.currentUser;
      try {
        const credential = GoogleAuthProvider.credential(null, accessToken);
        if (!currentUser) {
          const result = await signInWithCredential(auth, credential);
          currentUser = result.user;
        }
      } catch (authErr) {
        console.warn('Firebase credential association note:', authErr);
      }

      // If still missing user details, fetch from Google OAuth2 userinfo endpoint
      if (!currentUser || !currentUser.email) {
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userinfoRes.ok) {
            const data = await userinfoRes.json();
            currentUser = {
              uid: currentUser?.uid || data.sub || 'google-classroom-teacher',
              email: data.email || currentUser?.email || '',
              displayName: data.name || currentUser?.displayName || 'Educator',
              photoURL: data.picture || currentUser?.photoURL || '',
            } as User;
          }
        } catch (infoErr) {
          console.warn('Failed to fetch userinfo:', infoErr);
        }
      }

      if (currentUser?.email) {
        googleClassroomService.setCachedEmail(currentUser.email);
      }

      return {
        user: currentUser || ({ email: 'Connected' } as User),
        accessToken,
      };
    } catch (error: any) {
      console.error('Error connecting Google Classroom:', error);
      throw error;
    }
  },

  // Incremental authorization for write scopes (coursework / announcements)
  requestWriteAccess: async (): Promise<string> => {
    try {
      const accessToken = await requestClassroomToken(CLASSROOM_WRITE_SCOPES, 'consent');
      googleClassroomService.setAccessToken(accessToken);
      return accessToken;
    } catch (error: any) {
      console.error('Error requesting Google Classroom write scopes:', error);
      throw error;
    }
  },

  // Fetch active courses taught by current teacher
  fetchCourses: async (tokenOverride?: string): Promise<ClassroomCourse[]> => {
    const token = tokenOverride || googleClassroomService.getAccessToken();
    if (!token) {
      // If token not present, try returning cached courses if available
      const cached = googleClassroomService.getCachedCourses();
      if (cached && cached.length > 0) return cached;
      throw new Error('Google Classroom authentication required. Please connect your Google account.');
    }

    try {
      const response = await fetch('https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        // If expired or auth error, fall back to cached courses
        const cached = googleClassroomService.getCachedCourses();
        if (cached && cached.length > 0) return cached;
        throw new Error(err.error?.message || `Failed to fetch Google Classroom courses (HTTP ${response.status})`);
      }

      const data = await response.json();
      const courses: ClassroomCourse[] = data.courses || [];
      googleClassroomService.setCachedCourses(courses);
      return courses;
    } catch (fetchErr: any) {
      const cached = googleClassroomService.getCachedCourses();
      if (cached && cached.length > 0) return cached;
      throw fetchErr;
    }
  },

  // Fetch student roster for a specific course
  fetchCourseRoster: async (courseId: string, tokenOverride?: string): Promise<ClassroomStudent[]> => {
    const token = tokenOverride || cachedAccessToken;
    if (!token) {
      throw new Error('Google Classroom authentication required.');
    }

    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch course roster (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.students || [];
  },

  // Create an assignment / coursework item in Google Classroom
  createCourseWork: async (
    courseId: string,
    payload: CourseWorkPayload,
    tokenOverride?: string
  ): Promise<any> => {
    const token = tokenOverride || cachedAccessToken;
    if (!token) {
      throw new Error('Google Classroom authentication required.');
    }

    const body: any = {
      title: payload.title,
      description: payload.description,
      state: 'PUBLISHED',
      workType: 'ASSIGNMENT',
      maxPoints: payload.maxPoints ?? 100,
    };

    if (payload.dueDate) {
      body.dueDate = payload.dueDate;
      body.dueTime = payload.dueTime || { hours: 23, minutes: 59, seconds: 0 };
    } else if (payload.dueTime) {
      body.dueTime = payload.dueTime;
    }

    if (payload.linkUrl) {
      body.materials = [
        {
          link: {
            url: payload.linkUrl,
            title: payload.title,
          },
        },
      ];
    }

    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to publish coursework to Google Classroom (HTTP ${response.status})`);
    }

    return await response.json();
  },

  // Create an announcement in Google Classroom
  createAnnouncement: async (
    courseId: string,
    payload: AnnouncementPayload,
    tokenOverride?: string
  ): Promise<any> => {
    const token = tokenOverride || cachedAccessToken;
    if (!token) {
      throw new Error('Google Classroom authentication required.');
    }

    const body: any = {
      text: payload.text,
      state: 'PUBLISHED',
    };

    if (payload.linkUrl) {
      body.materials = [
        {
          link: {
            url: payload.linkUrl,
            title: 'BeginFin Financial Literacy Platform',
          },
        },
      ];
    }

    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to post announcement to Google Classroom (HTTP ${response.status})`);
    }

    return await response.json();
  },

  // Fetch coursework items for a course
  fetchCourseWorkList: async (courseId: string, tokenOverride?: string): Promise<any[]> => {
    const token = tokenOverride || cachedAccessToken;
    if (!token) {
      throw new Error('Google Classroom authentication required.');
    }

    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch coursework list (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.courseWork || [];
  },

  // Fetch student submissions for a coursework item
  fetchStudentSubmissions: async (courseId: string, courseWorkId: string, tokenOverride?: string): Promise<any[]> => {
    const token = tokenOverride || cachedAccessToken;
    if (!token) {
      throw new Error('Google Classroom authentication required.');
    }

    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch student submissions (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.studentSubmissions || [];
  },

  // Patch a student's submission grade in Google Classroom
  patchStudentGrade: async (
    courseId: string,
    courseWorkId: string,
    submissionId: string,
    assignedGrade: number,
    tokenOverride?: string
  ): Promise<any> => {
    const token = tokenOverride || cachedAccessToken;
    if (!token) {
      throw new Error('Google Classroom authentication required.');
    }

    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}?updateMask=assignedGrade,draftGrade`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedGrade,
          draftGrade: assignedGrade,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update student grade (HTTP ${response.status})`);
    }

    return await response.json();
  },
};
