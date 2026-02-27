"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E2E2E2]">
        <div className="text-sm text-[#6E7271]">Checking session...</div>
      </div>
    );
  }

  return <>{children}</>;
}
