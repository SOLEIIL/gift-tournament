import { useEffect, useState } from 'react';
import { TelegramWebApp, TelegramUser, ThemeParams } from '../types/telegram';

export interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  themeParams: ThemeParams;
  isTelegram: boolean;
  isReady: boolean;
  initTelegram: () => void;
  expandApp: () => void;
  closeApp: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  hapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

export const useTelegram = (): UseTelegramReturn => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [themeParams, setThemeParams] = useState<ThemeParams>({});
  const [isTelegram, setIsTelegram] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const initTelegram = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      setIsTelegram(true);

      // Initialize the Web App
      tg.ready();
      tg.expand();

      // Set user data
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }

      // Set theme parameters
      setThemeParams(tg.themeParams);

      // Set up event listeners
      tg.onEvent('themeChanged', () => {
        setThemeParams(tg.themeParams);
      });

      tg.onEvent('viewportChanged', () => {
        // Handle viewport changes if needed
      });

      setIsReady(true);
    } else {
      // Not running in Telegram - set up mock data for development
      console.log('Not running in Telegram - using mock data');
      setIsTelegram(false);
      setUser({
        id: 123456789,
        first_name: 'Test User',
        username: 'testuser',
        is_premium: false
      });
      setThemeParams({
        bg_color: '#1a1a1a',
        text_color: '#ffffff',
        button_color: '#2481cc',
        button_text_color: '#ffffff'
      });
      setIsReady(true);
    }
  };

  const expandApp = () => {
    if (webApp) {
      webApp.expand();
    }
  };

  const closeApp = () => {
    if (webApp) {
      webApp.close();
    }
  };

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed: boolean) => {
          resolve(confirmed);
        });
      } else {
        const confirmed = window.confirm(message);
        resolve(confirmed);
      }
    });
  };

  const hapticFeedback = {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      if (webApp) {
        webApp.HapticFeedback.impactOccurred(style);
      }
    },
    notificationOccurred: (type: 'error' | 'success' | 'warning') => {
      if (webApp) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    },
    selectionChanged: () => {
      if (webApp) {
        webApp.HapticFeedback.selectionChanged();
      }
    }
  };

  useEffect(() => {
    initTelegram();
  }, []);

  return {
    webApp,
    user,
    themeParams,
    isTelegram,
    isReady,
    initTelegram,
    expandApp,
    closeApp,
    showAlert,
    showConfirm,
    hapticFeedback
  };
};
