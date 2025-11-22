
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserStatus, UserProfile } from '../types';

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
