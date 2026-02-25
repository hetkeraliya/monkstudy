import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#E2E2E2] pb-32 antialiased`}>
        <AuthGuard>
          {children}
          {/* We assume Navbar contains logic to hide itself on the /login route */}
          <Navbar />
        </AuthGuard>
      </body>
    </html>
  );
}
