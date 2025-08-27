import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';

interface InventoryItem {
  id: string;
  collectible_id: string;
  username: string;
  display_name: string;
  received_at: string;
}

interface SecureInventoryResponse {
  success: boolean;
  user: {
    telegram_id: string;
    username: string;
  };
  inventory: InventoryItem[];
  count: number;
  timestamp: string;
  security: {
    authenticated: boolean;
    method: string;
    user_verified: boolean;
  };
}

export const useSecureInventory = () => {
  const { webApp, user, isTelegram, isReady } = useTelegram();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fonction pour récupérer l'inventaire sécurisé
  const fetchSecureInventory = useCallback(async () => {
    if (!isTelegram || !webApp || !user) {
      setError('Mini App Telegram requise');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Récupérer l'InitData depuis Telegram
      const initData = webApp.initData;
      
      if (!initData) {
        throw new Error('InitData Telegram non disponible');
      }

      console.log('🔐 Récupération inventaire sécurisé...');

      // Appel à l'API sécurisée
      const response = await fetch('/api/telegram-inventory-secure', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const data: SecureInventoryResponse = await response.json();

      if (data.success) {
        setInventory(data.inventory);
        setLastUpdate(new Date());
        console.log(`✅ Inventaire sécurisé récupéré: ${data.count} gifts`);
        
        // Vérification de sécurité
        if (!data.security.authenticated || !data.security.user_verified) {
          console.warn('⚠️ Problème de sécurité détecté');
        }
      } else {
        throw new Error('Réponse invalide de l\'API');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur récupération inventaire sécurisé:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isTelegram, webApp, user]);

  // Fonction pour rafraîchir l'inventaire
  const refreshInventory = useCallback(() => {
    fetchSecureInventory();
  }, [fetchSecureInventory]);

  // Charger l'inventaire au démarrage
  useEffect(() => {
    if (isReady && isTelegram && user) {
      fetchSecureInventory();
    }
  }, [isReady, isTelegram, user, fetchSecureInventory]);

  // Fonction pour formater l'affichage des gifts
  const formatGiftDisplay = useCallback((item: InventoryItem) => {
    // Formatage selon vos préférences (GiftName #1)
    const giftName = item.collectible_id.replace(/([A-Z])/g, ' $1').trim();
    return `${giftName} #${item.id}`;
  }, []);

  // Fonction pour obtenir les statistiques
  const getInventoryStats = useCallback(() => {
    return {
      total: inventory.length,
      byType: inventory.reduce((acc, item) => {
        const type = item.collectible_id.split('-')[0];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdate
    };
  }, [inventory, lastUpdate]);

  return {
    // Données
    inventory,
    user,
    
    // État
    isLoading,
    error,
    lastUpdate,
    
    // Actions
    fetchSecureInventory,
    refreshInventory,
    
    // Utilitaires
    formatGiftDisplay,
    getInventoryStats,
    
    // Sécurité
    isAuthenticated: isTelegram && !!webApp?.initData,
    securityStatus: {
      isTelegram,
      hasInitData: !!webApp?.initData,
      userVerified: !!user
    }
  };
};
