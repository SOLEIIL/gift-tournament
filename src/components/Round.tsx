import React, { useEffect, useState } from 'react';
import { Player } from '../types';

interface RoundProps {
  players: Player[];
  pot: number;
  logs: string[];
  roundPhase: number;
}

export const Round: React.FC<RoundProps> = ({
  players,
  pot,
  logs,
  roundPhase,
}) => {
  const [isShrinking, setIsShrinking] = useState(false);
  const [eliminatedNFTs] = useState<Set<string>>(new Set());

  const activePlayers = players.filter(p => p.nfts.length > 0);
  const allNFTs = activePlayers.flatMap(player => 
    player.nfts.map(nft => ({ ...nft, player }))
  );

  useEffect(() => {
    if (roundPhase > 0) {
      setIsShrinking(true);
      setTimeout(() => setIsShrinking(false), 1200);
    }
  }, [roundPhase]);

  // Calculate positions in a circle
  const getNFTPosition = (index: number, total: number) => {
    if (total === 0) return { x: 0, y: 0 };
    
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
    const radius = isShrinking ? 120 : 150; // Shrink effect
    const centerX = 200;
    const centerY = 200;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Tournament Arena */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Tournament Arena</h2>
          <p className="text-muted-foreground">
            Round {roundPhase} • {activePlayers.length} players remaining
          </p>
        </div>

        {/* Circle Arena */}
        <div className="relative w-full max-w-md mx-auto mb-6">
          {/* Arena Circle */}
          <div className={`
            w-80 h-80 mx-auto border-2 border-dashed border-muted-foreground/30 rounded-full
            flex items-center justify-center transition-all duration-1200
            ${isShrinking ? 'scale-90' : 'scale-100'}
          `}>
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-ton">{pot} TON</div>
              <div className="text-sm text-muted-foreground">Total Pot</div>
            </div>
          </div>

          {/* NFTs positioned around the circle */}
          {allNFTs.map((nftWithPlayer, index) => {
            const position = getNFTPosition(index, allNFTs.length);
            const isEliminated = eliminatedNFTs.has(nftWithPlayer.id);
            
            return (
              <div
                key={`${nftWithPlayer.player.id}-${nftWithPlayer.id}`}
                className={`
                  absolute w-16 h-16 transition-all duration-500
                  ${isEliminated ? 'animate-eliminate' : ''}
                `}
                style={{
                  left: position.x - 32,
                  top: position.y - 32,
                }}
              >
                <div className={`
                  w-full h-full rounded-lg border-2 p-2 text-center
                  ${isEliminated 
                    ? 'border-destructive bg-destructive/20 opacity-50' 
                    : 'border-border bg-card hover:border-ton/50'
                  }
                `}>
                  <div className="text-2xl mb-1">{nftWithPlayer.image}</div>
                  <div className="text-xs font-medium text-ton">
                    {nftWithPlayer.value} TON
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {nftWithPlayer.player.shortName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlayers.map((player) => (
            <div key={player.id} className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-ton/20 rounded-full flex items-center justify-center">
                  <span className="font-bold text-ton">{player.shortName}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{player.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {player.nfts.length} gift{player.nfts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Value:</span>
                  <span className="font-semibold text-ton">{player.totalValue} TON</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Win Chance:</span>
                  <span className="font-semibold text-accent-foreground">
                    {player.winChance.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tournament Logs */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Tournament Log</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Tournament is starting...
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-muted/20 rounded">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <span className="text-sm">{log}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
