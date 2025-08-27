import React from 'react';
import { useInventory } from '../hooks/useInventory';

export const Inventory: React.FC = () => {
  const { inventory, isLoading, error, refreshInventory } = useInventory();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'inventaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">Erreur</h1>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={refreshInventory}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎁 Mon Inventaire</h1>
          <p className="text-gray-300 text-lg">
            {inventory.length === 0 
              ? "Aucun gift dans votre inventaire" 
              : `${inventory.length} gift${inventory.length > 1 ? 's' : ''} dans votre inventaire`
            }
          </p>
          <button
            onClick={refreshInventory}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Liste des gifts */}
        {inventory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((gift) => (
              <div
                key={gift.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                {/* En-tête du gift */}
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{gift.symbol}</div>
                  <h3 className="text-xl font-bold text-white">
                    {gift.name} #{gift.collectibleId.split('-')[1]}
                  </h3>
                  <p className="text-blue-400 font-semibold">{gift.value} ⭐</p>
                </div>

                {/* Détails du gift */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Modèle:</span>
                    <span className="text-white font-medium">{gift.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Arrière-plan:</span>
                    <span className="text-white font-medium">{gift.background}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Symbole:</span>
                    <span className="text-white font-medium">{gift.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Type:</span>
                    <span className="text-white font-medium">{gift.giftType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Date:</span>
                    <span className="text-white font-medium">
                      {new Date(gift.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* ID unique */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-center text-gray-400 text-sm">
                    ID: {gift.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message si inventaire vide */}
        {inventory.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-white mb-4">Inventaire vide</h2>
            <p className="text-gray-300 text-lg mb-6">
              Vous n'avez pas encore reçu de gifts. 
              <br />
              Envoyez des gifts à @WxyzCrypto pour les voir apparaître ici !
            </p>
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-300 text-sm">
                💡 <strong>Astuce :</strong> Les gifts sont détectés en temps réel 
                par notre système de surveillance automatique.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
