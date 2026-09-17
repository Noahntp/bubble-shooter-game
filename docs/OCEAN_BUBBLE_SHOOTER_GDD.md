# 🌊 OCEAN BUBBLE SHOOTER — GAME DESIGN DOCUMENT (GDD)
**Document Version:** 2.0.0 Commercial Master  
**Lead Roles:** Senior Game UI/UX Designer • 3D Game Artist • Gameplay Designer • Technical Game Designer  
**Platform Target:** Mobile First (iOS / Android / Responsive Mobile Web: 375x667 to 430x932, Tablet 768x1024)  
**Core Visual Theme:** Premium Stylized 3D Underwater Fantasy  
**Performance Budget:** Solid 60 FPS on mid-tier mobile hardware  

---

## 1. EXECUTIVE SUMMARY & GAMEPLAY LOOP

### 1.1 Core Value Proposition
*Ocean Bubble Shooter* re-imagines classic hexagonal puzzle bubble shooting through the lens of a **high-end, commercial mobile title**. It discards childish cartoon clichés and neon clutter in favor of:
- **Depth & Sophistication:** Translucent caustics, volumetric god rays, bioluminescent glows, and organic ocean physics.
- **Immediate Readability:** Distinct silhouettes, high-contrast primary hues, and zero visual ambiguity even at 32px diameter on mobile screens.
- **Dynamic Tactical Depth:** 8 Marine creature orbs, destructible environment obstacles, a Shark Boss encounter, and satisfying cascade chain reactions.

### 1.2 Core Gameplay Loop
```
                      ┌─────────────────────────────────┐
                      │        PHASE 1: OBSERVE         │
                      │  Scan Hex Grid, Identify Match  │
                      │  Clusters, Shields & Obstacles  │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │      PHASE 2: AIM & TACTICS     │
                      │ Touch Drag -> Trajectory Raycast │
                      │  Wall Bounce & Reticle Feedback │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │       PHASE 3: SHOOT & HIT      │
                      │ Recoil Kickback -> Bubble Travel│
                      │ Smooth Snapping into Hex Grid   │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │     PHASE 4: RESOLVE & CASCADE  │
                      │  Cluster Match >= 3 Explodes    │
                      │  Special Orbs Trigger Effects   │
                      │ Floating Orphan Groups Plunge   │
                      │ Combo Multiplier x2, x3, x4, x5+│
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │     PHASE 5: PROGRESSION        │
                      │  Star Milestones, Level Cleared │
                      │  Tidal Warning / Boss Advance   │
                      └─────────────────────────────────┘
```

---

## 2. VISUAL DIRECTION & ART SPECIFICATION

### 2.1 Aesthetic Pillars
| Attribute | What We DO | What We NEVER Do |
| :--- | :--- | :--- |
| **Materiality** | 3D Stylized glass, pearl lustre, organic shell ribs, translucent jellies. | Flat flat-shaded vector art, cheap gradients, emoji stickers. |
| **Lighting** | Cinematic caustics, soft directional god rays, volumetric underwater haze. | Blinding neon lines, harsh saturated monochrome flood lights. |
| **Tone** | Mysterious, tranquil yet electrifying fantasy aquarium (Atlantis meets NatGeo). | Toddler / 3-year-old nursery rhymes, simplistic smiley faces. |
| **Palette** | Deep Navy (`#03091e`), Cyan (`#00e5ff`), Emerald (`#10b981`), Coral (`#f97316`), Royal Purple (`#a855f7`), Pearl Gold (`#fbbf24`). | Acid green, neon magenta, low-contrast pastel muddiness. |

### 2.2 Deep Ocean Environmental Layering
1. **Layer 0 (Deep Ocean Infinite Abyss):**
   - Deep gradient `#020617` to `#082f49`.
   - Subtle animated god-ray light shafts penetrating from surface water.
   - Drifting shadow silhouettes of celestial blue whales and manta rays in far background.
2. **Layer 1 (Mid-Ground Sanctuary):**
   - Translucent living coral reefs, sea anemones, bioluminescent algae.
   - Drifting ambient micro-plankton and floating marine dust (subtle particle depth).
3. **Layer 2 (Gameplay Playfield Arena):**
   - Glassmorphic translucent playfield backdrop (`rgba(6, 15, 38, 0.45)`) preserving 100% color contrast for orbs.
   - Water caustics projected across the playfield with smooth sinusoidal UV distortion.
