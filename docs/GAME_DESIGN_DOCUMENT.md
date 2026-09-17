# 🌊 GAME DESIGN DOCUMENT — OCEAN PEARL SHOOTER
**Title:** Ocean Pearl Shooter  
**Genre:** Premium Casual / Hexagonal Bubble Shooter  
**Platform:** Mobile First (Portrait)  
**Target Demographic:** Casual to Mid-Core mobile puzzle gamers (Ages 16–55)  
**Core Pillars:** Satisfying Game Feel • Tactile Ocean Physics • Immediate 5-Second Readability • High Commercial Polish  

---

## 1. CORE GAMEPLAY LOOP & MOTIVATION

### 1.1 The Micro-Loop (Second-to-Second)
1. **Perceive:** Player surveys the hexagonal array of pearl creatures floating in the sunlit reef.
2. **Aim & Strategize:** Drags thumb to trace a soft, bioluminescent trajectory path, utilizing wall bounces to bypass obstacles.
3. **Release & Fire:** The ancient Pearl Cannon thwips with satisfying underwater suction, launching the active creature pearl.
4. **Impact & Resolve:** The orb squashes and snaps smoothly into the hexagonal grid.
   - Matching $\ge 3$ like creatures triggers a resonant pop cascade.
   - Detached clusters lose buoyancy and plunge into the abyss with rising bubble fizzles.
   - Combo multiplier advances: ascending musical chimes, golden score popups.
5. **Reward & Turn End:** Progress bar updates, next pearl loads seamlessly into the chamber.

### 1.2 The Macro-Loop (Session-to-Session)
- **Clear Level Objectives:** Earn 1 to 3 Star ratings based on precision and remaining ammunition.
- **World Progression:** Travel across 5 mystical deep-sea zones, from sunlit Coral Reefs to the Mariana Abyss.
- **Collection & Mastery:** Unlock ancient Atlantean power-ups and register rare marine creature entries.

---

## 2. THE 8 OCEAN CREATURE ORBS

| Creature Orb | Role | Signature Silhouette & Material | Special Gameplay Mechanic | Audio / VFX Signature |
| :--- | :--- | :--- | :--- | :--- |
| **🐡 Pufferfish** | Primary Match | Spherical jewel orb, 8 soft spines, cute translucent fins, glossy crystalline eye. | Matches with identical color ($3+$ cluster pop). Available in 5 high-contrast jewel palettes (Cyan, Coral, Emerald, Amber, Violet). | Wet suction pop, water droplets spray. |
| **🪼 Jellyfish** | Universal Wild | Translucent iridescent bell umbrella, glowing rainbow core, trailing bioluminescent tentacles. | Acts as a wild card, connecting with any neighboring color cluster. | Soft chime resonance, electric bio-tendrils. |
| **🐢 Sea Turtle** | Shielded Heavy | Emerald carapace with golden hexagonal scutes, surrounded by an outer cyan bubble energy shield. | Takes 2 hits to eliminate: Hit 1 shatters energy shield into crystal shards (cracked shell state); Hit 2 destroys orb. | Glass-shatter ping on shield crack, deep shell crack sound. |
| **⭐ Starfish** | Score Accelerator | Warm coral-orange 5-pointed starfish wrapping around a central luminous golden pearl. | Popping awards **500 Base Pts $\times$ Current Combo Multiplier**. Spawns flying star particles to HUD. | Pentatonic harp glissando, radiant golden sparkle burst. |
| **🦀 Crab** | Area-of-Effect Bomb | Fiery crimson carapace with two raised serrated pincers and burning magma-orange core. | Detonates in a $3\times 3$ hex perimeter ($1.8$ grid radius), blasting away all surrounding orbs and cracking rocks. | Underwater sonic boom, shockwave ripple ring, screen shake. |
| **🦑 Squid** | Column Piercer | Deep royal-violet mantle, glowing yellow eyes, and swirling dark indigo ink core. | Emits a high-velocity ink jet that pierces and vaporizes an entire vertical column of orbs. | Ink vortex swirl, bubbling rush sound. |
| **🐙 Octopus** | Global Chain | Royal-purple octopus wrapping tentacles around an electric-cyan power sphere. | Destroys all bubbles of the most populous color currently present on the entire board. | Electric shock tendrils connecting across the playfield in sequence. |
| **🦈 Shark Titan** | Stage Boss | Metallic slate-blue apex predator, hydrodynamic dorsal fin, armored jaw with pearl teeth, glowing amber eye. | Boss unit ($3\text{ to }5\text{ HP}$). Flinches and flashes upon hit; summons tidal current rocks when angered. | Low brass warhorn rumble, tidal vortex collapse on defeat. |

