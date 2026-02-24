"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Clock, Calendar, AlertCircle } from "lucide-react";
import { useStore, Mark, Exam } from "../../store/useStore";
import { vibrate } from "../../lib/db";

interface TooltipData { x: number; y: number; label: string; val: number; color: string; }

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const graphWidth = 300;
  const graphHeight = 120;

  // Optimized Chart Rendering Logic
  const datasets = useMemo(() => {
    const config = [
      { id: 'phy', name: 'Physics', color: '#384D48' },
      { id: 'chem', name: 'Chemistry', color: '#ACAD94' },
      { id: 'math', name: 'Maths', color: '#6E7271' }
    ];

    return config.map(conf => {
      const subject = subjects.find(s => s.id === conf.id);
      const marks = (subject?.marks || []) as Mark[];
      
      if (marks.length === 0) return { ...conf, path: "", points: [] };

      const points = marks.map((m: Mark, i: number) => {
        const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
        const total = m.total || 100;
        const val = Math.round((m.score / total) * 100);
        const y = graphHeight - (val / 100) * graphHeight;
        return { x, y, val, label: `${conf.name} Test ${i + 1}` };
      });

      return { ...conf, path: points.map(p => `${p.x},${p.y}`).join(" "), points };
    });
  }, [subjects]);

  // Consolidated Global Timeline
  const allExams = useMemo(() => {
    return subjects.flatMap(sub => 
      ((sub.exams || []) as Exam[]).map((ex: Exam) => ({ ...ex, subjectId: sub.id, subjectName: sub.name }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [subjects]);

  const getCountdown = (date: string) => {
    const d = new Date(date); d.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto p-4 bg-[#E2E2E2] min-h-screen">
      <header className="pt-2 px-1">
        <h1 className="text-xl font-black text-[#384D48] tracking-tighter">INTELLIGENCE</h1>
        <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">Data Analysis Engine</p>
      </header>

      {/* Multi-Subject Trend Hub */}
      <section className="bg-white p-5 rounded-[24px] shadow-sm border border-[#D8D4D5] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-[#384D48]" />
          <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">Growth Analytics</h3>
        </div>

        <div className="relative h-40 w-full bg-[#F5F5F5] rounded-xl p-4">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {datasets.map(ds => (
              <g key={ds.id}>
                {ds.points.length > 1 && (
                  <motion.polyline 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    fill="none" stroke={ds.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                    points={ds.path} 
                  />
                )}
                {ds.points.map((p, i) => (
                  <circle 
                    key={i} cx={p.x} cy={p.y} r="5" 
                    fill={ds.color} stroke="white" strokeWidth="2"
                    onClick={() => { vibrate(20); setTooltip({ ...p, color: ds.color }); }}
                  />
                ))}
              </g>
            ))}
          </svg>

          <AnimatePresence>
            {tooltip && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ left: `${(tooltip.x / graphWidth) * 100}%`, top: `${(tooltip.y / graphHeight) * 100}%` }}
                className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3"
              >
                <div className="bg-[#384D48] text-white px-3 py-1.5 rounded-lg shadow-xl text-center">
                  <p className="text-[7px] font-bold uppercase opacity-70 leading-none mb-1">{tooltip.label}</p>
                  <p className="text-xs font-black leading-none">{tooltip.val}% Accuracy</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Sorted Global Timeline */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest px-1">Global Deadlines</h3>
        {allExams.length > 0 ? (
          allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
            <div key={ex.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border-l-4" 
                 style={{ borderLeftColor: ex.type === 'High' ? '#384D48' : '#ACAD94' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#384D48]">{ex.title}</span>
                <span className="text-[9px] font-bold text-[#6E7271] uppercase">{ex.subjectName} • {ex.type} Priority</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-[#384D48] tracking-tighter">{getCountdown(ex.date)}</span>
                <button onClick={() => { vibrate(60); updateSubject(ex.subjectId, { exams: (subjects.find(s => s.id === ex.subjectId)?.exams || []).filter(e => e.id !== ex.id) }) }} className="text-[#D8D4D5] active:text-[#384D48]">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 border-2 border-dashed border-[#D8D4D5] rounded-[32px] text-center">
            <Calendar className="mx-auto text-[#D8D4D5] mb-2" size={24} />
            <p className="text-[10px] font-bold text-[#6E7271] uppercase">No active missions</p>
          </div>
        )}
      </section>
    </div>
  );
}
