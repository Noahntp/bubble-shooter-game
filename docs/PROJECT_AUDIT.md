# 🌊 PROJECT AUDIT — OCEAN PEARL SHOOTER
**Audit Date:** 2026-09-17  
**Auditor Roles:** Game Director, Technical Director, Senior Mobile UI/UX Designer, Art Director  
**Target Benchmark:** Commercial Quality Mobile Casual Puzzle Title (King, Rovio, Playrix, Voodoo standard)

---

## 1. EXECUTIVE SUMMARY

The current project represents a functional **technology prototype** with solid underlying math (hexagonal staggered coordinate system, raycast reflection, event bridge, and deterministic turn resolution). However, from a **commercial game product** standpoint, it suffers from severe aesthetic, UX, and architectural debts that immediately reveal its origins as an engineer's demo.

### High-Priority Flaws Identified
1. **Prototype Visual Artifacts:**
   - **Industrial Hazard Chevrons on Ceiling:** Hardcoded yellow-black construction warning stripes across the top ceiling beam. This is completely immersion-breaking in an ancient deep-sea underwater fantasy setting.
   - **Rigid Rectangular Container:** The playfield is rendered as a sharp rectangular CSS/Phaser card box with dark borders, instead of organically blending into the boundless ocean depths.
   - **Arcade Neon Rails:** The left and right playfield walls feature hardcoded neon blue mechanical rails with glowing dots, which look like a retro cyber-arcade machine rather than coral reef boundaries.
   - **Debug Trajectory Dots:** Aim guide renders 14 discrete, un-feathered circular dots and a rotating mechanical reticle that feels like a physics debugging visualizer.
   - **Developer Overlays:** `DebugOverlay.tsx` is mounted directly in the gameplay hierarchy, exposing raw frame stats, board occupancy percentages, and debug controls to end users.

2. **UI Clutter & Hierarchy Inversion:**
   - **Top HUD Overload:** Too many competing elements (Level pill, Title, Score, Target score, Phone badge, Combo badge, Ammo canister, QR code button, Mute button, Pause button, Star checkpoint bar, and Boss HP bar) crammed into a single header.
   - **Missing Game Mission / Objective System:** Levels only display a generic target score rather than tangible player objectives (e.g. "Free 4 Jellyfish", "Defeat Shark Boss", "Clear 24 Coral Pearls").
   - **Bottom Launcher Ergonomics:** The bottom bar has floating text buttons ("Đổi ngọc Space") that obstruct vertical screen space and fail mobile one-hand thumb zones.

3. **Rendering & Aesthetic Deficits:**
   - **Lack of Environmental Depth:** The ocean background is a single static texture with CSS blur rather than a living, breathing multi-layered ecosystem with swimming marine life, volumetric god rays, and organic ambient caustics.
   - **Creature Orbs Need Tactile Juiciness:** While procedural 2D canvases were added, they lack dynamic squash-and-stretch on impact, idle breathing physics, and distinctive particle trails when launched.

4. **Audio & Game Feel:**
   - Sound synthesis in `AudioManager` lacks pitch variation on rapid consecutive pops, causing ear fatigue during multi-bubble cascade clears.
   - Absence of subtle camera impact shake on high combos or heavy bomb detonations.

---

## 2. DETAILED SUBSYSTEM AUDIT

