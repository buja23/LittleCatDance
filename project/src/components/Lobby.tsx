import { useState, useEffect } from 'react';
import { Users, Play, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { songs } from '../lib/songs';
import type { Database } from '../lib/database.types';

type Player = Database['public']['Tables']['players']['Row'];

interface LobbyProps {
  roomId: string;
  playerId: string;
  playerName: string;
  isHost: boolean;
  onGameStart: (startTime: number) => void;
}

export function Lobby({ roomId, playerId, playerName, isHost, onGameStart }: LobbyProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedSong, setSelectedSong] = useState(songs[0].id);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at');

      if (data) {
        setPlayers(data);
      }
    };

    fetchPlayers();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchPlayers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          const room = payload.new as Database['public']['Tables']['rooms']['Row'];
          if (room.status === 'playing' && room.started_at) {
            const startTime = new Date(room.started_at).getTime();
            onGameStart(startTime);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, onGameStart]);

  const handleReadyToggle = async () => {
    const newReadyState = !isReady;
    await supabase.from('players').update({ is_ready: newReadyState }).eq('id', playerId);
    setIsReady(newReadyState);
  };

  const handleStartGame = async () => {
    if (!isHost) return;

    const allReady = players.every((p) => p.is_ready || p.id === playerId);
    if (!allReady) return;

    const startTime = Date.now() + 3000;

    await supabase
      .from('rooms')
      .update({
        status: 'playing',
        master_sequence: selectedSong,
        started_at: new Date(startTime).toISOString(),
      })
      .eq('id', roomId);
  };

  const allPlayersReady = players.every((p) => p.is_ready);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Game Lobby</h1>
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-5 h-5" />
              <span>{players.length} players</span>
            </div>
          </div>

          {isHost && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Song
              </label>
              <select
                value={selectedSong}
                onChange={(e) => setSelectedSong(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {songs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.name} ({song.bpm} BPM - {song.duration}s)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3 mb-8">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  player.is_ready
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-slate-700/50 border border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {player.player_name === playerName && (
                    <Crown className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className="text-white font-medium">{player.player_name}</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    player.is_ready ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {player.is_ready ? 'Ready' : 'Not Ready'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReadyToggle}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                isReady
                  ? 'bg-slate-600 text-white hover:bg-slate-500'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isReady ? 'Not Ready' : 'Ready'}
            </button>

            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!allPlayersReady}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
