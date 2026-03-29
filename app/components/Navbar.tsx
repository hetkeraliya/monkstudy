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
  const pathname    = usePathname();
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
    /* Fixed bottom bar — white, thin top border */
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-[#E8E8E8]">
      {/* Scrollable pill row — same as Telegram filter tabs */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => vibrate(15)}
              className="flex-shrink-0"
            >
              <motion.div
                animate={{
                  backgroundColor: isActive ? "#384D48" : "#F0F0F0",
                }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full"
                style={{ minWidth: 0 }}
              >
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  color={isActive ? "#ffffff" : "#6E7271"}
                />
                <span
                  className="text-[11px] font-bold whitespace-nowrap leading-none"
                  style={{ color: isActive ? "#ffffff" : "#6E7271" }}
                >
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
