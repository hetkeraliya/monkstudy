"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Calendar, Clock, ChevronRight } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();
  const [tooltip, setTooltip] = useState<{ x: number, y: number, label: string, val: number, color: string } | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const graphWidth = 300;
  const graphHeight = 150;

  // Logic to process marks into coordinates
  const getDataPoints = (marks: any[], subName: string) => {
    if (!marks || marks.length === 0) return { path: "", points: [] };
    const points = marks.map((m, i) => {
      const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
      const total = m.total || 100;
      const percentage = Math.round((m.score / total) * 100);
      const y = graphHeight - (percentage / 100) * graphHeight;
      return { x, y, percentage, label: `${subName} Test ${i + 1}` };
    });
    return { path: points.map(p => `${p.x},${p.y}`).join(" "), points };
  };

  const datasets = [
    { id: 'phy', name: 'Physics', color: '#384D48' },
    { id: 'chem', name: 'Chemistry', color: '#ACAD94' },
    { id: 'math', name: 'Maths', color: '#fb923c' }
  ].map(conf => ({
    ...conf,
    data: getDataPoints(subjects.find(s => s.id === conf.id)?.marks || [], conf.name)
  }));

  // Global Countdown Logic
  const allExams = subjects.flatMap(sub => 
    (sub.exams || []).map(ex => ({ ...ex, subjectId: sub.id, subjectName: sub.name }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  const deleteExam = (subjectId: string, examId: string) => {
    vibrate(60);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      updateSubject(subjectId, { exams: subject.exams.filter(ex => ex.id !== examId) });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
      </header>

      {/* 1. Clickable Performance Graph */}
      <section className="matte-card p-6 shadow-matte relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-monk-olive" />
            <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Growth Trend</h3>
          </div>
        </div>

        <div className="relative h-44 w-full bg-monk-bg/40 rounded-2xl p-6 border border-monk-sand/20">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Subject Lines */}
            {datasets.map(ds => (
              <g key={ds.id}>
                <polyline fill="none" stroke={ds.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={ds.data.path} />
                {ds.data.points.map((p, i) => (
                  <circle 
                    key={i} cx={p.x} cy={p.y} r="6" 
                    fill={ds.color} stroke="white" strokeWidth="2"
                    onClick={() => { vibrate(20); setTooltip({ ...p, color: ds.color }); }}
                    className="cursor-pointer active:scale-125 transition-transform"
                  />
                ))}
              </g>
            ))}
          </svg>

          {/* Data Bubble */}
          <AnimatePresence>
            {tooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ left: `${(tooltip.x / graphWidth) * 100}%`, top: `${(tooltip.y / graphHeight) * 100}%` }}
                className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
              >
                <div className="bg-white px-3 py-2 rounded-xl shadow-2xl border border-monk-bg text-center min-w-[70px]">
                  <p className="text-[7px] font-black uppercase text-monk-muted mb-0.5">{tooltip.label}</p>
                  <p className="text-sm font-black" style={{ color: tooltip.color }}>{tooltip.val}%</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 2. Consolidated Global Countdown */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Global Timeline</h3>
          <Clock size={14} className="text-monk-muted" />
        </div>
        
        <div className="space-y-3">
          <AnimatePresence>
            {allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
              <motion.div 
                key={ex.id} 
                layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="matte-card p-4 flex justify-between items-center border-l-4" 
                style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-monk-dark">{ex.title}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-monk-bg rounded text-monk-muted uppercase">{ex.subjectName}</span>
                  </div>
                  <span className="text-[10px] text-monk-muted font-medium">{new Date(ex.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xl font-black text-monk-dark tracking-tighter leading-none">{getCountdown(ex.date)}</span>
                    <span className="text-[8px] font-bold text-monk-muted uppercase tracking-tighter block">To Exam</span>
                  </div>
                  <button onClick={() => deleteExam(ex.subjectId, ex.id)} className="p-2 bg-monk-bg rounded-lg text-monk-muted active:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {allExams.length === 0 && (
            <div className="p-8 text-center bg-monk-bg/30 rounded-[28px] border border-dashed border-monk-sand">
              <Calendar className="mx-auto text-monk-sand mb-2" size={24} />
              <p className="text-[10px] text-monk-muted font-bold uppercase">No upcoming deadlines</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
  
