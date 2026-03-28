import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ================= TYPES ================= */

export interface Session {
  id: string;
  minutes: number;
  date: string;
}

export interface Mark {
  id: string;
  score: number;
  total: number;
  date: string;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  type: "High" | "Medium" | "Low";
  marks: Mark[];
}

export interface Chapter {
  id: string;
  title: string;
  completed: boolean;
}

export interface ScheduleItem {
  id: string;
  task: string;
  time: string;
  type: "JEE" | "Study" | "Break" | "Workout" | "Personal" | "Revision" | "MockTest";
  completed: boolean;
}

export interface TaskItem {
  id: string;
  text: string;
  priority: "High" | "Mid" | "Low";
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  dailyStudyMinutes: number;
  marks: Mark[];
  exams: Exam[];
}

export interface UserProfile {
  name: string;
  targetCollege: string;
  targetYear: string;
  dailyGoalHours: number;
  avatar: string;
  bio: string;
}

/* ── Flash-Monk spaced repetition card ── */
export interface FlashCard {
  id: string;
  subject: "Physics" | "Chemistry" | "Maths" | "General";
  topic: string;
  question: string;   // What to recall (e.g. "Work-Energy Theorem")
  answer: string;     // The actual formula/reaction (e.g. "W = ΔKE")
  hint: string;       // Optional hint shown if stuck
  interval: number;   // Days until next review
  nextReview: string; // ISO date "YYYY-MM-DD"
  lastReview: string; // ISO date
  easeFactor: number; // SM-2 ease factor (starts 2.5)
  reviewCount: number;
  streak: number;     // Consecutive correct reviews
}

/* ================= STATE ================= */

interface MonkState {
  xp: number;
  level: number;
  streak: number;
  lastResetDate: string;

  profile: UserProfile;
  flashCards: FlashCard[];

  sessions: Session[];
  subjects: Subject[];
  schedule: ScheduleItem[];
  tasks: TaskItem[];

  addXp: (amount: number) => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  /* Flash-Monk */
  addFlashCard: (card: Pick<FlashCard, "subject" | "topic" | "question" | "answer" | "hint">) => void;
  reviewFlashCard: (id: string, quality: number) => void; // 0=fail,1=hard,2=ok,3=good,4=great,5=perfect
  deleteFlashCard: (id: string) => void;

  addSession: (minutes: number, date?: string) => void;
  checkDailyReset: () => void;

  addChapter: (subjectId: string, title: string) => void;
  removeChapter: (subjectId: string, chapterId: string) => void;
  toggleChapter: (subjectId: string, chapterId: string) => void;
  logStudyTime: (subjectId: string, minutes: number) => void;
  setStudyMinutes: (subjectId: string, minutes: number) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;

  addMark: (subjectId: string, mark: Mark) => void;
  removeMark: (subjectId: string, markId: string) => void;
  addExam: (subjectId: string, exam: Exam) => void;
  removeExam: (subjectId: string, examId: string) => void;

  setSchedule: (items: ScheduleItem[]) => void;
  addScheduleItem: (item: ScheduleItem) => void;
  updateItem: (id: string, data: Partial<ScheduleItem>) => void;
  toggleScheduleItem: (id: string) => void;
  deleteScheduleItem: (id: string) => void;

  addTask: (text: string, priority: "High" | "Mid" | "Low") => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  resetAll: () => void;
}

/* ================= HELPERS ================= */

const todayKey = () => new Date().toISOString().slice(0, 10);

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * SM-2 algorithm — calculates next interval and ease factor
 * quality: 0-5 (0=complete fail, 5=perfect recall)
 */
function sm2(
  quality: number,
  interval: number,
  easeFactor: number,
  reviewCount: number
): { interval: number; easeFactor: number } {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  let newInterval: number;
  if (quality < 3) {
    // Failed — reset to start
    newInterval = 1;
  } else if (reviewCount === 0) {
    newInterval = 1;
  } else if (reviewCount === 1) {
    newInterval = 3;
  } else {
    newInterval = Math.round(interval * newEF);
  }

  return { interval: newInterval, easeFactor: newEF };
}

/* ================= STORE ================= */

