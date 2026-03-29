"use client";

import {
  useState, useEffect, useRef, useMemo, useCallback
} from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useStore } from "@/store/useStore";
import { vibrate } from "@/lib/db";
import {
  Plus, X, Check, ChevronLeft, Search,
  Lock, Unlock, BookOpen, Zap, Trash2, Eye, EyeOff
} from "lucide-react";

/* ══════════════════════════════════════
   TYPES
══════════════════════════════════════ */
interface MemoryNode {
  id: string;
  x: number;          // grid col (0-based)
  y: number;          // grid row (0-based)
  label: string;      // e.g. "Reimer-Tiemann"
  subject: "Physics" | "Chemistry" | "Maths" | "General";
  content: string;    // the formula / reaction / note
  hint: string;
  locked: boolean;    // true = user hasn't opened yet
  lastVisited: string;// ISO date
  visitCount: number;
  color: string;      // hex
}

/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
const CELL   = 72;   // px per grid cell
const COLS   = 12;
const ROWS   = 10;

const SUBJECT_COLORS: Record<string, string> = {
  Physics:   "#384D48",
  Chemistry: "#5A7830",
  Maths:     "#7A5230",
  General:   "#4E5A78",
};

const SUBJECT_BG: Record<string, string> = {
  Physics:   "#EEF2E6",
  Chemistry: "#EEF4E2",
  Maths:     "#F4EEE2",
  General:   "#E2EAF4",
};

/* ══════════════════════════════════════
   CHEST SVG  (isometric-ish pixel art)
══════════════════════════════════════ */
function ChestSVG({ locked, subject, visitCount, small = false }: {
  locked: boolean;
  subject: string;
  visitCount: number;
  small?: boolean;
}) {
  const col   = SUBJECT_COLORS[subject] ?? "#384D48";
  const s     = small ? 0.7 : 1;
  const glow  = visitCount > 3;

  return (
    <svg
      width={44 * s} height={40 * s}
      viewBox="0 0 44 40"
      style={{ filter: glow ? `drop-shadow(0 0 6px ${col}88)` : undefined }}
    >
      {/* Shadow */}
      <ellipse cx="22" cy="38" rx="14" ry="3" fill="#00000022"/>

      {/* Chest body */}
      <rect x="4" y="18" width="36" height="18" rx="3" fill={col} opacity="0.9"/>
      {/* Body highlight */}
      <rect x="4" y="18" width="36" height="5" rx="3" fill="white" opacity="0.12"/>
      {/* Body shadow bottom */}
      <rect x="4" y="30" width="36" height="6" rx="3" fill="#00000030"/>

      {/* Lid */}
      <rect x="4" y="6" width="36" height="14" rx="4" fill={col}/>
      {/* Lid top highlight */}
      <rect x="5" y="7" width="34" height="5" rx="3" fill="white" opacity="0.18"/>
      {/* Lid stripe */}
      <rect x="4" y="18" width="36" height="2" fill="#00000040"/>

      {/* Latch plate */}
      <rect x="17" y="15" width="10" height="8" rx="2" fill="#C8A050" opacity="0.95"/>
      <rect x="18" y="16" width="8" height="6" rx="1.5" fill="#E8C070"/>

      {/* Lock icon */}
      {locked ? (
        <g transform="translate(19.5, 17)">
          <rect x="0" y="2.5" width="5" height="3.5" rx="0.8" fill="#7A5820"/>
          <path d="M1 2.5 V1.5 A1.5 1.5 0 0 1 4 1.5 V2.5" stroke="#7A5820" strokeWidth="1.1" fill="none"/>
        </g>
      ) : (
        <g transform="translate(19.5, 17)">
          <rect x="0" y="2.5" width="5" height="3.5" rx="0.8" fill="#3A7820"/>
          <circle cx="2.5" cy="4.2" r="0.9" fill="#7ABA50"/>
        </g>
      )}

      {/* Visit dots */}
      {visitCount > 0 && (
        <g>
          {Array.from({ length: Math.min(visitCount, 5) }, (_, i) => (
            <circle key={i} cx={6 + i * 4} cy={34} r="1.4"
              fill="white" opacity={0.5 + i * 0.1}/>
          ))}
        </g>
      )}
    </svg>
  );
}

