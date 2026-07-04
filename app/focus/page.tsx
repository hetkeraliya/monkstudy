"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Lock, ChevronLeft } from "lucide-react";

type Phase = "ready" | "running" | "paused" | "done";

const DURATIONS = [
  { label: "15", minutes: 15 },
  { label: "25", minutes: 25 },
  { label: "45", minutes: 45 },
  { label: "60", minutes: 60 },
];

export default function FocusPage() {
  const router = useRouter();
  const addSession = useStore((s) => s.addSession);
  const addXp = useStore((s) => s.addXp);

  const [totalSeconds, setTotalSeconds] = useState(1500);
  const [seconds, setSeconds] = useState(1500);
  const [phase, setPhase] = useState<Phase>("ready");
  const [holdProgress, setHoldProgress] = useState(0);

  const startTimeRef = useRef<string>("");
  const wakeLockRef = useRef<any>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);

  /* ── Phone takeover: fullscreen + wake lock + native bridge ── */
  const engageLock = useCallback(async () => {
    // Native Android app blocking
    if (typeof window !== "undefined" && (window as any).Android?.startFocus) {
      (window as any).Android.startFocus();
    }
    // Browser fullscreen (hides status bar / browser chrome on Android)
    try {
      const el = document.documentElement as any;
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch {}
    // Keep the screen awake for the whole session
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      }
    } catch {}
  }, []);

  const releaseLock = useCallback(async () => {
    if (typeof window !== "undefined" && (window as any).Android?.stopFocus) {
      (window as any).Android.stopFocus();
    }
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {}
    try {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
    } catch {}
  }, []);

  /* Re-acquire wake lock if the tab regains visibility mid-session */
  useEffect(() => {
    const onVisible = async () => {
      if (
        document.visibilityState === "visible" &&
        (phase === "running" || phase === "paused") &&
        !wakeLockRef.current
      ) {
        try {
          if ("wakeLock" in navigator) {
            wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
          }
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [phase]);

  /* Trap the back button while a session is active */
  useEffect(() => {
    if (phase !== "running" && phase !== "paused") return;
    const trap = () => history.pushState(null, "", location.href);
    trap();
    window.addEventListener("popstate", trap);
    return () => window.removeEventListener("popstate", trap);
  }, [phase]);

  /* Warn before closing the tab mid-session */
  useEffect(() => {
    if (phase !== "running" && phase !== "paused") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  /* Timer tick */
  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => setSeconds((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const saveSession = useCallback(
    (remaining: number) => {
      if (savedRef.current) return;
      savedRef.current = true;
      const studied = Math.max(1, Math.round((totalSeconds - remaining) / 60));
      addSession(studied, startTimeRef.current || new Date().toISOString());
      addXp(studied * 2);
    },
    [totalSeconds, addSession, addXp]
  );

  /* Session complete */
  useEffect(() => {
    if (seconds <= 0 && phase === "running") {
      saveSession(0);
      releaseLock();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setPhase("done");
    }
  }, [seconds, phase, saveSession, releaseLock]);

  /* Release everything on unmount */
  useEffect(() => {
    return () => {
      releaseLock();
    };
  }, [releaseLock]);

  const startSession = async () => {
    savedRef.current = false;
    startTimeRef.current = new Date().toISOString();
    setSeconds(totalSeconds);
    setPhase("running");
    if (navigator.vibrate) navigator.vibrate(40);
    await engageLock();
  };

  /* ── Hold-to-exit (3 seconds) ── */
  const HOLD_MS = 3000;
  const beginHold = () => {
    if (holdTimerRef.current) return;
    const startedAt = Date.now();
    holdTimerRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startedAt) / HOLD_MS) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        cancelHold();
        exitSession();
      }
    }, 50);
  };
  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldProgress(0);
  };

  const exitSession = async () => {
    saveSession(seconds);
    await releaseLock();
    router.push("/");
  };

  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const sec = Math.max(0, seconds) % 60;
  const circumference = 2 * Math.PI * 140;
  const offset = circumference - (Math.max(0, seconds) / totalSeconds) * circumference;

  /* ══════════ READY ══════════ */
  if (phase === "ready") {
    return (
      <main className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#EEF2E6] px-6">
        <button
          onClick={() => router.push("/")}
          aria-label="Go back"
          className="absolute top-6 left-5 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm text-[#384D48] active:scale-95 transition"
        >
          <ChevronLeft size={20} />
        </button>

        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ACAD94]">
          Monk Focus
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#384D48] text-balance text-center">
          Deep Work Session
        </h1>
        <p className="mt-2 text-sm text-[#6E7271] text-center text-pretty max-w-[260px] leading-relaxed">
          Your phone locks into focus mode. Screen stays on, exit takes a
          3-second hold.
        </p>

        <div className="mt-10 flex gap-3" role="group" aria-label="Session length">
          {DURATIONS.map((d) => {
            const active = totalSeconds === d.minutes * 60;
            return (
              <button
                key={d.minutes}
                onClick={() => {
                  setTotalSeconds(d.minutes * 60);
                  setSeconds(d.minutes * 60);
                }}
                className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl font-black transition active:scale-95 ${
                  active
                    ? "bg-[#384D48] text-white shadow-lg"
                    : "bg-white text-[#384D48] shadow-sm"
                }`}
              >
                <span className="text-xl">{d.label}</span>
                <span
                  className={`text-[9px] uppercase tracking-wider ${
                    active ? "text-[#ACAD94]" : "text-[#ACAD94]"
                  }`}
                >
                  min
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={startSession}
          className="mt-10 flex w-full max-w-[320px] items-center justify-center gap-2 rounded-[20px] bg-[#384D48] py-5 font-black text-white shadow-[0_8px_24px_rgba(56,77,72,0.35)] active:scale-[0.98] transition"
        >
          <Lock size={16} />
          Lock In &amp; Start
        </button>
      </main>
    );
  }

  /* ══════════ DONE ══════════ */
  if (phase === "done") {
    return (
      <main className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#384D48] px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ACAD94]">
            Session Complete
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">
            {Math.round(totalSeconds / 60)} minutes
          </h1>
          <p className="mt-2 text-sm text-[#ACAD94]">
            of pure, undistracted focus
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-10 rounded-[20px] bg-white px-10 py-4 font-black text-[#384D48] active:scale-95 transition"
          >
            Return Home
          </button>
        </motion.div>
      </main>
    );
  }

  /* ══════════ RUNNING / PAUSED — full phone takeover ══════════ */
  return (
    <main className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden bg-[#1C2624] select-none touch-none">
      {/* floating leaves */}
      <div className="pointer-events-none absolute inset-0">
        <div className="leaf leaf1" />
        <div className="leaf leaf2" />
        <div className="leaf leaf3" />
      </div>

      <div className="flex items-center gap-2 mb-10">
        <Lock size={12} className="text-[#ACAD94]" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ACAD94]">
          Phone Locked
        </p>
      </div>

      <div className="relative flex h-[320px] w-[320px] items-center justify-center">
        <svg className="absolute h-[320px] w-[320px] -rotate-90" aria-hidden="true">
          <circle cx="160" cy="160" r="140" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
          <circle
            cx="160" cy="160" r="140"
            stroke="#ACAD94" strokeWidth="12" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-1000"
          />
        </svg>
        <div className="flex flex-col items-center">
          <div
            className="text-[64px] font-black tracking-widest text-white tabular-nums"
            role="timer"
            aria-live="off"
          >
            {minutes}:{sec.toString().padStart(2, "0")}
          </div>
          <p className="mt-1 text-sm text-[#8A918E]">
            {phase === "paused" ? "Paused" : "Deep Work"}
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-5">
        <button
          onClick={() => {
            setPhase((p) => (p === "running" ? "paused" : "running"));
            if (navigator.vibrate) navigator.vibrate(20);
          }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur active:scale-90 transition"
          aria-label={phase === "running" ? "Pause session" : "Resume session"}
        >
          {phase === "running" ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>

        {/* Hold to exit */}
        <button
          onPointerDown={beginHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          className="relative overflow-hidden rounded-full border border-white/15 px-8 py-3"
          aria-label="Hold for 3 seconds to end the session"
        >
          <span
            className="absolute inset-y-0 left-0 bg-white/15 transition-none"
            style={{ width: `${holdProgress}%` }}
            aria-hidden="true"
          />
          <span className="relative text-[11px] font-black uppercase tracking-[0.2em] text-[#8A918E]">
            {holdProgress > 0 ? "Keep holding..." : "Hold to exit"}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {phase === "paused" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-10 text-[10px] font-bold uppercase tracking-widest text-[#8A918E]"
          >
            The monk waits. The clock does not.
          </motion.p>
        )}
      </AnimatePresence>

      <style jsx>{`
        .leaf {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(172, 173, 148, 0.12);
          border-radius: 60% 40% 60% 40%;
          animation: float 12s infinite linear;
        }
        .leaf1 { left: 20%; top: 80%; animation-duration: 16s; }
        .leaf2 { left: 60%; top: 90%; animation-duration: 12s; }
        .leaf3 { left: 80%; top: 70%; animation-duration: 18s; }
        @keyframes float {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-900px) rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
