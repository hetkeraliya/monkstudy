"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Video, Trophy, Calendar, Plus, Save, Clock } from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

export default function Dashboard() {
  const { subjects, updateSubject } = useStore();
  const [activeSub, setActiveSub] = useState<any>(null);
  const [view, setView] = useState<'menu' | 'resources' | 'exam'>('menu');

  // Input States
  const [score, setScore] = useState("");
  const [total, setTotal] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examLevel, setExamLevel] = useState<'High' | 'Low'>('High');

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : "Today";
  };

  const saveExam = () => {
    if (!examDate) return;
    vibrate(40);
    const newExam = { id: Date.now().toString(), type: examLevel, date: examDate, title: examTitle };
    updateSubject(activeSub.id, { exams: [...activeSub.exams, newExam] });
    setExamTitle(""); setExamDate("");
  };

  const saveMarks = () => {
    if (!score || !total) return;
    vibrate(40);
    const newMark = { score: Number(score), total: Number(total), date: new Date().toISOString() };
    updateSubject(activeSub.id, { marks: [...activeSub.marks, newMark] });
    setScore(""); setTotal("");
  };

  return (
    <div className="space-y-6 pb-24 p-4">
      {/* Subject Selection Boxes */}
      <section className="grid grid-cols-1 gap-4">
        {subjects.map((sub) => (
          <motion.div 
            key={sub.id} onClick={() => { vibrate(20); setActiveSub(sub); setView('menu'); }}
            className="matte-card p-6 flex justify-between items-center cursor-pointer active:scale-95"
          >
            <h2 className="text-xl font-bold text-monk-dark">{sub.name}</h2>
            <div className="flex gap-3">
              {sub.exams.slice(0, 1).map(ex => (
                <span key={ex.id} className={`text-[10px] font-bold px-2 py-1 rounded-full ${ex.type === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {ex.type}: {getCountdown(ex.date)}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Center Box (Modal) */}
      <AnimatePresence>
        {activeSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSub(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-monk-dark">{activeSub.name} - {view.toUpperCase()}</h3>
                <button onClick={() => setView('menu')} className="p-2 bg-monk-bg rounded-full"><X size={18} /></button>
              </div>

              {view === 'menu' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setView('resources')} className="flex flex-col items-center gap-3 p-6 bg-monk-bg rounded-2xl">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><FileText className="text-monk-olive" /></div>
                    <span className="text-xs font-bold text-monk-muted">NOTES/VIDS</span>
                  </button>
                  <button onClick={() => setView('exam')} className="flex flex-col items-center gap-3 p-6 bg-monk-bg rounded-2xl">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Trophy className="text-orange-500" /></div>
                    <span className="text-xs font-bold text-monk-muted">EXAM INTEL</span>
                  </button>
                </div>
              )}

              {view === 'exam' && (
                <div className="space-y-6">
                  {/* Marks Entry */}
                  <div className="p-4 bg-monk-bg rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Entry Database</p>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Score" value={score} onChange={e => setScore(e.target.value)} className="w-full p-3 rounded-xl bg-white outline-none text-sm font-bold" />
                      <input type="number" placeholder="Total" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-3 rounded-xl bg-white outline-none text-sm font-bold" />
                      <button onClick={saveMarks} className="p-3 bg-monk-dark text-white rounded-xl"><Save size={20} /></button>
                    </div>
                  </div>

                  {/* Exam Countdown List */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Upcoming Countdown</p>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                      {activeSub.exams.sort((a:any,b:any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((ex:any) => (
                        <div key={ex.id} className="flex items-center justify-between p-3 bg-white border border-monk-bg rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${ex.type === 'High' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                            <span className="text-xs font-bold text-monk-dark">{ex.title || "Exam"}</span>
                          </div>
                          <span className="text-[10px] font-bold text-monk-olive uppercase">{getCountdown(ex.date)}</span>
                        </div>
                      ))}
                    </div>
                    {/* Add Exam Date */}
                    <div className="flex gap-2">
                      <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="flex-1 p-2 bg-monk-bg rounded-lg text-xs outline-none" />
                      <select value={examLevel} onChange={e => setExamLevel(e.target.value as any)} className="p-2 bg-monk-bg rounded-lg text-xs font-bold outline-none">
                        <option value="High">HIGH</option>
                        <option value="Low">LOW</option>
                      </select>
                      <button onClick={saveExam} className="p-2 bg-monk-olive text-white rounded-lg"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
              )}

              {view === 'resources' && (
                <div className="space-y-4">
                  <div className="p-10 text-center border-2 border-dashed border-monk-sand rounded-3xl">
                    <p className="text-xs text-monk-muted font-bold italic">Upload system pending linkage...</p>
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
