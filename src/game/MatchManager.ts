import { BubbleEntity, BubbleColor, ALL_BUBBLE_COLORS } from '../types/game';
import { GridManager } from './GridManager';

export class MatchManager {
  private gridManager: GridManager;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  /**
   * Finds connected matching bubbles starting from a freshly attached bubble.
   */
  public findMatches(startBubble: BubbleEntity): BubbleEntity[] {
    if (startBubble.state === 'FROZEN') return [];

    // Case 1: The shot bubble is a RAINBOW bubble
    if (startBubble.type === 'RAINBOW') {
      return this.findBestRainbowMatch(startBubble);
    }

    // Non-matchable types (BONUS, CURSE, TRAP, BOMB, LIGHTNING) don't form color matches on their own
    if (startBubble.type !== 'NORMAL') {
      return [];
    }

    return this.findConnectedColorCluster(startBubble, startBubble.color);
  }

  /**
   * Finds all connected bubbles matching targetColor (including RAINBOW wildcards).
   */
  public findConnectedColorCluster(startBubble: BubbleEntity, targetColor: BubbleColor): BubbleEntity[] {
    const visited = new Set<string>();
    const matchedList: BubbleEntity[] = [];
    const queue: BubbleEntity[] = [startBubble];

    visited.add(`${startBubble.row},${startBubble.col}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      matchedList.push(current);

      const neighbors = this.gridManager.getNeighbors(current.row, current.col);
      for (const nCoord of neighbors) {
        const key = `${nCoord.row},${nCoord.col}`;
        if (visited.has(key)) continue;

        const neighbor = this.gridManager.getBubble(nCoord.row, nCoord.col);
        if (!neighbor) continue;

        // Frozen bubbles cannot match
        if (neighbor.state === 'FROZEN') continue;

        const isColorMatch = neighbor.type === 'NORMAL' && neighbor.color === targetColor;
        const isRainbowMatch = neighbor.type === 'RAINBOW';

        if (isColorMatch || isRainbowMatch) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }

    return matchedList.length >= 3 ? matchedList : [];
  }

  /**
   * Resolves Rainbow wildcard priority:
   * 1. Largest matching group
   * 2. Closest to impact point
   * 3. Deterministic color fallback
   */
  private findBestRainbowMatch(rainbowBubble: BubbleEntity): BubbleEntity[] {
    const neighbors = this.gridManager.getNeighbors(rainbowBubble.row, rainbowBubble.col);
    const adjacentColors = new Set<BubbleColor>();

    for (const n of neighbors) {
      const b = this.gridManager.getBubble(n.row, n.col);
      if (b && b.state !== 'FROZEN' && b.type === 'NORMAL') {
        adjacentColors.add(b.color);
      }
    }

    if (adjacentColors.size === 0) {
      return [];
    }

    let bestCluster: BubbleEntity[] = [];

    for (const color of ALL_BUBBLE_COLORS) {
      if (!adjacentColors.has(color)) continue;

      const cluster = this.findConnectedColorCluster(rainbowBubble, color);
      if (cluster.length > bestCluster.length) {
        bestCluster = cluster;
      }
    }

    return bestCluster.length >= 3 ? bestCluster : [];
  }
}
