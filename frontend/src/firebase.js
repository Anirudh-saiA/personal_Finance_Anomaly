// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// NEW: Import the getFirestore function
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8oIX7REWXdqZwYdOAyU61deEF-CO24PM",
  authDomain: "personal-finance-anomaly.firebaseapp.com",
  projectId: "personal-finance-anomaly",
  storageBucket: "personal-finance-anomaly.firebasestorage.app",
  messagingSenderId: "920239853331",
  appId: "1:920239853331:web:a6bbac647f6cef886d94e6",
  measurementId: "G-N51NXWSQ13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app); // NEW: Initialize and export the database
