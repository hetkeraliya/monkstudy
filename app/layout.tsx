import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monk OS",
  description: "JEE Advanced Execution System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#384D48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#E2E2E2] antialiased min-h-screen`}
      >
        <AuthGuard>
          <div className="max-w-[600px] mx-auto min-h-screen relative">
            {children}

            {/* Bottom Navbar */}
            <Navbar />
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
