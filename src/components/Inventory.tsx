import React from 'react';
import { Button } from './ui/button';
import { NFT } from '../types';

interface InventoryProps {
  onPageChange: (page: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn') => void;
  currentPage: 'pvp' | 'rolls' | 'inventory' | 'shop' | 'earn';
  userGifts: NFT[];
  totalTON: number;
}

export const Inventory: React.FC<InventoryProps> = ({
  onPageChange,
  currentPage,
  userGifts,
  totalTON
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">My Inventory</h1>
        <div className="text-lg text-yellow-400 font-semibold">
          Total Value: {totalTON} TON
        </div>
        <div className="text-sm text-gray-400">
          {userGifts.length} gift{userGifts.length !== 1 ? 's' : ''} in collection
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="mb-6">
        {userGifts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {userGifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-card border border-border rounded-lg p-4 text-center hover:border-ton/50 transition-colors"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-2xl">🎁</span>
                </div>
                <div className="text-white font-semibold mb-1">{gift.name}</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {gift.description || 'A special gift'}
                </div>
                <div className="text-ton font-bold text-lg">{gift.value} TON</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Rarity: {gift.rarity || 'Common'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-muted-foreground">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Empty Inventory</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any gifts yet. Start playing to collect them!
            </p>
            <Button
              onClick={() => onPageChange('pvp')}
              variant="ton"
              size="lg"
              className="w-full max-w-xs"
            >
              🎮 Start Playing
            </Button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {userGifts.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Collection Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ton">{userGifts.length}</div>
              <div className="text-sm text-muted-foreground">Total Gifts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalTON}</div>
              <div className="text-sm text-muted-foreground">Total Value (TON)</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* PvP */}
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
          
          {/* Inventory - Current Page */}
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
