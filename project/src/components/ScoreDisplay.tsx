interface ScoreDisplayProps {
  score: number;
  combo: number;
  excellent: number;
  good: number;
  miss: number;
}

export function ScoreDisplay({ score, combo, excellent, good, miss }: ScoreDisplayProps) {
  return (
    <div className="w-80 mx-auto mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Score</div>
          <div className="text-3xl font-bold text-white">{score.toLocaleString()}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400">Combo</div>
          <div className="text-3xl font-bold text-yellow-400">{combo}x</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 mt-4 border border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-emerald-400 font-bold text-2xl">{excellent}</div>
            <div className="text-xs text-slate-400">Excellent</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-2xl">{good}</div>
            <div className="text-xs text-slate-400">Good</div>
          </div>
          <div>
            <div className="text-red-400 font-bold text-2xl">{miss}</div>
            <div className="text-xs text-slate-400">Miss</div>
          </div>
        </div>
      </div>
    </div>
  );
}
