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

export const CEILING_Y = 118;
export const DANGER_LINE_Y = 560;

export const SHOOTER_X = GAME_WIDTH / 2; // 260
export const SHOOTER_Y = 695;
export const NEXT_BUBBLE_X = 115;
export const NEXT_BUBBLE_Y = 675;
export const MISS_METER_X = 405;
export const MISS_METER_Y = 680;

export const BUBBLE_TEXTURE_SIZE = 120; // High-DPI procedural texture resolution
export const BUBBLE_SCALE = BUBBLE_DIAMETER / BUBBLE_TEXTURE_SIZE; // 0.5 (60px diameter)
export const RESERVE_BUBBLE_SCALE = (BUBBLE_DIAMETER * 0.62) / BUBBLE_TEXTURE_SIZE; // ~0.31 (37px diameter, ~62% of current)

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

// Ocean Orb Mechanics Constants
export const OCEAN_ORB_CONFIG = {
  MATCH_COUNT_MIN: 3,
  TURTLE_SHIELD_MAX_HP: 2,
  CRAB_BOMB_RADIUS_PX: BUBBLE_RADIUS * 3.2,
  STARFISH_BONUS_BASE_SCORE: 500,
  OCTOPUS_CHAIN_DELAY_MS: 60,
  SHARK_BOSS_DEFAULT_HP: 5,
  SHARK_BOSS_REWARD_SCORE: 5000,
  OBSTACLE_ROCK_SCORE: 200,
  OBSTACLE_ICE_HITS_REQUIRED: 2
};

/**
 * Resolves the texture key for any bubble entity according to Reference A:
 * - RED -> Pufferfish (Cá nóc)
 * - GREEN -> Sea Turtle (Rùa biển)
 * - BLUE -> Jellyfish (Sứa)
 * - YELLOW -> Starfish (Sao biển)
 * - PURPLE -> Squid (Mực)
 * - CRAB / BOMB -> Crab (Cua)
 * - OCTOPUS / CURSE -> Octopus (Bạch tuộc)
 * - SHARK -> Shark (Cá mập)
 * - WHIRLPOOL -> Whirlpool (Xoáy nước)
 */
export function getBubbleTextureKey(bubble: { type?: string; color?: string; shieldHp?: number }): string {
  if (bubble.type === 'TURTLE' || bubble.type === 'TRAP') {
    if (bubble.shieldHp === 1) return 'bubble_TURTLE_CRACKED';
    return 'bubble_TURTLE';
  }
  if (bubble.type === 'PUFFERFISH') return 'bubble_PUFFERFISH';
  if (bubble.type === 'JELLYFISH' || bubble.type === 'RAINBOW') return 'bubble_JELLYFISH';
  if (bubble.type === 'STARFISH' || bubble.type === 'BONUS') return 'bubble_STARFISH';
  if (bubble.type === 'SQUID' || bubble.type === 'LIGHTNING') return 'bubble_SQUID';
  if (bubble.type === 'CRAB' || bubble.type === 'BOMB') return 'bubble_CRAB';
  if (bubble.type === 'OCTOPUS' || bubble.type === 'CURSE') return 'bubble_OCTOPUS';
  if (bubble.type === 'SHARK') return 'bubble_SHARK';
  if (bubble.type === 'WHIRLPOOL') return 'bubble_WHIRLPOOL';
  if (bubble.type === 'ROCK' || bubble.type === 'ICE' || bubble.type === 'CAGE' || bubble.type === 'SEAWEED') {
    return `bubble_${bubble.type}`;
  }
  if (bubble.color) {
    return `bubble_${bubble.color}`;
  }
  return 'bubble_RED';
}

