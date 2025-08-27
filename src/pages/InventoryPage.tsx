import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { useTelegram } from '../hooks/useTelegram';

export const InventoryPage: React.FC = () => {
  const { inventory, isLoading, error, refreshInventory } = useInventory();
  const { user, isTelegram } = useTelegram();

  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Accès Restreint</h1>
            <p className="text-gray-600 mb-6">
              Cette page doit être ouverte depuis l'application Telegram
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Comment faire :</strong><br/>
                Ouvrez Telegram et tapez :<br/>
                <code className="bg-blue-100 px-2 py-1 rounded">@testnftbuybot</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Chargement de l'inventaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refreshInventory}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Inventaire Vide</h1>
            <p className="text-gray-600 mb-6">
              Aucun inventaire trouvé pour cet utilisateur
            </p>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête utilisateur */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎁 Inventaire de @{user?.username || 'Utilisateur'}
            </h1>
            <p className="text-gray-600 text-lg">
              {inventory.count} gift{inventory.count !== 1 ? 's' : ''} en votre possession
            </p>
            <div className="mt-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                ID: {user?.id || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Liste des gifts */}
        {inventory.inventory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Votre inventaire est vide</h2>
            <p className="text-gray-600 text-lg mb-6">
              Envoyez des gifts à @WxyzCrypto pour les voir apparaître ici
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-blue-800 text-sm">
                💡 <strong>Comment obtenir des gifts :</strong><br/>
                Contactez @WxyzCrypto et envoyez des gifts Telegram
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inventory.inventory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    🎁 {formatGiftName(item.gift_id)}
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700">Modèle:</span><br/>
                      {item.collectible_model}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700">Arrière-plan:</span><br/>
                      {item.collectible_backdrop}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700">Symbole:</span><br/>
                      {item.collectible_symbol}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Reçu le: {new Date(item.received_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-4">
              💡 <strong>Besoin d'aide ?</strong>
            </p>
            <p className="text-sm text-gray-500">
              Contactez @testnftbuybot sur Telegram pour toute question
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
