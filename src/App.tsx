
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTournamentState } from './hooks/useTournamentState';
import { useTelegram } from './hooks/useTelegram';
import { Lobby } from './components/Lobby';
import { Round } from './components/Round';
import { Victory } from './components/Victory';
import { Inventory } from './components/Inventory';
import { InventoryPage } from './pages/InventoryPage';
import { SecureInventoryPage } from './pages/SecureInventoryPage';

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
    themeParams,
    isTelegram,
    isReady,
    expandApp
  } = useTelegram();

  const renderCurrentPage = () => {
    // Si on n'est pas sur la page PvP, afficher la page correspondante
    if (currentPage !== 'pvp') {
      switch (currentPage) {
        case 'inventory':
          return <Inventory 
            onPageChange={setCurrentPage} 
            currentPage={currentPage}
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
            roundPhase={state.roundPhase.toString()}
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
    if (themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999');
      document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
    }
  }, [themeParams]);

  // Expand app when ready
  useEffect(() => {
    if (isReady && expandApp) {
      expandApp();
    }
  }, [isReady, expandApp]);

  // Main app content
  const MainApp = () => (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Route principale de l'application */}
        <Route path="/" element={<MainApp />} />
        
        {/* Route directe vers l'inventaire */}
        <Route path="/inventory" element={<InventoryPage />} />
        
        {/* Route vers l'inventaire sécurisé Telegram */}
        <Route path="/secure-inventory" element={<SecureInventoryPage />} />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
