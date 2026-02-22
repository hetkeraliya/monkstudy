"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Zap } from "lucide-react";
import { useStore } from "../../store/useStore"; // Fixed path
import { vibrate } from "../../lib/db";

export default function Tasks() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<'High' | 'Mid' | 'Low'>('High');
  
  const { tasks, addTask, toggleTask, deleteTask, addXp } = useStore();

  useEffect(() => setMounted(true), []);

  const handleAdd = () => {
    if (input.trim()) {
      vibrate(40);
      addTask(input, priority);
      setInput("");
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    vibrate(20);
    toggleTask(id);
    if (!completed) addXp(10); // +10 XP for JEE prep tasks
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Mission Control</h1>
          <p className="text-[10px] text-monk-muted font-bold uppercase tracking-widest">Target Tracker</p>
        </div>
        <div className="flex items-center gap-1 bg-monk-olive/10 px-3 py-1 rounded-full text-monk-olive">
          <Zap size={12} fill="currentColor" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Tasks Reward: 10XP</span>
        </div>
      </header>

      {/* Modern Input Bar */}
      <div className="matte-card p-4 space-y-3 shadow-matte border-b-4 border-monk-sand/20">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New study goal..."
          className="w-full p-4 bg-monk-bg rounded-2xl text-sm font-bold outline-none placeholder:text-monk-sand border-2 border-transparent focus:border-monk-olive/20 transition-all"
        />
        <div className="flex gap-2">
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as any)}
            className="flex-1 p-3 bg-monk-bg rounded-xl text-[10px] font-bold uppercase outline-none text-monk-dark"
          >
            <option value="High">HIGH (JEE)</option>
            <option value="Mid">MID (COACHING)</option>
            <option value="Low">LOW (SCHOOL)</option>
          </select>
          <button 
            onClick={handleAdd}
            className="p-3 bg-monk-dark text-white rounded-xl active:scale-90 transition-transform shadow-lg"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Task Feed */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.length > 0 ? tasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`matte-card p-4 flex items-center justify-between border-l-4 transition-all ${
                task.completed ? 'opacity-40 grayscale' : 'opacity-100'
              }`}
              style={{ borderLeftColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Mid' ? '#fb923c' : '#60a5fa' }}
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden" onClick={() => handleToggle(task.id, task.completed)}>
                <button className="text-monk-olive flex-shrink-0">
                  {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <div className="flex flex-col truncate">
                  <span className={`text-sm font-bold truncate ${task.completed ? 'line-through' : 'text-monk-dark'}`}>
                    {task.text}
                  </span>
                  <span className="text-[8px] font-bold text-monk-muted uppercase tracking-tighter">
                    {task.priority} Priority
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { vibrate(60); deleteTask(task.id); }}
                className="p-2 text-monk-sand hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          )) : (
            <div className="p-16 text-center bg-monk-bg/30 rounded-[32px] border-2 border-dashed border-monk-sand">
              <AlertCircle className="mx-auto text-monk-sand mb-2" size={32} />
              <p className="text-[10px] text-monk-muted font-bold uppercase tracking-widest">No Active Missions</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
                    }
