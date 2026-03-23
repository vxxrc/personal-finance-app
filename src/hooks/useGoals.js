import { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, updateDoc, doc, where, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use currentUser directly if already authenticated
    if (auth.currentUser) {
      loadGoals();
    } else {
      // Only set up listener if not already authenticated
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          loadGoals();
        } else {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loadGoals = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const goalsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(goalsList);
    } catch (err) {
      setError(err.message);
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goalData) => {
    if (!auth.currentUser) return;

    try {
      const goal = {
        ...goalData,
        userId: auth.currentUser.uid,
        currentAmount: goalData.currentAmount || 0,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'goals'), goal);
      setGoals(prev => [...prev, { id: docRef.id, ...goal }]);
      return { id: docRef.id, ...goal };
    } catch (err) {
      setError(err.message);
      console.error('Error adding goal:', err);
      throw err;
    }
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const docRef = doc(db, 'goals', goalId);
      await updateDoc(docRef, updates);
      setGoals(prev => prev.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));
    } catch (err) {
      setError(err.message);
      console.error('Error updating goal:', err);
      throw err;
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting goal:', err);
      throw err;
    }
  };

  return { goals, loading, error, addGoal, updateGoal, deleteGoal, refreshGoals: loadGoals };
};
