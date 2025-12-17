
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserStatus, UserProfile } from '../types';
import { getTelegramUser, getTelegramLanguage, isTelegramWebApp } from '../utils/telegram';
import { useHabitStore } from './habitStore';
import { useChatStore } from './chatStore';
import { createUserStorage, cleanupOldStorage, clearAllAppStorage } from '../utils/userStorage';

interface UserState {
  userStatus: UserStatus;
  userProfile: UserProfile;
  telegramId: string | null;
  daysUsed: number;
  showPaywall: boolean;
  
  // Actions
  checkTrial: () => void;
  upgradeToPremium: () => void;
  closePaywall: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetData: () => void;
  initFromTelegram: () => void;
}

const INITIAL_STATUS: UserStatus = { isPremium: true, installDate: Date.now() };
const INITIAL_PROFILE: UserProfile = { 
  name: 'Foydalanuvchi', 
  goal: '', 
  language: 'uz',
  notificationsEnabled: true,
  onboardingCompleted: false
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userStatus: INITIAL_STATUS,
      userProfile: INITIAL_PROFILE,
      telegramId: null,
      daysUsed: 1,
      showPaywall: false,

      checkTrial: () => {
        const status = get().userStatus;
        const diffTime = Math.abs(Date.now() - status.installDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Premium is always enabled - no paywall needed
        set({ daysUsed: diffDays, showPaywall: false });
      },

      upgradeToPremium: () => {
        set((state) => ({ 
          userStatus: { ...state.userStatus, isPremium: true }, 
          showPaywall: false 
        }));
      },

      closePaywall: () => set({ showPaywall: false }),

      updateProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
      })),

      completeOnboarding: async () => {
        set((state) => ({
          userProfile: { ...state.userProfile, onboardingCompleted: true }
        }));
        
        // Save to server
        const telegramId = get().telegramId;
        if (telegramId) {
          try {
            await fetch('/api/user/onboarding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ telegramId, onboardingCompleted: true })
            });
          } catch (error) {
            console.error('Failed to save onboarding status:', error);
          }
        }
      },

      resetData: () => {
        localStorage.clear();
        window.location.reload();
      },

      initFromTelegram: async () => {
        if (!isTelegramWebApp()) {
          return;
        }

        const tgUser = getTelegramUser();
        if (!tgUser) {
          return;
        }

        // Security: Check if data is fresh (prevent shared link issues)
        // If users share a link with #tgWebAppData, others might log in as them.
        // Telegram links expire, but we can enforce it strictly.
        const webApp = window.Telegram?.WebApp;
        if (webApp?.initDataUnsafe?.auth_date) {
          const authDate = webApp.initDataUnsafe.auth_date;
          const now = Math.floor(Date.now() / 1000);
          
          // If data is older than 24 hours
          if (now - authDate > 86400) {
            console.warn('⚠️ Telegram data is too old. Potential shared link usage.');
            return;
          }
        }

        const currentTelegramId = get().telegramId;
        const newTelegramId = String(tgUser.id);
        
        // CRITICAL: Clean up old generic storage keys (from before user isolation fix)
        cleanupOldStorage();
        
        // Check if different user - clear ALL data for clean slate!
        if (currentTelegramId && currentTelegramId !== newTelegramId) {
          console.log(`🔄 User changed from ${currentTelegramId} to ${newTelegramId}, clearing ALL old data...`);
          
          // Clear ALL app storage to prevent data leaks
          clearAllAppStorage();
          
          // Reset to initial state for new user
          set({
            userStatus: INITIAL_STATUS,
            userProfile: INITIAL_PROFILE,
            telegramId: newTelegramId,
            daysUsed: 1,
            showPaywall: false
          });
          
          // Also clear habit store and chat store
          useHabitStore.getState().syncData([], [], []);
          useChatStore.getState().clearHistory();
        } else {
          // Set telegramId if not set
          set({ telegramId: newTelegramId });
        }

        const currentProfile = get().userProfile;
        const tgLanguage = getTelegramLanguage();
        
        // Update profile with Telegram data
        const updates: Partial<UserProfile> = {};
        
        if (!currentProfile.name || currentProfile.name === 'Foydalanuvchi') {
          updates.name = tgUser.first_name + (tgUser.last_name ? ` ${tgUser.last_name}` : '');
        }
        
        if (!currentProfile.language || currentProfile.language === 'uz') {
          updates.language = tgLanguage;
        }

        // If user is premium in Telegram, upgrade to premium
        if (tgUser.is_premium) {
          set((state) => ({
            userStatus: { ...state.userStatus, isPremium: true },
            userProfile: { ...state.userProfile, ...updates }
          }));
        } else {
          set((state) => ({
            userProfile: { ...state.userProfile, ...updates }
          }));
        }

        // SYNC WITH DATABASE (Server) - Server data is the source of truth!
        try {
          const response = await fetch('/api/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: tgUser.id,
              firstName: tgUser.first_name,
              lastName: tgUser.last_name,
              username: tgUser.username,
              languageCode: tgUser.language_code
            })
          });

          if (response.ok) {
            const userData = await response.json();
            
            // Sync Habits, Tasks, Plan from SERVER (overwrite local!)
            useHabitStore.getState().syncData(
              userData.habits || [], 
              userData.tasks || [], 
              userData.dailyPlans || []
            );
            
            // Also sync chat history from server
            try {
              const chatResponse = await fetch(`/api/chat/${tgUser.id}`);
              if (chatResponse.ok) {
                const chatHistory = await chatResponse.json();
                if (Array.isArray(chatHistory) && chatHistory.length > 0) {
                  // Convert server format to local format
                  const messages = chatHistory.map((msg: any) => ({
                    role: msg.role as 'user' | 'model',
                    text: msg.text,
                    timestamp: new Date(msg.timestamp).getTime()
                  }));
                  useChatStore.setState({ history: messages });
                }
              }
            } catch (chatError) {
              console.error('Failed to sync chat history:', chatError);
            }

            // Update User Store with DB data - Premium always enabled
            set((state) => ({
              telegramId: newTelegramId,
              userProfile: { 
                ...state.userProfile, 
                name: userData.name || state.userProfile.name,
                goal: userData.goal || state.userProfile.goal,
                language: (userData.language as any) || state.userProfile.language,
                onboardingCompleted: userData.onboardingCompleted ?? state.userProfile.onboardingCompleted
              },
              userStatus: {
                ...state.userStatus,
                isPremium: true // Premium always enabled for all users
              }
            }));
          }
        } catch (error) {
          console.error('Failed to sync with server:', error);
        }
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => createUserStorage('user-storage')),
      partialize: (state) => ({ 
        userStatus: state.userStatus,
        userProfile: state.userProfile,
        telegramId: state.telegramId
      }),
    }
  )
);
