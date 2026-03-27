"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════
   DAILY QUOTES  — 30 quotes, cycles by day
══════════════════════════════════════════ */
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain",        theme: "mountain" },
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma",    theme: "sunrise" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", theme: "bridge" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "R. Collier", theme: "forest" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes",            theme: "seed" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown", theme: "mountain" },
  { text: "Your limitation — it's only your imagination.", author: "Unknown",              theme: "clouds" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown",                                  theme: "sunrise" },
  { text: "Great things never come from comfort zones.", author: "Unknown",                theme: "forest" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown",       theme: "mountain" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown",   theme: "sunrise" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke",    theme: "bridge" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela",         theme: "clouds" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt",        theme: "seed" },
  { text: "You are never too old to set another goal.", author: "C.S. Lewis",              theme: "forest" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi",            theme: "sunrise" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "S. Levenson",   theme: "mountain" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "A. Ashe",  theme: "seed" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James",   theme: "bridge" },
  { text: "Success is not final; failure is not fatal.", author: "Winston Churchill",      theme: "clouds" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser",         theme: "forest" },
  { text: "Don't be pushed around by the fears in your mind.", author: "Roy T. Bennett",   theme: "mountain" },
  { text: "Try not to become a man of success, but a man of value.", author: "Einstein",   theme: "sunrise" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs",   theme: "seed" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Einstein",        theme: "bridge" },
  { text: "It does not matter how slowly you go as long as you don't stop.", author: "Confucius", theme: "forest" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "G. Addair", theme: "clouds" },
  { text: "The harder you work for something, the greater you'll feel achieving it.", author: "Unknown", theme: "mountain" },
  { text: "Don't quit. Suffer now and live the rest of your life as a champion.", author: "Ali", theme: "sunrise" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb",     theme: "seed" },
];

/* ══════════════════════════════════════════
   THEMED SVG ILLUSTRATIONS
══════════════════════════════════════════ */

function IllustrationMountain() {
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEF2E6"/>
          <stop offset="100%" stopColor="#DDE5D0"/>
        </linearGradient>
      </defs>
      <rect width="300" height="180" fill="url(#sky)"/>
      {/* Sun */}
      <circle cx="240" cy="40" r="22" fill="#ACAD94" opacity="0.4"/>
      <circle cx="240" cy="40" r="14" fill="#ACAD94" opacity="0.7"/>
      {/* Background mountains */}
      <polygon points="0,180 60,80 120,180" fill="#6E7271" opacity="0.3"/>
      <polygon points="80,180 160,60 240,180" fill="#6E7271" opacity="0.4"/>
      <polygon points="160,180 230,90 300,180" fill="#6E7271" opacity="0.3"/>
      {/* Main mountain */}
      <polygon points="50,180 150,30 250,180" fill="#384D48"/>
      {/* Snow cap */}
      <polygon points="130,60 150,30 170,60 155,55 150,38 145,55" fill="white" opacity="0.8"/>
      {/* Ground */}
      <rect x="0" y="160" width="300" height="20" fill="#4E6B5E" opacity="0.5"/>
      {/* Stars */}
      {[[20,20],[270,35],[50,45],[280,15],[100,10]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.5" fill="#ACAD94" opacity="0.6"/>
      ))}
    </svg>
  );
}

function IllustrationSunrise() {
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sunsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F0E8"/>
          <stop offset="100%" stopColor="#EEE8D8"/>
        </linearGradient>
        <radialGradient id="sunglow" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#ACAD94" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#ACAD94" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="300" height="180" fill="url(#sunsky)"/>
      <ellipse cx="150" cy="130" rx="160" ry="80" fill="url(#sunglow)"/>
      {/* Sun rising */}
      <circle cx="150" cy="115" r="35" fill="#ACAD94" opacity="0.35"/>
      <circle cx="150" cy="115" r="22" fill="#ACAD94" opacity="0.6"/>
      <circle cx="150" cy="115" r="13" fill="#D4C896" opacity="0.9"/>
      {/* Rays */}
      {Array.from({length:8},(_,i)=>{
        const a = (i*45)*Math.PI/180;
        return <line key={i}
          x1={150+18*Math.cos(a)} y1={115+18*Math.sin(a)}
          x2={150+32*Math.cos(a)} y2={115+32*Math.sin(a)}
          stroke="#ACAD94" strokeWidth="2" opacity="0.5"/>
      })}
      {/* Horizon hills */}
      <ellipse cx="50" cy="160" rx="80" ry="30" fill="#4E6B5E" opacity="0.4"/>
      <ellipse cx="250" cy="165" rx="80" ry="25" fill="#4E6B5E" opacity="0.3"/>
      <ellipse cx="150" cy="170" rx="100" ry="20" fill="#384D48" opacity="0.5"/>
      {/* Birds */}
      {[[80,50],[95,45],[200,60],[215,55]].map(([x,y],i)=>(
        <path key={i} d={`M${x},${y} q5,-4 10,0 q5,4 10,0`}
          fill="none" stroke="#6E7271" strokeWidth="1.5" opacity="0.5"/>
      ))}
    </svg>
  );
}

