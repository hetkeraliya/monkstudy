"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Book, Coffee, Sunset, Pencil, X, Plus, Save } from "lucide-react";
import { vibrate } from "../../lib/db";

interface ScheduleItem {
  id: string;
  time: string;
  task: string;
  type: 'School' | 'Study' | 'Break';
}

export default function Planner() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: '1', time: "07:00", task: "School Begins", type: "School" },
    { id: '2', time: "13:00", task: "Lunch Break", type: "Break" },
    { id: '3', time: "17:00", task: "School Ends", type: "School" },
    { id: '4', time: "18:30", task: "JEE Prep (Block 1)", type: "Study" },
    { id: '5', time: "21:00", task: "JEE Prep (Block 2)", type: "Study" },
  ]);

  // Day Progress Logic (7 AM to 5 PM)
  const progress = useMemo(() => {
    if (!mounted) return 0;
    const now = new Date();
    const start = new Date(); start.setHours(7, 0, 0);
    const end = new Date(); end.setHours(17, 0, 0);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const current = now.getTime() - start.getTime();
    return Math.round((current / total) * 100);
  }, [mounted]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Monk Schedule</h1>
          <p className="text-[10px] text-monk-muted font-bold uppercase tracking-widest">Rigid Routine</p>
        </div>
        <button 
          onClick={() => { vibrate(30); setIsEditing(!isEditing); }}
          className={`p-3 rounded-2xl transition-all ${isEditing ? 'bg-monk-dark text-white' : 'bg-white shadow-matte text-monk-muted'}`}
        >
          {isEditing ? <X size={20} /> : <Pencil size={20} />}
        </button>
      </header>

      {/* Day Progress Bar */}
      <section className="matte-card p-5 space-y-3 shadow-matte">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">School Day Progress</span>
          <span className="text-xs font-black text-monk-olive">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-monk-bg rounded-full overflow-hidden p-0.5 border border-monk-sand/20">
          <motion.div 
            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            className="h-full bg-monk-olive rounded-full shadow-sm shadow-monk-olive/40"
          />
        </div>
      </section>

      {/* Editable List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {schedule.sort((a,b) => a.time.localeCompare(b.time)).map((item, i) => (
            <motion.div 
              key={item.id} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`matte-card p-5 flex items-center gap-5 border-l-4 ${item.type === 'Study' ? 'border-monk-olive bg-monk-olive/5' : 'border-monk-sand'}`}
            >
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-monk-muted mb-1">{item.time}</p>
                <h3 className="text-sm font-bold text-monk-dark">{item.task}</h3>
              </div>
              {isEditing && (
                <button 
                  onClick={() => { vibrate(50); setSchedule(schedule.filter(s => s.id !== item.id)); }}
                  className="p-2 text-red-400"
                >
                  <X size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isEditing && (
          <button 
            onClick={() => {
              const newTask: ScheduleItem = { id: Date.now().toString(), time: "00:00", task: "New Block", type: "Study" };
              setSchedule([...schedule, newTask]);
            }}
            className="w-full p-4 border-2 border-dashed border-monk-sand rounded-3xl text-[10px] font-bold text-monk-muted uppercase flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Schedule Block
          </button>
        )}
      </div>
    </div>
  );
}
