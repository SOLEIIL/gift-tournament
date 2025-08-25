import { Player } from '../types';
import { gameRNG } from './rng';

export function weightedPickPlayer(players: Player[], potTotal: number): Player {
  const random = gameRNG.nextFloat() * potTotal;
  let cumulative = 0;
  
  for (const player of players) {
    cumulative += player.totalValue;
    if (random <= cumulative) {
      return player;
    }
  }
  
  // Fallback to last player (shouldn't happen with proper math)
  return players[players.length - 1];
}

export function pickRandomNFT(player: Player): number {
  return gameRNG.nextInt(0, player.nfts.length - 1);
}
