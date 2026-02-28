"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import {
  User,
  Flame,
  Target,
  Play,
  Pause,
  BookOpen,
  Plus,
  Trophy,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const {
    subjects,
    xp,
    level,
    streak,
    addXp,
    addChapter,
    toggleChapter,
  } = useStore();

  /* ================= XP RING ================= */

  const xpProgress = xp % 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (xpProgress / 100) * circumference;

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
          triggerAchievement("Focus Session Complete +30 XP");
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

  /* ================= LEVEL UP POPUP ================= */

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);

  useEffect(() => {
    if (level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(level);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [level, prevLevel]);

  /* ================= ACHIEVEMENT ================= */

  const [achievement, setAchievement] = useState("");

  const triggerAchievement = (text: string) => {
    setAchievement(text);
    setTimeout(() => setAchievement(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#E2E2E2] pb-24 px-5 pt-6">

      {/* ================= HEADER ================= */}

      <header className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push("/profile")}
          className="w-12 h-12 bg-white rounded-[16px] shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center justify-center active:scale-95 transition"
        >
          <User className="text-[#384D48]" size={22} />
        </button>

        <h1 className="text-[#384D48] font-black tracking-[0.2em] text-[11px] uppercase">
          Monk OS
        </h1>

        <div className="w-12 h-12" />
      </header>

      {/* ================= XP RING ================= */}

      <div className="flex justify-center mb-8">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="#F5F5F5"
              strokeWidth="8"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="#384D48"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute text-center">
            <p className="text-sm font-bold text-[#6E7271]">Level</p>
            <p className="text-2xl font-black text-[#384D48]">{level}</p>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}

      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-white rounded-[20px] p-4 shadow-sm flex items-center gap-4">
          <Flame className="text-[#ACAD94]" />
          <div>
            <p className="text-xs font-black text-[#6E7271] uppercase">
              Streak
            </p>
            <p className="font-black text-[#384D48]">{streak} Days</p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[20px] p-4 shadow-sm flex items-center gap-4">
          <Target className="text-[#384D48]" />
          <div>
            <p className="text-xs font-black text-[#6E7271] uppercase">
              XP
            </p>
            <p className="font-black text-[#384D48]">{xp}</p>
          </div>
        </div>
      </div>

      {/* ================= POMODORO ================= */}

      <div className="bg-[#384D48] text-white rounded-[22px] p-6 mb-8 shadow-lg">
        <div className="text-5xl font-black text-center mb-6">
          {formatTime()}
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-full bg-white text-[#384D48] rounded-[16px] py-3 font-black flex items-center justify-center gap-2 active:scale-95 transition"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "Pause" : "Start Focus"}
        </button>
      </div>

      {/* ================= SUBJECTS ================= */}

      <div className="space-y-5">
        {subjects.map((subject) => {
          const total = subject.chapters.length;
          const done = subject.chapters.filter(c => c.completed).length;
          const percent = total === 0 ? 0 : Math.round((done / total) * 100);

          return (
            <div key={subject.id} className="bg-white p-5 rounded-[22px] shadow-sm">
              <div className="flex justify-between mb-3">
                <h4 className="font-black text-[#384D48]">{subject.name}</h4>
                <span className="text-[#ACAD94] font-bold">{percent}%</span>
              </div>

              <div className="h-2 bg-[#F5F5F5] rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[#384D48] transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {subject.chapters.map(ch => (
                <div key={ch.id} className="flex justify-between mb-2">
                  <span className={ch.completed ? "line-through text-gray-400" : "text-[#384D48]"}>
                    {ch.title}
                  </span>
                  <input
                    type="checkbox"
                    checked={ch.completed}
                    onChange={() => {
                      toggleChapter(subject.id, ch.id);
                      if (!ch.completed) triggerAchievement("Chapter Completed +20 XP");
                    }}
                    className="accent-[#384D48]"
                  />
                </div>
              ))}

              <AddChapter subjectId={subject.id} addChapter={addChapter} />
            </div>
          );
        })}
      </div>

      {/* ================= LEVEL UP POPUP ================= */}

      {showLevelUp && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white shadow-xl px-6 py-4 rounded-2xl flex items-center gap-3 animate-bounce z-50">
          <Trophy className="text-[#ACAD94]" />
          <p className="font-black text-[#384D48]">
            Level Up! You reached Level {level}
          </p>
        </div>
      )}

      {/* ================= ACHIEVEMENT TOAST ================= */}

      {achievement && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#384D48] text-white px-5 py-3 rounded-xl shadow-lg animate-slideUp z-50">
          {achievement}
        </div>
      )}

    </div>
  );
}

/* ================= ADD CHAPTER ================= */

function AddChapter({ subjectId, addChapter }: any) {
  const [input, setInput] = useState("");

  return (
    <div className="flex gap-2 mt-3">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add chapter..."
        className="flex-1 px-3 py-2 bg-[#F5F5F5] rounded-xl outline-none"
      />
      <button
        onClick={() => {
          if (!input.trim()) return;
          addChapter(subjectId, input);
          setInput("");
        }}
        className="bg-[#384D48] text-white px-4 rounded-xl"
      >
        <Plus size={16} />
      </button>
    </div>
  );
      }
