import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use currentUser directly if already authenticated
    if (auth.currentUser) {
      loadProfile();
    } else {
      // Only set up listener if not already authenticated
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          loadProfile();
        } else {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loadProfile = async () => {
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, 'profiles', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // Create default profile
        const defaultProfile = {
          bankBalance: 0,
          stocksValue: 0,
          cryptoValue: 0,
          creditCardDue: 0,
          monthlySalary: 0,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, 'profiles', auth.currentUser.uid);
      await updateDoc(docRef, updates);
      setProfile(prev => ({ ...prev, ...updates }));
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    }
  };

  return { profile, loading, error, updateProfile, refreshProfile: loadProfile };
};
