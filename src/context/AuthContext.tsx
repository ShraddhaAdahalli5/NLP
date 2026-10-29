import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, getUserProfile, saveUserProfile } from '../lib/firebase';
import { UserProfileData } from '../types/sentiment';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserBio: (data: Partial<UserProfileData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let profile = await getUserProfile(currentUser.uid);
        if (!profile) {
          profile = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || (currentUser.isAnonymous ? 'Guest Researcher' : 'User'),
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous,
            collegeName: 'AI & Data Science Engineering Dept',
            projectRole: 'NLP Student Researcher',
            bio: 'Conducting sentiment classification on Romanized Indic code-switched texts.',
            createdAt: Date.now(),
          };
          await saveUserProfile(profile);
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const profile: UserProfileData = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || 'Google User',
        photoURL: cred.user.photoURL,
        isAnonymous: false,
        collegeName: 'AI & Data Science Lab',
        projectRole: 'Research Evaluator',
        bio: 'Indian Multilingual Code-Mixed NLP Analysis Specialist',
        createdAt: Date.now(),
      };
      await saveUserProfile(profile);
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await getUserProfile(cred.user.uid);
    if (profile) setUserProfile(profile);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    const profile: UserProfileData = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name || 'NLP Researcher',
      photoURL: null,
      isAnonymous: false,
      collegeName: 'AI & Machine Learning Engineering Dept',
      projectRole: 'Lead NLP Investigator',
      bio: 'Sentiment classification for Kannada, Hindi, Tamil, Telugu & Indic code-switching.',
      createdAt: Date.now(),
    };
    await saveUserProfile(profile);
    setUserProfile(profile);
  };

  const signInAsGuest = async () => {
    try {
      const cred = await signInAnonymously(auth);
      const profile: UserProfileData = {
        uid: cred.user.uid,
        email: 'guest.researcher@academic.demo',
        displayName: 'Guest Researcher',
        photoURL: null,
        isAnonymous: true,
        collegeName: 'Demonstration & Testing Lab',
        projectRole: 'Guest Evaluator',
        bio: 'Evaluating code-mixed sentiment analysis accuracy and token metrics.',
        createdAt: Date.now(),
      };
      await saveUserProfile(profile);
      setUserProfile(profile);
    } catch (err) {
      console.warn('Anonymous auth fallback:', err);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserBio = async (data: Partial<UserProfileData>) => {
    if (!user || !userProfile) return;
    const updated: UserProfileData = {
      ...userProfile,
      ...data,
    };
    await saveUserProfile(updated);
    setUserProfile(updated);
    if (data.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        resetPassword,
        updateUserBio,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