export const useStore = create<MonkState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 1,
      lastResetDate: todayKey(),

      profile: {
        name: "",
        targetCollege: "IIT Bombay",
        targetYear: "2026",
        dailyGoalHours: 8,
        avatar: "🧘",
        bio: "",
      },

      flashCards: [],

      sessions: [],

      subjects: [
        { id: "physics",   name: "Physics",   chapters: [], dailyStudyMinutes: 0, marks: [], exams: [] },
        { id: "chemistry", name: "Chemistry", chapters: [], dailyStudyMinutes: 0, marks: [], exams: [] },
        { id: "maths",     name: "Maths",     chapters: [], dailyStudyMinutes: 0, marks: [], exams: [] },
      ],

      schedule: [],
      tasks: [],

      /* ── XP ── */
      addXp: (amount) => {
        const newXp    = get().xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;
        set({ xp: newXp, level: newLevel });
      },

      /* ── PROFILE ── */
      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),

      /* ── FLASH CARDS ── */
      addFlashCard: (card) =>
        set((state) => ({
          flashCards: [
            ...state.flashCards,
            {
              id:          crypto.randomUUID(),
              subject:     card.subject,
              topic:       card.topic,
              question:    card.question,
              answer:      card.answer,
              hint:        card.hint,
              interval:    1,
              nextReview:  todayKey(),  // due immediately
              lastReview:  "",
              easeFactor:  2.5,
              reviewCount: 0,
              streak:      0,
            },
          ],
        })),

      reviewFlashCard: (id, quality) =>
        set((state) => ({
          flashCards: state.flashCards.map((c) => {
            if (c.id !== id) return c;
            const { interval, easeFactor } = sm2(quality, c.interval, c.easeFactor, c.reviewCount);
            const passed = quality >= 3;
            return {
              ...c,
              interval,
              easeFactor,
              reviewCount: c.reviewCount + 1,
              streak:      passed ? c.streak + 1 : 0,
              lastReview:  todayKey(),
              nextReview:  addDays(todayKey(), interval),
            };
          }),
        })),

      deleteFlashCard: (id) =>
        set((state) => ({
          flashCards: state.flashCards.filter((c) => c.id !== id),
        })),

      /* ── SESSION ── */
      addSession: (minutes, date) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            { id: crypto.randomUUID(), minutes, date: date ?? new Date().toISOString() },
          ],
        })),

      /* ── DAILY RESET ── */
      checkDailyReset: () => {
        const today = todayKey();
        if (get().lastResetDate === today) return;
        set((state) => ({
          lastResetDate: today,
          subjects: state.subjects.map((sub) => ({ ...sub, dailyStudyMinutes: 0 })),
        }));
      },

      /* ── CHAPTERS ── */
      addChapter: (subjectId, title) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, chapters: [...sub.chapters, { id: crypto.randomUUID(), title, completed: false }] }
              : sub
          ),
        })),

      removeChapter: (subjectId, chapterId) => {
        get().addXp(20);
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, chapters: sub.chapters.filter((c) => c.id !== chapterId) }
              : sub
          ),
        }));
      },

      toggleChapter: (subjectId, chapterId) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  chapters: sub.chapters.map((ch) => {
                    if (ch.id === chapterId) {
                      if (!ch.completed) get().addXp(20);
                      return { ...ch, completed: !ch.completed };
                    }
                    return ch;
                  }),
                }
              : sub
          ),
        })),

      logStudyTime: (subjectId, minutes) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, dailyStudyMinutes: sub.dailyStudyMinutes + minutes }
              : sub
          ),
        })),

      setStudyMinutes: (subjectId, minutes) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, dailyStudyMinutes: Math.max(0, minutes) }
              : sub
          ),
        })),

      updateSubject: (id, data) =>
        set((state) => ({
          subjects: state.subjects.map((sub) => (sub.id === id ? { ...sub, ...data } : sub)),
        })),

      addMark: (subjectId, mark) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId ? { ...sub, marks: [...sub.marks, mark] } : sub
          ),
        })),

      removeMark: (subjectId, markId) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, marks: sub.marks.filter((m) => m.id !== markId) }
              : sub
          ),
        })),

      addExam: (subjectId, exam) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId ? { ...sub, exams: [...sub.exams, exam] } : sub
          ),
        })),

      removeExam: (subjectId, examId) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, exams: sub.exams.filter((e) => e.id !== examId) }
              : sub
          ),
        })),

      setSchedule: (items) => set({ schedule: items }),
      addScheduleItem: (item) => set((state) => ({ schedule: [...state.schedule, item] })),
      updateItem: (id, data) =>
        set((state) => ({
          schedule: state.schedule.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      toggleScheduleItem: (id) =>
        set((state) => ({
          schedule: state.schedule.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),
      deleteScheduleItem: (id) =>
        set((state) => ({ schedule: state.schedule.filter((item) => item.id !== id) })),

      addTask: (text, priority) =>
        set((state) => ({
          tasks: [...state.tasks, { id: crypto.randomUUID(), text, priority, completed: false }],
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),

      resetAll: () =>
        set({
          xp: 0, level: 1, streak: 1,
          sessions: [], subjects: [], schedule: [], tasks: [], flashCards: [],
          profile: {
            name: "", targetCollege: "IIT Bombay", targetYear: "2026",
            dailyGoalHours: 8, avatar: "🧘", bio: "",
          },
        }),
    }),
    { name: "monk-os-storage" }
  )
);
  
