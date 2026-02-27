import { create } from "zustand";

interface Subject {
  id: string;
  name: string;
  completedChapters: number;
  totalChapters: number;
  dailyStudyMinutes: number;
  currentChapter: string;
}

interface MonkState {
  user: any;
  xp: number;
  level: number;
  streak: number;
  subjects: Subject[];

  addXp: (amount: number) => void;
  completeChapter: (id: string) => void;
  logStudyTime: (id: string, minutes: number) => void;
}

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

  addXp: (amount) =>
    set((state) => {
      const newXp = state.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;

      return {
        xp: newXp,
        level: newLevel,
      };
    }),

  completeChapter: (id) =>
    set((state) => ({
      subjects: state.subjects.map((sub) =>
        sub.id === id
          ? { ...sub, completedChapters: sub.completedChapters + 1 }
          : sub
      ),
      xp: state.xp + 20,
    })),

  logStudyTime: (id, minutes) =>
    set((state) => ({
      subjects: state.subjects.map((sub) =>
        sub.id === id
          ? { ...sub, dailyStudyMinutes: sub.dailyStudyMinutes + minutes }
          : sub
      ),
    })),
}));
