import { BubbleEntity, BubbleColor, ScorePopupData } from '../types/game';
import { GridManager } from './GridManager';
import { MatchManager } from './MatchManager';
import { SpecialBubbleManager } from './SpecialBubbleManager';
import { FloatingBubbleManager } from './FloatingBubbleManager';
import { BASE_MATCH_SCORES, COMBO_MULTIPLIERS } from './constants';

export interface TurnResolutionResult {
  poppedBubbles: BubbleEntity[];
  floatingBubbles: BubbleEntity[];
  frozenBubbles: BubbleEntity[];
  spawnedBubbles: { row: number; col: number; color: BubbleColor }[];
  crackedTurtles: BubbleEntity[];
  bossHit?: { boss: BubbleEntity; hpRemaining: number; defeated: boolean };
  scoreGained: number;
  comboLevel: number;
  multiplier: number;
  popups: ScorePopupData[];
  screenShake: boolean;
  lightningRows: number[];
  squidColumns: number[];
  triggeredBombPositions: { x: number; y: number }[];
}

export class EffectResolver {
  private gridManager: GridManager;
  private matchManager: MatchManager;
  private specialBubbleManager: SpecialBubbleManager;
  private floatingManager: FloatingBubbleManager;
  private currentCombo: number = 0;

  constructor(
    gridManager: GridManager,
    matchManager: MatchManager,
    specialBubbleManager: SpecialBubbleManager,
    floatingManager: FloatingBubbleManager
  ) {
    this.gridManager = gridManager;
    this.matchManager = matchManager;
    this.specialBubbleManager = specialBubbleManager;
    this.floatingManager = floatingManager;
  }

  public getCombo(): number {
    return this.currentCombo;
  }

  public resetCombo(): void {
    this.currentCombo = 0;
  }

