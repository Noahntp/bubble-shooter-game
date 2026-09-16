import React from 'react';
import { Play, Gift, Sparkles, QrCode, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onStartClick: () => void;
  onOpenQR: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartClick,
  onOpenQR
}) => {
  return (
    <div className="modal-backdrop-20">
      {/* Ambient background glow */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Balanced Square-like Arcade Card with 20px padding */}
      <div className="modal-card-20">
        
        {/* Top Cyan Highlight Beam */}
        <div className="modal-top-beam-20" />

        {/* Centered Glowing 3D Hero Sparkle Icon */}
        <div className="modal-icon-20 animate-float">
          <Sparkles size={24} />
        </div>

        {/* Ribbon Pill Badge */}
        <span className="modal-badge-20">
          ★ ARCADE GAME SĂN THƯỞNG ★
        </span>

        {/* Game Title */}
        <h1 className="modal-title-20">
          BẮN BÓNG 3D
        </h1>
        <p className="modal-desc-20">
          Bắn vỡ chuỗi bóng, rinh quà cực đã!
        </p>

        {/* Radiant Gift Promo Banner */}
        <div 
          onClick={onStartClick}
          className="modal-banner-20"
        >
          <Gift size={16} className="text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide">
            Quà Tân Thủ: <strong className="text-cyan-300 font-black">+5 Lượt</strong> &amp; <strong className="text-yellow-300 font-black">+500 Điểm</strong>
          </span>
        </div>

        {/* Action Buttons Group - Equal 48px Heights & 10px Gap */}
        <div className="modal-btn-group-20">
          {/* Button 1: Play Now (Primary CTA) */}
          <button
            onClick={onStartClick}
            className="modal-btn-20 modal-btn-primary-20"
          >
            <Play size={17} fill="currentColor" />
            <span>BẤM ĐỂ CHƠI NGAY</span>
          </button>

          {/* Button 2: Mobile QR Code Action (Secondary CTA) */}
          <button
            onClick={onOpenQR}
            className="modal-btn-20 modal-btn-secondary-20"
          >
            <QrCode size={17} className="text-cyan-400" />
            <span>QUÉT MÃ QR DI ĐỘNG</span>
          </button>
        </div>

        {/* Bottom Trust Note */}
        <div className="modal-footer-20">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Miễn phí 100% • Không cần cài đặt</span>
        </div>
      </div>
    </div>
  );
};