### 2.1 Architecture & Code Cleanliness
| File / Module | Current State | Defect / Technical Debt | Action Required |
| :--- | :--- | :--- | :--- |
| `src/game/GameScene.ts` | 993 lines. Monolithic renderer combining board chrome, event listeners, input polling, and camera orchestration. | Contains hardcoded industrial ceiling chevrons, mechanical neon rails, and rectangular container fills. | Strip out all arcade/industrial graphics; replace with seamless ocean ambient environment. |
| `src/game/ShooterManager.ts` | 311 lines. Handles cannon rotation, recoil, and orb swap. | Labels cannon as "Futuristic Plasma Cannon" rather than Ancient Pearl Cannon; reload animation is abrupt. | Refactor into Ancient Pearl Cannon with Pearl, Coral, Metal, Glass materials and multi-stage animations. |
| `src/game/AimGuide.ts` | 202 lines. Dotted raycast with rotating reticle. | Trajectory dots look like a physics debug visualization; harsh fade. | Redesign into an elegant, subtle bioluminescent light stream that gently attenuates and reflects cleanly. |
| `src/components/HUD.tsx` | 210 lines. Crammed arcade dashboard. | Violates "Gameplay First" rule: over-decorated with small badges and developer numbers. | Redesign with clear visual hierarchy: Top bar (Back, Mission Objective, Star Progress, Score, Settings/Pause). |
| `src/components/GameShell.tsx` | 406 lines. Includes `DebugOverlay`. | Contains `DebugOverlay` in production view; multiple modal flow flags. | Remove debug overlay; ensure viewport flex fills screen without boxed margins on mobile. |
| `src/levels/levelData.ts` | 230 lines. 10 levels with basic spawn rates. | Levels lack distinct World progression and specific Mission Objectives. | Group into 5 Ocean Worlds (Coral Reef, Sunken Ship, Pearl Cave, Deep Ocean, Abyss) with clear Mission Objectives. |
| `src/audio/AudioManager.ts` | 355 lines. Web Audio API synthesizer. | Monotone frequencies on repetitive triggers; lacks pitch ramping for consecutive combo steps. | Add pentatonic pitch micro-scaling (`Math.pow(1.059, combo)`) and acoustic variety. |

### 2.2 Mobile UX & Responsive Touch Targets
- **Safe Area Insets:** Currently uses fixed padding (`p-2 pt-2 px-2.5`). On modern iPhones with Dynamic Island or Android gesture bars, UI elements are susceptible to clipping.
- **Touch Target Sizing:** Secondary buttons (Mute, QR, Pause) are sized at `w-7.5 h-7.5` ($30\times 30\text{px}$), which is below the iOS Human Interface Guideline minimum of $44\times 44\text{px}$ and commercial casual standard of $48\text{px}$.
- **One-Handed Playability:** Aiming requires dragging upward from the lower third of the screen, but swap button is at the bottom left, requiring two-handed reorientation.

---

## 3. REMEDIATION STRATEGY & ROADMAP

1. **Eliminate All Prototype Visuals:**
   - Remove industrial ceiling hazard chevrons (`ceilingGfx.fillRect` with yellow chevrons).
   - Remove neon mechanical rails (`railGfx` with cyan LED pulses).
   - Remove rigid rectangular board frames; let bubbles float freely in the deep sea with ambient caustics.
   - Remove `DebugOverlay` completely from user view.
2. **Re-architect Game Identity as "OCEAN PEARL SHOOTER":**
   - Redesign Pearl Cannon with living coral, Atlantean polished bronze, and iridescent pearl chamber.
   - Redesign Aim Guide into an elegant bioluminescent ocean ray with subtle specular wave bounces.
   - Implement World & Objective System: 5 Worlds with distinct mission types (Clear Orbs, Rescue Creatures, Collect Golden Pearls, Defeat Titan Boss).
3. **Upgrade Game Feel & VFX:**
   - Squash & stretch upon impact (`scaleX: 1.18, scaleY: 0.85` spring back).
   - Micro camera shake on Crab bombs and Shark Boss hits ($2.5\text{px}$ for $150\text{ms}$).
   - Ascending musical notes on combo cascades.
4. **Mobile-First Responsive Layout:**
   - Full viewport coverage with native safe-area insets (`env(safe-area-inset-top)`).
   - Minimum $48\times 48\text{px}$ touch targets.
   - Clean, uncluttered Top Bar: [Back/Map] [Mission Objective] [Star Progress] [Pause].

---
*Audit Completed. Ready for GDD, UX Flow, and Technical Implementation.*
