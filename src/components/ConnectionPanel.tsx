import React from 'react';
import { PixelButton } from './PixelButton';

interface ConnectionPanelProps {
  isConnected: boolean;
  isMockMode: boolean;
  deviceName?: string;
  isSupported: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMock: () => void;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  isConnected,
  isMockMode,
  deviceName,
  isSupported,
  onConnect,
  onDisconnect,
  onToggleMock,
}) => {
  return (
    <div className="bg-[#fffefb] border-2 border-black p-2.5 rounded-xl font-pixel flex flex-wrap items-center justify-between gap-2 shadow-[3px_3px_0px_#38bdf8]">
      {/* Device Connection Status Indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full border border-black ${
            isConnected
              ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
              : 'bg-rose-400'
          }`}
        />
        <div className="flex flex-col">
          <span className="text-xs text-slate-900 font-bold">
            DEVICE: {isConnected ? (isMockMode ? 'MOCK MODE' : 'CONNECTED') : 'DISCONNECTED'}
          </span>
          {deviceName && <span className="text-[10px] text-sky-700">{deviceName}</span>}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {!isSupported && (
          <span className="text-[10px] text-rose-600 bg-rose-100 px-2 py-1 border border-rose-300 rounded font-bold">
            Web Serial 미지원 (Chrome 권장)
          </span>
        )}

        {isConnected ? (
          <PixelButton variant="danger" size="sm" onClick={onDisconnect}>
            연결 해제
          </PixelButton>
        ) : (
          <PixelButton
            variant="ac-mint"
            size="sm"
            onClick={onConnect}
            disabled={!isSupported}
          >
            🔌 Arduino 연결
          </PixelButton>
        )}

        <PixelButton
          variant={isMockMode ? 'ac-cream' : 'ac-cyan'}
          size="sm"
          onClick={onToggleMock}
        >
          {isMockMode ? '🧪 Mock ON' : '🧪 Mock Mode'}
        </PixelButton>
      </div>
    </div>
  );
};