  /**
   * Deterministically resolves all effects following priority order:
   * 1. MATCH ➔ 2. CRAB/BOMB ➔ 3. SQUID/LIGHTNING ➔ 4. OCTOPUS/CHAIN ➔ 5. JELLYFISH
   * ➔ 6. STARFISH ➔ 7. TURTLE SHIELD ➔ 8. SHARK BOSS ➔ 9. FLOATING ➔ 10. SCORE
   */
  public resolveTurn(attachedBubble: BubbleEntity): TurnResolutionResult {
    const bubblesToPop = new Map<string, BubbleEntity>();
    const frozenBubbles: BubbleEntity[] = [];
    const spawnedBubbles: { row: number; col: number; color: BubbleColor }[] = [];
    const crackedTurtles: BubbleEntity[] = [];
    const popups: ScorePopupData[] = [];
    const triggeredBombPositions: { x: number; y: number }[] = [];
    const lightningRows: number[] = [];
    const squidColumns: number[] = [];
    let bossHit: { boss: BubbleEntity; hpRemaining: number; defeated: boolean } | undefined;

    let screenShake = false;
    let baseScore = 0;

    // --- STEP 1: DIRECT SPECIAL BUBBLE SHOT OR MATCH ---
    if (attachedBubble.type === 'BOMB' || attachedBubble.type === 'CRAB') {
      this.triggerBomb(attachedBubble, bubblesToPop, triggeredBombPositions, popups, 0);
      screenShake = true;
    } else if (attachedBubble.type === 'LIGHTNING' || attachedBubble.type === 'SQUID') {
      // Squid column ink strike + row lightning
      this.triggerSquidInk(attachedBubble.col, bubblesToPop, squidColumns, popups);
      this.triggerLightning(attachedBubble.row, bubblesToPop, lightningRows, popups, 0);
      screenShake = true;
    } else if (attachedBubble.type === 'OCTOPUS') {
      this.triggerOctopusChain(attachedBubble, bubblesToPop, popups);
      screenShake = true;
    } else if (attachedBubble.type === 'WHIRLPOOL') {
      this.triggerWhirlpool(attachedBubble, bubblesToPop, popups);
      screenShake = true;
    } else if (attachedBubble.type === 'FREEZE') {
      const targets = this.specialBubbleManager.getFreezeTargets(attachedBubble);
      targets.forEach(t => {
        t.state = 'FROZEN';
        t.freezeTurnsRemaining = 2;
        frozenBubbles.push(t);
      });
      bubblesToPop.set(attachedBubble.id, attachedBubble);
    } else {
      // Normal or Jellyfish / Rainbow match check
      const matches = this.matchManager.findMatches(attachedBubble);
      if (matches.length >= 3) {
        matches.forEach(b => bubblesToPop.set(b.id, b));

        // Base match score formula
        const count = matches.length;
        const matchPoints = count <= 6
          ? (BASE_MATCH_SCORES[count] || 30)
          : (BASE_MATCH_SCORES[6] || 120) + (count - 6) * 20;

        baseScore += matchPoints;
        const center = this.gridManager.gridToPixel(attachedBubble.row, attachedBubble.col);
        popups.push({
          x: center.x,
          y: center.y,
          score: matchPoints,
          text: `+${matchPoints}`
        });

        // Check for adjacent special orbs triggered by match
        this.checkAdjacentSpecials(
          matches,
          bubblesToPop,
          triggeredBombPositions,
          lightningRows,
          squidColumns,
          crackedTurtles,
          popups
        );
      }
    }

    // --- STEP 2: CHECK NESTED SPECIAL EFFECTS FOR ALL POPPED BUBBLES ---
    for (const b of Array.from(bubblesToPop.values())) {
      if (b.type === 'BONUS' || b.type === 'STARFISH') {
        const reward = (b.type === 'STARFISH')
          ? 500 * Math.max(1, this.currentCombo)
          : this.specialBubbleManager.rollBonusReward();
        baseScore += reward;
        const pos = this.gridManager.gridToPixel(b.row, b.col);
        popups.push({
          x: pos.x,
          y: pos.y,
          score: reward,
          text: `+${reward} ⭐`,
          color: '#ffd700'
        });
      } else if (b.type === 'CURSE') {
        const penalty = this.specialBubbleManager.rollCursePenalty();
        baseScore += penalty; // negative delta
        const pos = this.gridManager.gridToPixel(b.row, b.col);
        popups.push({
          x: pos.x,
          y: pos.y,
          score: penalty,
          text: `${penalty}`,
          color: '#ff1744'
        });
      } else if (b.type === 'OCTOPUS') {
        this.triggerOctopusChain(b, bubblesToPop, popups);
      } else if (b.type === 'TRAP') {
        const newSlots = this.specialBubbleManager.getTrapSpawnSlots(b);
        newSlots.forEach(s => spawnedBubbles.push(s));
      } else if (b.type === 'SHARK' || b.isBoss) {
        b.bossHp = (b.bossHp ?? 5) - 1;
        if (b.bossHp > 0) {
          // Boss survives hit! Do not pop from grid
          bubblesToPop.delete(b.id);
          bossHit = { boss: b, hpRemaining: b.bossHp, defeated: false };
          popups.push({
            x: b.visualX,
            y: b.visualY - 20,
            score: 500,
            text: `🦈 BOSS HP: ${b.bossHp}`,
            color: '#f43f5e'
          });
        } else {
          bossHit = { boss: b, hpRemaining: 0, defeated: true };
          baseScore += 5000;
          screenShake = true;
          popups.push({
            x: b.visualX,
            y: b.visualY - 20,
            score: 5000,
            text: '🦈 BOSS HẠ GỤC! +5000',
            color: '#ffd700'
          });
        }
      }
    }

    // Mark popped bubbles in grid as null so floating detection is accurate
    bubblesToPop.forEach(b => {
      this.gridManager.removeBubble(b.row, b.col);
    });

    // --- STEP 3: FLOATING BUBBLE DETECTION ---
    const floatingBubbles = this.floatingManager.findFloatingBubbles();
    floatingBubbles.forEach(fb => {
      this.gridManager.removeBubble(fb.row, fb.col);
      fb.state = 'FALLING';
    });

    // Floating bubbles score: +20 * count^1.15
    if (floatingBubbles.length > 0) {
      const dropPoints = Math.round(20 * Math.pow(floatingBubbles.length, 1.15));
      baseScore += dropPoints;
      const first = floatingBubbles[0];
      const pos = this.gridManager.gridToPixel(first.row, first.col);
      popups.push({
        x: pos.x,
        y: pos.y,
        score: dropPoints,
        text: `+${dropPoints} RƠI!`
      });
    }

    // --- STEP 4: COMBO AND FINAL MULTIPLIER ---
    const totalCleared = bubblesToPop.size + floatingBubbles.length;
    let multiplier = 1.0;

    if (totalCleared > 0) {
      this.currentCombo += 1;
      const tierIndex = Math.min(this.currentCombo - 1, COMBO_MULTIPLIERS.length - 1);
      multiplier = COMBO_MULTIPLIERS[tierIndex];

      if (this.currentCombo > 1) {
        const center = this.gridManager.gridToPixel(attachedBubble.row, attachedBubble.col);
        popups.push({
          x: center.x,
          y: center.y - 30,
          score: 0,
          text: `COMBO x${multiplier}`,
          color: '#ffea00'
        });
      }
    } else {
      this.currentCombo = 0;
      multiplier = 1.0;
    }

    const finalScoreDelta = Math.round(baseScore * multiplier);

    return {
      poppedBubbles: Array.from(bubblesToPop.values()),
      floatingBubbles,
      frozenBubbles,
      spawnedBubbles,
      crackedTurtles,
      bossHit,
      scoreGained: finalScoreDelta,
      comboLevel: this.currentCombo,
      multiplier,
      popups,
      screenShake,
      lightningRows,
      squidColumns,
      triggeredBombPositions
    };
  }

