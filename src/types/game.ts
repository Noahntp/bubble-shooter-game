export type BubbleColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE';

export const ALL_BUBBLE_COLORS: BubbleColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];

export type BubbleType = 
  | 'NORMAL'
  | 'BONUS'
  | 'RAINBOW'
  | 'BOMB'
  | 'LIGHTNING'
  | 'FREEZE'
  | 'CURSE'
  | 'TRAP';

export type BubbleState = 
  | 'IDLE'
  | 'SHOOTING'
  | 'ATTACHED'
  | 'POPPING'
  | 'FALLING'
  | 'FROZEN'
  | 'DESTROYED';

export type GameStatus = 
  | 'LOADING'
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'WIN'
  | 'LOSE';

export interface BubbleEntity {
  id: string;
  row: number;
  col: number;
  color: BubbleColor;
  type: BubbleType;
  state: BubbleState;
  freezeTurnsRemaining: number;
  visualX: number;
  visualY: number;
}

export interface GridCoord {
  row: number;
  col: number;
}

export interface SpecialBubbleSpawnRates {
  NORMAL: number;
  BONUS: number;
  RAINBOW: number;
  BOMB: number;
  LIGHTNING: number;
  FREEZE: number;
  CURSE: number;
  TRAP: number;
}

export interface LevelConfig {
  level: number;
  title: string;
  rows: number;
  cols: number;
  maxShots: number;
  targetScore: number;
  starThresholds: [number, number, number]; // 1, 2, 3 stars
  colors: BubbleColor[];
  initialRows: number;
  customGrid?: { row: number; col: number; color?: BubbleColor; type?: BubbleType }[];
  spawnRates: SpecialBubbleSpawnRates;
}

export interface ScorePopupData {
  x: number;
  y: number;
  score: number;
  text?: string;
  color?: string;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  shotsLeft: number;
  level: number;
  stars: number;
  boardOccupancy: number; // 0.0 - 1.0
  gameStatus: GameStatus;
}
