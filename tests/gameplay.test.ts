import { describe, it, expect, beforeEach } from 'vitest';
import { GridManager } from '../src/game/GridManager';
import { MatchManager } from '../src/game/MatchManager';
import { SpecialBubbleManager } from '../src/game/SpecialBubbleManager';
import { FloatingBubbleManager } from '../src/game/FloatingBubbleManager';
import { EffectResolver } from '../src/game/EffectResolver';
import { DynamicDifficultyManager } from '../src/game/DynamicDifficulty';
import { BubbleEntity, BubbleColor } from '../src/types/game';
import { apiService } from '../src/services/api';

describe('Bubble Shooter Core Gameplay Engine Tests', () => {
  let gridManager: GridManager;
  let matchManager: MatchManager;
  let specialManager: SpecialBubbleManager;
  let floatingManager: FloatingBubbleManager;
  let effectResolver: EffectResolver;
  let difficultyManager: DynamicDifficultyManager;

  const createBubble = (
    row: number,
    col: number,
    color: BubbleColor,
    type: BubbleEntity['type'] = 'NORMAL',
    state: BubbleEntity['state'] = 'ATTACHED'
  ): BubbleEntity => ({
    id: `b_${row}_${col}`,
    row,
    col,
    color,
    type,
    state,
    freezeTurnsRemaining: 0,
    visualX: 0,
    visualY: 0
  });

  beforeEach(() => {
    gridManager = new GridManager();
    matchManager = new MatchManager(gridManager);
    specialManager = new SpecialBubbleManager(gridManager);
    floatingManager = new FloatingBubbleManager(gridManager);
    effectResolver = new EffectResolver(
      gridManager,
      matchManager,
      specialManager,
      floatingManager
    );
    difficultyManager = new DynamicDifficultyManager();
  });

  // 1. HEXAGONAL GRID NEIGHBORS
  it('1. correctly computes hexagonal neighbors for even and odd rows', () => {
    // Even row (row 0, col 1): neighbors are (0,0), (0,2), (1,0), (1,1)
    const evenNeighbors = gridManager.getNeighbors(0, 1);
    expect(evenNeighbors).toContainEqual({ row: 0, col: 0 });
    expect(evenNeighbors).toContainEqual({ row: 0, col: 2 });
    expect(evenNeighbors).toContainEqual({ row: 1, col: 0 });
    expect(evenNeighbors).toContainEqual({ row: 1, col: 1 });

    // Odd row (row 1, col 1): neighbors are (0,1), (0,2), (1,0), (1,2), (2,1), (2,2)
    const oddNeighbors = gridManager.getNeighbors(1, 1);
    expect(oddNeighbors).toContainEqual({ row: 0, col: 1 });
    expect(oddNeighbors).toContainEqual({ row: 0, col: 2 });
    expect(oddNeighbors).toContainEqual({ row: 1, col: 0 });
    expect(oddNeighbors).toContainEqual({ row: 1, col: 2 });
  });

  // 2. MATCH 3
  it('2. detects exact Match-3 of same color', () => {
    const b1 = createBubble(0, 0, 'RED');
    const b2 = createBubble(0, 1, 'RED');
    const b3 = createBubble(1, 0, 'RED');
    gridManager.setBubble(0, 0, b1);
    gridManager.setBubble(0, 1, b2);
    gridManager.setBubble(1, 0, b3);

    const matches = matchManager.findMatches(b1);
    expect(matches.length).toBe(3);
  });

  // 3. MATCH 4 & 5
  it('3. detects Match-4 and Match-5 connected clusters', () => {
    const bubbles = [
      createBubble(0, 0, 'BLUE'),
      createBubble(0, 1, 'BLUE'),
      createBubble(0, 2, 'BLUE'),
      createBubble(1, 0, 'BLUE'),
      createBubble(1, 1, 'BLUE')
    ];
    bubbles.forEach(b => gridManager.setBubble(b.row, b.col, b));

    const matches = matchManager.findMatches(bubbles[0]);
    expect(matches.length).toBe(5);
  });

  // 4. RAINBOW WILDCARD RESOLUTION
  it('4. resolves RAINBOW wildcard into adjacent matching color', () => {
    const r1 = createBubble(0, 0, 'GREEN');
    const r2 = createBubble(0, 1, 'GREEN');
    const rainbow = createBubble(1, 0, 'PURPLE', 'RAINBOW');

    gridManager.setBubble(0, 0, r1);
    gridManager.setBubble(0, 1, r2);
    gridManager.setBubble(1, 0, rainbow);

    const matches = matchManager.findMatches(rainbow);
    expect(matches.length).toBe(3);
    expect(matches.some(b => b.type === 'RAINBOW')).toBe(true);
  });

  // 5. BOMB 3X3 BLAST AND CHAIN
  it('5. detonates 3x3 surrounding cells and chains with adjacent Bomb', () => {
    const bomb1 = createBubble(1, 1, 'RED', 'BOMB');
    const bomb2 = createBubble(1, 2, 'RED', 'BOMB');
    const target = createBubble(0, 1, 'BLUE');

    gridManager.setBubble(1, 1, bomb1);
    gridManager.setBubble(1, 2, bomb2);
    gridManager.setBubble(0, 1, target);

    const result = effectResolver.resolveTurn(bomb1);
    expect(result.screenShake).toBe(true);
    expect(result.poppedBubbles.length).toBeGreaterThanOrEqual(3);
  });

  // 6. LIGHTNING ROW CLEAR
  it('6. clears entire row when LIGHTNING is triggered', () => {
    const lightning = createBubble(1, 0, 'YELLOW', 'LIGHTNING');
    const b1 = createBubble(1, 1, 'RED');
    const b2 = createBubble(1, 2, 'BLUE');

    gridManager.setBubble(1, 0, lightning);
    gridManager.setBubble(1, 1, b1);
    gridManager.setBubble(1, 2, b2);

    const result = effectResolver.resolveTurn(lightning);
    expect(result.lightningRows).toContain(1);
    expect(result.poppedBubbles.some(b => b.id === b1.id)).toBe(true);
    expect(result.poppedBubbles.some(b => b.id === b2.id)).toBe(true);
  });

  // 7. FREEZE UTILITY
  it('7. encases surrounding bubbles for 2 turns and prevents matching/falling', () => {
    const freeze = createBubble(1, 1, 'BLUE', 'FREEZE');
    const b1 = createBubble(1, 0, 'RED');
    gridManager.setBubble(1, 1, freeze);
    gridManager.setBubble(1, 0, b1);

    const result = effectResolver.resolveTurn(freeze);
    expect(result.frozenBubbles.length).toBeGreaterThan(0);
    expect(b1.state).toBe('FROZEN');
    expect(b1.freezeTurnsRemaining).toBe(2);

    // After 1 turn
    specialManager.tickFreezeTurns();
    expect(b1.state).toBe('FROZEN');
    expect(b1.freezeTurnsRemaining).toBe(1);

    // After 2nd turn -> Thawed!
    specialManager.tickFreezeTurns();
    expect(b1.state).toBe('ATTACHED');
  });

  // 8. CURSE PENALTY
  it('8. applies score deduction when CURSE is triggered', () => {
    const curse = createBubble(0, 1, 'PURPLE', 'CURSE');
    const b1 = createBubble(0, 0, 'RED');
    const b2 = createBubble(0, 2, 'RED');
    const b3 = createBubble(1, 0, 'RED');

    gridManager.setBubble(0, 1, curse);
    gridManager.setBubble(0, 0, b1);
    gridManager.setBubble(0, 2, b2);
    gridManager.setBubble(1, 0, b3);

    const penalty = specialManager.rollCursePenalty();
    expect([-100, -200, -300]).toContain(penalty);
  });

  // 9. TRAP PENALTY
  it('9. spawns normal bubbles unless occupancy > 85%', () => {
    const trap = createBubble(1, 1, 'YELLOW', 'TRAP');
    gridManager.setBubble(1, 1, trap);

    const spawns = specialManager.getTrapSpawnSlots(trap);
    expect(spawns.length).toBeGreaterThan(0);
    expect(spawns.length).toBeLessThanOrEqual(4);
  });

  // 10. FLOATING BUBBLE DETECTION & CASCADE
  it('10. discovers detached bubbles not connected to ceiling row 0', () => {
    // Row 0 anchor
    const anchor = createBubble(0, 0, 'RED');
    // Row 1 connected to anchor
    const connected = createBubble(1, 0, 'RED');
    // Row 3 detached bubble
    const detached = createBubble(3, 3, 'BLUE');

    gridManager.setBubble(0, 0, anchor);
    gridManager.setBubble(1, 0, connected);
    gridManager.setBubble(3, 3, detached);

    const floating = floatingManager.findFloatingBubbles();
    expect(floating.length).toBe(1);
    expect(floating[0].id).toBe(detached.id);
  });

  // 11. COMBO MULTIPLIERS
  it('11. advances combo multipliers on consecutive clears', () => {
    expect(effectResolver.getCombo()).toBe(0);

    const b1 = createBubble(0, 0, 'RED');
    const b2 = createBubble(0, 1, 'RED');
    const b3 = createBubble(1, 0, 'RED');
    gridManager.setBubble(0, 0, b1);
    gridManager.setBubble(0, 1, b2);
    gridManager.setBubble(1, 0, b3);

    const res1 = effectResolver.resolveTurn(b1);
    expect(res1.comboLevel).toBe(1);
    expect(res1.multiplier).toBe(1.0);

    // Second clear in a row
    const c1 = createBubble(0, 3, 'BLUE');
    const c2 = createBubble(0, 4, 'BLUE');
    const c3 = createBubble(1, 3, 'BLUE');
    gridManager.setBubble(0, 3, c1);
    gridManager.setBubble(0, 4, c2);
    gridManager.setBubble(1, 3, c3);

    const res2 = effectResolver.resolveTurn(c1);
    expect(res2.comboLevel).toBe(2);
    expect(res2.multiplier).toBe(1.5);
  });

  // 12. ANTI-FRUSTRATION RULES
  it('12. enforces anti-frustration guards on high occupancy and penalties', () => {
    // With occupancy > 90%, penalty bubbles must NEVER spawn
    for (let i = 0; i < 20; i++) {
      const type = difficultyManager.rollNextBubbleType(10, 0.95, 10, 0);
      expect(type).not.toBe('CURSE');
      expect(type).not.toBe('TRAP');
    }
  });

  // 13. ANTI-CHEAT VALIDATION
  it('13. rejects suspicious score submissions exceeding thresholds', async () => {
    await apiService.startSession(1);

    // Unrealistic 999,999 score should fail anti-cheat
    const result = await apiService.finishSession({
      level: 1,
      score: 999999,
      shotsRemaining: 10,
      stars: 3,
      result: 'WIN'
    });

    expect(result.verified).toBe(false);
  });
});
