import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Player } from '../types';
import { rarityColors } from '../utils/mockData';
import { Trophy, Gift, Star } from 'lucide-react';

interface VictoryProps {
  winner: Player;
  totalPot: number;
  onPlayAgain: () => void;
}

export const Victory: React.FC<VictoryProps> = ({
  winner,
  totalPot,
  onPlayAgain,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-2 h-2 rounded-full animate-confetti
                ${['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][i % 5]}
              `}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Victory Content */}
      <div className="max-w-2xl mx-auto text-center">
        {/* Winner Crown */}
        <div className="mb-8">
          <div className="text-8xl mb-4">👑</div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Tournament Champion!
          </h1>
          <p className="text-xl text-muted-foreground">
            Congratulations to our winner
          </p>
        </div>

        {/* Winner Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-yellow-400">
                {winner.shortName}
              </span>
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-bold">{winner.name}</h2>
              <p className="text-lg text-muted-foreground">
                Total Value: <span className="text-ton font-semibold">{winner.totalValue} TON</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-ton">{winner.nfts.length}</div>
              <div className="text-sm text-muted-foreground">Gifts Won</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{totalPot}</div>
              <div className="text-sm text-muted-foreground">Total Pot</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {((winner.totalValue / totalPot) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Won NFTs */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <Gift className="h-5 w-5 text-ton" />
            Prizes Won
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {winner.nfts.map((nft) => (
              <div key={nft.id} className="bg-muted/20 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">{nft.image}</div>
                <p className="text-sm font-medium mb-1">{nft.name}</p>
                <p className={`text-xs ${rarityColors[nft.rarity]} mb-2`}>
                  {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                </p>
                <p className="text-ton font-semibold">{nft.value} TON</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-yellow-400">Won!</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Summary */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Tournament Summary
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-ton">{totalPot}</div>
              <div className="text-sm text-muted-foreground">Total Pot Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-foreground">
                {winner.nfts.reduce((sum, nft) => sum + nft.value, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Winner's Share</div>
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <div className="text-center">
          <Button
            onClick={onPlayAgain}
            variant="success"
            size="lg"
            className="h-16 px-8 text-lg"
          >
            🎮 Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};
