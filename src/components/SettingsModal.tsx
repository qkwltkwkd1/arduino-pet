import React, { useState } from 'react';
import type { BackgroundTheme } from '../types/pet';
import { PixelButton } from './PixelButton';

interface SettingsModalProps {
  isOpen: boolean;
  petName: string;
  background: BackgroundTheme;
  soundEnabled: boolean;
  onClose: () => void;
  onRenamePet: (newName: string) => void;
  onChangeBackground: (bg: BackgroundTheme) => void;
  onToggleSound: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  petName,
  background,
  soundEnabled,
  onClose,
  onRenamePet,
  onChangeBackground,
  onToggleSound,
  onResetData,
}) => {
  const [inputName, setInputName] = useState(petName);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const bgOptions: { id: BackgroundTheme; label: string; icon: string }[] = [
    { id: 'room', label: '방 (ROOM)', icon: '🏠' },
    { id: 'park', label: '공원 (PARK)', icon: '🌳' },
    { id: 'restaurant', label: '식당 (RESTAURANT)', icon: '🍽️' },
    { id: 'hospital', label: '병원 (HOSPITAL)', icon: '🏥' },
    { id: 'playground', label: '운동장 (PLAYGROUND)', icon: '⚽' },
    { id: 'night', label: '밤하늘 (NIGHT)', icon: '🌙' },
  ];

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      onRenamePet(inputName.trim().toUpperCase().slice(0, 10));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-pixel">
      <div className="bg-purple-950 border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0px_#000] text-purple-100 space-y-5">
        <div className="flex justify-between items-center border-b-2 border-purple-800 pb-2">
          <h2 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
            <span>⚙️</span>
            <span>게임 설정 (SETTINGS)</span>
          </h2>
          <button onClick={onClose} className="text-purple-400 hover:text-white font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSaveName} className="space-y-2">
          <label className="text-xs text-purple-300 block">펫 이름 변경 (PET NAME)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              maxLength={10}
              className="bg-black/60 border-2 border-purple-700 text-yellow-300 px-3 py-1.5 text-xs font-pixel flex-1 focus:outline-none focus:border-amber-400"
            />
            <PixelButton variant="primary" size="sm" type="submit">
              저장
            </PixelButton>
          </div>
        </form>

        <div className="space-y-2">
          <label className="text-xs text-purple-300 block">배경 선택 (BACKGROUND)</label>
          <div className="grid grid-cols-2 gap-2">
            {bgOptions.map(bg => (
              <button
                key={bg.id}
                onClick={() => onChangeBackground(bg.id)}
                className={`px-2.5 py-1.5 text-[11px] font-pixel border-2 text-left flex items-center gap-1.5 transition-all ${
                  background === bg.id
                    ? 'bg-amber-400 text-purple-950 border-black font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-purple-900 text-purple-200 border-purple-800 hover:border-purple-600'
                }`}
              >
                <span>{bg.icon}</span>
                <span>{bg.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-purple-900 pt-3">
          <span className="text-xs text-purple-200">사운드 효과음 (SOUND)</span>
          <PixelButton
            variant={soundEnabled ? 'success' : 'dark'}
            size="sm"
            onClick={onToggleSound}
          >
            {soundEnabled ? '🔊 ON' : '🔇 OFF'}
          </PixelButton>
        </div>

        <div className="border-t border-purple-900 pt-3 space-y-2">
          <span className="text-xs text-rose-400 block font-bold">초기화 (RESET DATA)</span>
          {!showConfirmReset ? (
            <PixelButton
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => setShowConfirmReset(true)}
            >
              ⚠️ 게임 데이터 초기화
            </PixelButton>
          ) : (
            <div className="bg-rose-950 border border-rose-700 p-3 space-y-2 text-center">
              <p className="text-[11px] text-rose-200">
                정말로 모든 경험치와 성장 기록을 삭제할까요?
              </p>
              <div className="flex justify-center gap-2">
                <PixelButton
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onResetData();
                    setShowConfirmReset(false);
                    onClose();
                  }}
                >
                  초기화 실행
                </PixelButton>
                <PixelButton
                  variant="dark"
                  size="sm"
                  onClick={() => setShowConfirmReset(false)}
                >
                  취소
                </PixelButton>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <PixelButton variant="dark" size="sm" onClick={onClose}>
            닫기
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
