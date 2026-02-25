import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDEnnyYFOO7-P4Ttun9WXqJ8zLyNFZvdBk",
  authDomain: "monkstudy-5afa6.firebaseapp.com",
  projectId: "monkstudy-5afa6",
  storageBucket: "monkstudy-5afa6.firebasestorage.app",
  messagingSenderId: "536207834104",
  appId: "1:536207834104:web:442b7a40ee4bcc40c6740d",
  measurementId: "G-P7XMJDNNP1"
};

// 1. Initialize Firebase safely for Next.js 
// (Prevents Vercel build crashes during server-side rendering)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Authentication Services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Forces the account selection screen to appear during testing
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 3. Initialize Analytics safely (Only runs in the browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, analytics };
