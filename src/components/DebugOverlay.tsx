import React, { useState, useEffect } from 'react';
import { GameStats, LevelConfig } from '../types/game';

interface DebugOverlayProps {
  stats: GameStats;
  levelConfig: LevelConfig;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ stats, levelConfig }) => {
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        setVisible(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!visible) {
    return null; // Hidden by default; press ` or ~ to toggle
  }

  return (
    <div className="absolute top-14 right-2 z-40 glass-panel p-3 text-[11px] font-mono text-slate-200 border-cyan-500/30 max-w-[200px] pointer-events-auto shadow-2xl">
      <div className="flex justify-between items-center pb-1 border-b border-white/10 mb-1.5">
        <span className="font-bold text-cyan-400">DEBUG CONSOLE</span>
        <button onClick={() => setVisible(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={fps >= 55 ? 'text-emerald-400' : 'text-amber-400'}>{fps}</span>
        </div>
        <div className="flex justify-between">
          <span>State:</span>
          <span className="text-cyan-300">{stats.gameStatus}</span>
        </div>
        <div className="flex justify-between">
          <span>Combo:</span>
          <span className="text-amber-300">x{stats.combo}</span>
        </div>
        <div className="flex justify-between">
          <span>Occupancy:</span>
          <span>{Math.round(stats.boardOccupancy * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Shots Left:</span>
          <span>{stats.shotsLeft}</span>
        </div>

        <div className="pt-1 border-t border-white/10 mt-1">
          <div className="text-[10px] text-slate-400 font-bold mb-0.5">Spawn Probabilities:</div>
          <div className="grid grid-cols-2 gap-x-2 text-[10px]">
            <span>Norm: {levelConfig.spawnRates.NORMAL}%</span>
            <span>Bonus: {levelConfig.spawnRates.BONUS}%</span>
            <span>Rain: {levelConfig.spawnRates.RAINBOW}%</span>
            <span>Bomb: {levelConfig.spawnRates.BOMB}%</span>
            <span>Light: {levelConfig.spawnRates.LIGHTNING}%</span>
            <span>Freeze: {levelConfig.spawnRates.FREEZE}%</span>
            <span>Curse: {levelConfig.spawnRates.CURSE}%</span>
            <span>Trap: {levelConfig.spawnRates.TRAP}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
