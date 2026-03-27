"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trash2, Clock, Calendar, Flame, Target, ChevronLeft, ChevronRight, BookOpen, Coffee } from "lucide-react";
import { useStore, Exam, Mark } from "../../store/useStore";
import { vibrate } from "../../lib/db";

/* ══════════════════════════════════
   HELPERS
══════════════════════════════════ */
const toKey = (d: Date) => d.toISOString().slice(0, 10);
const todayKey = () => toKey(new Date());
const fmtH = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
const fmtHShort = (m: number) => `${(m / 60).toFixed(1)}h`;
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];

/* ══════════════════════════════════
   DONUT (Today's focus vs break)
══════════════════════════════════ */
function Donut({ pct, size = 56, stroke = 10, color }: {
  pct: number; size?: number; stroke?: number; color: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#E2E2E2" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%",
                 transition: "stroke-dashoffset 0.8s ease" }}/>
    </svg>
  );
}

/* ══════════════════════════════════
   WEEKLY BAR CHART
══════════════════════════════════ */
function WeekBars({ byDay }: { byDay: Record<string, number> }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const k = toKey(d);
    return { label: DAY_LABELS[d.getDay()], mins: byDay[k] ?? 0, key: k, isToday: k === todayKey() };
  });
  const max = Math.max(...days.map(d => d.mins), 60);

  return (
    <div className="flex items-end gap-1.5 h-16">
      {days.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.mins / max) * 52, d.mins > 0 ? 4 : 0)}px` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="w-full rounded-t-md"
            style={{ backgroundColor: d.isToday ? "#384D48" : d.mins > 0 ? "#ACAD94" : "#E2E2E2" }}
          />
          <span className={`text-[8px] font-bold ${d.isToday ? "text-[#384D48]" : "text-[#6E7271]"}`}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════
   MONTHLY CALENDAR
══════════════════════════════════ */
function MonthCalendar({ byDay, selectedKey, onSelect }: {
  byDay: Record<string, number>;
  selectedKey: string;
  onSelect: (k: string) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date(); today.setHours(0,0,0,0);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // First day of month, how many days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getColor = (mins: number) => {
    if (!mins) return null;
    if (mins < 60)  return "#ACAD94";
    if (mins < 120) return "#6E7271";
    if (mins < 180) return "#4E6B5E";
    return "#384D48";
  };

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  ];

  return (
    <div>
      {/* Month nav */}
      <div className="flex justify-between items-center mb-3">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-7 h-7 rounded-lg bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition">
          <ChevronLeft size={14} className="text-[#384D48]"/>
        </button>
        <span className="text-xs font-black text-[#384D48]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={() => {
          const next = new Date(year, month + 1, 1);
          if (next <= today) setViewDate(next);
        }} className="w-7 h-7 rounded-lg bg-[#F2F2F2] flex items-center justify-center active:scale-90 transition">
          <ChevronRight size={14} className="text-[#384D48]"/>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[8px] font-bold text-[#ACAD94]">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k   = toKey(d);
          const mins = byDay[k] ?? 0;
          const color = getColor(mins);
          const isTod = k === todayKey();
          const isSel = k === selectedKey;
          const isFut = d > today;

          return (
            <button
              key={i}
              onClick={() => { if (!isFut) { vibrate(10); onSelect(k); } }}
              disabled={isFut}
              className="flex items-center justify-center"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold transition
                ${isSel ? "ring-2 ring-[#384D48] ring-offset-1" : ""}
                ${isFut ? "opacity-25" : ""}
              `}
              style={{
                backgroundColor: color ?? (isTod ? "#E8EDE8" : "transparent"),
                color: color ? "#FFFFFF" : isTod ? "#384D48" : "#384D48",
              }}>
                {d.getDate()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[7px] text-[#6E7271]">Low</span>
        {[null, "#ACAD94","#6E7271","#4E6B5E","#384D48"].map((c, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 3,
            backgroundColor: c ?? "#E2E2E2"
          }}/>
        ))}
        <span className="text-[7px] text-[#6E7271]">High</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN PAGE
