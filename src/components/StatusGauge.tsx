import React from 'react';
import { PixelHeart } from './PixelHeart';

interface StatusGaugeProps {
  label: string;
  value: number; // 0 - 100
  icon: string;
  color?: 'amber' | 'pink' | 'emerald' | 'cyan' | 'rose';
}

export const StatusGauge: React.FC<StatusGaugeProps> = ({
  label,
  value,
  icon,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const getStatusIcon = () => {
    if (clamped <= 25) return '⚠️';
    return icon;
  };

  const heartsCount = Math.ceil((clamped / 100) * 4);

  return (
    <div className="bg-[#fffefb] border-2 border-black p-2 rounded-xl font-pixel shadow-[3px_3px_0px_#38bdf8] flex flex-col justify-between space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center gap-1 text-slate-800 font-bold">
          <span>{getStatusIcon()}</span>
          <span className="tracking-tighter text-[11px]">{label}</span>
        </span>
        <span className={`text-[10px] font-bold ${clamped <= 25 ? 'text-rose-500 animate-pulse' : 'text-sky-700'}`}>
          {clamped}%
        </span>
      </div>

      {/* 8-bit Real Pixel Heart SVG Bar */}
      <div className="flex justify-around items-center bg-sky-50/80 p-1 border border-black rounded-lg">
        {Array.from({ length: 4 }).map((_, idx) => (
          <PixelHeart
            key={idx}
            size={13}
            filled={idx < heartsCount}
            color={label === 'HEALTH' ? '#10b981' : label === 'HUNGER' ? '#f59e0b' : label === 'ENERGY' ? '#38bdf8' : '#f43f5e'}
            className={clamped <= 25 && idx < heartsCount ? 'animate-pulse' : ''}
          />
        ))}
      </div>

      {/* Soft Progress Bar */}
      <div className="relative h-2 bg-sky-100 border border-black rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            clamped <= 25
              ? 'bg-rose-400 animate-pulse'
              : clamped <= 50
              ? 'bg-amber-300'
              : 'bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-400'
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
