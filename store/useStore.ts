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

export interface ScheduleItem {
  id: string;
  task: string; // ✅ matches planner
  time: string;
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

  subjects: Subject[];
  schedule: ScheduleItem[];

  /* XP */
  addXp: (amount: number) => void;

  /* Subject */
  addChapter: (subjectId: string, title: string) => void;
  toggleChapter: (subjectId: string, chapterId: string) => void;
  logStudyTime: (subjectId: string, minutes: number) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;

  /* Marks + Exams */
  addMark: (subjectId: string, mark: Mark) => void;
  addExam: (subjectId: string, exam: Exam) => void;

  /* Planner */
  setSchedule: (items: ScheduleItem[]) => void;
  addScheduleItem: (item: ScheduleItem) => void;
  updateItem: (id: string, data: Partial<ScheduleItem>) => void; // ✅ needed
  toggleScheduleItem: (id: string) => void;
  deleteScheduleItem: (id: string) => void;

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

      schedule: [],

      /* ================= XP ================= */

      addXp: (amount) => {
        const newXp = get().xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;

        set({
          xp: newXp,
          level: newLevel,
        });
      },

      /* ================= SUBJECT ================= */

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

      /* ================= MARK ================= */

      addMark: (subjectId, mark) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, marks: [...sub.marks, mark] }
              : sub
          ),
        })),

      /* ================= EXAM ================= */

      addExam: (subjectId, exam) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, exams: [...sub.exams, exam] }
              : sub
          ),
        })),

      /* ================= PLANNER ================= */

      setSchedule: (items) => set({ schedule: items }),

      addScheduleItem: (item) =>
        set((state) => ({
          schedule: [...state.schedule, item],
        })),

      updateItem: (id, data) =>
        set((state) => ({
          schedule: state.schedule.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
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

      /* ================= RESET ================= */

      resetAll: () =>
        set({
          xp: 0,
          level: 1,
          streak: 1,
          subjects: [],
          schedule: [],
        }),
    }),
    {
      name: "monk-os-storage",
    }
  )
);
