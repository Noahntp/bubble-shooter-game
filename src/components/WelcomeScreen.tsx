import React from 'react';
import { Play, Gift, Sparkles, QrCode, ShieldCheck, Flame, Zap, Award } from 'lucide-react';

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
      {/* Ambient colorful nebula background glows */}
      <div className="absolute w-96 h-96 bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-purple-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 bg-amber-500/15 rounded-full blur-2xl pointer-events-none -bottom-10" />

      {/* Floating decorative arcade bubbles */}
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 opacity-75 blur-[1px] animate-float shadow-[0_0_15px_rgba(244,63,94,0.6)] pointer-events-none" />
      <div className="absolute top-1/4 -right-5 w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 opacity-75 blur-[1px] animate-float shadow-[0_0_15px_rgba(6,182,212,0.6)] pointer-events-none" style={{ animationDelay: '1.2s' }} />
      <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 opacity-80 blur-[1px] animate-float shadow-[0_0_15px_rgba(245,158,11,0.6)] pointer-events-none" style={{ animationDelay: '0.6s' }} />

      {/* Balanced Square-like Arcade Card with 20px padding */}
      <div className="modal-card-20 border-2 border-cyan-400/60 shadow-[0_0_45px_rgba(0,229,255,0.3),0_25px_60px_rgba(0,0,0,0.95)]">
        
        {/* Top Cyan/Gold Highlight Beam */}
        <div className="modal-top-beam-20 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

        {/* Centered Glowing 3D Hero Trophy/Sparkle Icon */}
        <div className="modal-icon-20 animate-float bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_25px_rgba(0,229,255,0.7)] border-2 border-white/80">
          <Sparkles size={26} className="text-white drop-shadow" />
        </div>

        {/* Ribbon Pill Badge */}
        <span className="modal-badge-20 bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-teal-500/25 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,229,255,0.3)] text-cyan-300">
          ★ THỦY CUNG HUYỀN BÍ • 8 SINH VẬT ĐẠI DƯƠNG ★
        </span>

        {/* Game Title with 3D Ocean Glossy Text */}
        <h1 className="modal-title-20 text-2xl sm:text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(0,229,255,0.6)]">
          OCEAN BUBBLE SHOOTER
        </h1>
        <p className="modal-desc-20 text-xs sm:text-sm text-slate-200 font-medium">
          Chiến thuật bắn bóng 3D • Phá khiên rùa • Gọi bạch tuộc nổ dây chuyền!
        </p>

        {/* 8 Marine Orbs Mini Gallery Row */}
        <div className="grid grid-cols-4 gap-1.5 w-full mb-3 px-1 text-center select-none">
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-base">🐡</span>
            <span className="text-[9px] font-bold text-cyan-300 mt-0.5">Cá Nóc</span>
          </div>
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-base">🪼</span>
            <span className="text-[9px] font-bold text-purple-300 mt-0.5">Sứa Wild</span>
          </div>
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-base">🐢</span>
            <span className="text-[9px] font-bold text-emerald-300 mt-0.5">Rùa Khiên</span>
          </div>
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-base">⭐</span>
            <span className="text-[9px] font-bold text-amber-300 mt-0.5">Sao Biển</span>
          </div>
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-base">🦀</span>
            <span className="text-[9px] font-bold text-rose-300 mt-0.5">Cua Bom</span>
          </div>
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-base">🦑</span>
            <span className="text-[9px] font-bold text-indigo-300 mt-0.5">Mực Cột</span>
          </div>
          <div className="bg-slate-900/80 border border-teal-500/30 rounded-xl p-1.5 flex flex-col items-center">
            <span className="text-base">🐙</span>
            <span className="text-[9px] font-bold text-teal-300 mt-0.5">Bạch Tuộc</span>
          </div>
          <div className="bg-slate-900/80 border border-red-500/40 rounded-xl p-1.5 flex flex-col items-center bg-rose-950/30">
            <span className="text-base">🦈</span>
            <span className="text-[9px] font-bold text-red-300 mt-0.5">Cá Mập</span>
          </div>
        </div>

        {/* Radiant Gift Promo Banner */}
        <div 
          onClick={onStartClick}
          className="modal-banner-20 relative overflow-hidden bg-gradient-to-r from-amber-500/25 via-yellow-500/30 to-amber-500/25 border-2 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-98 transition-transform"
        >
          <div className="shimmer-sweep" />
          <Gift size={20} className="text-amber-400 shrink-0 animate-bounce" />
          <span className="text-xs sm:text-sm font-bold text-amber-100 tracking-wide">
            Kho Báu Tân Thủ: <strong className="text-cyan-300 font-black">+5 Lượt</strong> &amp; <strong className="text-yellow-300 font-black">+500 Điểm</strong>
          </span>
        </div>

        {/* Action Buttons Group */}
        <div className="modal-btn-group-20">
          {/* Button 1: Play Now (Primary CTA with animated light sweep) */}
          <button
            onClick={onStartClick}
            className="modal-btn-20 modal-btn-primary-20 relative overflow-hidden text-sm sm:text-base font-black shadow-[0_4px_20px_rgba(0,198,255,0.6)]"
          >
            <div className="shimmer-sweep" />
            <Play size={18} fill="currentColor" />
            <span>LẶN BIỂN CHƠI NGAY</span>
          </button>

          {/* Button 2: Mobile QR Code Action (Secondary CTA) */}
          <button
            onClick={onOpenQR}
            className="modal-btn-20 modal-btn-secondary-20 hover:border-cyan-300 text-sm font-bold transition-all"
          >
            <QrCode size={18} className="text-cyan-400" />
            <span>QUÉT MÃ QR DI ĐỘNG</span>
          </button>
        </div>

        {/* Bottom Trust Note */}
        <div className="modal-footer-20">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Miễn phí 100% • Không giật lag • Chơi mượt trên mobile</span>
        </div>
      </div>
    </div>
  );
};
