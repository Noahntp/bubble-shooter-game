import { BubbleColor, LevelConfig } from '../types/game';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Rừng Ngọc Bích',
    rows: 13,
    cols: 8,
    maxShots: 26,
    targetScore: 1200,
    starThresholds: [800, 1200, 1800],
    colors: ['RED', 'BLUE', 'GREEN'],
    initialRows: 5,
    spawnRates: {
      NORMAL: 85,
      BONUS: 8,
      RAINBOW: 3,
      BOMB: 2,
      LIGHTNING: 0,
      FREEZE: 2,
      CURSE: 0,
      TRAP: 0
    }
  },
  {
    level: 2,
    title: 'Chân Trời Vàng',
    rows: 13,
    cols: 8,
    maxShots: 28,
    targetScore: 1800,
    starThresholds: [1200, 1800, 2600],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW'],
    initialRows: 6,
    spawnRates: {
      NORMAL: 82,
      BONUS: 8,
      RAINBOW: 4,
      BOMB: 3,
      LIGHTNING: 0,
      FREEZE: 3,
      CURSE: 0,
      TRAP: 0
    }
  },
  {
    level: 3,
    title: 'Hang Pha Lê',
    rows: 13,
    cols: 8,
    maxShots: 30,
    targetScore: 2400,
    starThresholds: [1600, 2400, 3400],
    colors: ['RED', 'BLUE', 'GREEN', 'PURPLE'],
    initialRows: 6,
    spawnRates: {
      NORMAL: 80,
      BONUS: 8,
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
    title: 'Vết Nứt Cầu Vồng',
    rows: 13,
    cols: 8,
    maxShots: 32,
    targetScore: 3000,
    starThresholds: [2000, 3000, 4200],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 7,
    spawnRates: {
      NORMAL: 78,
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
    title: 'Đỉnh Sấm Sét',
    rows: 13,
    cols: 8,
    maxShots: 34,
    targetScore: 3600,
    starThresholds: [2400, 3600, 5000],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 7,
    spawnRates: {
      NORMAL: 76,
      BONUS: 8,
      RAINBOW: 4,
      BOMB: 4,
      LIGHTNING: 4,
      FREEZE: 4,
      CURSE: 0,
      TRAP: 0
    }
  },
  {
    level: 6,
    title: 'Mật Thất Bóng Đêm',
    rows: 13,
    cols: 8,
    maxShots: 35,
    targetScore: 4200,
    starThresholds: [2800, 4200, 5800],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 7,
    spawnRates: {
      NORMAL: 74,
      BONUS: 8,
      RAINBOW: 4,
      BOMB: 4,
      LIGHTNING: 3,
      FREEZE: 4,
      CURSE: 2,
      TRAP: 1
    }
  },
  {
    level: 7,
    title: 'Vùng Cực Hạn',
    rows: 13,
    cols: 8,
    maxShots: 36,
    targetScore: 4800,
    starThresholds: [3200, 4800, 6500],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 8,
    spawnRates: {
      NORMAL: 72,
      BONUS: 8,
      RAINBOW: 4,
      BOMB: 4,
      LIGHTNING: 3,
      FREEZE: 3,
      CURSE: 3,
      TRAP: 3
    }
  },
  {
    level: 8,
    title: 'Thánh Địa Băng Giá',
    rows: 13,
    cols: 8,
    maxShots: 38,
    targetScore: 5400,
    starThresholds: [3600, 5400, 7200],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 8,
    spawnRates: {
      NORMAL: 70,
      BONUS: 8,
      RAINBOW: 4,
      BOMB: 5,
      LIGHTNING: 4,
      FREEZE: 3,
      CURSE: 3,
      TRAP: 3
    }
  },
  {
    level: 9,
    title: 'Thành Trì Hắc Diệu',
    rows: 13,
    cols: 8,
    maxShots: 40,
    targetScore: 6000,
    starThresholds: [4000, 6000, 8000],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 8,
    spawnRates: {
      NORMAL: 68,
      BONUS: 8,
      RAINBOW: 5,
      BOMB: 5,
      LIGHTNING: 4,
      FREEZE: 3,
      CURSE: 4,
      TRAP: 3
    }
  },
  {
    level: 10,
    title: 'Nhật Thực Huyền Thoại',
    rows: 13,
    cols: 8,
    maxShots: 42,
    targetScore: 7000,
    starThresholds: [4500, 7000, 9500],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
    initialRows: 9,
    spawnRates: {
      NORMAL: 65,
      BONUS: 9,
      RAINBOW: 5,
      BOMB: 5,
      LIGHTNING: 4,
      FREEZE: 3,
      CURSE: 4,
      TRAP: 5
    }
  }
];
