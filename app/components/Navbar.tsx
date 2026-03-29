"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, CheckSquare, Brain, Map, Leaf, LineChart } from "lucide-react";

const vibrate = (ms: number) => {
  if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
};

const navItems = [
  { path: "/",         icon: Target      },
  { path: "/tasks",    icon: CheckSquare },
  { path: "/revision", icon: Brain       },
  { path: "/palace",   icon: Map         },
  { path: "/zen",      icon: Leaf        },
  { path: "/analysis", icon: LineChart   },
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
    /* Floating pill container — lifted off the bottom like the screenshot */
    <div className="fixed bottom-4 left-0 right-0 z-[999] flex justify-center px-5">
      <div
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-full shadow-lg"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 24px rgba(56,77,72,0.18), 0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        {navItems.map(({ path, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <Link key={path} href={path} onClick={() => vibrate(15)}>
              <motion.div
                animate={{
                  backgroundColor: isActive ? "#384D48" : "transparent",
                }}
                transition={{ duration: 0.18 }}
                className="w-11 h-11 rounded-full flex items-center justify-center"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? "#ffffff" : "#9AA09E"}
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
