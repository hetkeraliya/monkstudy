"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useStore } from "@/store/useStore";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const toKey  = (d: Date) => d.toISOString().slice(0, 10);
const todayK = () => toKey(new Date());

const STAGES = [
  { min: 0,    label: "Seed",       desc: "Your journey begins"       },
  { min: 10,   label: "Sprout",     desc: "First roots forming"       },
  { min: 50,   label: "Sapling",    desc: "Growing towards the light" },
  { min: 150,  label: "Young Tree", desc: "Branches reaching out"     },
  { min: 300,  label: "Mature",     desc: "A sturdy, rooted mind"     },
  { min: 500,  label: "Banyan",     desc: "Vast canopy, deep roots"   },
  { min: 1000, label: "Ancient",    desc: "A legend in the making"    },
];

function getStage(h: number) {
  let s = STAGES[0], idx = 0;
  STAGES.forEach((st, i) => { if (h >= st.min) { s = st; idx = i; } });
  const next = STAGES[idx + 1];
  const prog = next ? Math.min(1, (h - s.min) / (next.min - s.min)) : 1;
  return { stage: s, idx, next, prog };
}

/* ══════════════════════════════════════════
   REALISTIC BONSAI TREE
   Photorealistic stage images that evolve
   as study hours grow
══════════════════════════════════════════ */
const STAGE_IMAGES = [
  "/zen/tree-seed.png",     // Seed
  "/zen/tree-sprout.png",   // Sprout
  "/zen/tree-sapling.png",  // Sapling
  "/zen/tree-young.png",    // Young Tree
  "/zen/tree-mature.png",   // Mature
  "/zen/tree-mature.png",   // Banyan
  "/zen/tree-ancient.png",  // Ancient
];