function IllustrationForest() {
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8EDE4"/>
          <stop offset="100%" stopColor="#D8E0D0"/>
        </linearGradient>
      </defs>
      <rect width="300" height="180" fill="url(#fsky)"/>
      {/* Moon */}
      <circle cx="230" cy="35" r="18" fill="#ACAD94" opacity="0.3"/>
      <circle cx="238" cy="30" r="14" fill="#E8EDE4"/>
      {/* Background trees */}
      {[20,50,80,210,240,270].map((x,i)=>(
        <g key={i} opacity="0.3">
          <rect x={x+8} y={120} width="4" height="40" fill="#384D48"/>
          <polygon points={`${x},120 ${x+10},80 ${x+20},120`} fill="#4E6B5E"/>
          <polygon points={`${x+2},100 ${x+10},65 ${x+18},100`} fill="#384D48"/>
        </g>
      ))}
      {/* Main trees */}
      {[90,130,160].map((x,i)=>(
        <g key={i}>
          <rect x={x+10} y={110} width="6" height="60" fill="#2a3a35"/>
          <polygon points={`${x},115 ${x+13},65 ${x+26},115`} fill="#384D48"/>
          <polygon points={`${x+3},95 ${x+13},50 ${x+23},95`} fill="#4E6B5E"/>
          <polygon points={`${x+5},78 ${x+13},38 ${x+21},78`} fill="#384D48"/>
        </g>
      ))}
      {/* Ground */}
      <ellipse cx="150" cy="170" rx="160" ry="18" fill="#384D48" opacity="0.4"/>
      <rect x="0" y="165" width="300" height="15" fill="#2a3a35" opacity="0.3"/>
      {/* Fireflies */}
      {[[60,100],[180,90],[250,110],[40,130]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2" fill="#ACAD94" opacity="0.7"/>
      ))}
    </svg>
  );
}

function IllustrationSeed() {
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="soilbg" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="#DDE5D0"/>
          <stop offset="100%" stopColor="#EEF2E6"/>
        </radialGradient>
      </defs>
      <rect width="300" height="180" fill="url(#soilbg)"/>
      {/* Soft circles bg */}
      <circle cx="150" cy="180" r="120" fill="#D5DFC8" opacity="0.3"/>
      <circle cx="150" cy="180" r="80" fill="#C8D4B8" opacity="0.2"/>
      {/* Soil */}
      <ellipse cx="150" cy="145" rx="80" ry="16" fill="#4E6B5E" opacity="0.4"/>
      <rect x="70" y="140" width="160" height="40" rx="4" fill="#384D48" opacity="0.25"/>
      {/* Stem */}
      <path d="M150,145 Q148,120 150,95 Q152,75 148,55" stroke="#384D48" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Leaves */}
      <ellipse cx="130" cy="100" rx="22" ry="11" fill="#4E6B5E" opacity="0.8"
        transform="rotate(-30 130 100)"/>
      <ellipse cx="168" cy="82" rx="20" ry="10" fill="#384D48" opacity="0.9"
        transform="rotate(25 168 82)"/>
      <ellipse cx="135" cy="68" rx="18" ry="9" fill="#4E6B5E" opacity="0.7"
        transform="rotate(-20 135 68)"/>
      {/* Top bud */}
      <ellipse cx="148" cy="52" rx="10" ry="14" fill="#384D48" opacity="0.9"/>
      <ellipse cx="148" cy="46" rx="6" ry="8" fill="#ACAD94" opacity="0.7"/>
      {/* Small dots / seeds in soil */}
      {[[100,148],[130,150],[160,147],[185,149]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill="#384D48" opacity="0.4"/>
      ))}
      {/* Light rays */}
      {Array.from({length:5},(_,i)=>{
        const a = (200+i*18)*Math.PI/180;
        return <line key={i}
          x1={148+50*Math.cos(a)} y1={52+50*Math.sin(a)}
          x2={148+80*Math.cos(a)} y2={52+80*Math.sin(a)}
          stroke="#ACAD94" strokeWidth="1.5" opacity="0.3"/>
      })}
    </svg>
  );
}

