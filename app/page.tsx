"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Save, ChevronRight, Target, Play, Pause, RotateCcw } from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { subjects, addXp, addMark } = useStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [view, setView] = useState<'menu' | 'exam'>('menu');

  // Hard-locked Marks System
  const [score, setScore] = useState("");
  const totalMarks = 300; // JEE Advanced Standard locked permanently

  useEffect(() => {
    setMounted(true);
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    else if (timeLeft === 0) { vibrate([100, 50, 100]); setIsRunning(false); addXp(50); setTimeLeft(25 * 60); }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, addXp]);

  if (!mounted) return null;

  const handleSaveMarks = () => {
    const numScore = Number(score);
    if (!score || numScore > 300 || numScore < 0 || !activeSub) {
      vibrate([50, 50]); // Error vibration
      return; 
    }
    addMark(activeSub.id, numScore, totalMarks);
    setScore(""); 
    vibrate(40);
    setView('menu');
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto p-4 bg-[#E2E2E2] min-h-screen">
      
      {/* Pomodoro Timer */}
      <div className="bg-white p-8 rounded-[32px] flex flex-col items-center shadow-md border border-[#D8D4D5]">
        <Target size={16} className="text-[#ACAD94] mb-2" />
        <h2 className="text-7xl font-black text-[#384D48] tabular-nums tracking-tighter">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </h2>
        <div className="flex gap-4 mt-8">
          <button onClick={() => { vibrate(30); setIsRunning(!isRunning); }} className="bg-[#384D48] text-white px-10 py-4 rounded-2xl flex items-center gap-2 active:scale-95 shadow-lg">
            {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            <span className="font-black tracking-widest text-sm uppercase">START</span>
          </button>
          <button onClick={() => setTimeLeft(25 * 60)} className="p-4 bg-[#F5F5F5] text-[#6E7271] rounded-2xl active:scale-95">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest px-1">Academic Control</h3>
        {subjects.map((sub) => (
          <div key={sub.id} onClick={() => { vibrate(20); setActiveSub(sub); setView('menu'); }} className="bg-white p-5 rounded-2xl flex justify-between items-center cursor-pointer active:scale-95 transition-all shadow-sm border-l-4 border-[#384D48]">
            <h2 className="text-lg font-black text-[#384D48]">{sub.name}</h2>
            <ChevronRight className="text-[#ACAD94]" />
          </div>
        ))}
      </section>

      {/* Pop-up Command Box */}
      <AnimatePresence>
        {activeSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSub(null)} className="absolute inset-0 bg-[#384D48]/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-[#E2E2E2] rounded-[32px] p-6 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-[#384D48] text-xl">{activeSub.name}</h3>
                <button onClick={() => view === 'menu' ? setActiveSub(null) : setView('menu')} className="p-2 bg-white rounded-full text-[#6E7271]"><X size={18} /></button>
              </div>

              {view === 'menu' && (
                <button onClick={() => setView('exam')} className="w-full flex items-center justify-center gap-3 p-6 bg-white rounded-2xl shadow-sm">
                  <Trophy className="text-[#ACAD94]" size={24} />
                  <span className="text-xs font-black uppercase text-[#384D48] tracking-widest">Enter Mock Score</span>
                </button>
              )}

              {/* 300 Max Marks Entry Logic */}
              {view === 'exam' && (
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest text-center">JEE Advanced Mock Entry</p>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <p className="text-[8px] font-bold text-[#6E7271] absolute top-2 left-3 uppercase">Obtained</p>
                      <input 
                        type="number" 
                        value={score} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val <= 300) setScore(e.target.value); // Locks input above 300
                        }} 
                        className="w-full pt-6 pb-2 px-3 rounded-xl bg-white outline-none font-black text-xl text-[#384D48]" 
                      />
                    </div>
                    <div className="flex-1 relative opacity-70">
                      <p className="text-[8px] font-bold text-[#6E7271] absolute top-2 left-3 uppercase">Total Marks</p>
                      <input type="number" value={totalMarks} disabled className="w-full pt-6 pb-2 px-3 rounded-xl bg-[#D8D4D5] outline-none font-black text-xl text-[#6E7271]" />
                    </div>
                  </div>
                  <button onClick={handleSaveMarks} className="w-full p-4 bg-[#384D48] text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs active:scale-95 transition-all">
                    <Save size={16} /> Save Intel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