function RealisticTree({ totalHours }: { totalHours: number }) {
  const { stage, idx, prog } = getStage(totalHours);
  const grown = Math.min(1, (idx + prog) / (STAGES.length - 1));
  const img = totalHours === 0 ? STAGE_IMAGES[0] : STAGE_IMAGES[idx];

  return (
    <div className="relative flex flex-col items-center justify-end" style={{ height: 260 }}>
      <motion.img
        key={img}
        src={img}
        alt={`${stage.label} bonsai tree — ${totalHours.toFixed(1)} hours of growth`}
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="object-contain rounded-[20px]"
        style={{
          height: `${55 + grown * 45}%`,
          maxWidth: "100%",
        }}
      />
      {/* Soft ground shadow */}
      <div
        aria-hidden="true"
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#384D48]/15 blur-md"
        style={{ width: `${30 + grown * 40}%`, height: 14 }}
      />
      {totalHours === 0 && (
        <p className="absolute bottom-3 left-0 right-0 text-center text-[8px] font-bold text-[#6E7271] uppercase tracking-[0.25em]">
          Plant your seed
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   REALISTIC STONE STACK
   Real stone photo textures shaped into
   smooth stacked pebbles
══════════════════════════════════════════ */
const STONE_TEXTURES = [
  "/zen/stone-texture-1.png",
  "/zen/stone-texture-2.png",
  "/zen/stone-texture-3.png",
];

function RealisticStoneStack({
  count,
  missedDays,
}: {
  count: number;
  missedDays: number;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (missedDays >= 1 && !(missedDays >= 3 && count === 0)) {
      controls.start({
        rotate: [0, -3, 3, -2, 2, -1, 1, 0],
        transition: { duration: 1.8, ease: "easeOut" },
      });
    }
  }, [missedDays, count, controls]);

  const stones = Math.min(count, 10);
  const fallen = missedDays >= 3 && count === 0;

  // Pebble sizes from bottom (largest) to top (smallest)
  const configs = Array.from({ length: 10 }, (_, i) => ({
    w: 118 - i * 7,
    h: (118 - i * 7) * 0.34,
    tex: STONE_TEXTURES[i % 3],
    ox: [0, -3, 2, -2, 3, -2, 1, -3, 1, -1][i],
    rot: [0, -1.5, 1, -1, 1.5, -1, 0.5, -1.5, 0.5, -0.5][i],
  }));

  return (
    <div className="flex justify-center">
      <div
        className="relative flex flex-col items-center justify-end"
        style={{ height: 240, width: 200 }}
      >
        {/* Ground shadow pool */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-[#1A1A1A]/20 blur-md"
          style={{ width: 130, height: 16 }}
        />
        {/* Flat base stone */}
        <div
          aria-hidden="true"
          className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-[50%]"
          style={{
            width: 140,
            height: 22,
            backgroundImage: `url(${STONE_TEXTURES[1]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "inset 0 -6px 10px rgba(0,0,0,0.35), inset 0 4px 6px rgba(255,255,255,0.15)",
            opacity: 0.85,
          }}
        />

        {stones === 0 && !fallen && (
          <p className="absolute bottom-10 left-0 right-0 text-center text-[8px] font-bold text-[#8A908E] uppercase tracking-[0.2em]">
            Awaiting first stone
          </p>
        )}

        {fallen ? (
          /* Scattered fallen stones */
          <div className="absolute bottom-2 left-0 right-0 flex items-end justify-center">
            {configs.slice(0, 5).map((c, i) => (
              <motion.div
                key={i}
                initial={{ y: -120, rotate: 0, opacity: 0 }}
                animate={{
                  y: 0,
                  rotate: [0, 25, -40, 60, -20][i],
                  opacity: 1,
                }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 120, damping: 12 }}
                className="rounded-[50%] -mx-2"
                style={{
                  width: c.w * 0.6,
                  height: c.h * 0.7,
                  backgroundImage: `url(${c.tex})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow:
                    "inset 0 -5px 8px rgba(0,0,0,0.4), inset 0 4px 6px rgba(255,255,255,0.2), 0 4px 6px rgba(0,0,0,0.25)",
                }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            animate={controls}
            className="relative flex flex-col items-center justify-end pb-3"
            style={{ transformOrigin: "50% 100%" }}
          >
            {/* Top → bottom: smallest stone renders first */}
            {Array.from({ length: stones }, (_, r) => {
              const i = stones - 1 - r; // stone index from bottom
              const c = configs[i];
              return (
                <motion.div
                  key={i}
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 160, damping: 14 }}
                  className="rounded-[50%] -mb-1.5"
                  style={{
                    width: c.w,
                    height: c.h,
                    marginLeft: c.ox,
                    rotate: `${c.rot}deg`,
                    backgroundImage: `url(${c.tex})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow:
                      "inset 0 -8px 12px rgba(0,0,0,0.45), inset 0 5px 8px rgba(255,255,255,0.22), inset -6px 0 10px rgba(0,0,0,0.2), 0 5px 8px rgba(0,0,0,0.3)",
                    zIndex: 10 - i,
                  }}
                />
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ZenGarden() {
  const [mounted, setMounted] = useState(false);
  const { sessions, subjects, xp, level, streak } = useStore();
  useEffect(() => { setMounted(true); }, []);

  const totalMins  = sessions.reduce((a, s) => a + s.minutes, 0);
  const totalHours = totalMins / 60;
  const fruits     = subjects.reduce((a, s) => a + s.chapters.filter(c => c.completed).length, 0);
  const todaySess  = sessions.filter(s => s.date.slice(0,10) === todayK()).length;

  const byDay = useMemo(() => new Set(sessions.map(s => s.date.slice(0,10))), [sessions]);
  const missedDays = useMemo(() => {
    let m = 0;
    const c = new Date(); c.setHours(0,0,0,0); c.setDate(c.getDate()-1);
    while (!byDay.has(toKey(c)) && m < 7) { m++; c.setDate(c.getDate()-1); }
    return m;
  }, [byDay]);

  const { stage, next, prog } = getStage(totalHours);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#EEF2E6] pb-36">

      <div className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-black text-[#384D48] tracking-tighter uppercase">Zen Garden</h1>
        <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">Your growth, visualized</p>
      </div>

      {/* ── TREE CARD ── */}
      <div className="mx-5 bg-white rounded-[28px] p-5 mb-4 shadow-sm overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="inline-block bg-[#384D48] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1">
              {stage.label}
            </span>
            <p className="text-[9px] text-[#6E7271] font-bold">{stage.desc}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-[#384D48]">{totalHours.toFixed(1)}</p>
            <p className="text-[8px] text-[#ACAD94] font-bold uppercase">hours studied</p>
          </div>
        </div>

        {/* Tree illustration */}
        <div className="bg-[#EEF2E6] rounded-[20px] py-2 overflow-hidden">
          <RealisticTree totalHours={totalHours} />
        </div>

        {next && (
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="text-[8px] font-bold text-[#6E7271]">{stage.label}</span>
              <span className="text-[8px] font-bold text-[#ACAD94]">
                {(next.min - totalHours).toFixed(0)}h → {next.label}
              </span>
            </div>
            <div className="h-1.5 bg-[#E2E2E2] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${prog * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-[#384D48] rounded-full"/>
            </div>
          </div>
        )}

        {fruits > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F2F2F2]">
            <div className="w-3 h-3 rounded-full bg-[#A85A20]"/>
            <p className="text-[9px] text-[#6E7271] font-bold">
              {fruits} fruit{fruits !== 1 ? "s" : ""} = {fruits} chapter{fruits !== 1 ? "s" : ""} mastered
            </p>
          </div>
        )}
      </div>

      {/* ── Milestones ── */}
      <div className="mx-5 bg-white rounded-[24px] p-4 mb-4">
        <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-3">Growth Milestones</p>
        <div className="space-y-2">
          {STAGES.map((s, i) => {
            const reached = totalHours >= s.min;
            const active  = s.label === stage.label;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  active ? "bg-[#384D48]" : reached ? "bg-[#ACAD94]" : "bg-[#E2E2E2]"
                }`}/>
                <div className="flex-1 flex justify-between">
                  <span className={`text-xs font-bold ${
                    active ? "text-[#384D48]" : reached ? "text-[#6E7271]" : "text-[#ACAD94]"
                  }`}>
                    {s.label}
                    {active && (
                      <span className="ml-2 text-[7px] bg-[#384D48] text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                        You
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-[#ACAD94] font-bold">{s.min}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STONE STACK CARD ── */}
      <div className="mx-5 bg-white rounded-[28px] p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Zen Stone Stack</p>
            <p className="text-[9px] text-[#ACAD94] font-bold">
              {todaySess === 0
                ? "Complete a Pomodoro to place a stone"
                : `${todaySess} stone${todaySess > 1 ? "s" : ""} placed today`}
            </p>
          </div>
          {missedDays > 0 && (
            <div className={`px-2 py-1 rounded-xl text-[8px] font-black uppercase ${
              missedDays >= 3 ? "bg-red-100 text-red-500" : "bg-[#ACAD94]/20 text-[#ACAD94]"
            }`}>
              {missedDays >= 3 ? "Stack fell" : `${missedDays}d gap · wobbling`}
            </div>
          )}
        </div>

        <RealisticStoneStack count={todaySess} missedDays={missedDays} />

        <div className="mt-4 space-y-1.5 pt-3 border-t border-[#F2F2F2]">
          {[
            { text: "Each Pomodoro = 1 zen stone added" },
            { text: "Miss 1 day = stack wobbles" },
            { text: "Miss 3 days = stack falls, rebuild from zero" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ACAD94] flex-shrink-0"/>
              <span className="text-[9px] text-[#6E7271] font-bold">{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mx-5 grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Level",    value: String(level)     },
          { label: "XP",       value: String(xp)        },
          { label: "Streak",   value: `${streak}d`      },
          { label: "Fruits",   value: String(fruits)    },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[18px] p-3 text-center">
            <p className="text-base font-black text-[#384D48]">{s.value}</p>
            <p className="text-[7px] font-bold text-[#ACAD94] uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mx-5 bg-[#384D48] rounded-[24px] p-4 text-center">
        <p className="text-[9px] font-black text-[#ACAD94] uppercase tracking-widest mb-1">
          {totalHours < 10 ? "Plant your seed"
           : totalHours < 100 ? "Roots growing deep"
           : totalHours < 500 ? "Branches reaching high"
           : "You are the Banyan"}
        </p>
        <p className="text-white text-xs font-bold opacity-80">
          {totalHours < 10
            ? "Every hour plants a seed of mastery"
            : totalHours < 100
            ? `${(100-totalHours).toFixed(0)} more hours to become a sapling`
            : totalHours < 500
            ? `${(500-totalHours).toFixed(0)} more hours to become the Banyan`
            : "Your tree stands tall. Keep it alive."}
        </p>
      </div>
    </div>
  );
}
