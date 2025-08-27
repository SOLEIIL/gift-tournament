import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';

export interface InventoryItem {
  id: number;
  gift_id: string;
  gift_name: string;
  gift_value: number;
  collectible_model: string;
  collectible_backdrop: string;
  collectible_symbol: string;
  status: string;
  received_at: string;
  withdrawn_at: string | null;
}

export interface UserInventory {
  success: boolean;
  telegramId: string;
  user: {
    id: number;
    telegram_id: string;
    username: string;
  };
  inventory: InventoryItem[];
  count: number;
  timestamp: string;
}

export const useInventory = () => {
  const { webApp, user, isTelegram, isReady } = useTelegram();
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'inventaire de l'utilisateur connecté
  const fetchInventory = useCallback(async () => {
    if (!isTelegram || !webApp || !isReady) {
      console.log('⚠️ Mini App Telegram non prête');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('📱 Récupération de l\'inventaire...');
      
      // Récupérer les données d'initialisation Telegram selon la documentation officielle
      const initData = webApp.initData;
      
      if (!initData) {
        throw new Error('Données d\'initialisation Telegram manquantes');
      }

      console.log('🔐 Données d\'initialisation récupérées:', initData);
      console.log('👤 Utilisateur actuel:', user);

      // Appeler l'API avec les données d'authentification
      const response = await fetch('/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData
        }
      });

      console.log('📡 Réponse API reçue:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data: UserInventory = await response.json();
      console.log('📊 Données inventaire reçues:', data);
      
      if (data.success) {
        setInventory(data);
        console.log(`✅ Inventaire récupéré: ${data.count} gifts`);
      } else {
        throw new Error('Échec de la récupération de l\'inventaire');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la récupération de l\'inventaire:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isTelegram, webApp, isReady, user]);

  // Récupérer automatiquement l'inventaire quand la Mini App est prête
  useEffect(() => {
    if (isReady && isTelegram) {
      console.log('🚀 Mini App prête, récupération de l\'inventaire...');
      fetchInventory();
    }
  }, [isReady, isTelegram, fetchInventory]);

  // Rafraîchir l'inventaire manuellement
  const refreshInventory = useCallback(() => {
    console.log('🔄 Rafraîchissement manuel de l\'inventaire...');
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    isLoading,
    error,
    refreshInventory,
    fetchInventory
  };
};
