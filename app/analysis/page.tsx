"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Clock, Calendar } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

interface Mark { score: number; total: number; date: string; }
interface Exam { id: string; type: 'High' | 'Mid' | 'Low'; date: string; title: string; }
interface TooltipData { x: number; y: number; label: string; val: number; color: string; }

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const graphWidth = 300;
  const graphHeight = 150;

  const datasets = useMemo(() => {
    const config = [
      { id: 'phy', name: 'Physics', color: '#384D48' },
      { id: 'chem', name: 'Chemistry', color: '#ACAD94' },
      { id: 'math', name: 'Maths', color: '#fb923c' }
    ];

    return config.map(conf => {
      const sub = subjects.find(s => s.id === conf.id);
      const marks = (sub?.marks || []) as Mark[];
      if (marks.length === 0) return { ...conf, path: "", points: [] };

      const points = marks.map((m: Mark, i: number) => {
        const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
        const val = Math.round((m.score / (m.total || 100)) * 100);
        const y = graphHeight - (val / 100) * graphHeight;
        return { x, y, val, label: `${conf.name} T${i + 1}` };
      });

      return { ...conf, path: points.length > 1 ? points.map(p => `${p.x},${p.y}`).join(" ") : "", points };
    });
  }, [subjects]);

  const allExams = useMemo(() => {
    return subjects.flatMap(sub => 
      ((sub.exams || []) as Exam[]).map((ex: Exam) => ({ ...ex, subId: sub.id, subName: sub.name }))
    ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [subjects]);

  if (!mounted) return null;

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
                {ds.path && <polyline fill="none" stroke={ds.color} strokeWidth="3" points={ds.path} strokeLinecap="round" strokeLinejoin="round" />}
                {ds.points.map((p, i) => (
                  <circle 
                    key={i} cx={p.x} cy={p.y} r="6" fill={ds.color} stroke="white" strokeWidth="2"
                    onClick={() => { vibrate(20); setTooltip({ ...p, color: ds.color }); }}
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
                className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3 bg-white px-3 py-1 rounded-xl shadow-2xl border"
              >
                <p className="text-[10px] font-black" style={{ color: tooltip.color }}>{tooltip.val}%</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Global Countdown */}
      <section className="space-y-3">
        {allExams.filter(e => new Date(e.date) >= new Date()).map((ex) => (
          <div key={ex.id} className="matte-card p-4 flex justify-between items-center border-l-4" 
               style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-monk-dark">{ex.title}</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-monk-bg rounded text-monk-muted uppercase">{ex.subName}</span>
            </div>
            <button 
              onClick={() => updateSubject(ex.subId, { exams: (subjects.find(s => s.id === ex.subId)?.exams || []).filter((e: any) => e.id !== ex.id) })}
              className="p-2 text-monk-sand"
            ><Trash2 size={16} /></button>
          </div>
        ))}
      </section>
    </div>
  );
}
