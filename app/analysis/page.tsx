"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

interface TooltipData {
  x: number;
  y: number;
  label: string;
  val: number;
  color: string;
}

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // useMemo ensures the list updates the moment 'subjects' changes in the store
  const allExams = useMemo(() => {
    return subjects.flatMap(sub => 
      (sub.exams || []).map(ex => ({ ...ex, subjectId: sub.id, subjectName: sub.name }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [subjects]);

  if (!mounted) return null;

  const graphWidth = 300;
  const graphHeight = 150;

  const getCountdown = (date: string) => {
    if (!date) return "N/A";
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diff = examDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days < 0) return "Passed";
    return `${days}d`;
  };

  const deleteExam = (subjectId: string, examId: string) => {
    vibrate(60);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      const filtered = subject.exams.filter(e => e.id !== examId);
      updateSubject(subjectId, { exams: filtered });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
      </header>

      {/* Interactive Trend Graph */}
      <section className="matte-card p-6 shadow-matte relative overflow-hidden">
        {/* ... (Graph logic remains same as previous version) */}
      </section>

      {/* Fixed Global Timeline Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Global Timeline</h3>
          <Clock size={14} className="text-monk-muted" />
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {allExams.length > 0 ? (
              allExams
                .filter(e => getCountdown(e.date) !== "Passed")
                .map((ex) => (
                  <motion.div 
                    key={ex.id} 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="matte-card p-4 flex justify-between items-center border-l-4" 
                    style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-monk-dark truncate max-w-[120px]">{ex.title || "Exam"}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-monk-bg rounded text-monk-muted uppercase">
                          {ex.subjectName}
                        </span>
                      </div>
                      <span className="text-[10px] text-monk-muted font-medium italic">
                        {new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xl font-black text-monk-dark tracking-tighter leading-none">
                          {getCountdown(ex.date)}
                        </span>
                        <span className="text-[8px] font-bold text-monk-muted uppercase tracking-tighter block">Remaining</span>
                      </div>
                      <button 
                        onClick={() => deleteExam(ex.subjectId, ex.id)}
                        className="p-2 bg-monk-bg rounded-lg text-monk-muted active:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="p-10 text-center bg-monk-bg/30 rounded-[28px] border border-dashed border-monk-sand">
                <Calendar className="mx-auto text-monk-sand mb-2" size={24} />
                <p className="text-[10px] text-monk-muted font-bold uppercase">No upcoming deadlines found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
                    }
        
