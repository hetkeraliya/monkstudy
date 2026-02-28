import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ================= TYPES ================= */

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
}

export interface TaskItem {
  id: string;
  text: string;
  priority: "High" | "Mid" | "Low";
  completed: boolean;
}

interface MonkState {
  xp: number;
  level: number;
  streak: number;

  subjects: Subject[];
  tasks: TaskItem[];

  /* XP */
  addXp: (amount: number) => void;

  /* Subject Logic */
  addChapter: (subjectId: string, title: string) => void;
  toggleChapter: (subjectId: string, chapterId: string) => void;
  logStudyTime: (subjectId: string, minutes: number) => void;

  /* Tasks */
  addTask: (text: string, priority: "High" | "Mid" | "Low") => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
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
          dailyStudyMinutes: 0,
          chapters: [],
        },
        {
          id: "chemistry",
          name: "Chemistry",
          dailyStudyMinutes: 0,
          chapters: [],
        },
        {
          id: "maths",
          name: "Maths",
          dailyStudyMinutes: 0,
          chapters: [],
        },
      ],

      tasks: [],

      /* XP SYSTEM */

      addXp: (amount) => {
        const newXp = get().xp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;

        set({
          xp: newXp,
          level: newLevel,
        });
      },

      /* SUBJECT LOGIC */

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
                  chapters: sub.chapters.map((ch) =>
                    ch.id === chapterId
                      ? { ...ch, completed: !ch.completed }
                      : ch
                  ),
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

      /* TASK SYSTEM */

      addTask: (text, priority) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              text,
              priority,
              completed: false,
            },
          ],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: !task.completed }
              : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
    }),
    {
      name: "monk-os-storage", // 🔥 this makes everything permanent
    }
  )
);