function IllustrationBridge() {
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAF0E2"/>
          <stop offset="100%" stopColor="#D8E4CC"/>
        </linearGradient>
      </defs>
      <rect width="300" height="180" fill="url(#bsky)"/>
      {/* Water */}
      <rect x="0" y="130" width="300" height="50" fill="#6E7271" opacity="0.2"/>
      <path d="M0,138 Q50,132 100,138 Q150,144 200,138 Q250,132 300,138" stroke="#ACAD94" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M0,148 Q75,142 150,148 Q225,154 300,148" stroke="#ACAD94" strokeWidth="1" fill="none" opacity="0.3"/>
      {/* Bridge road */}
      <rect x="20" y="115" width="260" height="16" rx="4" fill="#384D48" opacity="0.7"/>
      {/* Bridge pillars */}
      <rect x="60" y="115" width="10" height="50" fill="#384D48" opacity="0.6"/>
      <rect x="230" y="115" width="10" height="50" fill="#384D48" opacity="0.6"/>
      {/* Bridge arches */}
      <path d="M30,115 Q80,65 150,60 Q220,65 270,115" stroke="#384D48" strokeWidth="4" fill="none" opacity="0.8"/>
      {/* Cables */}
      {[50,80,110,140,160,190,220,250].map((x,i)=>{
        const midY = 60 + Math.abs((x-150))*0.2;
        return <line key={i} x1={x} y1={midY} x2={x} y2={115}
          stroke="#ACAD94" strokeWidth="1" opacity="0.5"/>
      })}
      {/* Towers */}
      <rect x="55" y="60" width="20" height="55" rx="2" fill="#384D48" opacity="0.6"/>
      <rect x="225" y="60" width="20" height="55" rx="2" fill="#384D48" opacity="0.6"/>
      {/* Tower tops */}
      <polygon points="55,60 65,45 75,60" fill="#384D48" opacity="0.7"/>
      <polygon points="225,60 235,45 245,60" fill="#384D48" opacity="0.7"/>
      {/* Path going into distance */}
      <path d="M120,131 L140,115 L160,115 L180,131" fill="#ACAD94" opacity="0.2"/>
      {/* Clouds */}
      <ellipse cx="60" cy="30" rx="30" ry="12" fill="white" opacity="0.5"/>
      <ellipse cx="80" cy="25" rx="20" ry="10" fill="white" opacity="0.5"/>
      <ellipse cx="220" cy="35" rx="25" ry="10" fill="white" opacity="0.4"/>
    </svg>
  );
}

