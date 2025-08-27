import { useState, useEffect } from 'react';

interface Gift {
  id: string;
  collectible_id: string;
  username: string;
  display_name: string;
  received_at: string;
}

interface InventoryResponse {
  success: boolean;
  user: {
    telegram_id: string;
    username: string;
  };
  inventory: Gift[];
  count: number;
  timestamp: string;
  security: {
    authenticated: boolean;
    method: string;
    user_verified: boolean;
  };
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎣 Hook useInventory: Début de la récupération');
      
      // Vérifier que nous sommes dans Telegram
      if (!window.Telegram?.WebApp?.initData) {
        throw new Error('Mini App Telegram non détectée');
      }

      const initData = window.Telegram.WebApp.initData;
      console.log('🔐 InitData Telegram détectée:', initData);

      const response = await fetch('/api/telegram-inventory-secure', {
        method: 'GET',
        headers: {
          'X-Telegram-Init-Data': initData,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Réponse API reçue:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: InventoryResponse = await response.json();
      console.log('✅ Données inventaire reçues:', data);

      if (data.success) {
        setInventory(data.inventory);
        console.log(`🎁 Inventaire mis à jour: ${data.inventory.length} gifts`);
      } else {
        throw new Error('Réponse API invalide');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur récupération inventaire:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInventory = () => {
    console.log('🔄 Rafraîchissement manuel de l\'inventaire');
    fetchInventory();
  };

  useEffect(() => {
    console.log('🎣 Hook useInventory: Initialisation');
    fetchInventory();
  }, []);

  return {
    inventory,
    isLoading,
    error,
    refreshInventory,
  };
};
