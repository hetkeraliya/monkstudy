"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Clock, Calendar } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

// 1. Define Strict Interfaces
interface Mark {
  score: number;
  total: number;
  date: string;
}

interface Exam {
  id: string;
  type: 'High' | 'Mid' | 'Low';
  date: string;
  title: string;
}

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

  useEffect(() => { setMounted(true); }, []);

  const graphWidth = 300;
  const graphHeight = 150;

  // 2. Type-Safe Graph Data
  const datasets = useMemo(() => {
    const config = [
      { id: 'phy', name: 'Physics', color: '#384D48' },
      { id: 'chem', name: 'Chemistry', color: '#ACAD94' },
      { id: 'math', name: 'Maths', color: '#fb923c' }
    ];

    return config.map(subConfig => {
      const subject = subjects.find(s => s.id === subConfig.id);
      const marks = (subject?.marks || []) as Mark[];
      
      if (marks.length === 0) return { ...subConfig, path: "", points: [] };

      const points = marks.map((m: Mark, i: number) => {
        const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
        const total = m.total || 100;
        const val = Math.round((m.score / total) * 100);
        const y = graphHeight - (val / 100) * graphHeight;
        return { x, y, val, label: `${subConfig.name} Test ${i + 1}` };
      });

      return { ...subConfig, path: points.map(p => `${p.x},${p.y}`).join(" "), points };
    });
  }, [subjects]);

  // 3. Type-Safe Consolidated Exams
  const allExams = useMemo(() => {
    return subjects.flatMap(sub => 
      ((sub.exams || []) as Exam[]).map((ex: Exam) => ({ 
        ...ex, 
        subjectId: sub.id, 
        subjectName: sub.name 
      }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [subjects]);

  if (!mounted) return null;

  const getCountdown = (date: string) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  // 4. Fixed Delete Function with Explicit Types
  const handleRemoveExam = (subjectId: string, examId: string) => {
    vibrate(60);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      const existingExams = (subject.exams || []) as Exam[];
      const updatedExams = existingExams.filter((e: Exam) => e.id !== examId);
      updateSubject(subjectId, { exams: updatedExams });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
      </header>

      {/* Accuracy Trend Graph */}
      <section className="matte-card p-6 shadow-matte relative overflow-hidden">
        <div className="relative h-44 w-full bg-monk-bg/40 rounded-2xl p-6 border border-monk-sand/20">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {datasets.map(ds => (
              <g key={ds.id}>
                {ds.points.length > 1 && (
                  <polyline fill="none" stroke={ds.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={ds.path} />
                )}
                {ds.points.map((p, i) => (
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
          <AnimatePresence>
            {tooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ left: `${(tooltip.x / graphWidth) * 100}%`, top: `${(tooltip.y / graphHeight) * 100}%` }}
                className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
              >
                <div className="bg-white px-3 py-2 rounded-xl shadow-2xl border border-monk-bg text-center">
                  <p className="text-[7px] font-black uppercase text-monk-muted mb-0.5">{tooltip.label}</p>
                  <p className="text-sm font-black" style={{ color: tooltip.color }}>{tooltip.val}% Accuracy</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Global Countdown */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest px-1">Global Countdown</h3>
        {allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
          <div key={ex.id} className="matte-card p-4 flex justify-between items-center border-l-4" 
               style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-monk-dark">{ex.title}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-monk-bg rounded text-monk-muted uppercase">{ex.subjectName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-black text-monk-dark tracking-tighter">{getCountdown(ex.date)}</span>
              <button 
                onClick={() => handleRemoveExam(ex.subjectId, ex.id)} 
                className="p-2 bg-monk-bg rounded-lg text-monk-muted active:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
        }
            
