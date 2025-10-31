import { useState } from 'react';
import { Play, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MainMenuProps {
  onJoinRoom: (roomId: string, playerId: string, playerName: string, isHost: boolean) => void;
}

export function MainMenu({ onJoinRoom }: MainMenuProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;

    setIsLoading(true);
    try {
      const hostId = `host_${Date.now()}`;

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          host_id: hostId,
          status: 'waiting',
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_name: playerName,
          is_ready: false,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      onJoinRoom(room.id, player.id, playerName, true);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;

    setIsLoading(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('id', roomCode)
        .single();

      if (roomError || !room) {
        alert('Room not found!');
        return;
      }

      if (room.status !== 'waiting') {
        alert('Game already in progress!');
        return;
      }

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_name: playerName,
          is_ready: false,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      onJoinRoom(room.id, player.id, playerName, false);
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Beat Sync</h1>
          <p className="text-slate-400">Multiplayer Rhythm Game</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || isLoading}
            className="w-full py-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Create Room
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-400">or</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!playerName.trim() || !roomCode.trim() || isLoading}
            className="w-full py-4 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Join Room
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Share the room code with friends to play together!</p>
        </div>
      </div>
    </div>
  );
}
