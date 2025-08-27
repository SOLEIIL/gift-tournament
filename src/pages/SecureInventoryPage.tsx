import React from 'react';
import { SecureInventory } from '../components/SecureInventory';
import { useTelegram } from '../hooks/useTelegram';

export const SecureInventoryPage: React.FC = () => {
  const { isTelegram, isReady, showAlert } = useTelegram();

  // Fonction pour afficher des informations sur la sécurité
  const showSecurityInfo = () => {
    const message = `🔐 SÉCURITÉ DE VOTRE INVENTAIRE

✅ Authentification Telegram garantie
✅ Chaque utilisateur voit uniquement ses gifts
✅ Données synchronisées en temps réel
✅ Protection contre l'accès non autorisé

Votre inventaire est 100% privé et sécurisé !`;
    
    showAlert(message);
  };

  // Fonction pour afficher l'aide
  const showHelp = () => {
    const message = `🎁 COMMENT UTILISER VOTRE INVENTAIRE

1️⃣ Envoyez des gifts à @WxyzCrypto
2️⃣ Vos gifts sont automatiquement détectés
3️⃣ Ils apparaissent ici en temps réel
4️⃣ Chaque gift est unique et sécurisé

Votre inventaire se met à jour automatiquement !`;
    
    showAlert(message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🔐 Inventaire Sécurisé
              </h1>
              <p className="text-gray-600">
                Vos gifts privés et sécurisés
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={showSecurityInfo}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                🔒 Sécurité
              </button>
              
              <button
                onClick={showHelp}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                ❓ Aide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="py-6">
        {!isReady ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initialisation de la Mini App...</p>
          </div>
        ) : !isTelegram ? (
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">📱</div>
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                Mini App Telegram Requise
              </h2>
              <p className="text-yellow-700 mb-4">
                Cette page est conçue pour fonctionner uniquement dans la Mini App Telegram.
                Veuillez l'ouvrir via votre bot @testnftbuybot.
              </p>
              <div className="bg-white rounded-lg p-4 text-left text-sm text-yellow-800">
                <p><strong>Pour tester :</strong></p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Ouvrez Telegram</li>
                  <li>Contactez @testnftbuybot</li>
                  <li>Envoyez /start</li>
                  <li>Cliquez sur "Start App"</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <SecureInventory />
        )}
      </div>

      {/* Pied de page avec informations */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>🔐 Inventaire sécurisé via Telegram Mini App</p>
            <p className="mt-1">
              Bot: @testnftbuybot | Compte de dépôt: @WxyzCrypto
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
