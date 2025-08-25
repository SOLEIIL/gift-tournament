import React from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramGift {
  id: string;
  name: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image?: string;
}

// Types Vite pour les variables d'environnement
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_TELEGRAM_BOT_TOKEN: string;
      readonly VITE_API_BASE_URL: string;
      readonly VITE_DEV_MODE: string;
    };
  }
}

class TelegramService {
  private static instance: TelegramService;
  private user: TelegramUser | null = null;
  private userGifts: TelegramGift[] = [];

  private constructor() {}

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Détecter Telegram WebApp
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const webApp = (window as any).Telegram.WebApp;
        this.user = {
          id: webApp.initDataUnsafe?.user?.id || 123456789,
          first_name: webApp.initDataUnsafe?.user?.first_name || 'Test User',
          last_name: webApp.initDataUnsafe?.user?.last_name,
          username: webApp.initDataUnsafe?.user?.username,
          language_code: webApp.initDataUnsafe?.user?.language_code
        };
        
        // Charger les gifts de l'utilisateur
        await this.loadUserGifts();
      } else {
        // Mode développement - utiliser des données mock
        this.user = {
          id: 123456789,
          first_name: 'Test User',
          username: 'testuser'
        };
        this.userGifts = this.getMockUserGifts();
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation Telegram:', error);
      // Fallback vers les données mock
      this.user = {
        id: 123456789,
        first_name: 'Test User',
        username: 'testuser'
      };
      this.userGifts = this.getMockUserGifts();
    }
  }

  private async loadUserGifts(): Promise<void> {
    try {
      const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const TELEGRAM_API_BASE = import.meta.env.VITE_DEV_MODE === 'true'
        ? 'http://localhost:3001'
        : 'https://api.telegram.org/bot';

      if (!TELEGRAM_BOT_TOKEN) {
        console.warn('Token Telegram non configuré, utilisation des données mock');
        this.userGifts = this.getMockUserGifts();
        return;
      }

      const response = await fetch(`${TELEGRAM_API_BASE}/bot:${TELEGRAM_BOT_TOKEN}/getUserGifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.user?.id || 123456789
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.userGifts = data.gifts || [];
      } else {
        console.warn('Erreur lors du chargement des gifts, utilisation des données mock');
        this.userGifts = this.getMockUserGifts();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des gifts:', error);
      this.userGifts = this.getMockUserGifts();
    }
  }

  async sendGift(giftId: string, toUserId: number): Promise<boolean> {
    try {
      const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const TELEGRAM_API_BASE = import.meta.env.VITE_DEV_MODE === 'true'
        ? 'http://localhost:3001'
        : 'https://api.telegram.org/bot';

      const response = await fetch(`${TELEGRAM_API_BASE}/bot:${TELEGRAM_BOT_TOKEN}/sendGift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_user_id: this.user?.id,
          to_user_id: toUserId,
          gift_id: giftId
        })
      });

      if (response.ok) {
        // Rafraîchir la liste des gifts
        await this.loadUserGifts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du gift:', error);
      return false;
    }
  }

  async canTransferGift(giftId: string): Promise<boolean> {
    try {
      const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const TELEGRAM_API_BASE = import.meta.env.VITE_DEV_MODE === 'true'
        ? 'http://localhost:3001'
        : 'https://api.telegram.org/bot';

      const response = await fetch(`${TELEGRAM_API_BASE}/bot:${TELEGRAM_BOT_TOKEN}/canTransferGift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.user?.id,
          gift_id: giftId
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.can_transfer || false;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du transfert:', error);
      return false;
    }
  }

  private getMockUserGifts(): TelegramGift[] {
    return [
      {
        id: 'gift_001',
        name: 'Golden NFT',
        value: 150,
        rarity: 'legendary',
        image: 'https://via.placeholder.com/150x150/FFD700/000000?text=Golden+NFT'
      },
      {
        id: 'gift_002',
        name: 'Silver Coin',
        value: 75,
        rarity: 'epic',
        image: 'https://via.placeholder.com/150x150/C0C0C0/000000?text=Silver+Coin'
      },
      {
        id: 'gift_003',
        name: 'Bronze Medal',
        value: 45,
        rarity: 'rare',
        image: 'https://via.placeholder.com/150x150/CD7F32/000000?text=Bronze+Medal'
      },
      {
        id: 'gift_004',
        name: 'Iron Token',
        value: 25,
        rarity: 'common',
        image: 'https://via.placeholder.com/150x150/808080/000000?text=Iron+Token'
      },
      {
        id: 'gift_005',
        name: 'Wooden Charm',
        value: 15,
        rarity: 'common',
        image: 'https://via.placeholder.com/150x150/8B4513/000000?text=Wooden+Charm'
      }
    ];
  }

  getUserDisplayName(): string {
    if (!this.user) return 'Unknown User';
    return this.user.last_name 
      ? `${this.user.first_name} ${this.user.last_name}`
      : this.user.first_name;
  }

  getUserInitials(): string {
    if (!this.user) return 'U';
    return this.user.first_name.charAt(0).toUpperCase() + 
           (this.user.last_name?.charAt(0).toUpperCase() || '');
  }

  // Getters publics
  get currentUser(): TelegramUser | null {
    return this.user;
  }

  get currentUserGifts(): TelegramGift[] {
    return [...this.userGifts];
  }

  async refreshGifts(): Promise<void> {
    await this.loadUserGifts();
  }
}

// Hook React pour utiliser le service
export function useTelegramService() {
  const [service] = React.useState(() => TelegramService.getInstance());
  const [user, setUser] = React.useState(service.currentUser);
  const [userGifts, setUserGifts] = React.useState(service.currentUserGifts);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await service.initialize();
      setUser(service.currentUser);
      setUserGifts(service.currentUserGifts);
      setIsLoading(false);
    };

    init();
  }, [service]);

  const refreshGifts = React.useCallback(async () => {
    await service.refreshGifts();
    setUserGifts(service.currentUserGifts);
  }, [service]);

  return {
    user,
    userGifts,
    isLoading,
    refreshGifts,
    sendGift: service.sendGift.bind(service),
    canTransferGift: service.canTransferGift.bind(service),
    getUserDisplayName: service.getUserDisplayName.bind(service),
    getUserInitials: service.getUserInitials.bind(service)
  };
}
