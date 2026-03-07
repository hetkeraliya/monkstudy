"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { User, Play, Pause, Plus } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const {
    subjects,
    toggleChapter,
    addChapter,
    logStudyTime,
    addXp,
  } = useStore();

  /* ================= POMODORO ================= */

  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          addXp(30);
          return 1500;
        }
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

      {/* ================= TOP LINE ================= */}

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

      {/* ================= POMODORO ================= */}

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
  <Play size={18} />
  Start Focus
</button>

      </div>

      {/* ================= SUBJECT CARDS ================= */}

      <div className="space-y-8">

        {subjects.map((subject) => {
          const total = subject.chapters.length;
          const done = subject.chapters.filter(c => c.completed).length;
          const percent = total === 0 ? 0 : Math.round((done / total) * 100);

          const hours = Math.floor(subject.dailyStudyMinutes / 60);
          const mins = subject.dailyStudyMinutes % 60;

          return (
            <div
              key={subject.id}
              className="bg-white rounded-[30px] p-7 shadow-[0_6px_18px_rgba(0,0,0,0.04)]"
            >

              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-[#384D48]">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-[#6E7271] font-bold mt-1">
                    {hours}h {mins}m today
                  </p>
                </div>

                <span className="text-lg font-black text-[#ACAD94]">
                  {percent}%
                </span>
              </div>

              {/* PROGRESS */}
              <div className="h-2 bg-[#F2F2F2] rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-[#384D48] transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* CHAPTERS */}
              <div className="space-y-4 mb-6">
                {subject.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex justify-between items-center"
                  >
                    <span
                      className={`text-lg ${
                        chapter.completed
                          ? "line-through text-gray-400"
                          : "text-[#384D48]"
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
                      className="w-5 h-5 accent-[#384D48]"
                    />
                  </div>
                ))}
              </div>

              {/* ADD ROWS */}
              <AddRow
                subjectId={subject.id}
                addChapter={addChapter}
                logStudyTime={logStudyTime}
              />

            </div>
          );
        })}

      </div>

    </div>
  );
}

/* ================= ADD ROW ================= */

function AddRow({ subjectId, addChapter, logStudyTime }: any) {
  const [chapter, setChapter] = useState("");
  const [minutes, setMinutes] = useState("");

  return (
    <div className="space-y-4 w-full">

      {/* ADD CHAPTER */}
      <div className="flex items-center gap-3 w-full">

        <input
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="Add chapter..."
          className="flex-1 min-w-0 bg-[#F2F2F2] rounded-[18px] px-4 py-3 outline-none text-[#384D48]"
        />

        <button
          onClick={() => {
            if (!chapter.trim()) return;
            addChapter(subjectId, chapter);
            setChapter("");
          }}
          className="shrink-0 w-11 h-11 bg-[#384D48] rounded-[16px] text-white flex items-center justify-center active:scale-95 transition"
        >
          +
        </button>

      </div>

      {/* ADD STUDY TIME */}
      <div className="flex items-center gap-3 w-full">

        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Add study minutes"
          className="flex-1 min-w-0 bg-[#F2F2F2] rounded-[18px] px-4 py-3 outline-none text-[#384D48]"
        />

        <button
          onClick={() => {
            if (!minutes) return;
            logStudyTime(subjectId, parseInt(minutes));
            setMinutes("");
          }}
          className="shrink-0 px-4 h-11 bg-[#ACAD94] text-white font-bold rounded-[16px] active:scale-95 transition"
        >
          Add
        </button>

      </div>

    </div>
  );
}
