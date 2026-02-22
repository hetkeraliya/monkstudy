import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'High' | 'Mid' | 'Low';
}

// ... existing interfaces for Subject, Mark, Exam ...

interface MonkState {
  xp: number;
  streak: number;
  tasks: Task[]; // New: Tasks array
  subjects: any[];
  addXp: (amount: number) => void;
  // New: Task Actions
  addTask: (text: string, priority: 'High' | 'Mid' | 'Low') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateSubject: (id: string, updates: any) => void;
}

export const useStore = create<MonkState>()(
  persist(
    (set) => ({
      xp: 0,
      streak: 0,
      tasks: [],
      subjects: [
        { id: 'phy', name: 'Physics', marks: [], exams: [], notes: [], videos: [] },
        { id: 'chem', name: 'Chemistry', marks: [], exams: [], notes: [], videos: [] },
        { id: 'math', name: 'Maths', marks: [], exams: [], notes: [], videos: [] }
      ],
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      addTask: (text, priority) => set((state) => ({
        tasks: [{ id: Date.now().toString(), text, completed: false, priority }, ...state.tasks]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
    }),
    { name: 'monk-core-storage' }
  )
);
