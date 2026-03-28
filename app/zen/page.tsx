"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const toKey = (d: Date) => d.toISOString().slice(0, 10);
const todayKey = () => toKey(new Date());

/* ══════════════════════════════════════════
   TREE STAGE CONFIG
   stages: seed → sprout → sapling → young →
           mature → banyan → ancient
══════════════════════════════════════════ */
const TREE_STAGES = [
  { min: 0,    label: "Seed",       desc: "Your journey begins"        },
  { min: 10,   label: "Sprout",     desc: "First roots forming"        },
  { min: 50,   label: "Sapling",    desc: "Growing towards the light"  },
  { min: 150,  label: "Young Tree", desc: "Branches reaching out"      },
  { min: 300,  label: "Mature",     desc: "A sturdy, rooted mind"      },
  { min: 500,  label: "Banyan",     desc: "Aerial roots, vast canopy"  },
  { min: 1000, label: "Ancient",    desc: "A legend in the making"     },
];

function getStage(totalHours: number) {
  let stage = TREE_STAGES[0];
  for (const s of TREE_STAGES) {
    if (totalHours >= s.min) stage = s;
    else break;
  }
  const idx      = TREE_STAGES.indexOf(stage);
  const next     = TREE_STAGES[idx + 1];
  const progress = next
    ? Math.min(1, (totalHours - stage.min) / (next.min - stage.min))
    : 1;
  return { stage, idx, next, progress };
}

