"use client";

import { usePathname } from 'next/navigation';
// ... your other imports (like Home, User icons, etc.)


  // If we are on the login page, render absolutely nothing.

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckSquare, Calendar, LineChart } from 'lucide-react';
 
export default function Navbar() {
  const pathname = usePathname();   
  if (pathname === '/login') {
    return null; 
  }

  // Otherwise, render the normal Navbar
  return (
    <nav className="fixed bottom-0 w-full bg-[#FFFFFF] border-t border-[#E2E2E2] pb-safe pt-2 px-6 flex justify-between items-center z-50">
      {/* Your Navbar buttons go here */}
      <p>Test Navbar</p>
    </nav>
  );
}


const vibrate = (ms: number) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const navItems = [
  { name: 'Core', path: '/', icon: Target },
  { name: 'Missions', path: '/tasks', icon: CheckSquare },
  { name: 'Planner', path: '/planner', icon: Calendar },
  { name: 'Intel', path: '/analysis', icon: LineChart },
];

export default function Navbar() {
  const pathname = usePathname();
  const activeIndex = navItems.findIndex(item => item.path === pathname);

  return (
    <div className="fixed bottom-0 left-0 w-full h-28 pointer-events-none z-[999] flex justify-center drop-shadow-2xl">
      <div className="relative w-full max-w-md h-full">
        
        {/* LAYER 0: Distant Background Peaks (Solid #6E7271 for maximum visibility) */}
        <div className="absolute bottom-0 left-[-5%] w-[35%] h-[75%] bg-[#6E7271]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        <div className="absolute bottom-0 left-[25%] w-[45%] h-[85%] bg-[#6E7271]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        <div className="absolute bottom-0 right-[-5%] w-[40%] h-[70%] bg-[#6E7271]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />

        {/* LAYER 1: The Sliding Active Peak (Olive #ACAD94) */}
        {activeIndex !== -1 && (
          <motion.div
            className="absolute bottom-0 w-[25%] h-[95%] bg-[#ACAD94]"
            style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            animate={{ left: `${activeIndex * 25}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}

        {/* LAYER 2: Foreground Mountain Ridge (Dark Green #384D48) */}
        <div 
          className="absolute bottom-0 w-full h-[65%] bg-[#384D48]"
          style={{ 
            clipPath: 'polygon(0% 55%, 12.5% 20%, 25% 45%, 37.5% 15%, 50% 50%, 62.5% 10%, 75% 40%, 87.5% 25%, 100% 60%, 100% 100%, 0% 100%)' 
          }} 
        />
        
        <div className="absolute bottom-0 w-full h-4 bg-[#384D48]" />

        {/* LAYER 3: The Icons and Labels */}
        <div className="absolute bottom-0 w-full h-full flex">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => vibrate(20)}
                className="relative w-1/4 h-full flex flex-col justify-end items-center pb-4 pointer-events-auto"
              >
                <motion.div 
                  animate={{ y: isActive ? -36 : 0 }}
                  className="flex flex-col items-center"
                >
                  <div className={`p-2 rounded-full ${isActive ? 'bg-[#384D48]/20 backdrop-blur-sm' : ''}`}>
                    <Icon 
                      size={isActive ? 24 : 20} 
                      className={isActive ? 'text-[#384D48]' : 'text-[#E2E2E2] opacity-80 hover:opacity-100'} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 26 }} 
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute text-[8px] font-black text-[#E2E2E2] uppercase tracking-[0.1em]"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
