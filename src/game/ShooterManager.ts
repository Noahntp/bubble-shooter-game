import Phaser from 'phaser';
import { BubbleColor, BubbleEntity, BubbleType } from '../types/game';
import {
  SHOOTER_X,
  SHOOTER_Y,
  NEXT_BUBBLE_X,
  NEXT_BUBBLE_Y,
  MISS_METER_X,
  MISS_METER_Y,
  BUBBLE_SCALE,
  RESERVE_BUBBLE_SCALE,
  COLOR_PALETTES,
  getBubbleTextureKey
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
  private missPodSprite: Phaser.GameObjects.Image;
  private missBeadSprites: Phaser.GameObjects.Image[] = [];

  public currentBubble: BubbleEntity | null = null;
  public nextBubble: BubbleEntity | null = null;

  private isSwapping = false;
  private currentAngle = -Math.PI / 2; // Point straight up initially
  private readonly CHAMBER_OFFSET = 38; // Distance from barrel pivot to crystal chamber center
  private readonly PIVOT_Y = SHOOTER_Y - 14;

  constructor(scene: Phaser.Scene, difficultyManager: DynamicDifficultyManager) {
    this.scene = scene;
    this.difficultyManager = difficultyManager;

    // 1. High-Tech Coral Rock Base with GIANT GLOWING PEARL at front center (Section 3: MÁY BẮN)
    this.baseSprite = scene.add.image(SHOOTER_X, SHOOTER_Y + 16, 'launcher_base');
    this.baseSprite.setDepth(14); // In front of the lower chamber, displaying the giant pearl & gem
    this.baseSprite.setDisplaySize(200, 112);

    // 2. Futuristic Nautilus Pearl Cannon Barrel (Rotates along aim trajectory)
    this.barrelSprite = scene.add.image(SHOOTER_X, this.PIVOT_Y, 'launcher_barrel');
    this.barrelSprite.setDisplaySize(110, 135);
    this.barrelSprite.setOrigin(0.5, 0.85); // Pivot at cradle center behind the giant pearl
    this.barrelSprite.setRotation(this.currentAngle + Math.PI / 2);
    this.barrelSprite.setDepth(11);

    // 3. Golden Heraldic NEXT ORB POD (Bottom-Left of Cannon - Section 5 & Reference A)
    this.dockSprite = scene.add.image(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, 'next_orb_pod');
    this.dockSprite.setDepth(11);
    this.dockSprite.setDisplaySize(95, 115);
    this.dockSprite.setInteractive({ useHandCursor: true });
    this.dockSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation?.();
      this.swapBubbles();
    });

    // Gentle floating bobbing for NEXT pod
    scene.tweens.add({
      targets: this.dockSprite,
      y: NEXT_BUBBLE_Y - 4,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. MISS METER POD (Bottom-Right of Cannon - Section 9 & Reference A)
    this.missPodSprite = scene.add.image(MISS_METER_X, MISS_METER_Y, 'miss_meter_pod');
    this.missPodSprite.setDepth(11);
    this.missPodSprite.setDisplaySize(125, 65);

    // Gentle floating bobbing for MISS pod
    scene.tweens.add({
      targets: this.missPodSprite,
      y: MISS_METER_Y - 4,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4 Miss indicator beads inside MISS pod (● ● ● ○)
    for (let i = 0; i < 4; i++) {
      const bx = MISS_METER_X - 24 + i * 16;
      const by = MISS_METER_Y + 5;
      const bead = scene.add.image(bx, by, 'miss_bead_empty');
      bead.setDepth(12);
      bead.setScale(0.8);
      this.missBeadSprites.push(bead);
    }

    // Subtle idle breathing for Barrel
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

  public getLoadedOrbPos(): { x: number; y: number } {
    return {
      x: SHOOTER_X + Math.cos(this.currentAngle) * this.CHAMBER_OFFSET,
      y: this.PIVOT_Y + Math.sin(this.currentAngle) * this.CHAMBER_OFFSET
    };
  }

  public updateMissCount(missCount: number): void {
    this.missBeadSprites.forEach((bead, idx) => {
      if (idx < missCount) {
        bead.setTexture('miss_bead_active');
        this.scene.tweens.add({
          targets: bead,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      } else {
        bead.setTexture('miss_bead_empty');
      }
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
    if (this.currentBubbleSprite && !this.isSwapping) {
      const pos = this.getLoadedOrbPos();
      this.currentBubbleSprite.setPosition(pos.x, pos.y);
    }
  }

  public triggerRecoil(): void {
    const recoilDist = 10;
    const dirX = Math.cos(this.currentAngle);
    const dirY = Math.sin(this.currentAngle);

    this.scene.tweens.add({
      targets: this.barrelSprite,
      x: SHOOTER_X - dirX * recoilDist,
      y: this.PIVOT_Y - dirY * recoilDist,
      duration: 65,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.barrelSprite.setPosition(SHOOTER_X, this.PIVOT_Y);
      }
    });
  }

  public startCharging(): void {
    if (this.barrelSprite) {
      this.scene.tweens.killTweensOf(this.barrelSprite);
      this.scene.tweens.add({
        targets: this.barrelSprite,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 180,
        ease: 'Cubic.easeOut'
      });
    }
    if (this.currentBubbleSprite) {
      this.scene.tweens.killTweensOf(this.currentBubbleSprite);
      this.scene.tweens.add({
        targets: this.currentBubbleSprite,
        scaleX: BUBBLE_SCALE * 0.98,
        scaleY: BUBBLE_SCALE * 0.98,
        duration: 180,
        ease: 'Cubic.easeOut'
      });
    }
  }

  public stopCharging(): void {
    if (this.barrelSprite) {
      this.scene.tweens.killTweensOf(this.barrelSprite);
      this.scene.tweens.add({
        targets: this.barrelSprite,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 150,
        ease: 'Cubic.easeOut'
      });
    }
    if (this.currentBubbleSprite) {
      this.scene.tweens.killTweensOf(this.currentBubbleSprite);
      this.currentBubbleSprite.setScale(BUBBLE_SCALE * 0.92);
      const pos = this.getLoadedOrbPos();
      this.currentBubbleSprite.setPosition(pos.x, pos.y);
    }
  }

  public isSwappingState(): boolean {
    return this.isSwapping;
  }

  public getCurrentBubbleTintHex(): number {
    if (!this.currentBubble) return 0x00e5ff;
    if (this.currentBubble.type === 'BONUS' || this.currentBubble.type === 'STARFISH') return 0xffd700;
    if (this.currentBubble.type === 'BOMB' || this.currentBubble.type === 'CRAB') return 0xff1744;
    if (this.currentBubble.type === 'LIGHTNING') return 0xfbbf24;
    if (this.currentBubble.type === 'WHIRLPOOL') return 0x06b6d4;
    if (this.currentBubble.type === 'RAINBOW' || this.currentBubble.type === 'JELLYFISH') return 0xffffff;
    if (this.currentBubble.type === 'OCTOPUS') return 0xc084fc;
    if (this.currentBubble.type === 'SQUID') return 0xa855f7;
    if (this.currentBubble.type === 'TURTLE') return 0x10b981;
    if (this.currentBubble.type === 'SHARK') return 0x38bdf8;
    if (this.currentBubble.type === 'FREEZE') return 0x80d8ff;
    const col = COLOR_PALETTES[this.currentBubble.color];
    return col ? parseInt(col.primary.replace('#', '0x'), 16) : 0x00e5ff;
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
    this.scene.tweens.killTweensOf(movingToDock);
    this.scene.tweens.killTweensOf(movingToLauncher);

    const launcherPos = this.getLoadedOrbPos();

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
      x: launcherPos.x,
      y: launcherPos.y,
      scaleX: BUBBLE_SCALE * 0.92,
      scaleY: BUBBLE_SCALE * 0.92,
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

    // If nextBubbleSprite exists, animate it moving into the cannon chamber!
    if (this.nextBubbleSprite) {
      this.currentBubbleSprite = this.nextBubbleSprite;
      this.nextBubbleSprite = null;
      this.currentBubbleSprite.disableInteractive();

      const launcherPos = this.getLoadedOrbPos();

      this.scene.tweens.add({
        targets: this.currentBubbleSprite,
        x: launcherPos.x,
        y: launcherPos.y,
        scaleX: BUBBLE_SCALE * 0.92,
        scaleY: BUBBLE_SCALE * 0.92,
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
      this.scene.tweens.killTweensOf(this.currentBubbleSprite);
      this.currentBubbleSprite.destroy();
      this.currentBubbleSprite = null;
    }
    if (!this.currentBubble) return;

    const textureKey = getBubbleTextureKey(this.currentBubble);
    const pos = this.getLoadedOrbPos();

    this.currentBubbleSprite = this.scene.add.image(pos.x, pos.y, textureKey);
    this.currentBubbleSprite.setScale(BUBBLE_SCALE * 0.92);
    this.currentBubbleSprite.setDepth(12); // Inside the transparent crystal barrel chamber, behind the base pearl (depth 14)
  }

  private renderNextBubble(animatePopIn = false): void {
    if (this.nextBubbleSprite) {
      this.nextBubbleSprite.destroy();
      this.nextBubbleSprite = null;
    }
    if (!this.nextBubble) return;

    const textureKey = getBubbleTextureKey(this.nextBubble);

    this.nextBubbleSprite = this.scene.add.image(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, textureKey);
    this.nextBubbleSprite.setDepth(13);

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
    if (sprite) {
      this.scene.tweens.killTweensOf(sprite);
      const muzzleX = SHOOTER_X + Math.cos(this.currentAngle) * 65;
      const muzzleY = this.PIVOT_Y + Math.sin(this.currentAngle) * 65;
      sprite.setPosition(muzzleX, muzzleY);
      sprite.setScale(BUBBLE_SCALE);
      sprite.setDepth(15);
    }
    this.currentBubbleSprite = null;
    return sprite;
  }

  public loadPowerupBubble(type: BubbleType): void {
    if (this.isSwapping) return;

    this.currentBubble = {
      id: `bubble_powerup_${Date.now()}`,
      row: -1,
      col: -1,
      color: 'BLUE',
      type,
      state: 'IDLE',
      freezeTurnsRemaining: 0,
      visualX: SHOOTER_X,
      visualY: SHOOTER_Y
    };

    this.renderCurrentBubble();

    // Pulse barrel with power-up charge
    if (this.barrelSprite) {
      this.scene.tweens.add({
        targets: this.barrelSprite,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    }
  }

  public destroy(): void {
    if (this.barrelSprite) this.barrelSprite.destroy();
    if (this.baseSprite) this.baseSprite.destroy();
    if (this.dockSprite) this.dockSprite.destroy();
    if (this.missPodSprite) this.missPodSprite.destroy();
    this.missBeadSprites.forEach(b => b.destroy());
    this.missBeadSprites = [];
    if (this.currentBubbleSprite) this.currentBubbleSprite.destroy();
    if (this.nextBubbleSprite) this.nextBubbleSprite.destroy();
  }
}
