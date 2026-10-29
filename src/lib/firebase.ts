import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { SentimentAnalysisResult, UserProfileData } from '../types/sentiment';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use named database if specified in config, otherwise default
export const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Local Storage Fallback Keys
const LOCAL_STORAGE_KEY = 'codemixed_sentiment_analyses_v1';
const LOCAL_PROFILE_KEY = 'codemixed_user_profile_v1';

// Save analysis result to Firestore (and local backup)
export async function saveAnalysisResult(
  result: SentimentAnalysisResult,
  user?: User | null
): Promise<void> {
  const userId = user?.uid || 'guest_user';
  const record: SentimentAnalysisResult = {
    ...result,
    userId,
  };

  // 1. Update Local Storage for offline/speed
  try {
    const existing = getLocalAnalyses(userId);
    const updated = [record, ...existing.filter((item) => item.id !== record.id)].slice(0, 200);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('Local storage write warning:', err);
  }

  // 2. Persist to Firestore if user is authenticated
  if (user && !user.isAnonymous) {
    try {
      const docRef = doc(db, 'analyses', result.id);
      await setDoc(docRef, {
        ...record,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.warn('Firestore save warning, retained in local storage:', error);
    }
  }
}

// Fetch all analyses for a user
export async function getUserAnalyses(userId: string): Promise<SentimentAnalysisResult[]> {
  const localList = getLocalAnalyses(userId);

  if (!userId || userId === 'guest_user') {
    return localList;
  }

  try {
    const analysesRef = collection(db, 'analyses');
    const q = query(
      analysesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    const firestoreList: SentimentAnalysisResult[] = [];
    snapshot.forEach((docSnap) => {
      firestoreList.push(docSnap.data() as SentimentAnalysisResult);
    });

    if (firestoreList.length > 0) {
      // Merge and update local cache
      const mergedMap = new Map<string, SentimentAnalysisResult>();
      [...firestoreList, ...localList].forEach((item) => mergedMap.set(item.id, item));
      const merged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.warn('Firestore fetch fallback to local storage:', error);
  }

  return localList;
}

// Delete a single analysis record
export async function deleteAnalysisRecord(id: string, userId: string): Promise<void> {
  // Delete from local storage
  const existing = getLocalAnalyses(userId);
  const updated = existing.filter((item) => item.id !== id);
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updated));

  // Delete from Firestore
  if (userId && userId !== 'guest_user') {
    try {
      const docRef = doc(db, 'analyses', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore delete warning:', err);
    }
  }
}

// Clear all analyses for a user
export async function clearAllAnalyses(userId: string): Promise<void> {
  localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${userId}`);

  if (userId && userId !== 'guest_user') {
    try {
      const analysesRef = collection(db, 'analyses');
      const q = query(analysesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore clear batch error:', err);
    }
  }
}

// Local storage helper
export function getLocalAnalyses(userId: string = 'guest_user'): SentimentAnalysisResult[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) as SentimentAnalysisResult[];
  } catch {
    return [];
  }
}

// User Profile Firestore Sync
export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  try {
    localStorage.setItem(`${LOCAL_PROFILE_KEY}_${profile.uid}`, JSON.stringify(profile));
    if (profile.uid && !profile.isAnonymous) {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, profile, { merge: true });
    }
  } catch (err) {
    console.warn('Profile save warning:', err);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    if (userId && userId !== 'guest_user') {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfileData;
      }
    }
    const local = localStorage.getItem(`${LOCAL_PROFILE_KEY}_${userId}`);
    return local ? JSON.parse(local) : null;
  } catch {
    return null;
  }
}
