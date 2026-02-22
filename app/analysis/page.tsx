"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Calendar, TrendingUp, Info, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Constants for SVG Graph
  const graphWidth = 300;
  const graphHeight = 150;

  // Fixed Point Calculation: Maps percentage to Y coordinate
  const getPoints = (marks: any[]) => {
    if (!marks || marks.length < 2) return "";
    return marks.map((m, i) => {
      const x = (i / (marks.length - 1)) * graphWidth;
      // Safety check: ensure total is never 0 to avoid division error
      const total = m.total || 100;
      const percentage = (m.score / total) * 100;
      const y = graphHeight - (percentage / 100) * graphHeight;
      return `${x},${y}`;
    }).join(" ");
  };

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
      const filteredExams = subject.exams.filter(ex => ex.id !== examId);
      updateSubject(subjectId, { exams: filteredExams });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
      </header>

      {/* 1. The SVG Progress Graph */}
      <section className="matte-card p-6 shadow-matte">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-monk-olive" />
            <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Growth Trend</h3>
          </div>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-monk-dark" />
             <div className="w-2 h-2 rounded-full bg-monk-olive" />
             <div className="w-2 h-2 rounded-full bg-orange-400" />
          </div>
        </div>

        <div className="relative h-40 w-full bg-monk-bg/40 rounded-2xl p-4 border border-monk-sand/20">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Subject Trend Polylines */}
            <polyline fill="none" stroke="#384D48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={getPoints(subjects.find(s => s.id === 'phy')?.marks || [])} />
            <polyline fill="none" stroke="#ACAD94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={getPoints(subjects.find(s => s.id === 'chem')?.marks || [])} />
            <polyline fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={getPoints(subjects.find(s => s.id === 'math')?.marks || [])} />
          </svg>
        </div>
      </section>

      {/* 2. Global Timeline with Delete System */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em] px-1">Upcoming Exams</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
              <motion.div 
                key={ex.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="matte-card p-4 flex justify-between items-center border-l-4" 
                style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-monk-dark">{ex.title}</span>
                  <span className="text-[9px] font-bold text-monk-muted uppercase">{ex.subjectName}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xl font-black text-monk-dark tracking-tighter block">{getCountdown(ex.date)}</span>
                  </div>
                  <button 
                    onClick={() => deleteExam(ex.subjectId, ex.id)}
                    className="p-2 bg-monk-bg rounded-lg text-monk-muted active:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
