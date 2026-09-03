
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithCredential, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, sendPasswordResetEmail } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDoc, setDoc, onSnapshot, getDocFromServer, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfigJson from './firebase-applet-config.json';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (firebaseConfigJson as any).firestoreDatabaseId || 'ai-studio-815a8484-ccb3-4aa6-90b6-77fad11b53ba'
};

// Initialize Firebase SDK
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Ensure Firestore is initialized with long-polling to work reliably in sandboxed iframe previews and proxies
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: false,
  }, firebaseConfig.firestoreDatabaseId || "(default)");
} catch (error) {
  // If already initialized, fetch the existing instance which should already have been configured
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
}

export const db = dbInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithCredential, signOut, onAuthStateChanged, doc, getDoc, setDoc, onSnapshot, getDocFromServer, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, writeBatch, serverTimestamp, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, sendPasswordResetEmail };
export type { User, ConfirmationResult };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  // Log operational diagnostics without exposing student/user PII (emails, names)
  console.error(`[Firestore Operation Failed] Type: ${operationType}, Path: ${path || 'unknown'}, Error: ${errMessage}`);
  throw new Error(`Firestore operation failed: ${errMessage}`);
}

