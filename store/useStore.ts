import { create } from "zustand";

/* ============================= */
/* ========= TYPES ============= */
/* ============================= */

export interface Mark {
  id: string;
  subject: string;
  score: number;
  total: number;
  date: string;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  marks: Mark[];
}

export interface Subject {
  id: string;
  name: string;
  completedChapters: number;
  totalChapters: number;
  dailyStudyMinutes: number;
  currentChapter: string;
}

/* ============================= */
/* ========= STATE ============= */
/* ============================= */

interface MonkState {
  user: any;

  xp: number;
  level: number;
  streak: number;

  subjects: Subject[];
  exams: Exam[];

  addXp: (amount: number) => void;
  completeChapter: (id: string) => void;
  logStudyTime: (id: string, minutes: number) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;

  addExam: (exam: Exam) => void;
  addMarkToExam: (examId: string, mark: Mark) => void;
}

/* ============================= */
/* ========= STORE ============= */
/* ============================= */

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
    },
    {
      id: "chemistry",
      name: "Chemistry",
      completedChapters: 5,
      totalChapters: 18,
      dailyStudyMinutes: 0,
      currentChapter: "Chemical Bonding",
    },
    {
      id: "maths",
      name: "Maths",
      completedChapters: 2,
      totalChapters: 22,
      dailyStudyMinutes: 0,
      currentChapter: "Definite Integration",
    },
  ],

  exams: [],

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

  /* =============== SUBJECT SYSTEM ============== */

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

  /* ================= EXAM SYSTEM ================= */

  addExam: (exam) =>
    set((state) => ({
      exams: [...state.exams, exam],
    })),

  addMarkToExam: (examId, mark) =>
    set((state) => ({
      exams: state.exams.map((exam) =>
        exam.id === examId
          ? { ...exam, marks: [...exam.marks, mark] }
          : exam
      ),
    })),
}));
