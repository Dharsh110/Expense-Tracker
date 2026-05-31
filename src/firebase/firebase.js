import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBctGvvogOMF-ttAs9Nrx0GUfY6FRSVrsM",
  authDomain: "expense-tracker-app-1863c.firebaseapp.com",
  projectId: "expense-tracker-app-1863c",
  storageBucket: "expense-tracker-app-1863c.firebasestorage.app",
  messagingSenderId: "956274287707",
  appId: "1:956274287707:web:79d532621fee3d50110b7e"
};


const app = initializeApp(firebaseConfig);

// AUTH
const auth = getAuth(app);

// GOOGLE PROVIDER
const googleProvider =
  new GoogleAuthProvider();

// FIRESTORE DATABASE
const db = getFirestore(app);

export {
  auth,
  googleProvider,
  db
};

export const storage = getStorage(app);