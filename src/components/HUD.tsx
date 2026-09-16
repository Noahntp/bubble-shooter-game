import React from 'react';
import { Volume2, VolumeX, Pause, RefreshCw, Star, Zap, Target, QrCode, Smartphone } from 'lucide-react';
import { GameStats } from '../types/game';
import { eventBridge, GAME_EVENTS } from '../game/EventBridge';

interface HUDProps {
  stats: GameStats;
  targetScore: number;
  levelTitle: string;
  starThresholds?: [number, number, number];
  isMuted: boolean;
  playerPhone?: string | null;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenQR?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  targetScore,
  levelTitle,
  starThresholds = [800, 1200, 1800],
  isMuted,
  playerPhone,
  onToggleMute,
  onPause,
  onOpenQR
}) => {
  const maxThreshold = starThresholds[2] || targetScore || 1;
  const scoreProgress = Math.min(100, (stats.score / maxThreshold) * 100);

  const handleSwap = () => {
    eventBridge.emit(GAME_EVENTS.SWAP_BUBBLES);
  };

  const formatPhone = (p?: string | null) => {
    if (!p || p.length < 7) return '';
    return `${p.substring(0, 4)}***${p.substring(p.length - 3)}`;
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none p-2 select-none flex flex-col justify-between">
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
            {/* Score Numbers & Optional Phone Badge */}
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-heading text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
                {stats.score.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                / {targetScore.toLocaleString()}
              </span>
              {playerPhone && (
                <span className="ml-1 hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono text-cyan-400/90 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/20">
                  <Smartphone size={9} /> {formatPhone(playerPhone)}
                </span>
              )}
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

          {/* Right: QR, Audio & Pause Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            {onOpenQR && (
              <button
                onClick={onOpenQR}
                className="icon-btn w-8 h-8 rounded-lg cursor-pointer bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-400/30 text-cyan-300"
                title="Mã QR quét chơi trên điện thoại"
                aria-label="Mã QR"
              >
                <QrCode size={15} />
              </button>
            )}
            <button
              onClick={onToggleMute}
              className="icon-btn w-8 h-8 rounded-lg cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              aria-label="Bật tắt âm thanh"
            >
              {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
            </button>
            <button
              onClick={onPause}
              className="icon-btn w-8 h-8 rounded-lg cursor-pointer"
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
      <div className="flex items-end justify-between pointer-events-none px-2 pb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSwap();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          className="pointer-events-auto flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-all bg-slate-900/90 hover:bg-cyan-950/90 px-3 py-1.5 rounded-full border border-cyan-400/30 shadow-lg shadow-cyan-500/10 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Nhấn để đổi bóng (Phím Cách)"
        >
          <RefreshCw size={12} className="text-cyan-400 transition-transform active:rotate-180" />
          <span>Đổi bóng</span>
          <span className="text-[10px] text-cyan-400/80 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">Space</span>
        </button>

        {playerPhone && (
          <button
            onClick={onOpenQR}
            className="pointer-events-auto flex sm:hidden items-center gap-1 text-[10px] font-mono text-cyan-400/80 bg-slate-900/90 px-2.5 py-1 rounded-full border border-cyan-500/20 backdrop-blur-md cursor-pointer"
            title="Xem mã QR"
          >
            <Smartphone size={10} /> {formatPhone(playerPhone)}
          </button>
        )}
      </div>
    </div>
  );
};
