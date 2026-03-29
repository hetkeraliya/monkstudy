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
  { name: "Core",     path: "/",         icon: Target      },
  { name: "Missions", path: "/tasks",    icon: CheckSquare },
  { name: "Flash",    path: "/revision", icon: Brain       },
  { name: "Palace",   path: "/palace",   icon: Map         },
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
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/focus" ||
    isFullscreen
  ) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999]">
      {/* Thin top border */}
      <div className="h-px bg-[#D8D4D5]" />

      {/* Nav bar */}
      <div className="bg-white flex items-stretch h-16 px-1 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => vibrate(15)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-1 w-1 h-1 rounded-full bg-[#384D48]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? "text-[#384D48]" : "text-[#9AA09E]"}
                />
              </motion.div>

              {/* Label */}
              <span
                className="text-[9px] font-bold leading-none"
                style={{ color: isActive ? "#384D48" : "#9AA09E" }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
