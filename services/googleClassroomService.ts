import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, getRedirectResult, User } from 'firebase/auth';

// Google Classroom API Scopes
export const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.announcements',
];

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;

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
  // Retrieve in-memory cached token
  getAccessToken: (): string | null => {
    return cachedAccessToken;
  },

  // Set cached token manually if obtained through another auth flow
  setAccessToken: (token: string | null) => {
    cachedAccessToken = token;
  },

  // Clear in-memory token on logout
  clearAccessToken: () => {
    cachedAccessToken = null;
  },

  // Connect Google Classroom via Popup flow
  connectGoogleClassroom: async (): Promise<{ user: User; accessToken: string }> => {
    const provider = new GoogleAuthProvider();
    CLASSROOM_SCOPES.forEach((scope) => provider.addScope(scope));

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to obtain Google Classroom access token.');
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('Error connecting Google Classroom:', error);
      throw error;
    }
  },

  // Fetch active courses taught by current teacher
  fetchCourses: async (tokenOverride?: string): Promise<ClassroomCourse[]> => {
    const token = tokenOverride || cachedAccessToken;
    if (!token) {
      throw new Error('Google Classroom authentication required. Please connect your Google account.');
    }

    const response = await fetch('https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Google Classroom courses (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.courses || [];
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
