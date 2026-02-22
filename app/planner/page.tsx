"use client";

import { motion } from "framer-motion";
import { Clock, Book, Coffee, Sunset } from "lucide-react";

export default function Planner() {
  const schedule = [
    { time: "07:00 AM", task: "School Begins", icon: <Clock size={16} />, type: "School" },
    { time: "01:00 PM", task: "Lunch Break", icon: <Coffee size={16} />, type: "Break" },
    { time: "05:00 PM", task: "School Ends", icon: <Sunset size={16} />, type: "School" },
    { time: "06:30 PM", task: "JEE Prep (Block 1)", icon: <Book size={16} />, type: "Study" },
    { time: "09:00 PM", task: "JEE Prep (Block 2)", icon: <Book size={16} />, type: "Study" },
  ];

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Monk Schedule</h1>
      </header>

      <div className="space-y-4">
        {schedule.map((item, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className={`matte-card p-5 flex items-center gap-5 border-l-4 ${item.type === 'Study' ? 'border-monk-olive bg-monk-olive/5' : 'border-monk-sand'}`}
          >
            <div className="text-monk-muted">{item.icon}</div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-monk-muted mb-1">{item.time}</p>
              <h3 className="text-sm font-bold text-monk-dark">{item.task}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
