import React from 'react';
import { soundService } from '../services/soundService';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'ac-cyan'
    | 'ac-mint'
    | 'ac-cream'
    | 'ac-pink'
    | 'pastel-pink'
    | 'pastel-yellow'
    | 'pastel-cyan'
    | 'pastel-mint'
    | 'pastel-purple'
    | 'primary'
    | 'danger'
    | 'dark'
    | 'success'
    | 'info'
    | 'amber'
    | 'pill-yellow'
    | 'pill-green'
    | 'pill-pink';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  children: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'ac-cyan',
  size = 'md',
  active = false,
  children,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundService.playClick();
      if (onClick) onClick(e);
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'ac-cyan':
      case 'pastel-cyan':
      case 'info':
        return 'bg-sky-200 text-sky-950 border-2 border-black hover:bg-sky-100 shadow-[3px_3px_0px_#000]';
      case 'ac-mint':
      case 'pastel-mint':
      case 'pill-green':
      case 'success':
        return 'bg-emerald-200 text-emerald-950 border-2 border-black hover:bg-emerald-100 shadow-[3px_3px_0px_#000]';
      case 'ac-cream':
      case 'pastel-yellow':
      case 'pill-yellow':
        return 'bg-amber-100 text-amber-950 border-2 border-black hover:bg-amber-50 shadow-[3px_3px_0px_#000]';
      case 'ac-pink':
      case 'pastel-pink':
      case 'pill-pink':
        return 'bg-pink-200 text-pink-950 border-2 border-black hover:bg-pink-100 shadow-[3px_3px_0px_#000]';
      case 'pastel-purple':
        return 'bg-purple-200 text-purple-950 border-2 border-black hover:bg-purple-100 shadow-[3px_3px_0px_#000]';
      case 'amber':
        return 'bg-amber-300 text-amber-950 border-2 border-black hover:bg-amber-200 shadow-[3px_3px_0px_#000]';
      case 'primary':
        return 'bg-sky-400 text-white border-2 border-black hover:bg-sky-300 shadow-[3px_3px_0px_#000]';
      case 'danger':
        return 'bg-rose-400 text-white border-2 border-black hover:bg-rose-300 shadow-[3px_3px_0px_#000]';
      case 'dark':
      default:
        return 'bg-slate-700 text-white border-2 border-black hover:bg-slate-600 shadow-[3px_3px_0px_#000]';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1 text-xs font-bold';
      case 'lg':
        return 'px-5 py-2.5 text-xs sm:text-sm font-bold tracking-wider rounded-lg';
      case 'md':
      default:
        return 'px-3.5 py-1.5 text-xs font-bold rounded';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        pixel-btn inline-flex items-center justify-center font-pixel tracking-wider
        transition-all duration-75 select-none
        ${getVariantStyle()}
        ${getSizeStyle()}
        ${disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : 'cursor-pointer active:translate-x-0.5 active:translate-y-0.5'}
        ${active ? 'translate-x-0.5 translate-y-0.5 shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
