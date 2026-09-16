import React, { useId } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  isDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-10 h-10',
  size,
}) => {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const gradId = `tt-grad-${safeId}`;
  const flapGradId = `tt-flap-${safeId}`;
  const shadowId = `tt-shadow-${safeId}`;

  // Dimension sizing if explicit size prop provided
  const sizeClasses = typeof size === 'number' 
    ? '' 
    : size === 'sm' 
    ? 'w-6 h-6' 
    : size === 'md' 
    ? 'w-10 h-10' 
    : size === 'lg' 
    ? 'w-12 h-12' 
    : size === 'xl' 
    ? 'w-16 h-16' 
    : className;

  const inlineStyle = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none overflow-visible ${sizeClasses}`}
      style={inlineStyle}
      role="img"
      aria-label="Find My Token Logo"
    >
      <defs>
        {/* Vibrant Blue to Purple Gradient */}
        <linearGradient id={gradId} x1="16" y1="36" x2="112" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00A3FF" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>

        {/* Luminous Peel Flap Gradient (White to Soft Violet) */}
        <linearGradient id={flapGradId} x1="40" y1="92" x2="90" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="35%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        <linearGradient id={shadowId} x1="45" y1="92" x2="90" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Tilt the ticket matching the reference */}
      <g transform="rotate(-24 64 64)">
        {/* 1. Ticket Silhouette */}
        <path
          d="
            M 24 36
            H 104
            A 12 12 0 0 1 116 48
            V 56
            A 8 8 0 0 0 116 72
            V 80
            A 12 12 0 0 1 104 92
            H 24
            A 12 12 0 0 1 12 80
            V 72
            A 8 8 0 0 0 12 56
            V 48
            A 12 12 0 0 1 24 36
            Z
          "
          fill={`url(#${gradId})`}
        />

        {/* 2. Fold Shadow (Creates depth under the flap) */}
        <path
          d="
            M 36 92
            C 72 92, 100 68, 88 40
            C 72 68, 56 86, 36 92
            Z
          "
          fill={`url(#${shadowId})`}
        />

        {/* 3. The Luminous Fold Peel */}
        <path
          d="
            M 36 92
            C 68 92, 96 68, 80 40
            C 66 64, 52 80, 36 92
            Z
          "
          fill={`url(#${flapGradId})`}
        />
      </g>
    </svg>
  );
};
