import Phaser from 'phaser';
import {
  BubbleEntity,
  BubbleColor,
  BubbleType,
  LevelConfig,
  GameStats
} from '../types/game';
import {
  BUBBLE_DIAMETER,
  BUBBLE_RADIUS,
  CEILING_Y,
  DANGER_LINE_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRID_COLS,
  LEFT_WALL_X,
  RIGHT_WALL_X,
  SHOOT_SPEED,
  SHOOTER_X,
  SHOOTER_Y,
  NEXT_BUBBLE_X,
  NEXT_BUBBLE_Y
} from './constants';
import { GridManager } from './GridManager';
import { MatchManager } from './MatchManager';
import { SpecialBubbleManager } from './SpecialBubbleManager';
import { FloatingBubbleManager } from './FloatingBubbleManager';
import { EffectResolver, TurnResolutionResult } from './EffectResolver';
import { DynamicDifficultyManager } from './DynamicDifficulty';
import { CollisionManager } from './CollisionManager';
import { AimGuide } from './AimGuide';
import { ShooterManager } from './ShooterManager';
import { ParticleManager } from './ParticleManager';
import { ProceduralAssetGenerator } from './ProceduralAssetGenerator';
import { audioManager } from '../audio/AudioManager';
import { eventBridge, GAME_EVENTS } from './EventBridge';
import { LEVELS } from '../levels/levelData';

export type GameSceneState =
  | 'IDLE'
  | 'AIMING'
  | 'SHOOTING'
  | 'ATTACHING'
  | 'RESOLVING'
  | 'WIN'
  | 'LOSE'
  | 'PAUSED';

export class GameScene extends Phaser.Scene {
  private currentState: GameSceneState = 'IDLE';

  // Sub-systems
  private gridManager!: GridManager;
  private matchManager!: MatchManager;
  private specialBubbleManager!: SpecialBubbleManager;
  private floatingManager!: FloatingBubbleManager;
  private effectResolver!: EffectResolver;
  private difficultyManager!: DynamicDifficultyManager;
  private collisionManager!: CollisionManager;
  private particleManager!: ParticleManager;
  private aimGuide!: AimGuide;
  private shooterManager!: ShooterManager;

  // Visual sprite registries
  private bubbleSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private frozenOverlaySprites: Map<string, Phaser.GameObjects.Image> = new Map();

  // Active Projectile during SHOOTING
  private activeProjectile: {
    sprite: Phaser.GameObjects.Image;
    bubble: BubbleEntity;
    vx: number;
    vy: number;
  } | null = null;

  // Level & Session state
  private currentLevelConfig: LevelConfig = LEVELS[0];
  private score: number = 0;
  private shotsLeft: number = 28;
  private maxCombo: number = 0;
  private aimAngle: number = -Math.PI / 2;

  constructor() {
    super({ key: 'GameScene' });
  }

  public preload(): void {
    // Assets are procedurally generated in create()
  }

  public create(): void {
    // 1. Generate high-DPI procedural vector textures (No emojis)
    ProceduralAssetGenerator.generateAll(this);

    // 2. Instantiate Architecture Sub-Managers
    this.gridManager = new GridManager();
    this.matchManager = new MatchManager(this.gridManager);
    this.specialBubbleManager = new SpecialBubbleManager(this.gridManager);
    this.floatingManager = new FloatingBubbleManager(this.gridManager);
    this.effectResolver = new EffectResolver(
      this.gridManager,
      this.matchManager,
      this.specialBubbleManager,
      this.floatingManager
    );
    this.difficultyManager = new DynamicDifficultyManager();
    this.collisionManager = new CollisionManager(this.gridManager);
    this.particleManager = new ParticleManager(this);
    this.aimGuide = new AimGuide(this, this.gridManager);
    this.shooterManager = new ShooterManager(this, this.difficultyManager);

    // 3. Render Background Board Elements
    this.renderBoardChrome();

    // 4. Input Events
    this.setupInputHandlers();

    // 5. Bridge Events from React
    this.setupEventBridge();

    // 6. Start Level 1
    this.loadLevel(this.currentLevelConfig);
  }

