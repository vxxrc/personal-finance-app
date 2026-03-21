import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// These values are safe to expose in client-side code
const firebaseConfig = {
  apiKey: "AIzaSyBg62bcGlGUx5e2SXA8SbWBec5OErEBSrI",
  authDomain: "personal-finance-app-490c6.firebaseapp.com",
  projectId: "personal-finance-app-490c6",
  storageBucket: "personal-finance-app-490c6.firebasestorage.app",
  messagingSenderId: "788323641848",
  appId: "1:788323641848:web:e1cff3538670d62be88e0d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
