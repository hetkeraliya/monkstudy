import { create } from "zustand";

/* ========================= */
/* ========= TYPES ========= */
/* ========================= */

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

export interface Subject {
  id: string;
  name: string;
  completedChapters: number;
  totalChapters: number;
  dailyStudyMinutes: number;
  currentChapter: string;
  marks: Mark[];
  exams: Exam[];
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type:
    | "JEE"
    | "Study"
    | "Break"
    | "Workout"
    | "Personal"
    | "Revision"
    | "MockTest";
  completed: boolean;
}

/* ========================= */
/* ========= STATE ========= */
/* ========================= */

interface MonkState {
  user: any;

  xp: number;
  level: number;
  streak: number;

  subjects: Subject[];
  schedule: ScheduleItem[];

  /* XP */
  addXp: (amount: number) => void;

  /* Subject */
  completeChapter: (id: string) => void;
  logStudyTime: (id: string, minutes: number) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;

  /* Marks + Exams */
  addMark: (subjectId: string, mark: Mark) => void;
  addExam: (subjectId: string, exam: Exam) => void;

  /* Planner */
  setSchedule: (items: ScheduleItem[]) => void;
  addScheduleItem: (item: ScheduleItem) => void;
  toggleScheduleItem: (id: string) => void;
  deleteScheduleItem: (id: string) => void;
}

/* ========================= */
/* ========= STORE ========= */
/* ========================= */

export const useStore = create<MonkState>((set) => ({
  user: null,

  xp: 0,
  level: 1,
  streak: 1,

  /* ================= SUBJECTS ================= */

  subjects: [
    {
      id: "physics",
      name: "Physics",
      completedChapters: 3,
      totalChapters: 20,
      dailyStudyMinutes: 0,
      currentChapter: "Rotational Motion",
      marks: [],
      exams: [],
    },
    {
      id: "chemistry",
      name: "Chemistry",
      completedChapters: 5,
      totalChapters: 18,
      dailyStudyMinutes: 0,
      currentChapter: "Chemical Bonding",
      marks: [],
      exams: [],
    },
    {
      id: "maths",
      name: "Maths",
      completedChapters: 2,
      totalChapters: 22,
      dailyStudyMinutes: 0,
      currentChapter: "Definite Integration",
      marks: [],
      exams: [],
    },
  ],

  /* ================= PLANNER ================= */

  schedule: [],

  /* ================= XP SYSTEM ================= */

  addXp: (amount) =>
    set((state) => {
      const newXp = state.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;

      return {
        xp: newXp,
        level: newLevel,
      };
    }),

  /* ================= SUBJECT LOGIC ================= */

  completeChapter: (id) =>
    set((state) => ({
      subjects: state.subjects.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              completedChapters:
                sub.completedChapters < sub.totalChapters
                  ? sub.completedChapters + 1
                  : sub.completedChapters,
            }
          : sub
      ),
      xp: state.xp + 20,
    })),

  logStudyTime: (id, minutes) =>
    set((state) => ({
      subjects: state.subjects.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              dailyStudyMinutes: sub.dailyStudyMinutes + minutes,
            }
          : sub
      ),
    })),

  updateSubject: (id, data) =>
    set((state) => ({
      subjects: state.subjects.map((sub) =>
        sub.id === id ? { ...sub, ...data } : sub
      ),
    })),

  /* ================= MARK SYSTEM ================= */

  addMark: (subjectId, mark) =>
    set((state) => ({
      subjects: state.subjects.map((sub) =>
        sub.id === subjectId
          ? { ...sub, marks: [...sub.marks, mark] }
          : sub
      ),
    })),

  /* ================= EXAM SYSTEM ================= */

  addExam: (subjectId, exam) =>
    set((state) => ({
      subjects: state.subjects.map((sub) =>
        sub.id === subjectId
          ? { ...sub, exams: [...sub.exams, exam] }
          : sub
      ),
    })),

  /* ================= PLANNER LOGIC ================= */

  setSchedule: (items) => set({ schedule: items }),

  addScheduleItem: (item) =>
    set((state) => ({
      schedule: [...state.schedule, item],
    })),

  toggleScheduleItem: (id) =>
    set((state) => ({
      schedule: state.schedule.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      ),
    })),

  deleteScheduleItem: (id) =>
    set((state) => ({
      schedule: state.schedule.filter((item) => item.id !== id),
    })),
}));
