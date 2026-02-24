"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Circle, AlertCircle, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Tasks() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<'High' | 'Mid' | 'Low'>('High');
  
  const { tasks, addTask, deleteTask, addXp } = useStore();

  useEffect(() => setMounted(true), []);

  const handleAdd = () => {
    if (input.trim()) {
      vibrate(40);
      addTask(input, priority);
      setInput("");
    }
  };

  const handleComplete = (id: string) => {
    vibrate(40);
    addXp(10); // Reward 10 XP
    deleteTask(id); // Auto-delete task
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto p-4 bg-[#E2E2E2] min-h-screen">
      <header className="pt-2 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-[#384D48] tracking-tight uppercase">Missions</h1>
          <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-widest">Target Tracker</p>
        </div>
        <div className="flex items-center gap-1 bg-[#ACAD94]/30 px-3 py-1.5 rounded-full text-[#384D48]">
          <Zap size={12} fill="currentColor" />
          <span className="text-[9px] font-black uppercase tracking-tighter">10 XP / Kill</span>
        </div>
      </header>

      {/* Input Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-md border-b-4 border-[#384D48] space-y-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New study target..."
          className="w-full p-3 bg-[#F5F5F5] rounded-xl text-sm font-bold outline-none text-[#384D48] placeholder:text-[#ACAD94]"
        />
        <div className="flex gap-2">
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as any)}
            className="flex-1 p-3 bg-[#F5F5F5] rounded-xl text-[10px] font-bold uppercase outline-none text-[#384D48]"
          >
            <option value="High">HIGH (JEE)</option>
            <option value="Mid">MID (COACHING)</option>
            <option value="Low">LOW (SCHOOL)</option>
          </select>
          <button 
            onClick={handleAdd}
            className="p-3 bg-[#384D48] text-white rounded-xl active:scale-90 transition-transform shadow-lg"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Task Feed */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.length > 0 ? tasks.map((task) => (
            <motion.div 
              key={task.id} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, x: 50 }}
              className={`bg-white p-4 flex items-center justify-between border-l-4 rounded-2xl shadow-sm ${
                task.priority === 'High' ? 'border-[#384D48]' : task.priority === 'Mid' ? 'border-[#ACAD94]' : 'border-[#6E7271]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <button onClick={() => handleComplete(task.id)} className="text-[#384D48] flex-shrink-0 hover:text-[#ACAD94]">
                  <Circle size={22} />
                </button>
                <div className="flex flex-col truncate">
                  <span className="text-[13px] font-bold truncate text-[#384D48]">
                    {task.text}
                  </span>
                  <span className="text-[8px] font-black text-[#ACAD94] uppercase tracking-tighter">
                    {task.priority} Priority
                  </span>
                </div>
              </div>
              <button onClick={() => { vibrate(60); deleteTask(task.id); }} className="p-2 text-[#D8D4D5] hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </motion.div>
          )) : (
            <div className="p-10 text-center border-2 border-dashed border-[#ACAD94] rounded-[32px] mt-8">
              <AlertCircle className="mx-auto text-[#6E7271] mb-2" size={24} />
              <p className="text-[9px] text-[#384D48] font-black uppercase tracking-widest">No Active Missions</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
