# 🌊 UX FLOW SPECIFICATION — OCEAN PEARL SHOOTER
**Guiding Principle:** GAMEPLAY FIRST. 5-Second Comprehension. Zero Friction.

---

## 1. USER INTERFACE HIERARCHY

```
                  ┌───────────────────────────────────────────┐
                  │    [Map]   ★ MISSION: CLEAR 24   [Pause]  │  <- Top Bar (52px)
                  │    Score: 1,450  [====★====★====★] (3★)   │  <- Progress Stream (20px)
                  ├───────────────────────────────────────────┤
                  │                                           │
                  │                                           │
                  │             GAMEPLAY ARENA                │
                  │                                           │
                  │     (Seamless underwater world,           │
                  │      free-floating pearls, caustics,      │
                  │      NO rigid rectangular borders,        │
                  │      NO industrial hazard stripes)        │
                  │                                           │
                  │                                           │
                  │                                           │
                  │   - - - - ~ ~ VẠCH THỦY TRIỀU ~ ~ - - -   │  <- Bioluminescent warning
                  ├───────────────────────────────────────────┤
                  │   [Reserve]       [ PEARL CANNON ]        │  <- Bottom Dock (110px)
                  │   (Clam Dock)    (Nautilus Chamber)       │  <- One-Handed Reach Zone
                  └───────────────────────────────────────────┘
```

### 1.1 Visual Importance Priority
1. **Primary Focus:** The active board & the Pearl in the cannon chamber (80% of screen luminance).
2. **Immediate Tactical Need:** Current aim trajectory line & impact target socket.
3. **Mission Goal:** Clear, concise objective statement in top center (e.g. `🎯 HẠ GỤC CÁ MẬP: 3/5 HP` or `🎯 BẮN HẠ TOÀN BỘ NGỌC`).
4. **Game State Metrics:** Score & 3-Star checkpoint liquid meter.
5. **Secondary Interaction:** Reserve Clam swap button (accessible directly by tapping the clam or pressing Spacebar).
6. **Auxiliary Controls:** Map, Mute, Pause located cleanly in top corners with minimum $48\times 48\text{px}$ touch targets.

---

## 2. SCREEN FLOW & STATE MACHINE

```
┌─────────────────┐       Tap "Chơi Ngay"       ┌─────────────────┐
│  WELCOME SCREEN │ ──────────────────────────> │  ACTIVE SESSION │
│ (Splash / Hero) │                             │   (Gameplay)    │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    │ Level Cleared      │ Out of Ammo        │ Tap Pause
                                    ▼                    ▼                    ▼
                           ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
                           │  VICTORY MODAL  │  │ GAME OVER MODAL │  │   PAUSE MODAL   │
                           │  (Stars, Score) │  │  (Retry / Map)  │  │ (Resume, Sound) │
                           └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
                                    │                    │                    │
                                    └────────────────────┴────────────────────┘
                                                         │ Tap Map
                                                         ▼
                                                ┌─────────────────┐
                                                │  WORLD SELECT   │
                                                │   (5 Worlds)    │
                                                └─────────────────┘
```

---

## 3. ELIMINATED PROTOTYPE ARTIFACTS
- ❌ **DELETED:** Industrial ceiling hazard chevrons (yellow/black construction stripes).
- ❌ **DELETED:** Neon cyan arcade rails on left and right walls.
- ❌ **DELETED:** Rigid boxed CSS container card (`fillRoundedRect(..., 0.45)`) with sharp borders.
- ❌ **DELETED:** Debug trajectory dots and oversized mechanical crosshairs.
- ❌ **DELETED:** `DebugOverlay` developer text and metrics.

## 4. ONE-HANDED MOBILE ERGONOMICS
- All shooting, aiming, and cancellation gestures occur within the bottom $45\%$ of the viewport.
- Swapping orbs can be performed by tapping directly on the Reserve Clam Dock or on the Cannon Base itself.
- Top navigation buttons maintain a safe margin of $16\text{px}$ from the physical screen edges to prevent palm rejection or notch occlusion.
