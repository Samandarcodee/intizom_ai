
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, Task, DailyPlan } from '../types';
import { createTelegramScopedJSONStorage } from '../utils/scopedStorage';

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
  syncData: (habits: Habit[], tasks: Task[], plan: DailyPlan[]) => void;
}

const INITIAL_HABITS: Habit[] = [];

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: INITIAL_HABITS,
      dailyPlan: [],
      todayTasks: [],
      lastOpenDate: Date.now(),

      toggleHabit: async (id) => {
        // Find habit first to calculate new state
        const state = get();
        const habit = state.habits.find(h => h.id === id);
        if (!habit) return;

        // Calculate new values
        let newVal = (habit.currentValue || 0);
        let newCompleted = habit.completedToday;
        let newStreak = habit.streak;
        
        // Numeric Logic
        if (habit.targetValue && habit.targetValue > 0 && habit.type !== 'negative') {
           newVal = newVal + 1;
           if (habit.completedToday) {
              newVal = 0;
           }
           newCompleted = newVal >= habit.targetValue;
           newStreak = newCompleted && !habit.completedToday ? habit.streak + 1 : (!newCompleted && habit.completedToday ? Math.max(0, habit.streak - 1) : habit.streak);
        } else {
           // Boolean Logic
           newCompleted = !habit.completedToday;
           newStreak = newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);
        }

        // Update local state
        set((state) => ({
          habits: state.habits.map(h => {
            if (h.id !== id) return h;
            
            const newHistory = [...h.history];
            if (newHistory.length > 0) newHistory[0] = newCompleted;

            return {
              ...h,
              currentValue: newVal,
              completedToday: newCompleted,
              streak: newStreak,
              history: newHistory
            };
          })
        }));

        // API Call
        try {
          await fetch(`/api/habits/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              completedToday: newCompleted,
              streak: newStreak,
              currentValue: newVal,
              // Also update history array if possible, but server might handle it separately or just push latest status
            })
          });
        } catch (error) {
          console.error('Failed to toggle habit:', error);
        }
      },

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

      toggleTask: async (id) => {
        const state = get();
        const task = state.todayTasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;

        set((state) => ({
          todayTasks: state.todayTasks.map(t => 
            t.id === id ? { ...t, completed: newCompleted } : t
          )
        }));

        // API Call
        try {
          await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: newCompleted })
          });
        } catch (error) {
          console.error('Failed to toggle task:', error);
        }
      },

      addHabit: async (name, icon, color, targetValue, unit, type = 'positive') => {
        // Optimistic Update
        const tempId = Date.now().toString();
        const newHabit: Habit = {
          id: tempId,
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
        };

        set((state) => ({ habits: [newHabit, ...state.habits] }));

        // API Call
        try {
          const { getTelegramUser } = await import('../utils/telegram');
          const tgUser = getTelegramUser();
          if (tgUser) {
            const response = await fetch('/api/habits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: tgUser.id,
                ...newHabit
              })
            });
            
            if (response.ok) {
              const savedHabit = await response.json();
              // Replace optimistic habit with real one
              set((state) => ({
                habits: state.habits.map(h => h.id === tempId ? savedHabit : h)
              }));
            }
          }
        } catch (error) {
          console.error('Failed to save habit:', error);
        }
      },

      updateHabit: async (id, name) => {
        set((state) => ({
          habits: state.habits.map(h => h.id === id ? { ...h, name } : h)
        }));

        // API Call
        try {
          await fetch(`/api/habits/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          });
        } catch (error) {
          console.error('Failed to update habit:', error);
        }
      },

      deleteHabit: async (id) => {
        set((state) => ({
          habits: state.habits.filter(h => h.id !== id)
        }));

        // API Call
        try {
          await fetch(`/api/habits/${id}`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.error('Failed to delete habit:', error);
        }
      },

      addTask: async (title) => {
        const tempId = Date.now().toString();
        set((state) => ({
          todayTasks: [...state.todayTasks, {
            id: tempId,
            title,
            completed: false
          }]
        }));

        // API Call
        try {
          const { getTelegramUser } = await import('../utils/telegram');
          const tgUser = getTelegramUser();
          if (tgUser) {
            const response = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: tgUser.id,
                title
              })
            });

            if (response.ok) {
              const savedTask = await response.json();
              set((state) => ({
                todayTasks: state.todayTasks.map(t => t.id === tempId ? savedTask : t)
              }));
            }
          }
        } catch (error) {
          console.error('Failed to add task:', error);
        }
      },

      deleteTask: async (id) => {
        set((state) => ({
          todayTasks: state.todayTasks.filter(t => t.id !== id)
        }));

        try {
          await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        } catch (error) {
          console.error('Failed to delete task:', error);
        }
      },

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
      },

      syncData: (habits, tasks, plan) => {
        // Server data is the source of truth - always overwrite local data
        console.log(`🔄 Syncing data: ${habits.length} habits, ${tasks.length} tasks, ${plan.length} plans`);
        set({
          habits: habits,
          todayTasks: tasks,
          dailyPlan: plan
        });
      }
    }),
    {
      name: 'habit-storage',
      storage: createTelegramScopedJSONStorage(),
    }
  )
);
