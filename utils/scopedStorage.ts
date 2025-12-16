import { createJSONStorage } from 'zustand/middleware';

// Zustand persist uses a single storage key per store name.
// In Telegram WebApp, multiple Telegram accounts on the same device often share the same WebView storage,
// so we must scope persisted state by Telegram user id to avoid cross-user data mixing.

function getTelegramScope(): string {
  if (typeof window === 'undefined') return 'server';
  const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  return id ? `tg:${id}` : 'anon';
}

function scopedKey(name: string): string {
  return `${name}::${getTelegramScope()}`;
}

/**
 * Create a JSON storage that automatically scopes keys per Telegram user.
 * Safe fallback to "anon" when not running inside Telegram.
 */
export function createTelegramScopedJSONStorage() {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      try {
        return localStorage.getItem(scopedKey(name));
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(scopedKey(name), value);
      } catch {
        // ignore storage write errors
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(scopedKey(name));
      } catch {
        // ignore
      }
    },
  }));
}

