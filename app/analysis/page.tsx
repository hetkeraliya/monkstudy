"use client";

import { useState, useEffect, useRef } from "react";
import { Award, Target, TrendingUp, Calendar, Trash2, ShieldCheck } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const { subjects, updateSubject } = useStore();
  const chartRefs = useRef<any>({});

  // 1. Logic for Subject Performance Summary
  const summary = (() => {
    const stats = subjects.map((s: any) => {
      const avg = s.marks.length > 0 
        ? Math.round(s.marks.reduce((acc: number, m: any) => acc + (m.score / m.total) * 100, 0) / s.marks.length)
        : 0;
      return { name: s.name, avg, id: s.id };
    });
    const sorted = [...stats].sort((a, b) => b.avg - a.avg);
    return { 
      best: sorted[0].avg > 0 ? sorted[0] : { name: "N/A", avg: 0 },
      worst: sorted[2].avg > 0 ? sorted[2] : { name: "N/A", avg: 0 }
    };
  })();

  useEffect(() => {
    setMounted(true);
    // Dynamically load Chart.js from CDN since we can't use terminal
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.async = true;
    script.onload = () => renderCharts();
    document.body.appendChild(script);

    return () => { document.body.removeChild(script); };
  }, [subjects]);

  const renderCharts = () => {
    const Chart = (window as any).Chart;
    if (!Chart) return;

    subjects.forEach((sub: any) => {
      const ctx = document.getElementById(`chart-${sub.id}`) as HTMLCanvasElement;
      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartRefs.current[sub.id]) chartRefs.current[sub.id].destroy();

      const color = sub.id === 'phy' ? '#10b981' : sub.id === 'chem' ? '#84cc16' : '#f59e0b';
      
      chartRefs.current[sub.id] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sub.marks.map((_: any, i: number) => `Test ${i + 1}`),
          datasets: [{
            label: 'Accuracy %',
            data: sub.marks.map((m: any) => Math.round((m.score / m.total) * 100)),
            borderColor: color,
            backgroundColor: `${color}20`,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: color
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, grid: { color: '#f0f0f0' }, ticks: { font: { weight: 'bold' } } },
            x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
          }
        }
      });
    });
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Performance Intelligence</h1>
          <p className="text-slate-500 font-medium">Advanced Data Analytics for JEE Prep</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-600">Strongest Domain</p>
              <p className="text-lg font-black text-slate-800">{summary.best.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Subject Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {subjects.map((sub: any) => (
          <div key={sub.id} className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{sub.name}</h3>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                sub.id === 'phy' ? 'bg-emerald-100 text-emerald-700' : 
                sub.id === 'chem' ? 'bg-lime-100 text-lime-700' : 'bg-amber-100 text-amber-700'
              }`}>
                Trend: {sub.marks.length > 0 ? 'Active' : 'No Data'}
              </div>
            </div>

            {/* Proper Canvas Graph */}
            <div className="h-48 w-full mb-6">
              <canvas id={`chart-${sub.id}`}></canvas>
            </div>

            {/* Subject-Specific Exams */}
            <div className="mt-auto space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Upcoming Milestones</p>
              {sub.exams.length > 0 ? sub.exams.map((ex: any) => (
                <div key={ex.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center group">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{ex.title}</p>
                    <p className="text-[9px] font-medium text-slate-400">{ex.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{ex.type}</span>
                    <button 
                      onClick={() => { vibrate(60); updateSubject(sub.id, { exams: sub.exams.filter((e: any) => e.id !== ex.id) }) }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-300 italic text-center py-4">No exams scheduled</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
                  }
