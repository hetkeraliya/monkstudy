"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
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
   REAL-LOOKING TREE SVG
   Uses gradients, bark texture, layered
   leaves, roots, moss — all SVG
══════════════════════════════════════════ */
function RealisticTree({ totalHours, fruits }: { totalHours: number; fruits: number }) {
  const { idx, prog } = getStage(totalHours);
  const grown = Math.min(1, (idx + prog) / (STAGES.length - 1));

  const trunkH   = 15 + grown * 120;
  const trunkW   = 4  + grown * 18;
  const canopyR  = 8  + grown * 80;
  const cx = 160; const groundY = 230;
  const trunkTop = groundY - trunkH;

  const showRoots   = totalHours >= 10;
  const showBranch  = totalHours >= 30;
  const showCanopy  = totalHours >= 20;
  const showAerial  = totalHours >= 300;
  const showMoss    = totalHours >= 150;
  const showFruits  = totalHours >= 100;

  // Fruit positions scattered in canopy
  const fruitPos = useMemo(() => {
    const count = Math.min(fruits, 20);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = 15 + (i % 4) * 14;
      return {
        x: cx + Math.cos(angle) * r * (canopyR / 70),
        y: trunkTop - canopyR * 0.1 + Math.sin(angle) * r * 0.45,
      };
    });
  }, [fruits, canopyR, trunkTop]);

  if (totalHours === 0) {
    return (
      <svg viewBox="0 0 320 260" className="w-full" style={{ maxHeight: 260 }}>
        <defs>
          <radialGradient id="soilG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6B5A3E"/>
            <stop offset="100%" stopColor="#4A3F2F"/>
          </radialGradient>
        </defs>
        {/* Ground */}
        <ellipse cx="160" cy="235" rx="90" ry="12" fill="#3D5A45" opacity="0.3"/>
        <ellipse cx="160" cy="238" rx="60" ry="7"  fill="#2D4535" opacity="0.2"/>
        {/* Seed */}
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <ellipse cx="160" cy="228" rx="9" ry="6" fill="url(#soilG)" opacity="0.9"/>
          <ellipse cx="160" cy="225" rx="6" ry="4" fill="#5C4A30" opacity="0.8"/>
          <ellipse cx="158" cy="224" rx="2" ry="1.5" fill="#7A6040" opacity="0.5"/>
        </motion.g>
        <text x="160" y="250" textAnchor="middle" fill="#6E7271"
          fontSize="8" fontWeight="bold" fontFamily="system-ui" letterSpacing="2">
          PLANT YOUR SEED
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 260" className="w-full" style={{ maxHeight: 260 }}>
      <defs>
        {/* Trunk gradient — dark bark */}
        <linearGradient id="barkG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#2D1F0E"/>
          <stop offset="30%"  stopColor="#5C3D1E"/>
          <stop offset="60%"  stopColor="#7A5230"/>
          <stop offset="85%"  stopColor="#4A2E10"/>
          <stop offset="100%" stopColor="#1F1208"/>
        </linearGradient>
        {/* Root gradient */}
        <linearGradient id="rootG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A2E10"/>
          <stop offset="100%" stopColor="#2A1A08" stopOpacity="0.3"/>
        </linearGradient>
        {/* Canopy layers */}
        <radialGradient id="leaf1G" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#4E7A3E"/>
          <stop offset="50%"  stopColor="#2D5A20"/>
          <stop offset="100%" stopColor="#1A3D10"/>
        </radialGradient>
        <radialGradient id="leaf2G" cx="60%" cy="30%" r="55%">
          <stop offset="0%"   stopColor="#5A8A45"/>
          <stop offset="60%"  stopColor="#3D6A28"/>
          <stop offset="100%" stopColor="#254A18"/>
        </radialGradient>
        <radialGradient id="leaf3G" cx="50%" cy="25%" r="50%">
          <stop offset="0%"   stopColor="#6A9E50"/>
          <stop offset="70%"  stopColor="#4A7A35"/>
          <stop offset="100%" stopColor="#2D5520"/>
        </radialGradient>
        {/* Moss */}
        <radialGradient id="mossG" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#5A7A30"/>
          <stop offset="100%" stopColor="#3D5520"/>
        </radialGradient>
        {/* Ground */}
        <radialGradient id="groundG" cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#4A6A35"/>
          <stop offset="100%" stopColor="#2A4020"/>
        </radialGradient>
        {/* Fruit */}
        <radialGradient id="fruitG" cx="35%" cy="30%" r="60%">
          <stop offset="0%"   stopColor="#C8783A"/>
          <stop offset="60%"  stopColor="#A85A20"/>
          <stop offset="100%" stopColor="#7A3A08"/>
        </radialGradient>
        {/* Aerial root */}
        <linearGradient id="aerialG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4A2E10" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#2A1A08" stopOpacity="0.3"/>
        </linearGradient>
      </defs>

      {/* ── Ground / soil ── */}
      <ellipse cx="160" cy="238" rx={55 + grown*55} ry={10 + grown*5} fill="url(#groundG)" opacity="0.5"/>
      <ellipse cx="160" cy="234" rx={40 + grown*40} ry={7}             fill="#2D4520" opacity="0.35"/>

      {/* ── Surface roots (spread from base) ── */}
      {showRoots && [
        { d: `M${cx-trunkW/2},${groundY} C${cx-trunkW*2},${groundY+3} ${cx-trunkW*4},${groundY+1} ${cx-trunkW*6},${groundY-2}`, w: trunkW*0.4 },
        { d: `M${cx+trunkW/2},${groundY} C${cx+trunkW*2},${groundY+3} ${cx+trunkW*4},${groundY+1} ${cx+trunkW*6},${groundY-2}`, w: trunkW*0.4 },
        { d: `M${cx-trunkW/3},${groundY} C${cx-trunkW*1.5},${groundY+5} ${cx-trunkW*3.5},${groundY+4} ${cx-trunkW*5},${groundY+2}`, w: trunkW*0.3 },
        { d: `M${cx+trunkW/3},${groundY} C${cx+trunkW*1.5},${groundY+5} ${cx+trunkW*3.5},${groundY+4} ${cx+trunkW*5},${groundY+2}`, w: trunkW*0.3 },
        ...(grown>0.5 ? [
          { d: `M${cx},${groundY} C${cx+trunkW},${groundY+8} ${cx+trunkW*2.5},${groundY+7} ${cx+trunkW*4},${groundY+5}`, w: trunkW*0.25 },
          { d: `M${cx},${groundY} C${cx-trunkW},${groundY+8} ${cx-trunkW*2.5},${groundY+7} ${cx-trunkW*4},${groundY+5}`, w: trunkW*0.25 },
        ] : []),
      ].map((r, i) => (
        <motion.path key={i}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 + i*0.1 }}
          d={r.d} stroke="url(#rootG)" strokeWidth={r.w}
          fill="none" strokeLinecap="round"/>
      ))}

      {/* ── Trunk — tapered, with bark texture lines ── */}
      <motion.g
        initial={{ scaleY: 0, originY: groundY }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${groundY}px` }}
      >
        {/* Main trunk body */}
        <path
          d={`M${cx-trunkW/2},${groundY}
              C${cx-trunkW*0.6},${trunkTop+trunkH*0.7}
               ${cx-trunkW*0.3},${trunkTop+trunkH*0.3}
               ${cx-trunkW*0.15},${trunkTop}
              L${cx+trunkW*0.15},${trunkTop}
              C${cx+trunkW*0.3},${trunkTop+trunkH*0.3}
               ${cx+trunkW*0.6},${trunkTop+trunkH*0.7}
               ${cx+trunkW/2},${groundY} Z`}
          fill="url(#barkG)"/>
        {/* Bark texture lines */}
        {Array.from({ length: Math.floor(4 + grown*6) }, (_, i) => {
          const y = trunkTop + (i+1) * (trunkH/(5+grown*6));
          const wAt = trunkW * (0.15 + (groundY-y)/trunkH * 0.85);
          return (
            <path key={i}
              d={`M${cx-wAt*0.7},${y} Q${cx},${y-2} ${cx+wAt*0.7},${y}`}
              stroke="#1A0E04" strokeWidth="0.8" fill="none" opacity="0.4"/>
          );
        })}
        {/* Highlight edge */}
        <path
          d={`M${cx+trunkW*0.08},${trunkTop}
              C${cx+trunkW*0.2},${trunkTop+trunkH*0.3}
               ${cx+trunkW*0.38},${trunkTop+trunkH*0.7}
               ${cx+trunkW*0.42},${groundY}`}
          stroke="#7A5230" strokeWidth="1.5" fill="none" opacity="0.4"/>
      </motion.g>

      {/* ── Moss on trunk base ── */}
      {showMoss && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <ellipse cx={cx-trunkW*0.3} cy={groundY-8}  rx={trunkW*0.5} ry={4} fill="url(#mossG)" opacity="0.6"/>
          <ellipse cx={cx+trunkW*0.2} cy={groundY-12} rx={trunkW*0.4} ry={3} fill="url(#mossG)" opacity="0.5"/>
          <ellipse cx={cx}            cy={groundY-5}  rx={trunkW*0.6} ry={3} fill="url(#mossG)" opacity="0.4"/>
        </motion.g>
      )}

      {/* ── Main branches ── */}
      {showBranch && [
        // Left branches
        { x1: cx, y1: trunkTop+trunkH*0.25, x2: cx-canopyR*0.7, y2: trunkTop-canopyR*0.3, w: trunkW*0.45 },
        { x1: cx, y1: trunkTop+trunkH*0.15, x2: cx-canopyR*0.5, y2: trunkTop-canopyR*0.55, w: trunkW*0.35 },
        // Right branches
        { x1: cx, y1: trunkTop+trunkH*0.25, x2: cx+canopyR*0.7, y2: trunkTop-canopyR*0.3, w: trunkW*0.45 },
        { x1: cx, y1: trunkTop+trunkH*0.15, x2: cx+canopyR*0.5, y2: trunkTop-canopyR*0.55, w: trunkW*0.35 },
        // Top branch
        { x1: cx, y1: trunkTop+trunkH*0.1,  x2: cx,              y2: trunkTop-canopyR*0.4,  w: trunkW*0.3  },
        // Extra branches at mature+
        ...(grown>0.5 ? [
          { x1: cx-canopyR*0.4, y1: trunkTop-canopyR*0.1, x2: cx-canopyR*0.9, y2: trunkTop-canopyR*0.5, w: trunkW*0.25 },
          { x1: cx+canopyR*0.4, y1: trunkTop-canopyR*0.1, x2: cx+canopyR*0.9, y2: trunkTop-canopyR*0.5, w: trunkW*0.25 },
        ] : []),
      ].map((b, i) => (
        <motion.path key={i}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.5 + i*0.08 }}
          d={`M${b.x1},${b.y1} Q${(b.x1+b.x2)/2+Math.random()*10-5},${(b.y1+b.y2)/2} ${b.x2},${b.y2}`}
          stroke="url(#barkG)" strokeWidth={b.w}
          fill="none" strokeLinecap="round"/>
      ))}

      {/* ── Aerial roots (banyan+) ── */}
      {showAerial && [
        { sx: cx-canopyR*0.55, sy: trunkTop-canopyR*0.05 },
        { sx: cx+canopyR*0.55, sy: trunkTop-canopyR*0.05 },
        { sx: cx-canopyR*0.75, sy: trunkTop-canopyR*0.25 },
        { sx: cx+canopyR*0.75, sy: trunkTop-canopyR*0.25 },
      ].map((a, i) => (
        <motion.path key={i}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1 + i*0.2 }}
          d={`M${a.sx},${a.sy} C${a.sx+(i%2===0?-6:6)},${a.sy+30} ${a.sx+(i%2===0?-3:3)},${groundY-20} ${a.sx},${groundY}`}
          stroke="url(#aerialG)" strokeWidth={trunkW*0.18}
          fill="none" strokeLinecap="round"/>
      ))}

      {/* ── Canopy — 3 layered ellipses for depth ── */}
      {showCanopy && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.6 }}
          style={{ transformOrigin: `${cx}px ${trunkTop}px` }}
        >
          {/* Back shadow */}
          <ellipse cx={cx+4} cy={trunkTop-canopyR*0.05+5}
            rx={canopyR*0.95} ry={canopyR*0.65}
            fill="#0D2010" opacity="0.25"/>
          {/* Back layer — darkest */}
          <ellipse cx={cx-canopyR*0.1} cy={trunkTop-canopyR*0.08}
            rx={canopyR*0.88} ry={canopyR*0.6}
            fill="url(#leaf1G)"/>
          {/* Mid layer */}
          <ellipse cx={cx+canopyR*0.05} cy={trunkTop-canopyR*0.2}
            rx={canopyR*0.78} ry={canopyR*0.52}
            fill="url(#leaf2G)"/>
          {/* Front highlight layer */}
          <ellipse cx={cx-canopyR*0.05} cy={trunkTop-canopyR*0.32}
            rx={canopyR*0.62} ry={canopyR*0.42}
            fill="url(#leaf3G)"/>
          {/* Top specular */}
          <ellipse cx={cx-canopyR*0.12} cy={trunkTop-canopyR*0.48}
            rx={canopyR*0.32} ry={canopyR*0.2}
            fill="#7AB85A" opacity="0.35"/>

          {/* Leaf cluster details — small random ellipses at canopy edge */}
          {Array.from({ length: Math.floor(6 + grown*12) }, (_, i) => {
            const angle = (i / (6+grown*12)) * Math.PI * 2;
            const r = canopyR * (0.7 + Math.sin(i*2.3)*0.15);
            const lx = cx + Math.cos(angle) * r * 0.85;
            const ly = trunkTop - canopyR*0.1 + Math.sin(angle) * r * 0.55;
            const lw = 6 + grown*8;
            return (
              <ellipse key={i} cx={lx} cy={ly}
                rx={lw} ry={lw*0.65}
                fill={i%3===0?"#3D6A28":i%3===1?"#2D5A20":"#4A7A35"}
                opacity="0.7"
                transform={`rotate(${angle*180/Math.PI+30} ${lx} ${ly})`}/>
            );
          })}
        </motion.g>
      )}

      {/* ── Fruits ── */}
      {showFruits && fruitPos.map((p, i) => (
        <motion.g key={i}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 1.2 + i*0.04, type: "spring" }}>
          {/* Fruit shadow */}
          <ellipse cx={p.x+1} cy={p.y+3} rx={3.5} ry={2} fill="#000" opacity="0.15"/>
          {/* Fruit body */}
          <circle cx={p.x} cy={p.y} r={4.5} fill="url(#fruitG)"/>
          {/* Fruit highlight */}
          <ellipse cx={p.x-1.2} cy={p.y-1.5} rx={1.5} ry={1} fill="white" opacity="0.4"/>
          {/* Stem */}
          <line x1={p.x} y1={p.y-4} x2={p.x} y2={p.y-7}
            stroke="#2D1F0E" strokeWidth="0.8"/>
        </motion.g>
      ))}

      {/* ── Small plants / grass around base ── */}
      {showRoots && [
        { x: cx-55, h: 8  },{ x: cx-48, h: 11 },{ x: cx-40, h: 7  },
        { x: cx+38, h: 9  },{ x: cx+46, h: 12 },{ x: cx+54, h: 7  },
      ].map((g, i) => (
        <motion.g key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ delay: 0.3 + i*0.05 }}
          style={{ transformOrigin: `${g.x}px ${groundY}px` }}>
          <line x1={g.x}   y1={groundY} x2={g.x-3} y2={groundY-g.h}
            stroke="#3D6A28" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1={g.x}   y1={groundY} x2={g.x+3} y2={groundY-g.h*0.85}
            stroke="#2D5A20" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1={g.x+1} y1={groundY} x2={g.x}   y2={groundY-g.h*1.1}
            stroke="#4A7A35" strokeWidth="1"   strokeLinecap="round"/>
        </motion.g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════
   REAL-LOOKING STONE STACK
   Smooth rounded rocks with natural texture,
   shadow, reflection, moss patches
══════════════════════════════════════════ */
function RealisticStoneStack({
  count,
  missedDays,
}: {
  count: number;
  missedDays: number;
}) {
  const controls  = useAnimation();
  const [fallen, setFallen]   = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (missedDays >= 3 && count === 0) {
      setFallen(true);
    } else if (missedDays >= 1) {
      controls.start({
        rotate: [0, -4, 4, -3, 3, -2, 2, -1, 1, 0],
        transition: { duration: 1.8, ease: "easeOut" },
      });
    }
  }, [missedDays, count]);

  const stones = Math.min(count, 10);

  // Natural stone shapes — each stone is a unique rounded path
  const stoneConfigs = [
    { w: 88, h: 28, rx: 14, col1: "#7A8078", col2: "#5A5E5C", hi: "#9AA09E" },
    { w: 80, h: 24, rx: 12, col1: "#6E7270", col2: "#505453", hi: "#8E9290" },
    { w: 75, h: 22, rx: 11, col1: "#787C7A", col2: "#585C5A", hi: "#98A09E" },
    { w: 70, h: 20, rx: 10, col1: "#6A6E6C", col2: "#4A4E4C", hi: "#8A9290" },
    { w: 66, h: 19, rx: 10, col1: "#727876", col2: "#525856", hi: "#929896" },
    { w: 62, h: 18, rx: 9,  col1: "#6C7270", col2: "#4C5250", hi: "#8C9290" },
    { w: 58, h: 17, rx: 9,  col1: "#686E6C", col2: "#484E4C", hi: "#888E8C" },
    { w: 54, h: 16, rx: 8,  col1: "#707674", col2: "#505654", hi: "#909694" },
    { w: 50, h: 15, rx: 8,  col1: "#6A7270", col2: "#4A5250", hi: "#8A9290" },
    { w: 46, h: 14, rx: 7,  col1: "#687070", col2: "#485050", hi: "#889090" },
  ];

  const svgW = 200; const svgH = 260;
  const baseCX = svgW / 2; const baseY = svgH - 20;

  // Offsets for natural wobble look
  const wobbleX = [0, -2, 1.5, -1, 2, -1.5, 1, -2, 0.5, -1];

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-48" style={{ maxHeight: 260 }}>
        <defs>
          {stoneConfigs.map((s, i) => (
            <linearGradient key={i} id={`stoneG${i}`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%"   stopColor={s.hi}/>
              <stop offset="30%"  stopColor={s.col1}/>
              <stop offset="100%" stopColor={s.col2}/>
            </linearGradient>
          ))}
          <radialGradient id="poolShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1A1A1A" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="mossStone" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#5A7830" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#3A5020" stopOpacity="0.3"/>
          </radialGradient>
        </defs>

        {/* Ground shadow pool */}
        <ellipse cx={baseCX} cy={baseY+4} rx={55} ry={8} fill="url(#poolShadow)"/>
        {/* Flat ground stone */}
        <ellipse cx={baseCX} cy={baseY} rx={60} ry={9} fill="#6A6E6C" opacity="0.4"/>
        <ellipse cx={baseCX} cy={baseY} rx={55} ry={7} fill="#5A5E5C" opacity="0.5"/>
        {/* Ground texture */}
        <ellipse cx={baseCX-8} cy={baseY-1} rx={12} ry={3} fill="#484C4A" opacity="0.3"/>
        <ellipse cx={baseCX+10} cy={baseY}  rx={10} ry={2} fill="#484C4A" opacity="0.25"/>

        {stones === 0 ? (
          <text x={baseCX} y={baseY-20} textAnchor="middle"
            fill="#8A908E" fontSize="8" fontWeight="bold" fontFamily="system-ui" letterSpacing="1.5">
            AWAITING FIRST STONE
          </text>
        ) : (
          <motion.g animate={controls}>
            {/* Build stones bottom to top */}
            {(() => {
              let currentY = baseY - 6;
              return Array.from({ length: stones }, (_, i) => {
                const cfg = stoneConfigs[i] ?? stoneConfigs[stoneConfigs.length - 1];
                const ox  = wobbleX[i] ?? 0;
                currentY -= cfg.h + 3;
                const stY = currentY;
                const hasMoss = i < 3 && missedDays === 0;

                return (
                  <motion.g key={i}
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.13, type: "spring", stiffness: 160, damping: 14 }}>

                    {/* Stone shadow under */}
                    <ellipse cx={baseCX + ox} cy={stY + cfg.h + 2}
                      rx={cfg.w * 0.45} ry={4}
                      fill="#1A1A1A" opacity="0.12"/>

                    {/* Stone body */}
                    <rect
                      x={baseCX + ox - cfg.w / 2}
                      y={stY}
                      width={cfg.w}
                      height={cfg.h}
                      rx={cfg.rx}
                      fill={`url(#stoneG${Math.min(i, stoneConfigs.length - 1)})`}
                    />

                    {/* Surface crack lines */}
                    <path
                      d={`M${baseCX+ox-cfg.w*0.2},${stY+cfg.h*0.45} Q${baseCX+ox},${stY+cfg.h*0.35} ${baseCX+ox+cfg.w*0.15},${stY+cfg.h*0.5}`}
                      stroke="#3A3E3C" strokeWidth="0.6" fill="none" opacity="0.4"/>
                    <path
                      d={`M${baseCX+ox-cfg.w*0.1},${stY+cfg.h*0.65} Q${baseCX+ox+cfg.w*0.05},${stY+cfg.h*0.58} ${baseCX+ox+cfg.w*0.25},${stY+cfg.h*0.68}`}
                      stroke="#3A3E3C" strokeWidth="0.5" fill="none" opacity="0.3"/>

                    {/* Top specular highlight */}
                    <ellipse
                      cx={baseCX + ox - cfg.w * 0.1}
                      cy={stY + cfg.h * 0.28}
                      rx={cfg.w * 0.28}
                      ry={cfg.h * 0.2}
                      fill="white" opacity="0.12"/>

                    {/* Left edge shadow */}
                    <rect
                      x={baseCX + ox - cfg.w / 2}
                      y={stY}
                      width={cfg.w * 0.08}
                      height={cfg.h}
                      rx={cfg.rx}
                      fill="#1A1E1C" opacity="0.25"/>

                    {/* Moss patches (bottom stones) */}
                    {hasMoss && (
                      <>
                        <ellipse
                          cx={baseCX + ox - cfg.w * 0.25}
                          cy={stY + cfg.h * 0.6}
                          rx={cfg.w * 0.12}
                          ry={cfg.h * 0.22}
                          fill="url(#mossStone)"/>
                        <ellipse
                          cx={baseCX + ox + cfg.w * 0.2}
                          cy={stY + cfg.h * 0.55}
                          rx={cfg.w * 0.09}
                          ry={cfg.h * 0.18}
                          fill="url(#mossStone)"/>
                      </>
                    )}

                    {/* Wobble crack if missed days */}
                    {missedDays >= 1 && i === Math.floor(stones / 2) && (
                      <path
                        d={`M${baseCX+ox-2},${stY} L${baseCX+ox+1},${stY+cfg.h*0.4} L${baseCX+ox-1},${stY+cfg.h}`}
                        stroke="#A0A8A5" strokeWidth="1" fill="none" opacity="0.5"
                        strokeDasharray="2 1"/>
                    )}
                  </motion.g>
                );
              });
            })()}
          </motion.g>
        )}
      </svg>
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
        <div className="bg-[#EEF2E6] rounded-[20px] py-2">
          <RealisticTree totalHours={totalHours} fruits={fruits} />
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
          {totalHours < 10 ? "Plant your seed 🌱"
           : totalHours < 100 ? "Roots growing deep 🌿"
           : totalHours < 500 ? "Branches reaching high 🌳"
           : "You are the Banyan 🌲"}
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
