import { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, updateDoc, doc, where, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const USER_ID = 'user_main';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', USER_ID)
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
    try {
      const goal = {
        ...goalData,
        userId: USER_ID,
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
