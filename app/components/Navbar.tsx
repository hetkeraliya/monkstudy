"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckSquare, Brain, Map, Leaf, LineChart } from "lucide-react";

const vibrate = (ms: number) => {
  if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
};

const navItems = [
  { path: "/",         icon: Target,      label: "Focus"    },
  { path: "/tasks",    icon: CheckSquare, label: "Tasks"    },
  { path: "/revision", icon: Brain,       label: "Revise"   },
  { path: "/palace",   icon: Map,         label: "Palace"   },
  { path: "/zen",      icon: Leaf,        label: "Zen"      },
  { path: "/analysis", icon: LineChart,   label: "Stats"    },
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
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/focus" ||
    isFullscreen
  ) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-[999] flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        aria-label="Main navigation"
        className="flex items-center gap-1 p-1.5 rounded-full border border-white/60"
        style={{
          backgroundColor: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 8px 32px rgba(56,77,72,0.22), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              onClick={() => vibrate(15)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="relative"
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                className="relative flex items-center justify-center h-11 rounded-full px-2.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: "#384D48",
                      boxShadow:
                        "0 4px 14px rgba(56,77,72,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    color={isActive ? "#ffffff" : "#8A918E"}
                  />
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden whitespace-nowrap text-[12px] font-semibold tracking-wide text-white"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
