import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../services/firebase';

const USER_ID = 'user_main';

export const useExpenses = (limitCount = 100) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, [limitCount]);

  const loadExpenses = async () => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', USER_ID),
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
    try {
      const expense = {
        ...expenseData,
        userId: USER_ID,
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

  return { expenses, loading, error, addExpense, deleteExpense, refreshExpenses: loadExpenses };
};
