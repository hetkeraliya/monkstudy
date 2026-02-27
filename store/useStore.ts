import { create } from "zustand";

/* ================= TYPES ================= */

export interface Mark {
  id: string;
  score: number;
  total: number;
  date: string;
}
export interface Exam {
  id: string;
  title: string; // ✅ matches analysis page
  date: string;
  type: "High" | "Medium" | "Low"; // ✅ matches analysis page
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
  exams: Exam[]; // ✅ FIX ADDED
}

/* ================= STATE ================= */

interface MonkState {
  user: any;

  xp: number;
  level: number;
  streak: number;

  subjects: Subject[];

  addXp: (amount: number) => void;
  completeChapter: (id: string) => void;
  logStudyTime: (id: string, minutes: number) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;

  addMark: (subjectId: string, mark: Mark) => void;
  addExam: (subjectId: string, exam: Exam) => void;
}

/* ================= STORE ================= */

export const useStore = create<MonkState>((set) => ({
  user: null,

  xp: 0,
  level: 1,
  streak: 1,

  subjects: [
    {
      id: "physics",
      name: "Physics",
      completedChapters: 3,
      totalChapters: 20,
      dailyStudyMinutes: 0,
      currentChapter: "Rotational Motion",
      marks: [],
      exams: [], // ✅ FIX
    },
    {
      id: "chemistry",
      name: "Chemistry",
      completedChapters: 5,
      totalChapters: 18,
      dailyStudyMinutes: 0,
      currentChapter: "Chemical Bonding",
      marks: [],
      exams: [], // ✅ FIX
    },
    {
      id: "maths",
      name: "Maths",
      completedChapters: 2,
      totalChapters: 22,
      dailyStudyMinutes: 0,
      currentChapter: "Definite Integration",
      marks: [],
      exams: [], // ✅ FIX
    },
  ],

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

  /* ================= SUBJECT SYSTEM ================= */

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
}));