/* ══════════════════════════════════════
   GRID TILE BACKGROUND (terrain)
══════════════════════════════════════ */
function GridTile({ x, y }: { x: number; y: number }) {
  // Deterministic "terrain" pattern based on position
  const v = ((x * 7 + y * 13) % 16) / 16;
  const isPath  = (x + y) % 5 === 0 || x % 4 === 0;
  const isDark  = v > 0.75;

  let fill = "#DDE5D0";
  if (isPath) fill = "#CCDABE";
  else if (isDark) fill = "#D0D8C4";

  return (
    <rect
      x={x * CELL} y={y * CELL}
      width={CELL} height={CELL}
      fill={fill}
      stroke="#C8D4BC"
      strokeWidth="0.5"
    />
  );
}

/* ══════════════════════════════════════
   NODE CARD (chest on the map)
══════════════════════════════════════ */
function MapNode({
  node,
  selected,
  onClick,
}: {
  node: MemoryNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.g
      key={node.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {/* Selection ring */}
      {selected && (
        <motion.rect
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          x={node.x * CELL + 4}
          y={node.y * CELL + 4}
          width={CELL - 8}
          height={CELL - 8}
          rx="10"
          fill="none"
          stroke="#384D48"
          strokeWidth="2.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Label below chest */}
      <text
        x={node.x * CELL + CELL / 2}
        y={node.y * CELL + CELL - 3}
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="system-ui"
        fill={SUBJECT_COLORS[node.subject]}
        opacity="0.9"
      >
        {node.label.length > 10 ? node.label.slice(0, 10) + "…" : node.label}
      </text>

      {/* Chest icon via foreignObject */}
      <foreignObject
        x={node.x * CELL + (CELL - 44) / 2}
        y={node.y * CELL + 4}
        width="44"
        height="40"
      >
        <div style={{ width: 44, height: 40 }}>
          <ChestSVG
            locked={node.locked}
            subject={node.subject}
            visitCount={node.visitCount}
          />
        </div>
      </foreignObject>
    </motion.g>
  );
}

/* ══════════════════════════════════════
   ADD NODE FORM
══════════════════════════════════════ */
const SUBJECTS = ["Physics", "Chemistry", "Maths", "General"] as const;

function AddNodeForm({
  onAdd,
  onClose,
  defaultX,
  defaultY,
}: {
  onAdd: (n: Omit<MemoryNode, "id" | "lastVisited" | "visitCount" | "locked" | "color">) => void;
  onClose: () => void;
  defaultX: number;
  defaultY: number;
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
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full bg-white rounded-t-[32px] p-6 max-h-[88vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-[#E2E2E2] rounded-full mx-auto mb-5"/>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-[#384D48]">Place a Memory Chest</h3>
          <button onClick={onClose}
            className="w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center">
            <X size={14} className="text-[#6E7271]"/>
          </button>
        </div>

        {/* Subject */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-2">Subject</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition active:scale-95"
              style={subject === s
                ? { backgroundColor: SUBJECT_COLORS[s], color: "#fff" }
                : { backgroundColor: "#F2F2F2", color: "#6E7271" }
              }>
              {s}
            </button>
          ))}
        </div>

        {/* Label */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Name</p>
        <input value={label} onChange={e => setLabel(e.target.value)}
          placeholder="e.g. Reimer-Tiemann Reaction"
          className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm font-bold text-[#384D48] mb-3"/>

        {/* Content */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Formula / Reaction / Note</p>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="e.g. PhOH + CHCl₃ + NaOH → o/p-hydroxybenzaldehyde"
          rows={3}
          className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm font-bold text-[#384D48] resize-none mb-3"/>

        {/* Hint */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Hint (optional)</p>
        <input value={hint} onChange={e => setHint(e.target.value)}
          placeholder="e.g. Phenol + Chloroform in alkaline..."
          className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm text-[#384D48] mb-4"/>

        {/* Grid position */}
        <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-2">Grid Position (col, row)</p>
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <p className="text-[8px] text-[#ACAD94] mb-1">Column (0–{COLS-1})</p>
            <input type="number" value={x} min={0} max={COLS-1}
              onChange={e => setX(Math.min(COLS-1, Math.max(0, parseInt(e.target.value)||0)))}
              className="w-full bg-[#F5F5F5] rounded-xl px-3 py-2 outline-none text-sm font-bold text-[#384D48]"/>
          </div>
          <div className="flex-1">
            <p className="text-[8px] text-[#ACAD94] mb-1">Row (0–{ROWS-1})</p>
            <input type="number" value={y} min={0} max={ROWS-1}
              onChange={e => setY(Math.min(ROWS-1, Math.max(0, parseInt(e.target.value)||0)))}
              className="w-full bg-[#F5F5F5] rounded-xl px-3 py-2 outline-none text-sm font-bold text-[#384D48]"/>
          </div>
        </div>

        <button onClick={submit}
          disabled={!label.trim() || !content.trim()}
          className="w-full py-4 bg-[#384D48] text-white rounded-[20px] font-black text-sm disabled:opacity-40 active:scale-95 transition">
          Place Chest on Map
        </button>
        <div className="h-4"/>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   CHEST DETAIL PANEL
══════════════════════════════════════ */
function ChestDetail({
  node,
  onClose,
  onUnlock,
  onDelete,
}: {
  node: MemoryNode;
  onClose: () => void;
  onUnlock: () => void;
  onDelete: () => void;
}) {
  const [revealed, setRevealed] = useState(!node.locked);
  const [showHint,  setShowHint]  = useState(false);
  const col = SUBJECT_COLORS[node.subject];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full bg-white rounded-t-[32px] p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-[#E2E2E2] rounded-full mx-auto mb-4"/>

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block text-[7px] font-black uppercase px-2 py-0.5 rounded-full text-white mb-1"
              style={{ backgroundColor: col }}>
              {node.subject}
            </span>
            <h3 className="text-lg font-black text-[#384D48]">{node.label}</h3>
            <p className="text-[8px] text-[#ACAD94] font-bold uppercase tracking-wider mt-0.5">
              Grid ({node.x}, {node.y}) · Visited {node.visitCount}×
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onDelete}
              className="w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center active:scale-90 transition">
              <Trash2 size={13} className="text-[#ACAD94]"/>
            </button>
            <button onClick={onClose}
              className="w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center active:scale-90 transition">
              <X size={14} className="text-[#6E7271]"/>
            </button>
          </div>
        </div>

        {/* Chest visual */}
        <div className="flex justify-center mb-4">
          <ChestSVG locked={node.locked} subject={node.subject} visitCount={node.visitCount}/>
        </div>

        {/* Content */}
        {node.locked && !revealed ? (
          <div className="space-y-3">
            <div className="bg-[#F5F5F5] rounded-2xl p-5 text-center">
              <Lock size={24} className="mx-auto text-[#ACAD94] mb-2"/>
              <p className="text-sm font-black text-[#384D48]">Chest Locked</p>
              <p className="text-[9px] text-[#6E7271] mt-1">Try to recall before revealing</p>
            </div>

            {/* Hint */}
            {node.hint && (
              <button onClick={() => setShowHint(h => !h)}
                className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold text-[#ACAD94] uppercase tracking-wider">
                {showHint ? <EyeOff size={12}/> : <Eye size={12}/>}
                {showHint ? "Hide hint" : "Show hint"}
              </button>
            )}
            <AnimatePresence>
              {showHint && node.hint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#EEF2E6] rounded-2xl px-4 py-3 overflow-hidden"
                >
                  <p className="text-[9px] font-bold text-[#6E7271] uppercase tracking-wider mb-1">Hint</p>
                  <p className="text-sm text-[#384D48]">{node.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => { setRevealed(true); onUnlock(); vibrate(25); }}
              className="w-full py-4 rounded-[20px] font-black text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition"
              style={{ backgroundColor: col }}>
              <Unlock size={16}/> Open Chest
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="rounded-2xl p-5 border-l-4" style={{ backgroundColor: SUBJECT_BG[node.subject], borderLeftColor: col }}>
              <p className="text-[8px] font-black uppercase tracking-widest mb-2"
                style={{ color: col }}>Contents</p>
              <p className="text-base font-black text-[#384D48] leading-relaxed whitespace-pre-wrap">
                {node.content}
              </p>
            </div>

            {node.hint && (
              <div className="bg-[#F5F5F5] rounded-2xl px-4 py-3">
                <p className="text-[8px] font-bold text-[#ACAD94] uppercase tracking-wider mb-1">Memory Hint</p>
                <p className="text-sm text-[#6E7271]">{node.hint}</p>
              </div>
            )}

            <div className="flex gap-2">
              {node.visitCount > 0 && (
                <div className="flex-1 bg-[#F5F5F5] rounded-2xl px-3 py-2 text-center">
                  <p className="text-sm font-black text-[#384D48]">{node.visitCount}×</p>
                  <p className="text-[7px] text-[#ACAD94] font-bold uppercase">Visited</p>
                </div>
              )}
              <button onClick={onClose}
                className="flex-1 py-3 rounded-[18px] font-black text-sm text-white active:scale-95 transition"
                style={{ backgroundColor: col }}>
                Close Chest
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MINIMAP
══════════════════════════════════════ */
function Minimap({
  nodes,
  viewX,
  viewY,
  containerW,
  containerH,
}: {
  nodes: MemoryNode[];
  viewX: number;
  viewY: number;
  containerW: number;
  containerH: number;
}) {
  const scale = 2.5;
  const W = COLS * scale, H = ROWS * scale;

  const vx = (-viewX / CELL) * scale;
  const vy = (-viewY / CELL) * scale;
  const vw = (containerW / CELL) * scale;
  const vh = (containerH / CELL) * scale;

  return (
    <div className="absolute bottom-4 right-4 z-20 rounded-xl overflow-hidden shadow-lg"
      style={{ width: W + 2, height: H + 2, border: "1.5px solid #ACAD94", background: "#DDE5D0" }}>
      <svg width={W} height={H}>
        {/* Nodes */}
        {nodes.map(n => (
          <rect key={n.id}
            x={n.x * scale} y={n.y * scale}
            width={scale * 0.9} height={scale * 0.9}
            rx="0.5"
            fill={SUBJECT_COLORS[n.subject]}
            opacity={n.locked ? 0.5 : 0.9}
          />
        ))}
        {/* Viewport rect */}
        <rect
          x={Math.max(0, vx)} y={Math.max(0, vy)}
          width={Math.min(vw, W)} height={Math.min(vh, H)}
          fill="none" stroke="#384D48" strokeWidth="1" opacity="0.7"
          strokeDasharray="2 1"
        />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */

// Storage key for memory palace nodes (persisted in localStorage)
const STORAGE_KEY = "monk_memory_palace";

function loadNodes(): MemoryNode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNodes(nodes: MemoryNode[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

export default function MemoryPalacePage() {
  const [mounted, setMounted]       = useState(false);
  const [nodes, setNodes]           = useState<MemoryNode[]>([]);
  const [selected, setSelected]     = useState<string | null>(null);
  const [detailNode, setDetailNode] = useState<MemoryNode | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [addAt, setAddAt]           = useState({ x: 0, y: 0 });
  const [search, setSearch]         = useState("");
  const [filterSub, setFilterSub]   = useState("All");
  const [showSearch, setShowSearch] = useState(false);

  // Pan state
  const [pan, setPan]     = useState({ x: 0, y: 0 });
  const panStart          = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const isPanning         = useRef(false);
  const containerRef      = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 375, h: 500 });

  useEffect(() => {
    setMounted(true);
    setNodes(loadNodes());
    const el = containerRef.current;
    if (el) setContainerSize({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  useEffect(() => {
    if (mounted) saveNodes(nodes);
  }, [nodes, mounted]);

  /* ── pan handlers ── */
  const onPointerDown = (e: React.PointerEvent) => {
    isPanning.current = true;
    panStart.current  = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    const maxX = 0;
    const maxY = 0;
    const minX = -(COLS * CELL - containerSize.w);
    const minY = -(ROWS * CELL - containerSize.h);
    setPan({
      x: Math.min(maxX, Math.max(minX, panStart.current.px + dx)),
      y: Math.min(maxY, Math.max(minY, panStart.current.py + dy)),
    });
  };

  const onPointerUp = () => { isPanning.current = false; };

  /* ── click on empty cell ── */
  const onSvgClick = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const gx   = Math.floor((e.clientX - rect.left - pan.x) / CELL);
    const gy   = Math.floor((e.clientY - rect.top  - pan.y) / CELL);
    const hit  = nodes.find(n => n.x === gx && n.y === gy);
    if (hit) {
      vibrate(15);
      setSelected(hit.id);
      setDetailNode(hit);
    } else {
      setSelected(null);
      setAddAt({ x: Math.max(0,Math.min(COLS-1,gx)), y: Math.max(0,Math.min(ROWS-1,gy)) });
      setShowAdd(true);
    }
  };

  /* ── add node ── */
  const handleAdd = useCallback((data: Omit<MemoryNode,"id"|"lastVisited"|"visitCount"|"locked"|"color">) => {
    const node: MemoryNode = {
      ...data,
      id:          crypto.randomUUID(),
      locked:      true,
      visitCount:  0,
      lastVisited: "",
      color:       SUBJECT_COLORS[data.subject],
    };
    setNodes(prev => [...prev, node]);
    vibrate(30);
  }, []);

  /* ── unlock / visit ── */
  const handleUnlock = useCallback((id: string) => {
    setNodes(prev => prev.map(n => n.id !== id ? n : {
      ...n,
      locked:      false,
      visitCount:  n.visitCount + 1,
      lastVisited: new Date().toISOString().slice(0,10),
    }));
  }, []);

  /* ── delete ── */
  const handleDelete = useCallback((id: string) => {
    vibrate(40);
    setNodes(prev => prev.filter(n => n.id !== id));
    setDetailNode(null);
    setSelected(null);
  }, []);

  /* ── search filter ── */
  const visibleNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchSub = filterSub === "All" || n.subject === filterSub;
      const matchQ   = !search || n.label.toLowerCase().includes(search.toLowerCase())
                               || n.content.toLowerCase().includes(search.toLowerCase());
      return matchSub && matchQ;
    });
  }, [nodes, search, filterSub]);

  /* ── stats ── */
  const totalNodes  = nodes.length;
  const openedNodes = nodes.filter(n => !n.locked).length;
  const dueNodes    = nodes.filter(n => {
    if (!n.lastVisited) return true;
    const daysSince = Math.floor((Date.now() - new Date(n.lastVisited).getTime()) / 86400000);
    return daysSince >= 3;
  }).length;

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#EEF2E6] overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 bg-[#384D48] px-4 pt-10 pb-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest">Memory Palace</h1>
            <p className="text-[8px] text-[#ACAD94] font-bold uppercase tracking-wider">
              {totalNodes} chests · {openedNodes} opened · {dueNodes} to revisit
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSearch(s => !s)}
              className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center active:scale-90 transition">
              <Search size={15} className="text-white"/>
            </button>
            <button onClick={() => { setAddAt({ x: 3, y: 3 }); setShowAdd(true); }}
              className="w-9 h-9 bg-white rounded-xl flex items-center justify-center active:scale-90 transition">
              <Plus size={16} className="text-[#384D48]"/>
            </button>
          </div>
        </div>

        {/* Search + filter */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
            >
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search chests..."
                autoFocus
                className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-xl px-3 py-2 text-sm font-bold outline-none mb-2"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {["All", ...SUBJECTS].map(s => (
                  <button key={s} onClick={() => setFilterSub(s)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition ${
                      filterSub === s ? "bg-white text-[#384D48]" : "bg-white/10 text-white"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Map ── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: "none", cursor: "grab" }}
      >
        {/* SVG grid */}
        <svg
          width={COLS * CELL}
          height={ROWS * CELL}
          style={{
            position: "absolute",
            top: pan.y,
            left: pan.x,
            transition: isPanning.current ? "none" : "transform 0.05s",
          }}
          onClick={onSvgClick}
        >
          {/* Grid tiles */}
          {Array.from({ length: ROWS }, (_, gy) =>
            Array.from({ length: COLS }, (_, gx) => (
              <GridTile key={`${gx}-${gy}`} x={gx} y={gy}/>
            ))
          )}

          {/* Grid lines */}
          {Array.from({ length: COLS + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i*CELL} y1={0} x2={i*CELL} y2={ROWS*CELL}
              stroke="#B8C8A8" strokeWidth="0.4" opacity="0.5"/>
          ))}
          {Array.from({ length: ROWS + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i*CELL} x2={COLS*CELL} y2={i*CELL}
              stroke="#B8C8A8" strokeWidth="0.4" opacity="0.5"/>
          ))}

          {/* Compass rose top-left */}
          <g transform="translate(12, 12)" opacity="0.35">
            <circle cx="0" cy="0" r="8" fill="#384D48" opacity="0.3"/>
            <text x="0" y="-10" textAnchor="middle" fontSize="6" fill="#384D48" fontWeight="bold">N</text>
            <text x="0"  y="14" textAnchor="middle" fontSize="6" fill="#384D48" fontWeight="bold">S</text>
            <text x="-12" y="3" textAnchor="middle" fontSize="6" fill="#384D48" fontWeight="bold">W</text>
            <text x="12"  y="3" textAnchor="middle" fontSize="6" fill="#384D48" fontWeight="bold">E</text>
            <line x1="0" y1="-6" x2="0" y2="6" stroke="#384D48" strokeWidth="1"/>
            <line x1="-6" y1="0" x2="6" y2="0" stroke="#384D48" strokeWidth="1"/>
          </g>

          {/* Nodes */}
          <AnimatePresence>
            {visibleNodes.map(node => (
              <MapNode
                key={node.id}
                node={node}
                selected={selected === node.id}
                onClick={() => {
                  vibrate(15);
                  setSelected(node.id);
                  setDetailNode(node);
                }}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* Minimap */}
        <Minimap
          nodes={visibleNodes}
          viewX={pan.x}
          viewY={pan.y}
          containerW={containerSize.w}
          containerH={containerSize.h}
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm rounded-[28px] p-8 text-center mx-8">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="text-base font-black text-[#384D48] mb-1">Your Palace Awaits</h3>
              <p className="text-xs text-[#6E7271] leading-relaxed">
                Tap anywhere on the map to place a chest, or tap + to add one. Each chest holds a formula, reaction, or concept.
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/80 backdrop-blur-sm rounded-2xl p-2.5 space-y-1">
          {Object.entries(SUBJECT_COLORS).map(([s, c]) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }}/>
              <span className="text-[7px] font-bold text-[#384D48]">{s}</span>
            </div>
          ))}
          <div className="border-t border-[#E2E2E2] pt-1 mt-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Lock size={8} className="text-[#ACAD94]"/>
              <span className="text-[7px] text-[#6E7271]">Locked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Unlock size={8} className="text-[#384D48]"/>
              <span className="text-[7px] text-[#6E7271]">Opened</span>
            </div>
          </div>
        </div>

        {/* Due banner */}
        {dueNodes > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-[#384D48] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              {dueNodes} chest{dueNodes > 1 ? "s" : ""} need revisiting
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAdd && (
          <AddNodeForm
            onAdd={handleAdd}
            onClose={() => setShowAdd(false)}
            defaultX={addAt.x}
            defaultY={addAt.y}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailNode && (
          <ChestDetail
            node={detailNode}
            onClose={() => { setDetailNode(null); setSelected(null); }}
            onUnlock={() => handleUnlock(detailNode.id)}
            onDelete={() => handleDelete(detailNode.id)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
