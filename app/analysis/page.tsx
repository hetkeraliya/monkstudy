"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

interface Mark { score: number; total: number; date: string; }
interface Exam { id: string; type: 'High' | 'Mid' | 'Low'; date: string; title: string; }
interface TooltipData { x: number; y: number; label: string; val: number; color: string; }

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => setMounted(true), []);

  const graphWidth = 300;
  const graphHeight = 120;

  // 1. Subject-Specific Graph Logic
  const subjectConfigs = [
    { id: 'phy', name: 'Physics', color: '#10b981', light: '#ecfdf5' },
    { id: 'chem', name: 'Chemistry', color: '#84cc16', light: '#f7fee7' },
    { id: 'math', name: 'Maths', color: '#f59e0b', light: '#fffbeb' }
  ];

  const getPoints = (marks: Mark[]) => {
    if (!marks || marks.length < 1) return { path: "", points: [] };
    const points = marks.map((m, i) => {
      const x = marks.length === 1 ? graphWidth / 2 : (i / (marks.length - 1)) * graphWidth;
      const val = Math.round((m.score / (m.total || 100)) * 100);
      const y = graphHeight - (val / 100) * graphHeight;
      return { x, y, val, label: `Test ${i + 1}` };
    });
    return { path: points.length > 1 ? points.map(p => `${p.x},${p.y}`).join(" ") : "", points };
  };

  const getCountdown = (date: string) => {
    const d = new Date(date); d.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Intelligence</h1>
        <p className="text-[10px] text-monk-muted font-bold uppercase tracking-widest mt-1">Real-time Performance Metrics</p>
      </header>

      {/* Subject Performance Hub */}
      {subjectConfigs.map((config) => {
        const subData = subjects.find(s => s.id === config.id);
        const { path, points } = getPoints(subData?.marks || []);
        const exams = (subData?.exams || []) as Exam[];

        return (
          <motion.section 
            key={config.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-tighter" style={{ color: config.color }}>{config.name}</h3>
              <span className="text-[10px] font-bold text-monk-muted uppercase">{points.length} Tests Logged</span>
            </div>

            {/* Subject Graph */}
            <div className="matte-card p-5 shadow-matte relative overflow-hidden" style={{ backgroundColor: config.light }}>
              <div className="relative h-32 w-full">
                <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {path && <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} fill="none" stroke={config.color} strokeWidth="4" points={path} strokeLinecap="round" strokeLinejoin="round" />}
                  {points.map((p, i) => (
                    <circle 
                      key={i} cx={p.x} cy={p.y} r="6" fill={config.color} stroke="white" strokeWidth="2"
                      onClick={() => { vibrate(20); setTooltip({ ...p, color: config.color, label: `${config.name} ${p.label}` }); }}
                      className="cursor-pointer active:scale-150 transition-transform"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Subject Specific Exams */}
            <div className="space-y-2">
              {exams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
                <div key={ex.id} className="matte-card p-4 flex justify-between items-center border-l-4" style={{ borderLeftColor: config.color }}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-monk-dark">{ex.title}</span>
                    <span className="text-[9px] font-bold text-monk-muted uppercase">{ex.type} Priority</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-monk-dark tracking-tighter">{getCountdown(ex.date)}</span>
                    <button 
                      onClick={() => { vibrate(60); updateSubject(config.id, { exams: exams.filter(e => e.id !== ex.id) }); }}
                      className="p-2 text-monk-sand active:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {points.length === 0 && (
              <div className="p-4 border-2 border-dashed border-monk-sand/30 rounded-3xl text-center">
                <p className="text-[9px] font-bold text-monk-muted uppercase tracking-widest">No data for {config.name}</p>
              </div>
            )}
          </motion.section>
        );
      })}

      {/* Tooltip Popup */}
      <AnimatePresence>
        {tooltip && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-white px-6 py-3 rounded-2xl shadow-2xl border-2"
            style={{ borderColor: tooltip.color }}
          >
            <p className="text-[8px] font-black uppercase text-monk-muted mb-0.5">{tooltip.label}</p>
            <p className="text-lg font-black leading-none" style={{ color: tooltip.color }}>{tooltip.val}% Accuracy</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
            }
              
