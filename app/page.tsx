"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, FileText, Video, Trophy, Calendar, Plus, Save, 
  ChevronRight, ExternalLink, Target, RotateCcw, Play, Pause
} from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { subjects, addXp, updateSubject } = useStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [view, setView] = useState<'menu' | 'resources' | 'exam'>('menu');

  const [score, setScore] = useState("");
  const [total, setTotal] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examLevel, setExamLevel] = useState<'High' | 'Mid' | 'Low'>('High');
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState<'notes' | 'videos'>('notes');

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  const getCountdown = (date: string) => {
    if (!date) return null;
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  const handleSaveResource = () => {
    if (!resTitle || !resUrl || !activeSub) return;
    const key = resType === 'notes' ? 'notes' : 'videos';
    updateSubject(activeSub.id, { [key]: [...(activeSub[key] || []), { title: resTitle, url: resUrl }] });
    setResTitle(""); setResUrl(""); vibrate(30);
  };

  const handleSaveExam = () => {
    if (!examDate || !activeSub) return;
    updateSubject(activeSub.id, { 
      exams: [...(activeSub.exams || []), { id: Date.now().toString(), type: examLevel, date: examDate, title: examTitle }] 
    });
    setExamTitle(""); setExamDate(""); vibrate(40);
  };

  const handleSaveMarks = () => {
    if (!score || !total || !activeSub) return;
    updateSubject(activeSub.id, { 
      marks: [...(activeSub.marks || []), { score: Number(score), total: Number(total), date: new Date().toISOString() }] 
    });
    setScore(""); setTotal(""); vibrate(40);
  };

  return (
    <div className="space-y-6">
      <div className="matte-card p-8 flex flex-col items-center shadow-matte">
        <Target size={16} className="text-monk-olive mb-2" />
        <h2 className="text-7xl font-bold text-monk-dark tabular-nums">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h2>
        <div className="flex gap-4 mt-8">
          <button onClick={() => { vibrate(30); setIsRunning(!isRunning); }} className="matte-btn px-10 py-4 flex items-center gap-2">
            {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            <span className="font-bold">START</span>
          </button>
          <button onClick={() => setTimeLeft(25 * 60)} className="p-4 bg-monk-bg rounded-btn"><RotateCcw size={20} /></button>
        </div>
      </div>

      <section className="space-y-4">
        {subjects.map((sub) => (
          <div key={sub.id} onClick={() => { vibrate(20); setActiveSub(sub); setView('menu'); }} className="matte-card p-6 flex justify-between items-center cursor-pointer active:scale-95">
            <h2 className="text-xl font-bold text-monk-dark">{sub.name}</h2>
            <ChevronRight className="text-monk-sand" />
          </div>
        ))}
      </section>

      <AnimatePresence>
        {activeSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSub(null)} className="absolute inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm bg-white rounded-[32px] p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-monk-dark">{activeSub.name}</h3>
                <button onClick={() => view === 'menu' ? setActiveSub(null) : setView('menu')} className="p-2 bg-monk-bg rounded-full"><X size={18} /></button>
              </div>

              {view === 'menu' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setView('resources')} className="flex flex-col items-center gap-3 p-6 bg-monk-bg rounded-2xl">
                    <FileText className="text-monk-olive" />
                    <span className="text-[10px] font-bold uppercase">Resources</span>
                  </button>
                  <button onClick={() => setView('exam')} className="flex flex-col items-center gap-3 p-6 bg-monk-bg rounded-2xl">
                    <Trophy className="text-orange-500" />
                    <span className="text-[10px] font-bold uppercase">Exam Intel</span>
                  </button>
                </div>
              )}

              {view === 'resources' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Title" value={resTitle} onChange={e => setResTitle(e.target.value)} className="w-full p-3 bg-monk-bg rounded-xl outline-none" />
                  <input type="text" placeholder="Drive/YouTube Link" value={resUrl} onChange={e => setResUrl(e.target.value)} className="w-full p-3 bg-monk-bg rounded-xl outline-none" />
                  <div className="flex gap-2">
                    <select value={resType} onChange={e => setResType(e.target.value as any)} className="flex-1 p-3 bg-monk-bg rounded-xl text-[10px] font-bold">
                      <option value="notes">NOTES</option>
                      <option value="videos">VIDEOS</option>
                    </select>
                    <button onClick={handleSaveResource} className="p-3 bg-monk-dark text-white rounded-xl"><Plus size={20} /></button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {[...(activeSub.notes || []), ...(activeSub.videos || [])].map((res, i) => (
                      <a key={i} href={res.url} target="_blank" className="flex items-center justify-between p-3 bg-monk-bg rounded-xl text-xs font-bold">
                        {res.title} <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {view === 'exam' && (
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <input type="number" placeholder="Score" value={score} onChange={e => setScore(e.target.value)} className="w-full p-3 rounded-xl bg-monk-bg outline-none" />
                    <input type="number" placeholder="Total" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-3 rounded-xl bg-monk-bg outline-none" />
                    <button onClick={handleSaveMarks} className="p-3 bg-monk-dark text-white rounded-xl"><Save size={20} /></button>
                  </div>
                  <div className="space-y-2">
                    <input type="text" placeholder="Exam Title" value={examTitle} onChange={e => setExamTitle(e.target.value)} className="w-full p-3 bg-monk-bg rounded-xl outline-none" />
                    <div className="flex gap-2">
                      <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="flex-1 p-3 bg-monk-bg rounded-xl outline-none" />
                      <select value={examLevel} onChange={e => setExamLevel(e.target.value as any)} className="p-3 bg-monk-bg rounded-xl text-[10px] font-bold">
                        <option value="High">HIGH</option>
                        <option value="Mid">MID</option>
                        <option value="Low">LOW</option>
                      </select>
                      <button onClick={handleSaveExam} className="p-3 bg-monk-dark text-white rounded-xl"><Plus size={20} /></button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
  
