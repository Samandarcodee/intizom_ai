import React from 'react';
import ReactDOM from 'react-dom/client';

// CRITICAL: Clear localStorage for different users BEFORE App loads
// This prevents data mixing between Telegram users
function initializeUserStorage() {
  try {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!tgUser?.id) {
      console.log('⚠️ No Telegram user detected');
      return;
    }
    
    const newTelegramId = String(tgUser.id);
    const storedId = localStorage.getItem('current-telegram-id');
    
    if (storedId && storedId !== newTelegramId) {
      console.log(`🧹 Different user detected (${storedId} -> ${newTelegramId}). Clearing ALL localStorage...`);
      localStorage.clear();
    }
    
    localStorage.setItem('current-telegram-id', newTelegramId);
    console.log(`✅ User storage initialized: ${newTelegramId}`);
  } catch (e) {
    console.error('Error initializing storage:', e);
  }
}

// Run storage initialization synchronously
initializeUserStorage();

// Dynamic import to ensure localStorage is cleared BEFORE Zustand hydrates
async function main() {
  const { default: App } = await import('./App');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

main();