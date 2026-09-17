import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  if (!onClick) return null;

  return (
    <button
      onClick={onClick}
      className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto bg-gradient-to-b from-cyan-600 via-blue-800 to-blue-950 border-2 border-cyan-300/80 text-white shadow-[0_0_15px_rgba(6,182,212,0.5),0_4px_12px_rgba(0,0,0,0.6)] transition-all hover:scale-105 active:scale-95 shrink-0 group"
      title="Quay lại chọn màn"
      aria-label="Nút quay lại"
    >
      <ChevronLeft size={22} className="stroke-[3] text-cyan-100 group-hover:text-white transition-colors" />
    </button>
  );
};
