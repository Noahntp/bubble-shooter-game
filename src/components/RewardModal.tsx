import React, { useEffect } from 'react';
import { Play, Sparkles, Target, Zap, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardModalProps {
  phone: string;
  onStartPlaying: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  phone,
  onStartPlaying
}) => {
  useEffect(() => {
    // Trigger celebratory confetti burst
    const count = 200;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#00e5ff', '#ffd700', '#ff007f'] });
    fire(0.2, { spread: 60, colors: ['#ffffff', '#00e5ff', '#ffd700'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="modal-backdrop-20">
      {/* Ambient glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-amber-500/20 via-emerald-500/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Spacious 20px Luxury Arcade Card */}
      <div className="modal-card-20">
        <div className="modal-top-beam-20" />

        {/* Floating Celebration Gift Icon */}
        <div className="modal-icon-20 animate-bounce">
          <Gift size={26} />
        </div>

        {/* Ribbon Pill Badge */}
        <span className="modal-badge-20">
          ★ KÍCH HOẠT THÀNH CÔNG ★
        </span>

        {/* Title */}
        <h2 className="modal-title-20">
          Nhận Quà Thành Công!
        </h2>
        <p className="modal-desc-20">
          Tài khoản: <strong className="text-amber-300 font-mono font-black">{phone}</strong>
        </p>

        {/* Dual Reward Container - 20px margin */}
        <div className="modal-banner-20 flex items-center justify-around py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shadow-sm">
              <Target size={18} />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Cộng vào ví</div>
              <div className="text-sm font-black text-white">+5 Lượt</div>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/20" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-300 flex items-center justify-center shadow-sm">
              <Zap size={18} />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Điểm khởi đầu</div>
              <div className="text-sm font-black text-amber-300">+500 Điểm</div>
            </div>
          </div>
        </div>

        {/* Equal 50px Action Button */}
        <div className="modal-btn-group-20">
          <button
            onClick={onStartPlaying}
            className="modal-btn-20 modal-btn-gold-20"
          >
            <Play size={18} fill="currentColor" />
            <span>VÀO BẮN BÓNG NGAY</span>
          </button>
        </div>

        <div className="modal-footer-20">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>Chúc bạn chơi vui vẻ và đạt điểm cao!</span>
        </div>
      </div>
    </div>
  );
};
