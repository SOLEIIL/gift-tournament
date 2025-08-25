export interface NFT {
  id: string;
  name: string;
  image: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  nfts: NFT[];
  totalValue: number;
  winChance: number;
}

export interface TournamentState {
  phase: 'LOBBY' | 'RUNNING' | 'FINALIZED';
  pot: number;
  players: Player[];
  currentPlayer: Player | null;
  eliminatedNFTs: NFT[];
  logs: string[];
  countdown: number;
  roundPhase: number;
}

export interface GameSettings {
  countdownDuration: number;
  phaseDelay: number;
  maxPhaseDelay: number;
  phaseDelayIncrement: number;
  phaseDelayIncrementInterval: number;
}