  private renderBoardChrome(): void {
    const bgGraphics = this.add.graphics();
    bgGraphics.setDepth(1);

    // 1. Playfield backdrop fill
    bgGraphics.fillStyle(0x0a0f1d, 0.85);
    bgGraphics.fillRoundedRect(LEFT_WALL_X, CEILING_Y, RIGHT_WALL_X - LEFT_WALL_X, DANGER_LINE_Y - CEILING_Y, 8);

    // 2. Faint hexagonal honeycomb matrix nodes (only above danger line)
    for (let r = 0; r < 12; r++) {
      const cols = this.gridManager.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const pt = this.gridManager.gridToPixel(r, c);
        if (pt.y + BUBBLE_RADIUS <= DANGER_LINE_Y) {
          bgGraphics.lineStyle(1, 0x1e293b, 0.3);
          bgGraphics.strokeCircle(pt.x, pt.y, BUBBLE_RADIUS - 4);
        }
      }
    }

    // 3. Left & Right Neon Arcade Rails
    const railGfx = this.add.graphics();
    railGfx.setDepth(2);

    // Left Rail
    railGfx.fillStyle(0x1e293b, 0.9);
    railGfx.fillRect(LEFT_WALL_X - 12, CEILING_Y - 20, 12, (DANGER_LINE_Y - CEILING_Y) + 40);
    railGfx.lineStyle(2, 0x00e5ff, 0.8);
    railGfx.lineBetween(LEFT_WALL_X, CEILING_Y - 20, LEFT_WALL_X, DANGER_LINE_Y + 20);

    // Right Rail
    railGfx.fillStyle(0x1e293b, 0.9);
    railGfx.fillRect(RIGHT_WALL_X, CEILING_Y - 20, 12, (DANGER_LINE_Y - CEILING_Y) + 40);
    railGfx.lineStyle(2, 0x00e5ff, 0.8);
    railGfx.lineBetween(RIGHT_WALL_X, CEILING_Y - 20, RIGHT_WALL_X, DANGER_LINE_Y + 20);

    // 4. Industrial Metallic Top Ceiling Beam
    const ceilingGfx = this.add.graphics();
    ceilingGfx.setDepth(12); // Render above bubbles so bubbles do not poke through hazard bar
    ceilingGfx.fillStyle(0x0f172a, 1);
    ceilingGfx.fillRect(LEFT_WALL_X - 12, CEILING_Y - 24, (RIGHT_WALL_X - LEFT_WALL_X) + 24, 24);

    // Hazard chevrons on ceiling
    for (let x = LEFT_WALL_X; x < RIGHT_WALL_X; x += 30) {
      ceilingGfx.fillStyle(0xffb703, 0.7);
      ceilingGfx.beginPath();
      ceilingGfx.moveTo(x, CEILING_Y - 4);
      ceilingGfx.lineTo(x + 10, CEILING_Y - 4);
      ceilingGfx.lineTo(x + 20, CEILING_Y - 22);
      ceilingGfx.lineTo(x + 10, CEILING_Y - 22);
      ceilingGfx.closePath();
      ceilingGfx.fill();
    }

    // Chrome beam border
    ceilingGfx.lineStyle(2, 0x64748b, 1);
    ceilingGfx.strokeRect(LEFT_WALL_X - 12, CEILING_Y - 24, (RIGHT_WALL_X - LEFT_WALL_X) + 24, 24);

    // 5. Danger Laser Perimeter Line with Glowing Warning
    const dangerGfx = this.add.graphics();
    dangerGfx.setDepth(5);
    dangerGfx.lineStyle(2, 0xef4444, 0.8);
    dangerGfx.lineBetween(LEFT_WALL_X, DANGER_LINE_Y, RIGHT_WALL_X, DANGER_LINE_Y);

