import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/GameScene';
import { HUD } from './HUD';
import { VictoryModal, GameOverModal, PauseModal } from './Modals';
import { LevelSelect } from './LevelSelect';
import { WelcomeScreen } from './WelcomeScreen';
import { PhoneLoginModal } from './PhoneLoginModal';
import { RewardModal } from './RewardModal';
import { QRCodeModal } from './QRCodeModal';
import { eventBridge, GAME_EVENTS } from '../game/EventBridge';
import { GameStats, LevelConfig } from '../types/game';
import { LEVELS } from '../levels/levelData';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { audioManager } from '../audio/AudioManager';
import { apiService } from '../services/api';

export const GameShell: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Level & Session
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    shotsLeft: LEVELS[0].maxShots,
    combo: 0,
    maxCombo: 0,
    level: 1,
    stars: 0,
    boardOccupancy: 0.35,
    gameStatus: 'PLAYING'
  });

  // Flow States: Quét QR > Ra game > Bấm/chơi > Nhập SĐT > Có thông báo thưởng > Lưu SĐT > Chơi
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const modalParam = urlParams ? urlParams.get('modal') : null;

  const [playerPhone, setPlayerPhone] = useState<string | null>(() => apiService.getPlayerPhone() || (modalParam === 'reward' ? '0912345678' : null));
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    if (modalParam) return modalParam === 'welcome';
    return !apiService.getPlayerPhone();
  });
  const [isPhoneLoginOpen, setIsPhoneLoginOpen] = useState<boolean>(() => modalParam === 'phone');
  const [isRewardModalOpen, setIsRewardModalOpen] = useState<boolean>(() => modalParam === 'reward');
  const [isQROpen, setIsQROpen] = useState<boolean>(() => modalParam === 'qr');

  // Control modals & settings
  const [isPaused, setIsPaused] = useState<boolean>(() => modalParam === 'pause');
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(() => modalParam === 'level');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);

  // Modal outcomes
  const [winModalData, setWinModalData] = useState<{
    level: number;
    score: number;
    stars: number;
    shotsRemaining: number;
  } | null>(() => modalParam === 'win' ? { level: 1, score: 3250, stars: 3, shotsRemaining: 6 } : null);

  const [loseModalData, setLoseModalData] = useState<{
    score: number;
    reason: string;
  } | null>(() => modalParam === 'lose' ? { score: 1450, reason: 'Hết bóng bắn!' } : null);

  // Pause on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const isAnyModalOpen = isWelcomeOpen || isPhoneLoginOpen || isRewardModalOpen || isQROpen || isPaused;
        if (!isAnyModalOpen) {
          handlePause();
        } else if (isPaused) {
          handleResume();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWelcomeOpen, isPhoneLoginOpen, isRewardModalOpen, isQROpen, isPaused]);

  // Pause game if in welcome or auth flow
  useEffect(() => {
    if (isWelcomeOpen || isPhoneLoginOpen || isRewardModalOpen) {
      handlePause();
    }
  }, [isWelcomeOpen, isPhoneLoginOpen, isRewardModalOpen]);

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
        noAudio: true
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
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Update scene when level changes
  const switchLevel = (levelConfig: LevelConfig) => {
    setCurrentLevel(levelConfig);
    setWinModalData(null);
    setLoseModalData(null);
    setIsPaused(false);
    setIsLevelSelectOpen(false);

    apiService.startSession(levelConfig.level);

    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.loadLevel(levelConfig);
      }
    }
  };

  const handleNextLevel = () => {
    const nextIdx = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    if (nextIdx < LEVELS.length) {
      switchLevel(LEVELS[nextIdx]);
    } else {
      switchLevel(LEVELS[0]);
    }
  };

  const handleRestartLevel = () => {
    switchLevel(currentLevel);
  };

  const handleSelectLevel = (lvl: LevelConfig) => {
    switchLevel(lvl);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) scene.scene.pause();
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) scene.scene.resume();
    }
  };

  const handleToggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioManager.setMuted(newMute);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioManager.setVolume(vol);
  };

  // STEP 2: User clicks "Bấm để chơi ngay" on Welcome screen -> opens phone login
  const handleWelcomeStart = () => {
    setIsWelcomeOpen(false);
    if (!playerPhone) {
      setIsPhoneLoginOpen(true);
    } else {
      handleResume();
    }
  };

  // STEP 4: User successfully enters phone -> save, award bonus, open celebration reward modal
  const handlePhoneSuccess = (phone: string) => {
    setPlayerPhone(phone);
    setIsPhoneLoginOpen(false);
    setIsRewardModalOpen(true);
    eventBridge.emit(GAME_EVENTS.APPLY_WELCOME_BONUS, { bonusShots: 5, bonusScore: 500 });
  };

  // STEP 5: User clicks "Vào bắn ngay" on reward modal -> start playing
  const handleStartPlayingAfterReward = () => {
    setIsRewardModalOpen(false);
    handleResume();
  };

  // Switch account / re-enter phone
  const handleChangePhone = () => {
    setIsQROpen(false);
    setIsPhoneLoginOpen(true);
  };

  return (
    <div className="game-viewport">
      {/* Ambient Cosmic Background Lighting (Enriches desktop & tablet atmosphere) */}
      <div className="absolute -top-12 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-16 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-pink-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Game Canvas Container */}
      <div className="game-canvas-wrapper">
        {/* React Top HUD */}
        <HUD
          stats={stats}
          targetScore={currentLevel.targetScore}
          levelTitle={currentLevel.title}
          starThresholds={currentLevel.starThresholds}
          isMuted={isMuted}
          playerPhone={playerPhone}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onBack={() => {
            setIsLevelSelectOpen(true);
            handlePause();
          }}
          onOpenQR={() => {
            setIsQROpen(true);
            handlePause();
          }}
        />

        {/* Phaser 3 Canvas Container */}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* FULLSCREEN POPUP MODALS - RENDERED IN TRUE VIEWPORT CENTER */}

      {/* STEP 2: Welcome / Splash Screen (Bấm / Chơi) */}
      {isWelcomeOpen && (
        <WelcomeScreen
          onStartClick={handleWelcomeStart}
          onOpenQR={() => {
            setIsWelcomeOpen(false);
            setIsQROpen(true);
          }}
        />
      )}

      {/* STEP 4: Phone Gate Modal (Nhập SĐT) */}
      {isPhoneLoginOpen && (
        <PhoneLoginModal
          onSuccess={handlePhoneSuccess}
          onClose={playerPhone ? () => {
            setIsPhoneLoginOpen(false);
            handleResume();
          } : undefined}
          initialPhone={playerPhone || ''}
        />
      )}

      {/* STEP 5: Reward Notification Modal (Có thông báo thưởng + Confetti) */}
      {isRewardModalOpen && (
        <RewardModal
          phone={playerPhone || ''}
          onStartPlaying={handleStartPlayingAfterReward}
        />
      )}

      {/* QR Code Sharing Modal */}
      {isQROpen && (
        <QRCodeModal
          currentPhone={playerPhone || ''}
          onClose={() => {
            setIsQROpen(false);
            if (!playerPhone) {
              setIsWelcomeOpen(true);
            } else {
              handleResume();
            }
          }}
          onChangePhone={handleChangePhone}
        />
      )}

      {/* Pause Modal */}
      {isPaused && !isWelcomeOpen && !isPhoneLoginOpen && !isRewardModalOpen && !isQROpen && (
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
  );
};
