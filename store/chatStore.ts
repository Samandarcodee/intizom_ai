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

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);