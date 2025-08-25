
import { useState, useEffect } from 'react';
import { useTournamentState } from './hooks/useTournamentState';
import { useTelegram } from './hooks/useTelegram';
import { Lobby } from './components/Lobby';
import { Round } from './components/Round';
import { Victory } from './components/Victory';
import { Inventory } from './components/Inventory';

function App() {
  const [currentPage, setCurrentPage] = useState<'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn'>('pvp');
  
  const { 
    state, 
    addNFTToPlayer, 
    resetGame, 
    updateGameStats, 
    lastGameStats, 
    topGameStats 
  } = useTournamentState();

  const {
    webApp,
    user,
    themeParams,
    isTelegram,
    isReady,
    expandApp,
    closeApp,
    showAlert,
    hapticFeedback
  } = useTelegram();

  const renderCurrentPage = () => {
    // Si on n'est pas sur la page PvP, afficher la page correspondante
    if (currentPage !== 'pvp') {
      switch (currentPage) {
        case 'inventory':
          // Get current player's gifts and total TON value
          const currentPlayer = state.players[0]; // Mock: always use first player
          const userGifts = currentPlayer.nfts || [];
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
            user={user}
            isTelegram={isTelegram}
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

  // Apply Telegram theme colors if available
  useEffect(() => {
    if (themeParams.bg_color) {
      document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color);
    }
    if (themeParams.text_color) {
      document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color);
    }
    if (themeParams.button_color) {
      document.documentElement.style.setProperty('--tg-button-color', themeParams.button_color);
    }
    if (themeParams.button_text_color) {
      document.documentElement.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
    }
  }, [themeParams]);

  // Expand app when ready
  useEffect(() => {
    if (isReady && isTelegram) {
      expandApp();
    }
  }, [isReady, isTelegram, expandApp]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App" style={{
      backgroundColor: themeParams.bg_color || '#1a1a1a',
      color: themeParams.text_color || '#ffffff'
    }}>
      {renderCurrentPage()}
    </div>
  );
}

export default App;
