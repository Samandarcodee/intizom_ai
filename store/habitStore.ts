import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Habit, Task, DailyPlan } from '../types';

interface HabitState {
  habits: Habit[];
  dailyPlan: DailyPlan[];
  todayTasks: Task[];
  
  // Actions
  toggleHabit: (id: string) => void;
  setPlan: (plan: DailyPlan[]) => void;
  toggleTask: (id: string) => void;
  addHabit: (name: string) => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
  addTask: (title: string) => void;
  deleteTask: (id: string) => void;
}

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: '10 bet kitob o‘qish', streak: 0, completedToday: false, history: [false, true, true, false, true, false, false] },
  { id: '2', name: 'Shakarsiz kun', streak: 2, completedToday: true, history: [true, true, false, false, false, false, false] },
];

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: INITIAL_HABITS,
      dailyPlan: [],
      todayTasks: [],

      toggleHabit: (id) => set((state) => ({
        habits: state.habits.map(h => {
          if (h.id !== id) return h;
          const newCompleted = !h.completedToday;
          
          // Update history for today (index 0)
          const newHistory = [...h.history];
          if (newHistory.length === 0) newHistory.push(newCompleted);
          else newHistory[0] = newCompleted;

          return {
            ...h,
            completedToday: newCompleted,
            streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            history: newHistory
          };
        })
      })),

      setPlan: (plan) => set((state) => {
        // Check if we already have tasks to avoid overwriting user's manual tasks entirely
        // For this version, we append Day 1 tasks if the list is empty, otherwise just save the plan
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
          history: [false, false, false, false, false, false, false] // 7 days empty history
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
      }))
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);