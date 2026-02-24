import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar"; // Imports cleanly from the same folder

const inter = Inter({ subsets: ["latin"] });

// Locks zoom scaling for native PWA feel
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Monk OS",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#E2E2E2] pb-32 antialiased selection:bg-[#ACAD94] selection:text-[#384D48]`}>
        {children}
        
        {/* The Mountain Range Nav overlays the entire app */}
        <Navbar />
      </body>
    </html>
  );
}
