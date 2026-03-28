"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import {
  ArrowLeft, Pencil, Check, X, Trophy,
  Flame, Clock, BookOpen, Target, LogOut,
  ChevronRight, Zap,
} from "lucide-react";

/* ── Avatar options ── */
const AVATARS = ["🧘","🎯","🦅","🌿","⚡","🔥","🏔️","🌊","🧠","💎","🚀","🌱"];

/* ── IIT options ── */
const IIT_COLLEGES = [
  "IIT Bombay","IIT Delhi","IIT Madras","IIT Kanpur",
  "IIT Kharagpur","IIT Roorkee","IIT Guwahati","IIT Hyderabad",
  "IIT BHU","IIT Dhanbad","NIT Trichy","NIT Surathkal",
  "BITS Pilani","IISC Bangalore","Other",
];

/* ── XP level helper ── */
const xpForLevel = (level: number) => level * 100;

/* ══════════════════════════════════════════
   EDITABLE FIELD
══════════════════════════════════════════ */
function EditField({
  label, value, onSave, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  const commit = () => {
    if (draft.trim()) onSave(draft.trim());
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F2F2F2] last:border-0">
      <div className="flex flex-col flex-1 min-w-0 mr-3">
        <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-0.5">
          {label}
        </p>
        {editing ? (
          <input
            autoFocus
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            placeholder={placeholder}
            className="text-sm font-bold text-[#384D48] bg-[#F5F5F5] rounded-xl px-3 py-1.5 outline-none w-full"
          />
        ) : (
          <p className="text-sm font-bold text-[#384D48] truncate">
            {value || <span className="text-[#ACAD94]">{placeholder}</span>}
          </p>
        )}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {editing ? (
          <>
            <button onClick={commit}
              className="w-7 h-7 bg-[#384D48] text-white rounded-lg flex items-center justify-center">
              <Check size={12}/>
            </button>
            <button onClick={() => { setDraft(value); setEditing(false); }}
              className="w-7 h-7 bg-[#F2F2F2] text-[#6E7271] rounded-lg flex items-center justify-center">
              <X size={12}/>
            </button>
          </>
        ) : (
          <button onClick={() => { setDraft(value); setEditing(true); }}
            className="w-7 h-7 bg-[#F2F2F2] text-[#6E7271] rounded-lg flex items-center justify-center active:scale-90 transition">
            <Pencil size={12}/>
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STAT TILE
══════════════════════════════════════════ */
function StatTile({ icon: Icon, label, value }: {
  icon: any; label: string; value: string;
}) {
  return (
    <div className="bg-[#F5F5F5] rounded-2xl p-3 flex flex-col gap-1">
      <Icon size={14} className="text-[#ACAD94]"/>
      <p className="text-[7px] font-bold text-[#6E7271] uppercase tracking-wider">{label}</p>
      <p className="text-sm font-black text-[#384D48] leading-tight">{value}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted]         = useState(false);
  const [showAvatarPicker, setShowAP] = useState(false);
  const [showCollegePicker, setShowCP] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const {
    xp, level, streak, sessions, subjects,
    profile, updateProfile, resetAll,
  } = useStore();

  useEffect(() => { setMounted(true); }, []);

  /* ── stats ── */
  const totalMins = sessions.reduce((a, s) => a + s.minutes, 0);
  const totalHrs  = (totalMins / 60).toFixed(1);

  const chapsDone = subjects.reduce(
    (a, sub) => a + sub.chapters.filter((c) => c.completed).length, 0
  );

  const xpInLevel    = xp % 100;
  const xpNeeded     = 100;
  const xpPct        = Math.round((xpInLevel / xpNeeded) * 100);

  // Days until JEE (approximate — JEE Advanced is ~May each year)
  const jeeDate = new Date(`${profile.targetYear}-05-25`);
  const daysLeft = Math.max(0, Math.ceil(
    (jeeDate.getTime() - Date.now()) / 86400000
  ));

  // Streak calc
  const byDay = useMemo(() => {
    const m: Record<string, boolean> = {};
    sessions.forEach(s => { m[s.date.slice(0,10)] = true; });
    return m;
  }, [sessions]);

  const currentStreak = useMemo(() => {
    let s = 0;
    const c = new Date(); c.setHours(0,0,0,0);
    while (byDay[c.toISOString().slice(0,10)]) {
      s++;
      c.setDate(c.getDate()-1);
    }
    return s;
  }, [byDay]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!mounted) return null;

  const displayName = profile.name || "Monk";

  return (
    <div className="min-h-screen bg-[#E2E2E2] pb-36">

      {/* ── Header ── */}
      <div className="bg-[#384D48] px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center active:scale-90 transition">
            <ArrowLeft size={18} className="text-white"/>
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest flex-1">Profile</h1>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAP(true)}
            className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center text-4xl active:scale-90 transition relative"
          >
            {profile.avatar}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#ACAD94] rounded-lg flex items-center justify-center">
              <Pencil size={10} className="text-white"/>
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white truncate">{displayName}</h2>
            <p className="text-[10px] text-[#ACAD94] font-bold uppercase tracking-wider">
              Level {level} · Monk
            </p>
            {/* XP bar */}
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-[8px] text-[#ACAD94] font-bold">{xpInLevel} XP</span>
                <span className="text-[8px] text-[#ACAD94] font-bold">{xpNeeded} XP</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[#ACAD94] rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-2">
          <StatTile icon={Clock}    label="Hours"   value={totalHrs}/>
          <StatTile icon={Flame}    label="Streak"  value={`${currentStreak}d`}/>
          <StatTile icon={BookOpen} label="Chapters" value={String(chapsDone)}/>
          <StatTile icon={Zap}      label="XP"      value={String(xp)}/>
        </div>

        {/* ── JEE Countdown ── */}
        <div className="bg-[#384D48] rounded-[22px] p-4 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-1">
              JEE {profile.targetYear} Countdown
            </p>
            <p className="text-2xl font-black text-white">{daysLeft} <span className="text-sm font-bold text-[#ACAD94]">days left</span></p>
            <p className="text-[9px] text-[#ACAD94] mt-0.5">{profile.targetCollege}</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <Trophy size={28} className="text-[#ACAD94]"/>
          </div>
        </div>

        {/* ── Edit Profile card ── */}
        <div className="bg-white rounded-[24px] p-5">
          <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-2">
            Edit Profile
          </p>

          <EditField
            label="Name"
            value={profile.name}
            onSave={(v) => updateProfile({ name: v })}
            placeholder="Your name..."
          />

          <EditField
            label="Bio"
            value={profile.bio}
            onSave={(v) => updateProfile({ bio: v })}
            placeholder="One line about you..."
          />

          {/* Target college — picker */}
          <div className="flex items-center justify-between py-3 border-b border-[#F2F2F2]">
            <div>
              <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-0.5">
                Target College
              </p>
              <p className="text-sm font-bold text-[#384D48]">{profile.targetCollege}</p>
            </div>
            <button onClick={() => setShowCP(true)}
              className="w-7 h-7 bg-[#F2F2F2] text-[#6E7271] rounded-lg flex items-center justify-center active:scale-90 transition">
              <ChevronRight size={14}/>
            </button>
          </div>

          {/* Target year */}
          <div className="flex items-center justify-between py-3 border-b border-[#F2F2F2]">
            <div>
              <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-0.5">
                Target Year
              </p>
              <p className="text-sm font-bold text-[#384D48]">{profile.targetYear}</p>
            </div>
            <div className="flex gap-1">
              {["2025","2026","2027"].map(y => (
                <button key={y}
                  onClick={() => updateProfile({ targetYear: y })}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black transition ${
                    profile.targetYear === y
                      ? "bg-[#384D48] text-white"
                      : "bg-[#F2F2F2] text-[#6E7271]"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Daily goal */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-0.5">
                Daily Study Goal
              </p>
              <p className="text-sm font-bold text-[#384D48]">{profile.dailyGoalHours}h per day</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateProfile({ dailyGoalHours: Math.max(1, profile.dailyGoalHours - 1) })}
                className="w-7 h-7 bg-[#F2F2F2] text-[#384D48] rounded-lg font-black text-base flex items-center justify-center active:scale-90 transition"
              >−</button>
              <span className="text-sm font-black text-[#384D48] w-5 text-center">
                {profile.dailyGoalHours}
              </span>
              <button
                onClick={() => updateProfile({ dailyGoalHours: Math.min(16, profile.dailyGoalHours + 1) })}
                className="w-7 h-7 bg-[#384D48] text-white rounded-lg font-black text-base flex items-center justify-center active:scale-90 transition"
              >+</button>
            </div>
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div className="bg-white rounded-[24px] p-5 space-y-3">
          <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">Account</p>

          <button
            onClick={logout}
            className="w-full flex items-center justify-between py-3 border-b border-[#F2F2F2]"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-[#6E7271]"/>
              <span className="text-sm font-bold text-[#384D48]">Log Out</span>
            </div>
            <ChevronRight size={14} className="text-[#ACAD94]"/>
          </button>

          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              <X size={16} className="text-red-400"/>
              <span className="text-sm font-bold text-red-400">Reset All Data</span>
            </div>
            <ChevronRight size={14} className="text-[#ACAD94]"/>
          </button>
        </div>

        {/* App version */}
        <p className="text-center text-[8px] text-[#ACAD94] font-bold uppercase tracking-widest pb-4">
          Monk Study v1.0 · JEE 2026
        </p>

      </div>

      {/* ══ AVATAR PICKER SHEET ══ */}
      <AnimatePresence>
        {showAvatarPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowAP(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-50"
            >
              <div className="w-10 h-1 bg-[#E2E2E2] rounded-full mx-auto mb-5"/>
              <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-4">
                Choose Avatar
              </p>
              <div className="grid grid-cols-6 gap-3 mb-6">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { updateProfile({ avatar: a }); setShowAP(false); }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition active:scale-90 ${
                      profile.avatar === a
                        ? "bg-[#384D48]"
                        : "bg-[#F5F5F5]"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ COLLEGE PICKER SHEET ══ */}
      <AnimatePresence>
        {showCollegePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowCP(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-50 max-h-[70vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-[#E2E2E2] rounded-full mx-auto mb-5"/>
              <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-4">
                Target College
              </p>
              <div className="space-y-2">
                {IIT_COLLEGES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { updateProfile({ targetCollege: c }); setShowCP(false); }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition active:scale-95 ${
                      profile.targetCollege === c
                        ? "bg-[#384D48] text-white"
                        : "bg-[#F5F5F5] text-[#384D48]"
                    }`}
                  >
                    {c}
                    {profile.targetCollege === c && (
                      <Check size={14} className="inline ml-2"/>
                    )}
                  </button>
                ))}
              </div>
              <div className="h-6"/>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ RESET CONFIRM DIALOG ══ */}
      <AnimatePresence>
        {confirmReset && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-8"
            >
              <div className="bg-white rounded-[28px] p-7 w-full">
                <h3 className="text-lg font-black text-[#384D48] mb-2">Reset All Data?</h3>
                <p className="text-sm text-[#6E7271] mb-6 leading-relaxed">
                  This will delete all your sessions, chapters, marks, and XP permanently. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-3 bg-[#F2F2F2] text-[#384D48] rounded-2xl font-black text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { resetAll(); setConfirmReset(false); }}
                    className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-black text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
                 }
      
