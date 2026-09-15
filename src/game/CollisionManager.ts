import Phaser from 'phaser';
import {
  BUBBLE_RADIUS,
  CEILING_Y,
  LEFT_WALL_X,
  RIGHT_WALL_X
} from './constants';
import { GridManager } from './GridManager';
import { GridCoord } from '../types/game';

export interface CollisionResult {
  hasCollided: boolean;
  type: 'CEILING' | 'BUBBLE' | 'NONE';
  targetSlot: GridCoord | null;
}

export class CollisionManager {
  private gridManager: GridManager;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  /**
   * Evaluates wall bounces and returns updated velocity vector.
   */
  public handleWallBounce(
    x: number,
    vx: number
  ): { x: number; vx: number; bounced: boolean } {
    let newX = x;
    let newVx = vx;
    let bounced = false;

    const minX = LEFT_WALL_X + BUBBLE_RADIUS;
    const maxX = RIGHT_WALL_X - BUBBLE_RADIUS;

    if (x <= minX) {
      newX = minX;
      newVx = Math.abs(vx);
      bounced = true;
    } else if (x >= maxX) {
      newX = maxX;
      newVx = -Math.abs(vx);
      bounced = true;
    }

    return { x: newX, vx: newVx, bounced };
  }

  /**
   * Checks collision against ceiling or existing grid bubbles.
   * If collision occurs, accurately determines the nearest valid empty hex slot.
   */
  public checkGridCollision(x: number, y: number): CollisionResult {
    // 1. Ceiling collision
    if (y - BUBBLE_RADIUS <= CEILING_Y) {
      const slot = this.gridManager.findNearestEmptySlot(x, y);
      return {
        hasCollided: true,
        type: 'CEILING',
        targetSlot: slot
      };
    }

    // 2. Collision with occupied bubbles in grid
    const collisionThresholdSq = Math.pow(BUBBLE_RADIUS * 1.85, 2);
    const nearbyGrid = this.gridManager.pixelToGrid(x, y);

    // Check cells in radius around nearbyGrid
    for (let r = Math.max(0, nearbyGrid.row - 2); r <= Math.min(12, nearbyGrid.row + 2); r++) {
      const cols = this.gridManager.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.gridManager.getBubble(r, c);
        if (bubble && bubble.state !== 'POPPING' && bubble.state !== 'FALLING' && bubble.state !== 'DESTROYED') {
          const pos = this.gridManager.gridToPixel(r, c);
          const distSq = Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2);

          if (distSq <= collisionThresholdSq) {
            // Collision detected! Snap to closest empty neighbor slot
            const slot = this.gridManager.findNearestEmptySlot(x, y);
            return {
              hasCollided: true,
              type: 'BUBBLE',
              targetSlot: slot
            };
          }
        }
      }
    }

    return {
      hasCollided: false,
      type: 'NONE',
      targetSlot: null
    };
  }
}
