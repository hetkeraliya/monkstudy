"use client";

import { motion } from "framer-motion";
import { Clock, Book, Coffee, Sunset } from "lucide-react";

export default function Planner() {
  const schedule = [
    { time: "07:00 AM", task: "School Start", icon: <Clock size={16} />, type: "School" },
    { time: "01:00 PM", task: "Lunch Break", icon: <Coffee size={16} />, type: "Break" },
    { time: "05:00 PM", task: "School End", icon: <Sunset size={16} />, type: "School" },
    { time: "06:30 PM", task: "JEE Deep Work 1", icon: <Book size={16} />, type: "Study" },
    { time: "09:00 PM", task: "JEE Deep Work 2", icon: <Book size={16} />, type: "Study" },
  ];

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Monk Schedule</h1>
        <p className="text-[10px] text-monk-muted font-bold uppercase tracking-widest">Rigid Routine</p>
      </header>

      <div className="space-y-4">
        {schedule.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`matte-card p-5 flex items-center gap-5 ${
              item.type === 'Study' ? 'bg-monk-olive/5 border-l-4 border-monk-olive' : 'border-l-4 border-monk-sand'
            }`}
          >
            <div className="text-monk-muted">{item.icon}</div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-monk-muted leading-none mb-1">{item.time}</p>
              <h3 className="text-sm font-bold text-monk-dark">{item.task}</h3>
            </div>
            {item.type === 'Study' && (
              <span className="bg-monk-olive text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Priority</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