══════════════════════════════════ */
export default function Analysis() {
  const [mounted, setMounted]     = useState(false);
  const [selectedDay, setSelectedDay] = useState(todayKey());
  const { subjects, sessions, updateSubject } = useStore();

  useEffect(() => { setMounted(true); }, []);

  /* sessions by day */
  const byDay = useMemo(() => {
    const m: Record<string, number> = {};
    sessions.forEach(s => {
      const k = toKey(new Date(s.date));
      m[k] = (m[k] ?? 0) + s.minutes;
    });
    return m;
  }, [sessions]);

  /* today stats */
  const todayMins  = byDay[todayKey()] ?? 0;
  const todayGoal  = 8 * 60; // 8h goal
  const todayPct   = Math.min(100, Math.round((todayMins / todayGoal) * 100));

  /* total study vs break (estimate break as 15% of study) */
  const breakMins  = Math.round(todayMins * 0.15);
  const focusPct   = todayMins > 0
    ? Math.round((todayMins / (todayMins + breakMins)) * 100)
    : 0;

  /* this week */
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0,0,0,0);

  const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
  const weekStudyMins = weekSessions.reduce((a, s) => a + s.minutes, 0);
  const weekActiveDays = new Set(weekSessions.map(s => toKey(new Date(s.date)))).size;
  const weekBreakMins = Math.round(weekStudyMins * 0.15);

  /* best day this week */
  const weekDayMins: Record<string, number> = {};
  weekSessions.forEach(s => {
    const k = toKey(new Date(s.date));
    weekDayMins[k] = (weekDayMins[k] ?? 0) + s.minutes;
  });
  const bestDayKey = Object.entries(weekDayMins).sort((a,b) => b[1]-a[1])[0]?.[0];
  const bestDayLabel = bestDayKey
    ? DAY_LABELS[new Date(bestDayKey).getDay()]
    : "—";

  /* focus score (ratio of days with 2h+ study this week) */
  const focusScore = weekActiveDays === 0 ? 0
    : Math.round((Object.values(weekDayMins).filter(m => m >= 120).length / 7) * 100);

  /* streak */
  const streak = useMemo(() => {
    const daySet = new Set(Object.keys(byDay));
    let s = 0;
    const c = new Date(); c.setHours(0,0,0,0);
    while (daySet.has(toKey(c))) { s++; c.setDate(c.getDate()-1); }
    return s;
  }, [byDay]);

  /* this month */
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSessions = sessions.filter(s => new Date(s.date) >= monthStart);
  const monthMins  = monthSessions.reduce((a, s) => a + s.minutes, 0);
  const totalSessions = monthSessions.length;
  const avgDaily   = monthMins / Math.max(1, now.getDate());

  /* selected day detail */
  const selMins = byDay[selectedDay] ?? 0;
  const selBreak = Math.round(selMins * 0.15);
  const selFocus = selMins > 0 ? Math.round((selMins / (selMins + selBreak)) * 100) : 0;
  const selDate  = new Date(selectedDay + "T00:00:00");
  const selLabel = selDate.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" });

  /* marks trend */
  const GW = 260; const GH = 80;
  const markDS = useMemo(() => {
    const cfg = [
      { id:"physics",   name:"Phy", color:"#384D48" },
      { id:"chemistry", name:"Chem", color:"#ACAD94" },
      { id:"maths",     name:"Math", color:"#6E7271" },
    ];
    return cfg.map(conf => {
      const marks = (subjects.find(s => s.id === conf.id)?.marks ?? []) as Mark[];
      if (!marks.length) return { ...conf, path:"", points:[] };
      const pts = marks.map((m,i) => {
        const x   = marks.length===1 ? GW/2 : (i/(marks.length-1))*GW;
        const pct = Math.round((m.score/(m.total||300))*100);
        return { x, y: GH-(pct/100)*GH, val:pct, label:`${conf.name} T${i+1}` };
      });
      return { ...conf, path: pts.map(p=>`${p.x},${p.y}`).join(" "), points:pts };
    });
  }, [subjects]);

  /* exams */
  const allExams = useMemo(() =>
    subjects.flatMap(sub =>
      ((sub.exams||[]) as Exam[]).map(ex=>({...ex,subjectId:sub.id,subjectName:sub.name}))
    ).sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()),
    [subjects]
  );
  const countdown = (date: string) => {
    const d=new Date(date); d.setHours(0,0,0,0);
    const n=new Date();     n.setHours(0,0,0,0);
    const days=Math.ceil((d.getTime()-n.getTime())/86400000);
    return days>0?`${days}d`:days===0?"Today":"Passed";
  };

  if (!mounted) return null;

  return (
    <div className="pb-36 max-w-md mx-auto bg-[#E2E2E2] min-h-screen">

      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-black text-[#384D48] tracking-tighter uppercase">Intelligence</h1>
        <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">Progress Tracker</p>
      </div>

      {/* ══════════════════════════════════
          TODAY'S PROGRESS
      ══════════════════════════════════ */}
      <div className="px-4 mb-4">
        <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-2">Today's Progress</p>

        <div className="grid grid-cols-3 gap-2">

          {/* Study time vs goal */}
          <div className="bg-white rounded-[20px] p-3 flex flex-col items-center gap-1">
            <div className="relative">
              <Donut pct={todayPct} size={52} stroke={8} color="#384D48"/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-black text-[#384D48]">{Math.floor(todayMins/60)}h</span>
              </div>
            </div>
            <p className="text-[8px] font-black text-[#384D48] text-center leading-tight">
              {todayPct}% of 8h<br/>goal
            </p>
            <p className="text-[7px] text-[#ACAD94] text-center">Goal adjustable</p>
          </div>

          {/* Focus vs Break donut */}
          <div className="bg-white rounded-[20px] p-3 flex flex-col items-center gap-1">
            <div className="relative">
              <Donut pct={focusPct} size={52} stroke={8} color="#384D48"/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-black text-[#384D48]">{focusPct}%</span>
              </div>
            </div>
            <p className="text-[8px] font-black text-[#384D48] text-center leading-tight">
              Focus vs<br/>Break
            </p>
            <p className="text-[7px] text-[#ACAD94]">{focusPct}% Focus</p>
          </div>

          {/* Focus score */}
          <div className="bg-white rounded-[20px] p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <Target size={10} className="text-[#ACAD94]"/>
              <span className="text-[7px] font-bold text-[#6E7271] uppercase tracking-wider">Focus Score</span>
            </div>
            <p className="text-2xl font-black text-[#384D48] leading-none">{focusScore}%</p>
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({length:7},(_,i)=>(
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: i < weekActiveDays ? "#384D48" : "#E2E2E2" }}/>
              ))}
            </div>
            <p className="text-[7px] text-[#ACAD94]">{weekActiveDays}/7 active days</p>
            <p className="text-[7px] text-[#6E7271]">
              {fmtH(todayMins)} · {fmtH(breakMins)} break
            </p>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════
          WEEKLY RHYTHM
      ══════════════════════════════════ */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-[24px] p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">Weekly Rhythm</p>
            <p className="text-[8px] text-[#ACAD94] font-bold">
              {weekStart.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} – {now.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
            </p>
          </div>

          {/* 4 stat chips */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            <div className="bg-[#384D48] rounded-xl p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <BookOpen size={8} className="text-[#ACAD94]"/>
                <span className="text-[6px] text-[#ACAD94] font-bold uppercase">Study</span>
              </div>
              <p className="text-sm font-black text-white">{fmtHShort(weekStudyMins)}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Coffee size={8} className="text-[#ACAD94]"/>
                <span className="text-[6px] text-[#6E7271] font-bold uppercase">Break</span>
              </div>
              <p className="text-sm font-black text-[#384D48]">{fmtHShort(weekBreakMins)}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Flame size={8} className="text-[#ACAD94]"/>
                <span className="text-[6px] text-[#6E7271] font-bold uppercase">Days</span>
              </div>
              <p className="text-sm font-black text-[#384D48]">{weekActiveDays}/7</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <TrendingUp size={8} className="text-[#ACAD94]"/>
                <span className="text-[6px] text-[#6E7271] font-bold uppercase">Best</span>
              </div>
              <p className="text-sm font-black text-[#384D48]">{bestDayLabel}</p>
            </div>
          </div>

          {/* 7-day bars */}
          <WeekBars byDay={byDay}/>
        </div>
      </div>

      {/* ══════════════════════════════════
          THIS MONTH
      ══════════════════════════════════ */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-[24px] p-4">
          <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-3">This Month</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#F5F5F5] rounded-xl p-3">
              <Clock size={12} className="text-[#ACAD94] mb-1"/>
              <p className="text-[7px] text-[#6E7271] font-bold uppercase">Total</p>
              <p className="text-base font-black text-[#384D48]">{fmtHShort(monthMins)}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-3">
              <Target size={12} className="text-[#ACAD94] mb-1"/>
              <p className="text-[7px] text-[#6E7271] font-bold uppercase">Sessions</p>
              <p className="text-base font-black text-[#384D48]">{totalSessions}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-3">
              <TrendingUp size={12} className="text-[#ACAD94] mb-1"/>
              <p className="text-[7px] text-[#6E7271] font-bold uppercase">Avg/Day</p>
              <p className="text-base font-black text-[#384D48]">{fmtHShort(avgDaily)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          MONTHLY CALENDAR
      ══════════════════════════════════ */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-[24px] p-4">
          <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-3">Monthly Overview</p>
          <MonthCalendar byDay={byDay} selectedKey={selectedDay} onSelect={setSelectedDay}/>

          {/* Selected day detail */}
          <div className="mt-4 pt-3 border-t border-[#F2F2F2]">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[9px] font-bold text-[#6E7271] uppercase">{selLabel}</p>
              {selMins > 0 && (
                <span className="text-[7px] bg-[#384D48] text-white px-2 py-0.5 rounded-full font-bold">Active</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[7px] text-[#ACAD94] uppercase font-bold">Study</p>
                <p className="text-sm font-black text-[#384D48]">{fmtH(selMins)}</p>
              </div>
              <div>
                <p className="text-[7px] text-[#ACAD94] uppercase font-bold">Break</p>
                <p className="text-sm font-black text-[#384D48]">{fmtH(selBreak)}</p>
              </div>
              <div>
                <p className="text-[7px] text-[#ACAD94] uppercase font-bold">Focus</p>
                <p className="text-sm font-black text-[#384D48]">{selFocus}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          SCORE TREND
      ══════════════════════════════════ */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-[24px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} className="text-[#384D48]"/>
            <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">Score Trend</p>
          </div>
          <div className="flex gap-3 mb-2">
            {markDS.map(ds=>(
              <div key={ds.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor:ds.color}}/>
                <span className="text-[8px] font-bold text-[#6E7271]">{ds.name}</span>
              </div>
            ))}
          </div>
          <div className="h-24 bg-[#F5F5F5] rounded-xl p-3 relative">
            {markDS.every(d=>!d.points.length) ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[9px] text-[#ACAD94] font-bold uppercase">No scores yet</p>
              </div>
            ) : (
              <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {markDS.map(ds=>(
                  <g key={ds.id}>
                    {ds.points.length>1&&(
                      <motion.polyline initial={{pathLength:0}} animate={{pathLength:1}}
                        fill="none" stroke={ds.color} strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" points={ds.path}/>
                    )}
                    {ds.points.map((p,i)=>(
                      <circle key={i} cx={p.x} cy={p.y} r="3.5"
                        fill={ds.color} stroke="white" strokeWidth="1.5"/>
                    ))}
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          DEADLINES
      ══════════════════════════════════ */}
      <div className="px-4 mb-4">
        <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-2">Global Deadlines</p>
        {allExams.filter(e=>countdown(e.date)!=="Passed").length>0 ? (
          <div className="space-y-2">
            {allExams.filter(e=>countdown(e.date)!=="Passed").map(ex=>(
              <div key={ex.id}
                className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border-l-4"
                style={{borderLeftColor:ex.type==="High"?"#384D48":"#ACAD94"}}>
                <div>
                  <p className="text-xs font-bold text-[#384D48]">{ex.title}</p>
                  <p className="text-[9px] font-bold text-[#6E7271] uppercase">{ex.subjectName} · {ex.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-[#384D48]">{countdown(ex.date)}</span>
                  <button onClick={()=>{
                    vibrate(60);
                    updateSubject(ex.subjectId,{
                      exams:(subjects.find(s=>s.id===ex.subjectId)?.exams??[]).filter(e=>e.id!==ex.id)
                    });
                  }} className="text-[#D8D4D5] active:text-[#384D48]">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-[#D8D4D5] rounded-[28px] text-center">
            <Calendar className="mx-auto text-[#D8D4D5] mb-2" size={20}/>
            <p className="text-[9px] font-bold text-[#6E7271] uppercase">No active missions</p>
          </div>
        )}
      </div>

    </div>
  );
}
