import React from 'react';
import { GameHUD } from './hud/GameHUD';
import { GameStats } from '../types/game';

interface HUDProps {
  stats: GameStats;
  targetScore: number;
  levelTitle: string;
  starThresholds?: [number, number, number];
  isMuted: boolean;
  playerPhone?: string | null;
  onToggleMute: () => void;
  onPause: () => void;
  onBack?: () => void;
  onOpenQR?: () => void;
}

export const HUD: React.FC<HUDProps> = (props) => {
  return <GameHUD {...props} />;
};

export default HUD;
