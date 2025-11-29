// Telegram WebApp utilities

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          chat?: any;
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
          setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        CloudStorage: {
          setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
          getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
          removeItems: (keys: string[], callback?: (error: Error | null, success: boolean) => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }> }, callback?: (id: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean) => void) => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
      };
    };
  }
}

/**
 * Check if app is running in Telegram
 */
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
};

/**
 * Get Telegram WebApp instance
 */
export const getTelegramWebApp = () => {
  if (!isTelegramWebApp()) {
    return null;
  }
  return window.Telegram!.WebApp;
};

/**
 * Initialize Telegram WebApp
 */
export const initTelegramWebApp = () => {
  if (!isTelegramWebApp()) {
    return null;
  }

  const tg = window.Telegram!.WebApp;
  
  // Expand app to full height
  tg.expand();
  
  // Enable closing confirmation
  tg.enableClosingConfirmation();
  
  // Set theme colors
  if (tg.themeParams.bg_color) {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
  }
  if (tg.themeParams.text_color) {
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
  }
  
  // Ready signal
  tg.ready();
  
  return tg;
};

/**
 * Get Telegram user data
 */
export const getTelegramUser = () => {
  if (!isTelegramWebApp()) {
    return null;
  }
  return window.Telegram!.WebApp.initDataUnsafe.user;
};

/**
 * Get Telegram user language
 */
export const getTelegramLanguage = (): 'uz' | 'ru' | 'en' => {
  if (!isTelegramWebApp()) {
    return 'uz'; // default
  }
  
  const user = getTelegramUser();
  if (!user?.language_code) {
    return 'uz';
  }
  
  const lang = user.language_code.toLowerCase();
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('en')) return 'en';
  return 'uz'; // default to Uzbek
};

/**
 * Send data to bot
 */
export const sendDataToBot = (data: string) => {
  if (!isTelegramWebApp()) {
    return;
  }
  window.Telegram!.WebApp.sendData(data);
};

/**
 * Show Telegram alert
 */
export const showTelegramAlert = (message: string, callback?: () => void) => {
  if (!isTelegramWebApp()) {
    alert(message);
    if (callback) callback();
    return;
  }
  window.Telegram!.WebApp.showAlert(message, callback);
};

/**
 * Show Telegram confirm
 */
export const showTelegramConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
  if (!isTelegramWebApp()) {
    const confirmed = confirm(message);
    if (callback) callback(confirmed);
    return;
  }
  window.Telegram!.WebApp.showConfirm(message, callback);
};

/**
 * Haptic feedback
 */
export const hapticFeedback = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (isTelegramWebApp()) {
      window.Telegram!.WebApp.HapticFeedback.impactOccurred(style);
    }
  },
  notification: (type: 'error' | 'success' | 'warning' = 'success') => {
    if (isTelegramWebApp()) {
      window.Telegram!.WebApp.HapticFeedback.notificationOccurred(type);
    }
  },
  selection: () => {
    if (isTelegramWebApp()) {
      window.Telegram!.WebApp.HapticFeedback.selectionChanged();
    }
  }
};

