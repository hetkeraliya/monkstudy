import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScheduleItem {
  id: string;
  time: string;
  task: string;
  type: 'School' | 'Study' | 'Break';
  completed: boolean;
}

// ... existing Mark and Exam interfaces

export const useStore = create<any>()(
  persist(
    (set) => ({
      xp: 0,
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
      addXp: (amount: number) => set((state: any) => ({ xp: state.xp + amount })),
      updateSchedule: (newSchedule: ScheduleItem[]) => set({ schedule: newSchedule }),
      toggleSchedule: (id: string) => set((state: any) => ({
        schedule: state.schedule.map((item: any) => 
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      })),
      updateSubject: (id: string, updates: any) => set((state: any) => ({
        subjects: state.subjects.map((s: any) => s.id === id ? { ...s, ...updates } : s)
      })),
    }),
    { name: 'monk-core-storage' }
  )
);
