import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/GameScene';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { GameStats, LevelConfig } from '../types/game';
import { LEVELS } from '../levels/levelData';
import { eventBridge, GAME_EVENTS } from '../game/EventBridge';
import { audioManager } from '../audio/AudioManager';
import { apiService } from '../services/api';
import { HUD } from './HUD';
import { VictoryModal, GameOverModal, PauseModal } from './Modals';
import { LevelSelect } from './LevelSelect';
import { DebugOverlay } from './DebugOverlay';

export const GameShell: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    shotsLeft: 28,
    level: 1,
    stars: 0,
    boardOccupancy: 0.35,
    gameStatus: 'PLAYING'
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(audioManager.getMuted());
  const [volume, setVolume] = useState(audioManager.getVolume());

  // Modal outcomes
  const [winModalData, setWinModalData] = useState<{
    level: number;
    score: number;
    stars: number;
    shotsRemaining: number;
  } | null>(null);

  const [loseModalData, setLoseModalData] = useState<{
    score: number;
    reason: string;
  } | null>(null);

  // Spacebar to swap bubbles
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        eventBridge.emit(GAME_EVENTS.SWAP_BUBBLES);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Phaser Game instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Start API session
    apiService.startSession(currentLevel.level);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerRef.current,
      backgroundColor: '#0a0e1a',
      audio: {
        noAudio: true // Phaser sound manager disabled; web game uses standalone audioManager
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [GameScene]
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Event listeners
    const handleScoreUpdated = (newStats: GameStats) => {
      setStats(prev => ({ ...prev, ...newStats }));
    };

    const handleLevelWon = async (data: {
      level: number;
      score: number;
      stars: number;
      shotsRemaining: number;
      maxCombo: number;
    }) => {
      setWinModalData({
        level: data.level,
        score: data.score,
        stars: data.stars,
        shotsRemaining: data.shotsRemaining
      });

      await apiService.finishSession({
        level: data.level,
        score: data.score,
        shotsRemaining: data.shotsRemaining,
        stars: data.stars,
        result: 'WIN'
      });
    };

    const handleLevelLost = async (data: {
      level: number;
      score: number;
      reason: string;
    }) => {
      setLoseModalData({
        score: data.score,
        reason: data.reason
      });

      await apiService.finishSession({
        level: data.level,
        score: data.score,
        shotsRemaining: 0,
        stars: 0,
        result: 'LOSE'
      });
    };

    eventBridge.on(GAME_EVENTS.SCORE_UPDATED, handleScoreUpdated);
    eventBridge.on(GAME_EVENTS.LEVEL_WON, handleLevelWon);
    eventBridge.on(GAME_EVENTS.LEVEL_LOST, handleLevelLost);

    return () => {
      eventBridge.off(GAME_EVENTS.SCORE_UPDATED, handleScoreUpdated);
      eventBridge.off(GAME_EVENTS.LEVEL_WON, handleLevelWon);
      eventBridge.off(GAME_EVENTS.LEVEL_LOST, handleLevelLost);
      eventBridge.clearAllListeners();
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Audio mute toggle
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioManager.setMuted(newMuted);
  };

  // Audio volume slider
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioManager.setVolume(vol);
  };

  // Pause toggle
  const handlePause = () => {
    setIsPaused(true);
    const game = gameRef.current;
    if (game) {
      const scene = game.scene.getScene('GameScene') as GameScene;
      if (scene && typeof scene.pauseGame === 'function') {
        scene.pauseGame();
      }
    }
    eventBridge.emit(GAME_EVENTS.PAUSE_GAME);
  };

  const handleResume = () => {
    setIsPaused(false);
    const game = gameRef.current;
    if (game) {
      const scene = game.scene.getScene('GameScene') as GameScene;
      if (scene && typeof scene.resumeGame === 'function') {
        scene.resumeGame();
      }
    }
    eventBridge.emit(GAME_EVENTS.RESUME_GAME);
  };

  const handleRestartLevel = () => {
    setIsPaused(false);
    setWinModalData(null);
    setLoseModalData(null);
    setStats({
      score: 0,
      shotsLeft: currentLevel.maxShots,
      combo: 0,
      maxCombo: 0,
      level: currentLevel.level,
      stars: 0,
      boardOccupancy: 0.35,
      gameStatus: 'PLAYING'
    });
    apiService.startSession(currentLevel.level);

    const game = gameRef.current;
    if (game && game.scene) {
      const scene = game.scene.getScene('GameScene') as GameScene;
      if (scene && scene.sys && scene.sys.settings.active && typeof scene.loadLevel === 'function') {
        scene.loadLevel(currentLevel);
        return;
      }
    }
    eventBridge.emit(GAME_EVENTS.RESTART_LEVEL);
  };

  const handleSelectLevel = (level: LevelConfig) => {
    setCurrentLevel(level);
    setIsLevelSelectOpen(false);
    setIsPaused(false);
    setWinModalData(null);
    setLoseModalData(null);
    setStats({
      score: 0,
      shotsLeft: level.maxShots,
      combo: 0,
      maxCombo: 0,
      level: level.level,
      stars: 0,
      boardOccupancy: 0.35,
      gameStatus: 'PLAYING'
    });
    apiService.startSession(level.level);

    const game = gameRef.current;
    if (game && game.scene) {
      const scene = game.scene.getScene('GameScene') as GameScene;
      if (scene && scene.sys && scene.sys.settings.active && typeof scene.loadLevel === 'function') {
        scene.loadLevel(level);
        return;
      }
    }
    eventBridge.emit(GAME_EVENTS.LOAD_LEVEL, level);
  };

  const handleNextLevel = () => {
    const currentLvlNum = winModalData ? winModalData.level : currentLevel.level;
    const nextIdx = LEVELS.findIndex(l => l.level === currentLvlNum) + 1;
    const nextLvl = LEVELS[nextIdx] || LEVELS[0];
    handleSelectLevel(nextLvl);
  };

  return (
    <div className="game-viewport">
      <div className="game-canvas-wrapper">
        {/* React Top HUD */}
        <HUD
          stats={stats}
          targetScore={currentLevel.targetScore}
          levelTitle={currentLevel.title}
          starThresholds={currentLevel.starThresholds}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
        />

        {/* Phaser 3 Canvas Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Debug Console Overlay */}
        <DebugOverlay stats={stats} levelConfig={currentLevel} />

        {/* Pause Modal */}
        {isPaused && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleRestartLevel}
            onLevelSelect={() => {
              setIsPaused(false);
              setIsLevelSelectOpen(true);
            }}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        )}

        {/* Victory Modal */}
        {winModalData && (
          <VictoryModal
            level={winModalData.level}
            score={winModalData.score}
            stars={winModalData.stars}
            shotsRemaining={winModalData.shotsRemaining}
            onNextLevel={handleNextLevel}
            onReplay={handleRestartLevel}
            onLevelSelect={() => {
              setWinModalData(null);
              setIsLevelSelectOpen(true);
            }}
          />
        )}

        {/* Game Over Modal */}
        {loseModalData && (
          <GameOverModal
            level={currentLevel.level}
            score={loseModalData.score}
            reason={loseModalData.reason}
            onRetry={handleRestartLevel}
            onLevelSelect={() => {
              setLoseModalData(null);
              setIsLevelSelectOpen(true);
            }}
          />
        )}

        {/* Level Select Modal */}
        {isLevelSelectOpen && (
          <LevelSelect
            currentLevel={currentLevel.level}
            onSelectLevel={handleSelectLevel}
            onClose={() => setIsLevelSelectOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
