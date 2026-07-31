import { useState, useEffect, useCallback } from 'react';
import type { PetState, PetStatusType, BackgroundTheme } from './types/pet';
import type { MissionDefinition, ActiveMissionState } from './types/mission';
import type { SerialIncomingMessage } from './types/serial';
import { MISSIONS, MISSION_LIST } from './data/missions';
import { loadPetState, savePetState, resetPetState, loadSoundSetting, saveSoundSetting } from './utils/storage';
import { getLevelFromExp, getStageFromLevel, getExpProgress } from './utils/level';
import { useSerial } from './hooks/useSerial';
import { soundService } from './services/soundService';

import { PetCharacter } from './components/PetCharacter';
import { StatusGauge } from './components/StatusGauge';
import { MissionPanel } from './components/MissionPanel';
import { PixelButton } from './components/PixelButton';
import { ConnectionPanel } from './components/ConnectionPanel';
import { LevelUpModal } from './components/LevelUpModal';
import { TutorialModal } from './components/TutorialModal';
import { SettingsModal } from './components/SettingsModal';
import { DeveloperPanel } from './components/DeveloperPanel';
import { PixelHeart } from './components/PixelHeart';

export function App() {
  const [screen, setScreen] = useState<'START' | 'GAME'>('START');
  const [pet, setPet] = useState<PetState>(loadPetState());
  const [background, setBackground] = useState<BackgroundTheme>('room');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundSetting());
  
  const [activeMission, setActiveMission] = useState<ActiveMissionState | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Sound sync
  useEffect(() => {
    soundService.setSoundEnabled(soundEnabled);
    saveSoundSetting(soundEnabled);
  }, [soundEnabled]);

  // Save pet state changes
  useEffect(() => {
    savePetState(pet);
  }, [pet]);

  // Handle incoming Serial JSON events from Arduino
  const handleSerialMessage = useCallback((msg: SerialIncomingMessage) => {
    switch (msg.type) {
      case 'mission_started': {
        const found = MISSIONS[msg.mission];
        if (found) {
          setActiveMission({
            mission: found,
            currentCount: 0,
            targetCount: found.targetCount,
            startTime: Date.now(),
            status: 'running',
          });
          soundService.playStart();
        }
        break;
      }

      case 'progress': {
        setActiveMission(prev => {
          if (!prev || prev.status !== 'running') return prev;
          soundService.playProgress();
          return {
            ...prev,
            currentCount: msg.current,
            targetCount: msg.target,
            cycleTimeMs: msg.cycleTime,
          };
        });
        break;
      }

      case 'mission_complete': {
        soundService.playSuccess();
        const expGained = msg.exp || 10;

        setActiveMission(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'completed',
            currentCount: prev.targetCount,
          };
        });

        setPet(prev => {
          const currentMissionDef = activeMission?.mission;
          const rewards = currentMissionDef?.rewards || { exp: expGained };

          const newExp = prev.exp + (rewards.exp || expGained);
          const oldLevel = prev.level;
          const newLevel = getLevelFromExp(newExp);

          const updated: PetState = {
            ...prev,
            exp: newExp,
            level: newLevel,
            hunger: Math.min(100, prev.hunger + (rewards.hunger || 0)),
            happiness: Math.min(100, prev.happiness + (rewards.happiness || 0)),
            energy: Math.min(100, prev.energy + (rewards.energy || 0)),
            health: Math.min(100, prev.health + (rewards.health || 0)),
          };

          if (newLevel > oldLevel) {
            setShowLevelUp(true);
            sendCommand('LEVELUP\n');
          }

          return updated;
        });
        break;
      }

      case 'action_failed': {
        soundService.playFailure();
        setActiveMission(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lastFeedback: msg.reason,
          };
        });
        break;
      }

      case 'mission_failed': {
        soundService.playFailure();
        setActiveMission(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'failed',
            failReason: msg.reason,
          };
        });
        break;
      }

      case 'levelup_complete': {
        console.log('Arduino acknowledged level up animation!');
        break;
      }

      default:
        break;
    }
  }, [activeMission]);

  // Initialize Serial Hook
  const {
    isSupported,
    isConnected,
    isMockMode,
    deviceName,
    logs,
    lastTelemetry,
    connect,
    disconnect,
    toggleMockMode,
    clearLogs,
    sendCommand,
    triggerMockProgress,
    triggerMockComplete,
    triggerMockFailed,
    triggerMockSensor,
  } = useSerial(handleSerialMessage);

  const handleStartMission = (mission: MissionDefinition) => {
    setActiveMission({
      mission,
      currentCount: 0,
      targetCount: mission.targetCount,
      startTime: Date.now(),
      status: 'running',
    });
    sendCommand(mission.serialCommand);
  };

  const handleCancelMission = () => {
    setActiveMission(null);
    sendCommand('MISSION:CANCEL\n');
  };

  const handleMockProgressStep = () => {
    if (!activeMission || activeMission.status !== 'running') return;
    const nextCount = activeMission.currentCount + 1;
    if (nextCount >= activeMission.targetCount) {
      triggerMockComplete(activeMission.mission.id, activeMission.mission.rewards.exp);
    } else {
      triggerMockProgress(activeMission.mission.id, nextCount, activeMission.targetCount);
    }
  };

  const getPetStatus = (): PetStatusType => {
    if (showLevelUp) return 'levelup';
    if (activeMission?.status === 'running') {
      if (activeMission.mission.id === 'EXERCISE') return 'exercising';
      return 'happy';
    }
    if (activeMission?.status === 'completed') return 'happy';
    if (pet.health < 30) return 'sick';
    if (pet.hunger < 30) return 'hungry';
    if (pet.energy < 30) return 'tired';
    if (background === 'night') return 'sleeping';
    if (pet.happiness > 80) return 'happy';
    return 'idle';
  };

  const expInfo = getExpProgress(pet.exp);
  const currentStage = getStageFromLevel(pet.level);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-sky-100 via-teal-50 to-pink-100 text-slate-900 flex items-center justify-center p-2 sm:p-4 font-pixel selection:bg-sky-200 overflow-hidden relative">
      {/* Background Leaves & Polka Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Main Container - Expands to fill screen richly (max-w-6xl w-[96vw] h-[95vh]) */}
      <div className="z-10 w-full max-w-6xl h-[95vh] bg-[#fffefb] border-4 border-black p-3 sm:p-4 rounded-3xl shadow-[8px_8px_0px_#38bdf8,8px_8px_0px_4px_#000] flex flex-col justify-between overflow-hidden">
        
        {/* Animal Crossing Window Titlebar Header */}
        <div className="pixel-window-header mb-2.5">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <span>🍃</span>
            <span>PIXEL PET LAB ✦ ANIMAL CROSSING TOWN EDITION</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-sky-100 hidden sm:inline">FULLSCREEN VIEWPORT FIT</span>
            <div className="flex gap-1">
              <span className="pixel-win-btn">_</span>
              <span className="pixel-win-btn">□</span>
              <span className="pixel-win-btn">X</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* START SCREEN VIEW (Animal Crossing Town - Full Fit)       */}
        {/* ======================================================== */}
        {screen === 'START' ? (
          <div className="relative flex-1 bg-gradient-to-b from-sky-200 via-teal-100 to-emerald-100 border-3 border-black rounded-xl p-4 sm:p-6 text-center flex flex-col justify-between overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.8)]">
            
            {/* Parallax Clouds & Leaves */}
            <div className="absolute top-2 left-0 w-full h-16 pointer-events-none overflow-hidden z-0 opacity-90">
              <div className="absolute top-1 left-0 text-2xl font-pixel animate-cloud-slow">
                ☁️ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🍃 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☁️
              </div>
              <div className="absolute top-6 left-1/3 text-xl font-pixel animate-cloud-fast">
                ☁️ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🌸 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🍃
              </div>
            </div>

            {/* Title Section */}
            <div className="z-10 space-y-1 pt-2">
              <div className="text-[11px] text-sky-800 uppercase tracking-widest font-bold drop-shadow-[1px_1px_0_#fff]">
                🍃 ANIMAL CROSSING PASTEL TOWN 🍃
              </div>

              <div className="py-1">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-sky-600 drop-shadow-[3px_3px_0_#fff] tracking-wider transform -rotate-1">
                  PIXEL PET LAB
                </h1>
                <div className="text-xs sm:text-lg font-bold text-slate-800 drop-shadow-[1px_1px_0_#fff] tracking-widest">
                  현실의 행동으로 키우는 나만의 펫
                </div>
              </div>
            </div>

            {/* Central Character Preview Box */}
            <div className="z-10 my-auto py-1 relative">
              <div className="w-36 h-36 mx-auto bg-white/90 border-3 border-black rounded-2xl p-2 flex items-center justify-center shadow-[4px_4px_0px_#38bdf8]">
                <div className="animate-bounce text-6xl drop-shadow-[2px_4px_0_rgba(56,189,248,0.3)]">
                  {currentStage === 'EGG' ? '🥚' : currentStage === 'BABY' ? '🐤' : currentStage === 'PET' ? '🐶' : '👑'}
                </div>
              </div>
              <span className="absolute top-1 right-1/3 text-2xl animate-ping">✨</span>
              <span className="absolute bottom-1 left-1/3 animate-bounce">
                <PixelHeart size={20} color="#38bdf8" />
              </span>
            </div>

            {/* Connection Bar */}
            <div className="z-10 max-w-lg mx-auto w-full">
              <ConnectionPanel
                isConnected={isConnected}
                isMockMode={isMockMode}
                deviceName={deviceName}
                isSupported={isSupported}
                onConnect={connect}
                onDisconnect={disconnect}
                onToggleMock={toggleMockMode}
              />
            </div>

            {/* Flashing PRESS START & Action Buttons */}
            <div className="z-10 space-y-3 pt-2">
              <div
                className="text-sm sm:text-base text-sky-700 font-bold tracking-widest animate-pulse cursor-pointer"
                onClick={() => {
                  soundService.playStart();
                  setScreen('GAME');
                }}
              >
                PRESS START BUTTON!
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <PixelButton
                  variant="ac-cyan"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    soundService.playStart();
                    setScreen('GAME');
                  }}
                >
                  ▶ PLAY GAME (게임 시작)
                </PixelButton>

                <PixelButton
                  variant="ac-cream"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setPet(loadPetState());
                    setScreen('GAME');
                  }}
                >
                  📂 LOAD GAME (불러오기)
                </PixelButton>
              </div>

              <div className="flex justify-center gap-3 pt-1 text-xs">
                <PixelButton
                  variant={soundEnabled ? 'ac-mint' : 'dark'}
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF'}
                </PixelButton>

                <PixelButton
                  variant="ac-pink"
                  size="sm"
                  onClick={() => setShowTutorial(true)}
                >
                  ❓ TUTORIAL
                </PixelButton>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* MAIN GAME SCREEN VIEW (Screen-Filling Layout)             */
          /* ======================================================== */
          <div className="flex-1 flex flex-col justify-between gap-2.5 overflow-hidden z-10">
            {/* Top Status Bar */}
            <div className="bg-sky-50/90 border-2 border-black p-2.5 rounded-xl flex flex-wrap justify-between items-center gap-2 shadow-[3px_3px_0px_#38bdf8]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{pet.name}</span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 font-bold border border-black rounded-full shadow-[1px_1px_0px_#000]">
                    LV.{pet.level} {currentStage}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-sky-900 font-bold">
                  <span>EXP {expInfo.currentExpInLevel} / {expInfo.maxExpInLevel}</span>
                  <div className="w-36 h-2.5 bg-white border border-black rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${expInfo.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full border border-black ${
                    isConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-rose-400'
                  }`}
                  title={isConnected ? 'Arduino Connected' : 'Disconnected'}
                />

                <PixelButton
                  variant="ac-cyan"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  ⚙️ 설정
                </PixelButton>

                <PixelButton
                  variant="ac-pink"
                  size="sm"
                  onClick={() => setScreen('START')}
                >
                  🏠 타이틀
                </PixelButton>
              </div>
            </div>

            {/* Widescreen 2-Column Grid filling container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
              {/* Left Column: Pet Character Screen & Gauges (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-2.5 min-h-0">
                <PetCharacter
                  stage={currentStage}
                  status={getPetStatus()}
                  background={background}
                  name={pet.name}
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <StatusGauge label="HUNGER" value={pet.hunger} icon="🍚" color="amber" />
                  <StatusGauge label="HAPPY" value={pet.happiness} icon="💖" color="pink" />
                  <StatusGauge label="ENERGY" value={pet.energy} icon="⚡" color="cyan" />
                  <StatusGauge label="HEALTH" value={pet.health} icon="💊" color="emerald" />
                </div>
              </div>

              {/* Right Column: Mission Panel & Connection (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-2.5 min-h-0">
                <MissionPanel
                  missions={MISSION_LIST}
                  activeMission={activeMission}
                  onStartMission={handleStartMission}
                  onCancelMission={handleCancelMission}
                  onMockProgressStep={handleMockProgressStep}
                  onMockComplete={() => triggerMockComplete(activeMission?.mission.id || 'PET', 15)}
                  onMockFail={() => triggerMockFailed(activeMission?.mission.id || 'PET', 'TIMEOUT')}
                  isMockMode={isMockMode || !isConnected}
                />

                <ConnectionPanel
                  isConnected={isConnected}
                  isMockMode={isMockMode}
                  deviceName={deviceName}
                  isSupported={isSupported}
                  onConnect={connect}
                  onDisconnect={disconnect}
                  onToggleMock={toggleMockMode}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-[10px] text-sky-700 pt-1.5 border-t border-sky-200">
          <div className="flex items-center gap-1.5">
            <span>🍃 ANIMAL CROSSING TOWN ENGINE</span>
          </div>
          <span>WEB SERIAL API (9600 BAUD)</span>
        </div>
      </div>

      {/* Modals & Developer Drawer */}
      <LevelUpModal
        isOpen={showLevelUp}
        newLevel={pet.level}
        newStage={currentStage}
        petName={pet.name}
        onClose={() => setShowLevelUp(false)}
      />

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        petName={pet.name}
        background={background}
        soundEnabled={soundEnabled}
        onClose={() => setShowSettings(false)}
        onRenamePet={name => setPet(prev => ({ ...prev, name }))}
        onChangeBackground={setBackground}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onResetData={() => {
          const fresh = resetPetState();
          setPet(fresh);
          setActiveMission(null);
        }}
      />

      <DeveloperPanel
        isConnected={isConnected}
        isMockMode={isMockMode}
        logs={logs}
        lastDistance={lastTelemetry.distance}
        lastButtonState={lastTelemetry.button}
        onToggleMock={toggleMockMode}
        onClearLogs={clearLogs}
        onSendCommand={sendCommand}
        onAddExp={amount => {
          setPet(prev => {
            const newExp = prev.exp + amount;
            const newLevel = getLevelFromExp(newExp);
            if (newLevel > prev.level) {
              setShowLevelUp(true);
              sendCommand('LEVELUP\n');
            }
            return { ...prev, exp: newExp, level: newLevel };
          });
        }}
        onForceLevelUp={() => {
          setPet(prev => {
            const nextLvl = Math.min(4, prev.level + 1);
            const expTarget = nextLvl === 2 ? 100 : nextLvl === 3 ? 250 : 450;
            setShowLevelUp(true);
            sendCommand('LEVELUP\n');
            return { ...prev, level: nextLvl, exp: expTarget };
          });
        }}
        onResetPetStats={() => {
          setPet(prev => ({
            ...prev,
            hunger: 100,
            happiness: 100,
            energy: 100,
            health: 100,
          }));
        }}
        onTriggerMockProgress={triggerMockProgress}
        onTriggerMockComplete={triggerMockComplete}
        onTriggerMockFailed={triggerMockFailed}
        onTriggerMockSensor={triggerMockSensor}
      />
    </div>
  );
}

export default App;
