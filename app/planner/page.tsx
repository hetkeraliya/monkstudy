"use client";

import { motion } from "framer-motion";
import { Clock, School, Coffee, BookOpen, Moon, Edit3 } from "lucide-react";
import { vibrate } from "../lib/db";

const PLANNER_BLOCKS = [
  { id: "morning", time: "05:00 - 07:00", label: "Morning Ritual", icon: Coffee, activity: "Formula Revision & Prep" },
  { id: "school", time: "07:00 - 17:00", label: "School Hours", icon: School, activity: "Regular Classes & Lab" },
  { id: "evening", time: "17:30 - 20:30", label: "JEE Intensive", icon: BookOpen, activity: "Physics & Chemistry Problem Solving" },
  { id: "night", time: "21:00 - 23:00", label: "Review & Mock", icon: Moon, activity: "Maths PYQs & Error Analysis" },
];

export default function DailyPlanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-6 pb-24"
    >
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-monk-textMain tracking-tight">Daily Plan</h1>
          <p className="text-sm text-monk-muted font-medium">Consistent daily rhythm.</p>
        </div>
        <button onClick={() => vibrate(30)} className="text-monk-muted p-2">
          <Edit3 size={20} />
        </button>
      </header>

      {/* Timeline Layout */}
      <div className="relative space-y-4 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-monk-sand/40">
        {PLANNER_BLOCKS.map((block) => (
          <div key={block.id} className="relative pl-12">
            {/* Timeline Dot/Icon */}
            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-monk-card border-2 border-monk-bg flex items-center justify-center z-10 shadow-sm">
              <block.icon size={18} className="text-monk-olive" />
            </div>

            <div className="matte-card p-4 transition-transform active:scale-[0.99]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-monk-muted uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> {block.time}
                </span>
                <span className="bg-monk-bg px-2 py-0.5 rounded text-[10px] font-bold text-monk-dark uppercase">
                  {block.id}
                </span>
              </div>
              <h3 className="font-bold text-monk-textMain mt-1">{block.label}</h3>
              <p className="text-sm text-monk-muted mt-2 leading-relaxed">
                {block.activity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

