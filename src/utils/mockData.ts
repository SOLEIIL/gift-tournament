import { NFT, Player } from '../types';

export const mockNFTs: NFT[] = [
  { id: "001", name: "Gift Box #001", image: "🎁", value: 5, rarity: "common" },
  { id: "002", name: "Gift Box #002", image: "🎁", value: 8, rarity: "common" },
  { id: "003", name: "Gift Box #003", image: "🎁", value: 12, rarity: "rare" },
  { id: "004", name: "Gift Box #004", image: "🎁", value: 15, rarity: "rare" },
  { id: "005", name: "Gift Box #005", image: "🎁", value: 20, rarity: "epic" },
  { id: "006", name: "Gift Box #006", image: "🎁", value: 25, rarity: "epic" },
  { id: "007", name: "Gift Box #007", image: "🎁", value: 35, rarity: "legendary" },
  { id: "008", name: "Gift Box #008", image: "🎁", value: 40, rarity: "legendary" },
  { id: "009", name: "Gift Box #009", image: "🎁", value: 6, rarity: "common" },
  { id: "010", name: "Gift Box #010", image: "🎁", value: 10, rarity: "rare" },
  { id: "011", name: "Gift Box #011", image: "🎁", value: 18, rarity: "epic" },
  { id: "012", name: "Gift Box #012", image: "🎁", value: 30, rarity: "legendary" },
];

export const mockPlayers: Player[] = [
  {
    id: "player1",
    name: "Alice",
    shortName: "A",
    nfts: [],
    totalValue: 0,
    winChance: 0,
  },
  {
    id: "player2", 
    name: "Bob",
    shortName: "B",
    nfts: [],
    totalValue: 0,
    winChance: 0,
  },
  {
    id: "player3",
    name: "Charlie",
    shortName: "C", 
    nfts: [],
    totalValue: 0,
    winChance: 0,
  },
  {
    id: "player4",
    name: "Diana",
    shortName: "D",
    nfts: [],
    totalValue: 0,
    winChance: 0,
  },
];

export const rarityColors = {
  common: "text-gray-400",
  rare: "text-blue-400", 
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

export const rarityBgColors = {
  common: "bg-gray-700",
  rare: "bg-blue-900",
  epic: "bg-purple-900", 
  legendary: "bg-yellow-900",
};
