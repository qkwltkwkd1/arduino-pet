import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { EvolutionStage } from '../types/pet';
import { EVOLUTION_DETAILS } from '../utils/level';
import { PixelButton } from './PixelButton';
import { soundService } from '../services/soundService';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  newStage: EvolutionStage;
  petName: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  newStage,
  petName,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundService.playLevelUp();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#facc15', '#f43f5e', '#38bdf8', '#a855f7', '#4ade80'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stageInfo = EVOLUTION_DETAILS[newStage];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-pixel">
      {/* Background screen shimmer glow */}
      <div className="absolute inset-0 bg-yellow-400/10 animate-pulse pointer-events-none" />

      {/* Mario / Retro Platformer Style Level Up Card (Reference 5) */}
      <div className="relative bg-gradient-to-b from-sky-400 via-sky-300 to-sky-500 border-4 border-black rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[10px_10px_0px_#000] text-center space-y-5 overflow-hidden">
        {/* Floating Clouds Background */}
        <div className="absolute top-2 left-0 w-full flex justify-between px-4 opacity-70 pointer-events-none text-2xl">
          <span className="animate-bounce">☁️</span>
          <span className="animate-pulse">☁️</span>
        </div>

        {/* 8-bit Hearts Header (Reference 5) */}
        <div className="flex justify-center gap-2 text-2xl pt-2">
          <span>❤️</span>
          <span>❤️</span>
          <span>❤️</span>
        </div>

        {/* Bold 3D Yellow Level Up Title (Reference 5) */}
        <div className="relative py-2 flex items-center justify-center gap-3">
          <span className="text-3xl animate-coin-spin">🪙</span>
          <div className="text-4xl sm:text-5xl font-extrabold text-yellow-300 drop-shadow-[4px_4px_0px_#b45309] tracking-wider uppercase">
            LEVEL UP!
          </div>
          <span className="text-3xl animate-coin-spin">🪙</span>
        </div>

        {/* Level Up Announcement Card */}
        <div className="bg-purple-950/90 border-4 border-black rounded-xl p-4 text-purple-100 space-y-2 shadow-[4px_4px_0px_#000]">
          <div className="text-xs text-amber-300 font-bold">
            <span className="text-white">{petName}</span> 이(가) <span className="text-yellow-300 text-lg">LV.{newLevel}</span> 로 진화했습니다!
          </div>
          <div className="text-base text-cyan-300 font-bold border-t border-purple-800 pt-2">
            {stageInfo.name}
          </div>
          <p className="text-xs text-purple-200 leading-relaxed">
            {stageInfo.description}
          </p>
        </div>

        <div className="pt-2">
          <PixelButton variant="pill-yellow" size="lg" className="w-full shadow-lg" onClick={onClose}>
            ⭐ 진화 축하하기 (CONTINUE)
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
