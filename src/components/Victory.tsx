import React from 'react';
import { Button } from './ui/button';
import { Player } from '../types';

interface VictoryProps {
  winner: Player;
  totalPot: number;
  onPlayAgain: () => void;
}

export const Victory: React.FC<VictoryProps> = ({ winner, totalPot, onPlayAgain }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
        {/* Winner Crown */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-4xl">👑</span>
          </div>
        </div>

        {/* Winner Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Tournament Winner!</h1>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-2xl">{winner.shortName}</span>
          </div>
          <div className="text-white font-semibold text-lg mb-1">{winner.name}</div>
          <div className="text-sm text-muted-foreground mb-3">
            {winner.nfts.length} gift{winner.nfts.length !== 1 ? 's' : ''} • {winner.winChance.toFixed(1)}% chance
          </div>
        </div>

        {/* Prize */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Prize</div>
            <div className="text-3xl font-bold text-yellow-400">{totalPot} TON</div>
          </div>
        </div>

        {/* Winner's Gifts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Winner's Gifts</h3>
          <div className="grid grid-cols-3 gap-2">
            {winner.nfts.map((nft) => (
              <div
                key={nft.id}
                className="bg-muted/20 rounded-lg p-2 text-center"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-white text-xs">🎁</span>
                </div>
                <div className="text-xs text-white font-medium">{nft.name}</div>
                <div className="text-xs text-ton">{nft.value} TON</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onPlayAgain}
            variant="ton"
            size="lg"
            className="w-full h-12 text-base"
          >
            🎮 Play Again
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Tournament completed successfully!
          </div>
        </div>

        {/* Celebration Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 left-4 animate-bounce delay-100">🎉</div>
          <div className="absolute top-8 right-8 animate-bounce delay-200">🏆</div>
          <div className="absolute bottom-8 left-8 animate-bounce delay-300">💎</div>
          <div className="absolute bottom-4 right-4 animate-bounce delay-400">⭐</div>
        </div>
      </div>
    </div>
  );
};
