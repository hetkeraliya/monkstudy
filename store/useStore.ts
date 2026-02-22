import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MonkState {
  xp: number;
  streak: number;
  pomodoroWork: number;
  pomodoroBreak: number;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
}

export const useStore = create<MonkState>()(
  persist(
    (set) => ({
      xp: 1250,
      streak: 12,
      pomodoroWork: 25,
      pomodoroBreak: 5,
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
    }),
    { name: 'monk-user-state' }
  )
);
