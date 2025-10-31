import { useEffect, useState } from 'react';
import { Trophy, Medal, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Player = Database['public']['Tables']['players']['Row'];

interface ResultsProps {
  roomId: string;
  onReturnHome: () => void;
}

export function Results({ roomId, onReturnHome }: ResultsProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('score', { ascending: false });

      if (data) {
        setPlayers(data);
      }
    };

    fetchResults();
  }, [roomId]);

  const getMedalColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-slate-300';
    if (rank === 2) return 'text-orange-400';
    return 'text-slate-500';
  };

  const getRankBg = (rank: number) => {
    if (rank === 0) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (rank === 1) return 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 border-slate-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30';
    return 'bg-slate-700/30 border-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Game Results</h1>
            <p className="text-slate-400">Final Rankings</p>
          </div>

          <div className="space-y-4 mb-8">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${getRankBg(index)}`}
              >
                <div className="flex-shrink-0 w-12 text-center">
                  {index < 3 ? (
                    <Medal className={`w-8 h-8 mx-auto ${getMedalColor(index)}`} />
                  ) : (
                    <div className="text-2xl font-bold text-slate-500">#{index + 1}</div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="text-xl font-bold text-white mb-2">{player.player_name}</div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Score</div>
                      <div className="text-white font-bold">{player.score.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-emerald-400">Excellent</div>
                      <div className="text-white font-bold">{player.excellent_hits}</div>
                    </div>
                    <div>
                      <div className="text-blue-400">Good</div>
                      <div className="text-white font-bold">{player.good_hits}</div>
                    </div>
                    <div>
                      <div className="text-red-400">Miss</div>
                      <div className="text-white font-bold">{player.miss_count}</div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-400">Accuracy</div>
                  <div className="text-2xl font-bold text-white">
                    {(
                      ((player.excellent_hits + player.good_hits) /
                        (player.excellent_hits + player.good_hits + player.miss_count || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onReturnHome}
            className="w-full py-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
