import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#384D48", // Makes your Honor 8X status bar match the app
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents web-browser zooming
};

export const metadata: Metadata = {
  title: "Monk OS",
  description: "JEE Advanced Preparation System",
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
      <body className={`${inter.className} bg-[#E2E2E2] antialiased selection:bg-[#ACAD94] selection:text-[#384D48]`}>
        {children}
      </body>
    </html>
  );
}
