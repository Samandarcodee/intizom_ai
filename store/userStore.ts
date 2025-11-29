
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserStatus, UserProfile } from '../types';
import { getTelegramUser, getTelegramLanguage, isTelegramWebApp } from '../utils/telegram';

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

      initFromTelegram: () => {
        if (!isTelegramWebApp()) {
          return;
        }

        const tgUser = getTelegramUser();
        if (!tgUser) {
          return;
        }

        const currentProfile = get().userProfile;
        const tgLanguage = getTelegramLanguage();
        
        // Update profile with Telegram data if not already set
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
