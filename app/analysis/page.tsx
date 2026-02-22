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

  const graphWidth = 300;
  const graphHeight = 150;

  // Process data for the graph coordinates
  const datasets = useMemo(() => {
    const config = [
      { id: 'phy', name: 'Physics', color: '#384D48' },
      { id: 'chem', name: 'Chemistry', color: '#ACAD94' },
      { id: 'math', name: 'Maths', color: '#fb923c' }
    ];

    return config.map(subConfig => {
      const subject = subjects.find(s => s.id === subConfig.id);
      const marks = subject?.marks || [];
      
      if (marks.length === 0) return { ...subConfig, path: "", points: [] };

      const points = marks.map((m, i) => {
        // Horizontal spacing: if 1 point, center it. If more, spread them.
        const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
        const total = m.total || 100;
        const val = Math.round((m.score / total) * 100);
        // Vertical spacing: 100% is at y=0, 0% is at y=graphHeight
        const y = graphHeight - (val / 100) * graphHeight;
        return { x, y, val, label: `${subConfig.name} Test ${i + 1}` };
      });

      const path = points.length > 1 
        ? points.map(p => `${p.x},${p.y}`).join(" ")
        : "";

      return { ...subConfig, path, points };
    });
  }, [subjects]);

  // Consolidate and sort all exams
  const allExams = useMemo(() => {
    return subjects.flatMap(sub => 
      (sub.exams || []).map(ex => ({ ...ex, subjectId: sub.id, subjectName: sub.name }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [subjects]);

  if (!mounted) return null;

  const getCountdown = (date: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days < 0) return "Passed";
    return `${days}d`;
  };

  const deleteExam = (subId: string, examId: string) => {
    vibrate(60);
    const subject = subjects.find(s => s.id === subId);
    if (subject) {
      updateSubject(subId, { exams: subject.exams.filter(e => e.id !== examId) });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
        <p className="text-xs text-monk-muted font-bold uppercase tracking-wider">JEE Performance Hub</p>
      </header>

      {/* 1. Interactive Trend Graph */}
      <section className="matte-card p-6 shadow-matte relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-monk-olive" />
            <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Accuracy Growth</h3>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-monk-dark" />
            <div className="w-2 h-2 rounded-full bg-monk-olive" />
            <div className="w-2 h-2 rounded-full bg-orange-400" />
          </div>
        </div>

        <div className="relative h-44 w-full bg-monk-bg/40 rounded-2xl p-6 border border-monk-sand/20">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Horizontal Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <line key={v} x1="0" y1={v * graphHeight} x2={graphWidth} y2={v * graphHeight} stroke="#E2E2E2" strokeWidth="1" />
            ))}

            {/* Drawing Lines and Interactive Points */}
            {datasets.map(ds => (
              <g key={ds.id}>
                {ds.path && (
                  <motion.polyline 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    fill="none" stroke={ds.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                    points={ds.path} 
                  />
                )}
                {ds.points.map((p, i) => (
                  <circle 
                    key={i} cx={p.x} cy={p.y} r="6" 
                    fill={ds.color} stroke="white" strokeWidth="2"
                    onClick={() => { vibrate(20); setTooltip({ ...p, color: ds.color }); }}
                    className="cursor-pointer active:scale-150 transition-transform"
                  />
                ))}
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip Bubble */}
          <AnimatePresence>
            {tooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ left: `${(tooltip.x / graphWidth) * 100}%`, top: `${(tooltip.y / graphHeight) * 100}%` }}
                className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
              >
                <div className="bg-white px-3 py-2 rounded-xl shadow-2xl border border-monk-bg text-center min-w-[80px]">
                  <p className="text-[7px] font-black uppercase text-monk-muted mb-0.5">{tooltip.label}</p>
                  <p className="text-sm font-black" style={{ color: tooltip.color }}>{tooltip.val}% Accuracy</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {subjects.every(s => s.marks.length < 2) && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
            <AlertCircle size={14} className="text-blue-500" />
            <p className="text-[10px] text-blue-700 font-bold uppercase">Enter 2+ test scores to see trend lines</p>
          </div>
        )}
      </section>

      {/* 2. Global Exam Timeline */}
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
                    key={ex.id} layout
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="matte-card p-4 flex justify-between items-center border-l-4" 
                    style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-monk-dark truncate max-w-[110px]">{ex.title}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-monk-bg rounded text-monk-muted uppercase">{ex.subjectName}</span>
                      </div>
                      <span className="text-[10px] text-monk-muted font-medium italic">
                        {new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xl font-black text-monk-dark tracking-tighter leading-none">{getCountdown(ex.date)}</span>
                        <span className="text-[8px] font-bold text-monk-muted uppercase tracking-tighter block">Remaining</span>
                      </div>
                      <button onClick={() => deleteExam(ex.subjectId, ex.id)} className="p-2 bg-monk-bg rounded-lg text-monk-muted active:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="p-10 text-center bg-monk-bg/30 rounded-[28px] border border-dashed border-monk-sand">
                <Calendar className="mx-auto text-monk-sand mb-2" size={24} />
                <p className="text-[10px] text-monk-muted font-bold uppercase">No upcoming exams found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
            }
                
