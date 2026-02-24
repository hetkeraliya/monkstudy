"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Target, CheckSquare, Calendar, LineChart } from 'lucide-react';
import { vibrate } from '../../lib/db'; // Adjust path if your db is elsewhere

const navItems = [
  { name: 'Core', path: '/', icon: Target },
  { name: 'Missions', path: '/tasks', icon: CheckSquare },
  { name: 'Planner', path: '/planner', icon: Calendar },
  { name: 'Intel', path: '/analysis', icon: LineChart },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-md">
      {/* Floating Mountain Base */}
      <div className="bg-[#384D48] rounded-[32px] px-6 py-4 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(56,77,72,0.6)] relative overflow-visible">
        
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path} 
              href={item.path} 
              onClick={() => vibrate(20)} 
              className="relative z-10 flex flex-col items-center justify-center w-12 h-12"
            >
              {/* Sliding Mountain Peak */}
              {isActive && (
                <motion.div
                  layoutId="mountain-peak"
                  className="absolute -top-4 w-11 h-11 bg-[#ACAD94] rounded-xl rotate-45 shadow-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              
              {/* Icon */}
              <Icon
                size={22}
                className={`relative z-20 transition-all duration-300 ${
                  isActive ? 'text-[#384D48] -translate-y-3' : 'text-[#6E7271] hover:text-[#D8D4D5]'
                }`}
              />
              
              {/* Label below active peak */}
              <AnimatePresence>
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-1 text-[8px] font-black text-[#E2E2E2] uppercase tracking-[0.2em] z-20"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
