import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const USER_ID = 'user_main'; // Single user for now

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const docRef = doc(db, 'profiles', USER_ID);
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
    try {
      const docRef = doc(db, 'profiles', USER_ID);
      await updateDoc(docRef, updates);
      setProfile(prev => ({ ...prev, ...updates }));
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    }
  };

  return { profile, loading, error, updateProfile, refreshProfile: loadProfile };
};
