"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Plus, ExternalLink, 
  Calendar, FileText, X, Target, Save 
} from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

export default function Dashboard() {
  const { xp, subjects, addXp, updateSubject } = useStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Modal State
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [markInput, setMarkInput] = useState("");
  const [examDate, setExamDate] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteUrl, setNoteUrl] = useState("");

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

  const calculateDaysLeft = (dateStr: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : days === 0 ? "Exam Today" : "Exam Passed";
  };

  const saveSubjectData = () => {
    if (!selectedSub) return;
    vibrate(30);
    
    const updatedNotes = [...selectedSub.notes];
    if (noteTitle && noteUrl) {
      updatedNotes.push({ title: noteTitle, url: noteUrl });
    }

    const updatedMarks = [...selectedSub.marks];
    if (markInput) {
      updatedMarks.push(markInput);
    }

    updateSubject(selectedSub.id, {
      nextExam: examDate || selectedSub.nextExam,
      marks: updatedMarks,
      notes: updatedNotes,
    });

    // Clear and Close
    setMarkInput("");
    setNoteTitle("");
    setNoteUrl("");
    setSelectedSub(null);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Pomodoro Timer */}
      <div className="matte-card p-8 flex flex-col items-center shadow-matte">
        <div className="flex items-center gap-2 text-monk-olive mb-2">
          <Target size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Deep Work</span>
        </div>
        <h2 className="text-7xl font-bold text-monk-dark tabular-nums tracking-tighter">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </h2>
        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => { vibrate(30); setIsRunning(!isRunning); }} 
            className="matte-btn px-10 py-4 flex items-center gap-2 shadow-matte"
          >
            {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            <span className="font-bold tracking-widest">{isRunning ? "PAUSE" : "START"}</span>
          </button>
          <button onClick={() => { vibrate(20); setTimeLeft(25 * 60); setIsRunning(false); }} className="p-4 bg-monk-bg rounded-btn text-monk-muted">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Subject Cards */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em] px-1">Academic Control</h3>
        {subjects.map((sub) => (
          <div 
            key={sub.id} 
            onClick={() => { vibrate(20); setSelectedSub(sub); setExamDate(sub.nextExam || ""); }}
            className="matte-card p-5 space-y-4 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold text-monk-dark">{sub.name}</h4>
                {sub.nextExam && (
                  <div className="flex items-center gap-1.5 mt-1 text-orange-600">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase">{calculateDaysLeft(sub.nextExam)}</span>
                  </div>
                )}
              </div>
              <div className="bg-monk-bg px-2 py-1 rounded text-[10px] font-bold text-monk-dark">
                {sub.marks.length > 0 ? `Latest: ${sub.marks[sub.marks.length - 1]}` : 'No Marks'}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {sub.notes.slice(-2).map((note: any, i: number) => (
                <div key={i} className="flex-shrink-0 bg-monk-bg/50 px-3 py-2 rounded-lg flex items-center gap-2 border border-monk-sand/20">
                  <FileText size={12} className="text-monk-olive" />
                  <span className="text-[10px] font-bold text-monk-dark truncate max-w-[80px]">{note.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Centered Management Modal */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSub(null)}
              className="absolute inset-0 bg-monk-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-monk-dark">{selectedSub.name} Settings</h3>
                <button onClick={() => setSelectedSub(null)} className="p-2 bg-monk-bg rounded-full text-monk-muted">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Next Exam Date</label>
                <input 
                  type="date" 
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full p-3 bg-monk-bg rounded-xl font-bold text-monk-dark outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Latest Marks (e.g. 85/100)</label>
                <input 
                  type="text" 
                  placeholder="Enter score"
                  value={markInput}
                  onChange={(e) => setMarkInput(e.target.value)}
                  className="w-full p-3 bg-monk-bg rounded-xl font-bold text-monk-dark outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Add Drive Notes</label>
                <input 
                  type="text" placeholder="Note Title"
                  value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full p-3 bg-monk-bg rounded-xl text-sm outline-none"
                />
                <input 
                  type="text" placeholder="Paste Google Drive Link"
                  value={noteUrl} onChange={(e) => setNoteUrl(e.target.value)}
                  className="w-full p-3 bg-monk-bg rounded-xl text-sm outline-none"
                />
              </div>

              <button 
                onClick={saveSubjectData}
                className="w-full py-4 bg-monk-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-matte active:scale-95 transition-transform"
              >
                <Save size={18} /> SAVE SUBJECT DATA
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
                      }
        
