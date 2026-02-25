import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- INTERFACES (Data Structures) ---

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Mark { id: string; score: number; total: number; date: string; }
export interface Exam { id: string; title: string; date: string; type: 'High' | 'Mid' | 'Low'; }
export interface Subject {
  id: string;
  name: string;
  totalChapters: number;
  completedChapters: number;
  currentChapter: string;
  dailyStudyMinutes: number;
  marks: Mark[];
  exams: Exam[];
}
export interface Task { id: string; text: string; completed: boolean; priority: 'High' | 'Mid' | 'Low'; }
export interface ScheduleItem { id: string; time: string; task: string; type: 'JEE' | 'Normal' | 'Break' | 'Study' | 'Habit' | 'Fun'; completed: boolean; }

// --- STATE DEFINITION ---

interface MonkState {
  // 1. Firebase Auth State
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  
  // 2. Core Stats
  xp: number;
  streak: number;
  focusMode: boolean;
  
  // 3. Data Arrays
  tasks: Task[];
  schedule: ScheduleItem[];
  subjects: Subject[];

  // --- ACTIONS ---

  // Auth Actions (Called by your Firebase AuthProvider component)
  setAuthUser: (user: FirebaseUser | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // Global Actions
  addXp: (amount: number) => void;
  setStreak: (val: number) => void;
  toggleFocusMode: () => void;

  // Task Actions
  addTask: (text: string, priority: 'High' | 'Mid' | 'Low') => void;
  deleteTask: (id: string) => void;

  // Planner Actions
  setSchedule: (newSchedule: ScheduleItem[]) => void;
  deleteScheduleItem: (id: string) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;

  // Subject & Academic Actions
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  updateSubjectProgress: (id: string, chapters: number, current: string) => void;
  addStudyTime: (id: string, mins: number) => void;
  addMark: (subjectId: string, score: number, total: number) => void;
  addExam: (subjectId: string, exam: Omit<Exam, 'id'>) => void;
}

// --- STORE IMPLEMENTATION ---

export const useStore = create<MonkState>()(
  persist(
    (set) => ({
      // --- INITIAL STATE ---
      
      user: null,
      isAuthenticated: false,
      isAuthLoading: true, // Starts true so the app waits for Firebase to check the status

      xp: 0,
      streak: 0,
      focusMode: false,
      
      tasks: [],
      schedule: [
        { id: '1', time: "06:00", task: "Wake & Hydrate", type: "Habit", completed: false },
        { id: '2', time: "06:30", task: "Deep Work Block 1", type: "JEE", completed: false },
        { id: '3', time: "09:30", task: "School Protocol", type: "Normal", completed: false },
        { id: '4', time: "18:00", task: "Advanced JEE Prep", type: "JEE", completed: false },
      ],
      
      subjects: [
        { id: 'phy', name: 'Physics', totalChapters: 30, completedChapters: 12, currentChapter: 'Electromagnetism', dailyStudyMinutes: 0, marks: [], exams: [] },
        { id: 'chem', name: 'Chemistry', totalChapters: 28, completedChapters: 8, currentChapter: 'Organic Isomerism', dailyStudyMinutes: 0, marks: [], exams: [] },
        { id: 'math', name: 'Maths', totalChapters: 25, completedChapters: 10, currentChapter: '3D Coordinate Geometry', dailyStudyMinutes: 0, marks: [], exams: [] }
      ],

      // --- ACTION IMPLEMENTATIONS ---

      // Auth (No more local PINs, strictly relying on Firebase)
      setAuthUser: (user) => set({ user, isAuthenticated: !!user, isAuthLoading: false }),
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),

      // Global
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      setStreak: (val) => set({ streak: val }),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),

      // Mission Control (Tasks)
      addTask: (text, priority) => set((state) => ({
        tasks: [{ id: Date.now().toString(), text, completed: false, priority }, ...state.tasks]
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      // Planner
      setSchedule: (newSchedule) => set({ schedule: newSchedule }),
      deleteScheduleItem: (id) => set((state) => ({
        schedule: state.schedule.filter(item => item.id !== id)
      })),
      updateScheduleItem: (id, updates) => set((state) => ({
        schedule: state.schedule.map(item => item.id === id ? { ...item, ...updates } : item)
      })),

      // Subject Intelligence
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      updateSubjectProgress: (id, chapters, current) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { 
          ...s, 
          completedChapters: chapters,
          currentChapter: current 
        } : s)
      })),
      addStudyTime: (id, mins) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { 
          ...s, 
          dailyStudyMinutes: s.dailyStudyMinutes + mins 
        } : s)
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
      name: 'monk-core-storage', 
    }
  )
);
