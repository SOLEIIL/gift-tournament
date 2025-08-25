import { useState, useEffect, useCallback } from 'react';
import { TournamentState, Player, NFT, GameSettings } from '../types';
import { mockPlayers } from '../utils/mockData';
import { weightedPickPlayer, pickRandomNFT } from '../utils/weightedPick';

const DEFAULT_SETTINGS: GameSettings = {
  countdownDuration: 15,
  phaseDelay: 2,
  maxPhaseDelay: 4,
  phaseDelayIncrement: 0.5,
  phaseDelayIncrementInterval: 2,
};

export const useTournamentState = () => {
  const [state, setState] = useState<TournamentState>(() => {
    // Start with empty state instead of demo state
    const emptyPlayers = mockPlayers.map(player => ({
      ...player,
      nfts: [],
      totalValue: 0,
      winChance: 0,
    }));
    
    return {
      phase: 'LOBBY',
      pot: 0,
      players: emptyPlayers,
      currentPlayer: null,
      eliminatedNFTs: [],
      logs: [],
      countdown: DEFAULT_SETTINGS.countdownDuration,
      roundPhase: 0,
    };
  });

  // Game statistics tracking
  const [lastGameStats, setLastGameStats] = useState<{
    winner: Player | null;
    winnerGain: number;
    winnerChance: number;
    gameNumber: number;
  } | null>(null);
  
  const [topGameStats, setTopGameStats] = useState<{
    winner: Player | null;
    winnerGain: number;
    winnerChance: number;
    gameNumber: number;
  } | null>(null);

  const [settings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [countdownInterval, setCountdownInterval] = useState<number | null>(null);
  const [gameInterval, setGameInterval] = useState<number | null>(null);

  // Calculate win chances for all players
  const updateWinChances = useCallback((players: Player[], potTotal: number) => {
    return players.map(player => ({
      ...player,
      winChance: potTotal > 0 ? (player.totalValue / potTotal) * 100 : 0,
    }));
  }, []);

  // Calculate pot total
  const calculatePot = useCallback((players: Player[]) => {
    return players.reduce((total, player) => total + player.totalValue, 0);
  }, []);

  // Add NFT to player
  const addNFTToPlayer = useCallback((playerId: string, nft: NFT) => {
    setState(prev => {
      const updatedPlayers = prev.players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              nfts: [...player.nfts, nft],
              totalValue: player.totalValue + nft.value
            }
          : player
      );
      
      const pot = calculatePot(updatedPlayers);
      const playersWithChances = updateWinChances(updatedPlayers, pot);
      
      return {
        ...prev,
        players: playersWithChances,
        pot,
      };
    });
  }, [calculatePot, updateWinChances]);

  // Remove NFT from player
  const removeNFTFromPlayer = useCallback((playerId: string, nftIndex: number) => {
    setState(prev => {
      const updatedPlayers = prev.players.map(player => {
        if (player.id === playerId) {
          const removedNFT = player.nfts[nftIndex];
          const newNFTs = player.nfts.filter((_, index) => index !== nftIndex);
          return {
            ...player,
            nfts: newNFTs,
            totalValue: player.totalValue - removedNFT.value,
          };
        }
        return player;
      });
      
      const pot = calculatePot(updatedPlayers);
      const playersWithChances = updateWinChances(updatedPlayers, pot);
      
      return {
        ...prev,
        players: playersWithChances,
        pot,
        eliminatedNFTs: [...prev.eliminatedNFTs, prev.players.find(p => p.id === playerId)?.nfts[nftIndex]!],
      };
    });
  }, [calculatePot, updateWinChances]);

  // Start countdown
  const startCountdown = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'RUNNING' }));
    
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(interval);
          startGame();
          return prev;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    
    setCountdownInterval(interval);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setState(prev => ({ ...prev, countdown: 0 }));
    
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.players.filter(p => p.nfts.length > 0).length <= 1) {
          clearInterval(interval);
          
          // Game ended, find winner and update stats
          const winner = prev.players.find(p => p.nfts.length > 0);
          if (winner) {
            // We need to get the current game number from the component
            // This will be handled in the component that calls startGame
          }
          
          return { ...prev, phase: 'FINALIZED' };
        }
        
        // Elimination phase
        const activePlayers = prev.players.filter(p => p.nfts.length > 0);
        const potTotal = calculatePot(activePlayers);
        
        if (potTotal > 0) {
          const eliminatedPlayer = weightedPickPlayer(activePlayers, potTotal);
          const nftIndex = pickRandomNFT(eliminatedPlayer);
          
          // Add log
          const log = `Eliminated: ${eliminatedPlayer.name}'s ${eliminatedPlayer.nfts[nftIndex].name} (${eliminatedPlayer.nfts[nftIndex].value} TON)`;
          
          // Actually remove the NFT
          const updatedPlayers = prev.players.map(player => {
            if (player.id === eliminatedPlayer.id) {
              const removedNFT = player.nfts[nftIndex];
              const newNFTs = player.nfts.filter((_, index) => index !== nftIndex);
              return {
                ...player,
                nfts: newNFTs,
                totalValue: player.totalValue - removedNFT.value,
              };
            }
            return player;
          });
          
          const newPot = calculatePot(updatedPlayers);
          const playersWithChances = updateWinChances(updatedPlayers, newPot);
          
          return {
            ...prev,
            players: playersWithChances,
            pot: newPot,
            roundPhase: prev.roundPhase + 1,
            logs: [...prev.logs, log],
          };
        }
        
        return prev;
      });
    }, settings.phaseDelay * 1000);
    
    setGameInterval(interval);
  }, [settings.phaseDelay, calculatePot]);

  // Update game statistics when a game ends
  const updateGameStats = useCallback((winner: Player, gameNumber: number) => {
    const winnerGain = winner.totalValue;
    const winnerChance = winner.winChance;
    
    // Always update last game stats
    setLastGameStats({
      winner,
      winnerGain,
      winnerChance,
      gameNumber,
    });
    
    // Only update top game stats if this win is bigger
    setTopGameStats(prev => {
      if (!prev || winnerGain > prev.winnerGain) {
        return {
          winner,
          winnerGain,
          winnerChance,
          gameNumber,
        };
      }
      return prev;
    });
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    if (countdownInterval) clearInterval(countdownInterval);
    if (gameInterval) clearInterval(gameInterval);
    
    // Reset to empty state instead of demo state
    const emptyPlayers = mockPlayers.map(player => ({
      ...player,
      nfts: [],
      totalValue: 0,
      winChance: 0,
    }));
    
    setState({
      phase: 'LOBBY',
      pot: 0,
      players: emptyPlayers,
      currentPlayer: null,
      eliminatedNFTs: [],
      logs: [],
      countdown: DEFAULT_SETTINGS.countdownDuration,
      roundPhase: 0,
    });
    
    setCountdownInterval(null);
    setGameInterval(null);
  }, [countdownInterval, gameInterval]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [countdownInterval, gameInterval]);

  return {
    state,
    addNFTToPlayer,
    removeNFTFromPlayer,
    startCountdown,
    resetGame,
    updateGameStats,
    lastGameStats,
    topGameStats,
    settings,
  };
};
