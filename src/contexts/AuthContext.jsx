import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numbersHidden, setNumbersHidden] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  const hideNumbers = () => {
    setNumbersHidden(true);
  };

  const verifyPasswordAndShow = async (password) => {
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }

    try {
      // Re-authenticate user with password
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // If successful, show numbers
      setNumbersHidden(false);
      return true;
    } catch (error) {
      throw new Error('Incorrect password');
    }
  };

  const value = {
    user,
    signup,
    login,
    logout,
    loading,
    numbersHidden,
    hideNumbers,
    verifyPasswordAndShow
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
