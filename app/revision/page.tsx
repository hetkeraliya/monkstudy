"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, FlashCard } from "@/store/useStore";
import {
  Plus, Trash2, Eye, EyeOff, Check, X,
  Zap, Brain, Pencil, ChevronRight, RotateCcw,
  BookOpen, Flame,
} from "lucide-react";
import { vibrate } from "@/lib/db";

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const todayKey = () => new Date().toISOString().slice(0, 10);
const SUBJECTS = ["Physics", "Chemistry", "Maths", "General"] as const;
const SUBJECT_COLORS: Record<string, string> = {
  Physics:   "#384D48",
  Chemistry: "#ACAD94",
  Maths:     "#6E7271",
  General:   "#4E6B5E",
};

/* ══════════════════════════════════════
   QUALITY BUTTON ROW
   0=Again 1=Hard 2=Good 3=Easy
══════════════════════════════════════ */
function QualityButtons({ onRate }: { onRate: (q: number) => void }) {
  const btns = [
    { label: "Again", q: 0, bg: "#DC2626", hint: "<1d" },
    { label: "Hard",  q: 1, bg: "#ACAD94", hint: "1d"  },
    { label: "Good",  q: 3, bg: "#4E6B5E", hint: "3d"  },
    { label: "Easy",  q: 5, bg: "#384D48", hint: "7d+" },
  ];
  return (
    <div className="flex gap-2 mt-4">
      {btns.map((b) => (
        <button
          key={b.q}
          onClick={() => { vibrate(20); onRate(b.q); }}
          className="flex-1 flex flex-col items-center py-2.5 rounded-2xl active:scale-95 transition"
          style={{ backgroundColor: b.bg }}
        >
          <span className="text-[10px] font-black text-white">{b.label}</span>
          <span className="text-[7px] text-white opacity-60 mt-0.5">{b.hint}</span>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   FLASH CARD REVIEW SCREEN
══════════════════════════════════════ */
function ReviewCard({
  card,
  onRate,
  onSkip,
  current,
  total,
}: {
  card: FlashCard;
  onRate: (q: number) => void;
  onSkip: () => void;
  current: number;
  total: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const color = SUBJECT_COLORS[card.subject];

  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-3"
    >
      {/* Progress */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">
          {current} / {total} due
        </span>
        <span
          className="text-[8px] font-black px-2 py-0.5 rounded-full text-white uppercase"
          style={{ backgroundColor: color }}
        >
          {card.subject}
        </span>
      </div>

      <div className="w-full bg-[#E2E2E2] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%`, backgroundColor: color }}
        />
      </div>

      {/* Card front — question */}
      <div
        className="bg-white rounded-[28px] p-6 shadow-sm"
        style={{ borderTop: `4px solid ${color}` }}
      >
        <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-1">
          {card.topic}
        </p>
        <p className="text-[9px] font-bold text-[#6E7271] uppercase tracking-wider mb-4">
          Recall this formula / reaction:
        </p>
        <p className="text-lg font-black text-[#384D48] leading-snug">
          {card.question}
        </p>

        {/* Hint */}
        {card.hint && (
          <button
            onClick={() => setShowHint((s) => !s)}
            className="mt-3 flex items-center gap-1 text-[9px] font-bold text-[#ACAD94] uppercase tracking-wider"
          >
            <Eye size={10} />
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        <AnimatePresence>
          {showHint && card.hint && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-[#6E7271] mt-2 italic"
            >
              Hint: {card.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Reveal / Answer */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.button
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { vibrate(15); setRevealed(true); }}
            className="w-full py-4 bg-[#384D48] text-white rounded-[20px] font-black text-sm flex items-center justify-center gap-2"
          >
            <Eye size={16} /> Reveal Answer
          </motion.button>
        ) : (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Answer card */}
            <div className="bg-[#384D48] rounded-[24px] p-5">
              <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-2">
                Answer
              </p>
              <p className="text-xl font-black text-white leading-relaxed">
                {card.answer}
              </p>
            </div>

            {/* Rate yourself */}
            <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest text-center">
              How well did you remember?
            </p>
            <QualityButtons onRate={onRate} />

            {/* Skip */}
            <button
              onClick={onSkip}
              className="w-full text-center text-[9px] text-[#ACAD94] font-bold uppercase tracking-wider mt-1"
            >
              Skip for now →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   FORMULA CANVAS (draw / type from memory)
══════════════════════════════════════ */
function FormulaCanvas({ card, onDone }: { card: FlashCard; onDone: () => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing]   = useState(false);
  const [mode, setMode]         = useState<"draw" | "type">("type");
  const [typed, setTyped]       = useState("");
  const [revealed, setRevealed] = useState(false);
  const [strokes, setStrokes]   = useState(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Canvas drawing
  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
    setDrawing(true);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.strokeStyle = "#384D48";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setStrokes((s) => s + 1);
  };

  const stopDraw = () => { setDrawing(false); lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes(0);
  };

  const hasWritten = mode === "type" ? typed.trim().length > 2 : strokes > 10;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#384D48] rounded-[24px] p-4">
        <p className="text-[8px] font-black text-[#ACAD94] uppercase tracking-widest mb-1">
          Formula Canvas · {card.topic}
        </p>
        <p className="text-sm font-black text-white">{card.question}</p>
        <p className="text-[9px] text-[#ACAD94] mt-1">Write it from memory before revealing</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 bg-[#F2F2F2] p-1 rounded-2xl">
        {(["type", "draw"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition ${
              mode === m ? "bg-[#384D48] text-white" : "text-[#6E7271]"
            }`}
          >
            {m === "type" ? "⌨ Type" : "✏ Draw"}
          </button>
        ))}
      </div>

      {/* Input area */}
      {mode === "type" ? (
        <div className="bg-white rounded-[24px] p-4 min-h-[140px] flex flex-col">
          <p className="text-[8px] font-bold text-[#ACAD94] uppercase tracking-widest mb-2">
            Type the formula / reaction from memory:
          </p>
          <textarea
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Start typing..."
            className="flex-1 outline-none text-[#384D48] font-bold text-sm resize-none placeholder:text-[#D8D4D5] bg-transparent"
            rows={4}
          />
        </div>
      ) : (
        <div className="bg-white rounded-[24px] overflow-hidden relative">
          <p className="text-[8px] font-bold text-[#ACAD94] uppercase tracking-widest p-3 pb-1">
            Draw from memory:
          </p>
          <canvas
            ref={canvasRef}
            width={340}
            height={180}
            className="w-full touch-none"
            style={{ cursor: "crosshair" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <button
            onClick={clearCanvas}
            className="absolute top-2 right-2 w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center"
          >
            <RotateCcw size={13} className="text-[#6E7271]" />
          </button>
        </div>
      )}

      {/* Reveal answer */}
      <AnimatePresence>
        {!revealed ? (
          <button
            onClick={() => {
              if (!hasWritten) return;
              vibrate(20);
              setRevealed(true);
            }}
            className={`w-full py-4 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 transition ${
              hasWritten
                ? "bg-[#384D48] text-white"
                : "bg-[#E2E2E2] text-[#ACAD94] cursor-not-allowed"
            }`}
          >
            <Eye size={16} />
            {hasWritten ? "Reveal & Compare" : "Write something first..."}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="bg-[#EEF2E6] rounded-[24px] p-4 border-l-4 border-[#384D48]">
              <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">
                Correct Answer
              </p>
              <p className="text-lg font-black text-[#384D48]">{card.answer}</p>
            </div>
            <button
              onClick={() => { vibrate(30); onDone(); }}
              className="w-full py-4 bg-[#384D48] text-white rounded-[20px] font-black text-sm"
            >
              Done ✓
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════
   ADD CARD FORM
══════════════════════════════════════ */
function AddCardForm({ onAdd, onClose }: {
  onAdd: (c: Pick<FlashCard, "subject" | "topic" | "question" | "answer" | "hint">) => void;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState<FlashCard["subject"]>("Physics");
  const [topic,   setTopic]   = useState("");
  const [question, setQ]      = useState("");
  const [answer,   setA]      = useState("");
  const [hint,     setH]      = useState("");

  const submit = () => {
    if (!topic.trim() || !question.trim() || !answer.trim()) return;
    onAdd({ subject, topic, question, answer, hint });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full bg-white rounded-t-[32px] p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-[#E2E2E2] rounded-full mx-auto mb-5" />
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-[#384D48]">Add Flash Card</h3>
          <button onClick={onClose} className="w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center">
            <X size={14} className="text-[#6E7271]" />
          </button>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-2">Subject</p>
          <div className="flex gap-2 flex-wrap">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                  subject === s ? "text-white" : "bg-[#F2F2F2] text-[#6E7271]"
                }`}
                style={subject === s ? { backgroundColor: SUBJECT_COLORS[s] } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div className="mb-3">
          <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Topic</p>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Kinematics, Organic Chemistry..."
            className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm font-bold text-[#384D48]"
          />
        </div>

        {/* Question */}
        <div className="mb-3">
          <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">What to Recall</p>
          <input
            value={question}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Work-Energy Theorem, SN2 reaction..."
            className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm font-bold text-[#384D48]"
          />
        </div>

        {/* Answer */}
        <div className="mb-3">
          <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Formula / Answer</p>
          <textarea
            value={answer}
            onChange={(e) => setA(e.target.value)}
            placeholder="e.g. W = ΔKE = ½mv² - ½mu²"
            rows={2}
            className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm font-bold text-[#384D48] resize-none"
          />
        </div>

        {/* Hint (optional) */}
        <div className="mb-6">
          <p className="text-[8px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Hint (optional)</p>
          <input
            value={hint}
            onChange={(e) => setH(e.target.value)}
            placeholder="e.g. Think about energy conservation..."
            className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 outline-none text-sm text-[#384D48]"
          />
        </div>

        <button
          onClick={submit}
          disabled={!topic.trim() || !question.trim() || !answer.trim()}
          className="w-full py-4 bg-[#384D48] text-white rounded-[20px] font-black text-sm disabled:opacity-40"
        >
          Add Flash Card
        </button>
        <div className="h-4" />
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */

type View = "home" | "review" | "canvas" | "all";

export default function RevisionPage() {
  const [mounted, setMounted]   = useState(false);
  const [view, setView]         = useState<View>("home");
  const [showAdd, setShowAdd]   = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [canvasCard, setCanvasCard] = useState<FlashCard | null>(null);
  const [filterSub, setFilterSub] = useState<string>("All");
  const [sessionDone, setSessionDone] = useState(0);

  const { flashCards, addFlashCard, reviewFlashCard, deleteFlashCard, addXp } = useStore();

  useEffect(() => { setMounted(true); }, []);

  /* Due cards */
  const dueCards = useMemo(
    () => flashCards.filter((c) => c.nextReview <= todayKey()),
    [flashCards]
  );

  /* Filter for all-cards view */
  const filteredCards = useMemo(() => {
    if (filterSub === "All") return flashCards;
    return flashCards.filter((c) => c.subject === filterSub);
  }, [flashCards, filterSub]);

  const currentCard = dueCards[reviewIdx];

  const handleRate = (quality: number) => {
    if (!currentCard) return;
    vibrate(quality >= 3 ? 20 : 40);
    reviewFlashCard(currentCard.id, quality);
    if (quality >= 3) addXp(10);
    setSessionDone((d) => d + 1);
    if (reviewIdx < dueCards.length - 1) {
      setReviewIdx((i) => i + 1);
    } else {
      setView("home");
      setReviewIdx(0);
    }
  };

  const handleSkip = () => {
    if (reviewIdx < dueCards.length - 1) setReviewIdx((i) => i + 1);
    else { setView("home"); setReviewIdx(0); }
  };

  if (!mounted) return null;

  /* ── ALL CARDS VIEW ── */
  if (view === "all") {
    return (
      <div className="min-h-screen bg-[#E2E2E2] pb-36">
        <div className="bg-[#384D48] px-5 pt-12 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("home")}
              className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <X size={16} className="text-white"/>
            </button>
            <h1 className="text-sm font-black text-white uppercase tracking-widest flex-1">All Cards</h1>
            <button onClick={() => setShowAdd(true)}
              className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Plus size={16} className="text-white"/>
            </button>
          </div>
        </div>

        <div className="px-5 pt-4 space-y-3">
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["All", ...SUBJECTS].map((s) => (
              <button key={s} onClick={() => setFilterSub(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition ${
                  filterSub === s ? "bg-[#384D48] text-white" : "bg-white text-[#6E7271]"
                }`}>
                {s}
              </button>
            ))}
          </div>

          {filteredCards.length === 0 ? (
            <div className="py-16 text-center">
              <Brain size={36} className="mx-auto text-[#D8D4D5] mb-3"/>
              <p className="text-[10px] font-bold text-[#6E7271] uppercase tracking-widest">No cards yet</p>
            </div>
          ) : (
            filteredCards.map((card) => {
              const due = card.nextReview <= todayKey();
              const color = SUBJECT_COLORS[card.subject];
              return (
                <div key={card.id}
                  className="bg-white rounded-[22px] p-4 flex items-start justify-between gap-3"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: color }}>
                        {card.subject}
                      </span>
                      <span className="text-[7px] text-[#ACAD94] font-bold">{card.topic}</span>
                      {due && (
                        <span className="text-[7px] bg-red-100 text-red-500 font-black px-1.5 py-0.5 rounded-full">
                          DUE
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#384D48] truncate">{card.question}</p>
                    <p className="text-[10px] text-[#6E7271] mt-0.5">
                      {card.reviewCount === 0 ? "Never reviewed" :
                        `Streak ${card.streak} · Next in ${
                          card.nextReview === todayKey() ? "today" :
                          `${Math.ceil((new Date(card.nextReview).getTime() - Date.now()) / 86400000)}d`
                        }`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { setCanvasCard(card); setView("canvas"); }}
                      className="w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center">
                      <Pencil size={12} className="text-[#6E7271]"/>
                    </button>
                    <button onClick={() => { vibrate(40); deleteFlashCard(card.id); }}
                      className="w-8 h-8 bg-[#F2F2F2] rounded-xl flex items-center justify-center">
                      <Trash2 size={12} className="text-[#ACAD94]"/>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <AnimatePresence>
          {showAdd && (
            <AddCardForm
              onAdd={(c) => { addFlashCard(c); vibrate(30); }}
              onClose={() => setShowAdd(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── REVIEW VIEW ── */
  if (view === "review") {
    if (!currentCard) {
      return (
        <div className="min-h-screen bg-[#E2E2E2] flex flex-col items-center justify-center px-6 text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4">
            <div className="text-6xl">🌱</div>
            <h2 className="text-xl font-black text-[#384D48]">Session Complete!</h2>
            <p className="text-sm text-[#6E7271]">You reviewed {sessionDone} cards · +{sessionDone * 10} XP</p>
            <button onClick={() => { setView("home"); setSessionDone(0); }}
              className="px-8 py-4 bg-[#384D48] text-white rounded-[20px] font-black text-sm">
              Back to Home
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#E2E2E2] px-5 pt-12 pb-36">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setView("home"); setReviewIdx(0); }}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <X size={16} className="text-[#384D48]"/>
          </button>
          <h1 className="text-sm font-black text-[#384D48] uppercase tracking-widest">Active Recall</h1>
        </div>

        <AnimatePresence mode="wait">
          <ReviewCard
            key={currentCard.id}
            card={currentCard}
            onRate={handleRate}
            onSkip={handleSkip}
            current={reviewIdx + 1}
            total={dueCards.length}
          />
        </AnimatePresence>
      </div>
    );
  }

  /* ── CANVAS VIEW ── */
  if (view === "canvas" && canvasCard) {
    return (
      <div className="min-h-screen bg-[#E2E2E2] px-5 pt-12 pb-36">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setView("home"); setCanvasCard(null); }}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <X size={16} className="text-[#384D48]"/>
          </button>
          <h1 className="text-sm font-black text-[#384D48] uppercase tracking-widest">Formula Canvas</h1>
        </div>
        <FormulaCanvas
          card={canvasCard}
          onDone={() => { setView("home"); setCanvasCard(null); }}
        />
      </div>
    );
  }

  /* ── HOME VIEW ── */
  const subjectCounts = SUBJECTS.reduce((acc, s) => {
    acc[s] = flashCards.filter((c) => c.subject === s).length;
    return acc;
  }, {} as Record<string, number>);

  const totalCards   = flashCards.length;
  const masteredCards = flashCards.filter((c) => c.streak >= 3).length;

  return (
    <div className="min-h-screen bg-[#E2E2E2] px-5 pt-6 pb-36">

      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-[#384D48] tracking-tighter">FLASH MONK</h1>
          <p className="text-[8px] text-[#6E7271] font-bold uppercase tracking-[0.2em]">Smart Revision System</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="w-11 h-11 bg-[#384D48] text-white rounded-[16px] flex items-center justify-center active:scale-95 transition shadow-md">
          <Plus size={20}/>
        </button>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-white rounded-[20px] p-3 text-center">
          <p className="text-2xl font-black text-[#384D48]">{totalCards}</p>
          <p className="text-[7px] font-bold text-[#6E7271] uppercase tracking-wider">Total</p>
        </div>
        <div className="bg-[#384D48] rounded-[20px] p-3 text-center">
          <p className="text-2xl font-black text-white">{dueCards.length}</p>
          <p className="text-[7px] font-bold text-[#ACAD94] uppercase tracking-wider">Due Today</p>
        </div>
        <div className="bg-white rounded-[20px] p-3 text-center">
          <p className="text-2xl font-black text-[#384D48]">{masteredCards}</p>
          <p className="text-[7px] font-bold text-[#6E7271] uppercase tracking-wider">Mastered</p>
        </div>
      </div>

      {/* START REVIEW — big CTA */}
      <button
        onClick={() => { if (dueCards.length === 0) return; setReviewIdx(0); setView("review"); vibrate(30); }}
        disabled={dueCards.length === 0}
        className={`w-full rounded-[24px] p-5 mb-4 flex items-center justify-between transition ${
          dueCards.length > 0
            ? "bg-[#384D48] active:scale-[0.98]"
            : "bg-[#E2E2E2]"
        }`}
      >
        <div>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
            dueCards.length > 0 ? "text-[#ACAD94]" : "text-[#ACAD94]"
          }`}>
            {dueCards.length > 0 ? "Ready to Review" : "All Caught Up!"}
          </p>
          <p className={`text-lg font-black ${dueCards.length > 0 ? "text-white" : "text-[#6E7271]"}`}>
            {dueCards.length > 0
              ? `${dueCards.length} card${dueCards.length > 1 ? "s" : ""} due`
              : "No cards due today 🌱"}
          </p>
          {dueCards.length > 0 && (
            <p className="text-[9px] text-[#ACAD94] mt-0.5">+10 XP per correct recall</p>
          )}
        </div>
        {dueCards.length > 0 && (
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Brain size={24} className="text-white"/>
          </div>
        )}
      </button>

      {/* FORMULA CANVAS quick pick */}
      {flashCards.length > 0 && (
        <div className="bg-white rounded-[24px] p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pencil size={14} className="text-[#384D48]"/>
              <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">Formula Canvas</p>
            </div>
            <p className="text-[8px] text-[#ACAD94] font-bold">Write before break</p>
          </div>
          <p className="text-xs text-[#6E7271] mb-3">
            Pick a card, write the formula from memory on the canvas, then reveal.
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {flashCards.slice(0, 5).map((card) => (
              <button
                key={card.id}
                onClick={() => { setCanvasCard(card); setView("canvas"); vibrate(15); }}
                className="flex-shrink-0 bg-[#F5F5F5] rounded-2xl px-3 py-2.5 text-left min-w-[120px]"
              >
                <p className="text-[7px] font-black uppercase mb-0.5"
                  style={{ color: SUBJECT_COLORS[card.subject] }}>
                  {card.subject}
                </p>
                <p className="text-[10px] font-bold text-[#384D48] line-clamp-2">{card.question}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject breakdown */}
      <div className="bg-white rounded-[24px] p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-black text-[#6E7271] uppercase tracking-widest">By Subject</p>
          <button onClick={() => setView("all")}
            className="text-[9px] font-black text-[#ACAD94] uppercase tracking-wider flex items-center gap-1">
            See All <ChevronRight size={10}/>
          </button>
        </div>
        <div className="space-y-2">
          {SUBJECTS.map((s) => {
            const count = subjectCounts[s] ?? 0;
            const due   = dueCards.filter((c) => c.subject === s).length;
            return (
              <div key={s} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[s] }}/>
                  <span className="text-sm font-bold text-[#384D48]">{s}</span>
                </div>
                <div className="flex items-center gap-3">
                  {due > 0 && (
                    <span className="text-[8px] bg-red-100 text-red-500 font-black px-1.5 py-0.5 rounded-full">
                      {due} due
                    </span>
                  )}
                  <span className="text-[10px] font-black text-[#6E7271]">{count} cards</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {flashCards.length === 0 && (
        <div className="py-10 text-center">
          <div className="text-5xl mb-3">🧠</div>
          <h3 className="text-base font-black text-[#384D48] mb-1">No flash cards yet</h3>
          <p className="text-xs text-[#6E7271] mb-4">
            Add formulas, reactions and facts.<br/>The app will remind you at the right time.
          </p>
          <button onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-[#384D48] text-white rounded-[18px] font-black text-sm">
            Add First Card
          </button>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddCardForm
            onAdd={(c) => { addFlashCard(c); vibrate(30); }}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
