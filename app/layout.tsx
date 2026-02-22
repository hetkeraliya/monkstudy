import "./globals.css";
import { Inter } from "next/font/google";
import { Home, CheckSquare, Calendar, User } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata = {
  title: "Study Monk",
  description: "Matte minimal focus environment",
  manifest: "/manifest.json",
  themeColor: "#E2E2E2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="pb-24">
        <main className="max-w-md mx-auto min-h-screen p-4">
          {children}
        </main>
        
        {/* Solid Matte Bottom Navbar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-monk-card border-t border-monk-sand flex justify-around items-center px-2 py-4 pb-6 z-50">
          <Link href="/" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <Home size={22} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </Link>
          <Link href="/tasks" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <CheckSquare size={22} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Tasks</span>
          </Link>
          <Link href="/planner" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <Calendar size={22} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Plan</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <User size={22} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
