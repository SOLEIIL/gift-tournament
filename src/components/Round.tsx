import React from 'react';
import { Player } from '../types';

interface RoundProps {
  players: Player[];
  pot: number;
  logs: string[];
  roundPhase: string;
}

export const Round: React.FC<RoundProps> = ({ players, pot, logs, roundPhase }) => {
  const activePlayers = players.filter(p => p.nfts.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Tournament Round</h1>
        <div className="text-lg text-yellow-400 font-semibold">
          Total Pot: {pot} TON
        </div>
        <div className="text-sm text-gray-400">
          Phase: {roundPhase}
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {activePlayers.map((player) => (
          <div
            key={player.id}
            className="bg-card border border-border rounded-lg p-4 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">{player.shortName}</span>
            </div>
            <div className="text-white font-semibold mb-1">{player.name}</div>
            <div className="text-sm text-muted-foreground mb-2">
              {player.nfts.length} gift{player.nfts.length !== 1 ? 's' : ''}
            </div>
            <div className="text-ton font-bold">{player.totalValue} TON</div>
            <div className="text-xs text-muted-foreground">
              {player.winChance.toFixed(1)}% chance
            </div>
          </div>
        ))}
      </div>

      {/* Live Logs */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Live Action</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{log}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Waiting for action...
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-white">Tournament in Progress</span>
        </div>
      </div>
    </div>
  );
};
