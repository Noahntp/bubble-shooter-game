import { BubbleType, SpecialBubbleSpawnRates } from '../types/game';

export class DynamicDifficultyManager {
  private consecutivePenalties: number = 0;
  private shotsFiredThisLevel: number = 0;
  private rewardGivenInFirst5: boolean = false;

  public resetLevel(): void {
    this.consecutivePenalties = 0;
    this.shotsFiredThisLevel = 0;
    this.rewardGivenInFirst5 = false;
  }

  public getBaseRatesForLevel(level: number): SpecialBubbleSpawnRates {
    if (level <= 2) {
      return {
        NORMAL: 92,
        BONUS: 4,
        RAINBOW: 2,
        BOMB: 2,
        LIGHTNING: 0,
        FREEZE: 0,
        CURSE: 0,
        TRAP: 0
      };
    } else if (level <= 5) {
      return {
        NORMAL: 85,
        BONUS: 6,
        RAINBOW: 3,
        BOMB: 3,
        LIGHTNING: 1,
        FREEZE: 2,
        CURSE: 0,
        TRAP: 0
      };
    } else if (level <= 10) {
      return {
        NORMAL: 78,
        BONUS: 8,
        RAINBOW: 4,
        BOMB: 3,
        LIGHTNING: 2,
        FREEZE: 3,
        CURSE: 1,
        TRAP: 1
      };
    } else if (level <= 20) {
      return {
        NORMAL: 70,
        BONUS: 8,
        RAINBOW: 4,
        BOMB: 4,
        LIGHTNING: 3,
        FREEZE: 3,
        CURSE: 4,
        TRAP: 4
      };
    } else {
      return {
        NORMAL: 65,
        BONUS: 9,
        RAINBOW: 5,
        BOMB: 5,
        LIGHTNING: 4,
        FREEZE: 3,
        CURSE: 4,
        TRAP: 5
      };
    }
  }

  /**
   * For generating initial board bubbles without advancing turn shot counters.
   */
  public rollInitialBubbleType(level: number): BubbleType {
    const base = this.getBaseRatesForLevel(level);
    const entries = Object.entries(base) as [BubbleType, number][];
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    for (const [type, weight] of entries) {
      cumulative += weight;
      if (roll <= cumulative) {
        return type;
      }
    }
    return 'NORMAL';
  }

  /**
   * Applies dynamic adjustments bounded by +/- 15% based on board occupancy and shots remaining.
   * Enforces Anti-Frustration Rules:
   * - No penalty if occupancy > 90%
   * - No 3 consecutive penalties
   * - Guaranteed reward within first 5 shots
   */
  public rollNextBubbleType(
    level: number,
    boardOccupancy: number,
    shotsRemaining: number,
    currentRewardsOnBoard: number
  ): BubbleType {
    this.shotsFiredThisLevel += 1;
    const base = this.getBaseRatesForLevel(level);
    const adjusted = { ...base };

    // Anti-Frustration Rule 6: Within first 5 shots of level, guaranteed at least 1 reward opportunity
    if (this.shotsFiredThisLevel <= 5 && !this.rewardGivenInFirst5 && this.shotsFiredThisLevel >= 3) {
      this.rewardGivenInFirst5 = true;
      const rewards: BubbleType[] = ['BONUS', 'RAINBOW', 'BOMB'];
      return rewards[Math.floor(Math.random() * rewards.length)];
    }

    // Dynamic Difficulty: Player near loss (occupancy > 75% or shots <= 3)
    if (boardOccupancy > 0.75 || shotsRemaining <= 3) {
      // Increase rewards, decrease penalties within 15% limit
      adjusted.BONUS = Math.min(base.BONUS * 1.15, base.BONUS + 3);
      adjusted.BOMB = Math.min(base.BOMB * 1.15, base.BOMB + 2);
      adjusted.CURSE = Math.max(0, base.CURSE * 0.5);
      adjusted.TRAP = Math.max(0, base.TRAP * 0.5);
    } else if (boardOccupancy < 0.35 && shotsRemaining > 15) {
      // Player is breezing through: mild challenge
      adjusted.CURSE = Math.min(base.CURSE * 1.15, base.CURSE + 1);
      adjusted.TRAP = Math.min(base.TRAP * 1.15, base.TRAP + 1);
    }

    // Anti-Frustration Rule 3: Occupancy > 90% => zero penalties!
    if (boardOccupancy > 0.9) {
      adjusted.CURSE = 0;
      adjusted.TRAP = 0;
    }

    // Anti-Frustration Rule 5: Never spawn 3 consecutive penalties
    if (this.consecutivePenalties >= 2) {
      adjusted.CURSE = 0;
      adjusted.TRAP = 0;
    }

    // Anti-Frustration Rule 4: Max 2 rewards at the same time in early levels
    if (level <= 10 && currentRewardsOnBoard >= 2) {
      adjusted.BONUS = 0;
      adjusted.RAINBOW = 0;
    }

    // Normalize weights
    const entries = Object.entries(adjusted) as [BubbleType, number][];
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    let chosenType: BubbleType = 'NORMAL';

    for (const [type, weight] of entries) {
      cumulative += weight;
      if (roll <= cumulative) {
        chosenType = type;
        break;
      }
    }

    // Track consecutive penalties
    if (chosenType === 'CURSE' || chosenType === 'TRAP') {
      this.consecutivePenalties += 1;
    } else {
      this.consecutivePenalties = 0;
    }

    if (chosenType === 'BONUS' || chosenType === 'RAINBOW' || chosenType === 'BOMB') {
      this.rewardGivenInFirst5 = true;
    }

    return chosenType;
  }
}
