import React from 'react';
import { Star } from 'lucide-react';

interface MissionPanelProps {
  level: number;
  levelTitle: string;
  score: number;
  targetScore: number;
  maxThreshold?: number;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  level,
  levelTitle,
  score,
  targetScore,
  maxThreshold
}) => {
  const max = maxThreshold || targetScore || 1;
  const progressPercent = Math.min(100, Math.max(0, (score / max) * 100));
  const objectiveText = (levelTitle || 'Đánh hạ toàn bộ ngọc').toUpperCase();

  return (
    <div className="flex-1 max-w-[240px] bg-gradient-to-b from-slate-900/95 via-blue-950/90 to-slate-950/95 border-2 border-amber-400/70 rounded-2xl px-2.5 py-1 shadow-[0_6px_20px_rgba(0,0,0,0.7),0_0_12px_rgba(245,158,11,0.25)] flex flex-col gap-0.5">
      {/* Top line: [MÀN X] + Objective */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-sm shrink-0 uppercase tracking-wider">
          MÀN {level}
        </span>
        <span className="text-[10px] font-black font-heading text-white truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {objectiveText}
        </span>
      </div>

      {/* Bottom line: Star score + Liquid progress bar with Pearl bead */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <Star size={10} className="text-amber-300 fill-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          <span className="text-[11px] font-black font-heading text-amber-300">
            {score.toLocaleString()}
          </span>
          <span className="text-[8.5px] text-cyan-200/70 font-semibold">
            / {targetScore.toLocaleString()}
          </span>
        </div>

        {/* Liquid Cyan Fill Bar */}
        <div className="relative flex-1 bg-slate-950/90 rounded-full h-2 border border-cyan-500/40 p-0.5 overflow-visible">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 transition-all duration-300 relative shadow-[0_0_6px_rgba(0,229,255,0.8)]"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          >
            {/* Glowing Pearl Knob at Tip */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border border-cyan-300 shadow-[0_0_6px_rgba(255,255,255,1),0_0_10px_rgba(6,182,212,0.9)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-cyan-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
