import React from 'react';
import { Play, RotateCcw, Menu, Star, Award, AlertCircle, Volume2 } from 'lucide-react';
import { audioManager } from '../audio/AudioManager';

interface VictoryModalProps {
  level: number;
  score: number;
  stars: number;
  shotsRemaining: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  stars,
  shotsRemaining,
  onNextLevel,
  onReplay,
  onLevelSelect
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-sm p-6 text-center border-amber-500/30 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-3 shadow-lg shadow-amber-500/20">
          <Award size={36} />
        </div>

        <h2 className="text-3xl font-black font-heading text-white tracking-wide uppercase">
          Chiến Thắng!
        </h2>
        <p className="text-sm text-slate-300 font-medium mb-4">
          Hoàn Thành Màn {level}
        </p>

        {/* 3-Star Rating */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`transform transition-all duration-500 ${
                s <= stars
                  ? 'scale-110 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                  : 'scale-90 text-slate-600'
              }`}
            >
              <Star size={36} fill={s <= stars ? 'currentColor' : 'none'} strokeWidth={2} />
            </div>
          ))}
        </div>

        {/* Score Breakdown */}
        <div className="bg-slate-900/60 rounded-xl p-3.5 my-4 border border-white/5 space-y-1.5 text-left">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Thưởng bóng thừa (+150/lượt)</span>
            <span className="text-cyan-400 font-semibold">+{shotsRemaining * 150}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-white/10">
            <span>Tổng Điểm</span>
            <span className="text-xl font-heading text-amber-400 font-black">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-5">
          <button
            onClick={onNextLevel}
            className="arcade-btn arcade-btn-success w-full py-3 text-lg"
          >
            <Play size={20} fill="currentColor" />
            <span>Màn Tiếp Theo</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="arcade-btn arcade-btn-secondary flex-1 py-2.5 text-sm"
            >
              <RotateCcw size={16} />
              <span>Chơi Lại</span>
            </button>
            <button
              onClick={onLevelSelect}
              className="arcade-btn arcade-btn-secondary flex-1 py-2.5 text-sm"
            >
              <Menu size={16} />
              <span>Chọn Màn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  level: number;
  score: number;
  reason: string;
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  reason,
  onRetry,
  onLevelSelect
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-sm p-6 text-center border-red-500/30 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 mb-3 shadow-lg shadow-red-500/20">
          <AlertCircle size={36} />
        </div>

        <h2 className="text-3xl font-black font-heading text-white tracking-wide uppercase">
          Thua Cuộc
        </h2>
        <p className="text-xs text-red-400 font-semibold tracking-wide uppercase mt-1 mb-3">
          {reason}
        </p>

        <div className="bg-slate-900/60 rounded-xl p-3.5 my-4 border border-white/5 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Điểm Đạt Được
          </div>
          <div className="text-2xl font-heading text-white font-black mt-1">
            {score.toLocaleString()}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-5">
          <button
            onClick={onRetry}
            className="arcade-btn arcade-btn-primary w-full py-3 text-lg"
          >
            <RotateCcw size={20} />
            <span>Thử Lại</span>
          </button>
          <button
            onClick={onLevelSelect}
            className="arcade-btn arcade-btn-secondary w-full py-2.5 text-sm"
          >
            <Menu size={16} />
            <span>Chọn Màn</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onLevelSelect,
  volume,
  onVolumeChange
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-xs p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-black font-heading text-white tracking-wide uppercase mb-4">
          Tạm Dừng
        </h2>

        {/* Audio Volume Slider */}
        <div className="bg-slate-900/60 rounded-xl p-3 mb-5 border border-white/5 text-left">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Volume2 size={14} /> Âm Lượng
            </span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="arcade-btn arcade-btn-primary w-full py-2.5 text-base"
          >
            <Play size={18} fill="currentColor" />
            <span>Tiếp Tục</span>
          </button>
          <button
            onClick={onRestart}
            className="arcade-btn arcade-btn-secondary w-full py-2.5 text-sm"
          >
            <RotateCcw size={16} />
            <span>Chơi Lại Màn</span>
          </button>
          <button
            onClick={onLevelSelect}
            className="arcade-btn arcade-btn-secondary w-full py-2.5 text-sm"
          >
            <Menu size={16} />
            <span>Chọn Màn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
