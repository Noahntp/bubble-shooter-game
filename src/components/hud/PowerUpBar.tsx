import React from 'react';
import { Zap } from 'lucide-react';
import { PowerUpButton } from './PowerUpButton';
import { eventBridge, GAME_EVENTS } from '../../game/EventBridge';

export const PowerUpBar: React.FC = () => {
  const handleUsePowerup = (type: 'CRAB' | 'LIGHTNING' | 'WHIRLPOOL') => {
    eventBridge.emit(GAME_EVENTS.USE_POWERUP, type);
  };

  return (
    <div className="w-full flex items-end justify-between px-2.5 pb-2 pointer-events-none">
      {/* Bottom-Left Corner: Power-up Bom */}
      <div>
        <PowerUpButton
          type="CRAB"
          icon="💣"
          count={2}
          label="Power-up: Bom"
          onClick={() => handleUsePowerup('CRAB')}
        />
      </div>

      {/* Center is intentionally clear for the Pearl Cannon */}
      <div className="flex-1 pointer-events-none" />

      {/* Bottom-Right Corner: Power-up Sét & Power-up Xoáy nước side-by-side */}
      <div className="flex items-center gap-3">
        <PowerUpButton
          type="LIGHTNING"
          icon={<Zap size={20} className="text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />}
          count={1}
          label="Power-up: Sét"
          onClick={() => handleUsePowerup('LIGHTNING')}
        />

        <PowerUpButton
          type="WHIRLPOOL"
          icon={<span className="text-xl">🌀</span>}
          count={3}
          label="Power-up: Xoáy nước"
          onClick={() => handleUsePowerup('WHIRLPOOL')}
        />
      </div>
    </div>
  );
};
