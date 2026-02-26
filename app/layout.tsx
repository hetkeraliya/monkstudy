"use client";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#384D48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Monk OS",
  description: "JEE Advanced Execution System",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#E2E2E2] pb-32 antialiased`}>
        {isAuthPage ? (
          // Auth pages: no navbar, no guard
          children
        ) : (
          // Protected pages
          <AuthGuard>
            {children}
            <Navbar />
          </AuthGuard>
        )}
      </body>
    </html>
  );
}
