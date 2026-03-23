import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc, where, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const useExpenses = (limitCount = 100) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadExpenses();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [limitCount]);

  const loadExpenses = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const expensesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesList);
    } catch (err) {
      setError(err.message);
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    if (!auth.currentUser) return;

    try {
      const expense = {
        ...expenseData,
        userId: auth.currentUser.uid,
        date: expenseData.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'expenses'), expense);
      setExpenses(prev => [{ id: docRef.id, ...expense }, ...prev]);
      return { id: docRef.id, ...expense };
    } catch (err) {
      setError(err.message);
      console.error('Error adding expense:', err);
      throw err;
    }
  };

  const updateExpense = async (expenseId, updates) => {
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, 'expenses', expenseId);
      await updateDoc(docRef, updates);
      setExpenses(prev => prev.map(exp =>
        exp.id === expenseId ? { ...exp, ...updates } : exp
      ));
    } catch (err) {
      setError(err.message);
      console.error('Error updating expense:', err);
      throw err;
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting expense:', err);
      throw err;
    }
  };

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, refreshExpenses: loadExpenses };
};
