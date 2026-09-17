import React from 'react';

interface PowerUpButtonProps {
  type: 'CRAB' | 'LIGHTNING' | 'WHIRLPOOL';
  icon: string | React.ReactNode;
  count: number;
  label: string;
  onClick: () => void;
}

export const PowerUpButton: React.FC<PowerUpButtonProps> = ({
  type,
  icon,
  count,
  label,
  onClick
}) => {
  return (
    <div className="flex flex-col items-center gap-1 pointer-events-auto">
      <button
        onClick={onClick}
        className="group relative w-13 h-13 rounded-full bg-gradient-to-b from-blue-900/95 via-slate-950 to-blue-950 border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.4),0_6px_20px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-90"
        title={`Kích hoạt ${label}`}
      >
        {/* Crystal lens reflection */}
        <div className="absolute top-1 left-2 w-4 h-2 rounded-full bg-white/40 blur-[1px] pointer-events-none" />

        {/* Icon */}
        <div className="text-xl leading-none filter drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] group-hover:scale-110 transition-transform">
          {icon}
        </div>

        {/* Badge quantity (e.g. x2, x1, x3) */}
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-950 to-slate-900 text-cyan-200 font-heading font-black text-[9px] px-1.5 py-0.5 rounded-full border border-cyan-400 shadow-md">
          x{count}
        </div>
      </button>

      {/* Underneath label: e.g. "Power-up: Bom" */}
      <span className="text-[10px] font-bold text-cyan-200/90 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] bg-blue-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
        {label}
      </span>
    </div>
  );
};
