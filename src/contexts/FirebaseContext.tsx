import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  isPro: boolean;
  isGuest: boolean;
  guestId: string;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const getGuestId = () => {
  let gid = localStorage.getItem('nextos_guest_id');
  if (!gid) {
    gid = `guest_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('nextos_guest_id', gid);
  }
  return gid;
};

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPro] = useState(true);
  const [loading, setLoading] = useState(true);
  const [guestId] = useState(getGuestId());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile to Firestore but ignore isPro status
        const userRef = doc(db, 'users', user.uid);
        
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: Date.now(),
              isPro: true, // Always pro
            }, { merge: true });
          }
        } catch (err) {
          console.warn('User profile sync failed:', err);
          // We still set the user so they can use the app
        }

        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure we use popup for better iframe compatibility
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login Error details:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups for this workspace.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error(`Domain "${window.location.hostname}" is not authorized. Add it in Firebase Console > Auth > Settings.`);
      } else if (error.code === 'auth/popup-closed-by-user') {
        return; // Silent fail if user closed it
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email Login Error:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      // Update Auth Profile
      await updateProfile(user, { displayName: name });
      
      // Create Firestore Profile
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: name,
        email: user.email,
        photoURL: null,
        createdAt: Date.now(),
        isPro: true,
      });

      // Force refresh auth state
      await user.reload();
      setUser(auth.currentUser);
    } catch (error: any) {
      console.error('Registration Error:', error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, data);
    
    // Update local state by forcing a refresh or manual update
    setUser({ ...auth.currentUser });

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: Date.now(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithEmail,
      registerWithEmail,
      logout, 
      updateUserProfile, 
      isPro, 
      isGuest: !user, 
      guestId 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
