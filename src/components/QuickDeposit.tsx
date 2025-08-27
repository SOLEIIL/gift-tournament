import React from 'react';
import { Button } from './ui/button';
import { NFT } from '../types';
import { Zap } from 'lucide-react';

interface QuickDepositProps {
  availableNFTs: NFT[];
  depositedNFTs: NFT[];
  onDeposit: (playerId: string, nft: NFT) => void;
  playerId: string;
}

export const QuickDeposit: React.FC<QuickDepositProps> = ({
  availableNFTs,
  depositedNFTs,
  onDeposit,
  playerId,
}) => {
  // Find the cheapest NFT not yet deposited
  const getCheapestAvailableNFT = (): NFT | null => {
    const depositedIds = new Set(depositedNFTs.map(nft => nft.id));
    const available = availableNFTs.filter(nft => !depositedIds.has(nft.id));
    
    if (available.length === 0) return null;
    
    return available.reduce((cheapest, current) => 
      current.value < cheapest.value ? current : cheapest
    );
  };

  const cheapestNFT = getCheapestAvailableNFT();

  const handleQuickDeposit = () => {
    if (cheapestNFT) {
      onDeposit(playerId, cheapestNFT);
    }
  };

  if (!cheapestNFT) {
    return (
      <Button 
        variant="ton" 
        size="lg" 
        className="h-14 text-base opacity-50 cursor-not-allowed flex-1"
        disabled
      >
        <Zap className="h-4 w-4 mr-2" />
        All Deposited
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleQuickDeposit}
      variant="ton" 
      size="lg" 
      className="h-14 text-base flex-1"
    >
      <Zap className="h-4 w-4 mr-2" />
      Quick
      <div className="ml-1 text-xs opacity-80">
        {cheapestNFT.value} TON
      </div>
    </Button>
  );
};
