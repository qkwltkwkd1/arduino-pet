import React from 'react';
import type { EvolutionStage, PetStatusType, BackgroundTheme } from '../types/pet';
import { PixelHeart } from './PixelHeart';

interface PetCharacterProps {
  stage: EvolutionStage;
  status: PetStatusType;
  background: BackgroundTheme;
  name: string;
}

export const PetCharacter: React.FC<PetCharacterProps> = ({
  stage,
  status,
  background,
  name,
}) => {
  const getBgStyle = () => {
    switch (background) {
      case 'park':
        return 'bg-gradient-to-b from-sky-300 via-teal-100 to-emerald-200';
      case 'restaurant':
        return 'bg-gradient-to-b from-amber-100 via-rose-100 to-orange-100';
      case 'hospital':
        return 'bg-gradient-to-b from-teal-100 via-cyan-100 to-sky-200';
      case 'playground':
        return 'bg-gradient-to-b from-yellow-100 via-emerald-100 to-sky-300';
      case 'night':
        return 'bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950 text-white';
      case 'room':
      default:
        return 'bg-gradient-to-b from-sky-200 via-indigo-100 to-emerald-100';
    }
  };

  const renderStatusBubble = () => {
    switch (status) {
      case 'hungry':
        return (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs sm:text-sm font-pixel px-3.5 py-1.5 border-2 border-black rounded-xl animate-bounce shadow-[3px_3px_0px_#38bdf8] z-30 font-bold">
            🍚 밥 줘!
          </div>
        );
      case 'happy':
        return (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-ping z-30 flex gap-1.5">
            <PixelHeart size={24} color="#f43f5e" />
            <PixelHeart size={18} color="#38bdf8" />
          </div>
        );
      case 'sick':
        return (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-rose-100 text-rose-950 text-xs sm:text-sm font-pixel px-3.5 py-1.5 border-2 border-black rounded-xl animate-pulse shadow-[3px_3px_0px_#fda4af] z-30 font-bold">
            💊 으슬으슬...
          </div>
        );
      case 'tired':
      case 'sleeping':
        return (
          <div className="absolute -top-12 right-6 text-sky-600 text-sm sm:text-base font-pixel animate-bounce z-30 font-bold">
            Z z z... 💤
          </div>
        );
      case 'exercising':
        return (
          <div className="absolute -top-10 right-4 text-amber-500 text-2xl animate-spin z-30">
            ⚡
          </div>
        );
      case 'levelup':
        return (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-200 text-emerald-950 text-xs sm:text-sm font-pixel px-4 py-1.5 border-2 border-black rounded-full animate-bounce shadow-[3px_3px_0px_#000] font-bold z-30">
            ✨ LEVEL UP! ✨
          </div>
        );
      default:
        return null;
    }
  };

  const renderPixelSprite = () => {
    const animClass =
      status === 'exercising'
        ? 'animate-[ping_1.5s_infinite]'
        : status === 'sleeping'
        ? 'opacity-80 scale-95'
        : status === 'happy'
        ? 'animate-[bounce_0.8s_infinite]'
        : status === 'sick'
        ? 'animate-[pulse_1s_infinite]'
        : status === 'levelup'
        ? 'animate-[bounce_0.4s_infinite]'
        : 'animate-[bounce_2s_infinite]';

    switch (stage) {
      case 'EGG':
        return (
          <div className={`relative w-32 h-36 flex items-center justify-center ${animClass}`}>
            <svg viewBox="0 0 16 18" className="w-full h-full drop-shadow-[5px_8px_0px_rgba(56,189,248,0.4)] [image-rendering:pixelated]">
              <path d="M5,1 H11 V3 H13 V6 H14 V12 H13 V15 H11 V17 H5 V15 H3 V12 H2 V6 H3 V3 H5 Z" fill="#fef08a" stroke="#000000" strokeWidth="0.8" />
              <rect x="5" y="4" width="2" height="2" fill="#38bdf8" />
              <rect x="9" y="8" width="3" height="3" fill="#38bdf8" />
              <rect x="4" y="11" width="2" height="2" fill="#38bdf8" />
              {status === 'levelup' && (
                <path d="M7,5 L9,8 L7,10 L10,13" stroke="#000" strokeWidth="0.8" fill="none" />
              )}
            </svg>
          </div>
        );

      case 'BABY':
        return (
          <div className={`relative w-36 h-40 flex items-center justify-center ${animClass}`}>
            <svg viewBox="0 0 20 20" className="w-full h-full drop-shadow-[5px_8px_0px_rgba(56,189,248,0.4)] [image-rendering:pixelated]">
              <path d="M5,4 H15 V6 H17 V14 H15 V16 H5 V14 H3 V6 H5 Z" fill="#bae6fd" stroke="#000" strokeWidth="0.8" />
              <rect x="4" y="10" width="2" height="1" fill="#f472b6" />
              <rect x="14" y="10" width="2" height="1" fill="#f472b6" />
              {status === 'sleeping' ? (
                <>
                  <path d="M6,8 H8" stroke="#000" strokeWidth="0.8" />
                  <path d="M12,8 H14" stroke="#000" strokeWidth="0.8" />
                </>
              ) : status === 'sick' ? (
                <>
                  <text x="5" y="10" fontSize="4" fontWeight="bold" fill="#000">x</text>
                  <text x="12" y="10" fontSize="4" fontWeight="bold" fill="#000">x</text>
                </>
              ) : (
                <>
                  <rect x="6" y="8" width="2" height="2" fill="#000" />
                  <rect x="7" y="8" width="1" height="1" fill="#fff" />
                  <rect x="12" y="8" width="2" height="2" fill="#000" />
                  <rect x="13" y="8" width="1" height="1" fill="#fff" />
                </>
              )}
              {status === 'happy' || status === 'levelup' ? (
                <rect x="9" y="11" width="2" height="2" fill="#f43f5e" />
              ) : (
                <rect x="9" y="11" width="2" height="1" fill="#000" />
              )}
            </svg>
          </div>
        );

      case 'PET':
        return (
          <div className={`relative w-40 h-44 flex items-center justify-center ${animClass}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[6px_9px_0px_rgba(56,189,248,0.4)] [image-rendering:pixelated]">
              <rect x="3" y="2" width="4" height="4" fill="#38bdf8" stroke="#000" strokeWidth="0.8" />
              <rect x="17" y="2" width="4" height="4" fill="#38bdf8" stroke="#000" strokeWidth="0.8" />
              <path d="M5,5 H19 V17 H17 V20 H14 V17 H10 V20 H7 V17 H5 Z" fill="#e0f2fe" stroke="#000" strokeWidth="0.8" />
              <path d="M8,10 H16 V16 H8 Z" fill="#fff" />
              <rect x="3" y="10" width="2" height="4" fill="#38bdf8" stroke="#000" strokeWidth="0.8" />
              <rect x="19" y="10" width="2" height="4" fill="#38bdf8" stroke="#000" strokeWidth="0.8" />
              {status === 'sleeping' ? (
                <>
                  <path d="M7,8 H10" stroke="#000" strokeWidth="0.8" />
                  <path d="M14,8 H17" stroke="#000" strokeWidth="0.8" />
                </>
              ) : (
                <>
                  <rect x="7" y="7" width="3" height="3" fill="#000" />
                  <rect x="8" y="7" width="1" height="1" fill="#fff" />
                  <rect x="14" y="7" width="3" height="3" fill="#000" />
                  <rect x="15" y="7" width="1" height="1" fill="#fff" />
                </>
              )}
              <rect x="11" y="10" width="2" height="1" fill="#000" />
              <rect x="11" y="12" width="2" height="1" fill="#f43f5e" />
            </svg>
          </div>
        );

      case 'SUPER_PET':
      default:
        return (
          <div className={`relative w-44 h-48 flex items-center justify-center ${animClass}`}>
            <div className="absolute inset-0 bg-sky-300/50 rounded-full blur-xl animate-pulse" />

            <svg viewBox="0 0 28 28" className="w-full h-full drop-shadow-[8px_10px_0px_rgba(56,189,248,0.5)] [image-rendering:pixelated]">
              <path d="M10,1 L12,4 L14,1 L16,4 L18,1 L18,5 L10,5 Z" fill="#facc15" stroke="#000" strokeWidth="0.8" />
              <path d="M1,8 C1,5 6,5 6,10 L6,14 L1,12 Z" fill="#bae6fd" stroke="#000" strokeWidth="0.8" />
              <path d="M27,8 C27,5 22,5 22,10 L22,14 L27,12 Z" fill="#bae6fd" stroke="#000" strokeWidth="0.8" />
              <path d="M6,6 H22 V18 H19 V22 H16 V18 H12 V22 H9 V18 H6 Z" fill="#38bdf8" stroke="#000" strokeWidth="0.8" />
              <polygon points="14,11 16,13 14,15 12,13" fill="#f472b6" stroke="#000" strokeWidth="0.5" />
              {status === 'sleeping' ? (
                <>
                  <path d="M8,9 H11" stroke="#000" strokeWidth="1" />
                  <path d="M17,9 H20" stroke="#000" strokeWidth="1" />
                </>
              ) : (
                <>
                  <rect x="8" y="8" width="3" height="3" fill="#000" />
                  <rect x="9" y="8" width="1" height="1" fill="#fff" />
                  <rect x="17" y="8" width="3" height="3" fill="#000" />
                  <rect x="18" y="8" width="1" height="1" fill="#fff" />
                </>
              )}
              <path d="M12,14 Q14,16 16,14" fill="none" stroke="#000" strokeWidth="0.8" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`relative w-full flex-1 min-h-[280px] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#38bdf8] overflow-hidden flex flex-col justify-between p-3.5 transition-all duration-500 ${getBgStyle()}`}>
      
      {/* Floating Clouds & Leaves (Animal Crossing Town Vibe) */}
      <div className="absolute top-2 left-0 w-full h-16 pointer-events-none overflow-hidden opacity-90 z-0">
        <div className="absolute top-1 left-0 text-2xl font-pixel animate-cloud-slow">
          ☁️ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🍃 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☁️ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🌸
        </div>
        <div className="absolute top-6 left-1/3 text-xl font-pixel animate-cloud-fast">
          ☁️ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🌸 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🍃 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☁️
        </div>
      </div>

      {/* Top Details (Name & Environment Badge) */}
      <div className="z-20 flex justify-between items-center font-pixel text-[11px]">
        <span className="bg-white/95 text-slate-900 px-3 py-1 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1 text-xs">
          <span>🍃</span>
          <span>{name}</span>
        </span>
        <span className="bg-white/95 text-sky-950 px-3 py-1 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] uppercase font-bold text-xs">
          ENV: {background}
        </span>
      </div>

      {/* Center Character Area (Stretches dynamically to fill container) */}
      <div className="z-20 relative flex-1 flex items-center justify-center my-2">
        {renderStatusBubble()}
        {renderPixelSprite()}
      </div>

      {/* Animal Crossing Town Grass Ground */}
      <div className="z-20 w-full h-7 bg-emerald-300 border-t-2 border-black flex items-center justify-between px-5 overflow-hidden shadow-[inset_0_2px_0_#ffffff] rounded-b-lg">
        <span className="text-xs">🍀</span>
        <span className="text-xs">🍃</span>
        <span className="text-xs">🌼</span>
        <span className="text-xs">🦋</span>
        <span className="text-xs">🍀</span>
        <span className="text-xs">🍃</span>
        <span className="text-xs">🌼</span>
      </div>
    </div>
  );
};