4. **Layer 3 (Foreground Accent):**
   - Subtle swaying deep-sea kelp at bottom flanks (outside touch zones).
   - Continuous rising oxygen bubble columns (`water_bubble`) with staggered speeds.

---

## 3. THE 8 OCEAN ORB ROSTER

Each orb is crafted with a **unique silhouette**, **tactile 3D volume**, and **instant mobile readability**.

```
  🐡 PUFFERFISH      🪼 JELLYFISH       🐢 SEA TURTLE      ⭐ STARFISH
  (Normal Orb)       (Wild Orb)         (Shield Orb)       (Bonus Orb)
  [Base Colors]     [Rainbow Glow]     [Double Durability] [Score Boost]

  🦀 CRAB            🦑 SQUID           🐙 OCTOPUS         🦈 SHARK
  (Bomb Orb)        (Control / Ink)    (Chain Reaction)   (Boss / Titan)
  [3x3 AoE Blast]   [Column / Slow]    [Global Color Beam] [Multi-Hit HP]
```

### 3.1 ORB 01 — PUFFERFISH (Normal Color Orbs)
- **Role:** Core matching unit. Appears in 5 distinct jewel tones: Cyan Blue, Deep Coral, Marine Green, Amber Gold, Violet Purple.
- **Stylized Silhouette:** Perfectly spherical puffer with small glossy dorsal fins, soft translucent spines, and refined crystalline eyes.
- **Materials:** High gloss spherical gradient, inner caustic glow, specular crescent reflection.
- **Animations:**
  - *Idle:* Subtle breathing oscillation (scale 0.98 to 1.02 over 1.8s).
  - *Shoot:* Smooth axial spin with micro water droplet trail.
  - *Impact:* Squash & stretch (`scaleX: 1.15, scaleY: 0.88` -> spring back).
  - *Pop:* Burst into 6 crystalline water droplets and vanishing bubble ripple.

### 3.2 ORB 02 — JELLYFISH (Wild Orb)
- **Role:** Universal Wild. Substitutes for any color in neighbor clusters.
- **Stylized Silhouette:** Translucent bell umbrella with 4 pulsing bioluminescent tentacles beneath.
- **Materials:** Subsurface scattering membrane, iridescent rainbow core, soft cyan-magenta rim glow.
- **Animations:**
  - *Idle:* Rhythmic jellyfish swimming pulse (expands bell, gathers tentacles).
  - *Activate:* Glow intensity pulses to 1.3x, connects bio-plasma tendrils to all adjacent color orbs.

### 3.3 ORB 03 — SEA TURTLE (Shield Orb)
- **Role:** Defensive Heavy Unit. Requires 2 hits to eliminate.
- **Stylized Silhouette:** Spherical emerald/teal carapace with hexagonal shell engravings and a protective energy bubble mantle.
- **Mechanics:**
  - *Hit 1:* Energy shield shatters with glass-crack VFX; carapace darkens to vulnerable state.
  - *Hit 2:* Turtle shell dissolves into emerald shell fragments and water ripples.

### 3.4 ORB 04 — STARFISH (Bonus Orb)
- **Role:** High Score & Combo Accelerator.
- **Stylized Silhouette:** 5-pointed curved starfish wrapping gently around a luminous golden pearl core.
- **Mechanics:**
  - When popped, awards **500 Base Pts x Current Combo Multiplier**.
  - Emits 8 golden spiraling star particles that fly toward the score counter on the HUD.

### 3.5 ORB 05 — CRAB (Bomb Orb)
- **Role:** Area-of-Effect Explosive.
- **Stylized Silhouette:** Vibrant fiery coral carapace with distinct raised pincers and glowing magma-water core.
- **Mechanics:**
  - Detonation radius: 1.8 grid units (destroys all surrounding orbs within 3x3 hex perimeter).
  - VFX: High-velocity water shockwave ring, coral debris particles, screen shake (2.5px for 180ms).

### 3.6 ORB 06 — SQUID (Control / Ink Orb)
- **Role:** Tactical Disrupter & Column Piercer.
- **Stylized Silhouette:** Sleek deep-purple mantle with coiled tentacles and glowing dark-indigo ink sac.
- **Mechanics:**
  - Emits a vertical bio-luminescent ink jet that vaporizes an entire column of orbs and softens rock obstacles.
  - VFX: Swirling purple vortex and trailing ink mist.

