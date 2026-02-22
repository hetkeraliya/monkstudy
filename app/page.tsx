"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";
import { Play, Pause, Flame, Target } from "lucide-react";

export default function Home() {
  const { xp, streak, pomodoroWork } = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(pomodoroWork * 60);

  const toggleTimer = () => {
    vibrate(30);
    setIsRunning(!isRunning);
    // Note: Web Worker logic would attach here for background tracking
  };

  const subjects = [
    { id: 1, name: "Physics", chapter: "Kinematics", progress: 65, color: "#384D48" },
    { id: 2, name: "Chemistry", chapter: "Chemical Bonding", progress: 40, color: "#ACAD94" },
    { id: 3, name: "Mathematics", chapter: "Definite Integration", progress: 20, color: "#6E7271" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Top Bar: XP & Streak */}
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center bg-monk-card rounded-full shadow-matte">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#E2E2E2" strokeWidth="4" fill="none" />
              <circle cx="24" cy="24" r="20" stroke="#ACAD94" strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * (xp % 1000)) / 1000} className="transition-all duration-1000" />
            </svg>
            <span className="text-xs font-bold text-monk-dark">Lvl 4</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-monk-textMain tracking-tight">Today's Focus</h1>
            <p className="text-sm text-monk-muted font-medium">{xp} XP</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 bg-monk-card px-3 py-1.5 rounded-full shadow-matte">
          <Flame size={18} className="text-orange-500" />
          <span className="font-bold text-monk-textMain">{streak}</span>
        </div>
      </header>

      {/* Matte Pomodoro Card */}
      <div className="matte-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex items-center gap-2 text-monk-olive mb-4">
          <Target size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">Deep Work</span>
        </div>
        
        <h2 className="text-7xl font-sans font-bold tracking-tighter text-monk-dark">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
        </h2>
        
        <button 
          onClick={toggleTimer}
          className="mt-8 matte-btn px-10 py-4 flex items-center gap-2 shadow-matte"
        >
          {isRunning ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
          <span className="font-bold tracking-wide">{isRunning ? "PAUSE" : "START SESSION"}</span>
        </button>
      </div>

      {/* Subject Tracking */}
      <section>
        <h3 className="text-sm font-bold text-monk-muted uppercase tracking-wider mb-4 pl-1">Current Targets</h3>
        <div className="space-y-3">
          {subjects.map((sub) => (
            <div key={sub.id} className="matte-card p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-monk-textMain">{sub.name}</h4>
                <p className="text-sm text-monk-muted mt-0.5">{sub.chapter}</p>
              </div>
              
              {/* Tiny Circular Progress */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="#E2E2E2" strokeWidth="3" fill="none" />
                  <circle cx="20" cy="20" r="16" stroke={sub.color} strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset={100 - sub.progress} />
                </svg>
                <span className="text-[10px] font-bold" style={{ color: sub.color }}>{sub.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
