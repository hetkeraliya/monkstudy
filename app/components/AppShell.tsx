"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import AuthGuard from "./AuthGuard";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      {children}
      <Navbar />
    </AuthGuard>
  );
}