  private triggerBomb(
    bombBubble: BubbleEntity,
    bubblesToPop: Map<string, BubbleEntity>,
    triggeredBombs: { x: number; y: number }[],
    popups: ScorePopupData[],
    chainCount: number
  ): void {
    if (chainCount >= 3) return;

    bubblesToPop.set(bombBubble.id, bombBubble);
    const blastArea = this.specialBubbleManager.getBombBlastArea(bombBubble, chainCount);
    const pos = this.gridManager.gridToPixel(bombBubble.row, bombBubble.col);
    triggeredBombs.push(pos);

    for (const b of blastArea) {
      if (b.state === 'FROZEN') continue;

      if (!bubblesToPop.has(b.id)) {
        bubblesToPop.set(b.id, b);
        // +10 score per bubble in bomb blast
        popups.push({
          x: b.visualX || pos.x,
          y: b.visualY || pos.y,
          score: 10,
          text: '+10'
        });

        // Chain with other bombs / crabs
        if ((b.type === 'BOMB' || b.type === 'CRAB') && b !== bombBubble) {
          this.triggerBomb(b, bubblesToPop, triggeredBombs, popups, chainCount + 1);
        }
      }
    }
  }

  private triggerSquidInk(
    col: number,
    bubblesToPop: Map<string, BubbleEntity>,
    squidColumns: number[],
    popups: ScorePopupData[]
  ): void {
    if (squidColumns.includes(col)) return;
    squidColumns.push(col);

    const colBubbles = this.specialBubbleManager.getSquidColumnBubbles(col);
    for (const b of colBubbles) {
      if (!bubblesToPop.has(b.id)) {
        bubblesToPop.set(b.id, b);
        popups.push({
          x: b.visualX,
          y: b.visualY,
          score: 25,
          text: '+25 🦑',
          color: '#c084fc'
        });
      }
    }
  }

  private triggerOctopusChain(
    octopusBubble: BubbleEntity,
    bubblesToPop: Map<string, BubbleEntity>,
    popups: ScorePopupData[]
  ): void {
    bubblesToPop.set(octopusBubble.id, octopusBubble);
    const chainTargets = this.specialBubbleManager.getOctopusChainTargets(octopusBubble);

    for (const b of chainTargets) {
      if (!bubblesToPop.has(b.id)) {
        bubblesToPop.set(b.id, b);
        popups.push({
          x: b.visualX,
          y: b.visualY,
          score: 30,
          text: '+30 🐙',
          color: '#38bdf8'
        });
      }
    }
  }

