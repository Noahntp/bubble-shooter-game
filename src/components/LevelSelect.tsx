import React from 'react';
import { Star, Lock, X, Play, Trophy } from 'lucide-react';
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
  const unlockedLevel = Math.max(1, progress.unlockedLevel || 1);

  // Total stars collected across all levels
  const totalStars = Object.values(progress.stars || {}).reduce((acc, s) => acc + (s || 0), 0);

  return (
    <div className="modal-backdrop-20">
      {/* Ambient background glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Standard 20px Card - Exactly matching WelcomeScreen, PhoneLogin & Pause modals */}
      <div className="modal-card-20 max-w-[355px] max-h-[78dvh]">
        {/* Top Highlight Beam */}
        <div className="modal-top-beam-20" />

        {/* Modal Header */}
        <div className="w-full flex items-start justify-between pb-3 border-b border-white/10 mb-[14px] shrink-0">
          <div className="text-left">
            <div className="modal-badge-20 mb-1">
              <Trophy size={11} className="text-amber-400" />
              <span>BẢN ĐỒ MÀN CHƠI</span>
            </div>
            <h2 className="modal-title-20 text-left mb-0.5">
              Chọn Màn Chơi
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
              <span>Đã mở: <b className="text-cyan-300 font-bold">{unlockedLevel}/10</b> màn</span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Star size={11} className="fill-amber-400 text-amber-400" /> {totalStars}/30 Sao
              </span>
            </div>
          </div>

          {/* Close Touch Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-800/90 hover:bg-slate-700/90 active:scale-90 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* Spacious 1-Column Stage List - 20px padding & margins */}
        <div className="w-full flex flex-col gap-2 overflow-y-auto pr-1 pb-1 flex-1 min-h-0 mb-[14px] scrollbar-thin">
          {LEVELS.map(lvl => {
            const isUnlocked = lvl.level <= unlockedLevel;
            const starsEarned = progress.stars[lvl.level] || 0;
            const highScore = progress.highScores[lvl.level] || 0;
            const isCurrent = lvl.level === currentLevel;

            return (
              <button
                key={lvl.level}
                onClick={() => isUnlocked && onSelectLevel(lvl)}
                disabled={!isUnlocked}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all border box-border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/70 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.35)] cursor-pointer active:scale-98'
                    : isUnlocked
                    ? 'bg-slate-900/90 border-cyan-500/25 hover:border-cyan-400/60 hover:bg-slate-800/90 cursor-pointer active:scale-98 shadow-sm'
                    : 'bg-slate-900/40 border-white/5 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Left: Stage Number Badge + Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-heading font-black text-xs shrink-0 border ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 border-white/60 shadow-md shadow-cyan-400/40'
                        : isUnlocked
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                        : 'bg-slate-800/80 text-slate-400 border-white/5'
                    }`}
                  >
                    {!isUnlocked ? <Lock size={13} className="text-amber-400/80" /> : lvl.level}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className={`text-xs font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                        {lvl.title}
                      </h3>
                      {isCurrent && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-1.5 py-0.2 rounded-full animate-pulse shrink-0">
                          Đang chơi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      {highScore > 0 ? (
                        <span className="text-amber-300 font-mono font-bold">
                          Kỷ lục: {highScore.toLocaleString()} đ
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-cyan-400/80 font-medium">
                          Mục tiêu: {lvl.targetScore.toLocaleString()} đ
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">
                          Cần qua Màn {lvl.level - 1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Stars + Play Indicator */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        size={11}
                        className={
                          s <= starsEarned
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]'
                            : isUnlocked
                            ? 'text-slate-600 fill-slate-800/80'
                            : 'text-slate-700 fill-slate-800/40'
                        }
                      />
                    ))}
                  </div>

                  {isUnlocked && (
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950 border-white/60 shadow-sm shadow-cyan-400/50'
                          : 'bg-slate-800/90 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      <Play size={10} fill="currentColor" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Button */}
        <div className="w-full shrink-0">
          <button
            onClick={onClose}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <span>QUAY LẠI BÀN CHƠI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
