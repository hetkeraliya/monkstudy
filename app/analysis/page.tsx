"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Flame, BookOpen, Download, Trophy,
  Zap, Target, TrendingUp, Calendar, Trash2,
} from "lucide-react";
import { useStore, Exam, Mark } from "../../store/useStore";
import { vibrate } from "../../lib/db";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */

const toKey  = (d: Date)  => d.toISOString().slice(0, 10);
const fmtH   = (m: number) => `${(m / 60).toFixed(1)}h`;

const startOfWeek = (d: Date) => {
  const c = new Date(d);
  c.setDate(c.getDate() - c.getDay());
  c.setHours(0, 0, 0, 0);
  return c;
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["S","M","T","W","T","F","S"];

const SUBJECT_COLORS: Record<string, string> = {
  physics:   "#7C9EFF",
  chemistry: "#4ED4A9",
  maths:     "#FFB347",
};
const FALLBACK_COLORS = ["#C77DFF","#FF6B9D","#06D6A0","#FFD166","#EF476F"];

/* ══════════════════════════════════════════
   DONUT CHART
══════════════════════════════════════════ */

interface Slice { label: string; value: number; color: string }

function DonutChart({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const R = 46; const C = 60;
  const circ = 2 * Math.PI * R;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-4 w-full">
      {/* donut */}
      <div className="flex-shrink-0">
        <svg width={C * 2} height={C * 2} viewBox={`0 0 ${C*2} ${C*2}`}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="20" />
          {slices.map((s, i) => {
            const dash = (s.value / total) * circ;
            const gap  = circ - dash;
            const rot  = (cumulative / total) * 360 - 90;
            cumulative += s.value;
            return (
              <circle
                key={i} cx={C} cy={C} r={R}
                fill="none" stroke={s.color} strokeWidth="20"
                strokeDasharray={`${dash} ${gap}`}
                style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${C}px ${C}px` }}
              />
            );
          })}
          <circle cx={C} cy={C} r={R - 13} fill="#16213e" />
        </svg>
      </div>
      {/* legend */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] font-bold text-white/80 truncate">{s.label}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-black text-white">{fmtH(s.value)}</span>
              <span className="text-[9px] text-white/40 w-5 text-right">{Math.round((s.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HEATMAP  (GitHub-style, full year)
══════════════════════════════════════════ */

function Heatmap({ byDay }: { byDay: Record<string, number> }) {
  const today = new Date(); today.setHours(0,0,0,0);

  // Start from ~53 weeks back aligned to Sunday
  const gridStart = new Date(today);
  gridStart.setDate(gridStart.getDate() - 364);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const weeks: Date[][] = [];
  const cur = new Date(gridStart);
  while (cur <= today) {
    const wk: Date[] = [];
    for (let d = 0; d < 7; d++) { wk.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
    weeks.push(wk);
  }

  const maxMins = Math.max(...Object.values(byDay), 1);
  const color = (m: number) => {
    if (!m) return "rgba(255,255,255,0.06)";
    const t = m / maxMins;
    if (t < 0.25) return "#2D6A4F";
    if (t < 0.50) return "#40916C";
    if (t < 0.75) return "#52B788";
    return "#74C69D";
  };

  // Month label: first week of each month
  const monthLabels: { wi: number; label: string }[] = [];
  weeks.forEach((wk, wi) => {
    if (wk[0].getDate() <= 7) monthLabels.push({ wi, label: MONTHS[wk[0].getMonth()] });
  });

  const CELL = 9; const GAP = 2;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: weeks.length * (CELL + GAP) + 20 }}>
        {/* month labels */}
        <div className="flex mb-0.5" style={{ paddingLeft: 18 }}>
          {weeks.map((_, wi) => {
            const ml = monthLabels.find(m => m.wi === wi);
            return (
              <div key={wi} style={{ width: CELL + GAP, flexShrink: 0 }}
                   className="text-[6px] font-bold text-white/30 leading-none">
                {ml?.label ?? ""}
              </div>
            );
          })}
        </div>

        <div className="flex">
          {/* day labels */}
          <div className="flex flex-col mr-0.5" style={{ gap: GAP }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ width: 16, height: CELL }}
                   className="text-[6px] text-white/30 flex items-center justify-end pr-0.5">
                {i % 2 === 1 ? d : ""}
              </div>
            ))}
          </div>

          {/* grid */}
          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((wk, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {wk.map((day, di) => {
                  const k    = toKey(day);
                  const mins = byDay[k] ?? 0;
                  const future = day > today;
                  return (
                    <div key={di} style={{
                      width: CELL, height: CELL, borderRadius: 2,
                      backgroundColor: future ? "transparent" : color(mins),
                    }} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* legend */}
        <div className="flex items-center gap-1 mt-1.5 justify-end">
          <span className="text-[6px] text-white/30">Less</span>
          {["rgba(255,255,255,0.06)","#2D6A4F","#40916C","#52B788","#74C69D"].map((c,i) => (
            <div key={i} style={{ width: CELL, height: CELL, backgroundColor: c, borderRadius: 2 }} />
          ))}
          <span className="text-[6px] text-white/30">More</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STAT TILE
══════════════════════════════════════════ */

function Tile({ icon: Icon, color, label, value }: {
  icon: any; color: string; label: string; value: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-white/5 rounded-2xl p-3">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
        <Icon size={12} style={{ color }} />
      </div>
      <p className="text-[7px] font-bold text-white/40 uppercase tracking-wider mt-0.5 leading-none">{label}</p>
      <p className="text-sm font-black text-white leading-tight">{value}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN
══════════════════════════════════════════ */

export default function Analysis() {
  const [mounted, setMounted]   = useState(false);
  const [year, setYear]         = useState(new Date().getFullYear());
  const [downloading, setDl]    = useState(false);
  const [markTooltip, setMT]    = useState<{ x:number;y:number;label:string;val:number } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const { subjects, sessions, updateSubject } = useStore();

  useEffect(() => { setMounted(true); }, []);

  /* year sessions */
  const yearSessions = useMemo(
    () => sessions.filter(s => new Date(s.date).getFullYear() === year),
    [sessions, year]
  );

  /* sessions by day */
  const byDay = useMemo(() => {
    const m: Record<string, number> = {};
    yearSessions.forEach(s => { const k = toKey(new Date(s.date)); m[k] = (m[k]??0) + s.minutes; });
    return m;
  }, [yearSessions]);

  /* yearly stats */
  const stats = useMemo(() => {
    if (!yearSessions.length) return null;
    const totalMins  = yearSessions.reduce((a,s) => a + s.minutes, 0);
    const totalSess  = yearSessions.length;
    const avgSession = totalMins / totalSess;
    const focusDays  = Object.keys(byDay).length;

    const bestDayMins = Math.max(...Object.values(byDay), 0);

    const weekMap: Record<string,number> = {};
    yearSessions.forEach(s => {
      const k = toKey(startOfWeek(new Date(s.date)));
      weekMap[k] = (weekMap[k]??0) + s.minutes;
    });
    const bestWeekMins = Math.max(...Object.values(weekMap), 0);

    const monthMap: Record<string,number> = {};
    yearSessions.forEach(s => {
      const d = new Date(s.date);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap[k] = (monthMap[k]??0) + s.minutes;
    });
    const bestMonthMins = Math.max(...Object.values(monthMap), 0);

    // streak up to today
    const daySet = new Set(Object.keys(byDay));
    let streak = 0;
    const c = new Date(); c.setHours(0,0,0,0);
    while (daySet.has(toKey(c))) { streak++; c.setDate(c.getDate()-1); }

    return { totalMins, totalSess, avgSession, focusDays, bestDayMins, bestWeekMins, bestMonthMins, streak };
  }, [yearSessions, byDay]);

  /* subject slices — use session minutes aggregated by subject id */
  const slices = useMemo<Slice[]>(() => {
    return subjects
      .map((sub, i) => ({
        label: sub.name,
        value: sub.dailyStudyMinutes,
        color: SUBJECT_COLORS[sub.id] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }))
      .filter(s => s.value > 0);
  }, [subjects]);

  /* marks trend */
  const GW = 280; const GH = 100;
  const markDS = useMemo(() => {
    const cfg = [
      { id:"physics",   name:"Physics",   color:"#7C9EFF" },
      { id:"chemistry", name:"Chemistry", color:"#4ED4A9" },
      { id:"maths",     name:"Maths",     color:"#FFB347" },
    ];
    return cfg.map(conf => {
      const marks = (subjects.find(s => s.id === conf.id)?.marks ?? []) as Mark[];
      if (!marks.length) return { ...conf, path:"", points:[] };
      const pts = marks.map((m,i) => {
        const x  = marks.length===1 ? GW/2 : (i/(marks.length-1))*GW;
        const pct= Math.round((m.score/(m.total||100))*100);
        return { x, y: GH-(pct/100)*GH, val:pct, label:`${conf.name} T${i+1}` };
      });
      return { ...conf, path: pts.map(p=>`${p.x},${p.y}`).join(" "), points: pts };
    });
  }, [subjects]);

  /* exams */
  const allExams = useMemo(() =>
    subjects.flatMap(sub =>
      ((sub.exams||[]) as Exam[]).map(ex => ({ ...ex, subjectId:sub.id, subjectName:sub.name }))
    ).sort((a,b) => new Date(a.date).getTime()-new Date(b.date).getTime()),
    [subjects]
  );

  const countdown = (date: string) => {
    const d = new Date(date); d.setHours(0,0,0,0);
    const n = new Date();     n.setHours(0,0,0,0);
    const days = Math.ceil((d.getTime()-n.getTime())/86400000);
    return days>0?`${days}d`:days===0?"Today":"Passed";
  };

  /* download */
  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    vibrate(30); setDl(true);
    try {
      const h2c = (await import("html2canvas")).default;
      const canvas = await h2c(cardRef.current, {
        backgroundColor: "#0f0e17",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const a = document.createElement("a");
      a.download = `monkstudy-${year}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } finally {
      setDl(false);
    }
  }, [year, downloading]);

  if (!mounted) return null;

  return (
    <div className="space-y-4 pb-36 max-w-md mx-auto p-4 bg-[#E2E2E2] min-h-screen">

      {/* ── Header ── */}
      <header className="pt-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-[#384D48] tracking-tighter">INTELLIGENCE</h1>
          <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">Data Analysis Engine</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 bg-[#384D48] text-white text-[10px] font-black px-3 py-2 rounded-xl active:scale-95 transition disabled:opacity-60"
        >
          <Download size={12} />
          {downloading ? "Saving…" : "Export"}
        </button>
      </header>

      {/* ══════════════════════════
          DARK CARD  (downloaded)
      ══════════════════════════ */}
      <div
        ref={cardRef}
        className="rounded-[28px] p-5 space-y-4"
        style={{ background: "#0f0e17" }}
      >
        {/* card title + year picker */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Monk OS</p>
            <p className="text-base font-black text-white leading-tight">Yearly Analytics</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2 py-1">
            <button onClick={() => setYear(y=>y-1)} className="text-white/60 text-xs leading-none px-0.5">‹</button>
            <span className="text-[11px] font-black text-white">{year}</span>
            <button
              onClick={() => setYear(y => Math.min(y+1, new Date().getFullYear()))}
              className="text-white/60 text-xs leading-none px-0.5"
            >›</button>
          </div>
        </div>

        {/* ── Stats grid + Donut (side by side) ── */}
        <div className="flex gap-3">
          {/* stats 2-col grid */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {stats ? (
              <>
                <Tile icon={Clock}      color="#7C9EFF" label="Focus Time"   value={fmtH(stats.totalMins)} />
                <Tile icon={Zap}        color="#4ED4A9" label="Sessions"     value={String(stats.totalSess)} />
                <Tile icon={Calendar}   color="#52B788" label="Focus Days"   value={String(stats.focusDays)} />
                <Tile icon={Target}     color="#A0C4FF" label="Avg Session"  value={fmtH(stats.avgSession)} />
                <Tile icon={Trophy}     color="#FFB347" label="Best Day"     value={fmtH(stats.bestDayMins)} />
                <Tile icon={TrendingUp} color="#FF6B6B" label="Best Week"    value={fmtH(stats.bestWeekMins)} />
                <Tile icon={BookOpen}   color="#C9A96E" label="Best Month"   value={fmtH(stats.bestMonthMins)} />
                <Tile icon={Flame}      color="#FF6B6B" label="Best Streak"  value={`${stats.streak}d`} />
              </>
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center gap-2 py-6">
                <Clock size={20} className="text-white/20" />
                <p className="text-[9px] text-white/30 uppercase font-bold text-center">
                  No sessions in {year}
                </p>
              </div>
            )}
          </div>

          {/* donut */}
          {slices.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-center" style={{ width: 160 }}>
              <DonutChart slices={slices} />
            </div>
          )}
        </div>

        {/* ── Heatmap ── */}
        <div className="bg-white/5 rounded-2xl p-3">
          <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-2">
            Activity Heatmap · {year}
          </p>
          <Heatmap byDay={byDay} />
        </div>
      </div>
      {/* ══ end dark card ══ */}

      {/* ── Score Trend ── */}
      <section className="bg-white p-5 rounded-[24px] shadow-sm border border-[#D8D4D5]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-[#384D48]" />
          <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">Score Trend</h3>
        </div>
        <div className="flex flex-wrap gap-3 mb-3">
          {markDS.map(ds => (
            <div key={ds.id} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ds.color }} />
              <span className="text-[8px] font-bold text-[#6E7271]">{ds.name}</span>
            </div>
          ))}
        </div>
        <div className="relative h-32 bg-[#F5F5F5] rounded-xl p-3">
          {markDS.every(d => !d.points.length) ? (
            <div className="h-full flex flex-col items-center justify-center gap-1">
              <TrendingUp size={18} className="text-[#D8D4D5]" />
              <p className="text-[9px] font-bold text-[#6E7271] uppercase">No test scores yet</p>
            </div>
          ) : (
            <>
              <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {markDS.map(ds => (
                  <g key={ds.id}>
                    {ds.points.length > 1 && (
                      <motion.polyline
                        initial={{ pathLength:0 }} animate={{ pathLength:1 }}
                        fill="none" stroke={ds.color} strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        points={ds.path}
                      />
                    )}
                    {ds.points.map((p,i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="4"
                        fill={ds.color} stroke="white" strokeWidth="1.5"
                        onClick={() => { vibrate(15); setMT({ x:p.x, y:p.y, label:p.label, val:p.val }); }}
                      />
                    ))}
                  </g>
                ))}
              </svg>
              <AnimatePresence>
                {markTooltip && (
                  <motion.div
                    initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                    className="absolute z-50 -translate-x-1/2 -translate-y-full pointer-events-none"
                    style={{ left:`${(markTooltip.x/GW)*100}%`, top:`${(markTooltip.y/GH)*100}%` }}
                    onClick={() => setMT(null)}
                  >
                    <div className="bg-[#384D48] text-white px-3 py-1.5 rounded-lg shadow-xl text-center">
                      <p className="text-[7px] font-bold opacity-70 leading-none mb-1">{markTooltip.label}</p>
                      <p className="text-xs font-black leading-none">{markTooltip.val}%</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {/* ── Deadlines ── */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest px-1">Global Deadlines</h3>
        {allExams.filter(e => countdown(e.date) !== "Passed").length > 0 ? (
          allExams.filter(e => countdown(e.date) !== "Passed").map(ex => (
            <div key={ex.id}
              className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border-l-4"
              style={{ borderLeftColor: ex.type === "High" ? "#384D48" : "#ACAD94" }}
            >
              <div>
                <p className="text-xs font-bold text-[#384D48]">{ex.title}</p>
                <p className="text-[9px] font-bold text-[#6E7271] uppercase">{ex.subjectName} · {ex.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-[#384D48]">{countdown(ex.date)}</span>
                <button
                  onClick={() => {
                    vibrate(60);
                    updateSubject(ex.subjectId, {
                      exams: (subjects.find(s=>s.id===ex.subjectId)?.exams??[]).filter(e=>e.id!==ex.id)
                    });
                  }}
                  className="text-[#D8D4D5] active:text-[#384D48]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 border-2 border-dashed border-[#D8D4D5] rounded-[32px] text-center">
            <Calendar className="mx-auto text-[#D8D4D5] mb-2" size={22} />
            <p className="text-[10px] font-bold text-[#6E7271] uppercase">No active missions</p>
          </div>
        )}
      </section>

    </div>
  );
}
