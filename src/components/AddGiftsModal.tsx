import React, { useState, useMemo } from 'react';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { NFT } from '../types';
import { rarityColors } from '../utils/mockData';
import { ArrowUpDown, Filter } from 'lucide-react';

interface AddGiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableNFTs: NFT[];
  onDeposit: (playerId: string, nft: NFT) => void;
  playerId: string;
}

export const AddGiftsModal: React.FC<AddGiftsModalProps> = ({
  isOpen,
  onClose,
  availableNFTs,
  onDeposit,
  playerId,
}) => {
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  


  const filteredAndSortedNFTs = useMemo(() => {
    let filtered = availableNFTs;
    
    // Apply rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(nft => nft.rarity === rarityFilter);
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.value - b.value;
      } else {
        return b.value - a.value;
      }
    });
  }, [availableNFTs, sortOrder, rarityFilter]);

  const selectedNFTsList = useMemo(() => {
    return availableNFTs.filter(nft => selectedNFTs.has(nft.id));
  }, [availableNFTs, selectedNFTs]);

  const totalValue = useMemo(() => {
    return selectedNFTsList.reduce((sum, nft) => sum + nft.value, 0);
  }, [selectedNFTsList]);

  const handleNFTToggle = (nftId: string) => {
    const newSelected = new Set(selectedNFTs);
    if (newSelected.has(nftId)) {
      newSelected.delete(nftId);
    } else {
      newSelected.add(nftId);
    }
    setSelectedNFTs(newSelected);
  };

  const handleConfirm = () => {
    selectedNFTsList.forEach(nft => {
      onDeposit(playerId, nft);
    });
    setSelectedNFTs(new Set());
    onClose();
  };

  const handleCancel = () => {
    setSelectedNFTs(new Set());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Gifts"
      footer={
        filteredAndSortedNFTs.length > 0 && selectedNFTs.size > 0 ? (
          <div className="flex gap-3 w-full">
            <Button 
              onClick={handleCancel}
              className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-700 text-white hover:bg-gray-600 rounded-md px-8 flex-1 h-14 text-base"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-ton text-white hover:bg-ton-light rounded-md px-8 flex-1 h-14 text-base"
            >
              Confirm
            </Button>
          </div>
        ) : undefined
      }
    >
      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value as any)}
            className="bg-background border border-border rounded px-2 py-1 text-sm"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          Price {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* NFT Grid or No Gifts Message */}
      {filteredAndSortedNFTs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 max-h-96 overflow-y-auto">
          {filteredAndSortedNFTs.map((nft) => (
            <div
              key={nft.id}
              className={`
                relative border-2 rounded-lg p-3 cursor-pointer transition-all
                ${selectedNFTs.has(nft.id) 
                  ? 'border-ton bg-ton/10' 
                  : 'border-border hover:border-ton/50'
                }
              `}
              onClick={() => handleNFTToggle(nft.id)}
            >
              {/* Selection Checkbox */}
              <div className={`
                absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedNFTs.has(nft.id) 
                  ? 'border-ton bg-ton text-white' 
                  : 'border-border'
                }
              `}>
                {selectedNFTs.has(nft.id) && '✓'}
              </div>
              
              {/* NFT Content */}
              <div className="text-center">
                <div className="text-3xl mb-2">{nft.image}</div>
                <p className="text-sm font-medium mb-1">{nft.name}</p>
                <p className={`text-xs ${rarityColors[nft.rarity]} mb-2`}>
                  {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                </p>
                <p className="text-ton font-semibold">{nft.value} TON</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          {/* Magnifying Glass Icon */}
          <div className="text-6xl mb-4 text-muted-foreground">🔍</div>
          
          {/* No Gifts Message */}
          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">No Gifts yet</p>
            <p className="text-sm text-muted-foreground">
              Buy one in our Shop or send it to{' '}
              <span className="text-blue-500 font-medium">@rolls_transfer</span>
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="px-6">
              Send Gifts
            </Button>
            <Button variant="default" className="px-6">
              Go to Shop
            </Button>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedNFTs.size > 0 && (
        <div className="bg-muted/20 rounded-lg p-4">
          <h4 className="font-medium mb-2">Selected Gifts:</h4>
          <div className="space-y-2">
            {selectedNFTsList.map((nft) => (
              <div key={nft.id} className="flex items-center justify-between text-sm">
                <span>{nft.name}</span>
                <span className="text-ton font-medium">{nft.value} TON</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
            <span className="font-medium">Total Value:</span>
            <span className="text-ton font-bold text-lg">{totalValue} TON</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
