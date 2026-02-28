"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const {
    subjects,
    addChapter,
    toggleChapter,
    logStudyTime,
  } = useStore();

  return (
    <div className="min-h-screen bg-[#E2E2E2] px-5 pt-6 pb-28">

      {/* SUBJECT CARDS */}
      <div className="space-y-6">

        {subjects.map((subject) => {
          const total = subject.chapters.length;
          const completed = subject.chapters.filter(c => c.completed).length;
          const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

          const hours = Math.floor(subject.dailyStudyMinutes / 60);
          const mins = subject.dailyStudyMinutes % 60;

          return (
            <div
              key={subject.id}
              className="bg-white rounded-[28px] p-6 shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
            >

              {/* TITLE */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-black text-[#384D48]">
                  {subject.name}
                </h3>

                <div className="text-right">
                  <p className="text-sm font-bold text-[#ACAD94]">
                    {percent}%
                  </p>
                  <p className="text-[10px] text-[#6E7271] font-bold">
                    {hours}h {mins}m today
                  </p>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-2 bg-[#F1F1F1] rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-[#384D48] transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* CHAPTER LIST */}
              <div className="space-y-3 mb-5">
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

              {/* ADD CHAPTER + STUDY TIME */}
              <AddSection
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

/* ================= ADD SECTION ================= */

function AddSection({ subjectId, addChapter, logStudyTime }: any) {
  const [input, setInput] = useState("");
  const [minutes, setMinutes] = useState("");

  return (
    <div className="space-y-3">

      {/* ADD CHAPTER ROW */}
      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add chapter..."
          className="flex-1 bg-[#F1F1F1] rounded-[18px] px-4 py-3 text-[#384D48] outline-none"
        />

        <button
          onClick={() => {
            if (!input.trim()) return;
            addChapter(subjectId, input);
            setInput("");
          }}
          className="bg-[#384D48] w-12 h-12 rounded-[18px] flex items-center justify-center shadow-md active:scale-95 transition"
        >
          <Plus className="text-white" size={18} />
        </button>
      </div>

      {/* STUDY TIME ROW */}
      <div className="flex items-center gap-3">
        <input
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Add study minutes"
          type="number"
          className="flex-1 bg-[#F1F1F1] rounded-[18px] px-4 py-3 text-[#384D48] outline-none"
        />

        <button
          onClick={() => {
            if (!minutes) return;
            logStudyTime(subjectId, parseInt(minutes));
            setMinutes("");
          }}
          className="bg-[#ACAD94] text-white px-4 h-12 rounded-[18px] font-bold active:scale-95 transition"
        >
          Add
        </button>
      </div>

    </div>
  );
                    }
