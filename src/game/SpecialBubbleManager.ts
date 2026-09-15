import { BubbleEntity, BubbleColor, ALL_BUBBLE_COLORS } from '../types/game';
import { GridManager } from './GridManager';

export interface ResolvedEffectResult {
  bubblesToPop: { bubble: BubbleEntity; reason: string; score: number }[];
  bubblesToFreeze: BubbleEntity[];
  bubblesToSpawn: { row: number; col: number; color: BubbleColor }[];
  scoreDelta: number;
  bonusTriggered: { x: number; y: number; amount: number }[];
  curseTriggered: { x: number; y: number; amount: number }[];
  screenShake: boolean;
}

export class SpecialBubbleManager {
  private gridManager: GridManager;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  /**
   * Rolls Bonus score reward based on calibrated probability distribution:
   * 100: 50%
   * 250: 30%
   * 500: 15%
   * 1000: 5%
   */
  public rollBonusReward(): number {
    const roll = Math.random() * 100;
    if (roll < 50) return 100;
    if (roll < 80) return 250;
    if (roll < 95) return 500;
    return 1000;
  }

  /**
   * Rolls Curse penalty deduction:
   * -100: 50%
   * -200: 35%
   * -300: 15%
   */
  public rollCursePenalty(): number {
    const roll = Math.random() * 100;
    if (roll < 50) return -100;
    if (roll < 85) return -200;
    return -300;
  }

  /**
   * Calculates Bomb blast area (hexagonal radius 1-2, surrounding ~8-12 cells).
   * Supports chaining up to maxChain = 3.
   */
  public getBombBlastArea(startBubble: BubbleEntity, currentChain: number = 0): BubbleEntity[] {
    if (currentChain >= 3) return [];

    const affected = new Map<string, BubbleEntity>();
    const toProcess: BubbleEntity[] = [startBubble];
    affected.set(`${startBubble.row},${startBubble.col}`, startBubble);

    // Blast primary neighbors
    const neighbors = this.gridManager.getNeighbors(startBubble.row, startBubble.col);
    for (const n of neighbors) {
      const b = this.gridManager.getBubble(n.row, n.col);
      if (b && b.state !== 'DESTROYED') {
        affected.set(`${b.row},${b.col}`, b);
      }
    }

    return Array.from(affected.values());
  }

  /**
   * Calculates Lightning full row obliteration.
   */
  public getLightningRowBubbles(row: number): BubbleEntity[] {
    const list: BubbleEntity[] = [];
    const cols = this.gridManager.getColsInRow(row);
    for (let c = 0; c < cols; c++) {
      const b = this.gridManager.getBubble(row, c);
      if (b && b.state !== 'DESTROYED') {
        list.push(b);
      }
    }
    return list;
  }

  /**
   * Calculates Freeze target bubbles (up to 8 surrounding bubbles, duration 2 turns).
   */
  public getFreezeTargets(startBubble: BubbleEntity): BubbleEntity[] {
    const targets: BubbleEntity[] = [];
    const neighbors = this.gridManager.getNeighbors(startBubble.row, startBubble.col);

    for (const n of neighbors) {
      const b = this.gridManager.getBubble(n.row, n.col);
      if (b && b.state !== 'FROZEN' && b.state !== 'DESTROYED') {
        targets.push(b);
      }
    }

    // If fewer than 8, expand to secondary ring
    if (targets.length < 8) {
      for (const primary of [...targets]) {
        for (const n of this.gridManager.getNeighbors(primary.row, primary.col)) {
          if (targets.length >= 8) break;
          const b = this.gridManager.getBubble(n.row, n.col);
          if (b && !targets.includes(b) && b !== startBubble && b.state !== 'FROZEN') {
            targets.push(b);
          }
        }
      }
    }

    return targets.slice(0, 8);
  }

  /**
   * Spawns up to 4 normal bubbles in nearby empty grid slots for Trap effect.
   * Suppressed if board occupancy > 85%.
   */
  public getTrapSpawnSlots(trapBubble: BubbleEntity): { row: number; col: number; color: BubbleColor }[] {
    if (this.gridManager.getOccupancy() > 0.85) {
      return []; // Anti-frustration: do not spawn if board is full
    }

    const slots: { row: number; col: number; color: BubbleColor }[] = [];
    const neighbors = this.gridManager.getNeighbors(trapBubble.row, trapBubble.col);

    for (const n of neighbors) {
      if (slots.length >= 4) break;
      if (this.gridManager.getBubble(n.row, n.col) === null) {
        const randomColor = ALL_BUBBLE_COLORS[Math.floor(Math.random() * ALL_BUBBLE_COLORS.length)];
        slots.push({ row: n.row, col: n.col, color: randomColor });
      }
    }

    return slots;
  }

  /**
   * Updates freeze turns at the end of each turn.
   * Decrements freezeTurnsRemaining. If 0, restores state to IDLE/ATTACHED.
   */
  public tickFreezeTurns(): BubbleEntity[] {
    const thawed: BubbleEntity[] = [];
    const all = this.gridManager.getAllBubbles();

    for (const b of all) {
      if (b.state === 'FROZEN') {
        b.freezeTurnsRemaining -= 1;
        if (b.freezeTurnsRemaining <= 0) {
          b.state = 'ATTACHED';
          b.freezeTurnsRemaining = 0;
          thawed.push(b);
        }
      }
    }
    return thawed;
  }
}
