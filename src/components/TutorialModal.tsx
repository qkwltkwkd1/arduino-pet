import React from 'react';
import { PixelButton } from './PixelButton';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Arduino 연결하기',
      desc: 'Arduino 보드를 USB 케이블로 PC에 연결합니다.',
      icon: '🔌',
    },
    {
      num: 2,
      title: 'DEVICE CONNECT 버튼 누르기',
      desc: '화면 상단의 [🔌 Arduino 연결] 버튼을 눌러 시리얼 포트(9600 baud)를 연결하세요.',
      icon: '💻',
    },
    {
      num: 3,
      title: '미션 확인하기',
      desc: '화면에 표시된 미션 카드에서 [미션 시작]을 누르세요.',
      icon: '📜',
    },
    {
      num: 4,
      title: '실제 센서 및 스위치 동작',
      desc: '스위치(짧게/3번/긴 누르기)나 초음파센서(손 가까이/멀리/거리 유지)로 미션을 수행합니다.',
      icon: '🖐️',
    },
    {
      num: 5,
      title: '경험치 획득 및 진화!',
      desc: '미션을 성공하여 경험치를 쌓고 알(EGG)에서 슈퍼 펫(SUPER PET)까지 키워보세요!',
      icon: '🐣',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-pixel">
      <div className="bg-purple-950 border-4 border-black p-6 max-w-lg w-full shadow-[8px_8px_0px_#000] text-purple-100 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-purple-800 pb-2">
          <h2 className="text-lg text-yellow-300 font-bold flex items-center gap-2">
            <span>🎮</span>
            <span>PIXEL PET LAB 튜토리얼</span>
          </h2>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {steps.map(s => (
            <div
              key={s.num}
              className="bg-purple-900/80 border-2 border-purple-800 p-3 flex items-start gap-3"
            >
              <div className="bg-yellow-400 text-purple-950 w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold text-xs border border-black shadow-[2px_2px_0px_#000]">
                {s.num}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>{s.icon}</span>
                  <span>{s.title}</span>
                </div>
                <p className="text-[11px] text-purple-200 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-purple-900">
          <span className="text-[10px] text-purple-400">
            * Arduino가 없을 땐 Mock Mode로도 모든 기능을 플레이할 수 있습니다.
          </span>
          <PixelButton variant="primary" size="md" onClick={onClose}>
            게임 시작!
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
