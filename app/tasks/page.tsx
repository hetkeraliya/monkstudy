"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

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
    if (!completed) addXp(10); // Reward 10 XP for finishing a task
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Mission Control</h1>
        <p className="text-xs text-monk-muted font-bold uppercase tracking-widest">JEE Daily Targets</p>
      </header>

      {/* Input Section */}
      <div className="matte-card p-4 space-y-3 shadow-matte">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New study target..."
          className="w-full p-4 bg-monk-bg rounded-2xl text-sm font-bold outline-none placeholder:text-monk-sand"
        />
        <div className="flex gap-2">
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as any)}
            className="flex-1 p-3 bg-monk-bg rounded-xl text-[10px] font-bold uppercase outline-none"
          >
            <option value="High">HIGH (JEE)</option>
            <option value="Mid">MID (COACHING)</option>
            <option value="Low">LOW (SCHOOL)</option>
          </select>
          <button 
            onClick={handleAdd}
            className="p-3 bg-monk-dark text-white rounded-xl active:scale-90 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.length > 0 ? tasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`matte-card p-4 flex items-center justify-between border-l-4 ${
                task.completed ? 'opacity-50' : 'opacity-100'
              }`}
              style={{ borderLeftColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Mid' ? '#fb923c' : '#60a5fa' }}
            >
              <div className="flex items-center gap-3 flex-1" onClick={() => handleToggle(task.id, task.completed)}>
                <button className="text-monk-olive">
                  {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <span className={`text-sm font-bold ${task.completed ? 'line-through' : ''}`}>
                  {task.text}
                </span>
              </div>
              <button 
                onClick={() => { vibrate(60); deleteTask(task.id); }}
                className="p-2 text-monk-sand hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          )) : (
            <div className="p-12 text-center bg-monk-bg/30 rounded-[32px] border border-dashed border-monk-sand">
              <AlertCircle className="mx-auto text-monk-sand mb-2" size={24} />
              <p className="text-[10px] text-monk-muted font-bold uppercase">No tasks for today</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
