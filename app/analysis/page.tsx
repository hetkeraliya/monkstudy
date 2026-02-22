"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Calendar, Clock } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

// Defined the Tooltip type to match exactly what our points provide
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

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const graphWidth = 300;
  const graphHeight = 150;

  const getDataPoints = (marks: any[], subName: string) => {
    if (!marks || marks.length === 0) return { path: "", points: [] };
    const points = marks.map((m, i) => {
      const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
      const total = m.total || 100;
      const val = Math.round((m.score / total) * 100); // Renamed to 'val' to match tooltip
      const y = graphHeight - (val / 100) * graphHeight;
      return { x, y, val, label: `${subName} Test ${i + 1}` };
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

  const allExams = subjects.flatMap(sub => 
    (sub.exams || []).map(ex => ({ ...ex, subjectId: sub.id, subjectName: sub.name }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
      </header>

      <section className="matte-card p-6 shadow-matte relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-monk-olive" />
          <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Growth Trend</h3>
        </div>

        <div className="relative h-44 w-full bg-monk-bg/40 rounded-2xl p-6 border border-monk-sand/20">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
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

      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest px-1">Global Timeline</h3>
        <div className="space-y-3">
          {allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
            <div key={ex.id} className="matte-card p-4 flex justify-between items-center border-l-4" 
                 style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-monk-dark">{ex.title}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-monk-bg rounded text-monk-muted uppercase">{ex.subjectName}</span>
                </div>
                <span className="text-[10px] text-monk-muted font-medium">{ex.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-monk-dark tracking-tighter">{getCountdown(ex.date)}</span>
                <button onClick={() => updateSubject(ex.subjectId, { exams: (subjects.find(s => s.id === ex.subjectId)?.exams || []).filter(e => e.id !== ex.id) })} className="p-2 bg-monk-bg rounded-lg text-monk-muted">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
      }
                  
