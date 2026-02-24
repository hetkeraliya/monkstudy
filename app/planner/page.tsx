"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Save, CheckCircle2, Circle, Plus, Trash2, Clock } from "lucide-react";
import { useStore, ScheduleItem } from "../../store/useStore"; // Updated import
import { vibrate } from "../../lib/db";

export default function Planner() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fixed: using setSchedule instead of updateSchedule to match store.ts
  const { schedule, setSchedule, toggleSchedule, addXp } = useStore();

  useEffect(() => setMounted(true), []);

  // Visualizer Logic: Tracks Checklist Completion
  const progress = useMemo(() => {
    if (!schedule || schedule.length === 0) return 0;
    const completed = schedule.filter((i: ScheduleItem) => i.completed).length;
    return Math.round((completed / schedule.length) * 100);
  }, [schedule]);

  const handleToggle = (id: string, wasCompleted: boolean) => {
    vibrate(20);
    toggleSchedule(id);
    if (!wasCompleted) addXp(20); // Reward 20 XP for finishing a block
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto p-4">
      <header className="pt-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Monk Schedule</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Execution Mode</p>
        </div>
        <button 
          onClick={() => { vibrate(30); setIsEditing(!isEditing); }}
          className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 active:scale-90 transition-all"
        >
          {isEditing ? <Save size={20} className="text-emerald-500" /> : <Pencil size={20} />}
        </button>
      </header>

      {/* Tickeable Progress Visualizer */}
      <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Daily Progress</p>
            <h2 className="text-xl font-black text-slate-800">
              {progress === 100 ? 'Mission Accomplished' : 'System Processing'}
            </h2>
          </div>
          <span className="text-3xl font-black text-emerald-500">{progress}%</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }}
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          />
        </div>
      </section>

      {/* Schedule Feed */}
      <div className="space-y-3">
        {schedule.map((item: ScheduleItem) => (
          <motion.div 
            key={item.id}
            layout
            className={`bg-white p-5 rounded-3xl flex items-center gap-5 transition-all border-l-4 shadow-sm ${
              item.completed ? 'opacity-40 grayscale' : 'opacity-100'
            } ${item.type === 'Study' ? 'border-emerald-500' : 'border-slate-300'}`}
          >
            {!isEditing && (
              <button onClick={() => handleToggle(item.id, item.completed)} className="text-emerald-500 flex-shrink-0">
                {item.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
              </button>
            )}
            
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Clock size={10} /> {item.time}
                </p>
                {item.type === 'Study' && <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">JEE Block</span>}
              </div>
              
              {isEditing ? (
                <div className="flex gap-2 items-center">
                  <input 
                    className="bg-slate-50 p-2 rounded-xl font-bold text-sm w-full outline-none border border-slate-100"
                    value={item.task}
                    onChange={(e) => {
                      const next = schedule.map((s: ScheduleItem) => s.id === item.id ? { ...s, task: e.target.value } : s);
                      setSchedule(next);
                    }}
                  />
                  <button onClick={() => setSchedule(schedule.filter(s => s.id !== item.id))} className="text-red-400 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <h3 className={`text-base font-bold truncate ${item.completed ? 'line-through' : 'text-slate-800'}`}>
                  {item.task}
                </h3>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {isEditing && (
        <button 
          onClick={() => {
            vibrate(30);
            const newItem: ScheduleItem = { id: Date.now().toString(), time: "18:00", task: "New Study Session", type: "Study", completed: false };
            setSchedule([...schedule, newItem]);
          }}
          className="w-full p-5 border-2 border-dashed border-slate-200 rounded-[32px] text-[10px] font-black text-slate-400 uppercase flex items-center justify-center gap-2 active:bg-slate-50 transition-colors"
        >
          <Plus size={16} /> Add Routine Block
        </button>
      )}
    </div>
  );
}
