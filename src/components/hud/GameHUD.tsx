import React from 'react';
import { GameStats } from '../../types/game';
import { BackButton } from './BackButton';
import { MissionPanel } from './MissionPanel';
import { ShotsBadge } from './ShotsBadge';
import { TopControls } from './TopControls';
import { PressureBar } from './PressureBar';
import { PowerUpBar } from './PowerUpBar';

interface GameHUDProps {
  stats: GameStats;
  targetScore: number;
  levelTitle: string;
  starThresholds?: [number, number, number];
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onBack?: () => void;
  onOpenQR?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  targetScore,
  levelTitle,
  starThresholds = [800, 1200, 1800],
  isMuted,
  onToggleMute,
  onPause,
  onBack,
  onOpenQR
}) => {
  const maxThreshold = starThresholds[2] || targetScore || 1;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none p-2 pt-2 select-none flex flex-col justify-between">
      {/* TOP HUD + OCEAN PRESSURE BAR */}
      <div className="flex flex-col gap-1.5 w-full">
        {/* Top Controls Row: Back | Mission Panel | Shots Remaining | Audio/Pause/Settings */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          {/* Left: Nút quay lại */}
          <BackButton onClick={onBack} />

          {/* Center-Left: Thông tin màn chơi (Mục tiêu + tiến độ) */}
          <MissionPanel
            level={stats.level}
            levelTitle={levelTitle}
            score={stats.score}
            targetScore={targetScore}
            maxThreshold={maxThreshold}
          />

          {/* Center-Right: Số lượt còn lại */}
          <ShotsBadge shotsLeft={stats.shotsLeft} />

          {/* Right: Âm thanh | Tạm dừng | Cài đặt */}
          <TopControls
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            onPause={onPause}
            onOpenQR={onOpenQR}
          />
        </div>

        {/* Thanh hiển thị áp suất đại dương (Ocean Pressure) immediately below */}
        <PressureBar
          missCount={stats.missCount || 0}
          maxMisses={stats.maxMisses || 5}
        />

        {/* Dynamic Boss HP bar if fighting boss */}
        {stats.bossHp !== undefined && (
          <div className="self-center w-full max-w-[340px] bg-slate-950/90 border border-rose-500/40 rounded-xl px-2.5 py-1 flex flex-col gap-1 shadow-[0_0_12px_rgba(244,63,94,0.4)] pointer-events-none">
            <div className="flex items-center justify-between text-[10px] font-black">
              <span className="text-rose-400 flex items-center gap-1 font-heading tracking-wide">
                {stats.bossName || '🦈 HẢI VƯƠNG SHARK TITAN'}
              </span>
              <span className="text-amber-300 font-mono text-[9.5px]">
                {stats.bossHp} / {stats.bossMaxHp || 5} HP
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-rose-500/40">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-400 transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                style={{ width: `${Math.max(0, Math.min(100, (stats.bossHp / (stats.bossMaxHp || 5)) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: POWER-UPS (Near bottom corners, clear in center for Cannon) */}
      <PowerUpBar />
    </div>
  );
};
