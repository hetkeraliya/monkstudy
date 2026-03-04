import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";
import AuthProvider from "./components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monk OS",
  description: "JEE Advanced Execution System",
};

export const viewport: Viewport = {
  themeColor: "#384D48",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#E2E2E2] min-h-screen`}>
        <AuthProvider>
          <AuthGuard>
            {children}
            <Navbar />
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
