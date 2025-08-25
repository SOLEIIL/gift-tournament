import { useState } from 'react';
import { useTelegramService } from './utils/telegramService';

function App() {
  const [currentPage, setCurrentPage] = useState<'inventory' | 'game'>('inventory');
  const { userGifts } = useTelegramService();
  
  const totalTON = userGifts.reduce((sum, nft) => sum + nft.value, 0);

  if (currentPage === 'inventory') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
            🎁 Gift Tournament
          </h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">💰 Inventaire Telegram</h2>
            <div className="text-xl text-green-400 mb-2">
              Total TON: {totalTON.toFixed(2)} TON
            </div>
            <div className="text-gray-300">
              {userGifts.length} gift(s) disponible(s)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userGifts.map((gift) => (
              <div key={gift.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{gift.image || '🎁'}</div>
                  <h3 className="text-lg font-semibold">{gift.name}</h3>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {gift.value} TON
                  </div>
                  <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                    gift.rarity === 'legendary' ? 'bg-yellow-600 text-yellow-100' :
                    gift.rarity === 'epic' ? 'bg-purple-600 text-purple-100' :
                    gift.rarity === 'rare' ? 'bg-blue-600 text-blue-100' :
                    'bg-gray-600 text-gray-100'
                  }`}>
                    {gift.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => setCurrentPage('game')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              🎮 Jouer au Tournoi
            </button>
          </div>

          <div className="text-center mt-4 text-gray-400">
            <p>Bot Telegram: @testnftbuybot</p>
            <p>Intégration automatique des gifts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎮 Tournoi en Développement</h1>
        <p className="text-xl text-gray-300 mb-6">Le système de tournoi sera bientôt disponible !</p>
        <button 
          onClick={() => setCurrentPage('inventory')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          ← Retour à l'Inventaire
        </button>
      </div>
    </div>
  );
}

export default App;
