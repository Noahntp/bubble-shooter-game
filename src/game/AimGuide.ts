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
  private reticleSprite: Phaser.GameObjects.Image | null = null;
  private bounceMarker: Phaser.GameObjects.Image | null = null;
  private maxDots = 18;
  private pulseTween: Phaser.Tweens.Tween | null = null;
  private currentTint: number = 0x00e5ff;

  constructor(scene: Phaser.Scene, gridManager: GridManager) {
    this.scene = scene;
    this.gridManager = gridManager;
    this.createDots();
    this.createReticle();
    this.createBounceMarker();
  }

  private createDots(): void {
    for (let i = 0; i < this.maxDots; i++) {
      const dot = this.scene.add.image(0, 0, 'aim_dot');
      dot.setOrigin(0.5, 0.5);
      dot.setScale(0.5);
      dot.setVisible(false);
      dot.setDepth(15);
      this.dots.push(dot);
    }
  }

  private createBounceMarker(): void {
    this.bounceMarker = this.scene.add.image(0, 0, 'wall_spark');
    this.bounceMarker.setOrigin(0.5, 0.5);
    this.bounceMarker.setScale(0.7);
    this.bounceMarker.setVisible(false);
    this.bounceMarker.setDepth(15);
  }

  private createReticle(): void {
    this.reticleSprite = this.scene.add.image(0, 0, 'aim_reticle');
    this.reticleSprite.setOrigin(0.5, 0.5);
    this.reticleSprite.setScale(0.85);
    this.reticleSprite.setVisible(false);
    this.reticleSprite.setDepth(16);

    // Continuous smooth rotation
    this.scene.tweens.add({
      targets: this.reticleSprite,
      rotation: Math.PI * 2,
      duration: 3500,
      repeat: -1,
      ease: 'Linear'
    });

    // Breathing pulse
    this.pulseTween = this.scene.tweens.add({
      targets: this.reticleSprite,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setAimColor(hexTint: number): void {
    this.currentTint = hexTint;
    this.dots.forEach(d => d.setTint(hexTint));
    if (this.reticleSprite) {
      this.reticleSprite.setTint(hexTint);
    }
    if (this.bounceMarker) {
      this.bounceMarker.setTint(hexTint);
    }
  }

  public hide(): void {
    this.dots.forEach(d => d.setVisible(false));
    if (this.reticleSprite) {
      this.reticleSprite.setVisible(false);
    }
    if (this.bounceMarker) {
      this.bounceMarker.setVisible(false);
    }
  }

  /**
   * Computes trajectory with single wall reflection and bubble collision stop,
   * rendering laser dots and target reticle.
   */
  public updateAim(targetX: number, targetY: number): { angle: number; isValid: boolean } {
    // Launcher origin
    const originX = SHOOTER_X;
    const originY = SHOOTER_Y;

    // Angle calculation
    let angle = Phaser.Math.Angle.Between(originX, originY, targetX, targetY);

    // Constrain angle: cannot shoot downward or flat horizontal
    const minAngle = -Math.PI + 0.22; // ~-167 deg
    const maxAngle = -0.22;           // ~-13 deg

    if (angle > 0) {
      this.hide();
      return { angle: -Math.PI / 2, isValid: false };
    }

    angle = Phaser.Math.Clamp(angle, minAngle, maxAngle);

    // Wall boundaries
    const leftWall = LEFT_WALL_X + BUBBLE_RADIUS;
    const rightWall = RIGHT_WALL_X - BUBBLE_RADIUS;
    const ceiling = CEILING_Y + BUBBLE_RADIUS;

    // Raycast simulation - start from the barrel's golden muzzle ring
    let dirX = Math.cos(angle);
    let dirY = Math.sin(angle);
    const trajectoryPoints: { x: number; y: number }[] = [];
    const muzzleOffset = 68;
    let currentX = originX + dirX * muzzleOffset;
    let currentY = originY + dirY * muzzleOffset;
    let distanceTraveled = muzzleOffset;
    const stepSize = 8;
    const maxDistance = 650;

    let wallBounced = false;
    let bouncePoint: { x: number; y: number } | null = null;

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
          bouncePoint = { x: currentX, y: currentY };
        } else if (currentX >= rightWall) {
          currentX = rightWall;
          dirX = -dirX;
          wallBounced = true;
          bouncePoint = { x: currentX, y: currentY };
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

    // Bounce marker display
    if (this.bounceMarker) {
      if (bouncePoint) {
        this.bounceMarker.setPosition(bouncePoint.x, bouncePoint.y);
        this.bounceMarker.setVisible(true);
        this.bounceMarker.setAlpha(0.8);
      } else {
        this.bounceMarker.setVisible(false);
      }
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
        const alpha = Phaser.Math.Linear(0.85, 0.15, i / this.maxDots);
        dot.setAlpha(alpha);

        // Dot scale decreases slightly
        const scale = Phaser.Math.Linear(0.65, 0.35, i / this.maxDots);
        dot.setScale(scale);
      } else {
        dot.setVisible(false);
      }
    }

    // Position reticle at destination
    if (this.reticleSprite && totalPoints > 0) {
      const lastPoint = trajectoryPoints[totalPoints - 1];
      this.reticleSprite.setPosition(lastPoint.x, lastPoint.y);
      this.reticleSprite.setVisible(true);
    }

    return { angle, isValid: true };
  }

  public destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
    }
    this.dots.forEach(d => d.destroy());
    this.dots = [];
    if (this.bounceMarker) {
      this.bounceMarker.destroy();
      this.bounceMarker = null;
    }
    if (this.reticleSprite) {
      this.reticleSprite.destroy();
      this.reticleSprite = null;
    }
  }
}
