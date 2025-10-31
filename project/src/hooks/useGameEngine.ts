import { useState, useEffect, useCallback, useRef } from 'react';
import type { Note, Song } from '../lib/songs';

interface GameStats {
  score: number;
  combo: number;
  excellent: number;
  good: number;
  miss: number;
}

const PERFECT_WINDOW = 0.05;
const EXCELLENT_WINDOW = 0.1;
const GOOD_WINDOW = 0.15;
const MAX_WINDOW = 0.2;

const PERFECT_POINTS = 300;
const EXCELLENT_POINTS = 200;
const GOOD_POINTS = 100;

export function useGameEngine(song: Song | null, startTime: number | null) {
  const [currentTime, setCurrentTime] = useState(0);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    excellent: 0,
    good: 0,
    miss: 0,
  });
  const [lastHitTiming, setLastHitTiming] = useState<number | null>(null);
  const [hitNotes, setHitNotes] = useState<Set<number>>(new Set());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!startTime) return;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startTime]);

  useEffect(() => {
    if (!song || !startTime) return;

    const checkMissedNotes = () => {
      song.sequence.forEach((note, index) => {
        if (hitNotes.has(index)) return;

        const timeDiff = currentTime - note.time;
        if (timeDiff > MAX_WINDOW) {
          setHitNotes((prev) => new Set(prev).add(index));
          setStats((prev) => ({
            ...prev,
            miss: prev.miss + 1,
            combo: 0,
          }));
        }
      });
    };

    checkMissedNotes();
  }, [currentTime, song, hitNotes, startTime]);

  const handleNoteHit = useCallback(
    (direction: Note['direction']) => {
      if (!song) return;

      const closestNote = song.sequence
        .map((note, index) => ({ note, index }))
        .filter(
          ({ note, index }) =>
            note.direction === direction &&
            !hitNotes.has(index) &&
            Math.abs(currentTime - note.time) <= MAX_WINDOW
        )
        .sort((a, b) => Math.abs(a.note.time - currentTime) - Math.abs(b.note.time - currentTime))[0];

      if (!closestNote) return;

      const timingError = currentTime - closestNote.note.time;
      const absError = Math.abs(timingError);

      setHitNotes((prev) => new Set(prev).add(closestNote.index));
      setLastHitTiming(timingError);

      let points = 0;
      let category: 'excellent' | 'good' | null = null;

      if (absError < PERFECT_WINDOW) {
        points = PERFECT_POINTS;
        category = 'excellent';
      } else if (absError < EXCELLENT_WINDOW) {
        points = EXCELLENT_POINTS;
        category = 'excellent';
      } else if (absError < GOOD_WINDOW) {
        points = GOOD_POINTS;
        category = 'good';
      }

      if (points > 0) {
        setStats((prev) => {
          const newCombo = prev.combo + 1;
          const comboMultiplier = Math.floor(newCombo / 10) * 0.1 + 1;
          return {
            ...prev,
            score: prev.score + Math.floor(points * comboMultiplier),
            combo: newCombo,
            excellent: category === 'excellent' ? prev.excellent + 1 : prev.excellent,
            good: category === 'good' ? prev.good + 1 : prev.good,
          };
        });
      }
    },
    [song, currentTime, hitNotes]
  );

  const reset = useCallback(() => {
    setCurrentTime(0);
    setStats({
      score: 0,
      combo: 0,
      excellent: 0,
      good: 0,
      miss: 0,
    });
    setLastHitTiming(null);
    setHitNotes(new Set());
  }, []);

  return {
    currentTime,
    stats,
    lastHitTiming,
    handleNoteHit,
    reset,
  };
}
