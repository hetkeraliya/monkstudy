import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NoteLink {
  title: string;
  url: string;
}

interface Subject {
  id: string;
  name: string;
  marks: string[]; // Stores entries like "85/100"
  nextExam: string;
  syllabus: string[];
  notes: NoteLink[];
}

interface MonkState {
  xp: number;
  streak: number; // Fixed: Added missing streak
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
        { id: 'phy', name: 'Physics', marks: [], nextExam: '', syllabus: [], notes: [] },
        { id: 'chem', name: 'Chemistry', marks: [], nextExam: '', syllabus: [], notes: [] },
        { id: 'math', name: 'Maths', marks: [], nextExam: '', syllabus: [], notes: [] }
      ],
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
    }),
    { name: 'monk-core-storage' }
  )
);
