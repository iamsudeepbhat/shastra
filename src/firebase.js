import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFDsFnePjyF1JiV1g-BkJ3tIZqj3EgGoM",
  authDomain: "shastra-pkg.firebaseapp.com",
  projectId: "shastra-pkg",
  storageBucket: "shastra-pkg.firebasestorage.app",
  messagingSenderId: "621614660372",
  appId: "1:621614660372:web:370ca5cf4722a0fce1e001",
  measurementId: "G-L1VP8YD2PG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
