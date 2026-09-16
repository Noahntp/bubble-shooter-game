import React from 'react';
import { Play, RotateCcw, Menu, Trophy, AlertCircle, Volume2, Star } from 'lucide-react';

interface VictoryModalProps {
  level: number;
  score: number;
  stars: number;
  shotsRemaining?: number;
  onNextLevel: () => void;
  onReplay?: () => void;
  onRetry?: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  stars,
  shotsRemaining,
  onNextLevel,
  onReplay,
  onRetry,
  onLevelSelect
}) => {
  const handleReplay = onReplay || onRetry || (() => {});

  return (
    <div className="modal-backdrop-20">
      {/* Ambient glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Spacious 20px Card */}
      <div className="modal-card-20 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.3),0_25px_60px_rgba(0,0,0,0.95)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

        {/* Floating Trophy Icon */}
        <div className="modal-icon-20 animate-float bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500 text-slate-950">
          <Trophy size={28} />
        </div>

        {/* Stars Display */}
        <div className="flex items-center gap-2 mb-3">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              size={28}
              className={`${
                starIndex <= stars
                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]'
                  : 'text-slate-600 fill-slate-800'
              } transition-all`}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="modal-title-20">
          Màn {level} Hoàn Thành!
        </h2>
        <p className="modal-desc-20">
          Bạn đã bắn hạ toàn bộ bóng xuất sắc!
        </p>

        {/* Score Breakdown Card - 20px margin */}
        <div className="modal-banner-20 flex items-center justify-around py-3 px-4">
          <div className="text-center">
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Điểm màn này</div>
            <div className="text-xl font-black text-white">{score.toLocaleString()}</div>
          </div>
          <div className="w-[1px] h-7 bg-white/20" />
          <div className="text-center">
            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
              {shotsRemaining !== undefined ? 'Bóng còn lại' : 'Xếp hạng'}
            </div>
            <div className="text-xl font-black text-cyan-300">
              {shotsRemaining !== undefined ? `${shotsRemaining} quả` : `${stars} Sao`}
            </div>
          </div>
        </div>

        {/* Equal Action Buttons (50px, 20px gap) */}
        <div className="modal-btn-group-20 mb-0">
          <button
            onClick={onNextLevel}
            className="modal-btn-20 modal-btn-gold-20"
          >
            <Play size={18} fill="currentColor" />
            <span>MÀN TIẾP THEO</span>
          </button>

          <button
            onClick={handleReplay}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <RotateCcw size={18} />
            <span>CHƠI LẠI MÀN NÀY</span>
          </button>

          <button
            onClick={onLevelSelect}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <Menu size={18} />
            <span>DANH SÁCH MÀN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  level: number;
  score: number;
  reason?: string;
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  reason = 'Hết bóng bắn!',
  onRetry,
  onLevelSelect
}) => {
  return (
    <div className="modal-backdrop-20">
      {/* Ambient glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-rose-500/20 via-red-600/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Spacious 20px Card */}
      <div className="modal-card-20 border-rose-500/60 shadow-[0_0_40px_rgba(244,63,94,0.3),0_25px_60px_rgba(0,0,0,0.95)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-rose-400 to-transparent" />

        {/* Top Alert Icon */}
        <div className="modal-icon-20 bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]">
          <AlertCircle size={28} />
        </div>

        <h2 className="modal-title-20">
          Chưa Hoàn Thành!
        </h2>
        <p className="modal-desc-20 text-rose-300">
          {reason} (Màn {level})
        </p>

        {/* Final Score Card - 20px margin */}
        <div className="w-full bg-slate-950/80 border border-rose-500/30 rounded-2xl py-3 px-4 mb-5 text-center">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Điểm Đạt Được</div>
          <div className="text-2xl font-black text-rose-400 mt-0.5">{score.toLocaleString()}</div>
        </div>

        {/* Equal Action Buttons (50px, 20px gap) */}
        <div className="modal-btn-group-20 mb-0">
          <button
            onClick={onRetry}
            className="modal-btn-20 text-white bg-gradient-to-r from-rose-500 to-red-600 border border-white/50 shadow-[0_4px_0_#9f1239,0_8px_20px_rgba(244,63,94,0.5)] active:translate-y-1"
          >
            <RotateCcw size={18} />
            <span>THỬ LẠI NGAY</span>
          </button>

          <button
            onClick={onLevelSelect}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <Menu size={18} />
            <span>CHỌN MÀN KHÁC</span>
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
    <div className="modal-backdrop-20">
      {/* Ambient glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Spacious 20px Card */}
      <div className="modal-card-20">
        <div className="modal-top-beam-20" />

        <div className="modal-icon-20">
          <Play size={26} className="ml-0.5" />
        </div>

        <h2 className="modal-title-20">
          Tạm Dừng
        </h2>
        <p className="modal-desc-20">
          Game đang được tạm dừng
        </p>

        {/* Volume Slider Bar - 20px margin */}
        <div className="w-full bg-slate-900/90 border border-white/15 rounded-2xl p-3 mb-5 flex items-center gap-3">
          <Volume2 size={18} className="text-cyan-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs font-mono font-bold text-cyan-300 w-10 text-right shrink-0">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Equal Action Buttons (50px, 20px gap) */}
        <div className="modal-btn-group-20 mb-0">
          <button
            onClick={onResume}
            className="modal-btn-20 modal-btn-primary-20"
          >
            <Play size={18} fill="currentColor" />
            <span>TIẾP TỤC CHƠI</span>
          </button>

          <button
            onClick={onRestart}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <RotateCcw size={18} />
            <span>CHƠI LẠI MÀN NÀY</span>
          </button>

          <button
            onClick={onLevelSelect}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <Menu size={18} />
            <span>DANH SÁCH MÀN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
