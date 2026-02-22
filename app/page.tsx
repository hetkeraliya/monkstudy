"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Plus, ExternalLink, Calendar, FileText } from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

export default function Dashboard() {
  const { xp, subjects, addXp, updateSubject } = useStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../public/timerWorker.js', import.meta.url));
    workerRef.current.onmessage = () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          vibrate([100, 50, 100]);
          setIsRunning(false);
          addXp(50); // Earn 50 XP per session
          return 0;
        }
        return prev - 1;
      });
    };
    return () => workerRef.current?.terminate();
  }, [addXp]);

  const toggleTimer = () => {
    vibrate(30);
    if (isRunning) workerRef.current?.postMessage({ action: 'stop' });
    else workerRef.current?.postMessage({ action: 'start' });
    setIsRunning(!isRunning);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
      {/* Pomodoro Card */}
      <div className="matte-card p-8 flex flex-col items-center shadow-matte">
        <h2 className="text-6xl font-bold text-monk-dark tracking-tighter">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </h2>
        <div className="flex gap-4 mt-6">
          <button onClick={toggleTimer} className="matte-btn px-8 py-3 flex items-center gap-2">
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            {isRunning ? "PAUSE" : "FOCUS"}
          </button>
          <button onClick={() => setTimeLeft(25 * 60)} className="p-3 bg-monk-bg rounded-btn">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Subject Deep Dive */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-monk-muted uppercase tracking-[0.2em]">Academic Control</h3>
        {subjects.map((sub) => (
          <div key={sub.id} className="matte-card p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-monk-dark">{sub.name}</h4>
              <div className="flex items-center gap-2 text-monk-olive">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase">{sub.nextExam || 'No Exam Set'}</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-monk-bg p-3 rounded-btn text-[10px] font-bold uppercase text-monk-muted flex items-center justify-center gap-2">
                <Plus size={14} /> Marks Entry
              </button>
              <button className="bg-monk-bg p-3 rounded-btn text-[10px] font-bold uppercase text-monk-muted flex items-center justify-center gap-2">
                <FileText size={14} /> Syllabus
              </button>
            </div>

            {/* Google Drive Notes List */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-monk-sand uppercase">Organized Notes</p>
              {sub.notes.length > 0 ? sub.notes.map((note, i) => (
                <a key={i} href={note.url} target="_blank" className="flex items-center justify-between p-3 bg-monk-bg rounded-btn group">
                  <span className="text-xs font-medium text-monk-dark">{note.title}</span>
                  <ExternalLink size={14} className="text-monk-sand group-hover:text-monk-olive" />
                </a>
              ) ) : (
                <p className="text-[10px] text-monk-muted italic">Paste Drive link in settings to view notes</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </motion.div>
  );
}
