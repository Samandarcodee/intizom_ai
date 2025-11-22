
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Habit, Task, DailyPlan } from '../types';

interface HabitState {
  habits: Habit[];
  dailyPlan: DailyPlan[];
  todayTasks: Task[];
  lastOpenDate: number;
  
  // Actions
  toggleHabit: (id: string) => void;
  setPlan: (plan: DailyPlan[]) => void;
  toggleTask: (id: string) => void;
  addHabit: (name: string) => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
  addTask: (title: string) => void;
  deleteTask: (id: string) => void;
  checkDailyReset: () => void;
}

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: '10 bet kitob o‘qish', streak: 0, completedToday: false, history: [false, false, false, false, false, false, false] },
  { id: '2', name: 'Shakarsiz kun', streak: 0, completedToday: false, history: [false, false, false, false, false, false, false] },
];

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: INITIAL_HABITS,
      dailyPlan: [],
      todayTasks: [],
      lastOpenDate: Date.now(),

      toggleHabit: (id) => set((state) => ({
        habits: state.habits.map(h => {
          if (h.id !== id) return h;
          const newCompleted = !h.completedToday;
          
          // Update history[0] which represents today/current tracking day in this simple visual model
          const newHistory = [...h.history];
          if (newHistory.length > 0) newHistory[0] = newCompleted;

          return {
            ...h,
            completedToday: newCompleted,
            streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            history: newHistory
          };
        })
      })),

      setPlan: (plan) => set((state) => {
        let newTasks = [...state.todayTasks];
        
        if (newTasks.length === 0 && plan.length > 0) {
          const day1 = plan.find(d => d.day === 1);
          if (day1) {
            newTasks = day1.tasks.map((t, i) => ({ 
              id: `auto-${Date.now()}-${i}`, 
              title: t, 
              completed: false 
            }));
          }
        }
        return { dailyPlan: plan, todayTasks: newTasks };
      }),

      toggleTask: (id) => set((state) => ({
        todayTasks: state.todayTasks.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      })),

      addHabit: (name) => set((state) => ({
        habits: [{
          id: Date.now().toString(),
          name,
          streak: 0,
          completedToday: false,
          history: [false, false, false, false, false, false, false] 
        }, ...state.habits]
      })),

      updateHabit: (id, name) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, name } : h)
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id)
      })),

      addTask: (title) => set((state) => ({
        todayTasks: [...state.todayTasks, {
          id: Date.now().toString(),
          title,
          completed: false
        }]
      })),

      deleteTask: (id) => set((state) => ({
        todayTasks: state.todayTasks.filter(t => t.id !== id)
      })),

      checkDailyReset: () => {
        const state = get();
        const lastDate = new Date(state.lastOpenDate);
        const now = new Date();

        // Check if it's a different day
        if (lastDate.getDate() !== now.getDate() || lastDate.getMonth() !== now.getMonth() || lastDate.getFullYear() !== now.getFullYear()) {
          
          set({
            lastOpenDate: Date.now(),
            // Keep uncompleted tasks
            todayTasks: state.todayTasks.filter(t => !t.completed),
            habits: state.habits.map(h => {
              // Shift history: index 0 was yesterday. 
              // Current history: [yesterdayStatus, dayBefore, ...]
              // We shift: [false (new Today), yesterdayStatus, ...].slice(0, 7)
              
              // Logic:
              // 1. `completedToday` was the status for the day that just passed (yesterday).
              // 2. We push that status to history[0] if we treat history as "Past Days". 
              // BUT our history visualization uses index 0 as the right-most dot (Today).
              // To keep it consistent: history array represents [Today/Yesterday, Day-1, Day-2...]
              // So we shift right.
              
              const wasCompletedYesterday = h.completedToday;
              const newHistory = [false, h.history[0], h.history[1], h.history[2], h.history[3], h.history[4], h.history[5]];
              
              // Streak logic: If not completed yesterday, streak breaks?
              // If the user didn't open the app yesterday, lastOpenDate would be 2 days ago.
              // This simple logic assumes daily opening. For robust logic we'd need date diff.
              // MVP approach: If `completedToday` (which represents yesterday now) was false, reset streak.
              
              return {
                ...h,
                completedToday: false,
                streak: wasCompletedYesterday ? h.streak : 0,
                history: newHistory
              };
            })
          });
        } else {
           // Same day, just update timestamp
           set({ lastOpenDate: Date.now() });
        }
      }
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