  private triggerLightning(
    row: number,
    bubblesToPop: Map<string, BubbleEntity>,
    lightningRows: number[],
    popups: ScorePopupData[],
    chainCount: number
  ): void {
    if (chainCount >= 2 || lightningRows.includes(row)) return;

    lightningRows.push(row);
    const rowBubbles = this.specialBubbleManager.getLightningRowBubbles(row);

    for (const b of rowBubbles) {
      if (b.state === 'FROZEN') continue;

      if (!bubblesToPop.has(b.id)) {
        bubblesToPop.set(b.id, b);
        popups.push({
          x: b.visualX,
          y: b.visualY,
          score: 15,
          text: '+15'
        });

        // Chain with other Lightning bubbles
        if ((b.type === 'LIGHTNING' || b.type === 'SQUID') && b.row !== row) {
          this.triggerLightning(b.row, bubblesToPop, lightningRows, popups, chainCount + 1);
        }
      }
    }
  }

  private checkAdjacentSpecials(
    matches: BubbleEntity[],
    bubblesToPop: Map<string, BubbleEntity>,
    triggeredBombs: { x: number; y: number }[],
    lightningRows: number[],
    squidColumns: number[],
    crackedTurtles: BubbleEntity[],
    popups: ScorePopupData[]
  ): void {
    for (const matchBubble of matches) {
      const neighbors = this.gridManager.getNeighbors(matchBubble.row, matchBubble.col);
      for (const n of neighbors) {
        const b = this.gridManager.getBubble(n.row, n.col);
        if (!b || bubblesToPop.has(b.id) || b.state === 'FROZEN') continue;

        // Rock is immune to normal adjacent matches
        if (b.type === 'ROCK') continue;

        if (b.type === 'BOMB' || b.type === 'CRAB') {
          this.triggerBomb(b, bubblesToPop, triggeredBombs, popups, 0);
        } else if (b.type === 'LIGHTNING' || b.type === 'SQUID') {
          this.triggerSquidInk(b.col, bubblesToPop, squidColumns, popups);
          this.triggerLightning(b.row, bubblesToPop, lightningRows, popups, 0);
        } else if (b.type === 'OCTOPUS') {
          this.triggerOctopusChain(b, bubblesToPop, popups);
        } else if (b.type === 'TURTLE' || b.type === 'TRAP') {
          // Turtle shield check: takes 1 hit to crack, 2nd hit to pop
          const currentHp = b.shieldHp ?? 2;
          if (currentHp > 1) {
            b.shieldHp = 1;
            crackedTurtles.push(b);
            popups.push({
              x: b.visualX,
              y: b.visualY - 15,
              score: 50,
              text: '🛡️ KHIÊN NỨT!',
              color: '#38bdf8'
            });
          } else {
            bubblesToPop.set(b.id, b);
          }
        } else if (b.type === 'BONUS' || b.type === 'STARFISH' || b.type === 'CURSE' || b.type === 'SHARK' || b.type === 'ICE' || b.type === 'CAGE') {
          bubblesToPop.set(b.id, b);
        }
      }
    }
  }

  private triggerWhirlpool(
    centerBubble: BubbleEntity,
    bubblesToPop: Map<string, BubbleEntity>,
    popups: ScorePopupData[]
  ): void {
    const centerPos = this.gridManager.gridToPixel(centerBubble.row, centerBubble.col);
    const neighbors = this.gridManager.getNeighbors(centerBubble.row, centerBubble.col);
    bubblesToPop.set(centerBubble.id, centerBubble);

    neighbors.forEach(n => {
      const b = this.gridManager.getBubble(n.row, n.col);
      if (b && b.state !== 'DESTROYED') {
        bubblesToPop.set(b.id, b);
        // Also secondary neighbors for wide whirlpool radius
        const secondary = this.gridManager.getNeighbors(n.row, n.col);
        secondary.forEach(sn => {
          const sb = this.gridManager.getBubble(sn.row, sn.col);
          if (sb && sb.state !== 'DESTROYED') {
            bubblesToPop.set(sb.id, sb);
          }
        });
      }
    });

    const pts = 800;
    popups.push({
      x: centerPos.x,
      y: centerPos.y,
      score: pts,
      text: `🌀 XOÁY NƯỚC +${pts}`,
      color: '#38bdf8'
    });
  }
}
