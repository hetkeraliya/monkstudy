"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Play, Pause, Plus } from "lucide-react";

export default function Dashboard() {
  const {
    subjects,
    xp,
    level,
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
    <div className="min-h-screen bg-[#F6F7F9] px-5 pt-6 pb-24">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Monk Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Level {level} • {xp} XP
        </p>
      </div>

      {/* BIG TIMER */}
      <div className="bg-white rounded-[18px] p-8 shadow-md mb-8 text-center">
        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-3">
          Deep Work Timer
        </h2>

        <div className="text-5xl font-bold text-[#111827] mb-6">
          {formatTime()}
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-[#4ADE80] text-white px-6 py-3 rounded-[14px] text-sm font-semibold flex items-center gap-2 mx-auto"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "Pause" : "Start"}
        </button>
      </div>

      {/* SUBJECTS */}
      <div className="space-y-6">
        {subjects.map((subject) => {
          const total = subject.chapters.length;
          const completed = subject.chapters.filter(c => c.completed).length;
          const progress =
            total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <div key={subject.id} className="bg-white p-5 rounded-[18px] shadow-sm">

              {/* TITLE */}
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-[#111827]">
                  {subject.name}
                </h3>
                <span className="text-sm text-gray-500">
                  {progress}%
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-2 bg-gray-200 rounded-full mb-4">
                <div
                  className="h-2 bg-[#60A5FA] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* CHAPTERS */}
              <div className="space-y-2 mb-4">
                {subject.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex justify-between items-center bg-[#F6F7F9] px-3 py-2 rounded-[12px]"
                  >
                    <span
                      className={`text-sm ${
                        chapter.completed
                          ? "line-through text-gray-400"
                          : "text-[#111827]"
                      }`}
                    >
                      {chapter.title}
                    </span>

                    <input
                      type="checkbox"
                      checked={chapter.completed}
                      onChange={() =>
                        toggleChapter(subject.id, chapter.id)
                      }
                      className="accent-[#4ADE80]"
                    />
                  </div>
                ))}
              </div>

              {/* ADD CHAPTER */}
              <AddChapter subjectId={subject.id} />

              {/* LOG STUDY */}
              <button
                onClick={() => {
                  logStudyTime(subject.id, 30);
                  addXp(10);
                }}
                className="mt-3 text-xs bg-[#60A5FA] text-white px-3 py-2 rounded-[12px]"
              >
                +30min Study
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= ADD CHAPTER COMPONENT ================= */

function AddChapter({ subjectId }: { subjectId: string }) {
  const [input, setInput] = useState("");
  const addChapter = useStore((s) => s.addChapter);

  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add chapter..."
        className="flex-1 text-sm px-3 py-2 rounded-[12px] border outline-none"
      />
      <button
        onClick={() => {
          if (!input.trim()) return;
          addChapter(subjectId, input);
          setInput("");
        }}
        className="bg-[#4ADE80] text-white px-3 py-2 rounded-[12px]"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
