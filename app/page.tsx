"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Play, Plus, Trash2,
  Pencil, Check, X, Calendar,
} from "lucide-react";

/* ── SVG tab icons — single color, no emojis ── */

function IconBook({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconMedal({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M8.56 14.3L6 22l6-2 6 2-2.56-7.7" />
    </svg>
  );
}

function IconCalendarTab({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

type ExpandedSection = "chapters" | "marks" | "exams" | null;

/* ══════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════ */

export default function Dashboard() {
  const router = useRouter();
  const {
    subjects,
    addChapter,
    removeChapter,
    logStudyTime,
    setStudyMinutes,
    addMark,
    removeMark,
    addExam,
    removeExam,
    addXp,
    checkDailyReset,
  } = useStore();

  /* ── Welcome redirect: shows once per day ── */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const seen  = localStorage.getItem("monk_welcome_date");
    if (seen !== today) {
      localStorage.setItem("monk_welcome_date", today);
      router.replace("/welcome");
    }
  }, []);

  /* ── Daily reset check ── */
  useEffect(() => {
    if (checkDailyReset) checkDailyReset();
  }, []);

  /* ── Pomodoro display ── */
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) { setRunning(false); addXp(30); return 1500; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, addXp]);

  const formatTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#E2E2E2] px-5 pt-6 pb-32">

      {/* ── Header ── */}
      <header className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push("/profile")}
          className="w-12 h-12 bg-white rounded-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center active:scale-95 transition"
        >
          <User className="text-[#384D48]" size={22} />
        </button>

        <h1 className="text-[#384D48] font-black tracking-[0.2em] text-[11px] uppercase">
          Monk OS
        </h1>

        <div className="w-12 h-12" />
      </header>

      {/* ── Pomodoro card ── */}
      <div className="bg-[#384D48] text-white rounded-[28px] p-7 shadow-[0_8px_20px_rgba(0,0,0,0.08)] mb-10">
        <div className="text-center mb-6">
          <p className="text-sm font-bold text-[#ACAD94] uppercase tracking-widest">
            Deep Focus
          </p>
          <h2 className="text-5xl font-black mt-2 tracking-wide">
            {formatTime()}
          </h2>
        </div>
        <button
          onClick={() => router.push("/focus")}
          className="w-full bg-white text-[#384D48] py-4 rounded-[20px] font-black flex items-center justify-center gap-2"
        >
          <Play size={18} /> Start Focus
        </button>
      </div>

      {/* ── Subject cards ── */}
      <div className="space-y-6">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onAddChapter={(title) => addChapter(subject.id, title)}
            onRemoveChapter={(cid) => removeChapter(subject.id, cid)}
            onLogMinutes={(m) => logStudyTime(subject.id, m)}
            onSetMinutes={(m) => setStudyMinutes(subject.id, m)}
            onAddMark={(mark) => addMark(subject.id, mark)}
            onRemoveMark={(mid) => removeMark(subject.id, mid)}
            onAddExam={(exam) => addExam(subject.id, exam)}
            onRemoveExam={(eid) => removeExam(subject.id, eid)}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SUBJECT CARD
══════════════════════════════════════════════════════ */

