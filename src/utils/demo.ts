import { mockPlayers, mockNFTs } from './mockData';
import { NFT } from '../types';

// Demo function to simulate some initial deposits for testing
export const createDemoState = () => {
  const demoPlayers = [...mockPlayers];
  
  // Simulate some initial deposits
  const demoNFTs = [
    mockNFTs[0], // Gift Box #001 (5 TON)
    mockNFTs[2], // Gift Box #003 (12 TON)
    mockNFTs[4], // Gift Box #005 (20 TON)
    mockNFTs[6], // Gift Box #007 (35 TON)
  ];
  
  // Add NFTs to first player (Alice)
  demoPlayers[0].nfts = [demoNFTs[0], demoNFTs[2]];
  demoPlayers[0].totalValue = demoNFTs[0].value + demoNFTs[2].value;
  
  // Add NFTs to second player (Bob)
  demoPlayers[1].nfts = [demoNFTs[1], demoNFTs[3]];
  demoPlayers[1].totalValue = demoNFTs[1].value + demoNFTs[3].value;
  
  // Calculate win chances
  const totalPot = demoPlayers.reduce((sum, p) => sum + p.totalValue, 0);
  demoPlayers.forEach(player => {
    player.winChance = totalPot > 0 ? (player.totalValue / totalPot) * 100 : 0;
  });
  
  return {
    players: demoPlayers,
    pot: totalPot,
  };
};

// Function to get available NFTs (excluding deposited ones)
export const getAvailableNFTs = (depositedNFTs: NFT[]) => {
  const depositedIds = new Set(depositedNFTs.map(nft => nft.id));
  return mockNFTs.filter(nft => !depositedIds.has(nft.id));
};
