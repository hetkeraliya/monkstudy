"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { User, Flame, Target, Play, Pause, BookOpen, Plus } from "lucide-react";

export default function Dashboard() {
  const {
    subjects,
    xp,
    level,
    streak,
    addXp,
    addChapter,
    toggleChapter,
    logStudyTime,
  } = useStore();

  /* ================= POMODORO ================= */

  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          addXp(30);
          return 1500;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, addXp]);

  const formatTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#E2E2E2] pb-24 px-5 pt-6 selection:bg-[#ACAD94] selection:text-[#384D48]">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8">
        <div className="w-12 h-12 bg-white rounded-[16px] shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center justify-center">
          <User className="text-[#384D48]" size={22} />
        </div>

        <h1 className="text-[#384D48] font-black tracking-[0.2em] text-[11px] uppercase">
          Monk OS
        </h1>

        <div className="w-12 h-12" />
      </header>

      {/* GREETING */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[#384D48] tracking-tight mb-4">
          Stay disciplined.
        </h2>

        <div className="flex gap-4">

          {/* STREAK */}
          <div className="flex-1 bg-white rounded-[20px] p-4 shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center">
              <Flame className="text-[#ACAD94]" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">
                Streak
              </p>
              <p className="text-lg font-black text-[#384D48]">
                {streak} Days
              </p>
            </div>
          </div>

          {/* XP */}
          <div className="flex-1 bg-white rounded-[20px] p-4 shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center">
              <Target className="text-[#384D48]" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">
                Level {level}
              </p>
              <p className="text-lg font-black text-[#384D48]">
                {xp} XP
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* POMODORO CARD */}
      <div className="bg-[#384D48] text-white rounded-[22px] p-6 shadow-[0_4px_12px_rgba(56,77,72,0.08)] mb-8">

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-[15px] tracking-wide">
            Deep Work Protocol
          </h3>
        </div>

        <div className="text-5xl font-black text-center mb-6 tracking-wide">
          {formatTime()}
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-full bg-white text-[#384D48] rounded-[16px] py-3 font-black flex items-center justify-center gap-2 active:scale-95 transition"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "Pause Session" : "Start 25m Focus"}
        </button>

      </div>

      {/* SUBJECTS */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[11px] font-black text-[#6E7271] uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={14} /> Active Syllabus
        </h3>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => {
          const total = subject.chapters.length;
          const completed = subject.chapters.filter(c => c.completed).length;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <div
              key={subject.id}
              className="bg-white rounded-[22px] p-5 shadow-[0_4px_12px_rgba(56,77,72,0.05)]"
            >

              <div className="flex justify-between items-center mb-3">
                <h4 className="font-black text-[17px] text-[#384D48]">
                  {subject.name}
                </h4>
                <span className="text-[12px] font-bold text-[#ACAD94]">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#384D48] rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* CHAPTERS */}
              <div className="space-y-2 mb-3">
                {subject.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex justify-between items-center bg-[#F5F5F5] px-3 py-2 rounded-[12px]"
                  >
                    <span className={`text-sm ${chapter.completed ? "line-through text-gray-400" : "text-[#384D48]"}`}>
                      {chapter.title}
                    </span>

                    <input
                      type="checkbox"
                      checked={chapter.completed}
                      onChange={() => toggleChapter(subject.id, chapter.id)}
                      className="accent-[#384D48]"
                    />
                  </div>
                ))}
              </div>

              <AddChapter subjectId={subject.id} addChapter={addChapter} />

            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ================= ADD CHAPTER ================= */

function AddChapter({ subjectId, addChapter }: any) {
  const [input, setInput] = useState("");

  return (
    <div className="flex gap-2 mt-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add chapter..."
        className="flex-1 text-sm px-3 py-2 rounded-[12px] bg-[#F5F5F5] outline-none text-[#384D48]"
      />
      <button
        onClick={() => {
          if (!input.trim()) return;
          addChapter(subjectId, input);
          setInput("");
        }}
        className="bg-[#384D48] text-white px-3 py-2 rounded-[12px]"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