### 3.7 ORB 07 — OCTOPUS (Chain Reaction Orb)
- **Role:** Strategic Board Sweeper.
- **Stylized Silhouette:** Royal purple octopus wrapping suction-cup tentacles around an electric teal power orb.
- **Mechanics:**
  - When destroyed, projects lightning-fast bio-energy tentacles to **ALL matching orbs of the dominant color currently on the board**, triggering an cascading chain pop.
  - VFX: Electric tendrils striking targets in staggered 60ms succession.

### 3.8 ORB 08 — SHARK (Special Titan / Boss Orb)
- **Role:** Boss Encounter (Levels 5, 10, and Special Deep Abyss stages).
- **Stylized Silhouette:** Imposing metallic blue-gray predator form with glowing amber eye, hydrodynamic dorsal fin, and armored pearl jaw.
- **Mechanics:**
  - Occupies a 2x2 hex footprint with dedicated Boss HP Bar (3 to 5 hits).
  - Periodic threat: Thrashes tail every 3 player shots, spawning 2 armored rock shells on the board.
  - Defeat: Cinematic time-dilation, massive tidal vortex collapse, +5,000 score bonus, and shower of golden starfish pearls.

---

## 4. SPECIAL OBSTACLES & TERRAIN

| Obstacle | Visual Representation | Destruction Rule |
| :--- | :--- | :--- |
| **🪨 Basalt Rock** | Dark volcanic basalt with embedded barnacles | Immune to normal matches; destroyed only by Crab Bomb, Lightning Eel, or falling as an orphan group. |
| **🧊 Ice Coral** | Frosty crystalline coral casing frozen over an orb | Requires 2 adjacent pops or 1 fire bomb hit to thaw the frozen creature within. |
| **🫧 Bubble Cage** | Thick translucent pearl bubble trapping an orb | Match adjacent orbs once to pop the cage and free the trapped orb into active play. |
| **🌿 Ancient Seaweed** | Thick swaying emerald kelp wrapping hex sockets | Deflects non-piercing shots; cleared when any adjacent cluster pops. |
| **💎 Abyss Crystal** | Multi-faceted prismatic gem | Indestructible; reflects ricochets at perfect specular angles and grants +1000 pts when dropped into abyss. |

---

## 5. POWER-UP ARSENAL

Players can charge or equip up to 3 active power-ups in the bottom dock:
1. **Pearl Bomb:** Hand-crafted explosive pearl clearing a massive 3-row crater.
2. **Lightning Eel:** Pierces straight through bubbles in a direct laser beam trajectory.
3. **Whirlpool Vortex:** Drops an aquatic vortex at target position, sucking in the 7 nearest orbs regardless of color.
4. **Poseidon Trident:** Fires 3 spread projectiles simultaneously across left, center, and right angles.
5. **Arctic Freeze:** Freezes board advance and danger line descent for 3 turns.
6. **Golden Pearl:** Doubled score multiplier and guarantees next 3 matches become Starfish bonus pops.

---

## 6. SHOOTER & AIMING MECHANICS (THE PEARL CANNON)

### 6.1 Mechanical Concept
An ancient Atlantean bio-mechanical artifact anchored to a living coral turntable:
- **Base:** Iridescent spiral turntable with 12 luminous pearl beads indicating power charge.
- **Barrel:** Carved Nautilus shell cannon lined with bio-luminescent fiber optics.
- **Chamber:** Translucent water dome showing the current active creature orb, floating with idle buoyancy.
- **Reserve Shell Dock:** Left-flank pearl clam displaying the queued next orb. Tap or Spacebar swaps smoothly in 150ms.

### 6.2 Aiming & Trajectory Physics
- **Raycast Prediction:** Precise vector physics raycasting from `(SHOOTER_X, SHOOTER_Y)`.
- **Specular Wall Bouncing:** Accurate angle reflection off left and right wall boundaries.
- **Impact Reticle:** Dual-ring rotating reticle at the exact hex socket where the orb will lodge.
- **Dynamic Color Sync:** Aim guide laser dots and reticle glow precisely match the tint of the current projectile orb.
- **Dead-Zone Filtering:** Downward drags (below -13° or above horizontal) automatically hide the aim line to avoid misfires.

---

## 7. MOBILE UI/UX & RESPONSIVE DESIGN SYSTEM

