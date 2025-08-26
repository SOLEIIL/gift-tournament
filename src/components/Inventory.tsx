import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface Gift {
  id: string;
  name: string;
  value: number;
  type: string;
  collectibleId: string;
  collectibleModel: string;
  collectibleBackdrop: string;
  collectibleSymbol: string;
  receivedAt: string;
  status: string;
}

interface UserInventory {
  userId: string;
  username: string;
  totalGifts: number;
  totalValue: number;
  gifts: Gift[];
}

interface InventoryProps {
  onPageChange: (page: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn') => void;
  currentPage: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn';
}

export const Inventory: React.FC<InventoryProps> = ({
  onPageChange,
  currentPage
}) => {
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Charger l'inventaire réel depuis l'API
  const loadInventory = async () => {
    try {
      setLoading(true);
      console.log('🔍 Chargement de l\'inventaire réel...');
      
      const response = await fetch('/api/real-inventory');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Données inventaire reçues:', data);
      
      if (data.success && data.data.users.length > 0) {
        // Prendre le premier utilisateur (pour l'instant)
        setInventory(data.data.users[0]);
        setLastRefresh(new Date());
      } else {
        setInventory(null);
      }
      
    } catch (err) {
      console.error('❌ Erreur chargement inventaire:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
    
    // PAS DE REFRESH AUTOMATIQUE - SEULEMENT AU MONTAGE
    // const interval = setInterval(loadInventory, 3000);
    // return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ton border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Chargement de l'inventaire...</div>
          <div className="text-gray-400 text-sm">Connexion au détecteur de gifts</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">❌</span>
          </div>
          <div className="text-white text-lg mb-2">Erreur de chargement</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            variant="ton"
            size="lg"
          >
            🔄 Recharger
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">🎁 Mon Inventaire</h1>
        {inventory ? (
          <>
            <div className="text-lg text-yellow-400 font-semibold">
              Total Value: {inventory.totalGifts} TON
            </div>
            <div className="text-sm text-gray-400">
              {inventory.totalGifts} gift{inventory.totalGifts !== 1 ? 's' : ''} en collection
            </div>
            <div className="text-xs text-blue-400 mt-1">
              Utilisateur: @{inventory.username} ({inventory.userId})
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-400">Aucun inventaire trouvé</div>
        )}
        
        {/* Bouton de refresh manuel */}
        <div className="mt-3">
          <Button
            onClick={loadInventory}
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={loading}
          >
            {loading ? '🔄' : '🔄'} Actualiser
          </Button>
          <div className="text-xs text-gray-500 mt-1">
            Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="mb-6">
        {inventory && inventory.gifts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {inventory.gifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-card border border-border rounded-lg p-4 text-center hover:border-ton/50 transition-colors"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-2xl">🎁</span>
                </div>
                <div className="text-white font-semibold mb-1">{gift.name}</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {gift.collectibleModel} • {gift.collectibleBackdrop}
                </div>
                <div className="text-ton font-bold text-lg">{gift.value} TON</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {gift.collectibleSymbol} • {gift.status}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(gift.receivedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-muted-foreground">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Inventaire Vide</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de gifts. Envoyez un gift à @WxyzCrypto pour commencer !
            </p>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="text-blue-400 text-sm font-semibold mb-2">📱 Comment recevoir des gifts :</div>
              <div className="text-blue-300 text-xs space-y-1">
                <div>1. Ouvrez Telegram</div>
                <div>2. Contactez @WxyzCrypto</div>
                <div>3. Envoyez un gift Telegram (25+ stars)</div>
                <div>4. Il apparaîtra ici automatiquement !</div>
              </div>
            </div>
            <Button
              onClick={() => onPageChange('pvp')}
              variant="ton"
              size="lg"
              className="w-full max-w-xs"
            >
              🎮 Commencer à Jouer
            </Button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {inventory && inventory.gifts.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">📊 Statistiques de Collection</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ton">{inventory.totalGifts}</div>
              <div className="text-sm text-muted-foreground">Total Gifts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{inventory.totalValue}</div>
              <div className="text-sm text-muted-foreground">Valeur Totale (TON)</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* PvP */}
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onPageChange('pvp')}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xl">⚔️</span>
            </div>
            <span className={`text-xs ${currentPage === 'pvp' ? 'text-ton' : 'text-muted-foreground'}`}>
              PvP
            </span>
          </div>

          {/* Rolls */}
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onPageChange('rolls')}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xl">🎲</span>
            </div>
            <span className={`text-xs ${currentPage === 'rolls' ? 'text-ton' : 'text-muted-foreground'}`}>
              Rolls
            </span>
          </div>

          {/* Inventory */}
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onPageChange('inventory')}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <span className={`text-xs ${currentPage === 'inventory' ? 'text-ton' : 'text-muted-foreground'}`}>
              Inventory
            </span>
          </div>

          {/* Shop */}
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onPageChange('shop')}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xl">🛒</span>
            </div>
            <span className={`text-xs ${currentPage === 'shop' ? 'text-ton' : 'text-muted-foreground'}`}>
              Shop
            </span>
          </div>

          {/* Earn */}
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onPageChange('earn')}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <span className={`text-xs ${currentPage === 'earn' ? 'text-ton' : 'text-muted-foreground'}`}>
              Earn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
