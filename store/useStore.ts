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

interface MonkState {
  xp: number;
  level: number;
  streak: number;

  subjects: Subject[];

  /* XP */
  addXp: (amount: number) => void;

  /* Subject Logic */
  addChapter: (subjectId: string, title: string) => void;
  toggleChapter: (subjectId: string, chapterId: string) => void;
  logStudyTime: (subjectId: string, minutes: number) => void;

  /* Reset */
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
        },
        {
          id: "chemistry",
          name: "Chemistry",
          chapters: [],
          dailyStudyMinutes: 0,
        },
        {
          id: "maths",
          name: "Maths",
          chapters: [],
          dailyStudyMinutes: 0,
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

      /* ================= SUBJECT LOGIC ================= */

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
                      // Reward XP only when marking complete
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

      resetAll: () =>
        set({
          xp: 0,
          level: 1,
          streak: 1,
          subjects: [
            { id: "physics", name: "Physics", chapters: [], dailyStudyMinutes: 0 },
            { id: "chemistry", name: "Chemistry", chapters: [], dailyStudyMinutes: 0 },
            { id: "maths", name: "Maths", chapters: [], dailyStudyMinutes: 0 },
          ],
        }),
    }),
    {
      name: "monk-os-storage",
    }
  )
);
