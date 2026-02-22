"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar } from "lucide-react";
import { useStore } from "../../store/useStore"; // Fixed import path

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects } = useStore();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const getSubjectStats = (sub: any) => {
    if (!sub.marks || sub.marks.length === 0) return 0;
    const totalPercentage = sub.marks.reduce((acc: number, curr: any) => acc + (curr.score / curr.total) * 100, 0);
    return Math.round(totalPercentage / sub.marks.length);
  };

  const allExams = subjects.flatMap(sub => (sub.exams || []).map(ex => ({ ...ex, subjectName: sub.name })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCountdown = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Analysis</h1>
      </header>

      {/* Accuracy Graph */}
      <section className="matte-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-monk-olive" />
          <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Accuracy Graph</h3>
        </div>
        <div className="space-y-5">
          {subjects.map((sub) => {
            const avg = getSubjectStats(sub);
            return (
              <div key={sub.id} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>{sub.name}</span>
                  <span>{avg}%</span>
                </div>
                <div className="h-2 bg-monk-bg rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${avg}%` }} className="h-full bg-monk-olive" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Countdown */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase px-1">Global Exam Timeline</h3>
        {allExams.filter(e => getCountdown(e.date) !== "Passed").map((ex) => (
          <div key={ex.id} className="matte-card p-4 flex justify-between items-center border-l-4" 
               style={{ borderLeftColor: ex.type === 'High' ? '#ef4444' : ex.type === 'Mid' ? '#fb923c' : '#60a5fa' }}>
            <div className="flex flex-col">
              <span className="text-xs font-bold">{ex.title} ({ex.subjectName})</span>
              <span className="text-[10px] text-monk-muted">{ex.date}</span>
            </div>
            <span className="text-lg font-black">{getCountdown(ex.date)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
