"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function FocusPage() {
  const router = useRouter();
  const addSession = useStore((s) => s.addSession);

  const [seconds, setSeconds] = useState(1500); // 25 min
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (seconds === 0) {
      addSession(25);
      alert("Session complete!");
      router.push("/");
    }
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (
    <div className="min-h-screen bg-[#384D48] text-white flex flex-col items-center justify-center space-y-10">

      <h1 className="text-3xl font-bold">Deep Focus</h1>

      <div className="text-7xl font-black tracking-widest">
        {minutes}:{sec.toString().padStart(2, "0")}
      </div>

      <div className="flex gap-4">

        <button
          onClick={() => setRunning(!running)}
          className="bg-[#ACAD94] px-6 py-3 rounded-xl"
        >
          {running ? "Pause" : "Resume"}
        </button>

        <button
          onClick={() => router.push("/")}
          className="border border-white px-6 py-3 rounded-xl"
        >
          Exit
        </button>

      </div>

    </div>
  );
}