### 7.1 Viewport Breakpoints & Safe Areas
```
Mobile Portrait (375 - 430px wide):
┌───────────────────────────────────────┐
│ [Notch / Dynamic Island Safe Area]    │  <- 44px top margin
├───────────────────────────────────────┤
│ Top HUD Console (Hearts, Score, Menu) │  <- 56px height
├───────────────────────────────────────┤
│ Star Threshold Liquid Meter           │  <- 8px height
├───────────────────────────────────────┤
│                                       │
│          HEXAGONAL ARENA              │
│       (Auto-scaling Grid)             │
│                                       │
├───────────────────────────────────────┤
│ ⚠ Vạch Thủy Triều Dâng (Danger Line)  │
├───────────────────────────────────────┤
│ Pearl Cannon & Power-up Quick Bar     │  <- 120px interactive zone
│ [Clam Swap]     [SHOOTER]    [Power]  │
├───────────────────────────────────────┤
│ [Home Bar / Android Navigation Area]  │  <- 24px bottom buffer
└───────────────────────────────────────┘
```

### 7.2 Touch Target Standards
- All interactive controls conform to a minimum **48x48 CSS pixel hit area**.
- Modals utilize consistent **20px internal padding** and equal 50px primary action buttons.
- Haptic & visual feedback on all pointer events (scale punch `0.95` on press, smooth spring return).

---

## 8. AUDIO & SOUND DESIGN ARCHITECTURE

The sound palette leverages the Web Audio API with procedural synthesizing and pristine spatial effects:
1. **Ambience:** Low-frequency oceanic whale rumble (45Hz - 120Hz) with gentle water caustics wave sound.
2. **Cannon Shoot:** Wet suction "thwip-whoosh" followed by a crystal release chime.
3. **Wall Ricochet:** High-frequency glass droplet ping.
4. **Match Pop:** Ascending pentatonic crystal notes (`C5, D5, E5, G5, A5`) that pitch-shift higher with each consecutive combo step (Combo x2 -> x3 -> x4 -> x5).
5. **Crab Explosion:** Deep underwater sonic boom with rolling bubble fizzle.
6. **Shark Boss:** Low brass warhorn rumble followed by intense orchestral percussion.

---

## 9. TECHNICAL & PERFORMANCE ARCHITECTURE

### 9.1 Core Architectural Principles
- **Strict Separation of Concerns:**
  - `Phaser 3`: 60 FPS deterministic game loop, hex grid calculations, physics raycasting, particle systems.
  - `React 19`: Declarative HUD, Modal overlays, responsive mobile viewport wrappers, profile & progression state.
  - `EventBridge`: Decoupled, typed bi-directional communication bus.
- **Zero-Garbage Collection (GC) Game Loop:**
  - `Object Pooling`: Bullets, collision particles, bubble sprites, and score popups are recycled from pre-allocated pools.
  - `Texture Atlasing`: All marine orbs and creature textures are procedurally baked onto high-resolution off-screen canvases during boot, with zero runtime texture churn.
- **Config-Driven Gameplay Balance:**
  - All constants (`MATCH_COUNT = 3`, `ORB_SPEED = 1400`, `CRAB_RADIUS = 1.8`, `SHIELD_HP = 2`, `COMBO_EXPONENT = 1.5`) reside in `src/game/constants.ts` and `LevelConfig`, preventing hardcoded magic numbers.

---

## 10. PROGRESSION & LEVEL DESIGN MATRIX

The game features 10 handcrafted ocean wonder zones, introducing mechanics gradually:
1. **Level 1 — Rạn San Hô Xanh:** Basic Pufferfish matching, wall ricochets.
2. **Level 2 — Hang Ngọc Trai:** Introduction of Wild Jellyfish.
3. **Level 3 — Vịnh Cá Voi Sao:** Starfish Bonus Orbs & Combo multiplier training.
4. **Level 4 — Rừng Tảo Dạ Quang:** Seaweed obstacle & narrow aiming corridors.
5. **Level 5 — Rãnh Biển Mariana (Boss):** Mini Shark Boss encounter with armored skin.
6. **Level 6 — Vườn Sứa Biển Sâu:** Cluster of Jellyfish & Crab Bomb chain reactions.
7. **Level 7 — Hang Kho Báu Đắm:** Bubble Cages trapping high-value pearls.
8. **Level 8 — Đảo Thủy Quái Kraken:** Squid Inking & Octopus global chain orbs.
9. **Level 9 — Vực Xoáy Thủy Tề:** Moving current obstacles & Ice Coral formations.
10. **Level 10 — Cung Điện Atlantis (Final Titan):** Full Titan Shark Boss with multi-phase attacks and tidal surge line.

---
*Approved for Production Implementation.*
