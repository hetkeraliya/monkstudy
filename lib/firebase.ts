import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAMIpQpdtzEDbXMIxjRAwxRbJ0ucrq75ZQ",
  authDomain: "monkstudy.firebaseapp.com",
  projectId: "monkstudy",
  storageBucket: "monkstudy.firebasestorage.app",
  messagingSenderId: "980151116450",
  appId: "1:980151116450:web:caef6c5ca9232dc40badfb",
  measurementId: "G-Z7GYV4LEKD"
};

// 1. Initialize Firebase safely for Next.js 
// (This prevents the "Firebase App already exists" error on Vercel)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Authentication Services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 3. Initialize Analytics safely (Only runs in the browser, not on the server)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, analytics };
