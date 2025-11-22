
import { create } from 'zustand';
import { ToastMessage, ToastType } from '../types';

interface UIState {
  toasts: ToastMessage[];
  isLoading: boolean;
  isFocusModeOpen: boolean;

  // Actions
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setFocusModeOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isLoading: false,
  isFocusModeOpen: false,

  addToast: (message, type) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  setFocusModeOpen: (open) => set({ isFocusModeOpen: open })
}));
