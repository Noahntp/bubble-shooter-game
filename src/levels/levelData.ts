import { BubbleColor, LevelConfig } from '../types/game';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Rạn San Hô Xanh',
    rows: 13,
    cols: 8,
    maxShots: 26,
    targetScore: 1200,
    starThresholds: [800, 1200, 1800],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 5,
    customGrid: [
      { row: 1, col: 3, type: 'STARFISH' },
      { row: 2, col: 2, type: 'CRAB' },
      { row: 2, col: 5, type: 'TURTLE' },
      { row: 3, col: 6, type: 'SHARK' }
    ],
    spawnRates: {
      NORMAL: 80,
      BONUS: 6,
      RAINBOW: 4,
      BOMB: 4,
      LIGHTNING: 2,
      FREEZE: 2,
      CURSE: 2,
      TRAP: 0
    }
  },
  {
    level: 2,
    title: 'Hang Ngọc Trai',
    rows: 13,
    cols: 8,
    maxShots: 28,
    targetScore: 1800,
    starThresholds: [1200, 1800, 2600],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW'],
    initialRows: 6,
    customGrid: [
      { row: 2, col: 3, type: 'JELLYFISH' }
    ],
    spawnRates: {
      NORMAL: 80,
      BONUS: 8,
      RAINBOW: 5,
      BOMB: 3,
      LIGHTNING: 0,
      FREEZE: 3,
      CURSE: 0,
      TRAP: 0
    }
  },
  {
    level: 3,
    title: 'Vịnh Cá Voi Sao',
    rows: 13,
    cols: 8,
    maxShots: 30,
    targetScore: 2400,
    starThresholds: [1600, 2400, 3400],
    colors: ['RED', 'BLUE', 'GREEN', 'PURPLE'],
    initialRows: 6,
    customGrid: [
      { row: 1, col: 2, type: 'STARFISH' },
      { row: 1, col: 5, type: 'STARFISH' },
      { row: 3, col: 3, type: 'CRAB' }
    ],
    spawnRates: {
      NORMAL: 78,
      BONUS: 10,
      RAINBOW: 4,
      BOMB: 3,
      LIGHTNING: 0,
      FREEZE: 5,
      CURSE: 0,
      TRAP: 0
    }
  },
  {
    level: 4,
    title: 'Rừng Tảo Dạ Quang',
    rows: 13,
    cols: 8,
    maxShots: 32,
    targetScore: 3000,
    starThresholds: [2000, 3000, 4200],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 7,
    customGrid: [
      { row: 2, col: 2, type: 'TURTLE' },
      { row: 2, col: 5, type: 'TURTLE' },
      { row: 3, col: 3, type: 'SEAWEED' }
    ],
    spawnRates: {
      NORMAL: 75,
      BONUS: 8,
      RAINBOW: 5,
      BOMB: 4,
      LIGHTNING: 2,
      FREEZE: 3,
      CURSE: 0,
      TRAP: 0
    }
  },
  {
    level: 5,
    title: 'Rãnh Biển Mariana (Boss)',
    rows: 13,
    cols: 8,
    maxShots: 34,
    targetScore: 3800,
    starThresholds: [2400, 3800, 5200],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 7,
    customGrid: [
      { row: 2, col: 3, type: 'SHARK' },
      { row: 1, col: 3, type: 'ROCK' },
      { row: 3, col: 2, type: 'TURTLE' },
      { row: 3, col: 4, type: 'TURTLE' }
    ],
    spawnRates: {
      NORMAL: 74,
      BONUS: 8,
      RAINBOW: 5,
      BOMB: 5,
      LIGHTNING: 4,
      FREEZE: 4,
      CURSE: 0,
      TRAP: 0
    }
  },
  {
    level: 6,
    title: 'Vườn Sứa Biển Sâu',
    rows: 13,
    cols: 8,
    maxShots: 35,
    targetScore: 4200,
    starThresholds: [2800, 4200, 5800],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 7,
    customGrid: [
      { row: 2, col: 2, type: 'JELLYFISH' },
      { row: 2, col: 4, type: 'JELLYFISH' },
      { row: 3, col: 3, type: 'CRAB' }
    ],
    spawnRates: {
      NORMAL: 72,
      BONUS: 8,
      RAINBOW: 6,
      BOMB: 5,
      LIGHTNING: 3,
      FREEZE: 4,
      CURSE: 2,
      TRAP: 1
    }
  },
  {
    level: 7,
    title: 'Hang Kho Báu Đắm',
    rows: 13,
    cols: 8,
    maxShots: 36,
    targetScore: 4800,
    starThresholds: [3200, 4800, 6500],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 8,
    customGrid: [
      { row: 2, col: 2, type: 'CAGE' },
      { row: 2, col: 4, type: 'CAGE' },
      { row: 1, col: 3, type: 'ROCK' },
      { row: 3, col: 3, type: 'STARFISH' }
    ],
    spawnRates: {
      NORMAL: 70,
      BONUS: 9,
      RAINBOW: 4,
      BOMB: 5,
      LIGHTNING: 3,
      FREEZE: 3,
      CURSE: 3,
      TRAP: 3
    }
  },
  {
    level: 8,
    title: 'Đảo Thủy Quái Kraken',
    rows: 13,
    cols: 8,
    maxShots: 38,
    targetScore: 5400,
    starThresholds: [3600, 5400, 7200],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 8,
    customGrid: [
      { row: 2, col: 2, type: 'SQUID' },
      { row: 2, col: 5, type: 'OCTOPUS' },
      { row: 3, col: 3, type: 'TURTLE' }
    ],
    spawnRates: {
      NORMAL: 68,
      BONUS: 8,
      RAINBOW: 5,
      BOMB: 5,
      LIGHTNING: 5,
      FREEZE: 3,
      CURSE: 3,
      TRAP: 3
    }
  },
  {
    level: 9,
    title: 'Vực Xoáy Thủy Tề',
    rows: 13,
    cols: 8,
    maxShots: 40,
    targetScore: 6000,
    starThresholds: [4000, 6000, 8000],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 8,
    customGrid: [
      { row: 2, col: 1, type: 'ICE' },
      { row: 2, col: 3, type: 'TURTLE' },
      { row: 2, col: 5, type: 'ICE' },
      { row: 1, col: 3, type: 'OCTOPUS' }
    ],
    spawnRates: {
      NORMAL: 66,
      BONUS: 8,
      RAINBOW: 5,
      BOMB: 5,
      LIGHTNING: 5,
      FREEZE: 3,
      CURSE: 4,
      TRAP: 3
    }
  },
  {
    level: 10,
    title: 'Cung Điện Atlantis (Final Titan)',
    rows: 13,
    cols: 8,
    maxShots: 44,
    targetScore: 7500,
    starThresholds: [4500, 7500, 10000],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 9,
    customGrid: [
      { row: 2, col: 3, type: 'SHARK' },
      { row: 2, col: 1, type: 'TURTLE' },
      { row: 2, col: 5, type: 'TURTLE' },
      { row: 3, col: 2, type: 'CRAB' },
      { row: 3, col: 4, type: 'CRAB' },
      { row: 1, col: 3, type: 'ROCK' }
    ],
    spawnRates: {
      NORMAL: 64,
      BONUS: 9,
      RAINBOW: 6,
      BOMB: 5,
      LIGHTNING: 4,
      FREEZE: 3,
      CURSE: 4,
      TRAP: 5
    }
  }
];
