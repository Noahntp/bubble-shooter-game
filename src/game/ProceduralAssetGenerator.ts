import Phaser from 'phaser';
import { BubbleColor, BubbleType } from '../types/game';
import { COLOR_PALETTES, BUBBLE_DIAMETER } from './constants';

export class ProceduralAssetGenerator {
  /**
   * Generates all procedural bubble and game textures and registers them into Phaser's TextureManager.
   */
  public static generateAll(scene: Phaser.Scene): void {
    const size = BUBBLE_DIAMETER * 2; // Render at 2x resolution (120x120) for crisp Hi-DPI sharpness

    // 1. Generate Normal Bubbles for each color
    const colors: BubbleColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
    colors.forEach(color => {
      this.generateNormalBubble(scene, color, size);
    });

    // 2. Generate Special Bubbles
    const specialTypes: BubbleType[] = ['BONUS', 'RAINBOW', 'BOMB', 'LIGHTNING', 'FREEZE', 'CURSE', 'TRAP'];
    specialTypes.forEach(type => {
      this.generateSpecialBubble(scene, type, size);
    });

    // 3. Generate Frozen Overlay
    this.generateFrozenOverlay(scene, size);

    // 4. Generate Aim Guide Dot
    this.generateAimDot(scene);

    // 5. Generate Particle Shards
    this.generateParticleTextures(scene);

    // 6. Generate Launcher Base and Barrel
    this.generateLauncherTextures(scene);
  }

