import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Interfaces ---

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
  type: 'High' | 'Mid' | 'Low';
}

export interface Subject {
  id: string;
  name: string;
  marks: Mark[];
  exams: Exam[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'High' | 'Mid' | 'Low';
}

export interface ScheduleItem {
  id: string;
  time: string;
  task: string;
  type: 'School' | 'Study' | 'Break';
  completed: boolean;
}

interface MonkState {
  // Stats
  xp: number;
  streak: number;
  
  // Data Arrays
  tasks: Task[];
  schedule: ScheduleItem[];
  subjects: Subject[];

  // --- Actions ---

  // Global Stats
  addXp: (amount: number) => void;
  setStreak: (val: number) => void;

  // Task Actions
  addTask: (text: string, priority: 'High' | 'Mid' | 'Low') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Planner Actions
  setSchedule: (newSchedule: ScheduleItem[]) => void;
  toggleSchedule: (id: string) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;

  // Subject/Academic Actions
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  addMark: (subjectId: string, score: number, total: number) => void;
  addExam: (subjectId: string, exam: Omit<Exam, 'id'>) => void;
}

// --- Store Implementation ---

export const useStore = create<MonkState>()(
  persist(
    (set) => ({
      // Initial State
      xp: 0,
      streak: 0,
      tasks: [],
      schedule: [
        { id: '1', time: "07:00", task: "School Begins", type: "School", completed: false },
        { id: '2', time: "13:00", task: "Lunch Break", type: "Break", completed: false },
        { id: '3', time: "17:00", task: "School Ends", type: "School", completed: false },
        { id: '4', time: "18:30", task: "JEE Prep (Block 1)", type: "Study", completed: false },
        { id: '5', time: "21:00", task: "JEE Prep (Block 2)", type: "Study", completed: false },
      ],
      subjects: [
        { id: 'phy', name: 'Physics', marks: [], exams: [] },
        { id: 'chem', name: 'Chemistry', marks: [], exams: [] },
        { id: 'math', name: 'Maths', marks: [], exams: [] }
      ],

      // Stats Actions
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      setStreak: (val) => set({ streak: val }),

      // Task Actions
      addTask: (text, priority) => set((state) => ({
        tasks: [{ id: Date.now().toString(), text, completed: false, priority }, ...state.tasks]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      // Planner Actions
      setSchedule: (newSchedule) => set({ schedule: newSchedule }),
      toggleSchedule: (id) => set((state) => ({
        schedule: state.schedule.map(item => 
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      })),
      updateScheduleItem: (id, updates) => set((state) => ({
        schedule: state.schedule.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      })),

      // Academic Actions
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      addMark: (subjectId, score, total) => set((state) => ({
        subjects: state.subjects.map(s => s.id === subjectId ? {
          ...s,
          marks: [...s.marks, { id: Date.now().toString(), score, total, date: new Date().toISOString() }]
        } : s)
      })),
      addExam: (subjectId, exam) => set((state) => ({
        subjects: state.subjects.map(s => s.id === subjectId ? {
          ...s,
          exams: [...s.exams, { ...exam, id: Date.now().toString() }]
        } : s)
      })),
    }),
    {
      name: 'monk-core-storage', // Key for localStorage
    }
  )
);
