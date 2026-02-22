"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Info, ChevronRight, BookOpen } from "lucide-react";
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

  const getDataPoints = (marks: any[], subName: string) => {
    // Return empty points if no marks exist to prevent undefined errors
    if (!marks || marks.length === 0) return { path: "", points: [] };
    
    const points = marks.map((m, i) => {
      const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
      const total = m.total || 100;
      const percentage = Math.round((m.score / total) * 100);
      const y = graphHeight - (percentage / 100) * graphHeight;
      return { x, y, percentage, label: `${subName} Test ${i + 1}` };
    });

    const path = points.map(p => `${p.x},${p.y}`).join(" ");
    return { path, points };
  };

  const datasets = [
    { id: 'phy', name: 'Physics', color: '#384D48' },
    { id: 'chem', name: 'Chemistry', color: '#ACAD94' },
    { id: 'math', name: 'Maths', color: '#fb923c' }
  ].map(conf => ({
    ...conf,
    data: getDataPoints(subjects.find(s => s.id === conf.id)?.marks || [], conf.name)
  }));

  const handlePointClick = (p: any, color: string) => {
    vibrate(20);
    setTooltip({ x: p.x, y: p.y, label: p.label, val: p.percentage, color });
    setTimeout(() => setTooltip(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
      </header>

      {/* Interactive SVG Graph */}
      <section className="matte-card p-6 shadow-matte relative">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-monk-olive" />
          <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Interactive Trend</h3>
        </div>

        <div className="relative h-48 w-full bg-monk-bg/40 rounded-2xl p-6 border border-monk-sand/20">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <line key={v} x1="0" y1={v * graphHeight} x2={graphWidth} y2={v * graphHeight} stroke="#E2E2E2" strokeWidth="1" />
            ))}

            {/* Subject Lines and Hotbox Points */}
            {datasets.map(ds => (
              <g key={ds.id}>
                <polyline fill="none" stroke={ds.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={ds.data.path} />
                {ds.data.points.map((p, i) => (
                  <circle 
                    key={i} cx={p.x} cy={p.y} r="6" 
                    fill={ds.color} stroke="white" strokeWidth="2"
                    onClick={() => handlePointClick(p, ds.color)}
                    className="cursor-pointer active:scale-150 transition-transform"
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
                className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
              >
                <div className="bg-white px-3 py-2 rounded-xl shadow-2xl border border-monk-bg text-center">
                  <p className="text-[8px] font-black uppercase text-monk-muted leading-none mb-1">{tooltip.label}</p>
                  <p className="text-sm font-black" style={{ color: tooltip.color }}>{tooltip.val}%</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Syllabus Progress Tracker */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest px-1">Syllabus Progress</h3>
        <div className="grid grid-cols-1 gap-3">
          {subjects.map(sub => (
            <div key={sub.id} className="matte-card p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-monk-olive" />
                  <span className="text-sm font-bold text-monk-dark">{sub.name}</span>
                </div>
                <span className="text-xs font-black text-monk-muted">45% Done</span>
              </div>
              <div className="h-2 w-full bg-monk-bg rounded-full overflow-hidden">
                <div className="h-full bg-monk-olive w-[45%] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
            }
