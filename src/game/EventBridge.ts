import Phaser from 'phaser';

/**
 * Bi-directional Event Bridge decoupling React UI from Phaser 3 Game Engine.
 */
class GameEventBridge extends Phaser.Events.EventEmitter {
  private static instance: GameEventBridge;

  private constructor() {
    super();
  }

  public static getInstance(): GameEventBridge {
    if (!GameEventBridge.instance) {
      GameEventBridge.instance = new GameEventBridge();
    }
    return GameEventBridge.instance;
  }

  public clearAllListeners(): void {
    this.removeAllListeners();
  }
}

export const eventBridge = GameEventBridge.getInstance();

export const GAME_EVENTS = {
  // From Phaser -> React
  SCORE_UPDATED: 'SCORE_UPDATED',
  COMBO_UPDATED: 'COMBO_UPDATED',
  SHOTS_UPDATED: 'SHOTS_UPDATED',
  BOARD_UPDATED: 'BOARD_UPDATED',
  NEXT_BUBBLE_READY: 'NEXT_BUBBLE_READY',
  LEVEL_WON: 'LEVEL_WON',
  LEVEL_LOST: 'LEVEL_LOST',
  GAME_STATE_CHANGED: 'GAME_STATE_CHANGED',

  // From React -> Phaser
  PAUSE_GAME: 'PAUSE_GAME',
  RESUME_GAME: 'RESUME_GAME',
  RESTART_LEVEL: 'RESTART_LEVEL',
  LOAD_LEVEL: 'LOAD_LEVEL',
  SWAP_BUBBLES: 'SWAP_BUBBLES',
  USE_POWERUP: 'USE_POWERUP',
  AUDIO_SETTINGS_CHANGED: 'AUDIO_SETTINGS_CHANGED',
  APPLY_WELCOME_BONUS: 'APPLY_WELCOME_BONUS'
} as const;
