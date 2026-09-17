import Phaser from 'phaser';
import { BubbleColor, BubbleType } from '../types/game';
import { COLOR_PALETTES, BUBBLE_DIAMETER } from './constants';

export class ProceduralAssetGenerator {
  /**
   * Generates all procedural bubble and game textures and registers them into Phaser's TextureManager.
   */
  public static generateAll(scene: Phaser.Scene): void {
    const size = BUBBLE_DIAMETER * 2; // Render at 2x resolution (120x120) for crisp Hi-DPI sharpness

    // 0. Bind 100% Genuine Preloaded Master Orbs if available from preload
    const orbAliases: Record<string, string[]> = {
      orb_pufferfish: ['bubble_RED', 'bubble_PUFFERFISH', 'bubble_PUFFERFISH_RED'],
      orb_turtle: ['bubble_GREEN', 'bubble_TURTLE', 'bubble_TRAP'],
      orb_turtle_cracked: ['bubble_TURTLE_CRACKED'],
      orb_jellyfish: ['bubble_BLUE', 'bubble_JELLYFISH', 'bubble_RAINBOW'],
      orb_starfish: ['bubble_YELLOW', 'bubble_STARFISH', 'bubble_BONUS'],
      orb_crab: ['bubble_CRAB', 'bubble_BOMB'],
      orb_squid: ['bubble_PURPLE', 'bubble_SQUID', 'bubble_LIGHTNING'],
      orb_octopus: ['bubble_OCTOPUS', 'bubble_CURSE'],
      orb_shark: ['bubble_SHARK']
    };

    let hasPreloadedOrbs = false;
    Object.entries(orbAliases).forEach(([sourceKey, targetKeys]) => {
      if (scene.textures && scene.textures.exists(sourceKey)) {
        hasPreloadedOrbs = true;
        const sourceTexture = scene.textures.get(sourceKey);
        const sourceImage = sourceTexture.getSourceImage() as HTMLImageElement;
        targetKeys.forEach(targetKey => {
          if (scene.textures.exists(targetKey)) {
            scene.textures.remove(targetKey);
          }
          scene.textures.addImage(targetKey, sourceImage);
        });
      }
    });

    // 0b. Bind 100% Genuine Preloaded Master Pearl Cannon from Section 3
    const cannonAliases: Record<string, string> = {
      launcher_base: 'pearl_cannon_base',
      launcher_barrel: 'pearl_cannon_barrel'
    };

    Object.entries(cannonAliases).forEach(([targetKey, sourceKey]) => {
      if (scene.textures && scene.textures.exists(sourceKey)) {
        const sourceTexture = scene.textures.get(sourceKey);
        const sourceImage = sourceTexture.getSourceImage() as HTMLImageElement;
        if (scene.textures.exists(targetKey)) {
          scene.textures.remove(targetKey);
        }
        scene.textures.addImage(targetKey, sourceImage);
      }
    });

    // 1. Procedural fallbacks (active if preloaded orbs not loaded or in headless test runner)
    if (!hasPreloadedOrbs) {
      this.generatePufferfishOrb(scene, size);
      this.generateTurtleOrb(scene, size);
      this.generateJellyfishOrb(scene, size);
      this.generateStarfishOrb(scene, size);
      this.generateSquidOrb(scene, size);
      this.generateCrabOrb(scene, size);
      this.generateOctopusOrb(scene, size);
      this.generateSharkOrb(scene, size);
    }
    this.generateWhirlpoolOrb(scene, size);

    // 2. Generate Marine Obstacles
    this.generateObstacles(scene, size);

    // 3. Generate Frozen Overlay
    this.generateFrozenOverlay(scene, size);

    // 4. Generate Aim Guide Dot & Reticle
    this.generateAimDot(scene);
    this.generateAimReticle(scene);

    // 5. Generate Particle Shards & Rings
    this.generateParticleTextures(scene);
    this.generateShockwaveRing(scene);

    // 6. Generate Launcher Base with Giant Pearl, Barrel, Current Chamber Frame, Next Pod, Miss Pod & Powerup Icons
    this.generateLauncherTextures(scene);
    this.generateCurrentChamberFrame(scene);
    this.generateNextOrbPod(scene);
    this.generateMissMeterPod(scene);
    this.generatePowerupIcons(scene);

    // 7. Generate Ocean Water Bubbles & Splash
    this.generateWaterBubbleTextures(scene);
  }

  /**
   * ORB 01: PUFFERFISH (Cá nóc - Red Normal Orb)
   * Adorable round coral-red pufferfish with two big expressive cartoon eyes, pink blush cheeks,
   * sweet smiling mouth, side fins, soft spines, white underbelly, and crystal water sphere shell.
   */
  public static generatePufferfishOrb(scene: Phaser.Scene, size: number): void {
    const keys = ['bubble_RED', 'bubble_PUFFERFISH', 'bubble_PUFFERFISH_RED'];
    if (scene.textures.exists(keys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const palette = COLOR_PALETTES['RED'];
    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Soft Ambient Outer Glow
    ctx.shadowColor = palette.glow || 'rgba(255, 51, 102, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    // 2. Translucent Pectoral Fins (Left & Right)
    ctx.fillStyle = palette.highlight;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.88, cy + r * 0.15, r * 0.24, r * 0.14, -Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.88, cy + r * 0.15, r * 0.24, r * 0.14, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 3. Base Spherical Body Gradient
    const lightX = cx - r * 0.25;
    const lightY = cy - r * 0.25;
    const bodyGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.2, palette.highlight);
    bodyGrad.addColorStop(0.55, palette.primary);
    bodyGrad.addColorStop(0.88, palette.shadow);
    bodyGrad.addColorStop(1, '#090d16');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 4. Soft Pufferfish Spines (10 soft conical points around perimeter)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI * 2) / 10;
      const sx = cx + Math.cos(angle) * (r - 2);
      const sy = cy + Math.sin(angle) * (r - 2);
      const tipX = cx + Math.cos(angle) * (r + 4.5);
      const tipY = cy + Math.sin(angle) * (r + 4.5);
      const perpAngle = angle + Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(sx + Math.cos(perpAngle) * 3, sy + Math.sin(perpAngle) * 3);
      ctx.lineTo(sx - Math.cos(perpAngle) * 3, sy - Math.sin(perpAngle) * 3);
      ctx.closePath();
      ctx.fill();
    }

    // 5. White Underbelly Crescent
    const bellyGrad = ctx.createRadialGradient(cx, cy + r * 0.5, 0, cx, cy + r * 0.5, r * 0.6);
    bellyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    bellyGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    bellyGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.45, r * 0.65, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Cute Front-Facing Eyes (Left & Right)
    const eyeOffsetX = r * 0.36;
    const eyeY = cy - r * 0.12;
    const eyeRadius = r * 0.22;

