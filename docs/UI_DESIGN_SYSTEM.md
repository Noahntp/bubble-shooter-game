# 🌊 UI DESIGN SYSTEM — OCEAN PEARL SHOOTER

**Theme:** Premium Stylized 3D Underwater Fantasy  
**Philosophy:** Minimalist Floating Glass • Organic Marine Accents • High Contrast Readability  

---

## 1. COLOR TOKENS & TYPOGRAPHY

### 1.1 Palette Matrix
| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| **Ocean Deep Abyss** | `#030712` / `#060d24` | Background base gradient and dark backdrops |
| **Bioluminescent Cyan** | `#00e5ff` / `#38bdf8` | Primary active borders, aim line, energy shields, high-value accents |
| **Atlantean Coral** | `#f97316` / `#ff3366` | Crab bombs, warning highlights, high combos |
| **Golden Pearl** | `#fbbf24` / `#ffd700` | Starfish orbs, scores, 3-star checkpoint medals |
| **Emerald Kelp** | `#10b981` / `#059669` | Sea Turtle carapace, rescue beacons, success states |
| **Abyss Purple** | `#a855f7` / `#7c3aed` | Squid mantle, deep-sea mystery orbs |
| **Frosted Glass** | `rgba(15, 23, 42, 0.75)` | Floating HUD console with `backdrop-filter: blur(16px)` |

### 1.2 Typography Hierarchy
- **Header Font:** `Outfit, sans-serif` (Weights: 700 Bold, 900 Black). Used for Titles, Scores, Combos.
- **Body Font:** `Inter, sans-serif` (Weights: 500 Medium, 600 Semi-Bold). Used for Mission statements, tooltips.
- **Numbers & Stats:** Monospace numerals with tabular figures (`font-variant-numeric: tabular-nums`).

---

## 2. TOUCH TARGETS & COMPONENT STANDARDS

### 2.1 Spatial Grid & Touch Targets
- **Primary Action Buttons (CTA):** Height $50\text{px}$ to $54\text{px}$, min width $180\text{px}$, fully rounded pill or $16\text{px}$ radius.
- **Header Icon Buttons (Back, Pause, Sound):** Fixed $44\times 44\text{px}$ to $48\times 48\text{px}$ bounding box with $20\text{px}$ icon center.
- **Modal Padding Standard:** Unified $20\text{px}$ interior margin (`padding: 20px;`) across all devices.

### 2.2 Micro-Interactions & Shimmer Effects
- **Press State:** Instant scale punch down to $0.96$ on pointer-down with $80\text{ms}$ cubic-bezier release.
- **Shimmer Sweep:** Continuous diagonal gloss beam running across primary gold and cyan buttons every $3.5\text{s}$ (`animation: shimmerSweep 3.5s infinite`).
- **Score Popups:** Elastic bounce pop (`Back.easeOut`), floating $+45\text{px}$ upward over $800\text{ms}$ before fading.

---

## 3. SEAMLESS ARENA BLENDING (NO BOXED HTML LOOK)

- Discard rectangular background fill.
- The playfield is defined solely by floating pearls, ambient water caustics, and subtle soft light particles.
- Top and bottom viewports blend continuously with the deep ocean wallpaper.
- Boundaries are softly defined by organic floating marine flora rather than rigid plastic/metal lines.
