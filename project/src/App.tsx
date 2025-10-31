import { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { Lobby } from './components/Lobby';
import { GamePlay } from './components/GamePlay';
import { Results } from './components/Results';
import { supabase } from './lib/supabase';

type GameState = 'menu' | 'lobby' | 'playing' | 'results';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [roomId, setRoomId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [masterSequence, setMasterSequence] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room_updates:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          const room = payload.new;
          if (room.master_sequence) {
            setMasterSequence(room.master_sequence);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleJoinRoom = (
    newRoomId: string,
    newPlayerId: string,
    newPlayerName: string,
    newIsHost: boolean
  ) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    setPlayerName(newPlayerName);
    setIsHost(newIsHost);
    setGameState('lobby');
  };

  const handleGameStart = (startTimestamp: number) => {
    setStartTime(startTimestamp);
    setGameState('playing');
  };

  const handleGameEnd = () => {
    setGameState('results');
  };

  const handleReturnHome = () => {
    setGameState('menu');
    setRoomId('');
    setPlayerId('');
    setPlayerName('');
    setIsHost(false);
    setMasterSequence('');
    setStartTime(0);
  };

  return (
    <>
      {gameState === 'menu' && <MainMenu onJoinRoom={handleJoinRoom} />}

      {gameState === 'lobby' && (
        <Lobby
          roomId={roomId}
          playerId={playerId}
          playerName={playerName}
          isHost={isHost}
          onGameStart={handleGameStart}
        />
      )}

      {gameState === 'playing' && (
        <GamePlay
          roomId={roomId}
          playerId={playerId}
          masterSequence={masterSequence || 'easy_groove'}
          startTime={startTime}
          onGameEnd={handleGameEnd}
        />
      )}

      {gameState === 'results' && <Results roomId={roomId} onReturnHome={handleReturnHome} />}
    </>
  );
}

export default App;