---

## 3. MISSION OBJECTIVES & VICTORY CONDITIONS

Every level features a dedicated primary objective displayed prominently in the top bar:
1. **Clear All Orbs (`CLEAR_ALL`):** Eliminate all bubbles on the board before running out of pearl ammo.
2. **Rescue Sea Creatures (`RESCUE_CREATURES`):** Pop bubble cages or clusters surrounding trapped baby turtles and sea stars.
3. **Collect Golden Pearls (`COLLECT_PEARLS`):** Drop specific high-value golden pearls into the bottom collection trench.
4. **Defeat the Apex Titan (`DEFEAT_BOSS`):** Deplete the Shark Boss's health bar ($3\text{--}5\text{ HP}$) before the tidal line reaches critical depth.

---

## 4. WORLD PROGRESSION & LEVEL DESIGN MATRIX

The game spans **5 Distinct Ocean Worlds** (10 master levels in initial campaign), each introducing unique mechanics:

```
WORLD 01: SUNLIT CORAL REEF  (Levels 1–2)  -> Basic Pufferfish Matching, Jellyfish Wild introduction.
WORLD 02: THE SUNKEN GALLEON (Levels 3–4)  -> Starfish Combos, Sea Turtle Shield barriers.
WORLD 03: THE MARIANA TRENCH (Level 5)     -> BOSS BATTLE: Shark Apex Predator (3 HP).
WORLD 04: BIOLUMINESCENT CAVE (Levels 6–8) -> Crab AoE Bombs, Bubble Cages, Squid Ink Columns.
WORLD 05: ATLANTIS ABYSS     (Levels 9–10) -> Octopus Global Chains, Ice Corals, TITAN BOSS (5 HP).
```

---

## 5. COMBO & CASCADE SYSTEM

- **Sequential Matching:** Every consecutive shot that produces a match increases the Combo Counter ($\times 1.0 \rightarrow \times 1.5 \rightarrow \times 2.0 \rightarrow \times 3.0 \rightarrow \times 4.0$).
- **Dynamic Musical Scaling:** The match sound pitch scales up pentatonically ($C_5 \rightarrow D_5 \rightarrow E_5 \rightarrow G_5 \rightarrow A_5$) with each combo step.
- **Orphan Cascade Drop:** Floating bubbles disconnected from the ceiling plummet into the abyss. Points awarded: $20 \times (\text{dropped count})^{1.15}$.

---

## 6. THE ANCIENT PEARL CANNON

- **Design Philosophy:** An ancient Atlantean bio-mechanical device forged from coral, polished bronze, and glowing crystal glass.
- **Cannon Components:**
  - *Chamber:* Transparent water sphere revealing the active marine orb floating with buoyant physics.
  - *Turntable:* Polished bronze and living coral base rotating with smooth thumb drag.
  - *Barrel:* Spiral Nautilus shell cannon lined with luminescent water fiber optics.
  - *Clam Shell Reserve:* Left-flank pearl clam showing the upcoming reserve orb. Tapping swaps orbs smoothly in $150\text{ms}$.
- **States & Animations:**
  - `IDLE`: Gentle underwater breathing oscillation ($1200\text{ms}$ sine ease).
  - `AIM`: Snappy, responsive rotation tracking touch coordinates.
  - `SHOOT`: Dramatic recoil kickback ($8\text{px}$ backward) + water muzzle shockwave.
  - `RELOAD`: Next orb glides smoothly from clam dock into main chamber with water bubble chime.

---

## 7. TRAJECTORY & AIMING SPECIFICATION

- **Subtle Bioluminescent Guide:** Discard harsh physics debug dots. The trajectory is rendered as a soft, tapering beam of light with gentle wave pulses matching the projectile's color.
- **Specular Wall Reflection:** Single clean rebound angle calculated against playfield boundaries.
- **Impact Reticle:** A minimalist water-caustic ring highlights the exact hex socket where the pearl will lodge.
- **Down-Drag Cancellation:** Dragging thumb below cannon level smoothly fades the guide line, allowing players to cancel a shot without penalty.

---

## 8. DIFFICULTY CURVE & ANTI-FRUSTRATION RULES

- **Dynamic Reserve Assistance:** When the player is down to their last 5 shots, the generator prioritizes colors present in clusters of 2+ on the board.
- **Orphan Cleanliness:** Avoid leaving unreachable single orbs; matching adjacent groups automatically shakes loose dead branches.
- **Safe Zone Warning:** When orbs descend within 2 rows of the bottom, a pulsing bioluminescent tidal surge line warns the player without obstructing visibility.

---
*Game Design Approved for Commercial Production.*