function SubjectCard({
  subject,
  onAddChapter, onRemoveChapter,
  onLogMinutes, onSetMinutes,
  onAddMark, onRemoveMark,
  onAddExam, onRemoveExam,
}: {
  subject: any;
  onAddChapter:    (t: string) => void;
  onRemoveChapter: (id: string) => void;
  onLogMinutes:    (m: number) => void;
  onSetMinutes:    (m: number) => void;
  onAddMark:       (m: any) => void;
  onRemoveMark:    (id: string) => void;
  onAddExam:       (e: any) => void;
  onRemoveExam:    (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<ExpandedSection>(null);
  const toggle = (s: ExpandedSection) =>
    setExpanded((prev) => (prev === s ? null : s));

  const total   = subject.chapters.length;
  const percent = total === 0
    ? 0
    : Math.round(
        (subject.chapters.filter((c: any) => c.completed).length / total) * 100
      );

  const tabs: {
    key: ExpandedSection;
    Icon: (p: { color: string }) => JSX.Element;
    count: number;
  }[] = [
    { key: "chapters", Icon: IconBook,        count: total                },
    { key: "marks",    Icon: IconMedal,       count: subject.marks.length },
    { key: "exams",    Icon: IconCalendarTab, count: subject.exams.length },
  ];

  return (
    <div className="bg-white rounded-[30px] p-6 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">

      {/* Card header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-2xl font-black text-[#384D48]">{subject.name}</h3>
          <StudyTimeDisplay
            minutes={subject.dailyStudyMinutes}
            onSetMinutes={onSetMinutes}
          />
        </div>
        <span className="text-lg font-black text-[#ACAD94]">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#F2F2F2] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[#384D48] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Tab row */}
      <div className="flex gap-2 mb-4">
        {tabs.map(({ key, Icon, count }) => {
          const active = expanded === key;
          const iconColor = active ? "#ffffff" : "#6E7271";
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition active:scale-95 ${
                active
                  ? "bg-[#384D48] text-white"
                  : "bg-[#F2F2F2] text-[#6E7271]"
              }`}
            >
              <Icon color={iconColor} />
              <span className={`text-[9px] font-black uppercase tracking-wide ${
                active ? "text-white" : "text-[#6E7271]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Chapters panel ── */}
      <AnimatePresence>
        {expanded === "chapters" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mb-3">
              {subject.chapters.length === 0 && (
                <p className="text-[10px] text-[#ACAD94] text-center py-2 uppercase font-bold tracking-wider">
                  No chapters yet
                </p>
              )}
              <AnimatePresence>
                {subject.chapters.map((ch: any) => (
                  <motion.button
                    key={ch.id}
                    layout
                    initial={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.18 } }}
                    onClick={() => onRemoveChapter(ch.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#F5F5F5] rounded-2xl active:scale-95 transition group"
                  >
                    <span className="text-sm font-bold text-[#384D48] text-left truncate pr-3">
                      {ch.title}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[8px] text-[#ACAD94] font-bold uppercase opacity-0 group-active:opacity-100 transition">
                        +20xp
                      </span>
                      <Check size={14} className="text-[#ACAD94]" />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            <AddChapterRow onAdd={onAddChapter} />
            <AddMinutesRow onLog={onLogMinutes} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Marks panel ── */}
      <AnimatePresence>
        {expanded === "marks" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mb-3">
              {subject.marks.length === 0 && (
                <p className="text-[10px] text-[#ACAD94] text-center py-2 uppercase font-bold tracking-wider">
                  No marks recorded
                </p>
              )}
              {subject.marks.map((m: any, i: number) => {
                const pct = Math.round((m.score / (m.total || 300)) * 100);
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-2.5 bg-[#F5F5F5] rounded-2xl"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#384D48]">
                        Test {i + 1}
                      </span>
                      <span className="text-[10px] text-[#6E7271] font-bold">
                        {m.score} / {m.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black ${
                        pct >= 50 ? "text-[#384D48]" : "text-[#ACAD94]"
                      }`}>
                        {pct}%
                      </span>
                      <button
                        onClick={() => onRemoveMark(m.id)}
                        className="text-[#D8D4D5] active:text-[#384D48] transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <AddMarkRow onAdd={onAddMark} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Exams panel ── */}
      <AnimatePresence>
        {expanded === "exams" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mb-3">
              {subject.exams.length === 0 && (
                <p className="text-[10px] text-[#ACAD94] text-center py-2 uppercase font-bold tracking-wider">
                  No exams added
                </p>
              )}
              {subject.exams.map((ex: any) => {
                const days = Math.ceil(
                  (new Date(ex.date).setHours(0, 0, 0, 0) -
                    new Date().setHours(0, 0, 0, 0)) /
                    86400000
                );
                const countdown =
                  days > 0 ? `${days}d` : days === 0 ? "Today" : "Passed";
                return (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between px-4 py-2.5 bg-[#F5F5F5] rounded-2xl border-l-4"
                    style={{
                      borderLeftColor:
                        ex.type === "High"
                          ? "#384D48"
                          : ex.type === "Medium"
                          ? "#ACAD94"
                          : "#6E7271",
                    }}
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <p className="text-xs font-black text-[#384D48] truncate">
                        {ex.title}
                      </p>
                      <p className="text-[9px] text-[#6E7271] font-bold uppercase">
                        {ex.type} · {ex.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-black text-[#384D48]">
                        {countdown}
                      </span>
                      <button
                        onClick={() => onRemoveExam(ex.id)}
                        className="text-[#D8D4D5] active:text-[#384D48] transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <AddExamRow onAdd={onAddExam} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STUDY TIME DISPLAY  — tap to edit
══════════════════════════════════════════════════════ */

function StudyTimeDisplay({
  minutes,
  onSetMinutes,
}: {
  minutes: number;
  onSetMinutes: (m: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState("");

  const hours = Math.floor(minutes / 60);
  const mins  = minutes % 60;

  const commit = () => {
    const parsed = parseInt(val);
    if (!isNaN(parsed)) onSetMinutes(parsed);
    setEditing(false);
    setVal("");
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          autoFocus
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
          placeholder={String(minutes)}
          className="w-20 bg-[#F2F2F2] rounded-xl px-3 py-1.5 text-sm font-bold text-[#384D48] outline-none"
        />
        <span className="text-xs text-[#6E7271] font-bold">min</span>
        <button
          onClick={commit}
          className="w-7 h-7 bg-[#384D48] text-white rounded-lg flex items-center justify-center"
        >
          <Check size={12} />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="w-7 h-7 bg-[#F2F2F2] text-[#6E7271] rounded-lg flex items-center justify-center"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 mt-1 group"
    >
      <p className="text-sm text-[#6E7271] font-bold">
        {hours}h {mins}m today
      </p>
      <Pencil
        size={11}
        className="text-[#ACAD94] opacity-0 group-hover:opacity-100 transition"
      />
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   ADD ROWS
══════════════════════════════════════════════════════ */

function AddChapterRow({ onAdd }: { onAdd: (t: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2 mb-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) { onAdd(val); setVal(""); }
        }}
        placeholder="Add chapter..."
        className="flex-1 min-w-0 bg-[#F2F2F2] rounded-[16px] px-4 py-2.5 outline-none text-sm text-[#384D48] font-medium"
      />
      <button
        onClick={() => { if (val.trim()) { onAdd(val); setVal(""); } }}
        className="w-10 h-10 flex-shrink-0 bg-[#384D48] text-white rounded-[14px] flex items-center justify-center active:scale-95 transition"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

function AddMinutesRow({ onLog }: { onLog: (m: number) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2 mb-2">
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Log study minutes..."
        className="flex-1 min-w-0 bg-[#F2F2F2] rounded-[16px] px-4 py-2.5 outline-none text-sm text-[#384D48] font-medium"
      />
      <button
        onClick={() => { if (val) { onLog(parseInt(val)); setVal(""); } }}
        className="w-10 h-10 flex-shrink-0 bg-[#ACAD94] text-white rounded-[14px] flex items-center justify-center active:scale-95 transition font-black text-base"
      >
        +
      </button>
    </div>
  );
}

function AddMarkRow({ onAdd }: { onAdd: (m: any) => void }) {
  const [score, setScore] = useState("");
  const [total, setTotal] = useState("300");

  const submit = () => {
    const s = parseInt(score);
    const t = parseInt(total) || 300;
    if (isNaN(s) || s < 0 || s > t) return;
    onAdd({
      id:    crypto.randomUUID(),
      score: s,
      total: t,
      date:  new Date().toISOString(),
    });
    setScore("");
    setTotal("300");
  };

  return (
    <div className="bg-[#F5F5F5] rounded-2xl p-3 mb-2 space-y-2">
      <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">
        Add Score
      </p>

      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
        <span className="text-[10px] font-bold text-[#ACAD94] w-10 flex-shrink-0">
          Score
        </span>
        <input
          type="number"
          value={score}
          min={0}
          max={300}
          onChange={(e) =>
            setScore(String(Math.min(300, Math.max(0, parseInt(e.target.value) || 0))))
          }
          placeholder="0 – 300"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-[#384D48]"
        />
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
        <span className="text-[10px] font-bold text-[#ACAD94] w-10 flex-shrink-0">
          Out of
        </span>
        <input
          type="number"
          value={total}
          min={1}
          max={300}
          onChange={(e) =>
            setTotal(String(Math.min(300, Math.max(1, parseInt(e.target.value) || 300))))
          }
          className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-[#384D48]"
        />
      </div>

      <button
        onClick={submit}
        className="w-full bg-[#384D48] text-white rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider active:scale-95 transition"
      >
        Save Score
      </button>
    </div>
  );
}

function AddExamRow({ onAdd }: { onAdd: (e: any) => void }) {
  const [title, setTitle]       = useState("");
  const [date, setDate]         = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");

  const submit = () => {
    if (!title.trim() || !date) return;
    onAdd({
      id:    crypto.randomUUID(),
      title,
      date,
      type:  priority,
      marks: [],
    });
    setTitle("");
    setDate("");
  };

  return (
    <div className="space-y-2 mb-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Exam title..."
        className="w-full bg-[#F2F2F2] rounded-[16px] px-4 py-2.5 outline-none text-sm text-[#384D48] font-medium"
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 min-w-0 bg-[#F2F2F2] rounded-[16px] px-3 py-2.5 outline-none text-sm text-[#384D48] font-medium"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="w-24 flex-shrink-0 bg-[#F2F2F2] rounded-[16px] px-2 py-2.5 outline-none text-[10px] font-black uppercase text-[#384D48]"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button
          onClick={submit}
          className="w-10 h-10 flex-shrink-0 bg-[#384D48] text-white rounded-[14px] flex items-center justify-center active:scale-95 transition"
        >
          <Calendar size={14} />
        </button>
      </div>
    </div>
  );
}
