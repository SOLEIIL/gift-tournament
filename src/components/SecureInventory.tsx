import React from 'react';
import { useSecureInventory } from '../hooks/useSecureInventory';
import { LoadingSpinner } from './LoadingSpinner';

export const SecureInventory: React.FC = () => {
  const {
    inventory,
    user,
    isLoading,
    error,
    lastUpdate,
    refreshInventory,
    formatGiftDisplay,
    getInventoryStats,
    isAuthenticated,
    securityStatus
  } = useSecureInventory();

  // Affichage du statut de sécurité
  const renderSecurityStatus = () => {
    if (!securityStatus.isTelegram) {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          ⚠️ Mode développement - Mini App Telegram requise
        </div>
      );
    }

    if (!securityStatus.hasInitData) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
          ❌ Erreur d'authentification - InitData manquant
        </div>
      );
    }

    return (
      <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4">
        🔐 Authentifié via Telegram - Sécurisé
      </div>
    );
  };

  // Affichage des statistiques
  const renderStats = () => {
    const stats = getInventoryStats();
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">Total Gifts</div>
        </div>
        
        {Object.entries(stats.byType).map(([type, count]) => (
          <div key={type} className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{count}</div>
            <div className="text-sm text-purple-800">{type}</div>
          </div>
        ))}
        
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-600">
            {stats.lastUpdate ? 
              `Mis à jour: ${new Date(stats.lastUpdate).toLocaleTimeString()}` : 
              'Jamais mis à jour'
            }
          </div>
        </div>
      </div>
    );
  };

  // Affichage de l'inventaire
  const renderInventory = () => {
    if (inventory.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Inventaire vide
          </h3>
          <p className="text-gray-500">
            Vous n'avez pas encore de gifts dans votre inventaire.
          </p>
          <button
            onClick={refreshInventory}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Vos Gifts ({inventory.length})
          </h3>
          <button
            onClick={refreshInventory}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>
        
        <div className="grid gap-3">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {formatGiftDisplay(item)}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Collectible ID: {item.collectible_id}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reçu le: {new Date(item.received_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actif
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Affichage des erreurs
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <span className="text-xl mr-2">❌</span>
          <div>
            <strong>Erreur:</strong> {error}
          </div>
        </div>
        <button
          onClick={refreshInventory}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Chargement de votre inventaire sécurisé...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* En-tête avec informations utilisateur */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔐 Inventaire Privé
        </h1>
        {user && (
          <p className="text-gray-600">
            Connecté en tant que <strong>@{user.username}</strong> 
            (ID: {user.telegram_id})
          </p>
        )}
      </div>

      {/* Statut de sécurité */}
      {renderSecurityStatus()}

      {/* Gestion des erreurs */}
      {renderError()}

      {/* Statistiques */}
      {renderStats()}

      {/* Inventaire */}
      {renderInventory()}

      {/* Informations de sécurité */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">🔒 Sécurité</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Votre inventaire est privé et sécurisé</li>
          <li>• Authentification via Telegram garantie</li>
          <li>• Chaque utilisateur ne voit que ses propres gifts</li>
          <li>• Données synchronisées en temps réel avec Supabase</li>
        </ul>
      </div>
    </div>
  );
};
