"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function FocusPage() {
const router = useRouter();
const addSession = useStore((s) => s.addSession);

const TOTAL_SECONDS = 1500; // 25 minutes

const [seconds, setSeconds] = useState(TOTAL_SECONDS);
const [running, setRunning] = useState(true);

useEffect(() => {
if (!running) return;

const timer = setInterval(() => {
  setSeconds((prev) => prev - 1);
}, 1000);

return () => clearInterval(timer);

}, [running]);

useEffect(() => {
if (seconds <= 0) {
addSession(25);
alert("Deep Focus Session Complete 🌱");
router.push("/");
}
}, [seconds]);

const minutes = Math.floor(seconds / 60);
const sec = seconds % 60;

const percent = seconds / TOTAL_SECONDS;
const circumference = 2 * Math.PI * 150;
const offset = circumference - percent * circumference;

return (
<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#EEF2E6] to-[#DDE5D0] relative overflow-hidden">

  {/* Floating Leaves */}
  <div className="absolute w-full h-full pointer-events-none">
    <div className="leaf leaf1"></div>
    <div className="leaf leaf2"></div>
    <div className="leaf leaf3"></div>
  </div>

  {/* Title */}
  <h1 className="text-[#384D48] font-black text-xl mb-10 tracking-widest">
    MONK FOCUS
  </h1>

  {/* Timer Circle */}
  <div className="relative w-[340px] h-[340px] flex items-center justify-center">

    <svg className="absolute w-[340px] h-[340px] -rotate-90">

      <circle
        cx="170"
        cy="170"
        r="150"
        stroke="#E5E7EB"
        strokeWidth="14"
        fill="none"
      />

      <circle
        cx="170"
        cy="170"
        r="150"
        stroke="#384D48"
        strokeWidth="14"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />

    </svg>

    <div className="flex flex-col items-center">

      <div className="text-[64px] font-black text-[#384D48] tracking-widest">
        {minutes}:{sec.toString().padStart(2, "0")}
      </div>

      <p className="text-[#6E7271] text-sm mt-2">
        Deep Work Session
      </p>

    </div>
  </div>

  {/* Buttons */}
  <div className="flex gap-4 mt-12">

    <button
      onClick={() => setRunning(!running)}
      className="px-6 py-3 bg-[#384D48] text-white rounded-xl font-bold"
    >
      {running ? "Pause" : "Resume"}
    </button>

    <button
      onClick={() => router.push("/")}
      className="px-6 py-3 bg-[#ACAD94] text-white rounded-xl font-bold"
    >
      Exit
    </button>

  </div>

  {/* Leaf Animation */}
  <style jsx>{`

    .leaf{
      position:absolute;
      width:40px;
      height:40px;
      background:rgba(172,173,148,0.35);
      border-radius:60% 40% 60% 40%;
      animation:float 12s infinite linear;
    }

    .leaf1{
      left:20%;
      top:80%;
      animation-duration:16s;
    }

    .leaf2{
      left:60%;
      top:90%;
      animation-duration:12s;
    }

    .leaf3{
      left:80%;
      top:70%;
      animation-duration:18s;
    }

    @keyframes float{
      0%{
        transform:translateY(0) rotate(0deg);
      }
      100%{
        transform:translateY(-900px) rotate(360deg);
      }
    }

  `}</style>

</div>

);
}
