import Phaser from 'phaser';
import { BubbleColor, BubbleEntity, BubbleType } from '../types/game';
import {
  SHOOTER_X,
  SHOOTER_Y,
  NEXT_BUBBLE_X,
  NEXT_BUBBLE_Y,
  BUBBLE_RADIUS,
  BUBBLE_SCALE,
  RESERVE_BUBBLE_SCALE
} from './constants';
import { DynamicDifficultyManager } from './DynamicDifficulty';
import { audioManager } from '../audio/AudioManager';

export class ShooterManager {
  private scene: Phaser.Scene;
  private difficultyManager: DynamicDifficultyManager;

  private barrelSprite: Phaser.GameObjects.Image;
  private currentBubbleSprite: Phaser.GameObjects.Image | null = null;
  private nextBubbleSprite: Phaser.GameObjects.Image | null = null;
  private baseSprite: Phaser.GameObjects.Image;
  private dockSprite: Phaser.GameObjects.Image;

  public currentBubble: BubbleEntity | null = null;
  public nextBubble: BubbleEntity | null = null;

  private isSwapping = false;
  private currentAngle = -Math.PI / 2; // Point straight up initially

  constructor(scene: Phaser.Scene, difficultyManager: DynamicDifficultyManager) {
    this.scene = scene;
    this.difficultyManager = difficultyManager;

    // 1. High-Tech Floating Reserve Dock
    this.dockSprite = scene.add.image(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, 'reserve_dock');
    this.dockSprite.setDepth(11);
    this.dockSprite.setInteractive({ useHandCursor: true });
    this.dockSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation?.();
      this.swapBubbles();
    });
    scene.tweens.add({
      targets: this.dockSprite,
      rotation: Math.PI * 2,
      duration: 10000,
      repeat: -1,
      ease: 'Linear'
    });

    // 2. High-Tech Turntable Base
    this.baseSprite = scene.add.image(SHOOTER_X, SHOOTER_Y + 10, 'launcher_base');
    this.baseSprite.setDepth(11);

    // 3. Futuristic Plasma Cannon Barrel
    this.barrelSprite = scene.add.image(SHOOTER_X, SHOOTER_Y, 'launcher_barrel');
    this.barrelSprite.setOrigin(0.5, 0.85);
    this.barrelSprite.setRotation(this.currentAngle + Math.PI / 2);
    this.barrelSprite.setDepth(12);

    // Subtle idle breathing
    scene.tweens.add({
      targets: this.barrelSprite,
      scaleX: 1.03,
      scaleY: 0.98,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public initBubbles(
    level: number,
    boardOccupancy: number,
    shotsRemaining: number,
    activeColors: BubbleColor[]
  ): void {
    this.currentBubble = this.generateBubble(level, boardOccupancy, shotsRemaining, activeColors);
    this.nextBubble = this.generateBubble(level, boardOccupancy, shotsRemaining, activeColors);
    this.renderCurrentBubble();
    this.renderNextBubble();
  }

  public generateBubble(
    level: number,
    boardOccupancy: number,
    shotsRemaining: number,
    activeColors: BubbleColor[]
  ): BubbleEntity {
    const type: BubbleType = this.difficultyManager.rollNextBubbleType(
      level,
      boardOccupancy,
      shotsRemaining,
      0
    );

    // For normal bubbles, pick from active colors on the board
    const color = activeColors[Math.floor(Math.random() * activeColors.length)] || 'RED';

    return {
      id: `bubble_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      row: -1,
      col: -1,
      color,
      type,
      state: 'IDLE',
      freezeTurnsRemaining: 0,
      visualX: SHOOTER_X,
      visualY: SHOOTER_Y
    };
  }

  public setAimAngle(angle: number): void {
    this.currentAngle = angle;
    // Offset because texture points UP at angle -PI/2
    this.barrelSprite.setRotation(angle + Math.PI / 2);
  }

  public triggerRecoil(): void {
    const recoilDist = 12;
    const dirX = Math.cos(this.currentAngle);
    const dirY = Math.sin(this.currentAngle);

    this.scene.tweens.add({
      targets: this.barrelSprite,
      x: SHOOTER_X - dirX * recoilDist,
      y: SHOOTER_Y - dirY * recoilDist,
      duration: 65,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.barrelSprite.setPosition(SHOOTER_X, SHOOTER_Y);
      }
    });
  }

  public isSwappingState(): boolean {
    return this.isSwapping;
  }

  public swapBubbles(): void {
    if (this.isSwapping || !this.currentBubble || !this.nextBubble) return;
    if (!this.currentBubbleSprite || !this.nextBubbleSprite) return;

    this.isSwapping = true;
    audioManager.play('bubble_attach');

    // 1. Swap logical bubble models
    const tempBubble = this.currentBubble;
    this.currentBubble = this.nextBubble;
    this.nextBubble = tempBubble;

    // 2. Swap sprite references (moving without destroying)
    const movingToDock = this.currentBubbleSprite;
    const movingToLauncher = this.nextBubbleSprite;

    this.currentBubbleSprite = movingToLauncher;
    this.nextBubbleSprite = movingToDock;

    // Disable interactions during swap animation
    movingToDock.disableInteractive();
    movingToLauncher.disableInteractive();

    // 3. Smooth simultaneous transition
    this.scene.tweens.add({
      targets: movingToDock,
      x: NEXT_BUBBLE_X,
      y: NEXT_BUBBLE_Y,
      scaleX: RESERVE_BUBBLE_SCALE,
      scaleY: RESERVE_BUBBLE_SCALE,
      duration: 160,
      ease: 'Cubic.easeInOut'
    });

    this.scene.tweens.add({
      targets: movingToLauncher,
      x: SHOOTER_X,
      y: SHOOTER_Y,
      scaleX: BUBBLE_SCALE,
      scaleY: BUBBLE_SCALE,
      duration: 160,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        if (this.nextBubbleSprite) {
          this.setupNextBubbleInteractive();
        }
        this.isSwapping = false;
      }
    });
  }

  public advanceTurn(
    level: number,
    boardOccupancy: number,
    shotsRemaining: number,
    activeColors: BubbleColor[]
  ): void {
    // Current bubble was consumed by the shot.
    // The previous nextBubble becomes currentBubble!
    this.currentBubble = this.nextBubble;
    this.nextBubble = this.generateBubble(level, boardOccupancy, shotsRemaining, activeColors);

    // If nextBubbleSprite exists, animate it moving into the cannon!
    if (this.nextBubbleSprite) {
      this.currentBubbleSprite = this.nextBubbleSprite;
      this.nextBubbleSprite = null;
      this.currentBubbleSprite.disableInteractive();

      this.scene.tweens.add({
        targets: this.currentBubbleSprite,
        x: SHOOTER_X,
        y: SHOOTER_Y,
        scaleX: BUBBLE_SCALE,
        scaleY: BUBBLE_SCALE,
        duration: 180,
        ease: 'Cubic.easeOut'
      });
    } else {
      this.renderCurrentBubble();
    }

    // Render the new nextBubble in dock with a pop-in scale animation
    this.renderNextBubble(true);
  }

  private renderCurrentBubble(): void {
    if (this.currentBubbleSprite) {
      this.currentBubbleSprite.destroy();
      this.currentBubbleSprite = null;
    }
    if (!this.currentBubble) return;

    const textureKey = this.currentBubble.type === 'NORMAL'
      ? `bubble_${this.currentBubble.color}`
      : `bubble_${this.currentBubble.type}`;

    this.currentBubbleSprite = this.scene.add.image(SHOOTER_X, SHOOTER_Y, textureKey);
    this.currentBubbleSprite.setScale(BUBBLE_SCALE);
    this.currentBubbleSprite.setDepth(14);
  }

  private renderNextBubble(animatePopIn = false): void {
    if (this.nextBubbleSprite) {
      this.nextBubbleSprite.destroy();
      this.nextBubbleSprite = null;
    }
    if (!this.nextBubble) return;

    const textureKey = this.nextBubble.type === 'NORMAL'
      ? `bubble_${this.nextBubble.color}`
      : `bubble_${this.nextBubble.type}`;

    this.nextBubbleSprite = this.scene.add.image(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, textureKey);
    this.nextBubbleSprite.setDepth(14);

    if (animatePopIn) {
      this.nextBubbleSprite.setScale(0);
      this.scene.tweens.add({
        targets: this.nextBubbleSprite,
        scaleX: RESERVE_BUBBLE_SCALE,
        scaleY: RESERVE_BUBBLE_SCALE,
        duration: 200,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.setupNextBubbleInteractive();
        }
      });
    } else {
      this.nextBubbleSprite.setScale(RESERVE_BUBBLE_SCALE);
      this.setupNextBubbleInteractive();
    }
  }

  private setupNextBubbleInteractive(): void {
    if (!this.nextBubbleSprite) return;
    this.nextBubbleSprite.setInteractive({ useHandCursor: true });
    this.nextBubbleSprite.off('pointerdown');
    this.nextBubbleSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation?.();
      this.swapBubbles();
    });
  }

  public consumeCurrentBubbleSprite(): Phaser.GameObjects.Image | null {
    const sprite = this.currentBubbleSprite;
    this.currentBubbleSprite = null;
    return sprite;
  }

  public destroy(): void {
    if (this.barrelSprite) this.barrelSprite.destroy();
    if (this.baseSprite) this.baseSprite.destroy();
    if (this.dockSprite) this.dockSprite.destroy();
    if (this.currentBubbleSprite) this.currentBubbleSprite.destroy();
    if (this.nextBubbleSprite) this.nextBubbleSprite.destroy();
  }
}
