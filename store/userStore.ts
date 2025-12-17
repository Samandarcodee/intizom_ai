
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserStatus, UserProfile } from '../types';
import { getTelegramUser, getTelegramLanguage, isTelegramWebApp } from '../utils/telegram';
import { useHabitStore } from './habitStore';
import { useChatStore } from './chatStore';

interface UserState {
  userStatus: UserStatus;
  userProfile: UserProfile;
  telegramId: string | null;
  daysUsed: number;
  showPaywall: boolean;
  isLoading: boolean;
  lastSyncTime: number | null;
  
  // Actions
  checkTrial: () => void;
  upgradeToPremium: () => void;
  closePaywall: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetData: () => void;
  initFromTelegram: () => void;
  saveProfileToServer: () => Promise<void>;
}

// Helper: Clear ALL old localStorage to prevent data mixing
function clearOldUserData(newTelegramId: string): boolean {
  const storedId = localStorage.getItem('current-telegram-id');
  
  if (storedId && storedId !== newTelegramId) {
    console.log(`🧹 Different user detected (${storedId} -> ${newTelegramId}). Clearing ALL old data...`);
    localStorage.clear();
    localStorage.setItem('current-telegram-id', newTelegramId);
    return true; // User changed
  }
  
  localStorage.setItem('current-telegram-id', newTelegramId);
  return false; // Same user
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
      isLoading: true,
      lastSyncTime: null,

      checkTrial: () => {
        const status = get().userStatus;
        const diffTime = Math.abs(Date.now() - status.installDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        set({ daysUsed: diffDays, showPaywall: false });
      },

      upgradeToPremium: () => {
        set((state) => ({ 
          userStatus: { ...state.userStatus, isPremium: true }, 
          showPaywall: false 
        }));
      },

      closePaywall: () => set({ showPaywall: false }),

      updateProfile: async (updates) => {
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates }
        }));
        
        // Auto-save to server
        const telegramId = get().telegramId;
        if (telegramId) {
          try {
            await fetch('/api/user/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ telegramId, ...updates })
            });
            console.log('✅ Profile saved to server');
          } catch (error) {
            console.error('Failed to save profile:', error);
          }
        }
      },

      completeOnboarding: async () => {
        set((state) => ({
          userProfile: { ...state.userProfile, onboardingCompleted: true }
        }));
        
        const telegramId = get().telegramId;
        if (telegramId) {
          try {
            await fetch('/api/user/onboarding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ telegramId, onboardingCompleted: true })
            });
            console.log('✅ Onboarding status saved');
          } catch (error) {
            console.error('Failed to save onboarding status:', error);
          }
        }
      },

      saveProfileToServer: async () => {
        const { telegramId, userProfile } = get();
        if (!telegramId) return;
        
        try {
          await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              telegramId, 
              name: userProfile.name,
              goal: userProfile.goal,
              language: userProfile.language,
              notificationsEnabled: userProfile.notificationsEnabled
            })
          });
          console.log('✅ Full profile saved to server');
        } catch (error) {
          console.error('Failed to save profile:', error);
        }
      },

      resetData: () => {
        localStorage.clear();
        window.location.reload();
      },

      initFromTelegram: async () => {
        set({ isLoading: true });
        
        if (!isTelegramWebApp()) {
          console.log('⚠️ Not running in Telegram WebApp');
          set({ isLoading: false });
          return;
        }

        const tgUser = getTelegramUser();
        if (!tgUser) {
          console.log('⚠️ No Telegram user found');
          set({ isLoading: false });
          return;
        }

        const newTelegramId = String(tgUser.id);
        console.log(`👤 Telegram user: ${newTelegramId} (${tgUser.first_name})`);
        
        // CRITICAL: Clear old user's localStorage if different user!
        const userChanged = clearOldUserData(newTelegramId);

        // Security: Check if data is fresh
        const webApp = window.Telegram?.WebApp;
        if (webApp?.initDataUnsafe?.auth_date) {
          const authDate = webApp.initDataUnsafe.auth_date;
          const now = Math.floor(Date.now() / 1000);
          
          if (now - authDate > 86400) {
            console.warn('⚠️ Telegram data is too old (>24h). Security check failed.');
            set({ isLoading: false });
            return;
          }
        }

        const currentTelegramId = get().telegramId;
        
        // If user changed or first time - reset local state completely
        if (userChanged || !currentTelegramId || currentTelegramId !== newTelegramId) {
          console.log(`🔄 Initializing user: ${newTelegramId}`);
          set({
            userStatus: INITIAL_STATUS,
            userProfile: INITIAL_PROFILE,
            telegramId: newTelegramId,
            daysUsed: 1,
            showPaywall: false
          });
          // Clear all stores for new user
          useHabitStore.getState().syncData([], [], []);
          useChatStore.getState().clearHistory();
        }

        // FETCH FROM SERVER - Server is the source of truth!
        try {
          console.log('🔄 Syncing with server...');
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
            console.log(`✅ Server data received: ${userData.habits?.length || 0} habits, ${userData.tasks?.length || 0} tasks`);
            
            // Sync Habits, Tasks, Plan from SERVER (overwrite local!)
            useHabitStore.getState().syncData(
              userData.habits || [], 
              userData.tasks || [], 
              userData.dailyPlans || []
            );

            // Update User Store with DB data
            set({
              telegramId: newTelegramId,
              isLoading: false,
              lastSyncTime: Date.now(),
              userProfile: { 
                name: userData.name || tgUser.first_name,
                goal: userData.goal || '',
                language: (userData.language as 'uz' | 'ru' | 'en') || 'uz',
                notificationsEnabled: userData.notificationsEnabled ?? true,
                onboardingCompleted: userData.onboardingCompleted ?? false
              },
              userStatus: {
                isPremium: true,
                installDate: new Date(userData.installDate || userData.createdAt || Date.now()).getTime()
              }
            });
            
            // Also fetch chat history
            try {
              const chatResponse = await fetch(`/api/chat/${newTelegramId}`);
              if (chatResponse.ok) {
                const chatHistory = await chatResponse.json();
                if (chatHistory && chatHistory.length > 0) {
                  useChatStore.setState({ 
                    history: chatHistory.map((msg: any) => ({
                      role: msg.role,
                      text: msg.text,
                      timestamp: new Date(msg.timestamp).getTime()
                    }))
                  });
                  console.log(`✅ Chat history loaded: ${chatHistory.length} messages`);
                }
              }
            } catch (chatError) {
              console.error('Failed to load chat history:', chatError);
            }
            
          } else {
            console.error('❌ Server sync failed:', response.status);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('❌ Failed to sync with server:', error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        userStatus: state.userStatus,
        userProfile: state.userProfile,
        telegramId: state.telegramId
      }),
    }
  )
);
