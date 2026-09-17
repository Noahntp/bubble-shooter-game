import React from 'react';

interface ShotsBadgeProps {
  shotsLeft: number;
}

export const ShotsBadge: React.FC<ShotsBadgeProps> = ({ shotsLeft }) => {
  const isLow = shotsLeft <= 5;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] ${
        isLow
          ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.7)]'
          : 'bg-gradient-to-b from-slate-900/95 via-blue-950/90 to-slate-950/95 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
      }`}
      title="Số lượt bắn còn lại"
    >
      <span className="text-sm leading-none filter drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]">
        🌀
      </span>
      <span className="font-heading font-black text-sm tracking-wide">
        {shotsLeft}
      </span>
    </div>
  );
};
