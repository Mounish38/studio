export type TaskStatus = 'ongoing' | 'current' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string; // ISO string for date
  order: number; // Defines order within its status column
}
