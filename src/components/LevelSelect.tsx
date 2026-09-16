import React from 'react';
import { Star, Lock, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      {/* Centered Modal Card */}
      <div className="relative w-full max-w-[330px] max-h-[85vh] rounded-3xl bg-gradient-to-b from-[#15203b] via-[#0e162d] to-[#070c18] border-2 border-cyan-400/45 p-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(0,229,255,0.25)] flex flex-col">
        {/* Subtle Top Cyan Highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3 shrink-0">
          <h2 className="text-lg font-black font-heading text-white tracking-wide">
            Chọn Màn Chơi
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Level Grid - Scrollable if many levels */}
        <div className="grid grid-cols-2 gap-2.5 overflow-y-auto pr-1 pb-1">
          {LEVELS.map(lvl => {
            const isUnlocked = lvl.level <= unlockedLevel;
            const starsEarned = progress.stars[lvl.level] || 0;
            const highScore = progress.highScores[lvl.level] || 0;
            const isCurrent = lvl.level === currentLevel;

            return (
              <div
                key={lvl.level}
                onClick={() => isUnlocked && onSelectLevel(lvl)}
                className={`p-3 rounded-2xl flex flex-col justify-between transition-all border ${
                  isUnlocked
                    ? 'cursor-pointer bg-slate-900/90 border-white/10 hover:border-cyan-400/60 hover:bg-slate-800/90 active:scale-95'
                    : 'opacity-40 cursor-not-allowed bg-slate-950/40 border-white/5'
                } ${isCurrent ? 'ring-2 ring-cyan-400 bg-cyan-950/40 border-cyan-400/80' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                      Màn {lvl.level}
                    </span>
                    <h3 className="text-xs font-bold text-white leading-tight mt-0.5 truncate max-w-[90px]">
                      {lvl.title}
                    </h3>
                  </div>
                  {!isUnlocked && (
                    <div className="text-slate-500">
                      <Lock size={13} />
                    </div>
                  )}
                </div>

                {/* Stars & High Score */}
                <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        size={11}
                        className={s <= starsEarned ? 'text-amber-400' : 'text-slate-700'}
                        fill={s <= starsEarned ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  {highScore > 0 && (
                    <span className="text-[9px] font-semibold text-slate-400">
                      {highScore.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
