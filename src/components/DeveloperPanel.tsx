import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import type { MissionType } from '../types/mission';

interface DeveloperPanelProps {
  isConnected: boolean;
  isMockMode: boolean;
  logs: string[];
  lastDistance: number;
  lastButtonState: boolean;
  onToggleMock: () => void;
  onClearLogs?: () => void;
  onSendCommand: (cmd: string) => void;
  onAddExp: (amount: number) => void;
  onForceLevelUp: () => void;
  onResetPetStats: () => void;
  onTriggerMockProgress: (mission: MissionType, current: number, target: number) => void;
  onTriggerMockComplete: (mission: MissionType, exp: number) => void;
  onTriggerMockFailed: (mission: MissionType, reason: string) => void;
  onTriggerMockSensor: (distance: number, button: boolean) => void;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  isConnected,
  isMockMode,
  logs,
  lastDistance,
  lastButtonState,
  onToggleMock,
  onClearLogs,
  onSendCommand,
  onAddExp,
  onForceLevelUp,
  onResetPetStats,
  onTriggerMockProgress,
  onTriggerMockComplete,
  onTriggerMockFailed,
  onTriggerMockSensor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHEATS' | 'MOCK' | 'LOGS'>('CHEATS');
  const [customCmd, setCustomCmd] = useState('');
  const [simDistance, setSimDistance] = useState(lastDistance || 20);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCmd.trim()) {
      onSendCommand(customCmd.trim());
      setCustomCmd('');
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 font-pixel flex ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2.5rem)]'
      }`}
    >
      {/* Side Toggle Handle (MapleStory Tab Style - Reference Image 2 & 3) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-36 bg-pink-400 text-white border-y-4 border-l-4 border-black my-auto font-bold text-xs flex items-center justify-center writing-mode-vertical shadow-[-4px_4px_0px_#000] cursor-pointer hover:bg-pink-300 select-none rounded-l-xl"
      >
        {isOpen ? '▶ DEV CLOSE' : '◀ DEV CONSOLE'}
      </button>

      {/* Main Drawer Window (MapleStory / Stardew Book Window - Reference Image 2 & 3) */}
      <div className="w-80 sm:w-96 h-full bg-pink-50 border-l-4 border-black text-pink-950 overflow-y-auto shadow-[-10px_0px_0px_rgba(244,114,182,0.5)] flex flex-col justify-between p-3">
        
        {/* Retro OS Window Titlebar (Reference Image 1 & 2) */}
        <div>
          <div className="pixel-window-header pink rounded-t-lg mb-3">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span>🛠️</span>
              <span>DEV CONSOLE & INVENTORY</span>
            </span>
            <div className="flex gap-1">
              <span className="pixel-win-btn">_</span>
              <span className="pixel-win-btn">□</span>
              <span className="pixel-win-btn cursor-pointer" onClick={() => setIsOpen(false)}>X</span>
            </div>
          </div>

          {/* RPG Tabs (Reference Image 2: ITEM INVENTORY Tabs) */}
          <div className="flex border-b-2 border-black mb-3">
            <button
              onClick={() => setActiveTab('CHEATS')}
              className={`flex-1 py-1.5 text-xs font-bold border-t-2 border-x-2 border-black rounded-t-lg transition-all ${
                activeTab === 'CHEATS'
                  ? 'bg-white text-pink-950 border-b-0 -mb-[2px] font-extrabold shadow-[0_-2px_0_#ec4899]'
                  : 'bg-pink-200 text-pink-700 hover:bg-pink-100'
              }`}
            >
              🎮 치트 & 상태
            </button>

            <button
              onClick={() => setActiveTab('MOCK')}
              className={`flex-1 py-1.5 text-xs font-bold border-t-2 border-x-2 border-black rounded-t-lg transition-all ${
                activeTab === 'MOCK'
                  ? 'bg-white text-pink-950 border-b-0 -mb-[2px] font-extrabold shadow-[0_-2px_0_#ec4899]'
                  : 'bg-pink-200 text-pink-700 hover:bg-pink-100'
              }`}
            >
              🧪 모의 이벤트
            </button>

            <button
              onClick={() => setActiveTab('LOGS')}
              className={`flex-1 py-1.5 text-xs font-bold border-t-2 border-x-2 border-black rounded-t-lg transition-all ${
                activeTab === 'LOGS'
                  ? 'bg-white text-pink-950 border-b-0 -mb-[2px] font-extrabold shadow-[0_-2px_0_#ec4899]'
                  : 'bg-pink-200 text-pink-700 hover:bg-pink-100'
              }`}
            >
              📜 시리얼 로그
            </button>
          </div>

          {/* TAB 1: CHEATS & SYSTEM CONTROL */}
          {activeTab === 'CHEATS' && (
            <div className="space-y-3">
              {/* Connection Status Box */}
              <div className="bg-white border-2 border-black p-3 rounded-xl space-y-2 text-xs shadow-[2px_2px_0px_#f472b6]">
                <div className="flex justify-between items-center">
                  <span className="font-bold">SERIAL STATE:</span>
                  <span className={isConnected ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                    {isConnected ? (isMockMode ? 'MOCK MODE' : 'CONNECTED') : 'DISCONNECTED'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-pink-100">
                  <span className="font-bold">MOCK MODE:</span>
                  <PixelButton
                    variant={isMockMode ? 'pastel-yellow' : 'dark'}
                    size="sm"
                    onClick={onToggleMock}
                  >
                    {isMockMode ? 'ON (가상)' : 'OFF (실제)'}
                  </PixelButton>
                </div>
              </div>

              {/* Direct Serial Command Input */}
              <form onSubmit={handleSend} className="bg-white border-2 border-black p-3 rounded-xl space-y-2 shadow-[2px_2px_0px_#f472b6]">
                <label className="text-[11px] text-pink-950 font-bold block">시리얼 명령 직접 전송</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customCmd}
                    onChange={e => setCustomCmd(e.target.value)}
                    placeholder="e.g. MISSION:FEED"
                    className="bg-pink-50 border border-black text-pink-950 text-xs px-2.5 py-1.5 flex-1 font-pixel rounded focus:outline-none focus:border-pink-500"
                  />
                  <PixelButton variant="primary" size="sm" type="submit">
                    전송
                  </PixelButton>
                </div>
              </form>

              {/* Cheats Panel */}
              <div className="bg-white border-2 border-black p-3 rounded-xl space-y-2.5 shadow-[2px_2px_0px_#f472b6]">
                <span className="text-xs text-pink-950 font-bold block">🎮 치트 & 상태 조작</span>
                <div className="grid grid-cols-2 gap-2">
                  <PixelButton variant="pastel-cyan" size="sm" onClick={() => onAddExp(50)}>
                    +50 EXP
                  </PixelButton>
                  <PixelButton variant="pastel-yellow" size="sm" onClick={onForceLevelUp}>
                    레벨업 테스트
                  </PixelButton>
                  <PixelButton variant="pastel-mint" size="sm" onClick={onResetPetStats}>
                    상태 Full (100)
                  </PixelButton>
                  <PixelButton variant="danger" size="sm" onClick={() => onSendCommand('MISSION:CANCEL')}>
                    미션 취소 명령
                  </PixelButton>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOCK EVENTS SIMULATION */}
          {activeTab === 'MOCK' && (
            <div className="space-y-3">
              <div className="bg-white border-2 border-black p-3 rounded-xl space-y-2.5 shadow-[2px_2px_0px_#f472b6]">
                <span className="text-xs text-pink-950 font-bold block">🧪 모의 JSON 이벤터 (Mock Event)</span>
                <div className="grid grid-cols-2 gap-2">
                  <PixelButton
                    variant="pastel-mint"
                    size="sm"
                    onClick={() => onTriggerMockComplete('PET', 15)}
                  >
                    미션 성공 (PET)
                  </PixelButton>
                  <PixelButton
                    variant="danger"
                    size="sm"
                    onClick={() => onTriggerMockFailed('PET', 'MOVE_SLOWLY')}
                  >
                    미션 실패 (PET)
                  </PixelButton>
                  <PixelButton
                    variant="pastel-cyan"
                    size="sm"
                    onClick={() => onTriggerMockProgress('EXERCISE', 3, 5)}
                  >
                    진행도 (3/5)
                  </PixelButton>
                  <PixelButton
                    variant="pastel-purple"
                    size="sm"
                    onClick={() => onTriggerMockProgress('EXERCISE', 5, 5)}
                  >
                    진행 완료 (5/5)
                  </PixelButton>
                </div>
              </div>

              {/* Sensor Telemetry Slider */}
              <div className="bg-white border-2 border-black p-3 rounded-xl space-y-2.5 shadow-[2px_2px_0px_#f472b6]">
                <div className="flex justify-between text-xs text-pink-950 font-bold">
                  <span>초음파 거리: {simDistance.toFixed(1)} cm</span>
                  <span>스위치: {lastButtonState ? 'PRESSED' : 'RELEASED'}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={simDistance}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setSimDistance(val);
                    onTriggerMockSensor(val, lastButtonState);
                  }}
                  className="w-full accent-pink-500 cursor-pointer"
                />
                <PixelButton
                  variant="pastel-pink"
                  size="sm"
                  className="w-full"
                  onClick={() => onTriggerMockSensor(simDistance, !lastButtonState)}
                >
                  스위치 토글 (ON/OFF)
                </PixelButton>
              </div>
            </div>
          )}

          {/* TAB 3: REALTIME LOGS */}
          {activeTab === 'LOGS' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white border-2 border-black p-2 rounded-t-xl">
                <span className="text-xs font-bold text-pink-950">수신/발신 JSON 로그 (최근 50개)</span>
                {onClearLogs && (
                  <PixelButton variant="dark" size="sm" className="text-[10px] py-0.5 px-2" onClick={onClearLogs}>
                    지우기
                  </PixelButton>
                )}
              </div>
              <div className="h-72 bg-black border-2 border-black p-2.5 rounded-b-xl overflow-y-auto text-[11px] font-mono leading-relaxed space-y-1 text-emerald-400 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]">
                {logs.length === 0 ? (
                  <span className="text-gray-500">수신된 로그가 없습니다.</span>
                ) : (
                  logs.map((l, idx) => (
                    <div key={idx} className="break-all border-b border-gray-900 pb-0.5">
                      {l}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-[10px] text-pink-500 text-center pt-2 border-t border-pink-200">
          DEVELOPER CONSOLE ✦ STARDOW & MAPLE UI
        </div>
      </div>
    </div>
  );
};
