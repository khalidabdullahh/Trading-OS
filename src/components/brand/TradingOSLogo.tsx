import React from "react";

interface TradingOSLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  withText?: boolean;
  textClassName?: string;
}

export const TradingOSLogo: React.FC<TradingOSLogoProps> = ({
  className = "w-8 h-8",
  size,
  glow = true,
  withText = false,
  textClassName = "",
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${textClassName}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={style}>
        {/* Ambient Neon Glow */}
        {glow && (
          <div className="absolute inset-0 rounded-2xl bg-cyan-500/25 blur-md -z-10 transform scale-110 pointer-events-none" />
        )}

        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Outer Hexagon Border Gradient */}
            <linearGradient id="tosHexBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="30%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Shield Dark Body Gradient */}
            <radialGradient id="tosShieldBg" cx="50%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#090e1a" />
              <stop offset="100%" stopColor="#030712" />
            </radialGradient>

            {/* Inner Chamfer Bevel Highlight */}
            <linearGradient id="tosInnerBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#1e293b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
            </linearGradient>

            {/* Monogram Cyan Gradient (Alpha Wing) */}
            <linearGradient id="tosMonogramCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Monogram Electric Blue Gradient (Beta Wing) */}
            <linearGradient id="tosMonogramBlue" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>

            {/* Monogram Neon Emerald Accent (Profit Surge) */}
            <linearGradient id="tosMonogramSurge" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Filter for glowing neon core */}
            <filter id="tosNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Outer 3D Hexagonal Cyber-Shield Badge */}
          <polygon
            points="60,6 108,34 108,86 60,114 12,86 12,34"
            fill="url(#tosShieldBg)"
            stroke="url(#tosHexBorder)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* 2. Inner Beveled Glass Layer */}
          <polygon
            points="60,14 100,38 100,82 60,106 20,82 20,38"
            fill="#050814"
            fillOpacity="0.8"
            stroke="url(#tosInnerBevel)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* 3. Subtle Cyber Matrix / Quantitative Grid Lines */}
          <line x1="30" y1="60" x2="90" y2="60" stroke="#0ea5e9" strokeOpacity="0.12" strokeDasharray="3 3" />
          <line x1="60" y1="28" x2="60" y2="92" stroke="#0ea5e9" strokeOpacity="0.12" strokeDasharray="3 3" />

          {/* 4. Quantitative Candlestick & Delta Monogram ("T-OS") */}
          <g filter="url(#tosNeonGlow)">
            {/* Top "T" Crossbar — Winged Aerodynamic Structure */}
            <path
              d="M32 38 L88 38 L82 48 L66 48 L66 52 L54 52 L54 48 L38 48 Z"
              fill="url(#tosMonogramCyan)"
            />

            {/* Left Ascent Pillar & Candlestick Body */}
            <path
              d="M36 54 L48 54 L48 80 L36 72 Z"
              fill="url(#tosMonogramBlue)"
              opacity="0.95"
            />

            {/* Central Quantitative Surge / Arrow Delta (Intersecting "T" and "OS") */}
            <path
              d="M54 52 L66 52 L66 84 L60 90 L54 84 Z"
              fill="url(#tosMonogramCyan)"
            />

            {/* Right Ascending Breakout Wing / "S" Flow */}
            <path
              d="M72 54 L84 48 L84 74 L72 82 Z"
              fill="url(#tosMonogramSurge)"
              opacity="0.9"
            />

            {/* Central High-Frequency Sparkle / Precision Diamond Node */}
            <polygon
              points="60,34 64,38 60,42 56,38"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              TRADING OS
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-500 font-mono font-bold border border-cyan-500/30">
              v2.01
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 -mt-0.5 font-bold">
            TERMINAL
          </span>
        </div>
      )}
    </div>
  );
};
