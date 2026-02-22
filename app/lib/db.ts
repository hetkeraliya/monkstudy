import Dexie, { Table } from 'dexie';

export class MonkDatabase extends Dexie {
  tasks!: Table<any>;
  planner!: Table<any>;

  constructor() {
    super('StudyMonkDB');
    this.version(1).stores({
      tasks: 'id, status, subject, priority, dueDate',
      planner: 'id' // stores daily blocks
    });
  }
}

export const db = new MonkDatabase();

// Haptic feedback utility
export const vibrate = (ms: number = 50) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(ms);
  }
};

