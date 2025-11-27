
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
  addHabit: (name: string, icon?: string, color?: string, targetValue?: number, unit?: string, type?: 'positive' | 'negative') => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
  addTask: (title: string) => void;
  deleteTask: (id: string) => void;
  updatePlanTask: (dayIndex: number, taskIndex: number, newTitle: string) => void;
  checkDailyReset: () => void;
}

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: '10 bet kitob o‘qish', streak: 0, completedToday: false, history: [false, false, false, false, false, false, false], type: 'positive', icon: '📚', color: 'blue', targetValue: 10, currentValue: 0, unit: 'bet' },
  { id: '2', name: 'Shakarsiz kun', streak: 0, completedToday: false, history: [false, false, false, false, false, false, false], type: 'negative', icon: '🍬', color: 'red' },
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

          // Numeric Logic
          if (h.targetValue && h.targetValue > 0) {
            const currentVal = h.currentValue || 0;
            let newVal = currentVal + 1;
            
            // Loop back to 0 if we exceed target? Or just stay at target?
            // User might have accidentally clicked too many times. 
            // Let's implement: If Completed, clicking again resets to 0.
            if (h.completedToday) {
               newVal = 0;
            }

            const isCompleted = newVal >= h.targetValue;
            
            // Update history
            const newHistory = [...h.history];
            if (newHistory.length > 0) newHistory[0] = isCompleted;

            return {
              ...h,
              currentValue: newVal,
              completedToday: isCompleted,
              streak: isCompleted && !h.completedToday ? h.streak + 1 : (!isCompleted && h.completedToday ? Math.max(0, h.streak - 1) : h.streak),
              history: newHistory
            };
          }

          // Boolean Logic (Standard)
          const newCompleted = !h.completedToday;
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

      addHabit: (name, icon, color, targetValue, unit, type = 'positive') => set((state) => ({
        habits: [{
          id: Date.now().toString(),
          name,
          streak: 0,
          completedToday: false,
          history: [false, false, false, false, false, false, false],
          icon,
          color,
          targetValue,
          unit,
          currentValue: 0,
          type
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

      updatePlanTask: (dayIndex, taskIndex, newTitle) => set((state) => {
        const newPlan = [...state.dailyPlan];
        if (newPlan[dayIndex]) {
           const newTasks = [...newPlan[dayIndex].tasks];
           newTasks[taskIndex] = newTitle;
           newPlan[dayIndex] = { ...newPlan[dayIndex], tasks: newTasks };
        }
        return { dailyPlan: newPlan };
      }),

      checkDailyReset: () => {
        const state = get();
        const lastDate = new Date(state.lastOpenDate);
        const now = new Date();

        if (lastDate.getDate() !== now.getDate() || lastDate.getMonth() !== now.getMonth() || lastDate.getFullYear() !== now.getFullYear()) {
          
          set({
            lastOpenDate: Date.now(),
            todayTasks: state.todayTasks.filter(t => !t.completed),
            habits: state.habits.map(h => {
              const wasCompletedYesterday = h.completedToday;
              const newHistory = [false, h.history[0], h.history[1], h.history[2], h.history[3], h.history[4], h.history[5]];
              
              return {
                ...h,
                completedToday: false,
                currentValue: 0, // Reset numeric progress
                streak: wasCompletedYesterday ? h.streak : 0,
                history: newHistory
              };
            })
          });
        } else {
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
