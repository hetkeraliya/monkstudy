"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, AlertCircle, ChevronRight, BarChart3 } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Logic to calculate average marks for the graph
  const getSubjectStats = (sub: any) => {
    if (!sub.marks || sub.marks.length === 0) return 0;
    const totalPercentage = sub.marks.reduce((acc: number, curr: any) => {
      return acc + (curr.score / curr.total) * 100;
    }, 0);
    return Math.round(totalPercentage / sub.marks.length);
  };

  // Logic to aggregate all upcoming exams across subjects
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
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Performance Stats</h1>
        <p className="text-sm text-monk-muted font-medium">Data-driven JEE prep.</p>
      </header>

      {/* 1. Progress Graph (Subject Averages) */}
      <section className="matte-card p-6 space-y-6 shadow-matte">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-monk-olive" />
          <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Accuracy Graph (%)</h3>
        </div>
        
        <div className="space-y-5">
          {subjects.map((sub) => {
            const avg = getSubjectStats(sub);
            return (
              <div key={sub.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-monk-dark">{sub.name}</span>
                  <span className="text-xs font-black text-monk-olive">{avg}%</span>
                </div>
                <div className="h-2 w-full bg-monk-bg rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${avg}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      avg > 80 ? 'bg-monk-olive' : avg > 50 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-center text-monk-muted italic pt-2">
          Based on your mock test database entry.
        </p>
      </section>

      {/* 2. Global Exam Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Exam Countdown</h3>
          <span className="text-[10px] font-bold text-monk-olive">{allExams.filter(e => getCountdown(e.date) !== "Passed").length} Upcoming</span>
        </div>

        <div className="space-y-3">
          {allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={ex.id} 
              className="matte-card p-4 flex items-center justify-between border-l-4"
              style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-monk-dark">{ex.title || "Unit Test"}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-monk-bg rounded text-monk-muted uppercase">
                    {ex.subjectName}
                  </span>
                </div>
                <span className="text-[10px] text-monk-muted mt-0.5">{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-black text-monk-dark tracking-tighter leading-none">
                  {getCountdown(ex.date)}
                </p>
                <p className="text-[9px] font-bold text-monk-muted uppercase tracking-tighter">Remaining</p>
              </div>
            </motion.div>
          ))}
          
          {allExams.length === 0 && (
            <div className="p-8 text-center bg-monk-bg/30 rounded-[24px] border border-dashed border-monk-sand">
              <Calendar className="mx-auto text-monk-sand mb-2" size={24} />
              <p className="text-xs text-monk-muted font-bold">No exams scheduled in Home tab.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
