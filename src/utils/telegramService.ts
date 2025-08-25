import { NFT } from '../types';

// Types pour l'API Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramInitData {
  user?: TelegramUser;
  chat_instance?: string;
  chat_type?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

interface TelegramGift {
  id: string;
  name: string;
  image: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owner_id: number;
  transfer_date?: string;
}

// Configuration Telegram
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = import.meta.env.VITE_DEV_MODE === 'true' 
  ? 'http://localhost:3001' 
  : 'https://api.telegram.org/bot';

// Service pour gérer l'intégration Telegram
export class TelegramService {
  private static instance: TelegramService;
  private currentUser: TelegramUser | null = null;
  private userGifts: NFT[] = [];

  private constructor() {}

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  // Initialiser le service avec les données Telegram
  async initialize(): Promise<TelegramUser | null> {
    try {
      // Vérifier si on est dans un Mini App Telegram
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        // Initialiser l'app
        webApp.ready();
        
        // Récupérer les données utilisateur
        if (webApp.initDataUnsafe?.user) {
          this.currentUser = webApp.initDataUnsafe.user;
          
          // Charger automatiquement l'inventaire de l'utilisateur
          await this.loadUserGifts();
          
          return this.currentUser;
        }
      }
      
      // Fallback pour le développement
      console.log('Telegram WebApp not available, using mock data');
      return null;
    } catch (error) {
      console.error('Error initializing Telegram service:', error);
      return null;
    }
  }

  // Récupérer l'utilisateur actuel
  getCurrentUser(): TelegramUser | null {
    return this.currentUser;
  }

  // Charger l'inventaire des gifts de l'utilisateur depuis l'API Telegram
  async loadUserGifts(): Promise<NFT[]> {
    if (!this.currentUser) {
      console.warn('No current user, cannot load gifts');
      return [];
    }

    try {
      // Appel à l'API Telegram pour récupérer les gifts
      const response = await fetch(`${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/getUserGifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.ok && data.result) {
        // Convertir les gifts Telegram en format NFT
        this.userGifts = data.result.map((gift: TelegramGift) => ({
          id: gift.id,
          name: gift.name,
          image: gift.image,
          value: gift.value,
          rarity: gift.rarity,
        }));
        
        return this.userGifts;
      } else {
        console.error('Failed to load user gifts:', data);
        return [];
      }
    } catch (error) {
      console.error('Error loading user gifts:', error);
      
      // Fallback: utiliser des données mock pour le développement
      return this.getMockUserGifts();
    }
  }

  // Récupérer les gifts de l'utilisateur (depuis le cache local)
  getUserGifts(): NFT[] {
    return this.userGifts;
  }

  // Rafraîchir l'inventaire
  async refreshUserGifts(): Promise<NFT[]> {
    return await this.loadUserGifts();
  }

  // Envoyer un gift à un autre utilisateur
  async sendGift(targetUserId: number, giftId: string): Promise<boolean> {
    if (!this.currentUser) {
      console.error('No current user');
      return false;
    }

    try {
      const response = await fetch(`${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/sendGift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_user_id: this.currentUser.id,
          to_user_id: targetUserId,
          gift_id: giftId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.ok) {
        // Rafraîchir l'inventaire après envoi
        await this.loadUserGifts();
        return true;
      } else {
        console.error('Failed to send gift:', data);
        return false;
      }
    } catch (error) {
      console.error('Error sending gift:', error);
      return false;
    }
  }

  // Vérifier si un gift peut être transféré
  async canTransferGift(giftId: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    const gift = this.userGifts.find(g => g.id === giftId);
    if (!gift) {
      return false;
    }

    // Vérifier les règles de transfert (ex: délai minimum, etc.)
    try {
      const response = await fetch(`${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/canTransferGift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.currentUser.id,
          gift_id: giftId,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.ok && data.result?.can_transfer === true;
    } catch (error) {
      console.error('Error checking gift transfer:', error);
      return false;
    }
  }

  // Données mock pour le développement
  private getMockUserGifts(): NFT[] {
    return [
      { id: "user_001", name: "Gift Box #001", image: "🎁", value: 5, rarity: "common" },
      { id: "user_002", name: "Gift Box #002", image: "🎁", value: 8, rarity: "common" },
      { id: "user_003", name: "Gift Box #003", image: "🎁", value: 12, rarity: "rare" },
      { id: "user_004", name: "Gift Box #004", image: "🎁", value: 15, rarity: "rare" },
      { id: "user_005", name: "Gift Box #005", image: "🎁", value: 20, rarity: "epic" },
    ];
  }

  // Obtenir le nom d'affichage de l'utilisateur
  getUserDisplayName(): string {
    if (!this.currentUser) {
      return 'Anonymous';
    }

    if (this.currentUser.username) {
      return `@${this.currentUser.username}`;
    }

    return this.currentUser.first_name + (this.currentUser.last_name ? ` ${this.currentUser.last_name}` : '');
  }

  // Obtenir les initiales de l'utilisateur
  getUserInitials(): string {
    if (!this.currentUser) {
      return 'A';
    }

    const first = this.currentUser.first_name.charAt(0).toUpperCase();
    const last = this.currentUser.last_name ? this.currentUser.last_name.charAt(0).toUpperCase() : '';
    
    return first + last;
  }
}

import React from 'react';

// Hook React pour utiliser le service Telegram
export const useTelegramService = () => {
  const [telegramService] = React.useState(() => TelegramService.getInstance());
  const [user, setUser] = React.useState<TelegramUser | null>(null);
  const [userGifts, setUserGifts] = React.useState<NFT[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeService = async () => {
      setIsLoading(true);
      try {
        const currentUser = await telegramService.initialize();
        setUser(currentUser);
        
        const gifts = await telegramService.loadUserGifts();
        setUserGifts(gifts);
      } catch (error) {
        console.error('Error initializing Telegram service:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, [telegramService]);

  const refreshGifts = React.useCallback(async () => {
    const gifts = await telegramService.refreshUserGifts();
    setUserGifts(gifts);
  }, [telegramService]);

  const sendGift = React.useCallback(async (targetUserId: number, giftId: string) => {
    const success = await telegramService.sendGift(targetUserId, giftId);
    if (success) {
      await refreshGifts();
    }
    return success;
  }, [telegramService, refreshGifts]);

  return {
    user,
    userGifts,
    isLoading,
    refreshGifts,
    sendGift,
    getUserDisplayName: () => telegramService.getUserDisplayName(),
    getUserInitials: () => telegramService.getUserInitials(),
  };
};

// Déclaration des types globaux pour Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        initDataUnsafe?: {
          user?: TelegramUser;
          chat_instance?: string;
          chat_type?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date: number;
          hash: string;
        };
      };
    };
  }
}
