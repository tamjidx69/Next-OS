export type ViewType = 'dashboard' | 'tasks' | 'notes' | 'ai' | 'habits' | 'goals' | 'settings' | 'pricing';

export interface Task {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  streak: number;
  lastCompleted: number | null;
  createdAt: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  target: number;
  current: number;
  createdAt: number;
}

export interface FocusSession {
  id: string;
  userId: string;
  duration: number; // in minutes
  type: 'focus' | 'break';
  completedAt: number;
}
