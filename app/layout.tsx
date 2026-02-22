import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, CheckSquare, BarChart2, Calendar, User } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Monk OS",
  description: "Elite JEE Preparation Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-monk-bg text-monk-textMain pb-24`}>
        <main className="max-w-md mx-auto min-h-screen p-4">
          {children}
        </main>
        
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-monk-sand flex justify-around items-center py-4 pb-8 z-50">
          <Link href="/" className="flex flex-col items-center gap-1 text-monk-muted">
            <Home size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tasks" className="flex flex-col items-center gap-1 text-monk-muted">
            <CheckSquare size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Tasks</span>
          </Link>
          <Link href="/analysis" className="flex flex-col items-center gap-1 text-monk-muted">
            <BarChart2 size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Stats</span>
          </Link>
          <Link href="/planner" className="flex flex-col items-center gap-1 text-monk-muted">
            <Calendar size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Plan</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-monk-muted">
            <User size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
