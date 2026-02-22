"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Plus, ExternalLink, Calendar, FileText, ClipboardList } from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

export default function Dashboard() {
  const { xp, subjects, addXp, updateSubject } = useStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Pomodoro Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      vibrate([100, 50, 100]);
      setIsRunning(false);
      addXp(50);
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, addXp]);

  const toggleTimer = () => {
    vibrate(30);
    setIsRunning(!isRunning);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
      {/* Pomodoro Timer */}
      <div className="matte-card p-8 flex flex-col items-center shadow-matte">
        <h2 className="text-6xl font-bold text-monk-dark tracking-tighter tabular-nums">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </h2>
        <div className="flex gap-4 mt-6">
          <button onClick={toggleTimer} className="matte-btn px-8 py-3 flex items-center gap-2">
            {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            <span className="font-bold tracking-wider">{isRunning ? "PAUSE" : "FOCUS"}</span>
          </button>
          <button onClick={() => setTimeLeft(25 * 60)} className="p-3 bg-monk-bg rounded-btn text-monk-muted">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Subject Management */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em] px-1">Subject Deep Dive</h3>
        {subjects.map((sub) => (
          <div key={sub.id} className="matte-card p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold text-monk-dark">{sub.name}</h4>
                <div className="flex items-center gap-1.5 mt-1 text-monk-olive">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase">Next Exam: {sub.nextExam || 'TBD'}</span>
                </div>
              </div>
              <div className="bg-monk-bg px-2 py-1 rounded text-[10px] font-bold text-monk-dark">
                {sub.marks.length > 0 ? `Last: ${sub.marks[sub.marks.length - 1]}` : 'No Marks'}
              </div>
            </div>

            {/* Grid: Marks & Syllabus */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-monk-bg p-3 rounded-btn text-[10px] font-bold uppercase text-monk-muted flex items-center justify-center gap-2">
                <Plus size={14} /> Add Marks
              </button>
              <button className="bg-monk-bg p-3 rounded-btn text-[10px] font-bold uppercase text-monk-muted flex items-center justify-center gap-2">
                <ClipboardList size={14} /> Syllabus
              </button>
            </div>

            {/* Organized Google Drive Notes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <FileText size={12} className="text-monk-sand" />
                <p className="text-[10px] font-bold text-monk-sand uppercase">Drive Resources</p>
              </div>
              {sub.notes.length > 0 ? sub.notes.map((note, i) => (
                <a key={i} href={note.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border border-monk-bg rounded-btn group transition-all active:bg-monk-bg">
                  <span className="text-xs font-bold text-monk-dark">{note.title}</span>
                  <ExternalLink size={14} className="text-monk-sand group-hover:text-monk-olive" />
                </a>
              )) : (
                <div className="p-4 bg-monk-bg/30 rounded-btn border border-dashed border-monk-sand/50 text-center">
                  <p className="text-[10px] text-monk-muted italic">Add your Drive links in Subject Settings</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </motion.div>
  );
}