function IllustrationClouds() {
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8EEE2"/>
          <stop offset="100%" stopColor="#D4DECE"/>
        </linearGradient>
      </defs>
      <rect width="300" height="180" fill="url(#csky)"/>
      {/* Ground with hills */}
      <ellipse cx="150" cy="200" rx="200" ry="60" fill="#384D48" opacity="0.3"/>
      <ellipse cx="50" cy="185" rx="100" ry="40" fill="#4E6B5E" opacity="0.3"/>
      <ellipse cx="260" cy="188" rx="90" ry="38" fill="#384D48" opacity="0.25"/>
      {/* Big cloud */}
      <g opacity="0.85">
        <ellipse cx="120" cy="75" rx="50" ry="28" fill="white"/>
        <ellipse cx="90" cy="82" rx="30" ry="22" fill="white"/>
        <ellipse cx="150" cy="80" rx="35" ry="24" fill="white"/>
        <ellipse cx="120" cy="55" rx="32" ry="22" fill="white"/>
      </g>
      {/* Medium cloud */}
      <g opacity="0.7">
        <ellipse cx="230" cy="55" rx="38" ry="20" fill="white"/>
        <ellipse cx="210" cy="60" rx="24" ry="16" fill="white"/>
        <ellipse cx="252" cy="60" rx="22" ry="15" fill="white"/>
        <ellipse cx="230" cy="42" rx="24" ry="16" fill="white"/>
      </g>
      {/* Small cloud */}
      <g opacity="0.5">
        <ellipse cx="55" cy="45" rx="28" ry="14" fill="white"/>
        <ellipse cx="40" cy="48" rx="18" ry="11" fill="white"/>
        <ellipse cx="68" cy="48" rx="16" ry="10" fill="white"/>
      </g>
      {/* Rain drops from big cloud */}
      {[[100,105],[115,112],[130,108],[145,115],[108,120]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="2" ry="4" fill="#ACAD94" opacity="0.4"/>
      ))}
      {/* Rainbow arc */}
      <path d="M30,150 Q150,50 270,150" stroke="#ACAD94" strokeWidth="3" fill="none"
        opacity="0.2" strokeDasharray="6 4"/>
    </svg>
  );
}

const ILLUSTRATIONS: Record<string, () => JSX.Element> = {
  mountain: IllustrationMountain,
  sunrise:  IllustrationSunrise,
  forest:   IllustrationForest,
  seed:     IllustrationSeed,
  bridge:   IllustrationBridge,
  clouds:   IllustrationClouds,
};

/* ══════════════════════════════════════════
   WELCOME PAGE
══════════════════════════════════════════ */

const STORAGE_KEY = "monk_welcome_seen";

export default function WelcomePage() {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pick quote by day of year
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = QUOTES[dayOfYear % QUOTES.length];
  const Illustration = ILLUSTRATIONS[quote.theme] ?? IllustrationMountain;

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long"
  });

  useEffect(() => {
    setMounted(true);
    // Auto-flip card after 1.2s for wow effect
    const t = setTimeout(() => setFlipped(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleBegin = () => {
    setLeaving(true);
    setTimeout(() => router.push("/"), 600);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-[#E2E2E2] flex flex-col items-center justify-center px-6 py-10"
          style={{ perspective: "1200px" }}
        >
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-6"
          >
            <p className="text-[10px] font-black text-[#ACAD94] uppercase tracking-[0.3em] mb-1">
              {greeting()}
            </p>
            <h1 className="text-2xl font-black text-[#384D48] tracking-tight">MONK STUDY</h1>
            <p className="text-[10px] text-[#6E7271] font-bold mt-1">{dateStr}</p>
          </motion.div>

          {/* 3D CARD */}
          <div
            className="w-full max-w-sm cursor-pointer"
            style={{ perspective: "1000px", height: 380 }}
            onClick={() => setFlipped(f => !f)}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                width: "100%", height: "100%",
                transformStyle: "preserve-3d",
                position: "relative",
              }}
            >
              {/* ── FRONT — Illustration ── */}
              <div style={{
                position: "absolute", width: "100%", height: "100%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}>
                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(56,77,72,0.15)]">
                  {/* Illustration fills top 60% */}
                  <div className="h-[60%] overflow-hidden">
                    <Illustration/>
                  </div>

                  {/* Bottom panel */}
                  <div className="h-[40%] bg-[#384D48] flex flex-col items-center justify-center px-6">
                    <p className="text-[9px] font-black text-[#ACAD94] uppercase tracking-[0.25em] mb-2">
                      Today's Thought
                    </p>
                    <p className="text-white text-sm font-bold text-center leading-snug line-clamp-3">
                      "{quote.text}"
                    </p>
                    <p className="text-[#ACAD94] text-[9px] font-bold mt-2 uppercase tracking-wider">
                      — {quote.author}
                    </p>
                    <p className="text-[#ACAD94] text-[8px] mt-3 opacity-60 animate-pulse">
                      Tap to flip →
                    </p>
                  </div>
                </div>
              </div>

              {/* ── BACK — Quote + Begin ── */}
              <div style={{
                position: "absolute", width: "100%", height: "100%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}>
                <div className="w-full h-full bg-[#384D48] rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(56,77,72,0.25)] flex flex-col">

                  {/* Floating leaves decoration */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[
                      { left:"8%",  top:"12%", siz
