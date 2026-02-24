"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Save, CheckCircle2, Circle, Plus, Trash2, Clock, Zap, Coffee, Book, Heart, Star } from "lucide-react";
import { useStore, ScheduleItem } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Planner() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { schedule, setSchedule, toggleSchedule, addXp } = useStore();

  useEffect(() => setMounted(true), []);

  const progress = useMemo(() => {
    if (!schedule || schedule.length === 0) return 0;
    const completed = schedule.filter((i: ScheduleItem) => i.completed).length;
    return Math.round((completed / schedule.length) * 100);
  }, [schedule]);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'JEE': return <Zap size={12} className="text-[#384D48]" />;
      case 'Break': return <Coffee size={12} className="text-[#6E7271]" />;
      case 'Study': return <Book size={12} className="text-[#ACAD94]" />;
      case 'Habit': return <Heart size={12} className="text-[#D8D4D5]" />;
      case 'Fun': return <Star size={12} className="text-[#384D48]" />;
      default: return <Clock size={12} className="text-[#6E7271]" />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-3 pb-20 max-w-md mx-auto p-3 bg-[#E2E2E2] min-h-screen">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-lg font-black text-[#384D48] tracking-tight">PLANNER</h1>
          <p className="text-[7px] text-[#6E7271] font-bold uppercase tracking-widest">System Protocol</p>
        </div>
        <button 
          onClick={() => { vibrate(30); setIsEditing(!isEditing); }}
          className="p-2 bg-[#384D48] text-[#E2E2E2] rounded-lg active:scale-95 transition-all shadow-sm"
        >
          {isEditing ? <Save size={14} /> : <Pencil size={14} />}
        </button>
      </header>

      {/* Zen Progress Visualizer */}
      <section className="bg-[#384D48] p-3 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[8px] font-bold text-[#D8D4D5] uppercase tracking-widest">Efficiency Rate</span>
          <span className="text-xs font-black text-[#E2E2E2]">{progress}%</span>
        </div>
        <div className="h-1 w-full bg-[#6E7271] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#ACAD94]"
          />
        </div>
      </section>

      {/* Compact Schedule Feed */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {schedule.map((item: ScheduleItem) => (
            <motion.div 
              key={item.id} layout
              className={`p-2 rounded-lg flex items-center gap-2.5 transition-all shadow-sm ${
                item.completed ? 'bg-[#D8D4D5] opacity-60' : 'bg-white'
              }`}
            >
              {!isEditing && (
                <button 
                  onClick={() => { vibrate(20); toggleSchedule(item.id); if(!item.completed) addXp(20); }} 
                  className="text-[#384D48] flex-shrink-0"
                >
                  {item.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                    <p className="text-[7px] font-bold text-[#6E7271] uppercase tracking-tighter">{item.time}</p>
                  </div>
                  <span className={`text-[6px] font-black px-1 py-0.5 rounded uppercase ${
                    item.type === 'JEE' ? 'bg-[#384D48] text-white' : 'bg-[#E2E2E2] text-[#384D48]'
                  }`}>{item.type}</span>
                </div>
                
                {isEditing ? (
                  <div className="flex flex-col gap-1.5 mt-1 bg-[#F5F5F5] p-2 rounded-md">
                    <div className="flex gap-1">
                      <input type="time" value={item.time} className="text-[9px] p-1 rounded bg-white flex-1" onChange={(e) => setSchedule(schedule.map(s => s.id === item.id ? {...s, time: e.target.value} : s))} />
                      <select value={item.type} className="text-[9px] p-1 rounded bg-white flex-1" onChange={(e) => setSchedule(schedule.map(s => s.id === item.id ? {...s, type: e.target.value as any} : s))}>
                        <option value="JEE">JEE</option>
                        <option value="Study">Study</option>
                        <option value="Normal">Normal</option>
                        <option value="Habit">Habit</option>
                        <option value="Break">Break</option>
                        <option value="Fun">Fun</option>
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <input className="text-[10px] p-1.5 rounded bg-white flex-[3] font-bold outline-none" value={item.task} onChange={(e) => setSchedule(schedule.map(s => s.id === item.id ? {...s, task: e.target.value} : s))} />
                      <button onClick={() => setSchedule(schedule.filter(s => s.id !== item.id))} className="flex-1 bg-red-50 text-red-500 rounded p-1 flex items-center justify-center"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ) : (
                  <h3 className={`text-[11px] font-bold truncate ${item.completed ? 'line-through text-[#6E7271]' : 'text-[#384D48]'}`}>
                    {item.task}
                  </h3>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isEditing && (
        <button 
          onClick={() => { vibrate(30); setSchedule([...schedule, { id: Date.now().toString(), time: "18:00", task: "New Entry", type: "Study", completed: false }]); }}
          className="w-full p-2 border border-dashed border-[#ACAD94] rounded-lg text-[8px] font-black text-[#6E7271] uppercase flex items-center justify-center gap-1 active:bg-white transition-all"
        >
          <Plus size={10} /> Add Block
        </button>
      )}
    </div>
  );
}
