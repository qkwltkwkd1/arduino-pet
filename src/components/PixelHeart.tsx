import React from 'react';

interface PixelHeartProps {
  size?: number; // width/height in px
  filled?: boolean;
  color?: string;
  className?: string;
}

export const PixelHeart: React.FC<PixelHeartProps> = ({
  size = 18,
  filled = true,
  color = '#f43f5e',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 9"
      className={`inline-block select-none [image-rendering:pixelated] ${className}`}
    >
      {/* 8-bit Pixel Heart SVG Path */}
      {filled ? (
        <>
          <path
            d="M2,0 H4 V1 H6 V0 H8 V1 H9 V4 H8 V6 H6 V8 H4 V6 H2 V4 H1 V1 H2 Z"
            fill={color}
          />
          {/* Outer Pixel Outline */}
          <path
            d="M2,0 H4 V1 H6 V0 H8 V1 H9 V4 H8 V6 H6 V8 H4 V6 H2 V4 H1 V1 H2 Z"
            fill="none"
            stroke="#000000"
            strokeWidth="0.6"
          />
          {/* Highlight Specular Pixel */}
          <rect x="2" y="1" width="1" height="1" fill="#ffffff" opacity="0.8" />
        </>
      ) : (
        /* Empty/Grey Pixel Heart */
        <path
          d="M2,0 H4 V1 H6 V0 H8 V1 H9 V4 H8 V6 H6 V8 H4 V6 H2 V4 H1 V1 H2 Z"
          fill="#d1d5db"
          stroke="#000000"
          strokeWidth="0.6"
        />
      )}
    </svg>
  );
};
