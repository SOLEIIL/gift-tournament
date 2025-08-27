import React, { useState } from 'react';
import { Button } from './ui/button';
import { AddGiftsModal } from './AddGiftsModal';
import { QuickDeposit } from './QuickDeposit';
import { Player, NFT } from '../types';
import { mockNFTs } from '../utils/mockData';

import { X } from 'lucide-react';

interface LobbyProps {
  players: Player[];
  pot: number;
  onAddNFT: (playerId: string, nft: NFT) => void;
  updateGameStats: (winner: Player, gameNumber: number) => void;
  lastGameStats: {
    winner: Player | null;
    winnerGain: number;
    winnerChance: number;
    gameNumber: number;
  } | null;
  topGameStats: {
    winner: Player | null;
    winnerGain: number;
    winnerChance: number;
    gameNumber: number;
  } | null;
  onPageChange: (page: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn') => void;
  currentPage: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn';
}

export const Lobby: React.FC<LobbyProps> = ({
  players,
  pot,
  onAddNFT,
  updateGameStats,
  lastGameStats,
  topGameStats,
  onPageChange,
  currentPage,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlayer] = useState(players[0]); // Mock: always use first player
  
  // Get the current player's NFTs from the updated players array
  const currentPlayerNFTs = players.find(p => p.id === currentPlayer.id)?.nfts || [];
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const [tournamentPhase, setTournamentPhase] = useState<'waiting' | 'running' | 'finished'>('waiting');
  const [eliminationLogs, setEliminationLogs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [tournamentResults, setTournamentResults] = useState<{
    winner: Player;
    totalPot: number;
    logs: string[];
    eliminated: string[];
    players: (Player & { finalPosition?: number })[];
  } | null>(null);
  const [tournamentIntervalId, setTournamentIntervalId] = useState<number | null>(null);
  const [gameNumber, setGameNumber] = useState<number>(1);
      const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [gameHistory, setGameHistory] = useState<Array<{
      id: string;
      gameNumber: number;
      date: Date;
      winner: Player;
      winnerGain: number;
      winnerChance: number;
      totalPlayers: number;
      totalPot: number;
      gameType: 'Classic' | 'Lucky' | 'Top Win' | 'Grand';
    }>>([]);

  const activePlayers = players.filter(p => p.nfts.length > 0);
  
  // Test interface state
  const [showTestPanel, setShowTestPanel] = useState(false);

  
  // Auto-start countdown when 2+ players have deposited
  React.useEffect(() => {
    if (activePlayers.length >= 2 && !autoCountdown && tournamentPhase === 'waiting') {
      setAutoCountdown(60); // 1 minute countdown
    } else if (activePlayers.length < 2) {
      setAutoCountdown(null);
    }
  }, [activePlayers.length, autoCountdown, tournamentPhase]);

  // Auto-countdown timer
  React.useEffect(() => {
    if (autoCountdown && autoCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoCountdown(prev => prev ? prev - 1 : null);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (autoCountdown === 0 && tournamentPhase === 'waiting') {
      startTournament();
    }
  }, [autoCountdown, tournamentPhase]);

  // Start tournament function
  const startTournament = () => {
    setTournamentPhase('running');
    setAutoCountdown(null);
    
    // Increment game number for new tournament
    setGameNumber(prev => prev + 1);
    
    // Clear any existing interval
    if (tournamentIntervalId) {
      clearInterval(tournamentIntervalId);
    }
    
    // Simulate tournament eliminations and store the interval ID
    const intervalId = simulateTournament();
    setTournamentIntervalId(intervalId);
  };

  // Helper function to get random player name for combat logs
  const getRandomPlayerName = (players: Player[], excludeId: string) => {
    const availablePlayers = players.filter(p => p.id !== excludeId);
    if (availablePlayers.length === 0) return 'un adversaire';
    return availablePlayers[Math.floor(Math.random() * availablePlayers.length)].name;
  };

  // Simulate tournament eliminations
  const simulateTournament = () => {
    let currentPlayers = [...activePlayers];
    let currentPot = pot;
    let logs: string[] = [];
    let eliminated: Set<string> = new Set();
    
    const eliminationInterval = setInterval(() => {
      // Check if tournament was manually finished
      if (tournamentPhase === 'finished') {
        clearInterval(eliminationInterval);
        return;
      }
      
      if (currentPlayers.length <= 1) {
        clearInterval(eliminationInterval);
        finishTournament(currentPlayers[0], logs, eliminated);
        return;
      }
      
      // Weighted random elimination
      const totalValue = currentPlayers.reduce((sum, p) => sum + p.totalValue, 0);
      const random = Math.random() * totalValue;
      let cumulative = 0;
      let eliminatedPlayer: Player | null = null;
      
      for (const player of currentPlayers) {
        cumulative += player.totalValue;
        if (random <= cumulative) {
          eliminatedPlayer = player;
          break;
        }
      }
      
      if (eliminatedPlayer) {
        // Eliminate one NFT from the player
        const nftToEliminate = eliminatedPlayer.nfts[0];
        eliminated.add(`${eliminatedPlayer.id}-${nftToEliminate.id}`);
        
        // Update player
        eliminatedPlayer.nfts = eliminatedPlayer.nfts.slice(1);
        eliminatedPlayer.totalValue -= nftToEliminate.value;
        
        // Remove player if no NFTs left
        if (eliminatedPlayer.nfts.length === 0) {
          currentPlayers = currentPlayers.filter(p => p.id !== eliminatedPlayer.id);
        }
        
        // Update pot
        currentPot -= nftToEliminate.value;
        
        // Add dramatic combat log
        const combatLogs = [
          `⚔️ ${eliminatedPlayer.name} a esquivé le coup de ${getRandomPlayerName(currentPlayers, eliminatedPlayer.id)} !`,
          `💥 ${eliminatedPlayer.name} a été touché par ${getRandomPlayerName(currentPlayers, eliminatedPlayer.id)} !`,
          `🔥 ${eliminatedPlayer.name} a perdu ${nftToEliminate.name} dans un combat épique !`,
          `⚡ ${eliminatedPlayer.name} a été éliminé par ${getRandomPlayerName(currentPlayers, eliminatedPlayer.id)} !`,
          `💀 ${eliminatedPlayer.name} a succombé à l'attaque de ${getRandomPlayerName(currentPlayers, eliminatedPlayer.id)} !`
        ];
        const randomLog = combatLogs[Math.floor(Math.random() * combatLogs.length)];
        logs.push(randomLog);
        setEliminationLogs([...logs]);
      }
    }, 4000); // 4 seconds between eliminations
    
    // Store the interval ID for potential cleanup
    return eliminationInterval;
  };

  // Finish tournament
  const finishTournament = (winner: Player, logs: string[], eliminated: Set<string>) => {
    setTournamentPhase('finished');
    setTournamentResults({
      winner,
      totalPot: pot,
      logs,
      eliminated: Array.from(eliminated),
      players: players.map(p => ({
        ...p,
        finalPosition: p.nfts.length > 0 ? 1 : 
          logs.findIndex(log => log.includes(p.name)) + 2
      }))
    });
    setShowResults(true);
    
    // Update game statistics
    updateGameStats(winner, gameNumber);
    
    // Add game to history
    const newGameEntry = {
      id: `game-${Date.now()}`,
      gameNumber: gameNumber,
      date: new Date(),
      winner: winner,
      winnerGain: winner.totalValue,
      winnerChance: winner.winChance,
      totalPlayers: activePlayers.length,
      totalPot: pot,
      gameType: 'Classic' as const // For now, all games are Classic
    };
    
    setGameHistory(prev => [newGameEntry, ...prev]); // Add new game at the beginning
    
    // No auto-reset - user must manually close the results
  };

  // Close results manually
  const closeResults = () => {
    setShowResults(false);
    
    // After closing results, wait a few seconds then reset to waiting
    setTimeout(() => {
      setTournamentPhase('waiting');
      setTournamentResults(null);
      setEliminationLogs([]);
    }, 2000); // 2 seconds delay
  };

  // Test functions
  const clearAllPlayers = () => {
    // Stop any ongoing tournament simulation
    if (tournamentIntervalId) {
      clearInterval(tournamentIntervalId);
      setTournamentIntervalId(null);
    }
    
    // Reset all players to have no NFTs
    players.forEach(player => {
      player.nfts = [];
      player.totalValue = 0;
      player.winChance = 0;
    });
    
    // Reset all tournament states IMMEDIATELY and COMPLETELY
    setTournamentPhase('waiting');
    setEliminationLogs([]);
    setShowResults(false);
    setTournamentResults(null);
    setAutoCountdown(null);
    
    // Force immediate re-render and ensure complete reset
    setShowTestPanel(false);
    setTimeout(() => setShowTestPanel(true), 100);
  };

  const addTestPlayer1 = () => {
    // Add 3 random NFTs to player 1
    const availableNFTs = mockNFTs.slice(0, 3);
    availableNFTs.forEach(nft => {
      onAddNFT(players[0].id, nft);
    });
  };

  const addTestPlayer2 = () => {
    // Add 2 random NFTs to player 2
    const availableNFTs = mockNFTs.slice(3, 5);
    availableNFTs.forEach(nft => {
      onAddNFT(players[1].id, nft);
    });
  };

  const startTournamentNow = () => {
    if (activePlayers.length >= 2) {
      startTournament();
    }
  };

  const finishTournamentNow = () => {
    if (activePlayers.length > 0 && tournamentPhase === 'running') {
      // Stop the tournament simulation immediately
      if (tournamentIntervalId) {
        clearInterval(tournamentIntervalId);
        setTournamentIntervalId(null);
      }
      
      // Use the normal tournament finish logic
      const winner = activePlayers[0];
      const currentLogs = eliminationLogs.length > 0 ? eliminationLogs : ['Tournament terminé manuellement'];
      const eliminated = new Set<string>();
      
      // Call the normal finishTournament function
      finishTournament(winner, currentLogs, eliminated);
      
      // Clear any ongoing processes
      setEliminationLogs([]);
      setAutoCountdown(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3">
      {/* Test Panel Button - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTestPanel(!showTestPanel)}
          className="text-xs bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
        >
          {showTestPanel ? '🔒 Hide' : '🧪 Test'}
        </Button>
      </div>

                  {/* Last Game & Top Game Cards */}
            <div className="flex gap-2 mb-2">
              {/* Last Game Card */}
              <div className="flex-1 bg-card border border-border rounded-lg p-2 overflow-hidden">
                <div className="flex items-center justify-between min-h-[40px]">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {lastGameStats?.winner?.shortName?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5 flex-1">
                      <p className="font-medium text-white text-xs truncate">
                        {lastGameStats?.winner ? `@${lastGameStats.winner.shortName}...` : '@pavlo...'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">LAST GAME</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center ml-2 gap-0.5 flex-shrink-0">
                    <p className="text-sm font-semibold text-blue-300 leading-tight whitespace-nowrap">
                      {lastGameStats ? `+${lastGameStats.winnerGain} TON` : '+99 TON'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight whitespace-nowrap">
                      {lastGameStats ? `CHANCE ${Math.round(lastGameStats.winnerChance)}%` : 'CHANCE 81%'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Game Card */}
              <div className="flex-1 bg-card border border-border rounded-lg p-2 overflow-hidden">
                <div className="flex items-center justify-between min-h-[40px]">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {topGameStats?.winner?.shortName?.charAt(0) || 'G'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5 flex-1">
                      <p className="font-medium text-white text-xs truncate">
                        {topGameStats?.winner ? `@${topGameStats.winner.shortName}...` : '@Ga...'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">TOP GAME</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center ml-2 gap-0.5 flex-shrink-0">
                    <p className="text-sm font-semibold text-yellow-400 leading-tight whitespace-nowrap">
                      {topGameStats ? `+${topGameStats.winnerGain} TON` : '+36188 TON'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight whitespace-nowrap">
                      {topGameStats ? `CHANCE ${Math.round(topGameStats.winnerChance)}%` : 'CHANCE 48%'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

      {/* Game Status Bar */}
      <div className="bg-card border border-border rounded-lg p-2 mb-3">
        <div className="flex items-center justify-between">
          {/* History Button */}
          <div 
            className="p-2 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setShowHistory(true)}
          >
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" transform="rotate(180 12 12)" />
            </svg>
          </div>
          
          {/* Game Stats */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <span className="text-base font-semibold text-white">
                {players.reduce((total, player) => total + player.nfts.length, 0)} GIFTS
              </span>
            </div>
            <div className="w-px h-5 bg-muted-foreground/30"></div>
            <div className="text-center">
              <span className="text-base font-semibold text-white">
                {pot.toFixed(2)} TON
              </span>
            </div>
          </div>
          
          {/* Chat Button */}
          <div className="p-2 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>
      </div>

             {/* Battle Royale Arena - No Title, No Border */}
       <div className="mb-4">

         
                   {/* Circle Arena - Almost Full Width */}
          <div className="relative w-full max-w-4xl mx-auto">
                         {/* Arena Circle */}
                          <div className={`
                w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] mx-auto border-2 border-dashed border-muted-foreground/30 rounded-full 
                flex items-center justify-center transition-all duration-1000
                ${tournamentPhase === 'running' ? 'animate-pulse border-red-400' : ''}
                ${tournamentPhase === 'finished' ? 'border-green-400 scale-90' : ''}
              `}>
                                                       {tournamentPhase !== 'running' && (
                              <div className="text-center">
                                {tournamentPhase === 'waiting' && activePlayers.length < 2 && (
                                  <div className="text-xl font-bold text-muted-foreground">Waiting</div>
                                )}
                                {tournamentPhase === 'waiting' && activePlayers.length >= 2 && autoCountdown && (
                                  <>
                                    <div className="text-xl font-bold text-accent-foreground">
                                      {Math.floor(autoCountdown / 60)}:{(autoCountdown % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Starts in</div>
                                  </>
                                )}
                                {tournamentPhase === 'waiting' && activePlayers.length >= 2 && !autoCountdown && (
                                  <>
                                    <div className="text-xl font-bold text-ton">{pot} TON</div>
                                    <div className="text-xs text-muted-foreground">Total Pot</div>
                                  </>
                                )}
                                {tournamentPhase === 'finished' && (
                                  <>
                                    <div className="text-xl font-bold text-green-400">{tournamentResults?.winner?.name}</div>
                                    <div className="text-xs text-muted-foreground">Winner!</div>
                                  </>
                                )}
                              </div>
                            )}
                            {tournamentPhase === 'running' && (
                              <div className="text-center">
                                <div className="text-xl font-bold text-red-400 animate-pulse">FIGHT!</div>
                              </div>
                            )}
           </div>

                                                                                               {/* NFTs positioned around the circle */}
                             {/* Player Avatars positioned around the circle */}
                             {activePlayers.map((player, playerIndex) => {
                               // Responsive center coordinates based on arena size
                               let centerX, centerY;
                               if (window.innerWidth >= 1280) {
                                 // xl:w-[48rem] (768px) / 2
                                 centerX = 384;
                                 centerY = 384;
                               } else if (window.innerWidth >= 1024) {
                                 // lg:w-[40rem] (640px) / 2
                                 centerX = 320;
                                 centerY = 320;
                               } else if (window.innerWidth >= 640) {
                                 // sm:w-[32rem] (512px) / 2
                                 centerX = 256;
                                 centerY = 256;
                               } else {
                                 // w-96 (384px) / 2
                                 centerX = 192;
                                 centerY = 192;
                               }
                               const totalPlayers = activePlayers.length;
                               
                               // Dynamic radius and avatar size based on tournament phase
                               let radius, avatarSize;
                               if (window.innerWidth >= 1280) {
                                 // xl:w-[48rem] (768px) - radius 240px, avatar 22px
                                 if (tournamentPhase === 'running') {
                                   radius = 240;
                                   avatarSize = 22;
                                 } else if (tournamentPhase === 'finished') {
                                   radius = 235;
                                   avatarSize = 21;
                                 } else {
                                   radius = 240;
                                   avatarSize = 22;
                                 }
                               } else if (window.innerWidth >= 1024) {
                                 // lg:w-[40rem] (640px) - radius 200px, avatar 20px
                                 if (tournamentPhase === 'running') {
                                   radius = 200;
                                   avatarSize = 20;
                                 } else if (tournamentPhase === 'finished') {
                                   radius = 195;
                                   avatarSize = 19;
                                 } else {
                                   radius = 200;
                                   avatarSize = 20;
                                 }
                               } else if (window.innerWidth >= 640) {
                                 // sm:w-[32rem] (512px) - radius 160px, avatar 16px
                                 if (tournamentPhase === 'running') {
                                   radius = 160;
                                   avatarSize = 16;
                                 } else if (tournamentPhase === 'finished') {
                                   radius = 155;
                                   avatarSize = 15;
                                 } else {
                                   radius = 160;
                                   avatarSize = 16;
                                 }
                               } else {
                                 // w-96 (384px) - radius 120px, avatar 16px
                                 if (tournamentPhase === 'running') {
                                   radius = 120;
                                   avatarSize = 16;
                                 } else if (tournamentPhase === 'finished') {
                                   radius = 115;
                                   avatarSize = 15;
                                 } else {
                                   radius = 120;
                                   avatarSize = 16;
                                 }
                               }
                               
                               // Calculate dynamic avatar size based on win chance for this player
                               const baseAvatarSize = avatarSize;
                               const winChance = player.winChance || 0;
                               const dynamicAvatarSize = Math.max(
                                 baseAvatarSize * 0.8, // Minimum size
                                 Math.min(
                                   baseAvatarSize * 2, // Maximum size
                                   baseAvatarSize + (winChance / 10) // Scale with win chance
                                 )
                               );
                               
                               // Create a protected zone around the center text (proportional to arena size)
                               const protectedZoneRadius = Math.min(radius * 0.6, 80); // 60% of arena radius, max 80px
                               
                               // Use stable positioning for waiting phase, dynamic for battle
                               let position;
                               
                               if (tournamentPhase === 'waiting') {
                                 // Fixed positions during waiting phase - use player index for consistent placement
                                 const angle = (playerIndex / totalPlayers) * 2 * Math.PI - Math.PI / 2; // Start from top
                                 const baseRadius = protectedZoneRadius + 20 + (playerIndex * 15); // Safe radius outside protected zone
                                 
                                 position = {
                                   x: centerX + baseRadius * Math.cos(angle),
                                   y: centerY + baseRadius * Math.sin(angle),
                                 };
                               } else {
                                 // Dynamic positioning for battle phases with collision detection
                                 let attempts = 0;
                                 const maxAttempts = 150;
                                 const minDistance = avatarSize * 4; // Minimum distance between avatars
                                 
                                 // Store positions of already placed avatars to check for collisions
                                 const placedPositions: { x: number; y: number }[] = [];
                               
                               do {
                                 // Random angle and radius - STRICTLY outside protected zone
                                 const randomAngle = Math.random() * 2 * Math.PI;
                                 const randomRadius = protectedZoneRadius + 20 + Math.random() * (radius - protectedZoneRadius - 20 - avatarSize * 2);
                                 
                                 const candidatePosition = {
                                   x: centerX + randomRadius * Math.cos(randomAngle),
                                   y: centerY + randomRadius * Math.sin(randomAngle),
                                 };
                                 
                                 // Check collision with already placed avatars
                                 let hasCollision = false;
                                 for (const placedPos of placedPositions) {
                                   const distance = Math.sqrt(
                                     Math.pow(candidatePosition.x - placedPos.x, 2) + 
                                     Math.pow(candidatePosition.y - placedPos.y, 2)
                                   );
                                   if (distance < minDistance) {
                                     hasCollision = true;
                                     break;
                                   }
                                 }
                                 
                                 // If no collision, use this position
                                 if (!hasCollision) {
                                   position = candidatePosition;
                                   placedPositions.push(position);
                                   break;
                                 }
                                 
                                 attempts++;
                                 
                                 // Prevent infinite loop
                                 if (attempts >= maxAttempts) {
                                   // Fallback to structured positioning if random fails - STRICTLY outside protected zone
                                   const fallbackAngle = (playerIndex / totalPlayers) * 2 * Math.PI - Math.PI / 2;
                                   const fallbackRadius = protectedZoneRadius + 20 + (playerIndex * 15);
                                   
                                   // Check if fallback position also has collision
                                   const fallbackPosition = {
                                     x: centerX + fallbackRadius * Math.cos(fallbackAngle),
                                     y: centerY + fallbackRadius * Math.sin(fallbackAngle),
                                   };
                                   
                                   let fallbackHasCollision = false;
                                   for (const placedPos of placedPositions) {
                                     const distance = Math.sqrt(
                                       Math.pow(fallbackPosition.x - placedPos.x, 2) + 
                                       Math.pow(fallbackPosition.y - placedPos.y, 2)
                                     );
                                     if (distance < minDistance) {
                                       fallbackHasCollision = true;
                                       break;
                                     }
                                   }
                                   
                                   if (!fallbackHasCollision) {
                                     position = fallbackPosition;
                                     placedPositions.push(position);
                                   } else {
                                     // Last resort: force position with slight offset
                                     const offsetAngle = fallbackAngle + (Math.random() - 0.5) * 0.5;
                                     const offsetRadius = fallbackRadius + (Math.random() - 0.5) * 20;
                                     
                                     position = {
                                       x: centerX + offsetRadius * Math.cos(offsetAngle),
                                       y: centerY + offsetRadius * Math.sin(offsetAngle),
                                     };
                                     placedPositions.push(position);
                                   }
                                   break;
                                 }
                               } while (true);
                               } // Close the else block
                               
                               // Ensure avatar stays within bounds and outside protected zone
                               const distanceFromCenter = Math.sqrt(
                                 Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
                               );
                               

                               
                               // If avatar is inside protected zone, move it outside with safety margin
                               if (distanceFromCenter < protectedZoneRadius + dynamicAvatarSize * 2 + 10) {
                                 const angle = Math.atan2(position.y - centerY, position.x - centerX);
                                 const newRadius = protectedZoneRadius + dynamicAvatarSize * 2 + 20 + Math.random() * 10;
                                 
                                 position = {
                                   x: centerX + newRadius * Math.cos(angle),
                                   y: centerY + newRadius * Math.sin(angle),
                                 };
                               }
                               
                               // If avatar would be outside circle, pull it back inside
                               if (distanceFromCenter > radius - dynamicAvatarSize * 2) {
                                 const scale = (radius - dynamicAvatarSize * 2) / distanceFromCenter;
                                 position.x = centerX + (position.x - centerX) * scale;
                                 position.y = centerY + (position.y - centerY) * scale;
                               }
                               
                               const isEliminated = player.nfts.length === 0;
                               const isWinner = tournamentPhase === 'finished' && !isEliminated;
                               

                               
                               return (
                                 <div
                                   key={player.id}
                                   className={`
                                     absolute transition-all duration-500 cursor-pointer
                                     ${isEliminated ? 'animate-eliminate opacity-50' : ''}
                                     ${isWinner ? 'animate-bounce' : ''}
                                   `}
                                   style={{
                                     width: `${dynamicAvatarSize * 4}px`,
                                     height: `${dynamicAvatarSize * 4}px`,
                                     left: position.x - (dynamicAvatarSize * 2),
                                     top: position.y - (dynamicAvatarSize * 2),
                                   }}
                                   onClick={() => setSelectedPlayer(player)}
                                 >
                                   <div className={`
                                     w-full h-full rounded-full border-4 p-1 text-center transition-all relative
                                     ${isEliminated 
                                       ? 'border-destructive bg-destructive/20' 
                                       : isWinner
                                       ? 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-400/50 animate-pulse'
                                       : tournamentPhase === 'running'
                                       ? 'border-yellow-400 bg-yellow-50 animate-pulse'
                                       : 'border-ton bg-ton/20 hover:border-ton/50'
                                     }
                                   `}>
                                     {/* Telegram Avatar Placeholder */}
                                     <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                       {player.shortName}
                                     </div>
                                     
                                     {/* Player Info Badge */}
                                     <div className="absolute -bottom-2 -right-2 bg-card border border-border rounded-full px-2 py-1 text-xs font-medium">
                                       {player.nfts.length} gift{player.nfts.length !== 1 ? 's' : ''}
                                     </div>
                                     
                                     {/* Winner Crown */}
                                     {isWinner && (
                                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                                         <span className="text-white text-xs">👑</span>
                                       </div>
                                     )}
                                     
                                     {/* Elimination Cross */}
                                     {isEliminated && (
                                       <div className="absolute inset-0 bg-destructive/80 rounded-full flex items-center justify-center">
                                         <span className="text-white text-2xl">❌</span>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               );
                             })}
         </div>

         {/* Tournament Status Messages */}
         {tournamentPhase === 'running' && (
           <div className="text-center mb-8">
             <p className="text-sm text-red-400 font-medium animate-pulse">
               ⚡ Tournament in Progress ⚡
             </p>
           </div>
         )}
         {tournamentPhase === 'finished' && (
           <div className="text-center mb-4">
             <p className="text-sm text-green-400 font-medium">
               🏆 Tournament Finished 🏆
             </p>
           </div>
         )}

         {/* Tournament Logs */}
         {tournamentPhase === 'running' && eliminationLogs.length > 0 && (
           <div className="mt-4 p-3 bg-muted/20 rounded-lg max-h-32 overflow-y-auto">
             <h4 className="text-sm font-medium mb-2 text-red-400">Live Eliminations:</h4>
             <div className="space-y-1">
               {eliminationLogs.slice(-3).map((log, index) => (
                 <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                   {log}
                 </div>
               ))}
             </div>
           </div>
         )}

                                       {/* Winner Highlight */}
                    {tournamentPhase === 'finished' && 
                     tournamentResults?.winner && 
                     showResults && 
                     activePlayers.length > 0 && (
                      <div className="text-center mt-4 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <div className="text-2xl animate-bounce">👑</div>
                          <div>
                            <h4 className="text-lg font-bold text-yellow-400">
                              {tournamentResults.winner.name} Wins!
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Last gift remaining: {tournamentResults.winner.nfts[0]?.name} ({tournamentResults.winner.nfts[0]?.value} TON)
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          🏆 Tournament completed! Waiting for new players...
                        </p>
                      </div>
                    )}
       </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="ton"
          size="lg"
          className="flex-1 h-14 text-base"
        >
          + Add Gifts
        </Button>
        
        <QuickDeposit 
          availableNFTs={mockNFTs.filter(nft => !currentPlayerNFTs.some(deposited => deposited.id === nft.id))}
          depositedNFTs={currentPlayerNFTs}
          onDeposit={onAddNFT}
          playerId={currentPlayer.id}
        />
      </div>



      {/* Players - Only show when players have deposited gifts */}
      {players.filter(p => p.nfts.length > 0).length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 pb-16" style={{ borderBottomWidth: '2px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Players</h3>
            <span className="text-sm text-muted-foreground">Game #{gameNumber}</span>
          </div>
          <div className="space-y-3">
            {players
              .filter(p => p.nfts.length > 0)
              .sort((a, b) => {
                // Le joueur actuel (currentPlayer) doit toujours apparaître en premier
                if (a.id === currentPlayer.id) return -1;
                if (b.id === currentPlayer.id) return 1;
                // Ensuite, trier par valeur décroissante
                return b.totalValue - a.totalValue;
              })
              .map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setSelectedPlayer(player)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ton/20 rounded-full flex items-center justify-center">
                      <span className="font-bold text-ton">{player.shortName}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {player.id === currentPlayer.id ? 'You' : player.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {player.nfts.length} gift{player.nfts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ton">{player.totalValue} TON</p>
                    <p className="text-sm text-muted-foreground">
                      {player.winChance.toFixed(1)}% chance
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      

             {/* Add Gifts Modal */}
       <AddGiftsModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         availableNFTs={mockNFTs.filter(nft => !currentPlayerNFTs.some(deposited => deposited.id === nft.id))}
         onDeposit={onAddNFT}
         playerId={currentPlayer.id}
       />

       {/* Player Gifts Modal */}
       {selectedPlayer && (
         <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
             onClick={() => setSelectedPlayer(null)}
           />
           {/* Modal - Bottom Sheet Style */}
           <div className="bg-card border-t border-border rounded-t-2xl w-full max-h-[80vh] overflow-hidden transition-all duration-500 ease-out transform animate-slide-up pointer-events-auto">
             {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-border">
               <h2 className="text-lg font-semibold">Roll #{gameNumber}</h2>
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => setSelectedPlayer(null)}
                 className="h-8 w-8"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             {/* Player Info */}
             <div className="flex items-center justify-between p-4 border-b border-border">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                   <span className="text-white font-bold text-sm">{selectedPlayer.shortName}</span>
                 </div>
                 <div>
                   <p className="font-medium text-white">@{selectedPlayer.name}</p>
                   <p className="text-sm text-muted-foreground">Player</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-lg font-semibold text-blue-400">{((selectedPlayer.totalValue / pot) * 100).toFixed(2)}%</p>
                 <p className="text-sm text-muted-foreground">{selectedPlayer.totalValue} TON</p>
               </div>
             </div>
             
             {/* Content - Gifts Grid */}
             <div className="p-4 overflow-y-auto max-h-[60vh]">
               <div className="grid grid-cols-3 gap-3">
                 {selectedPlayer.nfts.map((nft, index) => (
                   <div key={index} className="bg-muted/20 rounded-lg p-3 text-center">
                     <div className="w-full h-20 bg-muted/30 rounded-lg flex items-center justify-center mb-2">
                       <span className="text-2xl">{nft.image}</span>
                     </div>
                     <p className="font-medium text-sm text-white mb-1">{nft.name}</p>
                     <div className="flex items-center justify-center gap-1">
                       <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                       </svg>
                       <span className="text-xs text-white">{nft.value} TON</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Footer */}
             <div className="p-4 border-t border-border">
               <Button
                 onClick={() => setSelectedPlayer(null)}
                 className="w-full bg-white text-black hover:bg-gray-100"
               >
                 Done
               </Button>
             </div>
           </div>
         </div>
       )}

       {/* PvP History Modal */}
       {showHistory && (
         <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
             onClick={() => setShowHistory(false)}
           />
           {/* Modal - Bottom Sheet Style */}
           <div className="bg-card border-t border-border rounded-t-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ease-out transform animate-slide-up pointer-events-auto">
             {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-border">
               <h2 className="text-xl font-semibold">PvP History</h2>
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => setShowHistory(false)}
                 className="h-8 w-8"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             {/* Filter Tabs */}
             <div className="flex gap-2 p-4 border-b border-border">
               <button className="px-4 py-2 bg-ton/20 text-ton rounded-lg font-medium flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 All
               </button>
               <button className="px-4 py-2 bg-muted/20 text-white rounded-lg font-medium flex items-center gap-2">
                 <span className="text-green-400">🍀</span>
                 Lucky
               </button>
               <button className="px-4 py-2 bg-muted/20 text-white rounded-lg font-medium flex items-center gap-2">
                 <span className="text-yellow-400">💰</span>
                 Top win
               </button>
               <button className="px-4 py-2 bg-muted/20 text-white rounded-lg font-medium flex items-center gap-2">
                 <span className="text-yellow-400">👑</span>
                 Grand
               </button>
             </div>
             
             {/* Content */}
             <div className="p-4 overflow-y-auto max-h-[60vh]">
               <div className="space-y-3">
                 {gameHistory.length === 0 ? (
                   <div className="text-center py-8 text-muted-foreground">
                     <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <p className="text-lg font-medium">No games played yet</p>
                     <p className="text-sm">Start a tournament to see your history here!</p>
                   </div>
                 ) : (
                   gameHistory.map((game) => (
                     <div key={game.id} className="bg-muted/20 rounded-lg p-4">
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2">
                           <div className="w-5 h-5 bg-red-500/20 rounded flex items-center justify-center">
                             <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           </div>
                           <span className="text-white font-medium">{game.gameType}</span>
                         </div>
                         <span className="text-sm text-muted-foreground">
                           #{game.gameNumber} • {game.date.toLocaleDateString('en-GB')} • {game.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                             <span className="text-lg">👤</span>
                           </div>
                           <div>
                             <p className="font-medium text-white">@{game.winner.shortName || game.winner.name}</p>
                             <p className="text-sm text-muted-foreground">Winner</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-lg font-semibold text-blue-400">Won {game.winnerGain.toFixed(2)} TON</p>
                           <p className="text-sm text-muted-foreground">{Math.round(game.winnerChance)}%</p>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-bold">
                           {game.totalPlayers}
                         </div>
                         <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center text-xs font-bold">
                           {game.totalPot.toFixed(1)}
                         </div>
                         <span className="text-xs text-muted-foreground ml-2">players • pot</span>
                       </div>
                     </div>
                   ))
                 )}
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Tournament Results Modal */}
       {showResults && tournamentResults && (
         <div className="fixed inset-0 z-[60] flex items-end justify-center">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
             onClick={() => setShowResults(false)}
           />
           {/* Modal - Bottom Sheet Style */}
           <div className="bg-card border-t border-border rounded-t-2xl w-full max-h-[80vh] overflow-hidden transition-all duration-500 ease-out transform animate-slide-up">
             {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-border">
               <h2 className="text-lg font-semibold">Tournament Results - Game #{gameNumber}</h2>
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={closeResults}
                 className="h-8 w-8"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             {/* Content */}
             <div className="p-4 overflow-y-auto max-h-[60vh]">
               <div className="text-center mb-6">
                 {/* Emoji coupe et titre supprimés */}
               </div>

             {/* Winner Section */}
             <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
               <div className="flex items-center justify-center gap-4 mb-3">
                 <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                   <span className="text-2xl font-bold text-green-500">👑</span>
                 </div>
                 <div className="text-center">
                   <h3 className="text-xl font-bold text-green-500">Winner!</h3>
                   <p className="text-lg font-semibold">{tournamentResults.winner.name}</p>
                   <p className="text-sm text-muted-foreground">
                     Won {tournamentResults.winner.totalValue} TON
                   </p>
                 </div>
               </div>
             </div>

             {/* Gifts Gagnés */}
             <div className="mb-6">
               <h4 className="text-lg font-semibold mb-3">🎁 Gifts Gagnés</h4>
               <div className="space-y-2">
                 {tournamentResults.winner.nfts.map((nft, index) => (
                   <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                         <span className="text-lg">{nft.image}</span>
                       </div>
                       <div>
                         <p className="font-medium">{nft.name}</p>
                         <p className="text-sm text-muted-foreground">
                           {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                         </p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-semibold text-ton">{nft.value} TON</p>
                       <p className="text-xs text-green-500 font-medium">
                         Gagné !
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Elimination Log */}
             <div className="mb-6">
               <h4 className="text-lg font-semibold mb-3">Tournament Log</h4>
               <div className="max-h-32 overflow-y-auto space-y-1">
                 {tournamentResults.logs.map((log: string, index: number) => (
                   <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded text-sm">
                     <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                     {log}
                   </div>
                 ))}
               </div>
             </div>

             {/* Close Button */}
             <div className="text-center">
               <Button
                 onClick={closeResults}
                 variant="ton"
                 size="lg"
                 className="w-full"
               >
                 Close Results
               </Button>
             </div>
           </div>
             </div>
         </div>
               )}

        {/* Test Panel - Floating on the right */}
        {showTestPanel && (
          <div className="fixed right-4 top-20 z-40 bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-yellow-400">🧪 Test Panel</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestPanel(false)}
                className="h-6 w-6 p-0 text-xs"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-2 text-xs">
              {/* Player Management */}
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Players:</p>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllPlayers}
                    className="h-7 text-xs bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
                  >
                    🗑️ Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTestPlayer1}
                    className="h-7 text-xs bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30"
                  >
                    👤 Add P1 (3 NFTs)
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTestPlayer2}
                  className="w-full h-7 text-xs bg-green-500/20 hover:bg-green-500/30 border-green-500/30"
                >
                  👤 Add P2 (2 NFTs)
                </Button>
              </div>

              {/* Tournament Control */}
              <div className="space-y-1 pt-2 border-t border-border">
                <p className="font-medium text-muted-foreground">Tournament:</p>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startTournamentNow}
                    disabled={activePlayers.length < 2}
                    className="h-7 text-xs bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/30 disabled:opacity-50"
                  >
                    ⚡ Start Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={finishTournamentNow}
                    disabled={tournamentPhase !== 'running'}
                    className="h-7 text-xs bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 disabled:opacity-50"
                  >
                    🏁 Finish Now
                  </Button>
                </div>
              </div>

              {/* Status Info */}
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                <p>Phase: <span className="text-accent-foreground">{tournamentPhase}</span></p>
                <p>Active: <span className="text-accent-foreground">{activePlayers.length}</span></p>
                <p>Countdown: <span className="text-accent-foreground">{autoCountdown || 'None'}</span></p>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Navigation Menu */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-50">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* PvP - Current Page */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPageChange('pvp')}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentPage === 'pvp' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" transform="rotate(180 12 12)" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${currentPage === 'pvp' ? 'text-white' : 'text-gray-400'}`}>PvP</span>
            </div>
            
            {/* Rolls */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPageChange('rolls')}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentPage === 'rolls' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${currentPage === 'rolls' ? 'text-white' : 'text-gray-400'}`}>Rolls</span>
            </div>
            
            {/* Inventory */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPageChange('inventory')}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentPage === 'inventory' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${currentPage === 'inventory' ? 'text-white' : 'text-gray-400'}`}>Inventory</span>
            </div>
            
            {/* Shop */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPageChange('shop')}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentPage === 'shop' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${currentPage === 'shop' ? 'text-white' : 'text-gray-400'}`}>Shop</span>
            </div>
            
            {/* Earn */}
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPageChange('earn')}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className={`w-6 h-6 ${currentPage === 'earn' ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${currentPage === 'earn' ? 'text-white' : 'text-gray-400'}`}>Earn</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
