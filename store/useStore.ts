import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Exam {
  id: string;
  type: 'High' | 'Low'; // High = JEE/Major, Low = School/Weekly
  date: string;
  title: string;
}

interface Subject {
  id: string;
  name: string;
  marks: { score: number; total: number; date: string }[]; 
  exams: Exam[];
  notes: { title: string; url: string }[];
  videos: { title: string; url: string }[];
}

interface MonkState {
  xp: number;
  streak: number;
  subjects: Subject[];
  addXp: (amount: number) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
}

export const useStore = create<MonkState>()(
  persist(
    (set) => ({
      xp: 0,
      streak: 0,
      subjects: [
        { id: 'phy', name: 'Physics', marks: [], exams: [], notes: [], videos: [] },
        { id: 'chem', name: 'Chemistry', marks: [], exams: [], notes: [], videos: [] },
        { id: 'math', name: 'Maths', marks: [], exams: [], notes: [], videos: [] }
      ],
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
    }),
    { name: 'monk-core-storage' }
  )
);
