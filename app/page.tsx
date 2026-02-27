"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { User, Flame, Target, Play, Pause, RotateCcw, BookOpen } from "lucide-react";

export default function Dashboard() {
  const user = useStore((state) => state.user);
  const subjects = useStore((state) => state.subjects);
  const xp = useStore((state) => state.xp);
  const streak = useStore((state) => state.streak);
  const addXp = useStore((state) => state.addXp);

  // ----------------------
  // POMODORO STATE
  // ----------------------
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [seconds, setSeconds] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            if (typeof window !== "undefined" && navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }

            if (!isBreak) {
              addXp(25); // reward XP
            }

            setIsBreak(!isBreak);
            return isBreak ? WORK_TIME : BREAK_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isBreak, addXP]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress =
    ((isBreak ? BREAK_TIME : WORK_TIME) - seconds) /
    (isBreak ? BREAK_TIME : WORK_TIME);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="min-h-screen bg-[#E2E2E2] pb-24 px-5 pt-6">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-8">
        <Link
          href="/profile"
          className="w-12 h-12 bg-white rounded-[16px] shadow flex items-center justify-center active:scale-95 transition"
        >
          <User className="text-[#384D48]" size={22} />
        </Link>

        <h1 className="text-[#384D48] font-black tracking-[0.2em] text-[11px] uppercase">
          Monk OS
        </h1>

        <div className="w-12 h-12" />
      </header>

      {/* GREETING */}
      <h2 className="text-2xl font-black text-[#384D48] mb-6">
        Welcome back,{" "}
        <span className="text-[#ACAD94]">
          {user?.displayName?.split(" ")[0] || "Initiate"}
        </span>
      </h2>

      {/* STATS */}
      <div className="flex gap-4 mb-10">
        <StatCard icon={<Flame size={18} />} label="Streak" value={`${streak} Days`} />
        <StatCard icon={<Target size={18} />} label="Focus XP" value={xp} />
      </div>

      {/* ---------------------- */}
      {/* BIG POMODORO SECTION */}
      {/* ---------------------- */}
      <div className="bg-white rounded-[26px] p-8 shadow mb-10 flex flex-col items-center">

        <div className="relative w-44 h-44 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="#F5F5F5"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="#384D48"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-[#384D48]">
            {formatTime()}
          </div>
        </div>

        <p className="text-sm font-bold text-[#6E7271] mb-6">
          {isBreak ? "Break Mode" : "Deep Work Mode"}
        </p>

        <div className="flex gap-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-[#384D48] text-white p-4 rounded-full active:scale-95 transition"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setIsBreak(false);
              setSeconds(WORK_TIME);
            }}
            className="bg-[#F5F5F5] p-4 rounded-full active:scale-95 transition"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* SUBJECT CARDS */}
      <h3 className="text-xs font-black text-[#6E7271] uppercase mb-4 flex items-center gap-2">
        <BookOpen size={14} /> Active Syllabus
      </h3>

      <div className="space-y-4">
        {subjects.map((subject) => {
          const progressPercent = Math.round(
            (subject.completedChapters / subject.totalChapters) * 100
          );

          return (
            <div
              key={subject.id}
              className="bg-white rounded-[22px] p-5 shadow active:scale-[0.98] transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-black text-[#384D48]">
                  {subject.name}
                </h4>

                <span className="text-xs font-bold text-[#ACAD94]">
                  {progressPercent}%
                </span>
              </div>

              <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#384D48] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <button
                onClick={() => {
                  if (typeof window !== "undefined" && navigator.vibrate) {
                    navigator.vibrate(10);
                  }
                  alert(`Entering ${subject.name}`);
                }}
                className="bg-[#F5F5F5] px-4 py-2 rounded-[12px] text-xs font-black active:bg-[#E2E2E2] transition"
              >
                Enter
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="flex-1 bg-white rounded-[20px] p-4 shadow flex items-center gap-3">
      <div className="w-9 h-9 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[#384D48]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-[#6E7271] uppercase">
          {label}
        </p>
        <p className="text-lg font-black text-[#384D48]">{value}</p>
      </div>
    </div>
  );
            }
