interface TimingBarProps {
  lastHitTiming: number | null;
}

export function TimingBar({ lastHitTiming }: TimingBarProps) {
  const getTimingLabel = (timing: number) => {
    const absError = Math.abs(timing);
    if (absError < 0.05) return 'PERFECT!';
    if (absError < 0.1) return 'EXCELLENT';
    if (absError < 0.15) return 'GOOD';
    return 'OK';
  };

  const getTimingColor = (timing: number) => {
    const absError = Math.abs(timing);
    if (absError < 0.05) return 'text-yellow-400';
    if (absError < 0.1) return 'text-emerald-400';
    if (absError < 0.15) return 'text-blue-400';
    return 'text-slate-400';
  };

  return (
    <div className="w-80 mx-auto mt-6">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="text-center text-sm text-slate-400 mb-2">Timing</div>

        <div className="relative h-12 bg-slate-900 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-gradient-to-r from-red-500/20 to-yellow-500/20" />
            <div className="w-1 bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            <div className="flex-1 bg-gradient-to-l from-red-500/20 to-yellow-500/20" />
          </div>

          {lastHitTiming !== null && (
            <div
              className="absolute top-0 bottom-0 w-2 bg-white rounded transition-all duration-300"
              style={{
                left: `calc(50% + ${lastHitTiming * 200}px)`,
                transform: 'translateX(-50%)',
              }}
            />
          )}
        </div>

        {lastHitTiming !== null && (
          <div className={`text-center mt-2 font-bold ${getTimingColor(lastHitTiming)}`}>
            {getTimingLabel(lastHitTiming)}
            <span className="text-xs ml-2 text-slate-500">
              {lastHitTiming > 0 ? 'Late' : 'Early'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
