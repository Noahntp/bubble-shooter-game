import Phaser from 'phaser';
import {
  BUBBLE_RADIUS,
  CEILING_Y,
  LEFT_WALL_X,
  RIGHT_WALL_X,
  SHOOTER_X,
  SHOOTER_Y
} from './constants';
import { GridManager } from './GridManager';

export class AimGuide {
  private scene: Phaser.Scene;
  private gridManager: GridManager;
  private dots: Phaser.GameObjects.Image[] = [];
  private maxDots = 10;
  private dotSpacing = 28;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, gridManager: GridManager) {
    this.scene = scene;
    this.gridManager = gridManager;
    this.createDots();
  }

  private createDots(): void {
    for (let i = 0; i < this.maxDots; i++) {
      const dot = this.scene.add.image(0, 0, 'aim_dot');
      dot.setOrigin(0.5, 0.5);
      dot.setScale(0.55);
      dot.setVisible(false);
      dot.setDepth(15);
      this.dots.push(dot);
    }
  }

  public hide(): void {
    this.dots.forEach(d => d.setVisible(false));
  }

  /**
   * Computes trajectory with single wall reflection and bubble collision stop,
   * rendering up to 10 discrete fading dots.
   */
  public updateAim(targetX: number, targetY: number): { angle: number; isValid: boolean } {
    // Launcher origin
    const originX = SHOOTER_X;
    const originY = SHOOTER_Y;

    // Angle calculation
    let angle = Phaser.Math.Angle.Between(originX, originY, targetX, targetY);

    // Constrain angle: cannot shoot downward or flat horizontal
    // In Phaser coordinates, upward angles are negative (e.g. -PI/2 is straight up)
    const minAngle = -Math.PI + 0.22; // ~-167 deg
    const maxAngle = -0.22;           // ~-13 deg

    if (angle > 0) {
      // User dragging below launcher
      this.hide();
      return { angle: -Math.PI / 2, isValid: false };
    }

    angle = Phaser.Math.Clamp(angle, minAngle, maxAngle);

    // Wall boundaries (considering bubble radius)
    const leftWall = LEFT_WALL_X + BUBBLE_RADIUS;
    const rightWall = RIGHT_WALL_X - BUBBLE_RADIUS;
    const ceiling = CEILING_Y + BUBBLE_RADIUS;

    // Raycast simulation
    let currentX = originX;
    let currentY = originY;
    let dirX = Math.cos(angle);
    let dirY = Math.sin(angle);

    const trajectoryPoints: { x: number; y: number }[] = [];
    let distanceTraveled = 0;
    const stepSize = 8;
    const maxDistance = 600;

    let wallBounced = false;

    while (distanceTraveled < maxDistance && currentY > ceiling) {
      currentX += dirX * stepSize;
      currentY += dirY * stepSize;
      distanceTraveled += stepSize;

      // Check wall reflection
      if (!wallBounced) {
        if (currentX <= leftWall) {
          currentX = leftWall;
          dirX = -dirX;
          wallBounced = true;
        } else if (currentX >= rightWall) {
          currentX = rightWall;
          dirX = -dirX;
          wallBounced = true;
        }
      }

      // Check collision with any existing bubbles on board
      const nearbyCoord = this.gridManager.pixelToGrid(currentX, currentY);
      const bubble = this.gridManager.getBubble(nearbyCoord.row, nearbyCoord.col);
      if (bubble) {
        const bubblePixel = this.gridManager.gridToPixel(nearbyCoord.row, nearbyCoord.col);
        const dist = Phaser.Math.Distance.Between(currentX, currentY, bubblePixel.x, bubblePixel.y);
        if (dist <= BUBBLE_RADIUS * 1.8) {
          break; // Trajectory stopped at bubble collision
        }
      }

      trajectoryPoints.push({ x: currentX, y: currentY });
    }

    // Sample points for the aim guide dots
    const totalPoints = trajectoryPoints.length;
    const stride = Math.max(1, Math.floor(totalPoints / this.maxDots));

    for (let i = 0; i < this.maxDots; i++) {
      const dot = this.dots[i];
      const pointIndex = (i + 1) * stride;

      if (pointIndex < totalPoints) {
        const pt = trajectoryPoints[pointIndex];
        dot.setPosition(pt.x, pt.y);
        dot.setVisible(true);

        // Opacity decreases gradually from near launcher to trajectory tip
        const alpha = Phaser.Math.Linear(0.85, 0.12, i / this.maxDots);
        dot.setAlpha(alpha);

        // Dot scale decreases slightly
        const scale = Phaser.Math.Linear(0.65, 0.4, i / this.maxDots);
        dot.setScale(scale);
      } else {
        dot.setVisible(false);
      }
    }

    return { angle, isValid: true };
  }

  public destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
    }
    this.dots.forEach(d => d.destroy());
    this.dots = [];
  }
}
