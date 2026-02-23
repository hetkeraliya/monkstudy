"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Save, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Planner() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { schedule, updateSchedule, toggleSchedule, addXp } = useStore();

  useEffect(() => setMounted(true), []);

  // Visualizer Logic: Tracks Completion Percentage
  const progress = useMemo(() => {
    if (!schedule || schedule.length === 0) return 0;
    const completed = schedule.filter((i: any) => i.completed).length;
    return Math.round((completed / schedule.length) * 100);
  }, [schedule]);

  const handleToggle = (id: string, wasCompleted: boolean) => {
    vibrate(20);
    toggleSchedule(id);
    if (!wasCompleted) addXp(20); // Reward 20 XP for completing a schedule block
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-monk-dark">Monk Schedule</h1>
        <button 
          onClick={() => { vibrate(30); setIsEditing(!isEditing); }}
          className="p-3 bg-white shadow-matte rounded-2xl text-monk-muted"
        >
          {isEditing ? <Save size={20} className="text-monk-olive" /> : <Pencil size={20} />}
        </button>
      </header>

      {/* Tickable Progress Visualizer */}
      <section className="matte-card p-5 space-y-3 shadow-matte border-b-4 border-monk-olive/20">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase text-monk-muted">Daily Execution</p>
            <h2 className="text-xl font-black text-monk-dark">Status: {progress === 100 ? 'Elite' : 'Processing'}</h2>
          </div>
          <span className="text-2xl font-black text-monk-olive">{progress}%</span>
        </div>
        <div className="h-4 w-full bg-monk-bg rounded-full p-1 border border-monk-sand/20">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }}
            className="h-full bg-monk-olive rounded-full"
          />
        </div>
      </section>

      {/* Tickable List */}
      <div className="space-y-3">
        {schedule.map((item: any) => (
          <div 
            key={item.id}
            className={`matte-card p-4 flex items-center gap-4 transition-all border-l-4 ${
              item.completed ? 'opacity-50 grayscale' : 'opacity-100'
            } ${item.type === 'Study' ? 'border-monk-olive bg-monk-olive/5' : 'border-monk-dark'}`}
          >
            {!isEditing && (
              <button onClick={() => handleToggle(item.id, item.completed)} className="text-monk-olive">
                {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
            )}
            
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-[9px] font-black text-monk-muted uppercase">{item.time}</p>
                {item.type === 'Study' && <span className="text-[8px] font-bold text-monk-olive">JEE BLOCK</span>}
              </div>
              {isEditing ? (
                <input 
                  className="bg-transparent font-bold text-sm w-full outline-none"
                  value={item.task}
                  onChange={(e) => {
                    const next = schedule.map((s: any) => s.id === item.id ? { ...s, task: e.target.value } : s);
                    updateSchedule(next);
                  }}
                />
              ) : (
                <h3 className={`text-sm font-bold ${item.completed ? 'line-through' : 'text-monk-dark'}`}>{item.task}</h3>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
                }
        
