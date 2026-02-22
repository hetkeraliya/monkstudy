"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar, TrendingUp, Info } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects } = useStore();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Configuration for our Custom SVG Graph
  const graphWidth = 300;
  const graphHeight = 150;

  // Function to convert marks into SVG coordinates
  const getPoints = (marks: any[]) => {
    if (!marks || marks.length < 2) return "";
    return marks.map((m, i) => {
      const x = (i / (marks.length - 1)) * graphWidth;
      const percentage = (m.score / m.total) * 100;
      const y = graphHeight - (percentage / 100) * graphHeight;
      return `${x},${y}`;
    }).join(" ");
  };

  const allExams = subjects.flatMap(sub => 
    (sub.exams || []).map(ex => ({ ...ex, subjectName: sub.name }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Performance Intel</h1>
        <p className="text-sm text-monk-muted font-medium">Native SVG progress tracking.</p>
      </header>

      {/* 1. The Custom SVG Line Graph */}
      <section className="matte-card p-6 shadow-matte overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-monk-olive" />
            <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Accuracy Trend (%)</h3>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-monk-dark" /><span className="text-[8px] font-bold text-monk-muted">P</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-monk-olive" /><span className="text-[8px] font-bold text-monk-muted">C</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-[8px] font-bold text-monk-muted">M</span></div>
          </div>
        </div>

        <div className="relative h-40 w-full bg-monk-bg/30 rounded-2xl p-4">
          <svg 
            viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid Lines */}
            {[0, 25, 50, 75, 100].map((tick) => (
              <line 
                key={tick}
                x1="0" y1={(tick / 100) * graphHeight} 
                x2={graphWidth} y2={(tick / 100) * graphHeight} 
                stroke="#E2E2E2" strokeWidth="1"
              />
            ))}

            {/* Subject Lines */}
            <polyline
              fill="none" stroke="#384D48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              points={getPoints(subjects.find(s => s.id === 'phy')?.marks || [])}
            />
            <polyline
              fill="none" stroke="#ACAD94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              points={getPoints(subjects.find(s => s.id === 'chem')?.marks || [])}
            />
            <polyline
              fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              points={getPoints(subjects.find(s => s.id === 'math')?.marks || [])}
            />
          </svg>
        </div>
        
        {subjects.every(s => s.marks.length < 2) && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
            <Info size={14} className="text-blue-500 mt-0.5" />
            <p className="text-[10px] text-blue-700 leading-tight">
              Add at least <b>2 mock test entries</b> in the Home tab to see your trend lines.
            </p>
          </div>
        )}
      </section>

      {/* 2. Global Exam Timeline */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest px-1">Upcoming JEE Deadlines</h3>
        <div className="space-y-3">
          {allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
            <div 
              key={ex.id} 
              className="matte-card p-4 flex justify-between items-center border-l-4" 
              style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}
            >
              <div>
                <span className="text-xs font-bold block text-monk-dark">{ex.title}</span>
                <span className="text-[9px] font-bold text-monk-muted uppercase">{ex.subjectName} • {ex.type} PRIORITY</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-monk-dark tracking-tighter block">{getCountdown(ex.date)}</span>
                <span className="text-[9px] font-bold text-monk-muted uppercase">Remaining</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
                }
