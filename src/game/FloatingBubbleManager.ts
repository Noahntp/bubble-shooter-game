import { BubbleEntity } from '../types/game';
import { GridManager } from './GridManager';
import { GRID_COLS } from './constants';

export class FloatingBubbleManager {
  private gridManager: GridManager;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  /**
   * Identifies all bubbles that are no longer anchored to the ceiling (row 0).
   * Note: Frozen bubbles do not fall (per game rules).
   */
  public findFloatingBubbles(): BubbleEntity[] {
    const connectedToCeiling = new Set<string>();
    const queue: { row: number; col: number }[] = [];

    // Step 1: Enqueue all existing bubbles in the top row (row 0)
    for (let c = 0; c < GRID_COLS; c++) {
      const bubble = this.gridManager.getBubble(0, c);
      if (bubble && bubble.state !== 'POPPING' && bubble.state !== 'FALLING' && bubble.state !== 'DESTROYED') {
        const key = `0,${c}`;
        connectedToCeiling.add(key);
        queue.push({ row: 0, col: c });
      }
    }

    // Step 2: Flood-fill traversal to find all bubbles connected to the ceiling
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.gridManager.getNeighbors(current.row, current.col);

      for (const n of neighbors) {
        const key = `${n.row},${n.col}`;
        if (connectedToCeiling.has(key)) continue;

        const neighbor = this.gridManager.getBubble(n.row, n.col);
        if (neighbor && neighbor.state !== 'POPPING' && neighbor.state !== 'FALLING' && neighbor.state !== 'DESTROYED') {
          connectedToCeiling.add(key);
          queue.push(n);
        }
      }
    }

    // Step 3: Any bubble not in connectedToCeiling (and not FROZEN) is floating!
    const floatingBubbles: BubbleEntity[] = [];
    const all = this.gridManager.getAllBubbles();

    for (const bubble of all) {
      if (bubble.state === 'POPPING' || bubble.state === 'FALLING' || bubble.state === 'DESTROYED') {
        continue;
      }

      // Rule: Frozen bubbles do not fall
      if (bubble.state === 'FROZEN') {
        continue;
      }

      const key = `${bubble.row},${bubble.col}`;
      if (!connectedToCeiling.has(key)) {
        floatingBubbles.push(bubble);
      }
    }

    return floatingBubbles;
  }
}
