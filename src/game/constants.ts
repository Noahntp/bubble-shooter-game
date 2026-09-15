export const GAME_WIDTH = 520;
export const GAME_HEIGHT = 800;

export const BUBBLE_RADIUS = 30;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
export const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3); // ~51.96px

export const GRID_COLS = 8;
export const GRID_ROWS = 13;
export const LEFT_MARGIN = 20;
export const BOARD_WIDTH = GRID_COLS * BUBBLE_DIAMETER; // 480px
export const LEFT_WALL_X = LEFT_MARGIN;
export const RIGHT_WALL_X = LEFT_MARGIN + BOARD_WIDTH; // 500px

export const CEILING_Y = 100;
export const DANGER_LINE_Y = 665;

export const SHOOTER_X = GAME_WIDTH / 2;
export const SHOOTER_Y = 740;
export const NEXT_BUBBLE_X = SHOOTER_X - 110;
export const NEXT_BUBBLE_Y = SHOOTER_Y + 5;

export const BUBBLE_TEXTURE_SIZE = 120; // High-DPI procedural texture resolution
export const BUBBLE_SCALE = BUBBLE_DIAMETER / BUBBLE_TEXTURE_SIZE; // 0.5 (60px diameter)
export const RESERVE_BUBBLE_SCALE = (BUBBLE_DIAMETER * 0.75) / BUBBLE_TEXTURE_SIZE; // 0.375 (45px diameter)

export const SHOOT_SPEED = 1400; // pixels per second
export const POP_DURATION = 160; // ms
export const DROP_GRAVITY = 1500; // px/s^2

export const COLOR_PALETTES = {
  RED: {
    primary: '#ff3366',
    highlight: '#ffa3ba',
    shadow: '#99002b',
    glow: 'rgba(255, 51, 102, 0.4)'
  },
  BLUE: {
    primary: '#2979ff',
    highlight: '#99c2ff',
    shadow: '#0047b3',
    glow: 'rgba(41, 121, 255, 0.4)'
  },
  GREEN: {
    primary: '#00e676',
    highlight: '#8cffbe',
    shadow: '#008040',
    glow: 'rgba(0, 230, 118, 0.4)'
  },
  YELLOW: {
    primary: '#ffea00',
    highlight: '#fff799',
    shadow: '#b39800',
    glow: 'rgba(255, 234, 0, 0.4)'
  },
  PURPLE: {
    primary: '#d500f9',
    highlight: '#f08cfc',
    shadow: '#78008c',
    glow: 'rgba(213, 0, 249, 0.4)'
  }
};

export const BASE_MATCH_SCORES: Record<number, number> = {
  3: 30,
  4: 50,
  5: 80,
  6: 120
};

export const COMBO_MULTIPLIERS = [1.0, 1.5, 2.0, 3.0, 4.0];
