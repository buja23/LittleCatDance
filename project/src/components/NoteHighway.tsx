import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Note } from '../lib/songs';

interface NoteHighwayProps {
  notes: Note[];
  currentTime: number;
  onNoteHit: (direction: Note['direction']) => void;
}

const HIGHWAY_HEIGHT = 500;
const NOTE_SPEED = 200;
const HIT_ZONE_POSITION = 450;

export function NoteHighway({ notes, currentTime }: NoteHighwayProps) {
  const getArrowIcon = (direction: Note['direction']) => {
    switch (direction) {
      case 'up':
        return ArrowUp;
      case 'down':
        return ArrowDown;
      case 'left':
        return ArrowLeft;
      case 'right':
        return ArrowRight;
    }
  };

  const visibleNotes = notes.filter((note) => {
    const notePosition = (currentTime - note.time) * NOTE_SPEED + HIT_ZONE_POSITION;
    return notePosition >= -50 && notePosition <= HIGHWAY_HEIGHT + 50;
  });

  return (
    <div className="relative w-80 mx-auto bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-2xl overflow-hidden border-2 border-slate-700">
      <div className="relative" style={{ height: HIGHWAY_HEIGHT }}>
        <div className="absolute inset-x-0 flex justify-center gap-4 px-4">
          {(['left', 'down', 'up', 'right'] as const).map((direction) => (
            <div
              key={direction}
              className="w-16 h-full bg-slate-800/30 border-x border-slate-700/50"
            />
          ))}
        </div>

        <div
          className="absolute inset-x-0 h-20 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border-y-2 border-emerald-500/50"
          style={{ top: HIT_ZONE_POSITION - 40 }}
        >
          <div className="absolute inset-0 flex items-center justify-center gap-4 px-4">
            {(['left', 'down', 'up', 'right'] as const).map((direction) => {
              const Icon = getArrowIcon(direction);
              return (
                <div
                  key={direction}
                  className="w-16 h-16 flex items-center justify-center border-2 border-emerald-500/30 rounded-lg"
                >
                  <Icon className="w-8 h-8 text-emerald-500/30" />
                </div>
              );
            })}
          </div>
        </div>

        {visibleNotes.map((note, index) => {
          const Icon = getArrowIcon(note.direction);
          const notePosition = (currentTime - note.time) * NOTE_SPEED + HIT_ZONE_POSITION;
          const laneIndex = ['left', 'down', 'up', 'right'].indexOf(note.direction);

          return (
            <div
              key={`${note.time}-${index}`}
              className="absolute transition-all duration-100"
              style={{
                top: `${notePosition}px`,
                left: `${20 + laneIndex * 80}px`,
                width: '64px',
              }}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-blue-500 border-2 border-blue-300 rounded-lg shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
