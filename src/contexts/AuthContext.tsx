"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'recruiter' | 'interviewee';
  company?: string;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: 'recruiter' | 'interviewee', company?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function signIn(email: string, password: string) {
    try {
      console.log('AuthContext: Starting sign in process for:', email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Firebase auth successful, user ID:', result.user.uid);
      
      // Fetch user profile from Firestore and update local state immediately
      console.log('AuthContext: Fetching user profile from Firestore...');
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        console.log('AuthContext: User profile found:', profileData);
        setUserProfile(profileData);
        console.log('AuthContext: Local state updated with user profile');
      } else {
        console.warn('AuthContext: User profile not found in Firestore for:', result.user.uid);
        // Try to create a basic profile if it doesn't exist
        const basicProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || 'User',
          role: 'interviewee', // Default role
          createdAt: new Date()
        };
        console.log('AuthContext: Creating basic profile:', basicProfile);
        setUserProfile(basicProfile);
        
        // Save to Firestore
        try {
          await setDoc(doc(db, 'users', result.user.uid), basicProfile);
          console.log('AuthContext: Basic profile saved to Firestore');
        } catch (saveError) {
          console.error('AuthContext: Error saving basic profile:', saveError);
        }
      }
      
      console.log('AuthContext: Sign in process completed successfully');
      
    } catch (error) {
      console.error('AuthContext: Sign in error:', error);
      throw error;
    }
  }

  async function signUp(email: string, password: string, displayName: string, role: 'recruiter' | 'interviewee', company?: string) {
    try {
      console.log('Starting signup process...');
      console.log('Creating user with email and password...');

      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', result.user.uid);

      // Update display name
      console.log('Updating display name...');
      await updateProfile(result.user, { displayName });
      console.log('Display name updated successfully');

      // Create user profile in Firestore - only include company if it's provided
      const userProfileData: any = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName,
        role,
        createdAt: new Date()
      };

      // Only add company field if it's provided (for recruiters)
      if (company && company.trim()) {
        userProfileData.company = company;
        console.log('Company field added:', company);
      } else {
        console.log('No company field added (interviewee or empty company)');
      }

      console.log('Profile data to save:', userProfileData);
      console.log('Saving to Firestore...');

      // Set the user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), userProfileData);
      console.log('Profile saved to Firestore successfully');

      // Create the local profile object
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName,
        role,
        company: company || undefined,
        createdAt: new Date()
      };

      // Update local state immediately
      console.log('Updating local state...');
      setUserProfile(userProfile);
      console.log('Local state updated successfully');

      // Wait a moment for Firestore to sync and then verify
      console.log('Waiting for Firestore sync...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify the profile was created by trying to fetch it
      try {
        const verifyDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (verifyDoc.exists()) {
          console.log('Profile verification successful - profile exists in Firestore');
        } else {
          console.warn('Profile verification failed - profile not found in Firestore');
        }
      } catch (verifyError) {
        console.warn('Profile verification error:', verifyError);
      }
      
      console.log('Signup process completed successfully');

    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Auth state changed:', user ? `User ID: ${user.uid}` : 'No user');
      setCurrentUser(user);

      if (user) {
        // Fetch user profile from Firestore
        try {
          console.log('AuthContext: Fetching user profile for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            console.log('AuthContext: User profile found:', profileData);
            setUserProfile(profileData);
          } else {
            console.log('AuthContext: User profile not found in Firestore for:', user.uid);
            // Don't set userProfile to null immediately, give it a moment
            setTimeout(async () => {
              try {
                const retryDoc = await getDoc(doc(db, 'users', user.uid));
                if (retryDoc.exists()) {
                  const retryProfileData = retryDoc.data() as UserProfile;
                  console.log('AuthContext: User profile found on retry:', retryProfileData);
                  setUserProfile(retryProfileData);
                } else {
                  console.log('AuthContext: User profile still not found after retry');
                  setUserProfile(null);
                }
              } catch (retryError) {
                console.error('AuthContext: Retry error:', retryError);
                setUserProfile(null);
              }
            }, 1000);
          }
        } catch (error: any) {
          console.error('AuthContext: Error fetching user profile:', error);
          // If we get an offline error, try to use the local profile if available
          if (error && typeof error === 'object' && 'code' in error && error.code === 'failed-precondition') {
            console.log('AuthContext: Firestore offline, using local profile if available');
            // Don't set userProfile to null here, keep the existing one
          } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('offline')) {
            console.log('AuthContext: Firestore offline, using local profile if available');
            // Don't set userProfile to null here, keep the existing one
          } else {
            // For other errors, wait a bit and retry
            setTimeout(async () => {
              try {
                const retryDoc = await getDoc(doc(db, 'users', user.uid));
                if (retryDoc.exists()) {
                  const retryProfileData = retryDoc.data() as UserProfile;
                  console.log('AuthContext: User profile found on retry after error:', retryProfileData);
                  setUserProfile(retryProfileData);
                } else {
                  console.log('AuthContext: User profile not found after error retry');
                  setUserProfile(null);
                }
              } catch (retryError) {
                console.error('AuthContext: Retry error after initial error:', retryError);
                setUserProfile(null);
              }
            }, 2000);
          }
        }
      } else {
        console.log('AuthContext: No user, clearing user profile');
        setUserProfile(null);
      }

      console.log('AuthContext: Setting loading to false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
