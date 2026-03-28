"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckSquare, Brain, Leaf, LineChart } from "lucide-react";

const vibrate = (ms: number) => {
  if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
};

const navItems = [
  { name: "Core",     path: "/",         icon: Target      },
  { name: "Missions", path: "/tasks",    icon: CheckSquare },
  { name: "Flash",    path: "/revision", icon: Brain       },
  { name: "Garden",   path: "/zen",      icon: Leaf        },
  { name: "Intel",    path: "/analysis", icon: LineChart   },
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

  return (
    <div className="fixed bottom-0 left-0 w-full h-28 pointer-events-none z-[999] flex justify-center">
      <div className="relative w-full max-w-[600px] h-full">

        <div className="absolute bottom-0 left-[-5%] w-[30%] h-[75%] bg-[#6E7271]"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}/>
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[85%] bg-[#6E7271]"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}/>
        <div className="absolute bottom-0 right-[-5%] w-[35%] h-[70%] bg-[#6E7271]"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}/>

        {activeIndex !== -1 && (
          <motion.div
            className="absolute bottom-0 w-[20%] h-[95%] bg-[#ACAD94]"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
            animate={{ left: `${activeIndex * 20}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}/>
        )}

        <div className="absolute bottom-0 w-full h-[65%] bg-[#384D48]"
          style={{ clipPath: "polygon(0% 55%, 10% 20%, 20% 45%, 30% 15%, 40% 50%, 50% 10%, 60% 40%, 70% 25%, 80% 45%, 90% 20%, 100% 55%, 100% 100%, 0% 100%)" }}/>
        <div className="absolute bottom-0 w-full h-4 bg-[#384D48]"/>

        <div className="absolute bottom-0 w-full h-full flex">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} onClick={() => vibrate(20)}
                className="relative w-1/5 h-full flex flex-col justify-end items-center pb-4 pointer-events-auto">
                <motion.div animate={{ y: isActive ? -36 : 0 }} className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${isActive ? "bg-[#384D48]/20" : ""}`}>
                    <Icon size={isActive ? 22 : 18}
                      className={isActive ? "text-[#384D48]" : "text-[#E2E2E2] opacity-80"}
                      strokeWidth={isActive ? 2.5 : 2}/>
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 26 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute text-[7px] font-black text-[#E2E2E2] uppercase tracking-[0.1em]">
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
