"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthGuard({ children }: any) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicRoutes = ["/login", "/register"];

    if (!user && !publicRoutes.includes(pathname)) {
      router.replace("/login");
    }
  }, [user, pathname, router]);

  return children;
}
