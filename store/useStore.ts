import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Mark { id: string; score: number; total: number; date: string; }
export interface Exam { id: string; title: string; date: string; type: 'High' | 'Mid' | 'Low'; }
export interface Subject { id: string; name: string; marks: Mark[]; exams: Exam[]; notes: { title: string; url: string }[]; videos: { title: string; url: string }[]; }
export interface Task { id: string; text: string; completed: boolean; priority: 'High' | 'Mid' | 'Low'; }
export interface ScheduleItem { id: string; time: string; task: string; type: 'JEE' | 'Normal' | 'Break' | 'Study' | 'Habit' | 'Fun'; completed: boolean; }

interface MonkState {
  xp: number;
  streak: number;
  tasks: Task[];
  schedule: ScheduleItem[];
  subjects: Subject[];

  addXp: (amount: number) => void;
  setStreak: (val: number) => void;
  
  // Mission Control
  addTask: (text: string, priority: 'High' | 'Mid' | 'Low') => void;
  deleteTask: (id: string) => void;

  // Planner
  setSchedule: (newSchedule: ScheduleItem[]) => void;
  deleteScheduleItem: (id: string) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;

  // Academic
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  addMark: (subjectId: string, score: number, total: number) => void;
  addExam: (subjectId: string, exam: Omit<Exam, 'id'>) => void;
}

export const useStore = create<MonkState>()(
  persist(
    (set) => ({
      xp: 0,
      streak: 0,
      tasks: [],
      schedule: [
        { id: '1', time: "07:00", task: "School Protocol", type: "Normal", completed: false },
        { id: '4', time: "18:30", task: "Advanced JEE Prep", type: "JEE", completed: false },
      ],
      subjects: [
        { id: 'phy', name: 'Physics', marks: [], exams: [], notes: [], videos: [] },
        { id: 'chem', name: 'Chemistry', marks: [], exams: [], notes: [], videos: [] },
        { id: 'math', name: 'Maths', marks: [], exams: [], notes: [], videos: [] }
      ],

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      setStreak: (val) => set({ streak: val }),

      addTask: (text, priority) => set((state) => ({
        tasks: [{ id: Date.now().toString(), text, completed: false, priority }, ...state.tasks]
      })),
      // Tasks delete immediately instead of just toggling
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      setSchedule: (newSchedule) => set({ schedule: newSchedule }),
      // Planner items delete immediately upon completion
      deleteScheduleItem: (id) => set((state) => ({
        schedule: state.schedule.filter(item => item.id !== id)
      })),
      updateScheduleItem: (id, updates) => set((state) => ({
        schedule: state.schedule.map(item => item.id === id ? { ...item, ...updates } : item)
      })),

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
    { name: 'monk-core-storage' }
  )
);
