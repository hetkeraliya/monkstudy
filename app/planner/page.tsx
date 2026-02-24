"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Save, Circle, Plus, Trash2, Clock, Zap, Coffee, Book, Heart, Star } from "lucide-react";
import { useStore, ScheduleItem } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Planner() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { schedule, setSchedule, deleteScheduleItem, addXp } = useStore();

  useEffect(() => setMounted(true), []);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'JEE': return <Zap size={14} className="text-[#384D48]" />;
      case 'Break': return <Coffee size={14} className="text-[#6E7271]" />;
      case 'Study': return <Book size={14} className="text-[#ACAD94]" />;
      case 'Habit': return <Heart size={14} className="text-[#D8D4D5]" />;
      case 'Fun': return <Star size={14} className="text-[#384D48]" />;
      default: return <Clock size={14} className="text-[#6E7271]" />;
    }
  };

  const updateItem = (id: string, updates: Partial<ScheduleItem>) => {
    setSchedule(schedule.map((s: ScheduleItem) => s.id === id ? { ...s, ...updates } : s));
  };

  const handleComplete = (id: string) => {
    vibrate(40);
    addXp(20); // Reward for execution
    deleteScheduleItem(id); // Auto-delete
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto p-4 bg-[#E2E2E2] min-h-screen">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-xl font-black text-[#384D48] tracking-tighter uppercase">PLANNER</h1>
          <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">Daily Execution</p>
        </div>
        <button 
          onClick={() => { vibrate(30); setIsEditing(!isEditing); }}
          className="p-2.5 bg-[#384D48] text-[#E2E2E2] rounded-xl active:scale-95 transition-all shadow-md"
        >
          {isEditing ? <Save size={18} /> : <Pencil size={18} />}
        </button>
      </header>

      <div className="space-y-2.5 mt-6">
        <AnimatePresence mode="popLayout">
          {schedule.sort((a: any, b: any) => a.time.localeCompare(b.time)).map((item: ScheduleItem) => (
            <motion.div 
              key={item.id} layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 50 }}
              className={`p-4 rounded-2xl flex items-center gap-4 bg-white transition-all shadow-sm border-l-4 ${item.type === 'JEE' ? 'border-[#384D48]' : 'border-[#ACAD94]'}`}
            >
              {!isEditing && (
                <button 
                  onClick={() => handleComplete(item.id)} 
                  className="text-[#384D48] hover:text-[#ACAD94] transition-colors flex-shrink-0"
                >
                  <Circle size={22} />
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(item.type)}
                    <p className="text-[9px] font-bold text-[#6E7271] uppercase tracking-tighter">{item.time}</p>
                  </div>
                  <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${
                    item.type === 'JEE' ? 'bg-[#384D48] text-white' : 'bg-[#E2E2E2] text-[#384D48]'
                  }`}>{item.type}</span>
                </div>
                
                {isEditing ? (
                  <div className="space-y-2 mt-2 bg-[#E2E2E2]/30 p-3 rounded-xl">
                    <div className="flex gap-2">
                      <input type="time" value={item.time} className="text-[10px] p-2 rounded-lg bg-white flex-1 outline-none font-bold text-[#384D48]" onChange={(e) => updateItem(item.id, { time: e.target.value })} />
                      <select value={item.type} className="text-[10px] p-2 rounded-lg bg-white flex-1 outline-none font-bold uppercase text-[#384D48]" onChange={(e) => updateItem(item.id, { type: e.target.value as any })}>
                        <option value="JEE">JEE</option>
                        <option value="Study">Study</option>
                        <option value="Normal">Normal</option>
                        <option value="Habit">Habit</option>
                        <option value="Break">Break</option>
                        <option value="Fun">Fun</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input className="text-[12px] p-2 rounded-lg bg-white flex-[4] font-bold outline-none text-[#384D48]" value={item.task} onChange={(e) => updateItem(item.id, { task: e.target.value })} />
                      <button onClick={() => deleteScheduleItem(item.id)} className="flex-1 bg-[#D8D4D5] text-red-500 rounded-lg p-2 flex items-center justify-center">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3 className="text-[14px] font-bold truncate leading-tight text-[#384D48]">
                    {item.task}
                  </h3>
                )}
              </div>
            </motion.div>
          ))}
          {schedule.length === 0 && !isEditing && (
            <div className="text-center p-8 border-2 border-dashed border-[#ACAD94] rounded-3xl mt-10">
              <p className="text-xs font-black text-[#6E7271] uppercase tracking-widest">Day Cleared</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {isEditing && (
        <button 
          onClick={() => { vibrate(30); setSchedule([...schedule, { id: Date.now().toString(), time: "18:00", task: "New Mission", type: "Study", completed: false }]); }}
          className="w-full p-4 border-2 border-dashed border-[#ACAD94] rounded-2xl text-[10px] font-black text-[#6E7271] uppercase flex items-center justify-center gap-2 mt-4"
        >
          <Plus size={14} /> Add Block
        </button>
      )}
    </div>
  );
                                                                                                                                                                                              }