/* ══════════════════════════════════════════
   BANYAN TREE SVG
   Grows dynamically based on totalHours
══════════════════════════════════════════ */
function BanyanTree({
  totalHours,
  fruits,
}: {
  totalHours: number;
  fruits: number;
}) {
  const { idx, progress } = getStage(totalHours);

  // How grown (0–1)
  const grown = Math.min(1, (idx + progress) / (TREE_STAGES.length - 1));
  const trunkH = 20 + grown * 110;         // trunk height
  const canopyR = 10 + grown * 70;         // canopy radius
  const leafOpacity = Math.min(1, grown * 3);
  const showAerial  = totalHours >= 300;   // aerial roots at mature+
  const showFruits  = totalHours >= 150;

  const cx = 150; const groundY = 210;
  const trunkTop = groundY - trunkH;

  // Branch angles
  const branches = grown >= 0.3 ? [
    { angle: -45, len: canopyR * 0.7 },
    { angle: -25, len: canopyR * 0.85 },
    { angle:  25, len: canopyR * 0.85 },
    { angle:  45, len: canopyR * 0.7  },
    ...(grown >= 0.6 ? [
      { angle: -65, len: canopyR * 0.55 },
      { angle:  65, len: canopyR * 0.55 },
    ] : []),
    ...(grown >= 0.85 ? [
      { angle: -80, len: canopyR * 0.4 },
      { angle:  80, len: canopyR * 0.4 },
    ] : []),
  ] : [];

  // Fruit positions (scattered in canopy)
  const fruitPositions = useMemo(() => {
    const pos: { x: number; y: number }[] = [];
    const count = Math.min(fruits, 24);
    for (let i = 0; i < count; i++) {
      const angle = ((i / count) * 360 * Math.PI) / 180;
      const r     = 20 + (i % 3) * 18;
      pos.push({
        x: cx + Math.cos(angle) * r * (canopyR / 60),
        y: trunkTop - canopyR * 0.25 + Math.sin(angle) * r * 0.5,
      });
    }
    return pos;
  }, [fruits, canopyR, trunkTop]);

  return (
    <svg viewBox="0 0 300 240" className="w-full" style={{ maxHeight: 240 }}>
      {/* Sky gradient */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#DDE5D0" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#EEF2E6" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="canopyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4E6B5E"/>
          <stop offset="100%" stopColor="#384D48"/>
        </radialGradient>
      </defs>

      {/* Glow behind tree */}
      <ellipse cx={cx} cy={groundY - trunkH / 2} rx={canopyR + 20} ry={canopyR + 10}
        fill="url(#glow)" opacity={leafOpacity}/>

      {/* Ground */}
      <ellipse cx={cx} cy={groundY + 5} rx={60 + grown * 30} ry={10}
        fill="#4E6B5E" opacity="0.25"/>
      <ellipse cx={cx} cy={groundY + 3} rx={40 + grown * 20} ry={6}
        fill="#384D48" opacity="0.15"/>

      {/* Aerial roots (mature+) */}
      {showAerial && branches.filter(b => Math.abs(b.angle) > 40).map((b, i) => {
        const rad  = (b.angle * Math.PI) / 180;
        const bx   = cx + Math.sin(rad) * b.len * 0.8;
        const by   = trunkTop + canopyR * 0.3;
        const dropY = groundY;
        return (
          <motion.path key={`aerial-${i}`}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
            d={`M ${bx} ${by} C ${bx + (i%2===0?-8:8)} ${by + 30} ${bx + (i%2===0?-4:4)} ${dropY - 20} ${bx} ${dropY}`}
            stroke="#384D48" strokeWidth="2" fill="none" opacity="0.5"/>
        );
      })}

      {/* Trunk */}
      {totalHours > 0 && (
        <motion.rect
          initial={{ height: 0, y: groundY }}
          animate={{ height: trunkH, y: trunkTop }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          x={cx - (3 + grown * 5)} width={6 + grown * 10}
          rx={3} fill="#384D48" opacity="0.9"/>
      )}

      {/* Branches */}
      {branches.map((b, i) => {
        const rad  = ((b.angle - 90) * Math.PI) / 180;
        const ex   = cx + Math.cos(rad) * b.len;
        const ey   = trunkTop + Math.sin(rad) * b.len * 0.5;
        return (
          <motion.line key={i}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
            x1={cx} y1={trunkTop + 8}
            x2={ex} y2={ey}
            stroke="#384D48" strokeWidth={2 + grown * 1.5}
            strokeLinecap="round"/>
        );
      })}

      {/* Canopy */}
      {grown >= 0.2 && (
        <motion.ellipse
          initial={{ rx: 0, ry: 0, opacity: 0 }}
          animate={{ rx: canopyR, ry: canopyR * 0.65, opacity: leafOpacity }}
          transition={{ duration: 1.2, delay: 0.4 }}
          cx={cx} cy={trunkTop + canopyR * 0.1}
          fill="url(#canopyGrad)"/>
      )}

      {/* Inner canopy highlight */}
      {grown >= 0.35 && (
        <motion.ellipse
          initial={{ opacity: 0 }}
          animate={{ opacity: leafOpacity * 0.4 }}
          transition={{ delay: 0.6 }}
          cx={cx - canopyR * 0.1} cy={trunkTop - canopyR * 0.15}
          rx={canopyR * 0.55} ry={canopyR * 0.4}
          fill="#4E6B5E"/>
      )}

      {/* Fruits (chapters mastered) */}
      {showFruits && fruitPositions.map((p, i) => (
        <motion.circle key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ delay: 0.8 + i * 0.05, type: "spring" }}
          cx={p.x} cy={p.y} r={4}
          fill="#ACAD94" stroke="#384D48" strokeWidth="1"/>
      ))}

      {/* Seed state */}
      {totalHours === 0 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ellipse cx={cx} cy={groundY} rx={8} ry={5} fill="#384D48" opacity="0.6"/>
          <ellipse cx={cx} cy={groundY - 2} rx={5} ry={4} fill="#4E6B5E" opacity="0.8"/>
        </motion.g>
      )}

      {/* Sprout (5–10h) */}
      {totalHours >= 5 && totalHours < 30 && (
        <motion.path
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
          d={`M ${cx} ${groundY} Q ${cx - 8} ${groundY - 20} ${cx - 4} ${groundY - 35}`}
          stroke="#384D48" strokeWidth="2" fill="none"/>
      )}
    </svg>
  );
}

/* ══════════════════════════════════════════
   ZEN STONE STACK
   Each stone = 1 completed Pomodoro today
   Wobble if missed yesterday, fall if missed 3 days
══════════════════════════════════════════ */

const STONE_COLORS = [
  "#384D48","#4E6B5E","#6E7271","#ACAD94","#8FA89B",
  "#384D48","#5A7A72","#6E7271","#384D48","#4E6B5E",
];

