import React from 'react';

interface PressureBarProps {
  missCount: number;
  maxMisses?: number;
}

export const PressureBar: React.FC<PressureBarProps> = ({
  missCount = 0,
  maxMisses = 5
}) => {
  const progressPercent = Math.min(100, Math.max(0, (missCount / maxMisses) * 100));
  const isNearLimit = missCount >= maxMisses - 1;

  return (
    <div className="w-full max-w-[480px] self-center flex items-center justify-between gap-2.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-950/90 via-slate-900/95 to-blue-950/90 border border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_10px_rgba(0,229,255,0.15)] pointer-events-none">
      {/* Left: Swirl Icon + OCEAN PRESSURE */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs leading-none filter drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]">
          🌀
        </span>
        <span className="text-[10px] font-black tracking-wider text-cyan-200 font-heading drop-shadow-sm">
          OCEAN PRESSURE
        </span>
      </div>

      {/* Center: Energy Progress Bar */}
      <div className="relative flex-1 bg-slate-950/90 rounded-full h-2 border border-cyan-500/30 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isNearLimit
              ? 'bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse'
              : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 shadow-[0_0_8px_rgba(0,229,255,0.7)]'
          }`}
          style={{ width: `${Math.max(3, progressPercent)}%` }}
        />
      </div>

      {/* Right: 5 Circular Pressure Beads (hạt áp suất) */}
      <div className="flex items-center gap-1 shrink-0">
        {[0, 1, 2, 3, 4].map((idx) => {
          const isActive = missCount > idx;
          const isWarningSlot = idx === 4;

          return (
            <div
              key={idx}
              className={`relative w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? isWarningSlot
                    ? 'bg-rose-500 border border-white shadow-[0_0_8px_rgba(244,63,94,1)] animate-ping'
                    : 'bg-cyan-300 border border-white/80 shadow-[0_0_6px_rgba(34,211,238,1)]'
                  : 'bg-slate-800/80 border border-cyan-500/30'
              }`}
            >
              {isActive && (
                <div className="w-0.5 h-0.5 rounded-full bg-white opacity-90" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
