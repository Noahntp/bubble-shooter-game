import { BubbleEntity, GridCoord } from '../types/game';
import {
  BUBBLE_DIAMETER,
  BUBBLE_RADIUS,
  CEILING_Y,
  GRID_COLS,
  GRID_ROWS,
  LEFT_MARGIN,
  ROW_HEIGHT,
  DANGER_LINE_Y
} from './constants';

export class GridManager {
  private grid: (BubbleEntity | null)[][];

  constructor() {
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): (BubbleEntity | null)[][] {
    const matrix: (BubbleEntity | null)[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const cols = this.getColsInRow(r);
      matrix.push(new Array(cols).fill(null));
    }
    return matrix;
  }

  public getColsInRow(row: number): number {
    return row % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
  }

  public gridToPixel(row: number, col: number): { x: number; y: number } {
    const isOdd = row % 2 === 1;
    const startX = LEFT_MARGIN + (isOdd ? 2 * BUBBLE_RADIUS : BUBBLE_RADIUS);
    const x = startX + col * BUBBLE_DIAMETER;
    const y = CEILING_Y + BUBBLE_RADIUS + row * ROW_HEIGHT;
    return { x, y };
  }

  public pixelToGrid(x: number, y: number): GridCoord {
    let row = Math.round((y - CEILING_Y - BUBBLE_RADIUS) / ROW_HEIGHT);
    row = Math.max(0, Math.min(GRID_ROWS - 1, row));

    const isOdd = row % 2 === 1;
    const startX = LEFT_MARGIN + (isOdd ? 2 * BUBBLE_RADIUS : BUBBLE_RADIUS);
    let col = Math.round((x - startX) / BUBBLE_DIAMETER);
    col = Math.max(0, Math.min(this.getColsInRow(row) - 1, col));

    return { row, col };
  }

  public getNeighbors(row: number, col: number): GridCoord[] {
    const neighbors: GridCoord[] = [];
    const isEven = row % 2 === 0;

    const deltas = isEven
      ? [
          { r: -1, c: -1 },
          { r: -1, c: 0 },
          { r: 0, c: -1 },
          { r: 0, c: 1 },
          { r: 1, c: -1 },
          { r: 1, c: 0 }
        ]
      : [
          { r: -1, c: 0 },
          { r: -1, c: 1 },
          { r: 0, c: -1 },
          { r: 0, c: 1 },
          { r: 1, c: 0 },
          { r: 1, c: 1 }
        ];

    for (const d of deltas) {
      const nr = row + d.r;
      const nc = col + d.c;
      if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < this.getColsInRow(nr)) {
        neighbors.push({ row: nr, col: nc });
      }
    }
    return neighbors;
  }

  public getBubble(row: number, col: number): BubbleEntity | null {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= this.getColsInRow(row)) {
      return null;
    }
    return this.grid[row][col];
  }

  public setBubble(row: number, col: number, bubble: BubbleEntity | null): void {
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < this.getColsInRow(row)) {
      this.grid[row][col] = bubble;
      if (bubble) {
        bubble.row = row;
        bubble.col = col;
        const pos = this.gridToPixel(row, col);
        bubble.visualX = pos.x;
        bubble.visualY = pos.y;
      }
    }
  }

  public removeBubble(row: number, col: number): BubbleEntity | null {
    const existing = this.getBubble(row, col);
    if (existing) {
      this.grid[row][col] = null;
    }
    return existing;
  }

  public getAllBubbles(): BubbleEntity[] {
    const list: BubbleEntity[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < this.getColsInRow(r); c++) {
        const b = this.grid[r][c];
        if (b) list.push(b);
      }
    }
    return list;
  }

  public getTotalSlots(): number {
    let count = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      count += this.getColsInRow(r);
    }
    return count;
  }

  public getOccupancy(): number {
    const bubbles = this.getAllBubbles();
    return bubbles.length / this.getTotalSlots();
  }

  public isDangerReached(): boolean {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < this.getColsInRow(r); c++) {
        const b = this.grid[r][c];
        if (b) {
          const { y } = this.gridToPixel(r, c);
          if (y + BUBBLE_RADIUS >= DANGER_LINE_Y) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public findNearestEmptySlot(x: number, y: number): GridCoord | null {
    let closestCoord: GridCoord | null = null;
    let minDistanceSq = Infinity;

    // Check all empty slots
    for (let r = 0; r < GRID_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (this.grid[r][c] !== null) continue;

        // A slot is attachable if it's in the top ceiling row (r === 0)
        // OR has at least one occupied neighbor
        const hasNeighbor = r === 0 || this.getNeighbors(r, c).some(n => this.getBubble(n.row, n.col) !== null);
        if (!hasNeighbor) continue;

        const pos = this.gridToPixel(r, c);
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          closestCoord = { row: r, col: c };
        }
      }
    }

    return closestCoord;
  }

  public clear(): void {
    this.grid = this.createEmptyGrid();
  }
}
