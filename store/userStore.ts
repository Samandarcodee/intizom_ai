
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserStatus, UserProfile } from '../types';
import { getTelegramUser, getTelegramLanguage, isTelegramWebApp } from '../utils/telegram';
import { useHabitStore } from './habitStore';

interface UserState {
  userStatus: UserStatus;
  userProfile: UserProfile;
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

const INITIAL_STATUS: UserStatus = { isPremium: false, installDate: Date.now() };
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
      daysUsed: 1,
      showPaywall: false,

      checkTrial: () => {
        const status = get().userStatus;
        const diffTime = Math.abs(Date.now() - status.installDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const isExpired = !status.isPremium && diffDays > 7;

        set({ daysUsed: diffDays, showPaywall: isExpired });
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

      completeOnboarding: () => set((state) => ({
        userProfile: { ...state.userProfile, onboardingCompleted: true }
      })),

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

        const currentProfile = get().userProfile;
        
        // CHECK IF USER CHANGED (Critical for shared devices/accounts)
        if (currentProfile.telegramId && currentProfile.telegramId !== tgUser.id) {
           console.log('User changed, resetting data...');
           localStorage.clear();
           window.location.reload();
           return;
        }

        const tgLanguage = getTelegramLanguage();
        
        // Update profile with Telegram data if not already set
        const updates: Partial<UserProfile> = {
          telegramId: tgUser.id
        };
        
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

        // SYNC WITH DATABASE (Server)
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
            
            // Sync Habits, Tasks, Plan to HabitStore
            // IMPORTANT: Always use server data as source of truth
            useHabitStore.getState().syncData(
              userData.habits || [], 
              userData.tasks || [], 
              userData.dailyPlans || []
            );

            // Update User Store with DB data
            set((state) => ({
              userProfile: { 
                ...state.userProfile, 
                name: userData.name || state.userProfile.name,
                goal: userData.goal || state.userProfile.goal,
                language: (userData.language as any) || state.userProfile.language,
                telegramId: tgUser.id // Ensure ID is set
              },
              userStatus: {
                ...state.userStatus,
                isPremium: userData.isPremium || state.userStatus.isPremium
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        userStatus: state.userStatus,
        userProfile: state.userProfile 
      }),
    }
  )
);
