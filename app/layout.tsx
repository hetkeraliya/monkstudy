// ... (existing imports)
import { Home, CheckSquare, Calendar, User, BarChart2 } from "lucide-react";

// ... (viewport and metadata)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="pb-24 bg-monk-bg">
        <main className="max-w-md mx-auto min-h-screen p-4">
          {children}
        </main>
        
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-monk-card border-t border-monk-sand flex justify-around items-center px-2 py-4 pb-6 z-50">
          <Link href="/" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <Home size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/tasks" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <CheckSquare size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Tasks</span>
          </Link>
          {/* New Analysis Link */}
          <Link href="/analysis" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <BarChart2 size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Stats</span>
          </Link>
          <Link href="/planner" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <Calendar size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Plan</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-monk-muted hover:text-monk-dark transition-colors">
            <User size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
