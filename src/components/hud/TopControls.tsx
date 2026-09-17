import React from 'react';
import { Volume2, VolumeX, Pause, Settings, QrCode } from 'lucide-react';

interface TopControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenQR?: () => void;
}

export const TopControls: React.FC<TopControlsProps> = ({
  isMuted,
  onToggleMute,
  onPause,
  onOpenQR
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-full bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-blue-950/80 border border-amber-400/50 shadow-[0_4px_16px_rgba(0,0,0,0.6)] pointer-events-auto">
      {/* 1. Âm thanh (Sound Button) */}
      <button
        onClick={onToggleMute}
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer bg-gradient-to-b from-cyan-600 via-blue-800 to-blue-950 border-2 border-cyan-400/70 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-transform hover:scale-105 active:scale-90"
        title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        aria-label="Âm thanh"
      >
        {isMuted ? <VolumeX size={15} className="text-rose-300" /> : <Volume2 size={15} />}
      </button>

      {/* 2. Tạm dừng (Pause Button) */}
      <button
        onClick={onPause}
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer bg-gradient-to-b from-cyan-600 via-blue-800 to-blue-950 border-2 border-cyan-400/70 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-transform hover:scale-105 active:scale-90"
        title="Tạm dừng"
        aria-label="Tạm dừng"
      >
        <Pause size={15} className="fill-white" />
      </button>

      {/* 3. Cài đặt / QR Code (Settings Button) */}
      <button
        onClick={onOpenQR || onPause}
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer bg-gradient-to-b from-cyan-600 via-blue-800 to-blue-950 border-2 border-cyan-400/70 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-transform hover:scale-105 active:scale-90"
        title="Cài đặt trò chơi"
        aria-label="Cài đặt"
      >
        <Settings size={15} />
      </button>
    </div>
  );
};
