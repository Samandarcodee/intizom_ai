export enum AppTab {
  DASHBOARD = 'dashboard',
  HABITS = 'habits',
  PLAN = 'plan',
  COACH = 'coach',
  ACCOUNT = 'account',
}

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
  type: 'positive' | 'negative'; // positive (build) or negative (break)
  
  // Visual and quantitative fields
  icon?: string; // Emoji
  color?: string; // 'blue' | 'green' | 'orange' | 'purple' | 'red'
  targetValue?: number; // e.g. 8 (cups of water)
  currentValue?: number; // e.g. 3
  unit?: string; // e.g. 'stakan', 'km', 'bet'
  dailyMood?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserStatus {
  isPremium: boolean;
  installDate: number;
}

export interface UserProfile {
  name: string;
  goal: string;
  language: 'uz' | 'ru' | 'en';
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
