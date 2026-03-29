"use client";

import {
  useState, useEffect, useRef, useMemo, useCallback
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { vibrate } from "@/lib/db";
import {
  Plus, X, Trash2, Eye, EyeOff,
  Lock, Unlock, Search
} from "lucide-react";

/* ══════════════════════════════════════
   TYPES
══════════════════════════════════════ */
interface MemoryNode {
  id: string;
  x: number;
  y: number;
  label: string;
  subject: "Physics" | "Chemistry" | "Maths" | "General";
  content: string;
  hint: string;
  locked: boolean;
  lastVisited: string;
  visitCount: number;
}

/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
const CELL = 80;
const COLS = 10;
const ROWS = 8;

const SUB_COLOR: Record<string, string> = {
  Physics:   "#384D48",
  Chemistry: "#4A7830",
  Maths:     "#7A4A20",
  General:   "#3A4A78",
};

const SUB_BG: Record<string, string> = {
  Physics:   "#EEF2E6",
  Chemistry: "#EDF4E2",
  Maths:     "#F4EEE2",
  General:   "#E2EAF4",
};

const SUBJECTS = ["Physics", "Chemistry", "Maths", "General"] as const;

const STORAGE_KEY = "monk_memory_palace_v2";

function load(): MemoryNode[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function save(nodes: MemoryNode[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

/* ══════════════════════════════════════
   CHEST SVG — animated open/closed
══════════════════════════════════════ */
function ChestSVG({
  locked, subject, visitCount, open = false, size = 52
}: {
  locked: boolean; subject: string;
  visitCount: number; open?: boolean; size?: number;
}) {
  const col  = SUB_COLOR[subject] ?? "#384D48";
  const glow = visitCount >= 3;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52"
      style={{ filter: glow ? `drop-shadow(0 0 8px ${col}99)` : undefined, overflow: "visible" }}>

      {/* Ground shadow */}
      <ellipse cx="26" cy="49" rx="16" ry="3.5" fill="#00000018"/>

      {/* Body */}
      <rect x="5" y="24" width="42" height="22" rx="4" fill={col} opacity="0.92"/>
      <rect x="5" y="24" width="42" height="6"  rx="4" fill="white" opacity="0.1"/>
      <rect x="5" y="38" width="42" height="8"  rx="4" fill="#00000025"/>

      {/* Body vertical grooves */}
      <line x1="19" y1="24" x2="19" y2="46" stroke="#00000020" strokeWidth="1.2"/>
      <line x1="33" y1="24" x2="33" y2="46" stroke="#00000020" strokeWidth="1.2"/>

      {/* Lid — rotates open */}
      <motion.g
        style={{ transformOrigin: "26px 24px" }}
        animate={{ rotateX: open ? -110 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <rect x="5" y="10" width="42" height="15" rx="5" fill={col}/>
        <rect x="6" y="11" width="40" height="6"  rx="4" fill="white" opacity="0.16"/>
        {/* Lid arch detail */}
        <path d="M5 18 Q26 14 47 18" stroke="white" strokeWidth="0.8" fill="none" opacity="0.15"/>
      </motion.g>

      {/* Latch */}
      <rect x="20" y="20" width="12" height="9" rx="2.5" fill="#D4A840"/>
      <rect x="21" y="21" width="10" height="7" rx="2"   fill="#F0C050"/>

      {/* Lock symbol */}
      {locked ? (
        <g>
          <rect x="23" y="23" width="6" height="4.5" rx="1" fill="#8B5E10"/>
          <path d="M24.5 23 v-1.5 a1.5 1.5 0 0 1 3 0 v1.5"
            stroke="#8B5E10" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        </g>
      ) : (
        <g>
          <rect x="23" y="23" width="6" height="4.5" rx="1" fill="#2A6010"/>
          <circle cx="26" cy="25.5" r="1.2" fill="#5AB040"/>
        </g>
      )}

      {/* Visit dots bottom */}
      {visitCount > 0 && Array.from({ length: Math.min(visitCount, 5) }, (_, i) => (
        <circle key={i} cx={14 + i * 6} cy={47} r="1.8"
          fill="white" opacity={0.3 + i * 0.12}/>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════
   POP-OPEN CHEST DETAIL
══════════════════════════════════════ */
function ChestPopup({
  node, onClose, onUnlock, onDelete
}: {
  node: MemoryNode;
  onClose: () => void;
  onUnlock: () => void;
  onDelete: () => void;
}) {
  const [revealed,  setRevealed]  = useState(!node.locked);
  const [showHint,  setShowHint]  = useState(false);
  const [opening,   setOpening]   = useState(false);
  const col = SUB_COLOR[node.subject];

  const handleOpen = () => {
    vibrate([20, 40, 20]);
    setOpening(true);
    setTimeout(() => { setRevealed(true); onUnlock(); }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 120, scale: 0.92, opacity: 0 }}
        animate={{ y: 0,   scale: 1,    opacity: 1 }}
        exit={{ y: 120, scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-md bg-white rounded-t-[36px] overflow-hidden"
        style={{ maxHeight: "85vh" }}
      >
        {/* Colored header strip */}
        <div className="px-6 pt-6 pb-4" style={{ backgroundColor: col }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                {node.subject} · ({node.x},{node.y})
              </span>
              <h2 className="text-lg font-black text-white leading-tight mt-0.5">
                {node.label}
              </h2>
              <p className="text-[9px] text-white/60 mt-0.5">
                {node.visitCount === 0 ? "Never opened" : `Opened ${node.visitCount}×`}
              </p>
            </div>
            <div className="flex gap-2 items-start">
              <button onClick={onDelete}
                className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center active:scale-90 transition">
                <Trash2 size={14} className="text-white"/>
              </button>
              <button onClick={onClose}
                className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center active:scale-90 transition">
                <X size={14} className="text-white"/>
              </button>
            </div>
          </div>
        </div>

        {/* Chest animation + content */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "60vh" }}>

          {/* Animated chest */}
          <div className="flex justify-center mb-5">
            <motion.div
              animate={opening ? {
                scale: [1, 1.25, 1.1],
                rotate: [0, -8, 8, 0],
              } : {}}
              transition={{ duration: 0.6 }}
            >
              <ChestSVG
                locked={node.locked && !opening}
                subject={node.subject}
                visitCount={node.visitCount}
                open={opening || !node.locked}
                size={70}
              />
            </motion.div>
          </div>

          {/* Content */}
          {!revealed ? (
            <div className="space-y-3">
              <div className="bg-[#F5F5F5] rounded-2xl p-4 text-center">
                <Lock size={20} className="mx-auto mb-2" style={{ color: col }}/>
                <p className="text-sm font-black text-[#384D48]">Chest is locked</p>
                <p className="text-[9px] text-[#6E7271] mt-1">Try to recall before opening</p>
              </div>

              {/* Hint toggle */}
              {node.hint && (
                <button onClick={() => setShowHint(h => !h)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: col }}>
                  {showHint ? <EyeOff size={12}/> : <Eye size={12}/>}
                  {showHint ? "Hide hint" : "Show hint"}
                </button>
              )}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: SUB_BG[node.subject] }}>
                      <p className="text-[8px] font-black uppercase tracking-wider mb-1" style={{ color: col }}>Hint</p>
                      <p className="text-sm text-[#384D48]">{node.hint}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={handleOpen}
                className="w-full py-4 rounded-[20px] font-black text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition"
                style={{ backgroundColor: col }}>
                <Unlock size={16}/> Open Chest
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Formula / content */}
              <div className="rounded-2xl p-5 border-l-4"
                style={{ backgroundColor: SUB_BG[node.subject], borderLeftColor: col }}>
                <p className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: col }}>
                  Contents
                </p>
                <p className="text-base font-black text-[#384D48] leading-relaxed whitespace-pre-wrap">
                  {node.content}
                </p>
              </div>

              {node.hint && (
                <div className="bg-[#F5F5F5] rounded-2xl px-4 py-3">
                  <p className="text-[8px] font-bold text-[#ACAD94] uppercase tracking-wider mb-1">Hint</p>
                  <p className="text-sm text-[#6E7271]">{node.hint}</p>
                </div>
              )}

              <button onClick={onClose}
                className="w-full py-4 rounded-[20px] font-black text-white text-sm active:scale-95 transition"
                style={{ backgroundColor: col }}>
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   ADD CHEST FORM
══════════════════════════════════════ */
function AddChestForm({
  defaultX, defaultY, onAdd, onClose
}: {
  defaultX: number; defaultY: number;
  onAdd: (n: Omit<MemoryNode, "id"|"locked"|"lastVisited"|"visitCount">) => void;
  onClose: () => void;
}) {
  const [label,   setLabel]   = useState("");
  const [content, setContent] = useState("");
  const [hint,    setHint]    = useState("");
  const [subject, setSubject] = useState<typeof SUBJECTS[number]>("Chemistry");
  const [x, setX] = useState(defaultX);
  const [y, setY] = useState(defaultY);

  const submit = () => {
    if (!label.trim() || !content.trim()) return;
    onAdd({ label, content, hint, subject, x, y });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full bg-white rounded-t-[32px] p-6"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="w-10 h-1 bg-[#E2E2E2] rounded-full mx-auto mb-5"/>

        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-[#384D48]">New Memory Chest</h3>
          <button onClick={onClose}
            className="w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center">
            <X size={14} className="text-[#6E7271]"/>
          </button>
        </div>

        {/* Subject pills */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-2">Subject</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition active:scale-95"
              style={subject === s
                ? { backgroundColor: SUB_COLOR[s], color: "#fff" }
                : { backgroundColor: "#F2F2F2", color: "#6E7271" }}>
              {s}
            </button>
          ))}
        </div>

        {/* Name */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Name</p>
        <input value={label} onChange={e => setLabel(e.target.value)}
          placeholder="e.g. Reimer-Tiemann Reaction"
          className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm font-bold text-[#384D48] mb-3"/>

        {/* Content */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Formula / Reaction</p>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="e.g. PhOH + CHCl₃ + NaOH → o/p-hydroxybenzaldehyde"
          rows={3}
          className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm font-bold text-[#384D48] resize-none mb-3"/>

        {/* Hint */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Hint (optional)</p>
        <input value={hint} onChange={e => setHint(e.target.value)}
          placeholder="e.g. Phenol + Chloroform in alkaline..."
          className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm text-[#384D48] mb-4"/>

        {/* Grid coords */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-2">Grid Position</p>
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <p className="text-[7px] text-[#ACAD94] mb-1">Column (0–{COLS-1})</p>
            <input type="number" value={x} min={0} max={COLS-1}
              onChange={e => setX(Math.min(COLS-1, Math.max(0, +e.target.value||0)))}
              className="w-full bg-[#F5F5F5] rounded-xl px-3 py-2 outline-none text-sm font-bold text-[#384D48]"/>
          </div>
          <div className="flex-1">
            <p className="text-[7px] text-[#ACAD94] mb-1">Row (0–{ROWS-1})</p>
            <input type="number" value={y} min={0} max={ROWS-1}
              onChange={e => setY(Math.min(ROWS-1, Math.max(0, +e.target.value||0)))}
              className="w-full bg-[#F5F5F5] rounded-xl px-3 py-2 outline-none text-sm font-bold text-[#384D48]"/>
          </div>
        </div>

        <button onClick={submit} disabled={!label.trim() || !content.trim()}
          className="w-full py-4 bg-[#384D48] text-white rounded-[20px] font-black text-sm disabled:opacity-40 active:scale-95 transition">
          Place Chest
        </button>
        <div className="h-6"/>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   TERRAIN TILE
══════════════════════════════════════ */
function Tile({ x, y }: { x: number; y: number }) {
  const v = ((x * 7 + y * 13) % 16) / 16;
  let fill = "#DDE5D0";
  if ((x + y) % 5 === 0 || x % 4 === 0) fill = "#CCDABE";
  else if (v > 0.75) fill = "#D0D8C4";
  return (
    <rect x={x*CELL} y={y*CELL} width={CELL} height={CELL}
      fill={fill} stroke="#C4D4B4" strokeWidth="0.5"/>
  );
}

/* ══════════════════════════════════════
   MINIMAP
══════════════════════════════════════ */
function Minimap({ nodes, panX, panY, vpW, vpH }: {
  nodes: MemoryNode[]; panX: number; panY: number; vpW: number; vpH: number;
}) {
  const sc = 2.8;
  const W  = COLS * sc, H = ROWS * sc;
  return (
    <div className="absolute bottom-4 right-4 z-20 rounded-xl overflow-hidden shadow-md"
      style={{ width: W+2, height: H+2, border: "1.5px solid #ACAD94", background: "#DDE5D0" }}>
      <svg width={W} height={H}>
        {nodes.map(n => (
          <rect key={n.id} x={n.x*sc} y={n.y*sc} width={sc*0.85} height={sc*0.85}
            rx="0.5" fill={SUB_COLOR[n.subject]} opacity={n.locked?0.5:0.9}/>
        ))}
        <rect x={Math.max(0,-panX/CELL*sc)} y={Math.max(0,-panY/CELL*sc)}
          width={Math.min(vpW/CELL*sc,W)} height={Math.min(vpH/CELL*sc,H)}
          fill="none" stroke="#384D48" strokeWidth="1" strokeDasharray="2 1"/>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function MemoryPalacePage() {
  const [mounted, setMounted]       = useState(false);
  const [nodes,   setNodes]         = useState<MemoryNode[]>([]);
  const [popup,   setPopup]         = useState<MemoryNode | null>(null);
  const [addAt,   setAddAt]         = useState<{x:number;y:number}|null>(null);
  const [pan,     setPan]           = useState({ x: 0, y: 0 });
  const [search,  setSearch]        = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const panRef    = useRef({ dragging: false, sx: 0, sy: 0, px: 0, py: 0 });
  const tapRef    = useRef({ moved: false, startX: 0, startY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [vpSize, setVpSize] = useState({ w: 375, h: 520 });

  useEffect(() => {
    setMounted(true);
    setNodes(load());
    const el = containerRef.current;
    if (el) setVpSize({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  useEffect(() => { if (mounted) save(nodes); }, [nodes, mounted]);

  /* ── pan ── */
  const onPtrDown = (e: React.PointerEvent) => {
    panRef.current = { dragging: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    tapRef.current = { moved: false, startX: e.clientX, startY: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPtrMove = (e: React.PointerEvent) => {
    if (!panRef.current.dragging) return;
    const dx = e.clientX - panRef.current.sx;
    const dy = e.clientY - panRef.current.sy;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) tapRef.current.moved = true;
    const minX = -(COLS * CELL - vpSize.w);
    const minY = -(ROWS * CELL - vpSize.h);
    setPan({
      x: Math.min(0, Math.max(minX, panRef.current.px + dx)),
      y: Math.min(0, Math.max(minY, panRef.current.py + dy)),
    });
  };

  const onPtrUp = (e: React.PointerEvent) => {
    panRef.current.dragging = false;
    if (tapRef.current.moved) { tapRef.current.moved = false; return; }

    // It was a tap — find grid cell
    const rect = containerRef.current!.getBoundingClientRect();
    const gx = Math.floor((e.clientX - rect.left - pan.x) / CELL);
    const gy = Math.floor((e.clientY - rect.top  - pan.y) / CELL);
    const hit = nodes.find(n => n.x === gx && n.y === gy);

    if (hit) {
      vibrate(15);
      setPopup(hit);
    } else if (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) {
      vibrate(10);
      setAddAt({ x: gx, y: gy });
    }
  };

  /* ── add ── */
  const handleAdd = useCallback((data: Omit<MemoryNode,"id"|"locked"|"lastVisited"|"visitCount">) => {
    const node: MemoryNode = {
      ...data, id: crypto.randomUUID(),
      locked: true, visitCount: 0, lastVisited: "",
    };
    setNodes(p => [...p, node]);
    vibrate(30);
  }, []);

  /* ── unlock ── */
  const handleUnlock = useCallback((id: string) => {
    setNodes(p => p.map(n => n.id !== id ? n : {
      ...n, locked: false,
      visitCount: n.visitCount + 1,
      lastVisited: new Date().toISOString().slice(0, 10),
    }));
    // Refresh popup
    setPopup(p => p?.id === id
      ? { ...p!, locked: false, visitCount: p!.visitCount + 1 }
      : p);
  }, []);

  /* ── delete ── */
  const handleDelete = useCallback((id: string) => {
    vibrate(40);
    setNodes(p => p.filter(n => n.id !== id));
    setPopup(null);
  }, []);

  const visible = useMemo(() =>
    !search ? nodes
    : nodes.filter(n =>
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      ),
    [nodes, search]
  );

  const dueCount = nodes.filter(n => {
    if (!n.lastVisited) return false;
    return Math.floor((Date.now() - new Date(n.lastVisited).getTime()) / 86400000) >= 3;
  }).length;

  if (!mounted) return null;

  return (
    <div className="flex flex-col bg-[#EEF2E6] overflow-hidden"
      style={{ height: "100dvh" }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-[#384D48] px-4 pt-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest">Memory Palace</h1>
            <p className="text-[8px] text-[#ACAD94] font-bold uppercase tracking-wider">
              {nodes.length} chests · {nodes.filter(n=>!n.locked).length} opened
              {dueCount > 0 && ` · ${dueCount} to revisit`}
            </p>
          </div>
          <button onClick={() => setShowSearch(s => !s)}
            className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center active:scale-90 transition">
            <Search size={15} className="text-white"/>
          </button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search chests..."
                autoFocus
                className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Map ── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden"
        style={{ touchAction: "none", cursor: "grab" }}
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={onPtrUp}
        onPointerLeave={() => { panRef.current.dragging = false; tapRef.current.moved = false; }}
      >
        {/* Grid SVG */}
        <div style={{ position: "absolute", left: pan.x, top: pan.y,
          width: COLS*CELL, height: ROWS*CELL }}>
          <svg width={COLS*CELL} height={ROWS*CELL} style={{ position: "absolute" }}>
            {Array.from({length:ROWS},(_,gy)=>Array.from({length:COLS},(_,gx)=>(
              <Tile key={`${gx}-${gy}`} x={gx} y={gy}/>
            )))}
            {/* Grid lines */}
            {Array.from({length:COLS+1},(_,i)=>(
              <line key={`v${i}`} x1={i*CELL} y1={0} x2={i*CELL} y2={ROWS*CELL}
                stroke="#B8C8A8" strokeWidth="0.4" opacity="0.6"/>
            ))}
            {Array.from({length:ROWS+1},(_,i)=>(
              <line key={`h${i}`} x1={0} y1={i*CELL} x2={COLS*CELL} y2={i*CELL}
                stroke="#B8C8A8" strokeWidth="0.4" opacity="0.6"/>
            ))}
            {/* Compass */}
            <g transform="translate(16,16)" opacity="0.4">
              <circle cx="0" cy="0" r="10" fill="#384D48" opacity="0.2"/>
              <text x="0" y="-13" textAnchor="middle" fontSize="7" fill="#384D48" fontWeight="bold">N</text>
              <text x="0"  y="18" textAnchor="middle" fontSize="7" fill="#384D48" fontWeight="bold">S</text>
              <text x="-16" y="3" textAnchor="middle" fontSize="7" fill="#384D48" fontWeight="bold">W</text>
              <text x="16"  y="3" textAnchor="middle" fontSize="7" fill="#384D48" fontWeight="bold">E</text>
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#384D48" strokeWidth="1.2"/>
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#384D48" strokeWidth="1.2"/>
            </g>
          </svg>

          {/* Chest nodes as HTML divs for better animation */}
          {visible.map(node => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              style={{
                position: "absolute",
                left: node.x * CELL,
                top:  node.y * CELL,
                width: CELL, height: CELL,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <ChestSVG locked={node.locked} subject={node.subject}
                visitCount={node.visitCount} size={50}/>
              <span style={{
                fontSize: 7, fontWeight: 700, color: SUB_COLOR[node.subject],
                textAlign: "center", lineHeight: 1.2, maxWidth: CELL - 8,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                marginTop: 1,
              }}>
                {node.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Minimap */}
        <Minimap nodes={visible} panX={pan.x} panY={pan.y} vpW={vpSize.w} vpH={vpSize.h}/>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/85 backdrop-blur-sm rounded-[28px] p-7 text-center mx-8">
              <div className="text-5xl mb-3">🗺️</div>
              <h3 className="text-sm font-black text-[#384D48] mb-1">Your Palace Awaits</h3>
              <p className="text-xs text-[#6E7271] leading-relaxed">
                Tap anywhere on the map to place a chest, or tap + below
              </p>
            </div>
          </div>
        )}

        {/* Subject legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/85 backdrop-blur-sm rounded-2xl p-2.5 space-y-1">
          {Object.entries(SUB_COLOR).map(([s, c]) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }}/>
              <span className="text-[7px] font-bold text-[#384D48]">{s}</span>
            </div>
          ))}
        </div>

        {/* Floating + button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setAddAt({ x: 2, y: 2 })}
          className="absolute bottom-4 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{
            right: "50%", transform: "translateX(50%)",
            background: "#384D48",
          }}
        >
          <Plus size={26} className="text-white"/>
        </motion.button>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {popup && (
          <ChestPopup
            node={popup}
            onClose={() => setPopup(null)}
            onUnlock={() => handleUnlock(popup.id)}
            onDelete={() => handleDelete(popup.id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addAt && (
          <AddChestForm
            defaultX={addAt.x} defaultY={addAt.y}
            onAdd={handleAdd}
            onClose={() => setAddAt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
