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

// Updated with your specific categories: JEE, Normal, Break, Study, Habit, Fun
export interface ScheduleItem {
  id: string;
  time: string;
  task: string;
  type: 'JEE' | 'Normal' | 'Break' | 'Study' | 'Habit' | 'Fun';
  completed: boolean;
}

interface MonkState {
  // Global Stats
  xp: number;
  streak: number;
  
  // Feature Arrays
  tasks: Task[];
  schedule: ScheduleItem[];
  subjects: Subject[];

  // --- Actions ---

  // XP & Progression
  addXp: (amount: number) => void;
  setStreak: (val: number) => void;

  // Mission Control (Tasks)
  addTask: (text: string, priority: 'High' | 'Mid' | 'Low') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Monk Planner (Schedule)
  setSchedule: (newSchedule: ScheduleItem[]) => void;
  toggleSchedule: (id: string) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;

  // Intelligence (Academic)
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  addMark: (subjectId: string, score: number, total: number) => void;
  addExam: (subjectId: string, exam: Omit<Exam, 'id'>) => void;
}

// --- Store Implementation ---

export const useStore = create<MonkState>()(
  persist(
    (set) => ({
      // 1. Initial State
      xp: 0,
      streak: 0,
      tasks: [],
      // Default Schedule using your requested blocks
      schedule: [
        { id: '1', time: "07:00", task: "School Protocol", type: "Normal", completed: false },
        { id: '2', time: "13:00", task: "Recharge", type: "Break", completed: false },
        { id: '3', time: "17:00", task: "School End", type: "Normal", completed: false },
        { id: '4', time: "18:30", task: "Advanced JEE Prep", type: "JEE", completed: false },
        { id: '5', time: "21:00", task: "Subject Deep Dive", type: "Study", completed: false },
      ],
      subjects: [
        { id: 'phy', name: 'Physics', marks: [], exams: [] },
        { id: 'chem', name: 'Chemistry', marks: [], exams: [] },
        { id: 'math', name: 'Maths', marks: [], exams: [] }
      ],

      // 2. Global Actions
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      setStreak: (val) => set({ streak: val }),

      // 3. Task Actions (Mission Control)
      addTask: (text, priority) => set((state) => ({
        tasks: [{ id: Date.now().toString(), text, completed: false, priority }, ...state.tasks]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      // 4. Planner Actions (Monk Schedule)
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

      // 5. Academic Actions (Intelligence)
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
      name: 'monk-core-storage', // Persists to Honor 8X LocalStorage
    }
  )
);
