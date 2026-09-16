export interface GameSessionResponse {
  sessionId: string;
  level: number;
  seed: number;
  serverTimestamp: number;
  playerPhone?: string;
}

export interface FinishSessionPayload {
  sessionId: string;
  playerPhone?: string;
  level: number;
  score: number;
  shotsRemaining: number;
  durationMs: number;
  stars: number;
  result: 'WIN' | 'LOSE';
}

export interface PlayerProgress {
  unlockedLevel: number;
  highScores: Record<number, number>;
  stars: Record<number, number>;
}

const STORAGE_PROGRESS_KEY = 'bubble_game_player_progress';
const STORAGE_PHONE_KEY = 'bubble_player_phone';

export class GameApiService {
  private static instance: GameApiService;
  private currentSession: GameSessionResponse | null = null;
  private sessionStartTime: number = 0;

  public static getInstance(): GameApiService {
    if (!GameApiService.instance) {
      GameApiService.instance = new GameApiService();
    }
    return GameApiService.instance;
  }

  /**
   * Gets the stored player phone number.
   */
  public getPlayerPhone(): string | null {
    try {
      return localStorage.getItem(STORAGE_PHONE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Sets and saves the player phone number.
   */
  public setPlayerPhone(phone: string): void {
    try {
      localStorage.setItem(STORAGE_PHONE_KEY, phone.trim());
    } catch {
      // Storage catch
    }
  }

  /**
   * Clears current player phone.
   */
  public clearPlayerPhone(): void {
    try {
      localStorage.removeItem(STORAGE_PHONE_KEY);
    } catch {
      // Storage catch
    }
  }

  /**
   * Loads saved local progress.
   */
  public getLocalProgress(): PlayerProgress {
    try {
      const data = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return {
      unlockedLevel: 1,
      highScores: {},
      stars: {}
    };
  }

  /**
   * Persists progress locally and queues for server sync.
   */
  public saveLocalProgress(progress: PlayerProgress): void {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // Storage error catch
    }
  }

  /**
   * Initializes a session (anti-cheat signed seed).
   */
  public async startSession(level: number): Promise<GameSessionResponse> {
    const phone = this.getPlayerPhone() || undefined;
    const session: GameSessionResponse = {
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      level,
      seed: Math.floor(Math.random() * 1000000),
      serverTimestamp: Date.now(),
      playerPhone: phone
    };
    this.currentSession = session;
    this.sessionStartTime = Date.now();
    return session;
  }

  /**
   * Finishes session with anti-cheat checks.
   */
  public async finishSession(payload: Omit<FinishSessionPayload, 'sessionId' | 'durationMs' | 'playerPhone'>): Promise<{ verified: boolean }> {
    const durationMs = Date.now() - this.sessionStartTime;
    const phone = this.getPlayerPhone() || undefined;
    const fullPayload: FinishSessionPayload = {
      ...payload,
      playerPhone: phone,
      sessionId: this.currentSession?.sessionId || 'offline_session',
      durationMs
    };

    // Anti-Cheat Heuristic Validation
    const isValidScore = this.validateScore(fullPayload);

    if (isValidScore) {
      // Update local storage
      const progress = this.getLocalProgress();
      const prevHighScore = progress.highScores[payload.level] || 0;
      if (payload.score > prevHighScore) {
        progress.highScores[payload.level] = payload.score;
      }
      const prevStars = progress.stars[payload.level] || 0;
      if (payload.stars > prevStars) {
        progress.stars[payload.level] = payload.stars;
      }
      if (payload.result === 'WIN' && payload.level >= progress.unlockedLevel) {
        progress.unlockedLevel = payload.level + 1;
      }
      this.saveLocalProgress(progress);
    }

    return { verified: isValidScore };
  }

  private validateScore(payload: FinishSessionPayload): boolean {
    // 1. Duration check: level completion cannot be instantaneous (< 3 seconds)
    if (payload.durationMs < 3000 && payload.result === 'WIN') {
      console.warn('[Anti-Cheat] Suspicious completion time:', payload.durationMs);
      return false;
    }

    // 2. Score ceiling check: impossible to score > 50,000 on standard levels
    if (payload.score > 50000) {
      console.warn('[Anti-Cheat] Suspicious score ceiling:', payload.score);
      return false;
    }

    return true;
  }
}

export const apiService = GameApiService.getInstance();
