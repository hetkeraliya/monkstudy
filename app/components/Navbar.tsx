"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckSquare, Brain, Leaf, LineChart, Map } from "lucide-react";

const vibrate = (ms: number) => {
  if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
};

// 6 tabs — map replaces Intel, Intel moves to analysis still accessible
const navItems = [
  { name: "Core",    path: "/",         icon: Target      },
  { name: "Missions",path: "/tasks",    icon: CheckSquare },
  { name: "Flash",   path: "/revision", icon: Brain       },
  { name: "Palace",  path: "/palace",   icon: Map         },
  { name: "Garden",  path: "/zen",      icon: Leaf        },
  { name: "Intel",   path: "/analysis", icon: LineChart   },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  if (
    pathname === "/login" || pathname === "/register" ||
    pathname === "/focus" || isFullscreen
  ) return null;

  const activeIndex = navItems.findIndex(item => item.path === pathname);
  const tabW = 100 / navItems.length;

  return (
    <div className="fixed bottom-0 left-0 w-full h-28 pointer-events-none z-[999] flex justify-center">
      <div className="relative w-full max-w-[600px] h-full">

        {/* Background Peaks */}
        <div className="absolute bottom-0 left-[-4%] w-[28%] h-[70%] bg-[#6E7271]"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}/>
        <div className="absolute bottom-0 left-[18%] w-[38%] h-[82%] bg-[#6E7271]"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}/>
        <div className="absolute bottom-0 right-[-4%] w-[32%] h-[68%] bg-[#6E7271]"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}/>

        {/* Active Peak */}
        {activeIndex !== -1 && (
          <motion.div
            className="absolute bottom-0 h-[92%] bg-[#ACAD94]"
            style={{
              width: `${tabW}%`,
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            }}
            animate={{ left: `${activeIndex * tabW}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}

        {/* Foreground Ridge */}
        <div className="absolute bottom-0 w-full h-[65%] bg-[#384D48]"
          style={{ clipPath: "polygon(0% 55%, 8% 18%, 17% 44%, 25% 12%, 33% 48%, 42% 8%, 50% 42%, 58% 12%, 67% 44%, 75% 18%, 83% 48%, 92% 15%, 100% 52%, 100% 100%, 0% 100%)" }}/>
        <div className="absolute bottom-0 w-full h-4 bg-[#384D48]"/>

        {/* Icons */}
        <div className="absolute bottom-0 w-full h-full flex">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} onClick={() => vibrate(20)}
                style={{ width: `${tabW}%` }}
                className="relative h-full flex flex-col justify-end items-center pb-4 pointer-events-auto">
                <motion.div animate={{ y: isActive ? -34 : 0 }} className="flex flex-col items-center">
                  <div className={`p-1.5 rounded-full ${isActive ? "bg-[#384D48]/20" : ""}`}>
                    <Icon
                      size={isActive ? 20 : 16}
                      className={isActive ? "text-[#384D48]" : "text-[#E2E2E2] opacity-80"}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 24 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute text-[6px] font-black text-[#E2E2E2] uppercase tracking-[0.08em]"
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
