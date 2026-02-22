"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, FileText, Video, Trophy, Calendar, Plus, Save, 
  ChevronRight, ExternalLink, Target, RotateCcw, Play, Pause, Link2 
} from "lucide-react";
import { useStore } from "../store/useStore";
import { vibrate } from "../lib/db";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { xp, subjects, addXp, updateSubject } = useStore();
  
  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Modal & Input State
  const [activeSub, setActiveSub] = useState<any>(null);
  const [view, setView] = useState<'menu' | 'resources' | 'exam'>('menu');
  const [score, setScore] = useState("");
  const [total, setTotal] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examLevel, setExamLevel] = useState<'High' | 'Low'>('High');
  
  // Resource Inputs
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
    vibrate(30);
    const newRes = { title: resTitle, url: resUrl };
    const updateKey = resType === 'notes' ? 'notes' : 'videos';
    updateSubject(activeSub.id, { [updateKey]: [...(activeSub[updateKey] || []), newRes] });
    setResTitle(""); setResUrl("");
  };

  const handleSaveExam = () => {
    if (!examDate || !activeSub) return;
    vibrate(40);
    const newExam = { id: Date.now().toString(), type: examLevel, date: examDate, title: examTitle };
    updateSubject(activeSub.id, { exams: [...(activeSub.exams || []), newExam] });
    setExamTitle(""); setExamDate("");
  };

  return (
    <div className="space-y-6 pb-24 p-4">
      {/* Pomodoro Timer Section */}
      <div className="matte-card p-8 flex flex-col items-center shadow-matte">
        <div className="flex items-center gap-2 text-monk-olive mb-2">
          <Target size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Deep Work Session</span>
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

      {/* Subject Selection Grid */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em] px-1">Subjects</h3>
        {subjects.map((sub) => (
          <motion.div 
            key={sub.id} 
            onClick={() => { vibrate(20); setActiveSub(sub); setView('menu'); }}
            className="matte-card p-6 flex justify-between items-center cursor-pointer active:scale-95 transition-all"
          >
            <div>
              <h2 className="text-xl font-bold text-monk-dark">{sub.name}</h2>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] text-monk-muted font-bold uppercase">
                  {(sub.notes?.length || 0) + (sub.videos?.length || 0)} Resources
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {(sub.exams || []).filter(e => getCountdown(e.date) !== "Passed").slice(0, 1).map(ex => (
                <span key={ex.id} className={`text-[10px] font-bold px-2 py-1 rounded-md ${ex.type === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {ex.type}: {getCountdown(ex.date)}
                </span>
              ))}
              <ChevronRight className="text-monk-sand" size={20} />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Centered Command Modal */}
      <AnimatePresence>
        {activeSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSub(null)} className="absolute inset-0 bg-monk-dark/60 backdrop-blur-md" />
            
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-monk-dark">{activeSub.name} {view !== 'menu' && `- ${view.toUpperCase()}`}</h3>
                <button onClick={() => view === 'menu' ? setActiveSub(null) : setView('menu')} className="p-2 bg-monk-bg rounded-full text-monk-muted">
                  <X size={18} />
                </button>
              </div>

              {view === 'menu' && (
                <div className="grid grid-cols-2 gap-4 pb-2">
                  <button onClick={() => setView('resources')} className="flex flex-col items-center gap-3 p-6 bg-monk-bg rounded-2xl active:scale-95 transition-transform">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><FileText className="text-monk-olive" /></div>
                    <span className="text-[10px] font-bold text-monk-muted uppercase">Resources</span>
                  </button>
                  <button onClick={() => setView('exam')} className="flex flex-col items-center gap-3 p-6 bg-monk-bg rounded-2xl active:scale-95 transition-transform">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><Trophy className="text-orange-500" /></div>
                    <span className="text-[10px] font-bold text-monk-muted uppercase">Exam Intel</span>
                  </button>
                </div>
              )}

              {view === 'resources' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Link New Resource</p>
                    <input type="text" placeholder="Title (e.g. Unit Notes)" value={resTitle} onChange={e => setResTitle(e.target.value)} className="w-full p-3 bg-monk-bg rounded-xl text-sm outline-none" />
                    <input type="text" placeholder="Google Drive / YouTube Link" value={resUrl} onChange={e => setResUrl(e.target.value)} className="w-full p-3 bg-monk-bg rounded-xl text-sm outline-none" />
                    <div className="flex gap-2">
                      <select value={resType} onChange={e => setResType(e.target.value as any)} className="flex-1 p-3 bg-monk-bg rounded-xl text-xs font-bold outline-none">
                        <option value="notes">NOTES (DRIVE)</option>
                        <option value="videos">VIDEO (YOUTUBE)</option>
                      </select>
                      <button onClick={handleSaveResource} className="p-3 bg-monk-dark text-white rounded-xl"><Plus size={20} /></button>
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {([...(activeSub.notes || []), ...(activeSub.videos || [])]).map((res: any, i: number) => (
                      <a key={i} href={res.url} target="_blank" className="flex items-center justify-between p-3 bg-monk-bg rounded-xl">
                        <div className="flex items-center gap-2">
                          {res.url.includes('youtube') ? <Video size={14} className="text-red-500" /> : <FileText size={14} className="text-monk-olive" />}
                          <span className="text-xs font-bold text-monk-dark truncate max-w-[150px]">{res.title}</span>
                        </div>
                        <ExternalLink size={14} className="text-monk-sand" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {view === 'exam' && (
                <div className="space-y-6">
                  <div className="p-4 bg-monk-bg rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Entry Database</p>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Score" value={score} onChange={e => setScore(e.target.value)} className="w-full p-3 rounded-xl bg-white outline-none text-sm font-bold" />
                      <input type="number" placeholder="Total" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-3 rounded-xl bg-white outline-none text-sm font-bold" />
                      <button onClick={() => { vibrate(40); updateSubject(activeSub.id, { marks: [...(activeSub.marks || []), { score, total, date: new Date() }] }); setScore(""); setTotal(""); }} className="p-3 bg-monk-dark text-white rounded-xl"><Save size={20} /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full p-3 bg-monk-bg rounded-xl text-sm outline-none" />
                    <div className="flex gap-2">
                      <select value={examLevel} onChange={e => setExamLevel(e.target.value as any)} className="flex-1 p-3 bg-monk-bg rounded-xl text-xs font-bold">
                        <option value="High">HIGH GRADE</option>
                        <option value="Low">LOW GRADE</option>
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
                  </button>
                </div>
              )}

              {view === 'exam' && (
                <div className="space-y-6">
                  <div className="p-4 bg-monk-bg rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Add Mock Score</p>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Score" value={score} onChange={e => setScore(e.target.value)} className="w-full p-3 rounded-xl bg-white outline-none text-sm font-bold" />
                      <input type="number" placeholder="Total" value={total} onChange={e => setTotal(e.target.value)} className="w-full p-3 rounded-xl bg-white outline-none text-sm font-bold" />
                      <button onClick={saveMarks} className="p-3 bg-monk-dark text-white rounded-xl"><Save size={20} /></button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Upcoming Exams</p>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {(activeSub.exams || []).map((ex: any) => (
                        <div key={ex.id} className="flex items-center justify-between p-3 bg-white border border-monk-bg rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${ex.type === 'High' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                            <span className="text-xs font-bold text-monk-dark truncate max-w-[100px]">{ex.title || "Exam"}</span>
                          </div>
                          <span className="text-[10px] font-bold text-monk-olive uppercase">{getCountdown(ex.date)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-2 border-t border-monk-sand/30">
                      <input type="text" placeholder="Exam Title" value={examTitle} onChange={e => setExamTitle(e.target.value)} className="w-full p-2 bg-monk-bg rounded-lg text-xs outline-none" />
                      <div className="flex gap-2">
                        <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="flex-1 p-2 bg-monk-bg rounded-lg text-xs outline-none" />
                        <select value={examLevel} onChange={e => setExamLevel(e.target.value as any)} className="p-2 bg-monk-bg rounded-lg text-[10px] font-bold outline-none">
                          <option value="High">HIGH</option>
                          <option value="Low">LOW</option>
                        </select>
                        <button onClick={saveExam} className="p-2 bg-monk-dark text-white rounded-lg"><Plus size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {view === 'resources' && (
                <div className="space-y-4">
                   <p className="text-[10px] font-bold text-monk-muted uppercase tracking-widest px-1">Drive Notes & Videos</p>
                   <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(activeSub.notes || []).map((note: any, i: number) => (
                      <a key={i} href={note.url} target="_blank" className="flex items-center justify-between p-4 bg-monk-bg rounded-2xl group">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-monk-olive" />
                          <span className="text-xs font-bold text-monk-dark">{note.title}</span>
                        </div>
                        <ExternalLink size={14} className="text-monk-sand" />
                      </a>
                    ))}
                    {(activeSub.videos || []).map((vid: any, i: number) => (
                      <a key={i} href={vid.url} target="_blank" className="flex items-center justify-between p-4 bg-monk-bg rounded-2xl group">
                        <div className="flex items-center gap-3">
                          <Video size={18} className="text-red-500" />
                          <span className="text-xs font-bold text-monk-dark">{vid.title}</span>
                        </div>
                        <ExternalLink size={14} className="text-monk-sand" />
                      </a>
                    ))}
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
