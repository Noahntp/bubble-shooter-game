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
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + (Math.random() * 0.4 - 0.2);
      const speed = 120 + Math.random() * 100;
      const shard = this.scene.add.image(x, y, 'particle_shard');
      shard.setTint(tintHex);
      shard.setScale(0.8);
      shard.setDepth(20);

      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * speed * 0.35,
        y: y + Math.sin(angle) * speed * 0.35 + 20, // subtle gravity curve
        scale: 0.1,
        alpha: 0,
        duration: 220 + Math.random() * 60,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          shard.destroy();
        }
      });
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
   * Floating Score Popup (+100, +1200, COMBO x3).
   */
  public showScorePopup(x: number, y: number, text: string, color: string = '#ffffff'): void {
    const popup = this.scene.add.text(x, y, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 4
    });
    popup.setOrigin(0.5, 0.5);
    popup.setDepth(30);

    // Initial scale punch
    popup.setScale(0.6);

    this.scene.tweens.add({
      targets: popup,
      scaleX: 1.1,
      scaleY: 1.1,
      y: y - 45,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy()
    });
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
}
