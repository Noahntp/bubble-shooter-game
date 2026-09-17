import Phaser from 'phaser';
import { BubbleColor } from '../types/game';
import { COLOR_PALETTES } from './constants';

export class ParticleManager {
  private scene: Phaser.Scene;
  private popupPool: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Spawns pop shard particles matching the bubble's color.
   */
  public emitPopParticles(x: number, y: number, color?: BubbleColor): void {
    const tintHex = color ? parseInt(COLOR_PALETTES[color].primary.replace('#', '0x')) : 0xffffff;

    // 1. Shockwave Ripple Ring
    if (this.scene.textures.exists('particle_ring')) {
      const ring = this.scene.add.image(x, y, 'particle_ring');
      ring.setTint(tintHex);
      ring.setScale(0.3);
      ring.setAlpha(0.9);
      ring.setDepth(19);

      this.scene.tweens.add({
        targets: ring,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0,
        duration: 200,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });
    }

    // 2. Sparkling Shards & Water Bubble Burst
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + (Math.random() * 0.5 - 0.25);
      const speed = 140 + Math.random() * 120;
      const shard = this.scene.add.image(x, y, 'particle_shard');
      shard.setTint(tintHex);
      shard.setScale(0.9);
      shard.setDepth(20);

      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * speed * 0.4,
        y: y + Math.sin(angle) * speed * 0.4 + 18,
        scale: 0.1,
        alpha: 0,
        duration: 250 + Math.random() * 80,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          shard.destroy();
        }
      });
    }

    // 3. Mini Water Bubbles Pop
    if (this.scene.textures.exists('water_bubble')) {
      for (let j = 0; j < 3; j++) {
        const bubble = this.scene.add.image(x, y, 'water_bubble');
        bubble.setScale(0.25);
        bubble.setDepth(21);
        const bAngle = Math.random() * Math.PI * 2;
        const bDist = 25 + Math.random() * 30;

        this.scene.tweens.add({
          targets: bubble,
          x: x + Math.cos(bAngle) * bDist,
          y: y + Math.sin(bAngle) * bDist - 15,
          scale: 0.5,
          alpha: 0,
          duration: 320 + Math.random() * 100,
          ease: 'Cubic.easeOut',
          onComplete: () => bubble.destroy()
        });
      }
    }
  }

  /**
   * Spawns radiant gold burst for Bonus bubble.
   */
  public emitBonusSparkles(x: number, y: number): void {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const dist = 60 + Math.random() * 40;
      const spark = this.scene.add.image(x, y, 'particle_shard');
      spark.setTint(0xffd700);
      spark.setScale(1.1);
      spark.setDepth(22);

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scale: 0,
        alpha: 0,
        duration: 350,
        ease: 'Back.easeOut',
        onComplete: () => spark.destroy()
      });
    }
  }

  /**
   * Bomb shockwave ring effect.
   */
  public emitBombShockwave(x: number, y: number): void {
    const ring = this.scene.add.graphics();
    ring.lineStyle(4, 0xff1744, 1);
    ring.strokeCircle(0, 0, 10);
    ring.setPosition(x, y);
    ring.setDepth(25);

    this.scene.tweens.add({
      targets: ring,
      scaleX: 6,
      scaleY: 6,
      alpha: 0,
      duration: 260,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });

    // Dark smoke shards
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 50;
      const shard = this.scene.add.image(x, y, 'particle_shard');
      shard.setTint(0xff3d00);
      shard.setScale(1.2);
      shard.setDepth(21);

      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scale: 0.2,
        alpha: 0,
        duration: 300,
        ease: 'Cubic.easeOut',
        onComplete: () => shard.destroy()
      });
    }
  }

  /**
   * Lightning full row electric zap flash.
   */
  public emitLightningFlash(y: number): void {
    const beam = this.scene.add.graphics();
    beam.fillStyle(0x00e5ff, 0.6);
    beam.fillRect(20, y - 16, 480, 32);
    beam.setDepth(26);

    const core = this.scene.add.graphics();
    core.fillStyle(0xffffff, 0.95);
    core.fillRect(20, y - 4, 480, 8);
    core.setDepth(27);

    this.scene.tweens.add({
      targets: [beam, core],
      alpha: 0,
      duration: 220,
      ease: 'Linear',
      onComplete: () => {
        beam.destroy();
        core.destroy();
      }
    });
  }

  /**
   * Floating Score Popup (+120 COMBO x3, CHAIN REACTION x5) with diamond sparkle bursts (Mục 10).
   */
  public showScorePopup(x: number, y: number, text: string, color: string = '#ffffff'): void {
    const isCombo = text.includes('COMBO') || text.includes('x') || text.includes('X') || text.includes('CHAIN');
    const fontSize = isCombo ? '28px' : '23px';
    const textColor = isCombo ? '#fbbf24' : color;
    const strokeColor = isCombo ? '#991b1b' : '#090d16';
    const strokeThickness = isCombo ? 6 : 4;

    const popup = this.scene.add.text(x, y, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: fontSize,
      fontStyle: 'bold',
      color: textColor,
      stroke: strokeColor,
      strokeThickness: strokeThickness,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: isCombo ? 'rgba(245, 158, 11, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        blur: isCombo ? 8 : 4,
        fill: true
      }
    });
    popup.setOrigin(0.5, 0.5);
    popup.setDepth(32);

    popup.setScale(isCombo ? 0.4 : 0.6);

    this.scene.tweens.add({
      targets: popup,
      scaleX: isCombo ? 1.25 : 1.1,
      scaleY: isCombo ? 1.25 : 1.1,
      y: y - (isCombo ? 60 : 45),
      alpha: 0,
      duration: isCombo ? 1000 : 800,
      ease: isCombo ? 'Back.easeOut' : 'Cubic.easeOut',
      onComplete: () => popup.destroy()
    });

    // Emitting 4-point golden star sparkle bursts around the popup (Mục 10)
    if (isCombo && this.scene.textures.exists('wall_spark')) {
      for (let s = 0; s < 6; s++) {
        const spark = this.scene.add.image(
          x + (Math.random() * 80 - 40),
          y + (Math.random() * 40 - 20),
          'wall_spark'
        );
        spark.setDepth(33);
        spark.setTint(0xffd700);
        spark.setScale(0.2);

        this.scene.tweens.add({
          targets: spark,
          scaleX: 0.85 + Math.random() * 0.4,
          scaleY: 0.85 + Math.random() * 0.4,
          y: spark.y - 35 - Math.random() * 25,
          alpha: 0,
          duration: 650 + Math.random() * 250,
          ease: 'Cubic.easeOut',
          onComplete: () => spark.destroy()
        });
      }
    }
  }

  /**
   * Wall Bounce Spark effect.
   */
  public emitWallSpark(x: number, y: number): void {
    const spark = this.scene.add.image(x, y, 'wall_spark');
    spark.setDepth(20);
    spark.setScale(0.9);

    this.scene.tweens.add({
      targets: spark,
      scale: 0.1,
      alpha: 0,
      duration: 150,
      ease: 'Cubic.easeOut',
      onComplete: () => spark.destroy()
    });
  }

  /**
   * Victory Confetti Celebration.
   */
  public emitVictoryConfetti(): void {
    const colors = [0xffd700, 0x00e5ff, 0xff3366, 0x00e676, 0xd500f9, 0xffea00];
    const total = 45;

    for (let i = 0; i < total; i++) {
      const x = 60 + Math.random() * 400;
      const y = 300 + Math.random() * 200;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const conf = this.scene.add.graphics();
      conf.fillStyle(color, 1);
      conf.fillRect(-6, -4, 12, 8);
      conf.setPosition(x, y);
      conf.setDepth(40);
      conf.setRotation(Math.random() * Math.PI);

      const vx = (Math.random() - 0.5) * 350;
      const vy = -(300 + Math.random() * 300);

      this.scene.tweens.add({
        targets: conf,
        x: x + vx * 0.8,
        y: 800 + Math.random() * 50,
        rotation: conf.rotation + (Math.random() * 8 - 4),
        alpha: 0,
        duration: 1200 + Math.random() * 600,
        ease: 'Cubic.easeIn',
        onComplete: () => conf.destroy()
      });
    }
  }

  /**
   * Turtle Shield Crack effect (shards of emerald carapace & cyan energy sparks).
   */
  public emitShieldCrackParticles(x: number, y: number): void {
    // 1. Cyan shield shock ring
    if (this.scene.textures.exists('particle_ring')) {
      const ring = this.scene.add.image(x, y, 'particle_ring');
      ring.setTint(0x00e5ff);
      ring.setScale(0.4);
      ring.setDepth(22);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 1.1,
        scaleY: 1.1,
        alpha: 0,
        duration: 180,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });
    }

    // 2. Flying shield shards
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const shard = this.scene.add.image(x, y, 'particle_shard');
      shard.setTint(i % 2 === 0 ? 0x00e5ff : 0x10b981);
      shard.setScale(0.8);
      shard.setDepth(23);

      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * 55,
        y: y + Math.sin(angle) * 55,
        scale: 0.1,
        alpha: 0,
        duration: 220,
        ease: 'Cubic.easeOut',
        onComplete: () => shard.destroy()
      });
    }
  }

  /**
   * Squid ink jet vortex sweeping down a column.
   */
  public emitSquidInkVortex(col: number): void {
    const startX = 20 + 30 + col * 60;
    for (let i = 0; i < 6; i++) {
      const y = 140 + i * 85;
      const ink = this.scene.add.circle(startX, y, 22, 0x6b21a8, 0.7);
      ink.setDepth(28);

      this.scene.tweens.add({
        targets: ink,
        scaleX: 2.2,
        scaleY: 2.2,
        alpha: 0,
        duration: 350,
        ease: 'Sine.easeOut',
        onComplete: () => ink.destroy()
      });
    }
  }

  /**
   * Octopus electric tendril beam connecting to target bubbles.
   */
  public emitOctopusTendril(fromX: number, fromY: number, toX: number, toY: number): void {
    const beam = this.scene.add.graphics();
    beam.lineStyle(3, 0x38bdf8, 0.9);
    beam.lineBetween(fromX, fromY, toX, toY);
    beam.setDepth(26);

    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 200,
      ease: 'Linear',
      onComplete: () => beam.destroy()
    });
  }
}
