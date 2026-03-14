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

/* ================= STATE ================= */

interface MonkState {
  xp: number;
  level: number;
  streak: number;
  lastResetDate: string; // "YYYY-MM-DD" — tracks daily reset

  sessions: Session[];
  subjects: Subject[];
  schedule: ScheduleItem[];
  tasks: TaskItem[];

  addXp: (amount: number) => void;

  addSession: (minutes: number, date?: string) => void;

  /* daily reset check — call on app mount */
  checkDailyReset: () => void;

  addChapter: (subjectId: string, title: string) => void;
  removeChapter: (subjectId: string, chapterId: string) => void; // click to remove
  toggleChapter: (subjectId: string, chapterId: string) => void;
  logStudyTime: (subjectId: string, minutes: number) => void;
  setStudyMinutes: (subjectId: string, minutes: number) => void; // direct edit
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

/* ================= STORE ================= */

export const useStore = create<MonkState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 1,
      lastResetDate: todayKey(),

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

      /* ── SESSION ── */
      addSession: (minutes, date) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            { id: crypto.randomUUID(), minutes, date: date ?? new Date().toISOString() },
          ],
        })),

      /* ── DAILY RESET ── 
         Call this on every page mount. If today's date differs from 
         lastResetDate, zero out all dailyStudyMinutes. */
      checkDailyReset: () => {
        const today = todayKey();
        if (get().lastResetDate === today) return;
        set((state) => ({
          lastResetDate: today,
          subjects: state.subjects.map((sub) => ({
            ...sub,
            dailyStudyMinutes: 0,
          })),
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

      // Click on chapter row → remove it + give XP
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

      /* ── STUDY TIME ── */
      logStudyTime: (subjectId, minutes) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, dailyStudyMinutes: sub.dailyStudyMinutes + minutes }
              : sub
          ),
        })),

      // Set absolute value (for corrections)
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

      /* ── MARKS ── */
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

      /* ── EXAMS ── */
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

      /* ── PLANNER ── */
      setSchedule: (items) => set({ schedule: items }),
      addScheduleItem: (item) => set((state) => ({ schedule: [...state.schedule, item] })),
      updateItem: (id, data) =>
        set((state) => ({ schedule: state.schedule.map((item) => (item.id === id ? { ...item, ...data } : item)) })),
      toggleScheduleItem: (id) =>
        set((state) => ({ schedule: state.schedule.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)) })),
      deleteScheduleItem: (id) =>
        set((state) => ({ schedule: state.schedule.filter((item) => item.id !== id) })),

      /* ── TASKS ── */
      addTask: (text, priority) =>
        set((state) => ({
          tasks: [...state.tasks, { id: crypto.randomUUID(), text, priority, completed: false }],
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id) =>
        set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) })),

      resetAll: () =>
        set({ xp: 0, level: 1, streak: 1, sessions: [], subjects: [], schedule: [], tasks: [] }),
    }),
    { name: "monk-os-storage" }
  )
);
