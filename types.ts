
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  color: string;
  reminderTime?: string; // Formato "HH:mm"
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  reminderTime?: string; // Formato "HH:mm"
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export interface Workout {
  id: string;
  type: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY';
  duration: number; // minutes
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  date: string;
  notes?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  dailyScore: number;
}

export interface AppState {
  habits: Habit[];
  tasks: Task[];
  transactions: Transaction[];
  workouts: Workout[];
  onboardingCompleted: boolean;
  userStats: UserStats;
}
