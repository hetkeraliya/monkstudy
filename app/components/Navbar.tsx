"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckSquare, Calendar, LineChart } from 'lucide-react';

// Self-contained haptics
const vibrate = (ms: number) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
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

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-md h-24">
      
      {/* LAYER 0: Distant Background Mountains (Adds depth to the range) */}
      <div className="absolute left-[15%] bottom-5 w-10 h-10 bg-[#6E7271] rounded-lg rotate-45 shadow-sm" />
      <div className="absolute right-[18%] bottom-6 w-12 h-12 bg-[#D8D4D5] rounded-xl rotate-45 shadow-sm opacity-80" />
      <div className="absolute left-[45%] bottom-4 w-8 h-8 bg-[#6E7271] rounded-md rotate-45 shadow-sm opacity-50" />

      {/* LAYER 1: The Interactive Mountain Peaks */}
      <div className="absolute bottom-0 left-0 w-full h-16 flex justify-around items-end px-2 z-10">
        {navItems.map((item, i) => {
          const isActive = pathname === item.path;
          return (
            <div key={`peak-${i}`} className="relative w-16 h-full flex justify-center items-end">
              <motion.div
                className="absolute w-12 h-12 rounded-xl shadow-lg"
                animate={{
                  rotate: 45,
                  // Inactive peaks stick out slightly to form the mountain ridge
                  // Active peak rises high into the sky
                  y: isActive ? -28 : -8, 
                  backgroundColor: isActive ? '#ACAD94' : '#384D48',
                  scale: isActive ? 1.15 : 0.95
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
          );
        })}
      </div>

      {/* LAYER 2: The Mountain Base (Pill) */}
      {/* This covers the bottom halves of the rotated squares, completing the illusion */}
      <div className="absolute bottom-0 w-full h-16 bg-[#384D48] rounded-[32px] shadow-[0_20px_40px_-10px_rgba(56,77,72,0.6)] z-20" />

      {/* LAYER 3: The Foreground Icons & Text */}
      <div className="absolute bottom-0 w-full h-16 flex justify-around items-center px-2 z-30">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              onClick={() => vibrate(20)}
              className="relative w-16 h-full flex flex-col items-center justify-center"
            >
              <motion.div 
                animate={{ y: isActive ? -20 : 0 }} 
                className="flex flex-col items-center"
              >
                {/* Icon changes to Dark Green when on the Olive mountain peak */}
                <Icon 
                  size={22} 
                  className={isActive ? 'text-[#384D48]' : 'text-[#ACAD94] opacity-80'} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                
                {/* Appears in the valley below the active peak */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5, y: -5 }} 
                      animate={{ opacity: 1, scale: 1, y: 2 }} 
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute -bottom-5 text-[8px] font-black text-[#E2E2E2] uppercase tracking-[0.2em] whitespace-nowrap"
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
  );
                }