  private static generateNormalBubble(scene: Phaser.Scene, color: BubbleColor, size: number): void {
    const key = `bubble_${color}`;
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const palette = COLOR_PALETTES[color];
    const r = size / 2 - 4;
    const cx = size / 2;
    const cy = size / 2;

    // Outer soft drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // Spherical base gradient (light source from top-left ~135deg)
    const lightX = cx - r * 0.35;
    const lightY = cy - r * 0.35;
    const grad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
    grad.addColorStop(0, palette.highlight);
    grad.addColorStop(0.45, palette.primary);
    grad.addColorStop(0.85, palette.shadow);
    grad.addColorStop(1, '#0b0c10');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Specular Primary Highlight (curved glossy reflection)
    ctx.save();
    ctx.translate(cx - r * 0.32, cy - r * 0.32);
    ctx.rotate(-Math.PI / 4);
    const specGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.45);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.4, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Subtle ambient floor bounce reflection (bottom edge)
    const bounceGrad = ctx.createRadialGradient(cx, cy + r * 0.65, 0, cx, cy + r * 0.65, r * 0.4);
    bounceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    bounceGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bounceGrad;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.6, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Inner rim edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1.5, 0, Math.PI * 2);
    ctx.stroke();

    scene.textures.addCanvas(key, canvas);
  }

  private static generateSpecialBubble(scene: Phaser.Scene, type: BubbleType, size: number): void {
    const key = `bubble_${type}`;
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const r = size / 2 - 4;
    const cx = size / 2;
    const cy = size / 2;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    const lightX = cx - r * 0.35;
    const lightY = cy - r * 0.35;

    if (type === 'RAINBOW') {
      // Prismatic iridescent sphere
      const rainbowGrad = ctx.createRadialGradient(lightX, lightY, r * 0.05, cx, cy, r);
      rainbowGrad.addColorStop(0, '#ffffff');
      rainbowGrad.addColorStop(0.2, '#ffe066');
      rainbowGrad.addColorStop(0.4, '#00e676');
      rainbowGrad.addColorStop(0.65, '#00e5ff');
      rainbowGrad.addColorStop(0.85, '#d500f9');
      rainbowGrad.addColorStop(1, '#ff1744');

      ctx.fillStyle = rainbowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Prismatic spiral star glyph
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      this.drawStarGlyph(ctx, cx, cy, 6, r * 0.45, r * 0.22, '#ffffff');

    } else if (type === 'BONUS') {
      // Golden sphere
      const goldGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
      goldGrad.addColorStop(0, '#fffbe6');
      goldGrad.addColorStop(0.3, '#ffd700');
      goldGrad.addColorStop(0.7, '#ff9900');
      goldGrad.addColorStop(1, '#663d00');

      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Shimmering 4-point Diamond Star
      ctx.shadowColor = 'transparent';
      this.drawDiamondStarGlyph(ctx, cx, cy, r * 0.55, r * 0.16, '#ffffff');

    } else if (type === 'BOMB') {
      // Metallic gunmetal dark sphere
      const bombGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
      bombGrad.addColorStop(0, '#718096');
      bombGrad.addColorStop(0.4, '#2d3748');
      bombGrad.addColorStop(0.8, '#1a202c');
      bombGrad.addColorStop(1, '#0d1117');

      ctx.fillStyle = bombGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Glowing pulsing Core
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 12;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.35);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, '#ff3d00');
      coreGrad.addColorStop(1, '#d50000');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair / blast notches
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2.5;
      this.drawCrosshairNotches(ctx, cx, cy, r * 0.45);

    } else if (type === 'LIGHTNING') {
      // Electric Indigo-Cyan Sphere
      const electGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
      electGrad.addColorStop(0, '#e0f7fa');
      electGrad.addColorStop(0.3, '#00e5ff');
      electGrad.addColorStop(0.7, '#2979ff');
      electGrad.addColorStop(1, '#0d47a1');

      ctx.fillStyle = electGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Electric Voltage Bolt
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 14;
      this.drawLightningBoltGlyph(ctx, cx, cy, r * 0.65, '#ffffff', '#ffd600');

    } else if (type === 'FREEZE') {
      // Glacier Cyan Frosted Sphere
      const freezeGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
      freezeGrad.addColorStop(0, '#ffffff');
      freezeGrad.addColorStop(0.35, '#80d8ff');
      freezeGrad.addColorStop(0.75, '#00b0ff');
      freezeGrad.addColorStop(1, '#01579b');

      ctx.fillStyle = freezeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Snowflake / Ice Crystal Glyph
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      this.drawSnowflakeGlyph(ctx, cx, cy, r * 0.52, '#ffffff');

    } else if (type === 'CURSE') {
      // Ominous Obsidian-Violet Sphere
      const curseGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
      curseGrad.addColorStop(0, '#f48fb1');
      curseGrad.addColorStop(0.35, '#880e4f');
      curseGrad.addColorStop(0.75, '#311b92');
      curseGrad.addColorStop(1, '#12002b');

      ctx.fillStyle = curseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Skull / Arcane Rune Sigil
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 12;
      this.drawCurseSigilGlyph(ctx, cx, cy, r * 0.5, '#ff5252');

    } else if (type === 'TRAP') {
      // Industrial Hazard Amber Sphere
      const trapGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
      trapGrad.addColorStop(0, '#fff3e0');
      trapGrad.addColorStop(0.35, '#ff6d00');
      trapGrad.addColorStop(0.75, '#d84315');
      trapGrad.addColorStop(1, '#3e1405');

      ctx.fillStyle = trapGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Warning Triangle Hazard Glyph
      ctx.shadowColor = '#ff3d00';
      ctx.shadowBlur = 10;
      this.drawWarningHazardGlyph(ctx, cx, cy, r * 0.52, '#ffffff');
    }

    // Specular Highlight overlay on all special bubbles
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.translate(cx - r * 0.32, cy - r * 0.32);
    ctx.rotate(-Math.PI / 4);
    const specGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.4);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.35, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Inner rim edge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1.5, 0, Math.PI * 2);
    ctx.stroke();

    scene.textures.addCanvas(key, canvas);
  }

  private static generateFrozenOverlay(scene: Phaser.Scene, size: number): void {
    const key = 'frozen_overlay';
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const r = size / 2 - 4;
    const cx = size / 2;
    const cy = size / 2;

    // Translucent frost encasement
    const frostGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
    frostGrad.addColorStop(0, 'rgba(225, 245, 254, 0.35)');
    frostGrad.addColorStop(0.8, 'rgba(129, 212, 250, 0.65)');
    frostGrad.addColorStop(1, 'rgba(2, 136, 209, 0.9)');

    ctx.fillStyle = frostGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Ice cracks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, cy - r * 0.2);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + r * 0.5, cy - r * 0.35);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.5);
    ctx.stroke();

    scene.textures.addCanvas(key, canvas);
  }

  private static generateAimDot(scene: Phaser.Scene): void {
    const key = 'aim_dot';
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(12, 12, 0, 12, 12, 12);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.8, 'rgba(0, 229, 255, 0.5)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(12, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    scene.textures.addCanvas(key, canvas);
  }

  private static generateParticleTextures(scene: Phaser.Scene): void {
    const key = 'particle_shard';
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();

    scene.textures.addCanvas(key, canvas);
  }

  private static generateLauncherTextures(scene: Phaser.Scene): void {
    // 1. Launcher Turntable Base
    if (!scene.textures.exists('launcher_base')) {
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = 140;
      baseCanvas.height = 140;
      const bCtx = baseCanvas.getContext('2d')!;
      const cx = 70;
      const cy = 70;

      // Outer metallic bevel
      const outerGrad = bCtx.createRadialGradient(cx, cy, 30, cx, cy, 68);
      outerGrad.addColorStop(0, '#1e293b');
      outerGrad.addColorStop(0.7, '#0f172a');
      outerGrad.addColorStop(0.9, '#475569');
      outerGrad.addColorStop(1, '#090d16');
      bCtx.fillStyle = outerGrad;
      bCtx.beginPath();
      bCtx.arc(cx, cy, 66, 0, Math.PI * 2);
      bCtx.fill();

      // Chrome outer ring
      bCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      bCtx.lineWidth = 2.5;
      bCtx.stroke();

      // Glowing cyan energy circuit ring
      bCtx.shadowColor = '#00e5ff';
      bCtx.shadowBlur = 10;
      bCtx.strokeStyle = '#00e5ff';
      bCtx.lineWidth = 3;
      bCtx.beginPath();
      bCtx.arc(cx, cy, 52, 0, Math.PI * 2);
      bCtx.stroke();

      // Circuit ticks
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const x1 = cx + Math.cos(angle) * 44;
        const y1 = cy + Math.sin(angle) * 44;
        const x2 = cx + Math.cos(angle) * 52;
        const y2 = cy + Math.sin(angle) * 52;
        bCtx.beginPath();
        bCtx.moveTo(x1, y1);
        bCtx.lineTo(x2, y2);
        bCtx.stroke();
      }

      bCtx.shadowColor = 'transparent';
      bCtx.shadowBlur = 0;

      // Inner pedestal core
      const coreGrad = bCtx.createRadialGradient(cx, cy, 0, cx, cy, 36);
      coreGrad.addColorStop(0, '#0f172a');
      coreGrad.addColorStop(1, '#020617');
      bCtx.fillStyle = coreGrad;
      bCtx.beginPath();
      bCtx.arc(cx, cy, 38, 0, Math.PI * 2);
      bCtx.fill();

      scene.textures.addCanvas('launcher_base', baseCanvas);
    }

    // 2. High-Tech Plasma Cannon Barrel
    if (!scene.textures.exists('launcher_barrel')) {
      const barrelCanvas = document.createElement('canvas');
      barrelCanvas.width = 80;
      barrelCanvas.height = 110;
      const ctx = barrelCanvas.getContext('2d')!;

      // Left & Right Stabilizer Rails
      const railGrad = ctx.createLinearGradient(0, 0, 80, 0);
      railGrad.addColorStop(0, '#1e293b');
      railGrad.addColorStop(0.2, '#64748b');
      railGrad.addColorStop(0.5, '#cbd5e1');
      railGrad.addColorStop(0.8, '#64748b');
      railGrad.addColorStop(1, '#1e293b');

      ctx.fillStyle = railGrad;

      // Left wing
      ctx.beginPath();
      ctx.moveTo(14, 95);
      ctx.lineTo(26, 30);
      ctx.lineTo(34, 15);
      ctx.lineTo(34, 95);
      ctx.closePath();
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(66, 95);
      ctx.lineTo(54, 30);
      ctx.lineTo(46, 15);
      ctx.lineTo(46, 95);
      ctx.closePath();
      ctx.fill();

      // Center Glass Plasma Chamber
      const plasmaGrad = ctx.createLinearGradient(0, 15, 0, 95);
      plasmaGrad.addColorStop(0, 'rgba(0, 229, 255, 0.95)');
      plasmaGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.8)');
      plasmaGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

      ctx.fillStyle = plasmaGrad;
      ctx.beginPath();
      ctx.roundRect(32, 20, 16, 75, 8);
      ctx.fill();

      // Glowing Cyan Laser Filament
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 24);
      ctx.lineTo(40, 90);
      ctx.stroke();

      // Cannon Muzzle Ring
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.ellipse(40, 16, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      scene.textures.addCanvas('launcher_barrel', barrelCanvas);
    }

    // 3. Floating Reserve Bubble Dock
    if (!scene.textures.exists('reserve_dock')) {
      const dockCanvas = document.createElement('canvas');
      dockCanvas.width = 90;
      dockCanvas.height = 90;
      const dCtx = dockCanvas.getContext('2d')!;
      const cx = 45;
      const cy = 45;

      // Outer hexagonal/circular glass ring
      const dGrad = dCtx.createRadialGradient(cx, cy, 20, cx, cy, 42);
      dGrad.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
      dGrad.addColorStop(0.8, 'rgba(30, 41, 59, 0.9)');
      dGrad.addColorStop(1, 'rgba(0, 229, 255, 0.4)');

      dCtx.fillStyle = dGrad;
      dCtx.beginPath();
      dCtx.arc(cx, cy, 40, 0, Math.PI * 2);
      dCtx.fill();

      // Neon orbit line
      dCtx.shadowColor = '#00e5ff';
      dCtx.shadowBlur = 8;
      dCtx.strokeStyle = '#00e5ff';
      dCtx.lineWidth = 2.5;
      dCtx.beginPath();
      dCtx.arc(cx, cy, 38, 0, Math.PI * 2);
      dCtx.stroke();

      scene.textures.addCanvas('reserve_dock', dockCanvas);
    }

    // 4. Wall Spark Texture
    if (!scene.textures.exists('wall_spark')) {
      const sparkCanvas = document.createElement('canvas');
      sparkCanvas.width = 30;
      sparkCanvas.height = 30;
      const sCtx = sparkCanvas.getContext('2d')!;
      this.drawDiamondStarGlyph(sCtx, 15, 15, 14, 4, '#00e5ff');
      scene.textures.addCanvas('wall_spark', sparkCanvas);
    }
  }

  // --- GLYPH DRAWING HELPERS ---

  private static drawStarGlyph(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string
  ): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  private static drawDiamondStarGlyph(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    ctx.quadraticCurveTo(cx, cy, cx + outerR, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + outerR);
    ctx.quadraticCurveTo(cx, cy, cx - outerR, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  private static drawCrosshairNotches(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number
  ): void {
    const len = radius * 0.35;
    ctx.beginPath();
    // Top
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy - radius + len);
    // Bottom
    ctx.moveTo(cx, cy + radius);
    ctx.lineTo(cx, cy + radius - len);
    // Left
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx - radius + len, cy);
    // Right
    ctx.moveTo(cx + radius, cy);
    ctx.lineTo(cx + radius - len, cy);
    ctx.stroke();
  }

  private static drawLightningBoltGlyph(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    height: number,
    fillColor: string,
    strokeColor: string
  ): void {
    const h = height / 2;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - h);
    ctx.lineTo(cx - 10, cy + 2);
    ctx.lineTo(cx - 1, cy + 2);
    ctx.lineTo(cx - 5, cy + h);
    ctx.lineTo(cx + 11, cy - 2);
    ctx.lineTo(cx + 2, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private static drawSnowflakeGlyph(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    color: string
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI) / 3;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(cx - dx, cy - dy);
      ctx.lineTo(cx + dx, cy + dy);
      ctx.stroke();

      // Branchlets
      const bDist = radius * 0.6;
      const bLen = radius * 0.3;
      for (const dir of [-1, 1]) {
        const px = cx + dir * Math.cos(angle) * bDist;
        const py = cy + dir * Math.sin(angle) * bDist;
        const bAngle1 = angle + Math.PI / 4;
        const bAngle2 = angle - Math.PI / 4;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(bAngle1) * bLen, py + Math.sin(bAngle1) * bLen);
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(bAngle2) * bLen, py + Math.sin(bAngle2) * bLen);
        ctx.stroke();
      }
    }
  }

  private static drawCurseSigilGlyph(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    color: string
  ): void {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    // Outer inverted triangle rune
    const h = radius;
    ctx.beginPath();
    ctx.moveTo(cx - h, cy - h * 0.5);
    ctx.lineTo(cx + h, cy - h * 0.5);
    ctx.lineTo(cx, cy + h);
    ctx.closePath();
    ctx.stroke();

    // Inner glowing eye / sigil dot
    ctx.beginPath();
    ctx.arc(cx, cy - h * 0.05, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawWarningHazardGlyph(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    color: string
  ): void {
    const h = radius;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    // Upright Hazard Triangle
    ctx.beginPath();
    ctx.moveTo(cx, cy - h);
    ctx.lineTo(cx + h, cy + h * 0.7);
    ctx.lineTo(cx - h, cy + h * 0.7);
    ctx.closePath();
    ctx.stroke();

    // Exclamation mark
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.35);
    ctx.lineTo(cx, cy + h * 0.15);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy + h * 0.45, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
