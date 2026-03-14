"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Clock, Calendar, Flame, BookOpen } from "lucide-react";
import { useStore, Mark, Exam } from "../../store/useStore";
import { vibrate } from "../../lib/db";

type Tab = "daily" | "weekly" | "monthly";

interface TooltipData {
  x: number;
  y: number;
  label: string;
  val: number;
  color: string;
}

/* ─── helpers ─────────────────────────────────────── */

const toDateKey = (iso: string) => iso.slice(0, 10); // "YYYY-MM-DD"

const startOfWeek = (d: Date) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── bar chart component ──────────────────────────── */

function BarChart({
  bars,
  color = "#384D48",
  unit = "h",
}: {
  bars: { label: string; value: number }[];
  color?: string;
  unit?: string;
}) {
  const max = Math.max(...bars.map((b) => b.value), 0.1);
  const [tooltip, setTooltip] = useState<{ idx: number } | null>(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-28 w-full">
        {bars.map((bar, i) => {
          const heightPct = (bar.value / max) * 100;
          const isActive = tooltip?.idx === i;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end gap-1 h-full relative"
              onTouchStart={() => { vibrate(10); setTooltip({ idx: i }); }}
              onMouseEnter={() => setTooltip({ idx: i })}
              onMouseLeave={() => setTooltip(null)}
            >
              <AnimatePresence>
                {isActive && bar.value > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#384D48] text-white text-[8px] font-black px-2 py-0.5 rounded-md whitespace-nowrap z-10"
                  >
                    {bar.value.toFixed(1)}{unit}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="w-full rounded-t-md"
                style={{
                  backgroundColor: isActive ? "#ACAD94" : color,
                  minHeight: bar.value > 0 ? 4 : 0,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-1">
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 text-center text-[7px] font-bold text-[#6E7271] truncate">
            {bar.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── main page ────────────────────────────────────── */

export default function Analysis() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("weekly");
  const { subjects, sessions, updateSubject } = useStore();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── session stats ── */

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = toDateKey(now.toISOString());

    // Today
    const todayMins = sessions
      .filter((s) => toDateKey(s.date) === todayKey)
      .reduce((a, s) => a + s.minutes, 0);

    // This week (Sun–Sat)
    const weekStart = startOfWeek(now);
    const weekMins = sessions
      .filter((s) => new Date(s.date) >= weekStart)
      .reduce((a, s) => a + s.minutes, 0);

    // Total sessions
    const totalSessions = sessions.length;

    // Streak (consecutive days with at least 1 session)
    const daySet = new Set(sessions.map((s) => toDateKey(s.date)));
    let streak = 0;
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);
    while (daySet.has(toDateKey(cursor.toISOString()))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { todayMins, weekMins, totalSessions, streak };
  }, [sessions]);

  /* ── daily bars (last 7 days) ── */
  const dailyBars = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const key = toDateKey(d.toISOString());
      const mins = sessions
        .filter((s) => toDateKey(s.date) === key)
        .reduce((a, s) => a + s.minutes, 0);
      return { label: DAY_LABELS[d.getDay()], value: +(mins / 60).toFixed(2) };
    });
  }, [sessions]);

  /* ── weekly bars (last 8 weeks) ── */
  const weeklyBars = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 8 }, (_, i) => {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - (7 - i) * 7);
      const ws = startOfWeek(weekAgo);
      const we = new Date(ws);
      we.setDate(we.getDate() + 7);
      const mins = sessions
        .filter((s) => {
          const d = new Date(s.date);
          return d >= ws && d < we;
        })
        .reduce((a, s) => a + s.minutes, 0);
      const label = `W${i + 1}`;
      return { label, value: +(mins / 60).toFixed(2) };
    });
  }, [sessions]);

  /* ── monthly bars (last 6 months) ── */
  const monthlyBars = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const mins = sessions
        .filter((s) => {
          const sd = new Date(s.date);
          return sd.getFullYear() === year && sd.getMonth() === month;
        })
        .reduce((a, s) => a + s.minutes, 0);
      return { label: MONTH_LABELS[month], value: +(mins / 60).toFixed(2) };
    });
  }, [sessions]);

  /* ── marks trend ── */
  const graphWidth = 300;
  const graphHeight = 120;

  const datasets = useMemo(() => {
    const config = [
      { id: "physics", name: "Physics", color: "#384D48" },
      { id: "chemistry", name: "Chemistry", color: "#ACAD94" },
      { id: "maths", name: "Maths", color: "#6E7271" },
    ];
    return config.map((conf) => {
      const subject = subjects.find((s) => s.id === conf.id);
      const marks = (subject?.marks || []) as Mark[];
      if (marks.length === 0) return { ...conf, path: "", points: [] };
      const points = marks.map((m, i) => {
        const x =
          marks.length === 1
            ? graphWidth / 2
            : (i / (marks.length - 1)) * graphWidth;
        const total = m.total || 100;
        const val = Math.round((m.score / total) * 100);
        const y = graphHeight - (val / 100) * graphHeight;
        return { x, y, val, label: `${conf.name} Test ${i + 1}` };
      });
      return {
        ...conf,
        path: points.map((p) => `${p.x},${p.y}`).join(" "),
        points,
      };
    });
  }, [subjects]);

  /* ── exams ── */
  const allExams = useMemo(() => {
    return subjects
      .flatMap((sub) =>
        ((sub.exams || []) as Exam[]).map((ex) => ({
          ...ex,
          subjectId: sub.id,
          subjectName: sub.name,
        }))
      )
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [subjects]);

  const getCountdown = (date: string) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
  };

  if (!mounted) return null;

  const activeBars =
    tab === "daily" ? dailyBars : tab === "weekly" ? weeklyBars : monthlyBars;

  const totalHours =
    tab === "daily"
      ? (stats.todayMins / 60).toFixed(1)
      : tab === "weekly"
      ? (stats.weekMins / 60).toFixed(1)
      : (
          sessions.reduce((a, s) => a + s.minutes, 0) / 60
        ).toFixed(1);

  const tabLabel =
    tab === "daily" ? "Today" : tab === "weekly" ? "This Week" : "All Time";

  return (
    <div className="space-y-5 pb-36 max-w-md mx-auto p-4 bg-[#E2E2E2] min-h-screen">

      {/* Header */}
      <header className="pt-2 px-1">
        <h1 className="text-xl font-black text-[#384D48] tracking-tighter">
          INTELLIGENCE
        </h1>
        <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">
          Data Analysis Engine
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#384D48] rounded-[22px] p-4 text-white">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="opacity-70" />
            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
              Today
            </span>
          </div>
          <p className="text-2xl font-black tracking-tight">
            {(stats.todayMins / 60).toFixed(1)}
            <span className="text-sm font-bold opacity-60 ml-1">hrs</span>
          </p>
        </div>

        <div className="bg-white rounded-[22px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame size={12} className="text-[#ACAD94]" />
            <span className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">
              Streak
            </span>
          </div>
          <p className="text-2xl font-black text-[#384D48] tracking-tight">
            {stats.streak}
            <span className="text-sm font-bold text-[#6E7271] ml-1">days</span>
          </p>
        </div>

        <div className="bg-white rounded-[22px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-[#ACAD94]" />
            <span className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">
              This Week
            </span>
          </div>
          <p className="text-2xl font-black text-[#384D48] tracking-tight">
            {(stats.weekMins / 60).toFixed(1)}
            <span className="text-sm font-bold text-[#6E7271] ml-1">hrs</span>
          </p>
        </div>

        <div className="bg-white rounded-[22px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={12} className="text-[#ACAD94]" />
            <span className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">
              Sessions
            </span>
          </div>
          <p className="text-2xl font-black text-[#384D48] tracking-tight">
            {stats.totalSessions}
            <span className="text-sm font-bold text-[#6E7271] ml-1">total</span>
          </p>
        </div>
      </div>

      {/* Study Hours Graph */}
      <section className="bg-white p-5 rounded-[24px] shadow-sm border border-[#D8D4D5]">
        {/* Tab switcher */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">
              Study Hours
            </h3>
            <p className="text-lg font-black text-[#384D48] mt-0.5">
              {totalHours}
              <span className="text-xs font-bold text-[#6E7271] ml-1">
                hrs · {tabLabel}
              </span>
            </p>
          </div>
          <div className="flex gap-1 bg-[#F2F2F2] rounded-xl p-1">
            {(["daily", "weekly", "monthly"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { vibrate(10); setTab(t); }}
                className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition ${
                  tab === t
                    ? "bg-[#384D48] text-white"
                    : "text-[#6E7271]"
                }`}
              >
                {t === "daily" ? "Day" : t === "weekly" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeBars.every((b) => b.value === 0) ? (
              <div className="h-28 flex flex-col items-center justify-center gap-2">
                <Clock size={20} className="text-[#D8D4D5]" />
                <p className="text-[9px] font-bold text-[#6E7271] uppercase tracking-widest">
                  No sessions yet — start focusing!
                </p>
              </div>
            ) : (
              <BarChart bars={activeBars} />
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Marks Trend */}
      <section className="bg-white p-5 rounded-[24px] shadow-sm border border-[#D8D4D5] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-[#384D48]" />
          <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">
            Score Analytics
          </h3>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-3">
          {datasets.map((ds) => (
            <div key={ds.id} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ds.color }}
              />
              <span className="text-[8px] font-bold text-[#6E7271]">
                {ds.name}
              </span>
            </div>
          ))}
        </div>

        <div className="relative h-40 w-full bg-[#F5F5F5] rounded-xl p-4">
          {datasets.every((d) => d.points.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <TrendingUp size={20} className="text-[#D8D4D5]" />
              <p className="text-[9px] font-bold text-[#6E7271] uppercase tracking-widest">
                No test scores recorded yet
              </p>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {datasets.map((ds) => (
                <g key={ds.id}>
                  {ds.points.length > 1 && (
                    <motion.polyline
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      fill="none"
                      stroke={ds.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={ds.path}
                    />
                  )}
                  {ds.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill={ds.color}
                      stroke="white"
                      strokeWidth="2"
                      onClick={() => {
                        vibrate(20);
                        setTooltip({ ...p, color: ds.color });
                      }}
                    />
                  ))}
                </g>
              ))}
            </svg>
          )}

          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  left: `${(tooltip.x / graphWidth) * 100}%`,
                  top: `${(tooltip.y / graphHeight) * 100}%`,
                }}
                className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-3"
                onClick={() => setTooltip(null)}
              >
                <div className="bg-[#384D48] text-white px-3 py-1.5 rounded-lg shadow-xl text-center">
                  <p className="text-[7px] font-bold uppercase opacity-70 leading-none mb-1">
                    {tooltip.label}
                  </p>
                  <p className="text-xs font-black leading-none">
                    {tooltip.val}% Accuracy
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Global Deadlines */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest px-1">
          Global Deadlines
        </h3>
        {allExams.length > 0 ? (
          allExams
            .filter((e) => getCountdown(e.date) !== "Passed")
            .map((ex) => (
              <div
                key={ex.id}
                className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border-l-4"
                style={{
                  borderLeftColor:
                    ex.type === "High" ? "#384D48" : "#ACAD94",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#384D48]">
                    {ex.title}
                  </span>
                  <span className="text-[9px] font-bold text-[#6E7271] uppercase">
                    {ex.subjectName} · {ex.type} Priority
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-[#384D48] tracking-tighter">
                    {getCountdown(ex.date)}
                  </span>
                  <button
                    onClick={() => {
                      vibrate(60);
                      updateSubject(ex.subjectId, {
                        exams: (
                          subjects.find((s) => s.id === ex.subjectId)
                            ?.exams || []
                        ).filter((e) => e.id !== ex.id),
                      });
                    }}
                    className="text-[#D8D4D5] active:text-[#384D48]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="p-10 border-2 border-dashed border-[#D8D4D5] rounded-[32px] text-center">
            <Calendar className="mx-auto text-[#D8D4D5] mb-2" size={24} />
            <p className="text-[10px] font-bold text-[#6E7271] uppercase">
              No active missions
            </p>
          </div>
        )}
      </section>
    </div>
  );
            }
