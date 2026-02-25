"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuthUser = useStore((state) => state.setAuthUser);
  const setAuthLoading = useStore((state) => state.setAuthLoading);

  useEffect(() => {
    // Failsafe: If Firebase takes longer than 3 seconds, force the loading screen to drop
    const timeout = setTimeout(() => setAuthLoading(false), 3000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timeout); // Clear failsafe if Firebase responds normally
      
      if (firebaseUser) {
        setAuthUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setAuthUser(null);
      }
      setAuthLoading(false); // Turn off the loading spinner
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [setAuthUser, setAuthLoading]);

  return <>{children}</>;
}
