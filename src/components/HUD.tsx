import React from 'react';
import { Volume2, VolumeX, Pause, RefreshCw, Star, Zap, Target } from 'lucide-react';
import { GameStats } from '../types/game';
import { eventBridge, GAME_EVENTS } from '../game/EventBridge';

interface HUDProps {
  stats: GameStats;
  targetScore: number;
  levelTitle: string;
  starThresholds?: [number, number, number];
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  targetScore,
  levelTitle,
  starThresholds = [800, 1200, 1800],
  isMuted,
  onToggleMute,
  onPause
}) => {
  const maxThreshold = starThresholds[2] || targetScore || 1;
  const scoreProgress = Math.min(100, (stats.score / maxThreshold) * 100);

  const handleSwap = () => {
    eventBridge.emit(GAME_EVENTS.SWAP_BUBBLES);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 select-none">
      {/* Top Floating Glassmorphic Arcade Header */}
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-2.5 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Level & Title */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm shadow-cyan-500/50 shrink-0">
                <Zap size={10} fill="currentColor" /> Màn {stats.level}
              </span>
              <span className="text-xs text-slate-200 font-bold truncate max-w-[130px]" title={levelTitle}>
                {levelTitle}
              </span>
            </div>
            {/* Score Numbers */}
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-heading text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
                {stats.score.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                / {targetScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Center: Shots Remaining & Combo */}
          <div className="flex items-center gap-2 shrink-0">
            {stats.combo > 1 && (
              <div className="score-badge animate-glow bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-400/60 text-amber-300 text-xs font-black px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/30">
                🔥 x{stats.combo >= 4 ? 4 : stats.combo >= 3 ? 3 : stats.combo >= 2 ? 2 : 1.5}
              </div>
            )}

            <div
              className={`score-badge flex items-center gap-1.5 font-heading font-black text-xs px-2.5 py-1 rounded-full border shadow-md ${
                stats.shotsLeft <= 5
                  ? 'bg-red-500/30 border-red-500 text-red-400 animate-bounce shadow-red-500/30'
                  : 'bg-slate-800/80 border-white/10 text-cyan-300 shadow-cyan-500/10'
              }`}
            >
              <Target size={13} className={stats.shotsLeft <= 5 ? 'text-red-400' : 'text-cyan-400'} />
              <span>{stats.shotsLeft}</span>
              <span className="text-[10px] text-slate-400 font-normal">lượt</span>
            </div>
          </div>

          {/* Right: Audio & Pause Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <button
              onClick={onToggleMute}
              className="icon-btn w-8 h-8 rounded-lg"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              aria-label="Bật tắt âm thanh"
            >
              {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
            </button>
            <button
              onClick={onPause}
              className="icon-btn w-8 h-8 rounded-lg"
              title="Tạm dừng"
              aria-label="Tạm dừng"
            >
              <Pause size={15} />
            </button>
          </div>
        </div>

        {/* 3-Star Checkpoint Progress Bar */}
        <div className="relative w-full bg-slate-950/80 rounded-full h-1.5 mt-2 border border-white/10">
          {/* Gradient Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,229,255,0.5)]"
            style={{ width: `${scoreProgress}%` }}
          />

          {/* 3 Star Markers on the Bar */}
          {starThresholds.map((threshold, idx) => {
            const posPct = Math.min(95, Math.max(5, (threshold / maxThreshold) * 100));
            const isReached = stats.score >= threshold;

            return (
              <div
                key={idx}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${posPct}%` }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                    isReached
                      ? 'bg-amber-400 border-amber-200 text-slate-950 scale-110 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'bg-slate-900 border-slate-700 text-slate-600 scale-90'
                  }`}
                >
                  <Star size={7} fill={isReached ? 'currentColor' : 'none'} strokeWidth={3} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Bubble Swap Button */}
      <div className="absolute top-[685px] left-3 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSwap();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className="flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white transition-all bg-gradient-to-r from-slate-900/95 to-cyan-950/90 hover:from-cyan-900/90 hover:to-blue-900/90 px-3.5 py-1.5 rounded-full border border-cyan-400/40 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Nhấn để đổi bóng (Phím Cách)"
        >
          <RefreshCw size={13} className="text-cyan-400 transition-transform active:rotate-180" />
          <span>Đổi bóng</span>
          <span className="text-[10px] text-cyan-500/80 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">Space</span>
        </button>
      </div>
    </div>
  );
};