function ZenStoneStack({
  todaySessions,
  missedDays,
}: {
  todaySessions: number;
  missedDays: number;
}) {
  const [fallen, setFallen]   = useState(false);
  const [wobble, setWobble]   = useState(false);
  const [settled, setSettled] = useState(false);
  const controls = useAnimation();

  const stones = Math.min(todaySessions, 10);

  useEffect(() => {
    if (missedDays >= 3) {
      // Fall animation
      setTimeout(() => {
        controls.start({
          rotate: [0, -5, 15, -20, 30, -40, 60, 90],
          x: [0, -5, 10, -15, 25, -30, 50, 120],
          y: [0, 0, 5, 10, 20, 35, 60, 120],
          opacity: [1, 1, 1, 1, 0.8, 0.5, 0.2, 0],
          transition: { duration: 1.2, ease: "easeIn" },
        });
        setTimeout(() => setFallen(true), 1200);
      }, 600);
    } else if (missedDays >= 1) {
      setWobble(true);
      controls.start({
        rotate: [-3, 3, -3, 3, -2, 2, -1, 1, 0],
        transition: { duration: 1.5, ease: "easeOut" },
      });
    } else {
      setSettled(true);
    }
  }, [missedDays]);

  if (fallen) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-4xl">💨</p>
        <p className="text-xs font-black text-[#384D48] text-center">Stack fell after {missedDays} missed days</p>
        <p className="text-[9px] text-[#ACAD94] text-center">Complete a Pomodoro to rebuild</p>
      </div>
    );
  }

  if (stones === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <svg viewBox="0 0 100 40" className="w-28 opacity-30">
          <ellipse cx="50" cy="35" rx="40" ry="6" fill="#384D48"/>
          <ellipse cx="50" cy="30" rx="25" ry="5" fill="#6E7271"/>
        </svg>
        <p className="text-[9px] font-bold text-[#ACAD94] uppercase tracking-wider">Start a Pomodoro to add the first stone</p>
      </div>
    );
  }

  // Build stone SVG — each stone is an ellipse, stacked bottom to top
  const stoneData = Array.from({ length: stones }, (_, i) => {
    const progress = i / Math.max(stones - 1, 1);
    const width    = 70 - i * 4;        // narrower towards top
    const height   = 14 - i * 0.5;     // thinner towards top
    const wobbleX  = missedDays >= 1 ? (Math.sin(i * 1.3) * 4) : (Math.sin(i * 0.8) * 1.5);
    return { width, height, wobbleX, color: STONE_COLORS[i % STONE_COLORS.length] };
  });

  const totalStackH = stoneData.reduce((a, s) => a + s.height + 4, 0);
  const svgH = totalStackH + 30;
  const svgW = 180;
  const centerX = svgW / 2;

  let currentY = svgH - 20;

  return (
    <motion.div animate={controls} className="flex justify-center">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-48">
        {/* Ground shadow */}
        <ellipse cx={centerX} cy={svgH - 10} rx={50} ry={7} fill="#384D48" opacity="0.15"/>

        {stoneData.map((s, i) => {
          currentY -= s.height + 4;
          const stoneY = currentY;

          return (
            <motion.g key={i}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 15 }}>

              {/* Stone shadow */}
              <ellipse cx={centerX + s.wobbleX} cy={stoneY + s.height}
                rx={s.width / 2 - 2} ry={3}
                fill="#000" opacity="0.06"/>

              {/* Stone body */}
              <ellipse cx={centerX + s.wobbleX} cy={stoneY}
                rx={s.width / 2} ry={s.height / 2}
                fill={s.color} opacity="0.9"/>

              {/* Stone highlight */}
              <ellipse cx={centerX + s.wobbleX - s.width * 0.1} cy={stoneY - s.height * 0.15}
                rx={s.width * 0.28} ry={s.height * 0.25}
                fill="white" opacity="0.12"/>

              {/* Texture lines */}
              <path d={`M ${centerX + s.wobbleX - s.width*0.25} ${stoneY}
                        Q ${centerX + s.wobbleX} ${stoneY - 2}
                          ${centerX + s.wobbleX + s.width*0.25} ${stoneY}`}
                stroke="white" strokeWidth="0.5" fill="none" opacity="0.08"/>
            </motion.g>
          );
        })}
      </svg>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ZenGarden() {
  const [mounted, setMounted] = useState(false);
  const { sessions, subjects, xp, level, streak } = useStore();

  useEffect(() => { setMounted(true); }, []);

  /* ── compute stats ── */
  const totalMins  = sessions.reduce((a, s) => a + s.minutes, 0);
  const totalHours = totalMins / 60;

  const chapsDone = subjects.reduce(
    (a, sub) => a + sub.chapters.filter((c) => c.completed).length, 0
  );

  // Today's sessions (Pomodoro count)
  const todaySessions = sessions.filter(
    (s) => s.date.slice(0, 10) === todayKey()
  ).length;

  // Missed days (consecutive days with no session before today)
  const byDay = useMemo(() => {
    const m = new Set(sessions.map((s) => s.date.slice(0, 10)));
    return m;
  }, [sessions]);

  const missedDays = useMemo(() => {
    let missed = 0;
    const c = new Date(); c.setHours(0,0,0,0);
    c.setDate(c.getDate() - 1); // start from yesterday
    while (!byDay.has(toKey(c)) && missed < 7) {
      missed++;
      c.setDate(c.getDate() - 1);
    }
    return missed;
  }, [byDay]);

  const { stage, idx, next, progress } = getStage(totalHours);

  const xpInLevel = xp % 100;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#EEF2E6] pb-36">

      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-black text-[#384D48] tracking-tighter uppercase">Zen Garden</h1>
        <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">Your growth, visualized</p>
      </div>

      {/* ══ BANYAN TREE ══ */}
      <div className="mx-5 bg-white rounded-[28px] p-5 mb-4 shadow-sm">

        {/* Stage badge */}
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

        {/* Tree */}
        <BanyanTree totalHours={totalHours} fruits={chapsDone} />

        {/* Progress to next stage */}
        {next && (
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="text-[8px] font-bold text-[#6E7271]">{stage.label}</span>
              <span className="text-[8px] font-bold text-[#ACAD94]">
                {(next.min - totalHours).toFixed(0)}h to {next.label}
              </span>
            </div>
            <div className="h-1.5 bg-[#E2E2E2] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-[#384D48] rounded-full"
              />
            </div>
          </div>
        )}

        {/* Fruit legend */}
        {chapsDone > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-3 h-3 rounded-full bg-[#ACAD94] border border-[#384D48]"/>
            <p className="text-[9px] text-[#6E7271] font-bold">
              {chapsDone} fruit{chapsDone !== 1 ? "s" : ""} = {chapsDone} chapter{chapsDone !== 1 ? "s" : ""} mastered
            </p>
          </div>
        )}
      </div>

      {/* Stage milestones */}
      <div className="mx-5 bg-white rounded-[24px] p-4 mb-4">
        <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-3">Growth Milestones</p>
        <div className="space-y-2">
          {TREE_STAGES.map((s, i) => {
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
                    {active && <span className="ml-2 text-[7px] bg-[#384D48] text-white px-1.5 py-0.5 rounded-full font-black uppercase">You are here</span>}
                  </span>
                  <span className="text-[9px] text-[#ACAD94] font-bold">{s.min}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ ZEN STONE STACK ══ */}
      <div className="mx-5 bg-white rounded-[28px] p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Zen Stone Stack</p>
            <p className="text-[9px] text-[#ACAD94] font-bold">
              {todaySessions === 0
                ? "Complete a Pomodoro to place a stone"
                : `${todaySessions} stone${todaySessions > 1 ? "s" : ""} placed today`}
            </p>
          </div>
          {missedDays > 0 && (
            <div className={`px-2 py-1 rounded-xl text-[8px] font-black uppercase ${
              missedDays >= 3 ? "bg-red-100 text-red-500" : "bg-[#ACAD94]/20 text-[#ACAD94]"
            }`}>
              {missedDays >= 3 ? "⚠ Stack fell" : `${missedDays}d missed · wobbling`}
            </div>
          )}
        </div>

        <ZenStoneStack todaySessions={todaySessions} missedDays={missedDays} />

        {/* Stone rules */}
        <div className="mt-4 space-y-1.5">
          {[
            { icon: "🪨", text: "Each Pomodoro = 1 zen stone added" },
            { icon: "⚡", text: "Miss 1 day = stack wobbles" },
            { icon: "💨", text: "Miss 3 days = stack falls, rebuild from zero" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm">{r.icon}</span>
              <span className="text-[9px] text-[#6E7271] font-bold">{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS STRIP ══ */}
      <div className="mx-5 grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Level",    value: String(level)     },
          { label: "XP",       value: String(xp)        },
          { label: "Streak",   value: `${streak}d`      },
          { label: "Mastered", value: String(chapsDone) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[18px] p-3 text-center">
            <p className="text-base font-black text-[#384D48]">{s.value}</p>
            <p className="text-[7px] font-bold text-[#ACAD94] uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ══ MOTIVATIONAL FOOTER ══ */}
      <div className="mx-5 bg-[#384D48] rounded-[24px] p-4 text-center">
        <p className="text-[9px] font-black text-[#ACAD94] uppercase tracking-widest mb-1">
          {totalHours < 10 ? "Plant your seed 🌱" :
           totalHours < 100 ? "Roots growing deep 🌿" :
           totalHours < 500 ? "Branches reaching high 🌳" :
           "You are the Banyan 🌲"}
        </p>
        <p className="text-white text-xs font-bold opacity-80">
          {totalHours < 10
            ? "Every hour plants a seed of mastery"
            : totalHours < 100
            ? `${(100 - totalHours).toFixed(0)} more hours to become a sapling`
            : totalHours < 500
            ? `${(500 - totalHours).toFixed(0)} more hours to become the Banyan`
            : "Your tree stands tall. Keep it alive."}
        </p>
      </div>

    </div>
  );
}
