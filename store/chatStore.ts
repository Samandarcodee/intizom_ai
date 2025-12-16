import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatMessage } from '../types';

interface ChatState {
  history: ChatMessage[];
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  clearHistory: () => void;
  loadHistory: (telegramId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      history: [],

      addMessage: async (message) => {
        set((state) => ({ 
          history: [...state.history, message] 
        }));

        // API Call
        try {
          const { getTelegramUser } = await import('../utils/telegram');
          const tgUser = getTelegramUser();
          if (tgUser) {
            await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: tgUser.id,
                role: message.role,
                text: message.text,
                timestamp: message.timestamp
              })
            });
          }
        } catch (error) {
          console.error('Failed to save chat message:', error);
        }
      },

      clearHistory: () => set({ history: [] }),

      loadHistory: async (telegramId: string) => {
        try {
          const response = await fetch(`/api/chat/${telegramId}`);
          if (response.ok) {
            const serverHistory = await response.json();
            set({ history: serverHistory });
          }
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);