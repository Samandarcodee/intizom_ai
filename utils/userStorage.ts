// User-specific storage utility to isolate data between different Telegram users

import { getTelegramUser } from './telegram';

// Get current user's telegramId
export const getCurrentTelegramId = (): string | null => {
  const tgUser = getTelegramUser();
  return tgUser ? String(tgUser.id) : null;
};

// Clean up old generic storage keys (from before user isolation fix)
export const cleanupOldStorage = () => {
  const oldKeys = ['user-storage', 'habit-storage', 'chat-storage'];
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🧹 Removing old generic storage: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

// Clean up storage for a specific user (when switching users)
export const cleanupUserStorage = (telegramId: string) => {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(`-${telegramId}`)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`🧹 Removing user storage: ${key}`);
    localStorage.removeItem(key);
  });
};

// Check if storage belongs to current user - if not, clear it
export const validateStorageOwnership = (newTelegramId: string): boolean => {
  // Check all stored telegramIds in different storage keys
  const storageKeys = ['user-storage', 'habit-storage', 'chat-storage'];
  
  for (const baseKey of storageKeys) {
    // Check for old generic key
    const oldData = localStorage.getItem(baseKey);
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        const storedTelegramId = parsed?.state?.telegramId;
        
        if (storedTelegramId && String(storedTelegramId) !== String(newTelegramId)) {
          console.log(`⚠️ Storage mismatch! Stored: ${storedTelegramId}, Current: ${newTelegramId}`);
          return false;
        }
      } catch (e) {
        // Invalid JSON, will be cleaned
      }
    }
    
    // Also check for any user-specific key that's not for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(baseKey + '-') && !key.endsWith(`-${newTelegramId}`)) {
        console.log(`⚠️ Found storage for different user: ${key}`);
        return false;
      }
    }
  }
  
  return true;
};

// Clear ALL app-related storage (for clean slate)
export const clearAllAppStorage = () => {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('user-storage') || 
      key.startsWith('habit-storage') || 
      key.startsWith('chat-storage')
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`🧹 Clearing storage: ${key}`);
    localStorage.removeItem(key);
  });
};

// Create user-specific storage key
export const getUserStorageKey = (baseKey: string, telegramId: string): string => {
  return `${baseKey}-${telegramId}`;
};

// Storage wrapper for user-specific data
export const createUserStorage = (baseKey: string) => {
  return {
    getItem: (name: string): string | null => {
      const telegramId = getCurrentTelegramId();
      
      // If no telegram ID yet, return null (don't use cached data)
      if (!telegramId) {
        return null;
      }
      
      const userKey = getUserStorageKey(baseKey, telegramId);
      return localStorage.getItem(userKey);
    },
    
    setItem: (name: string, value: string): void => {
      const telegramId = getCurrentTelegramId();
      
      // Don't save if no telegram ID
      if (!telegramId) {
        console.warn(`⚠️ Cannot save to ${baseKey}: No telegramId`);
        return;
      }
      
      const userKey = getUserStorageKey(baseKey, telegramId);
      localStorage.setItem(userKey, value);
    },
    
    removeItem: (name: string): void => {
      const telegramId = getCurrentTelegramId();
      
      if (!telegramId) {
        return;
      }
      
      const userKey = getUserStorageKey(baseKey, telegramId);
      localStorage.removeItem(userKey);
    }
  };
};
