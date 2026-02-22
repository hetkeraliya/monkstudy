"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Info } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();
  
  // State for the interactive popup
  const [tooltip, setTooltip] = useState<{ x: number, y: number, label: string, val: number, color: string } | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const graphWidth = 300;
  const graphHeight = 150;

  // Helper to calculate coordinates and store them for clickability
  const getDataPoints = (marks: any[], color: string, subName: string) => {
    if (!marks || marks.length < 1) return { path: "", circles: [] };
    
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

  const phyData = getDataPoints(subjects.find(s => s.id === 'phy')?.marks || [], "#384D48", "Physics");
  const chemData = getDataPoints(subjects.find(s => s.id === 'chem')?.marks || [], "#ACAD94", "Chemistry");
  const mathData = getDataPoints(subjects.find(s => s.id === 'math')?.marks || [], "#fb923c", "Maths");

  const handlePointClick = (p: any, color: string) => {
    vibrate(20);
    setTooltip({ x: p.x, y: p.y, label: p.label, val: p.percentage, color });
    // Auto-hide tooltip after 3 seconds
    setTimeout(() => setTooltip(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
      </header>

      {/* 1. Interactive SVG Graph */}
      <section className="matte-card p-6 shadow-matte relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-monk-olive" />
            <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Interactive Trend</h3>
          </div>
        </div>

        <div className="relative h-48 w-full bg-monk-bg/40 rounded-2xl p-6 border border-monk-sand/20">
          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <line key={v} x1="0" y1={v * graphHeight} x2={graphWidth} y2={v * graphHeight} stroke="#E2E2E2" strokeWidth="1" />
            ))}

            {/* Subject Lines */}
            <polyline fill="none" stroke="#384D48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={phyData.path} />
            <polyline fill="none" stroke="#ACAD94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={chemData.path} />
            <polyline fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={mathData.path} />

            {/* Clickable Points (Hotboxes) */}
            {[
              { data: phyData, color: "#384D48" },
              { data: chemData, color: "#ACAD94" },
              { data: mathData, color: "#fb923c" }
            ].map(group => group.data.points.map((p, i) => (
              <circle 
                key={`${group.color}-${i}`}
                cx={p.x} cy={p.y} r="6" 
                fill={group.color} stroke="white" strokeWidth="2"
                onClick={() => handlePointClick(p, group.color)}
                className="cursor-pointer active:scale-150 transition-transform"
              />
            )))}
          </svg>

          {/* Interactive Tooltip Bubble */}
          <AnimatePresence>
            {tooltip && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ 
                  left: `${(tooltip.x / graphWidth) * 100}%`, 
                  top: `${(tooltip.y / graphHeight) * 100}%` 
                }}
                className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
              >
                <div className="bg-white px-3 py-2 rounded-xl shadow-2xl border border-monk-bg min-w-[80px]">
                  <p className="text-[8px] font-black uppercase text-monk-muted mb-0.5">{tooltip.label}</p>
                  <p className="text-sm font-black" style={{ color: tooltip.color }}>{tooltip.val}% Accuracy</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Delete Exams Section (Kept from before) */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em] px-1">Upcoming Exams</h3>
        <div className="space-y-3">
          {/* ... (Existing Exam list with Trash2 icon) ... */}
        </div>
      </section>
    </div>
  );
          }
