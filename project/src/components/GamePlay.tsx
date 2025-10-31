import { useEffect, useState } from 'react';
import { NoteHighway } from './NoteHighway';
import { TimingBar } from './TimingBar';
import { ScoreDisplay } from './ScoreDisplay';
import { useGameEngine } from '../hooks/useGameEngine';
import { getSongById } from '../lib/songs';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Player = Database['public']['Tables']['players']['Row'];

interface GamePlayProps {
  roomId: string;
  playerId: string;
  masterSequence: string;
  startTime: number;
  onGameEnd: () => void;
}

export function GamePlay({
  roomId,
  playerId,
  masterSequence,
  startTime,
  onGameEnd,
}: GamePlayProps) {
  const song = getSongById(masterSequence);
  const { currentTime, stats, lastHitTiming, handleNoteHit } = useGameEngine(song, startTime);
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleNoteHit(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNoteHit]);

  useEffect(() => {
    const updatePlayerStats = async () => {
      await supabase
        .from('players')
        .update({
          score: stats.score,
          combo: stats.combo,
          excellent_hits: stats.excellent,
          good_hits: stats.good,
          miss_count: stats.miss,
        })
        .eq('id', playerId);
    };

    updatePlayerStats();

    const interval = setInterval(updatePlayerStats, 500);
    return () => clearInterval(interval);
  }, [playerId, stats]);

  useEffect(() => {
    const fetchOtherPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .neq('id', playerId);

      if (data) {
        setOtherPlayers(data);
      }
    };

    fetchOtherPlayers();

    const channel = supabase
      .channel(`game:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchOtherPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId]);

  useEffect(() => {
    if (!song) return;

    if (currentTime > song.duration + 3) {
      setTimeout(async () => {
        await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId);
        onGameEnd();
      }, 1000);
    }
  }, [currentTime, song, roomId, onGameEnd]);

  if (!song) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const countdown = Math.ceil(3 - currentTime);
  const showCountdown = countdown > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white">{song.name}</h2>
          <p className="text-slate-400">{song.bpm} BPM</p>
        </div>

        {showCountdown && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="text-9xl font-bold text-white animate-pulse">{countdown}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <NoteHighway
              notes={song.sequence}
              currentTime={currentTime}
              onNoteHit={handleNoteHit}
            />

            <TimingBar lastHitTiming={lastHitTiming} />

            <ScoreDisplay
              score={stats.score}
              combo={stats.combo}
              excellent={stats.excellent}
              good={stats.good}
              miss={stats.miss}
            />
          </div>

          <div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Other Players</h3>
              <div className="space-y-3">
                {otherPlayers.map((player) => (
                  <div key={player.id} className="bg-slate-700/50 rounded-lg p-3">
                    <div className="font-medium text-white mb-2">{player.player_name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400">Score:</span>
                        <span className="ml-2 text-white font-bold">
                          {player.score.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Combo:</span>
                        <span className="ml-2 text-yellow-400 font-bold">{player.combo}x</span>
                      </div>
                    </div>
                  </div>
                ))}
                {otherPlayers.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">No other players</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