    [-eyeOffsetX, eyeOffsetX].forEach((ex) => {
      // White cornea
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Iris & Dark Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + ex + (ex > 0 ? -1 : 1), eyeY, eyeRadius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      // Primary Specular Catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex - 2, eyeY - 2.5, eyeRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Secondary Tiny Catchlight
      ctx.beginPath();
      ctx.arc(cx + ex + 2.5, eyeY + 2.5, eyeRadius * 0.16, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. Rosy Cheeks (Blush)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.52, cy + r * 0.14, r * 0.12, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.52, cy + r * 0.14, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // 8. Cute Smiling Mouth
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.15, r * 0.15, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // 9. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    keys.forEach(k => scene.textures.addCanvas(k, canvas));
  }

  /**
   * ORB 02: JELLYFISH (Sứa - Wild & Blue Orb)
   * Translucent glowing sky-blue bell dome with 2 cute eyes, ruffled skirt,
   * undulating bioluminescent tentacles, and effervescent water bubbles.
   */
  private static generateJellyfishOrb(scene: Phaser.Scene, size: number): void {
    const keys = ['bubble_BLUE', 'bubble_JELLYFISH', 'bubble_RAINBOW'];
    if (scene.textures.exists(keys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Oceanic Blue Ambient Glow
    ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
    ctx.shadowBlur = 12;

    // 2. Base Water Sphere Background
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bgGrad.addColorStop(0, '#0284c7');
    bgGrad.addColorStop(0.6, '#0369a1');
    bgGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // 3. Bioluminescent Tentacles Trailing Down
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.9)';
    ctx.lineWidth = 2.2;
    [-r * 0.45, -r * 0.22, 0, r * 0.22, r * 0.45].forEach((offsetX, idx) => {
      ctx.beginPath();
      ctx.moveTo(cx + offsetX, cy + r * 0.15);
      const sway = idx % 2 === 0 ? 8 : -8;
      ctx.bezierCurveTo(
        cx + offsetX + sway, cy + r * 0.45,
        cx + offsetX - sway, cy + r * 0.75,
        cx + offsetX + sway * 0.5, cy + r * 0.88
      );
      ctx.stroke();

      // Droplet bead at end of tentacle
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx + offsetX + sway * 0.5, cy + r * 0.88, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Translucent Bell Dome (Umbrella)
    const domeGrad = ctx.createRadialGradient(cx, cy - r * 0.2, 0, cx, cy - r * 0.1, r * 0.65);
    domeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    domeGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.85)');
    domeGrad.addColorStop(0.75, 'rgba(14, 165, 233, 0.7)');
    domeGrad.addColorStop(1, 'rgba(2, 132, 199, 0.5)');

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.05, r * 0.58, Math.PI, 0);
    // Wavy scalloped bottom skirt
    const skirtLeft = cx - r * 0.58;
    const skirtWidth = r * 1.16;
    const scallops = 6;
    const step = skirtWidth / scallops;
    for (let i = scallops; i >= 0; i--) {
      const sx = skirtLeft + i * step;
      ctx.quadraticCurveTo(sx - step / 2, cy + 2, sx - step, cy - r * 0.05);
    }
    ctx.closePath();
    ctx.fill();

    // 5. Cute Cartoon Eyes on Bell
    [-r * 0.2, r * 0.2].forEach(ex => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - r * 0.22, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex - 1, cy - r * 0.24, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sweet smile
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.14, 4.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // 6. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    keys.forEach(k => scene.textures.addCanvas(k, canvas));
  }

  /**
   * ORB 03: SEA TURTLE (Rùa biển - Shield Orb)
   * Emerald sea turtle swimming forward: friendly head with big shiny eyes,
   * jade carapace with hexagon scutes, swimming flippers, and energy shield ring.
   */
  private static generateTurtleOrb(scene: Phaser.Scene, size: number): void {
    const fullShieldKeys = ['bubble_GREEN', 'bubble_TURTLE', 'bubble_TRAP'];
    if (scene.textures.exists(fullShieldKeys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Deep Oceanic Emerald Backdrop
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bgGrad.addColorStop(0, '#065f46');
    bgGrad.addColorStop(0.7, '#047857');
    bgGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Swimming Flippers
    ctx.fillStyle = '#34d399';
    // Front Left Flipper
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.65, cy - r * 0.25, r * 0.35, r * 0.16, -Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();
    // Front Right Flipper
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.65, cy - r * 0.25, r * 0.35, r * 0.16, Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();
    // Rear Left Flipper
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.45, cy + r * 0.55, r * 0.22, r * 0.12, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    // Rear Right Flipper
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.45, cy + r * 0.55, r * 0.22, r * 0.12, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Turtle Carapace (Oval Shell)
    const shellGrad = ctx.createRadialGradient(cx - r * 0.15, cy, r * 0.1, cx, cy + r * 0.08, r * 0.55);
    shellGrad.addColorStop(0, '#6ee7b7');
    shellGrad.addColorStop(0.3, '#10b981');
    shellGrad.addColorStop(0.75, '#047857');
    shellGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.1, r * 0.52, r * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hexagonal Scutes & Trim
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.8;
    this.drawTurtlePlates(ctx, cx, cy + r * 0.1, r * 0.38);

    // 4. Cute Smiling Turtle Head (Top-Center)
    const headY = cy - r * 0.42;
    const headGrad = ctx.createRadialGradient(cx, headY, 2, cx, headY, r * 0.24);
    headGrad.addColorStop(0, '#a7f3d0');
    headGrad.addColorStop(0.6, '#34d399');
    headGrad.addColorStop(1, '#059669');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(cx, headY, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Head Big Shiny Cartoon Eyes
    [-r * 0.11, r * 0.11].forEach(ex => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex, headY - 1.5, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(cx + ex, headY - 1.5, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex - 0.8, headY - 2.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Friendly Smile
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, headY + 3.5, 3.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // 5. Subtle Emerald Glass Rim Accent
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.stroke();

    // 6. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    fullShieldKeys.forEach(k => scene.textures.addCanvas(k, canvas));

    // --- State B: Cracked Shield (1 HP remaining) ---
    const crackedCanvas = document.createElement('canvas');
    crackedCanvas.width = size;
    crackedCanvas.height = size;
    const cCtx = crackedCanvas.getContext('2d')!;
    cCtx.drawImage(canvas, 0, 0);

    // Jagged Lightning Crack across shell
    cCtx.strokeStyle = '#ffffff';
    cCtx.lineWidth = 2.8;
    cCtx.shadowColor = '#f43f5e';
    cCtx.shadowBlur = 8;
    cCtx.beginPath();
    cCtx.moveTo(cx - r * 0.6, cy - r * 0.35);
    cCtx.lineTo(cx - r * 0.15, cy);
    cCtx.lineTo(cx - r * 0.3, cy + r * 0.18);
    cCtx.lineTo(cx + r * 0.25, cy + r * 0.35);
    cCtx.lineTo(cx + r * 0.6, cy + r * 0.55);
    cCtx.stroke();
    cCtx.shadowColor = 'transparent';

    scene.textures.addCanvas('bubble_TURTLE_CRACKED', crackedCanvas);
  }

  /**
   * ORB 04: STARFISH (Sao biển - Bonus & Yellow Orb)
   * 5-armed coral-orange starfish with two big smiling cartoon eyes,
   * rosy cheeks, textured arm suction cups, and radiant golden water sphere.
   */
  private static generateStarfishOrb(scene: Phaser.Scene, size: number): void {
    const keys = ['bubble_YELLOW', 'bubble_STARFISH', 'bubble_BONUS'];
    if (scene.textures.exists(keys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Golden Aura Glow
    ctx.shadowColor = 'rgba(251, 191, 36, 0.7)';
    ctx.shadowBlur = 12;

    // 2. Base Sphere in Warm Golden Amber
    const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    baseGrad.addColorStop(0, '#fffbeb');
    baseGrad.addColorStop(0.35, '#fbbf24');
    baseGrad.addColorStop(0.7, '#d97706');
    baseGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 3. 5-Armed Coral Starfish
    this.drawStarGlyph(ctx, cx, cy, 5, r * 0.88, r * 0.42, '#f97316');

    // Arm Texture Suction Dots
    ctx.fillStyle = '#fef08a';
    for (let a = 0; a < 5; a++) {
      const angle = (a * 2 * Math.PI) / 5 - Math.PI / 2;
      for (let dist = 0.52; dist <= 0.82; dist += 0.15) {
        const dotX = cx + Math.cos(angle) * (r * dist);
        const dotY = cy + Math.sin(angle) * (r * dist);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Starfish Cute Center Face (2 Big Eyes + Blush + Smile)
    [-r * 0.16, r * 0.16].forEach(ex => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - 2, 3.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex - 1, cy - 3.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rosy Blush
    ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.26, cy + 4, 3, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.26, cy + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sweet Smile
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy + 3.5, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // 5. 4-point Diamond Star Sparkle
    this.drawDiamondStarGlyph(ctx, cx + r * 0.45, cy - r * 0.45, 10, 3, '#ffffff');

    // 6. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    keys.forEach(k => scene.textures.addCanvas(k, canvas));
  }

  /**
   * ORB 05: CRAB (Cua - Bomb Orb)
   * Fiery coral-red crab with 2 stalk eyes, sweet smile, raised pincer claws,
   * walking legs, and volcanic magma energy core.
   */
  private static generateCrabOrb(scene: Phaser.Scene, size: number): void {
    const keys = ['bubble_CRAB', 'bubble_BOMB'];
    if (scene.textures.exists(keys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Fiery Heat Glow
    ctx.shadowColor = 'rgba(239, 68, 68, 0.75)';
    ctx.shadowBlur = 12;

    // 2. Base Sphere in Deep Fiery Magma Red
    const crabGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    crabGrad.addColorStop(0, '#fecdd3');
    crabGrad.addColorStop(0.3, '#f43f5e');
    crabGrad.addColorStop(0.7, '#be123c');
    crabGrad.addColorStop(1, '#4c0519');
    ctx.fillStyle = crabGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 3. Crab Walking Legs (4 small legs below)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    // Left legs
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.35, cy + r * 0.35);
    ctx.lineTo(cx - r * 0.65, cy + r * 0.65);
    ctx.moveTo(cx - r * 0.25, cy + r * 0.45);
    ctx.lineTo(cx - r * 0.45, cy + r * 0.78);
    // Right legs
    ctx.moveTo(cx + r * 0.35, cy + r * 0.35);
    ctx.lineTo(cx + r * 0.65, cy + r * 0.65);
    ctx.moveTo(cx + r * 0.25, cy + r * 0.45);
    ctx.lineTo(cx + r * 0.45, cy + r * 0.78);
    ctx.stroke();

    // 4. Two Raised Pincers (Claws)
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#ffe4e6';
    ctx.lineWidth = 1.6;
    // Left Claw
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.65, cy - r * 0.45, r * 0.28, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Right Claw
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.65, cy - r * 0.45, r * 0.28, r * 0.18, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Crab Carapace Shell Body
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.08, r * 0.52, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Two Cute Stalk Eyes at the top of carapace
    [-r * 0.2, r * 0.2].forEach(ex => {
      // Eye stalk
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + ex, cy - r * 0.1);
      ctx.lineTo(cx + ex, cy - r * 0.36);
      ctx.stroke();

      // Eye ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - r * 0.36, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - r * 0.36, 3.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex - 1, cy - r * 0.39, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cute Smile
    ctx.strokeStyle = '#4c0519';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.12, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // 7. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    keys.forEach(k => scene.textures.addCanvas(k, canvas));
  }

  /**
   * ORB 06: SQUID (Mực - Poison / Control Orb)
   * Royal violet squid with pointed mantle, side fins, 2 big shiny golden eyes,
   * sweet smile, and curled trailing tentacles.
   */
  private static generateSquidOrb(scene: Phaser.Scene, size: number): void {
    const keys = ['bubble_PURPLE', 'bubble_SQUID', 'bubble_LIGHTNING'];
    if (scene.textures.exists(keys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Violet Mystic Glow
    ctx.shadowColor = 'rgba(168, 85, 247, 0.7)';
    ctx.shadowBlur = 12;

    // 2. Base Sphere
    const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    baseGrad.addColorStop(0, '#faf5ff');
    baseGrad.addColorStop(0.3, '#c084fc');
    baseGrad.addColorStop(0.7, '#7e22ce');
    baseGrad.addColorStop(1, '#2e1065');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 3. Curled Tentacles below
    ctx.strokeStyle = '#d8b4fe';
    ctx.lineWidth = 2.4;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 8, cy + r * 0.25);
      ctx.quadraticCurveTo(cx + i * 11 + (i % 2 === 0 ? 5 : -5), cy + r * 0.55, cx + i * 9, cy + r * 0.85);
      ctx.stroke();
    }

    // 4. Squid Mantle (Pointed hood at the top)
    const mantleGrad = ctx.createLinearGradient(cx, cy - r * 0.85, cx, cy + r * 0.1);
    mantleGrad.addColorStop(0, '#f3e8ff');
    mantleGrad.addColorStop(0.5, '#a855f7');
    mantleGrad.addColorStop(1, '#6b21a8');
    ctx.fillStyle = mantleGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.85);
    ctx.lineTo(cx + r * 0.48, cy - r * 0.1);
    ctx.lineTo(cx - r * 0.48, cy - r * 0.1);
    ctx.closePath();
    ctx.fill();

    // 5. Cute Big Cartoon Eyes
    [-r * 0.22, r * 0.22].forEach(ex => {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - 2, 3.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex - 1, cy - 3.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sweet smile
    ctx.strokeStyle = '#2e1065';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // 6. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    keys.forEach(k => scene.textures.addCanvas(k, canvas));
  }

  /**
   * ORB 07: OCTOPUS (Bạch tuộc - Chain Reaction Orb)
   * Magenta-violet cute octopus with big bulbous round head, two large expressive
   * eyes, sweet smile, and splayed curly suction tentacles framing the bottom.
   */
  private static generateOctopusOrb(scene: Phaser.Scene, size: number): void {
    const keys = ['bubble_OCTOPUS', 'bubble_CURSE'];
    if (scene.textures.exists(keys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Magenta Electric Glow
    ctx.shadowColor = 'rgba(217, 70, 239, 0.75)';
    ctx.shadowBlur = 12;

    // 2. Base Sphere
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bgGrad.addColorStop(0, '#fdf4ff');
    bgGrad.addColorStop(0.35, '#d946ef');
    bgGrad.addColorStop(0.75, '#a21caf');
    bgGrad.addColorStop(1, '#4a044e');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 3. Splayed Curly Suction Tentacles around bottom
    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const startX = cx + i * 8;
      const startY = cy + r * 0.18;
      const endX = cx + i * 12;
      const endY = cy + r * 0.82;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cx + i * 15, cy + r * 0.5, endX, endY);
      ctx.stroke();

      // Suction disc
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(endX, endY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Large Bulbous Octopus Head (Center-Top)
    const headGrad = ctx.createRadialGradient(cx, cy - r * 0.18, 0, cx, cy - r * 0.15, r * 0.52);
    headGrad.addColorStop(0, '#fdf4ff');
    headGrad.addColorStop(0.4, '#e879f9');
    headGrad.addColorStop(0.8, '#c026d3');
    headGrad.addColorStop(1, '#701a75');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.12, r * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // 5. Two Huge Expressive Cartoon Eyes
    [-r * 0.2, r * 0.2].forEach(ex => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - r * 0.12, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + ex, cy - r * 0.12, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + ex - 1.2, cy - r * 0.16, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.34, cy + 2, 3, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.34, cy + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sweet smiling mouth
    ctx.strokeStyle = '#4a044e';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // 6. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    keys.forEach(k => scene.textures.addCanvas(k, canvas));
  }

  /**
   * ORB 08: SHARK (Cá mập - Boss / Special Orb)
   * Sleek oceanic blue predator with white underbelly, dorsal fin, big eye,
   * grinning mouth with sharp white triangular teeth, and gill slits.
   */
  private static generateSharkOrb(scene: Phaser.Scene, size: number): void {
    const key = 'bubble_SHARK';
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Oceanic Predator Glow
    ctx.shadowColor = 'rgba(2, 132, 199, 0.75)';
    ctx.shadowBlur = 12;

    // 2. Base Sphere in Deep Oceanic Blue
    const sharkGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sharkGrad.addColorStop(0, '#bae6fd');
    sharkGrad.addColorStop(0.3, '#38bdf8');
    sharkGrad.addColorStop(0.7, '#0284c7');
    sharkGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = sharkGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 3. Hydrodynamic Shark Dorsal Fin (Top)
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.25, cy - r * 0.55);
    ctx.lineTo(cx, cy - r * 0.95);
    ctx.lineTo(cx + r * 0.25, cy - r * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. White Underbelly Crescent
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.45, r * 0.65, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Grinning Jaw with Sharp White Triangular Teeth
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.arc(cx + r * 0.12, cy + r * 0.18, r * 0.38, 0, Math.PI * 0.9);
    ctx.closePath();
    ctx.fill();

    // Sharp white pearl teeth
    ctx.fillStyle = '#ffffff';
    for (let t = 0; t < 5; t++) {
      const toothX = cx - r * 0.12 + t * 8.5;
      const toothY = cy + r * 0.18;
      ctx.beginPath();
      ctx.moveTo(toothX, toothY);
      ctx.lineTo(toothX + 4.2, toothY + 7);
      ctx.lineTo(toothX + 8.5, toothY);
      ctx.closePath();
      ctx.fill();
    }

    // 6. Expressive Predator Eye
    const eyeX = cx - r * 0.32;
    const eyeY = cy - r * 0.12;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX - 1.2, eyeY - 1.5, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 7. Gills on Flank
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.8;
    for (let g = 0; g < 3; g++) {
      ctx.beginPath();
      ctx.arc(cx - r * 0.05 + g * 5, cy - 2, r * 0.16, Math.PI * 0.7, Math.PI * 1.3);
      ctx.stroke();
    }

    // 8. Crystal Water Sphere Glass Overlay
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    scene.textures.addCanvas(key, canvas);
  }

  /**
   * Generates Marine Obstacles: Rock, Ice, Cage, Seaweed.
   */
  private static generateObstacles(scene: Phaser.Scene, size: number): void {
    const r = size / 2 - 6;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Basalt Volcanic Rock (bubble_ROCK)
    if (!scene.textures.exists('bubble_ROCK')) {
      const rockCanvas = document.createElement('canvas');
      rockCanvas.width = size;
      rockCanvas.height = size;
      const rCtx = rockCanvas.getContext('2d')!;

      const rockGrad = rCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      rockGrad.addColorStop(0, '#94a3b8');
      rockGrad.addColorStop(0.4, '#475569');
      rockGrad.addColorStop(0.85, '#1e293b');
      rockGrad.addColorStop(1, '#0f172a');
      rCtx.fillStyle = rockGrad;
      rCtx.beginPath();
      rCtx.arc(cx, cy, r, 0, Math.PI * 2);
      rCtx.fill();

      // Rock facets & crags
      rCtx.strokeStyle = '#64748b';
      rCtx.lineWidth = 2.5;
      rCtx.beginPath();
      rCtx.moveTo(cx - r * 0.7, cy - r * 0.2);
      rCtx.lineTo(cx - r * 0.1, cy - r * 0.5);
      rCtx.lineTo(cx + r * 0.5, cy - r * 0.2);
      rCtx.lineTo(cx + r * 0.2, cy + r * 0.5);
      rCtx.lineTo(cx - r * 0.4, cy + r * 0.4);
      rCtx.closePath();
      rCtx.stroke();

      // Barnacles
      rCtx.fillStyle = '#f8fafc';
      [[cx - r * 0.3, cy + r * 0.2], [cx + r * 0.35, cy - r * 0.2], [cx + r * 0.1, cy + r * 0.35]].forEach(([bx, by]) => {
        rCtx.beginPath();
        rCtx.arc(bx, by, 3.5, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.fillStyle = '#334155';
        rCtx.beginPath();
        rCtx.arc(bx, by, 1.8, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.fillStyle = '#f8fafc';
      });

      scene.textures.addCanvas('bubble_ROCK', rockCanvas);
    }

    // 2. Ice Coral (bubble_ICE)
    if (!scene.textures.exists('bubble_ICE')) {
      const iceCanvas = document.createElement('canvas');
      iceCanvas.width = size;
      iceCanvas.height = size;
      const iCtx = iceCanvas.getContext('2d')!;

      const iceGrad = iCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      iceGrad.addColorStop(0, '#ffffff');
      iceGrad.addColorStop(0.35, '#bae6fd');
      iceGrad.addColorStop(0.75, '#38bdf8');
      iceGrad.addColorStop(1, '#0284c7');
      iCtx.fillStyle = iceGrad;
      iCtx.beginPath();
      iCtx.arc(cx, cy, r, 0, Math.PI * 2);
      iCtx.fill();

      // Frost Crystal veins
      iCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      iCtx.lineWidth = 2.2;
      this.drawSnowflakeGlyph(iCtx, cx, cy, r * 0.65, '#ffffff');

      scene.textures.addCanvas('bubble_ICE', iceCanvas);
    }

    // 3. Bubble Cage (bubble_CAGE)
    if (!scene.textures.exists('bubble_CAGE')) {
      const cageCanvas = document.createElement('canvas');
      cageCanvas.width = size;
      cageCanvas.height = size;
      const cCtx = cageCanvas.getContext('2d')!;

      // Translucent bubble
      const cGrad = cCtx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      cGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      cGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.35)');
      cGrad.addColorStop(1, 'rgba(14, 165, 233, 0.7)');
      cCtx.fillStyle = cGrad;
      cCtx.beginPath();
      cCtx.arc(cx, cy, r, 0, Math.PI * 2);
      cCtx.fill();

      // Pearl cage bars
      cCtx.strokeStyle = '#fde047';
      cCtx.lineWidth = 2.8;
      for (let x = cx - r * 0.6; x <= cx + r * 0.6; x += r * 0.4) {
        cCtx.beginPath();
        cCtx.moveTo(x, cy - r * 0.75);
        cCtx.lineTo(x, cy + r * 0.75);
        cCtx.stroke();
      }
      cCtx.beginPath();
      cCtx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      cCtx.stroke();

      scene.textures.addCanvas('bubble_CAGE', cageCanvas);
    }

    // 4. Ancient Seaweed (bubble_SEAWEED)
    if (!scene.textures.exists('bubble_SEAWEED')) {
      const weedCanvas = document.createElement('canvas');
      weedCanvas.width = size;
      weedCanvas.height = size;
      const wCtx = weedCanvas.getContext('2d')!;

      const wGrad = wCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      wGrad.addColorStop(0, '#dcfce7');
      wGrad.addColorStop(0.4, '#22c55e');
      wGrad.addColorStop(0.8, '#15803d');
      wGrad.addColorStop(1, '#14532d');
      wCtx.fillStyle = wGrad;
      wCtx.beginPath();
      wCtx.arc(cx, cy, r, 0, Math.PI * 2);
      wCtx.fill();

      // Kelp spirals
      wCtx.strokeStyle = '#86efac';
      wCtx.lineWidth = 3;
      wCtx.beginPath();
      wCtx.moveTo(cx - r * 0.5, cy + r * 0.8);
      wCtx.quadraticCurveTo(cx - r * 0.1, cy, cx + r * 0.5, cy - r * 0.7);
      wCtx.stroke();

      scene.textures.addCanvas('bubble_SEAWEED', weedCanvas);
    }
  }

  private static drawTurtlePlates(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    // Center Hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = cx + Math.cos(a) * (radius * 0.45);
      const hy = cy + Math.sin(a) * (radius * 0.45);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    // Radiating boundary lines to rim
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = cx + Math.cos(a) * (radius * 0.45);
      const hy = cy + Math.sin(a) * (radius * 0.45);
      const rx = cx + Math.cos(a) * radius;
      const ry = cy + Math.sin(a) * radius;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    }
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
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const cx = 16;
    const cy = 16;
    const r = 12;

    // 1. Soft Ambient Pearl Halo
    const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r + 3);
    haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    haloGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.25)');
    haloGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.fill();

    // 2. Translucent Water Pearl Sphere Body
    const sphereGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 1, cx, cy, r);
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.85)');
    sphereGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.65)');
    sphereGrad.addColorStop(0.95, 'rgba(2, 132, 199, 0.8)');
    sphereGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 3. Specular Crescent Glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.32, cy - r * 0.32, r * 0.35, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
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

  private static generateAimReticle(scene: Phaser.Scene): void {
    const key = 'aim_reticle';
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const cx = 32;
    const cy = 32;

    // Glowing underwater caustic ring
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary inner ripple
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Ethereal pearl droplet nodes around the circle
    ctx.fillStyle = '#ffffff';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      const px = cx + Math.cos(a) * 22;
      const py = cy + Math.sin(a) * 22;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center radiant pearl glow
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)');
    coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    scene.textures.addCanvas(key, canvas);
  }

  private static generateShockwaveRing(scene: Phaser.Scene): void {
    const key = 'particle_ring';
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.stroke();

    scene.textures.addCanvas(key, canvas);
  }

  private static generateLauncherTextures(scene: Phaser.Scene): void {
    // 1. High-Tech Coral Rock Base with GIANT GLOWING FRONT PEARL (Mục 3: Máy bắn)
    if (!scene.textures.exists('launcher_base')) {
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = 160;
      baseCanvas.height = 120;
      const bCtx = baseCanvas.getContext('2d')!;
      const cx = 80;
      const cy = 60;

      // Deep Sea Coral Rocks and Submerged Shell Pedestal
      const rockGrad = bCtx.createRadialGradient(cx, cy + 12, 20, cx, cy + 12, 70);
      rockGrad.addColorStop(0, '#0c4a6e');
      rockGrad.addColorStop(0.5, '#075985');
      rockGrad.addColorStop(0.85, '#082f49');
      rockGrad.addColorStop(1, '#020617');

      bCtx.fillStyle = rockGrad;
      bCtx.beginPath();
      bCtx.ellipse(cx, cy + 14, 70, 40, 0, 0, Math.PI * 2);
      bCtx.fill();

      // Left & Right Vibrant Coral Foliage (Purple & Pink Fan Coral)
      bCtx.fillStyle = '#ec4899';
      bCtx.beginPath();
      bCtx.ellipse(cx - 56, cy + 6, 16, 26, -Math.PI / 6, 0, Math.PI * 2);
      bCtx.ellipse(cx + 56, cy + 6, 16, 26, Math.PI / 6, 0, Math.PI * 2);
      bCtx.fill();

      bCtx.fillStyle = '#a855f7';
      bCtx.beginPath();
      bCtx.ellipse(cx - 46, cy + 18, 14, 20, -Math.PI / 4, 0, Math.PI * 2);
      bCtx.ellipse(cx + 46, cy + 18, 14, 20, Math.PI / 4, 0, Math.PI * 2);
      bCtx.fill();

      // Golden Clamshell Throne Arms Holding the Cannon
      bCtx.strokeStyle = '#f59e0b';
      bCtx.lineWidth = 4;
      bCtx.beginPath();
      bCtx.arc(cx, cy, 50, Math.PI * 0.82, Math.PI * 2.18);
      bCtx.stroke();

      // Pearl Beads on the Golden Rim
      for (let i = 0; i < 8; i++) {
        const a = Math.PI * 0.9 + (i * Math.PI * 1.2) / 7;
        const bx = cx + Math.cos(a) * 50;
        const by = cy + Math.sin(a) * 50;
        bCtx.fillStyle = '#ffffff';
        bCtx.beginPath();
        bCtx.arc(bx, by, 3, 0, Math.PI * 2);
        bCtx.fill();
      }

      // GIANT GLOWING FRONT PEARL (Viên Đại Ngọc Trai Khổng Lồ Phát Quang)
      const pearlY = cy + 20;
      // Soft radiant pearl halo aura
      const haloGrad = bCtx.createRadialGradient(cx, pearlY, 10, cx, pearlY, 36);
      haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      haloGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.55)');
      haloGrad.addColorStop(0.75, 'rgba(253, 224, 71, 0.25)');
      haloGrad.addColorStop(1, 'transparent');
      bCtx.fillStyle = haloGrad;
      bCtx.beginPath();
      bCtx.arc(cx, pearlY, 36, 0, Math.PI * 2);
      bCtx.fill();

      // Pearl Sphere itself (Radius 21)
      const pGrad = bCtx.createRadialGradient(cx - 6, pearlY - 7, 2, cx, pearlY, 21);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.35, '#f0f9ff');
      pGrad.addColorStop(0.7, '#bae6fd');
      pGrad.addColorStop(0.9, '#7dd3fc');
      pGrad.addColorStop(1, '#0284c7');
      bCtx.fillStyle = pGrad;
      bCtx.beginPath();
      bCtx.arc(cx, pearlY, 20, 0, Math.PI * 2);
      bCtx.fill();

      // Pearl Specular Glint
      bCtx.fillStyle = '#ffffff';
      bCtx.beginPath();
      bCtx.ellipse(cx - 7, pearlY - 8, 7, 3.5, -Math.PI / 4, 0, Math.PI * 2);
      bCtx.fill();

      // Golden Clamshell Cushion at Base of the Pearl
      bCtx.strokeStyle = '#fef08a';
      bCtx.lineWidth = 3;
      bCtx.beginPath();
      bCtx.arc(cx, pearlY + 14, 16, 0, Math.PI);
      bCtx.stroke();

      scene.textures.addCanvas('launcher_base', baseCanvas);
    }

    // 2. Nautilus Pearl Coral Cannon Barrel with Golden Trim & Plasma Core
    if (!scene.textures.exists('launcher_barrel')) {
      const barrelCanvas = document.createElement('canvas');
      barrelCanvas.width = 90;
      barrelCanvas.height = 120;
      const ctx = barrelCanvas.getContext('2d')!;

      // Left & Right Iridescent Nautilus Shell Wings with Golden Trim
      const shellGrad = ctx.createLinearGradient(0, 0, 90, 0);
      shellGrad.addColorStop(0, '#0284c7');
      shellGrad.addColorStop(0.25, '#7dd3fc');
      shellGrad.addColorStop(0.5, '#fef08a');
      shellGrad.addColorStop(0.75, '#7dd3fc');
      shellGrad.addColorStop(1, '#0284c7');

      ctx.fillStyle = shellGrad;
      ctx.beginPath();
      ctx.moveTo(16, 105);
      ctx.quadraticCurveTo(20, 55, 34, 22);
      ctx.lineTo(40, 16);
      ctx.lineTo(50, 16);
      ctx.lineTo(56, 22);
      ctx.quadraticCurveTo(70, 55, 74, 105);
      ctx.closePath();
      ctx.fill();

      // Golden Filigree Edges
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pearlescent Shell Ribs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.8;
      for (let y = 35; y < 95; y += 15) {
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.lineTo(38, y - 5);
        ctx.moveTo(66, y);
        ctx.lineTo(52, y - 5);
        ctx.stroke();
      }

      // Center Magical Ocean Water Plasma Column
      const waterGrad = ctx.createLinearGradient(0, 18, 0, 105);
      waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
      waterGrad.addColorStop(0.4, 'rgba(14, 165, 233, 0.85)');
      waterGrad.addColorStop(0.8, 'rgba(3, 105, 161, 0.9)');
      waterGrad.addColorStop(1, 'rgba(8, 47, 73, 0.95)');

      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.roundRect(35, 20, 20, 88, 10);
      ctx.fill();

      // Floating Water Plasma Orb inside the barrel
      const orbGrad = ctx.createRadialGradient(45, 55, 2, 45, 55, 16);
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)');
      orbGrad.addColorStop(1, 'rgba(3, 105, 161, 0.2)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(45, 55, 14, 0, Math.PI * 2);
      ctx.fill();

      // Cannon Muzzle Pearl Ring
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.ellipse(45, 18, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      scene.textures.addCanvas('launcher_barrel', barrelCanvas);
    }

    // 3. Floating Pearl Clam Shell Dock
    if (!scene.textures.exists('reserve_dock')) {
      const dockCanvas = document.createElement('canvas');
      dockCanvas.width = 90;
      dockCanvas.height = 90;
      const dCtx = dockCanvas.getContext('2d')!;
      const cx = 45;
      const cy = 45;

      // Outer Clamshell Iridescent Gradient
      const clamGrad = dCtx.createRadialGradient(cx, cy, 15, cx, cy, 42);
      clamGrad.addColorStop(0, 'rgba(8, 47, 73, 0.9)');
      clamGrad.addColorStop(0.5, 'rgba(3, 105, 161, 0.85)');
      clamGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.5)');
      clamGrad.addColorStop(1, 'rgba(253, 224, 71, 0.4)');

      dCtx.fillStyle = clamGrad;
      dCtx.beginPath();
      dCtx.arc(cx, cy, 40, 0, Math.PI * 2);
      dCtx.fill();

      // Clamshell fan ridges
      dCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      dCtx.lineWidth = 1.8;
      for (let a = -Math.PI * 0.75; a <= -Math.PI * 0.25; a += Math.PI * 0.1) {
        dCtx.beginPath();
        dCtx.moveTo(cx, cy + 25);
        dCtx.lineTo(cx + Math.cos(a) * 38, cy + Math.sin(a) * 38);
        dCtx.stroke();
      }

      // Neon Pearl Aura Ring
      dCtx.shadowColor = '#38bdf8';
      dCtx.shadowBlur = 10;
      dCtx.strokeStyle = '#38bdf8';
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
      this.drawDiamondStarGlyph(sCtx, 15, 15, 14, 4, '#38bdf8');
      scene.textures.addCanvas('wall_spark', sparkCanvas);
    }
  }

  private static generateWaterBubbleTextures(scene: Phaser.Scene): void {
    if (!scene.textures.exists('water_bubble')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      const cx = 16;
      const cy = 16;
      const r = 13;

      ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      ctx.shadowBlur = 6;

      const grad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.5, 'rgba(125, 211, 252, 0.25)');
      grad.addColorStop(0.85, 'rgba(14, 165, 233, 0.45)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.75)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight crescent
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Secondary tiny reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(cx + 4, cy + 5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('water_bubble', canvas);
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
    const rot = (Math.PI / 2) * 3;
    const step = (Math.PI * 2) / spikes;

    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < spikes; i++) {
      const tipAngle = rot + i * step;
      const innerAngle = tipAngle + step / 2;
      
      const tipX = cx + Math.cos(tipAngle) * outerRadius;
      const tipY = cy + Math.sin(tipAngle) * outerRadius;
      const inX = cx + Math.cos(innerAngle) * innerRadius;
      const inY = cy + Math.sin(innerAngle) * innerRadius;

      if (i === 0) {
        ctx.moveTo(tipX, tipY);
      }
      ctx.quadraticCurveTo(
        cx + Math.cos(tipAngle + step * 0.25) * (innerRadius * 1.3),
        cy + Math.sin(tipAngle + step * 0.25) * (innerRadius * 1.3),
        inX,
        inY
      );
      const nextTipAngle = tipAngle + step;
      const nextTipX = cx + Math.cos(nextTipAngle) * outerRadius;
      const nextTipY = cy + Math.sin(nextTipAngle) * outerRadius;
      ctx.quadraticCurveTo(
        cx + Math.cos(innerAngle + step * 0.25) * (innerRadius * 1.3),
        cy + Math.sin(innerAngle + step * 0.25) * (innerRadius * 1.3),
        nextTipX,
        nextTipY
      );
    }
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

  /**
   * Universal 3D Crystal Water Glass Sphere Overlay (Mục 1: Các loại Orb)
   * Double crescent specular reflection, glass rim refractive highlight, and effervescent bubbles.
   */
  public static applyCrystalWaterSphere(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number
  ): void {
    ctx.save();

    // 1. Refractive Glass Rim (Inner ambient stroke)
    const rimGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    rimGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.2)');
    rimGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
    rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Primary Curved Specular Highlight (Crescent glint at top-left)
    ctx.save();
    ctx.translate(cx - r * 0.32, cy - r * 0.36);
    ctx.rotate(-Math.PI / 4.2);
    const specGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.42);
    specGrad.addColorStop(0, '#ffffff');
    specGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.75)');
    specGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
    specGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.42, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Secondary subtle rim reflection at bottom-right
    const btmGrad = ctx.createRadialGradient(cx + r * 0.35, cy + r * 0.35, 0, cx + r * 0.35, cy + r * 0.35, r * 0.35);
    btmGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    btmGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
    btmGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = btmGrad;
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.32, cy + r * 0.32, r * 0.35, r * 0.14, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 4. Micro effervescent water bubbles floating inside
    const bubbles = [
      { x: cx - r * 0.52, y: cy - r * 0.15, rad: 2.2 },
      { x: cx - r * 0.38, y: cy + r * 0.48, rad: 1.8 },
      { x: cx + r * 0.45, y: cy - r * 0.42, rad: 2.0 },
      { x: cx + r * 0.55, y: cy + r * 0.25, rad: 1.5 }
    ];
    bubbles.forEach(b => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    ctx.restore();
  }

  /**
   * ORB: WHIRLPOOL (Xoáy Nước - Mục 2: Orb Đặc Biệt)
   * Deep oceanic cyan/teal vortex with swirling water spiral arms, center luminous eye.
   */
  private static generateWhirlpoolOrb(scene: Phaser.Scene, size: number): void {
    const keys = ['bubble_WHIRLPOOL'];
    if (scene.textures.exists(keys[0])) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Deep Oceanic Blue/Cyan Vortex Base
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    bgGrad.addColorStop(0, '#e0f2fe');
    bgGrad.addColorStop(0.25, '#38bdf8');
    bgGrad.addColorStop(0.65, '#0284c7');
    bgGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Swirling Water Vortex Spiral Arms (Xoáy nước cuộn)
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    for (let arm = 0; arm < 4; arm++) {
      const baseAngle = (arm * Math.PI) / 2;
      ctx.strokeStyle = arm % 2 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(56, 189, 248, 0.9)';
      ctx.beginPath();
      for (let t = 0; t <= 1.2 * Math.PI; t += 0.1) {
        const radius = (r * 0.15) + (t / (1.2 * Math.PI)) * (r * 0.68);
        const a = baseAngle + t;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 3. Central Luminous Whirlpool Eye
    const eyeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.22);
    eyeGrad.addColorStop(0, '#ffffff');
    eyeGrad.addColorStop(0.5, '#7dd3fc');
    eyeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 4. Glass Sphere Shell
    this.applyCrystalWaterSphere(ctx, cx, cy, r);

    keys.forEach(k => scene.textures.addCanvas(k, canvas));
  }

  /**
   * KHOANG CHỨA ORB (CURRENT) (Mục 4: Khoang chứa Orb)
   * Royal golden crown frame at top, ornate gold filigree bezel ring, bottom glowing pearl, coral flanks.
   */
  private static generateCurrentChamberFrame(scene: Phaser.Scene): void {
    if (scene.textures.exists('current_orb_frame')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 130;
    canvas.height = 130;
    const ctx = canvas.getContext('2d')!;
    const cx = 65;
    const cy = 65;
    const r = 46;

    // 1. Coral Accents on Left & Right Flanks
    ctx.fillStyle = '#f43f5e';
    // Left coral sprig
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.85, cy + r * 0.4);
    ctx.quadraticCurveTo(cx - r * 1.25, cy + r * 0.2, cx - r * 1.15, cy - r * 0.15);
    ctx.quadraticCurveTo(cx - r * 1.05, cy + r * 0.1, cx - r * 0.8, cy + r * 0.2);
    ctx.fill();
    // Right coral sprig
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.85, cy + r * 0.4);
    ctx.quadraticCurveTo(cx + r * 1.25, cy + r * 0.2, cx + r * 1.15, cy - r * 0.15);
    ctx.quadraticCurveTo(cx + r * 1.05, cy + r * 0.1, cx + r * 0.8, cy + r * 0.2);
    ctx.fill();

    // Teal coral accents
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.95, cy + r * 0.55, 8, 14, -Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.95, cy + r * 0.55, 8, 14, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Heavy Royal Golden Bezel Ring
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 12;
    const goldGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.3, '#f59e0b');
    goldGrad.addColorStop(0.7, '#d97706');
    goldGrad.addColorStop(1, '#78350f');

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bevel ring
    ctx.strokeStyle = '#fef9c3';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // 3. Royal Golden Crown at the Top
    const crownY = cy - r - 4;
    ctx.fillStyle = goldGrad;
    ctx.strokeStyle = '#fef9c3';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 26, crownY + 10);
    ctx.lineTo(cx - 22, crownY - 15); // Left point
    ctx.lineTo(cx - 11, crownY - 4);
    ctx.lineTo(cx, crownY - 22);      // Center tallest point
    ctx.lineTo(cx + 11, crownY - 4);
    ctx.lineTo(cx + 22, crownY - 15); // Right point
    ctx.lineTo(cx + 26, crownY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crown Jewel (Center Ruby/Diamond)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, crownY - 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Large Glowing Pearl at Bottom Center
    const pearlY = cy + r + 4;
    const pearlGrad = ctx.createRadialGradient(cx - 2, pearlY - 2, 0, cx, pearlY, 10);
    pearlGrad.addColorStop(0, '#ffffff');
    pearlGrad.addColorStop(0.5, '#e0f2fe');
    pearlGrad.addColorStop(0.85, '#bae6fd');
    pearlGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = pearlGrad;
    ctx.beginPath();
    ctx.arc(cx, pearlY, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    scene.textures.addCanvas('current_orb_frame', canvas);
  }

  /**
   * NEXT ORB POD (Mục 5: Next Orb Pod)
   * Golden shield teardrop pod with prominent "NEXT" header banner plaque, bottom golden finial jewel.
   */
  private static generateNextOrbPod(scene: Phaser.Scene): void {
    if (scene.textures.exists('next_orb_pod')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 110;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;
    const cx = 55;
    const cy = 60;
    const r = 36;

    // 1. Golden Heraldic Teardrop Body
    const goldGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.3, '#f59e0b');
    goldGrad.addColorStop(0.7, '#d97706');
    goldGrad.addColorStop(1, '#78350f');

    // Outer shield rim
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 5.5;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.55)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // 2. Bottom Golden Finial Point
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + r - 2);
    ctx.lineTo(cx, cy + r + 20);
    ctx.lineTo(cx + 12, cy + r - 2);
    ctx.closePath();
    ctx.fill();

    // Turquoise Jewel at bottom
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy + r + 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Top "NEXT" Header Banner
    const bannerY = cy - r - 8;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(cx - 28, bannerY - 13, 56, 20, 7);
    ctx.fill();
    ctx.stroke();

    // "NEXT" text
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 11px Outfit, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEXT', cx, bannerY - 3);

    scene.textures.addCanvas('next_orb_pod', canvas);
  }

  /**
   * MISS METER POD (Thanh hiển thị số lần bắn hụt - Reference A)
   * Ornate golden capsule with "MISS" header plaque and coral wings, positioned right of cannon.
   */
  private static generateMissMeterPod(scene: Phaser.Scene): void {
    if (scene.textures.exists('miss_meter_pod')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 110;
    canvas.height = 70;
    const ctx = canvas.getContext('2d')!;
    const cx = 55;
    const cy = 42;

    // 1. Coral foliage wings on left & right
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.ellipse(cx - 42, cy + 6, 8, 14, -Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(cx + 42, cy + 6, 8, 14, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Ornate Golden Capsule Frame
    const goldGrad = ctx.createLinearGradient(cx - 40, cy - 16, cx + 40, cy + 16);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.3, '#f59e0b');
    goldGrad.addColorStop(0.7, '#d97706');
    goldGrad.addColorStop(1, '#78350f');

    // Outer gold border
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(cx - 40, cy - 16, 80, 32, 16);
    ctx.stroke();

    // Dark Blue Inner Well
    ctx.shadowColor = 'transparent';
    const wellGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 38);
    wellGrad.addColorStop(0, '#0f172a');
    wellGrad.addColorStop(0.7, '#020617');
    wellGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = wellGrad;
    ctx.beginPath();
    ctx.roundRect(cx - 38, cy - 14, 76, 28, 14);
    ctx.fill();

    // 3. Top "MISS" Banner Plaque
    const bannerY = cy - 20;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 24, bannerY - 10, 48, 16, 6);
    ctx.fill();
    ctx.stroke();

    // "MISS" Text
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 9.5px Outfit, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MISS', cx, bannerY - 2);

    scene.textures.addCanvas('miss_meter_pod', canvas);

    // Active & Empty Miss Beads
    if (!scene.textures.exists('miss_bead_active')) {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 20;
      bCanvas.height = 20;
      const bCtx = bCanvas.getContext('2d')!;
      // Glowing Pink/Red Pearl Bead
      const bGrad = bCtx.createRadialGradient(8, 8, 1, 10, 10, 8);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.35, '#f43f5e');
      bGrad.addColorStop(0.85, '#be123c');
      bGrad.addColorStop(1, '#881337');
      bCtx.fillStyle = bGrad;
      bCtx.beginPath();
      bCtx.arc(10, 10, 7.5, 0, Math.PI * 2);
      bCtx.fill();
      // Specular glint
      bCtx.fillStyle = '#ffffff';
      bCtx.beginPath();
      bCtx.arc(8, 7, 2, 0, Math.PI * 2);
      bCtx.fill();
      scene.textures.addCanvas('miss_bead_active', bCanvas);
    }

    if (!scene.textures.exists('miss_bead_empty')) {
      const eCanvas = document.createElement('canvas');
      eCanvas.width = 20;
      eCanvas.height = 20;
      const eCtx = eCanvas.getContext('2d')!;
      // Dark sunken socket
      eCtx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      eCtx.beginPath();
      eCtx.arc(10, 10, 6.5, 0, Math.PI * 2);
      eCtx.fill();
      eCtx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      eCtx.lineWidth = 1.2;
      eCtx.stroke();
      scene.textures.addCanvas('miss_bead_empty', eCanvas);
    }
  }

  /**
   * POWER-UP ICONS (Mục 7: Power-up)
   * 3 golden-bezeled circular badges: Bomb (Cua), Lightning (Sét), Whirlpool (Xoáy nước).
   */
  private static generatePowerupIcons(scene: Phaser.Scene): void {
    const powerups = [
      { key: 'powerup_bomb', color: '#ef4444', glyph: 'bomb' },
      { key: 'powerup_lightning', color: '#f59e0b', glyph: 'lightning' },
      { key: 'powerup_whirlpool', color: '#06b6d4', glyph: 'whirlpool' }
    ];

    powerups.forEach(p => {
      if (scene.textures.exists(p.key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const cx = 32;
      const cy = 32;
      const r = 26;

      // Base background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.8, '#020617');
      bgGrad.addColorStop(1, p.color);
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Golden Bezel
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glyphs
      if (p.glyph === 'bomb') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy + 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 8, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.glyph === 'lightning') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(cx + 2, cy - 14);
        ctx.lineTo(cx - 8, cy);
        ctx.lineTo(cx + 1, cy);
        ctx.lineTo(cx - 3, cy + 14);
        ctx.lineTo(cx + 9, cy - 2);
        ctx.lineTo(cx, cy - 2);
        ctx.closePath();
        ctx.fill();
      } else if (p.glyph === 'whirlpool') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2.5; a += 0.2) {
          const rad = 3 + a * 3.5;
          const x = cx + Math.cos(a) * rad;
          const y = cy + Math.sin(a) * rad;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      scene.textures.addCanvas(p.key, canvas);
    });
  }
}
