export interface Note {
  time: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

export interface Song {
  id: string;
  name: string;
  bpm: number;
  duration: number;
  sequence: Note[];
}

const generateSequence = (bpm: number, duration: number): Note[] => {
  const directions: Note['direction'][] = ['up', 'down', 'left', 'right'];
  const beatInterval = 60 / bpm;
  const notes: Note[] = [];

  for (let time = 2; time < duration - 1; time += beatInterval) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    notes.push({ time, direction });
  }

  return notes;
};

export const songs: Song[] = [
  {
    id: 'easy_groove',
    name: 'Easy Groove',
    bpm: 100,
    duration: 30,
    sequence: generateSequence(100, 30),
  },
  {
    id: 'medium_beat',
    name: 'Medium Beat',
    bpm: 130,
    duration: 45,
    sequence: generateSequence(130, 45),
  },
  {
    id: 'hard_rush',
    name: 'Hard Rush',
    bpm: 160,
    duration: 60,
    sequence: generateSequence(160, 60),
  },
];

export const getSongById = (id: string): Song | undefined => {
  return songs.find((song) => song.id === id);
};