    const dangerText = this.add.text(RIGHT_WALL_X - 120, DANGER_LINE_Y + 4, '⚠ VẠCH NGUY HIỂM', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      color: '#ef4444',
      fontStyle: 'bold'
    });
    dangerText.setDepth(5);

    this.tweens.add({
      targets: [dangerGfx, dangerText],
      alpha: 0.25,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 6. Ambient floating stardust particles
    for (let i = 0; i < 15; i++) {
      const px = LEFT_WALL_X + 20 + Math.random() * (RIGHT_WALL_X - LEFT_WALL_X - 40);
      const py = CEILING_Y + 20 + Math.random() * 500;
      const dust = this.add.circle(px, py, Math.random() * 1.5 + 1, 0x00e5ff, Math.random() * 0.4 + 0.1);
      dust.setDepth(2);

      this.tweens.add({
        targets: dust,
        y: dust.y - (30 + Math.random() * 30),
        alpha: 0.05,
        duration: 3000 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private setupInputHandlers(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.currentState !== 'IDLE') return;
      if (this.shooterManager.isSwappingState()) return;

      // 1. Check if clicking near reserve bubble / dock to swap
      const distToReserve = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        NEXT_BUBBLE_X, NEXT_BUBBLE_Y
      );
      if (distToReserve < BUBBLE_RADIUS * 1.6) {
        this.shooterManager.swapBubbles();
        return;
      }

      // 2. Check if clicking near launcher base to swap
      const distToLauncher = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        SHOOTER_X, SHOOTER_Y
      );
      if (distToLauncher < BUBBLE_RADIUS * 1.3) {
        this.shooterManager.swapBubbles();
        return;
      }

      // 3. Prevent aiming if clicking near bottom control bar
      if (pointer.y > SHOOTER_Y - 15) return;

      // 4. Update aim trajectory - only enter AIMING if aim is valid
      const res = this.aimGuide.updateAim(pointer.x, pointer.y);
      if (res.isValid) {
        this.currentState = 'AIMING';
        this.aimAngle = res.angle;
        this.shooterManager.setAimAngle(this.aimAngle);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.currentState !== 'AIMING') return;

      const res = this.aimGuide.updateAim(pointer.x, pointer.y);
      if (res.isValid && pointer.y <= SHOOTER_Y - 20) {
        this.aimAngle = res.angle;
        this.shooterManager.setAimAngle(this.aimAngle);
      } else {
        // User dragged downward to cancel shot
        this.aimGuide.hide();
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.currentState !== 'AIMING') return;
      this.aimGuide.hide();

      const res = this.aimGuide.updateAim(pointer.x, pointer.y);
      if (!res.isValid || pointer.y > SHOOTER_Y - 20) {
        // Dragged down to cancel: reset to IDLE without firing
        this.currentState = 'IDLE';
        return;
      }

      this.shootCurrentBubble();
    });
  }

  private boundPauseHandler = () => {
    if (this.currentState !== 'WIN' && this.currentState !== 'LOSE') {
      this.currentState = 'PAUSED';
    }
  };

  private boundResumeHandler = () => {
    if (this.currentState === 'PAUSED') {
      this.currentState = 'IDLE';
    }
  };

  private boundRestartHandler = () => {
    this.loadLevel(this.currentLevelConfig);
  };

  private boundLoadLevelHandler = (levelData: LevelConfig) => {
    this.loadLevel(levelData);
  };

  private boundSwapHandler = () => {
    if (this.shooterManager.isSwappingState()) return;
    if (this.currentState === 'AIMING') {
      this.aimGuide.hide();
      this.currentState = 'IDLE';
    }
    if (this.currentState === 'IDLE') {
      this.shooterManager.swapBubbles();
    }
  };

  private setupEventBridge(): void {
    this.cleanupEventBridge();

    eventBridge.on(GAME_EVENTS.PAUSE_GAME, this.boundPauseHandler);
    eventBridge.on(GAME_EVENTS.RESUME_GAME, this.boundResumeHandler);
    eventBridge.on(GAME_EVENTS.RESTART_LEVEL, this.boundRestartHandler);
    eventBridge.on(GAME_EVENTS.LOAD_LEVEL, this.boundLoadLevelHandler);
    eventBridge.on(GAME_EVENTS.SWAP_BUBBLES, this.boundSwapHandler);
    eventBridge.on(GAME_EVENTS.APPLY_WELCOME_BONUS, (data: { bonusShots?: number; bonusScore?: number }) => {
      if (data?.bonusShots) this.shotsLeft += data.bonusShots;
      if (data?.bonusScore) this.score += data.bonusScore;
      this.emitStatsUpdate();
    });

    this.events.once('shutdown', () => this.cleanupEventBridge());
    this.events.once('destroy', () => this.cleanupEventBridge());
  }

  private cleanupEventBridge(): void {
    eventBridge.off(GAME_EVENTS.PAUSE_GAME, this.boundPauseHandler);
    eventBridge.off(GAME_EVENTS.RESUME_GAME, this.boundResumeHandler);
    eventBridge.off(GAME_EVENTS.RESTART_LEVEL, this.boundRestartHandler);
    eventBridge.off(GAME_EVENTS.LOAD_LEVEL, this.boundLoadLevelHandler);
    eventBridge.off(GAME_EVENTS.SWAP_BUBBLES, this.boundSwapHandler);
  }

  public loadLevel(config: LevelConfig): void {
    if (!this.sys || !this.add) return;
    this.currentLevelConfig = config;
    this.currentState = 'IDLE';
    this.score = 0;
    this.shotsLeft = config.maxShots;
    this.maxCombo = 0;
    this.effectResolver.resetCombo();
    this.difficultyManager.resetLevel();

    // Clear board sprites & logical state
    this.clearBoardSprites();
    this.gridManager.clear();

    // Spawn initial rows
    for (let r = 0; r < config.initialRows; r++) {
      const cols = this.gridManager.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        // Roll bubble type using initial roll method (doesn't increment shot count)
        const type = this.difficultyManager.rollInitialBubbleType(config.level);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];

        const bubble: BubbleEntity = {
          id: `bubble_${r}_${c}_${Math.random().toString(36).substring(2, 7)}`,
          row: r,
          col: c,
          color,
          type,
          state: 'ATTACHED',
          freezeTurnsRemaining: 0,
          visualX: 0,
          visualY: 0
        };

        this.gridManager.setBubble(r, c, bubble);
        this.createBubbleSprite(bubble);
      }
    }

    // Initialize Launcher with first bubbles
    this.shooterManager.initBubbles(
      config.level,
      this.gridManager.getOccupancy(),
      this.shotsLeft,
      config.colors
    );

    this.emitStatsUpdate();
  }

  private createBubbleSprite(bubble: BubbleEntity): Phaser.GameObjects.Image | null {
    if (!this.add) return null;
    const pos = this.gridManager.gridToPixel(bubble.row, bubble.col);
    bubble.visualX = pos.x;
    bubble.visualY = pos.y;

    const textureKey = bubble.type === 'NORMAL'
      ? `bubble_${bubble.color}`
      : `bubble_${bubble.type}`;

    const sprite = this.add.image(pos.x, pos.y, textureKey);
    sprite.setDisplaySize(BUBBLE_DIAMETER, BUBBLE_DIAMETER);
    sprite.setDepth(10);

    this.bubbleSprites.set(bubble.id, sprite);
    return sprite;
  }

  private shootCurrentBubble(): void {
    if (!this.shooterManager.currentBubble) return;
    if (this.shooterManager.isSwappingState()) return;

    this.currentState = 'SHOOTING';
    this.shotsLeft -= 1;
    this.shooterManager.triggerRecoil();
    audioManager.play('bubble_shoot');

    // Create projectile sprite by consuming it from the launcher
    const bubble = this.shooterManager.currentBubble;
    bubble.state = 'SHOOTING';

    let sprite = this.shooterManager.consumeCurrentBubbleSprite();
    if (!sprite) {
      const textureKey = bubble.type === 'NORMAL'
        ? `bubble_${bubble.color}`
        : `bubble_${bubble.type}`;
      sprite = this.add.image(SHOOTER_X, SHOOTER_Y, textureKey);
    }
    sprite.setDisplaySize(BUBBLE_DIAMETER, BUBBLE_DIAMETER);
    sprite.setPosition(SHOOTER_X, SHOOTER_Y);
    sprite.setDepth(15);

    const vx = Math.cos(this.aimAngle) * SHOOT_SPEED;
    const vy = Math.sin(this.aimAngle) * SHOOT_SPEED;

    this.activeProjectile = {
      sprite,
      bubble,
      vx,
      vy
    };

    this.emitStatsUpdate();
  }

  public override update(_time: number, delta: number): void {
    if (this.currentState !== 'SHOOTING' || !this.activeProjectile) return;

    const dt = delta / 1000;
    const proj = this.activeProjectile;

    // Advance position
    proj.sprite.x += proj.vx * dt;
    proj.sprite.y += proj.vy * dt;

    // Handle Wall Bounce
    const bounceRes = this.collisionManager.handleWallBounce(proj.sprite.x, proj.vx);
    proj.sprite.x = bounceRes.x;
    proj.vx = bounceRes.vx;
    if (bounceRes.bounced) {
      audioManager.play('bubble_hit');
      this.particleManager.emitWallSpark(proj.sprite.x, proj.sprite.y);
    }

    // Check Grid Collision
    const colRes = this.collisionManager.checkGridCollision(proj.sprite.x, proj.sprite.y);

    if (colRes.hasCollided && colRes.targetSlot) {
      this.attachProjectileToGrid(colRes.targetSlot.row, colRes.targetSlot.col);
    } else if (proj.sprite.y < CEILING_Y - 20) {
      // Failsafe snap to top row
      const slot = this.gridManager.findNearestEmptySlot(proj.sprite.x, CEILING_Y);
      if (slot) {
        this.attachProjectileToGrid(slot.row, slot.col);
      }
    }
  }

  private attachProjectileToGrid(row: number, col: number): void {
    if (!this.activeProjectile) return;
    this.currentState = 'ATTACHING';

    const proj = this.activeProjectile;
    this.activeProjectile = null;

    const targetPos = this.gridManager.gridToPixel(row, col);
    proj.bubble.row = row;
    proj.bubble.col = col;
    proj.bubble.state = 'ATTACHED';
    this.gridManager.setBubble(row, col, proj.bubble);

    audioManager.play('bubble_attach');

    // Magnetic snap tween
    this.tweens.add({
      targets: proj.sprite,
      x: targetPos.x,
      y: targetPos.y,
      duration: 50,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.bubbleSprites.set(proj.bubble.id, proj.sprite);
        this.resolveEffectsAndCascade(proj.bubble);
      }
    });
  }

  private resolveEffectsAndCascade(attachedBubble: BubbleEntity): void {
    this.currentState = 'RESOLVING';

    // Run deterministic effect resolver
    const result: TurnResolutionResult = this.effectResolver.resolveTurn(attachedBubble);

    // Apply Screen Shake if Bomb or Lightning triggered
    if (result.screenShake) {
      this.cameras.main.shake(120, 0.007);
    }

    // Visual Bomb shockwaves
    result.triggeredBombPositions.forEach(bPos => {
      this.particleManager.emitBombShockwave(bPos.x, bPos.y);
      audioManager.play('bomb');
    });

    // Visual Lightning flashes
    result.lightningRows.forEach(row => {
      const pos = this.gridManager.gridToPixel(row, 0);
      this.particleManager.emitLightningFlash(pos.y);
      audioManager.play('lightning');
    });

    // Visual Frozen Encasements
    result.frozenBubbles.forEach(fb => {
      this.applyFrozenVisual(fb);
      audioManager.play('freeze');
    });

    // Visual Spawned Trap Bubbles
    result.spawnedBubbles.forEach(sb => {
      const newBubble: BubbleEntity = {
        id: `bubble_trap_${Date.now()}_${Math.random()}`,
        row: sb.row,
        col: sb.col,
        color: sb.color,
        type: 'NORMAL',
        state: 'ATTACHED',
        freezeTurnsRemaining: 0,
        visualX: 0,
        visualY: 0
      };
      this.gridManager.setBubble(sb.row, sb.col, newBubble);
      const sprite = this.createBubbleSprite(newBubble);
      if (sprite) {
        sprite.setScale(0);
        this.tweens.add({
          targets: sprite,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });
      }
      audioManager.play('trap');
    });

    // Score popups
    result.popups.forEach(p => {
      this.particleManager.showScorePopup(p.x, p.y, p.text || `+${p.score}`, p.color || '#ffffff');
    });

    // 1. Animate Popped Bubbles
    if (result.poppedBubbles.length > 0) {
      audioManager.play('bubble_pop');
      result.poppedBubbles.forEach(b => {
        const sprite = this.bubbleSprites.get(b.id);
        if (sprite) {
          this.particleManager.emitPopParticles(sprite.x, sprite.y, b.color);
          this.tweens.add({
            targets: sprite,
            scaleX: 1.15,
            scaleY: 1.15,
            alpha: 0,
            duration: 140,
            ease: 'Cubic.easeOut',
            onComplete: () => {
              sprite.destroy();
              this.bubbleSprites.delete(b.id);
            }
          });
        }
      });
    }

    // 2. Animate Falling Floating Bubbles
    if (result.floatingBubbles.length > 0) {
      result.floatingBubbles.forEach((fb, idx) => {
        const sprite = this.bubbleSprites.get(fb.id);
        if (sprite) {
          this.tweens.add({
            targets: sprite,
            y: GAME_HEIGHT + 60,
            x: sprite.x + (Math.random() * 40 - 20),
            rotation: (Math.random() * 2 - 1) * 2,
            alpha: 0.2,
            delay: idx * 35, // Staggered drop
            duration: 550,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              sprite.destroy();
              this.bubbleSprites.delete(fb.id);
            }
          });
        }
      });
    }

    // Update score and combo
    this.score += result.scoreGained;
    if (result.comboLevel > this.maxCombo) {
      this.maxCombo = result.comboLevel;
    }
    if (result.comboLevel > 1) {
      audioManager.play('combo', result.comboLevel);
    }

    // Tick freeze turns
    const thawed = this.specialBubbleManager.tickFreezeTurns();
    thawed.forEach(tb => this.removeFrozenVisual(tb));

    // Finish turn sequence after short delay for animations
    const waitTime = result.floatingBubbles.length > 0 ? 550 : 200;
    this.time.delayedCall(waitTime, () => {
      this.checkEndTurnConditions();
    });
  }

  private applyFrozenVisual(bubble: BubbleEntity): void {
    if (this.frozenOverlaySprites.has(bubble.id)) return;
    const pos = this.gridManager.gridToPixel(bubble.row, bubble.col);
    const overlay = this.add.image(pos.x, pos.y, 'frozen_overlay');
    overlay.setDisplaySize(BUBBLE_DIAMETER, BUBBLE_DIAMETER);
    overlay.setDepth(11);
    this.frozenOverlaySprites.set(bubble.id, overlay);
  }

  private removeFrozenVisual(bubble: BubbleEntity): void {
    const overlay = this.frozenOverlaySprites.get(bubble.id);
    if (overlay) {
      overlay.destroy();
      this.frozenOverlaySprites.delete(bubble.id);
    }
  }

  private checkEndTurnConditions(): void {
    const remainingBubbles = this.gridManager.getAllBubbles();

    // 1. WIN condition: Board is completely cleared
    if (remainingBubbles.length === 0) {
      this.handleGameWon();
      return;
    }

    // 2. LOSE condition A: Bubbles reach danger line
    if (this.gridManager.isDangerReached()) {
      this.handleGameLost('Bóng đã chạm vạch nguy hiểm!');
      return;
    }

    // 3. LOSE condition B: No shots remaining
    if (this.shotsLeft <= 0) {
      this.handleGameLost('Đã hết lượt bắn!');
      return;
    }

    // 4. NEXT TURN
    const activeColors = Array.from(new Set(remainingBubbles.map(b => b.color)));
    this.shooterManager.advanceTurn(
      this.currentLevelConfig.level,
      this.gridManager.getOccupancy(),
      this.shotsLeft,
      activeColors.length > 0 ? activeColors : this.currentLevelConfig.colors
    );

    this.currentState = 'IDLE';
    this.emitStatsUpdate();
  }

  private handleGameWon(): void {
    this.currentState = 'WIN';
    audioManager.play('win');
    this.particleManager.emitVictoryConfetti();

    // Calculate stars: 1, 2, or 3 stars
    let stars = 1;
    const [s1, s2, s3] = this.currentLevelConfig.starThresholds;
    if (this.score >= s3) stars = 3;
    else if (this.score >= s2) stars = 2;
    else if (this.score >= s1) stars = 1;

    // Remaining shots bonus: +150 per shot
    const shotBonus = this.shotsLeft * 150;
    this.score += shotBonus;

    this.emitStatsUpdate();

    eventBridge.emit(GAME_EVENTS.LEVEL_WON, {
      level: this.currentLevelConfig.level,
      score: this.score,
      stars,
      shotsRemaining: this.shotsLeft,
      maxCombo: this.maxCombo
    });
  }

  public pauseGame(): void {
    if (this.currentState !== 'WIN' && this.currentState !== 'LOSE') {
      this.currentState = 'PAUSED';
    }
  }

  public resumeGame(): void {
    if (this.currentState === 'PAUSED') {
      this.currentState = 'IDLE';
    }
  }

  private handleGameLost(reason: string): void {
    this.currentState = 'LOSE';
    audioManager.play('lose');

    eventBridge.emit(GAME_EVENTS.LEVEL_LOST, {
      level: this.currentLevelConfig.level,
      score: this.score,
      reason
    });
  }

  private emitStatsUpdate(): void {
    const stats: GameStats = {
      score: this.score,
      combo: this.effectResolver.getCombo(),
      maxCombo: this.maxCombo,
      shotsLeft: this.shotsLeft,
      level: this.currentLevelConfig.level,
      stars: 0,
      boardOccupancy: this.gridManager.getOccupancy(),
      gameStatus: this.currentState === 'WIN' ? 'WIN' : this.currentState === 'LOSE' ? 'LOSE' : 'PLAYING'
    };
    eventBridge.emit(GAME_EVENTS.SCORE_UPDATED, stats);
  }

  private clearBoardSprites(): void {
    this.bubbleSprites.forEach(s => s.destroy());
    this.bubbleSprites.clear();

    this.frozenOverlaySprites.forEach(s => s.destroy());
    this.frozenOverlaySprites.clear();

    if (this.activeProjectile) {
      this.activeProjectile.sprite.destroy();
      this.activeProjectile = null;
    }
  }

  public destroy(): void {
    this.cleanupEventBridge();
    this.clearBoardSprites();
    if (this.aimGuide) this.aimGuide.destroy();
    if (this.shooterManager) this.shooterManager.destroy();
  }
}
