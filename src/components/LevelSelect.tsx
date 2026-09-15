import React from 'react';
import { Star, Lock, ArrowLeft, Play } from 'lucide-react';
import { LevelConfig } from '../types/game';
import { LEVELS } from '../levels/levelData';
import { apiService, PlayerProgress } from '../services/api';

interface LevelSelectProps {
  currentLevel: number;
  onSelectLevel: (levelConfig: LevelConfig) => void;
  onClose: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  currentLevel,
  onSelectLevel,
  onClose
}) => {
  const progress: PlayerProgress = apiService.getLocalProgress();
  const unlockedLevel = progress.unlockedLevel || 1;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <button
          onClick={onClose}
          className="icon-btn"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black font-heading text-white tracking-wide uppercase">
          Chọn Màn Chơi
        </h2>
        <div className="w-10" />
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 pb-4">
        {LEVELS.map(lvl => {
          const isUnlocked = lvl.level <= unlockedLevel;
          const starsEarned = progress.stars[lvl.level] || 0;
          const highScore = progress.highScores[lvl.level] || 0;
          const isCurrent = lvl.level === currentLevel;

          return (
            <div
              key={lvl.level}
              onClick={() => isUnlocked && onSelectLevel(lvl)}
              className={`glass-panel p-3.5 flex flex-col justify-between transition-all ${
                isUnlocked
                  ? 'cursor-pointer hover:border-cyan-400/50 hover:bg-slate-800/80 active:scale-95'
                  : 'opacity-45 cursor-not-allowed bg-slate-900/40'
              } ${isCurrent ? 'ring-2 ring-cyan-400 bg-cyan-950/30' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Màn {lvl.level}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug mt-0.5">
                    {lvl.title}
                  </h3>
                </div>
                {!isUnlocked && (
                  <div className="text-slate-500">
                    <Lock size={16} />
                  </div>
                )}
              </div>

              {/* Stars & High Score */}
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3].map(s => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= starsEarned ? 'text-amber-400' : 'text-slate-700'}
                      fill={s <= starsEarned ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                {highScore > 0 && (
                  <span className="text-[11px] font-semibold text-slate-400">
                    {highScore.toLocaleString()} điểm
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
