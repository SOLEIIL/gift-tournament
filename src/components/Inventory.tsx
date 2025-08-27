import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { useTelegram } from '../hooks/useTelegram';

export const Inventory: React.FC = () => {
  const { inventory, isLoading, error, refreshInventory } = useInventory();
  const { user, isTelegram } = useTelegram();

  if (!isTelegram) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Cette application doit être ouverte depuis Telegram</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement de l'inventaire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
        <button
          onClick={refreshInventory}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Aucun inventaire trouvé</p>
      </div>
    );
  }

  // Extraire le nom court et le numéro du gift (ex: LolPop-14559 -> LolPop #14559)
  const formatGiftName = (collectibleId: string) => {
    const match = collectibleId.match(/^(.+?)-(\d+)$/);
    if (match) {
      const [, shortName, giftNumber] = match;
      return `${shortName} #${giftNumber}`;
    }
    return collectibleId;
  };

  return (
    <div className="p-4">
      {/* En-tête utilisateur */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">
          🎁 Inventaire de @{user?.username || 'Utilisateur'}
        </h2>
        <p className="text-blue-600">
          {inventory.count} gift{inventory.count !== 1 ? 's' : ''} en votre possession
        </p>
      </div>

      {/* Liste des gifts */}
      {inventory.inventory.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg">Votre inventaire est vide</p>
          <p className="text-gray-500 text-sm mt-2">
            Envoyez des gifts à @WxyzCrypto pour les voir apparaître ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inventory.inventory.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    🎁 {formatGiftName(item.gift_id)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Modèle:</span> {item.collectible_model}
                    </div>
                    <div>
                      <span className="font-medium">Arrière-plan:</span> {item.collectible_backdrop}
                    </div>
                    <div>
                      <span className="font-medium">Symbole:</span> {item.collectible_symbol}
                    </div>
                    <div>
                      <span className="font-medium">Valeur:</span> ⭐ {item.gift_value}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>Reçu le</div>
                  <div>{new Date(item.received_at).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton de rafraîchissement */}
      <div className="mt-6 text-center">
        <button
          onClick={refreshInventory}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          🔄 Actualiser l'inventaire
        </button>
      </div>

      {/* Informations de synchronisation */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>🔄 Synchronisation automatique avec @WxyzCrypto</p>
        <p>Dernière mise à jour: {inventory.timestamp ? new Date(inventory.timestamp).toLocaleString('fr-FR') : 'N/A'}</p>
      </div>
    </div>
  );
};
