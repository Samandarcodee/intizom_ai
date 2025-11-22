
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface DailyPlan {
  day: number;
  focus: string;
  tasks: string[];
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  history: boolean[]; // Last 7 days
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserStatus {
  isPremium: boolean;
  installDate: number; // Timestamp
}

export interface UserProfile {
  name: string;
  goal: string;
  language: 'uz' | 'ru' | 'en';
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  PLAN = 'plan',
  COACH = 'coach',
  HABITS = 'habits',
  ACCOUNT = 'account'
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
