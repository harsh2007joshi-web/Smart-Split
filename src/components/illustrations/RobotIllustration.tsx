import React from 'react';

interface RobotProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const RobotIllustration: React.FC<RobotProps> = ({ className = '', size = 220, glow = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {glow && (
        <div className="absolute inset-0 bg-[#1685F8]/20 blur-2xl rounded-full scale-110 pointer-events-none animate-pulse-subtle" />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-xl"
      >
        <defs>
          <linearGradient id="robotWhiteClay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F0F7FF" />
            <stop offset="100%" stopColor="#D9ECFE" />
          </linearGradient>

          <linearGradient id="robotBlueClay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38A5FF" />
            <stop offset="50%" stopColor="#1685F8" />
            <stop offset="100%" stopColor="#0B5FC4" />
          </linearGradient>

          <linearGradient id="visorGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10274A" />
            <stop offset="100%" stopColor="#09172E" />
          </linearGradient>

          <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DE2FF" />
            <stop offset="100%" stopColor="#00B8FF" />
          </linearGradient>

          <linearGradient id="metalAccents" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BFE9FF" />
            <stop offset="100%" stopColor="#7EBAF5" />
          </linearGradient>

          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1685F8" floodOpacity="0.18" />
          </filter>
        </defs>

        <ellipse cx="120" cy="225" rx="65" ry="12" fill="#1685F8" fillOpacity="0.15" />

        <ellipse cx="90" cy="210" rx="16" ry="9" fill="url(#robotBlueClay)" />
        <ellipse cx="150" cy="210" rx="16" ry="9" fill="url(#robotBlueClay)" />

        <g className="origin-[60px_130px] animate-float-slow">
          <path
            d="M58 135 C38 120, 30 100, 42 85 C48 78, 58 84, 52 98 C46 110, 56 122, 68 132 Z"
            fill="url(#robotWhiteClay)"
            filter="url(#clayShadow)"
          />
          <circle cx="44" cy="84" r="10" fill="url(#cyanGlow)" />
        </g>

        <path
          d="M182 135 C198 145, 208 160, 202 172 C198 178, 188 176, 192 165 C196 154, 186 145, 172 138 Z"
          fill="url(#robotWhiteClay)"
          filter="url(#clayShadow)"
        />
        <circle cx="200" cy="172" r="9" fill="url(#cyanGlow)" />

        <rect
          x="72"
          y="118"
          width="96"
          height="85"
          rx="32"
          fill="url(#robotWhiteClay)"
          filter="url(#clayShadow)"
        />
        <rect
          x="88"
          y="132"
          width="64"
          height="54"
          rx="18"
          fill="url(#robotBlueClay)"
        />
        <circle cx="120" cy="159" r="14" fill="#FFFFFF" fillOpacity="0.25" />
        <path
          d="M112 159 L120 151 L128 159 L120 167 Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />

        <rect x="106" y="106" width="28" height="18" rx="8" fill="url(#metalAccents)" />

        <rect
          x="60"
          y="35"
          width="120"
          height="82"
          rx="36"
          fill="url(#robotWhiteClay)"
          filter="url(#clayShadow)"
        />

        <ellipse cx="58" cy="76" rx="6" ry="14" fill="url(#robotBlueClay)" />
        <ellipse cx="182" cy="76" rx="6" ry="14" fill="url(#robotBlueClay)" />

        <rect x="117" y="14" width="6" height="22" rx="3" fill="url(#metalAccents)" />
        <circle cx="120" cy="12" r="8" fill="url(#cyanGlow)" />
        <circle cx="120" cy="12" r="4" fill="#FFFFFF" />

        <rect
          x="72"
          y="48"
          width="96"
          height="54"
          rx="22"
          fill="url(#visorGlass)"
        />

        <ellipse cx="98" cy="73" rx="10" ry="13" fill="url(#cyanGlow)" />
        <circle cx="95" cy="69" r="4" fill="#FFFFFF" />

        <ellipse cx="142" cy="73" rx="10" ry="13" fill="url(#cyanGlow)" />
        <circle cx="139" cy="69" r="4" fill="#FFFFFF" />

        <path
          d="M112 86 Q120 92 128 86"
          stroke="url(#cyanGlow)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M74 54 Q120 40 166 54"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.35"
          fill="none"
        />
      </svg>
    </div>
  );
};
