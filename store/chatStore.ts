import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatMessage } from '../types';

interface ChatState {
  history: ChatMessage[];
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      history: [],

      addMessage: (message) => set((state) => ({ 
        history: [...state.history, message] 
      })),

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);