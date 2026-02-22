import Dexie, { Table } from 'dexie';

export class MonkDatabase extends Dexie {
  tasks!: Table<any>;
  planner!: Table<any>;

  constructor() {
    super('StudyMonkDB');
    this.version(1).stores({
      tasks: 'id, status, subject, priority, dueDate',
      planner: 'id' 
    });
  }
}

export const db = new MonkDatabase();

// Updated to allow both single vibrations and complex patterns
export const vibrate = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(pattern);
  }
};
