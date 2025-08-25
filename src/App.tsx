
import { useState, useEffect } from 'react';
import { useTournamentState } from './hooks/useTournamentState';
import { useTelegramService } from './utils/telegramService';
import { Lobby } from './components/Lobby';
import { Round } from './components/Round';
import { Victory } from './components/Victory';
import { Inventory } from './components/Inventory';

function App() {
  const [currentPage, setCurrentPage] = useState<'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn'>('pvp');
  
  // Intégration du service Telegram
  const { 
    user, 
    userGifts, 
    isLoading: telegramLoading, 
    refreshGifts 
  } = useTelegramService();
  
  const { 
    state, 
    addNFTToPlayer, 
    resetGame, 
    updateGameStats, 
    lastGameStats, 
    topGameStats 
  } = useTournamentState();

  const renderCurrentPage = () => {
    // Si on n'est pas sur la page PvP, afficher la page correspondante
    if (currentPage !== 'pvp') {
      switch (currentPage) {
        case 'inventory':
          // Utiliser les gifts de l'utilisateur Telegram
          const totalTON = userGifts.reduce((sum, nft) => sum + nft.value, 0);
          
          return <Inventory 
            onPageChange={setCurrentPage} 
            currentPage={currentPage}
            userGifts={userGifts}
            totalTON={totalTON}
          />;
        case 'rolls':
          return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-white text-2xl">Rolls Page - Coming Soon</div>
          </div>;
        case 'shop':
          return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-white text-2xl">Shop Page - Coming Soon</div>
          </div>;
        case 'earn':
          return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-white text-2xl">Earn Page - Coming Soon</div>
          </div>;
        default:
          return null;
      }
    }

    // Page PvP - logique du tournoi
    switch (state.phase) {
      case 'LOBBY':
        return (
          <Lobby
            players={state.players}
            pot={state.pot}
            onAddNFT={addNFTToPlayer}
            updateGameStats={updateGameStats}
            lastGameStats={lastGameStats}
            topGameStats={topGameStats}
            onPageChange={setCurrentPage}
            currentPage={currentPage}
          />
        );
      
      case 'RUNNING':
        return (
          <Round
            players={state.players}
            pot={state.pot}
            logs={state.logs}
            roundPhase={state.roundPhase}
          />
        );
      
      case 'FINALIZED':
        const winner = state.players.find(p => p.nfts.length > 0);
        if (winner) {
          return (
            <Victory
              winner={winner}
              totalPot={state.pot}
              onPlayAgain={resetGame}
            />
          );
        }
        return null;
      
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
