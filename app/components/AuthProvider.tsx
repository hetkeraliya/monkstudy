"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore"; // Changed from useAuthStore to useStore

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use the main useStore for auth actions
  const setAuthUser = useStore((state) => state.setAuthUser);
  const setAuthLoading = useStore((state) => state.setAuthLoading);

  useEffect(() => {
    // Listen for the Firebase Auth state change
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user data to our store's FirebaseUser interface
        setAuthUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        // User is logged out
        setAuthUser(null);
      }
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setAuthUser, setAuthLoading]);

  return <>{children}</>;
}
