import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ================= TYPES ================= */

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

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  dailyStudyMinutes: number;
  marks: Mark[];
  exams: Exam[];
}

interface MonkState {
  xp: number;
  level: number;
  streak: number;

  subjects: Subject[];

  /* XP */
  addXp: (amount: number) => void;

  /* Chapters */
  addChapter: (subjectId: string, title: string) => void;
  toggleChapter: (subjectId: string, chapterId: string) => void;
  logStudyTime: (subjectId: string, minutes: number) => void;

  /* Marks & Exams */
  addMark: (subjectId: string, mark: Mark) => void;
  addExam: (subjectId: string, exam: Exam) => void;

  resetAll: () => void;
}

/* ================= STORE ================= */

export const useStore = create<MonkState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 1,

      subjects: [
        {
          id: "physics",
          name: "Physics",
          chapters: [],
          dailyStudyMinutes: 0,
          marks: [],
          exams: [],
        },
        {
          id: "chemistry",
          name: "Chemistry",
          chapters: [],
          dailyStudyMinutes: 0,
          marks: [],
          exams: [],
        },
        {
          id: "maths",
          name: "Maths",
          chapters: [],
          dailyStudyMinutes: 0,
          marks: [],
          exams: [],
        },
      ],

      /* ================= XP SYSTEM ================= */

      addXp: (amount) => {
        const newXp = get().xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;

        set({
          xp: newXp,
          level: newLevel,
        });
      },

      /* ================= CHAPTER LOGIC ================= */

      addChapter: (subjectId, title) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  chapters: [
                    ...sub.chapters,
                    {
                      id: crypto.randomUUID(),
                      title,
                      completed: false,
                    },
                  ],
                }
              : sub
          ),
        })),

      toggleChapter: (subjectId, chapterId) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  chapters: sub.chapters.map((ch) => {
                    if (ch.id === chapterId) {
                      if (!ch.completed) {
                        get().addXp(20);
                      }
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
              ? {
                  ...sub,
                  dailyStudyMinutes: sub.dailyStudyMinutes + minutes,
                }
              : sub
          ),
        })),

      /* ================= MARK SYSTEM ================= */

      addMark: (subjectId, mark) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  marks: [...sub.marks, mark],
                }
              : sub
          ),
        })),

      /* ================= EXAM SYSTEM ================= */

      addExam: (subjectId, exam) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  exams: [...sub.exams, exam],
                }
              : sub
          ),
        })),

      /* ================= RESET ================= */

      resetAll: () =>
        set({
          xp: 0,
          level: 1,
          streak: 1,
          subjects: [
            {
              id: "physics",
              name: "Physics",
              chapters: [],
              dailyStudyMinutes: 0,
              marks: [],
              exams: [],
            },
            {
              id: "chemistry",
              name: "Chemistry",
              chapters: [],
              dailyStudyMinutes: 0,
              marks: [],
              exams: [],
            },
            {
              id: "maths",
              name: "Maths",
              chapters: [],
              dailyStudyMinutes: 0,
              marks: [],
              exams: [],
            },
          ],
        }),
    }),
    {
      name: "monk-os-storage",
    }
  )
);
