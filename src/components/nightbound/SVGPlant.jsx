import React from 'react';

const SVGPlant = ({ plantType, stage, potency, size = 120 }) => {
  const colorVariants = {
    cannabis: {
      light: '#65ff00',
      medium: '#39ff00',
      dark: '#2db300',
      glow: '#b3ff66',
      stem: '#1a5c00'
    },
    psilocybin: {
      light: '#dd5ef7',
      medium: '#c400ff',
      dark: '#7a00cc',
      glow: '#ff99ff',
      stem: '#330066'
    },
    opium_poppy: {
      light: '#ff6b35',
      medium: '#ff3300',
      dark: '#cc2200',
      glow: '#ffb399',
      stem: '#662211'
    },
    coca: {
      light: '#ffeb3b',
      medium: '#ffd700',
      dark: '#cc9900',
      glow: '#ffff99',
      stem: '#664400'
    },
    ergot: {
      light: '#d946ef',
      medium: '#a855f7',
      dark: '#6b21a8',
      glow: '#f8b4f8',
      stem: '#3d0a5c'
    }
  };

  const colors = colorVariants[plantType] || colorVariants.cannabis;
  const opacity = Math.min(potency / 100, 1);
  const leafCount = Math.max(3, Math.ceil(stage * 2));

  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      xmlns="http://www.w3.org/2000/svg"
      className="filter drop-shadow-lg"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.glow} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.light} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.light} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.dark} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Glow effect */}
      <circle cx="100" cy="100" r={60 * opacity} fill="url(#glow)" opacity="0.6" />

      {/* Stem */}
      <line
        x1="100"
        y1="200"
        x2="100"
        y2={120 - stage * 15}
        stroke={colors.stem}
        strokeWidth="5"
        opacity={opacity}
        strokeLinecap="round"
      />

      {/* Leaves */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const angle = (360 / leafCount) * i + stage * 15;
        const rad = (angle * Math.PI) / 180;
        const distance = 40 + stage * 5;
        const x = 100 + Math.cos(rad) * distance;
        const y = 100 + Math.sin(rad) * distance;

        return (
          <g key={i}>
            {/* Leaf shadow */}
            <ellipse
              cx={x + 3}
              cy={y + 3}
              rx={22 * opacity}
              ry={37 * opacity}
              fill="#000000"
              opacity="0.3"
              transform={`rotate(${angle} ${x} ${y})`}
            />

            {/* Main leaf */}
            <ellipse
              cx={x}
              cy={y}
              rx={22 * opacity}
              ry={37 * opacity}
              fill="url(#leafGrad)"
              opacity={opacity}
              transform={`rotate(${angle} ${x} ${y})`}
              stroke={colors.medium}
              strokeWidth="1.5"
            />

            {/* Leaf vein */}
            <line
              x1={x}
              y1={y - 32 * opacity}
              x2={x}
              y2={y + 32 * opacity}
              stroke={colors.light}
              strokeWidth="1.5"
              opacity={opacity * 0.8}
              transform={`rotate(${angle} ${x} ${y})`}
            />
          </g>
        );
      })}

      {/* Center bud/flower */}
      <circle
        cx="100"
        cy={100 - stage * 5}
        r={10 * opacity}
        fill={colors.medium}
        opacity={opacity}
        filter="drop-shadow(0 0 8px currentColor)"
      />
      <circle
        cx="100"
        cy={100 - stage * 5}
        r={7 * opacity}
        fill={colors.light}
        opacity={opacity * 0.6}
      />

      {/* Sparkles at high potency */}
      {potency > 60 &&
        Array.from({ length: 4 }).map((_, i) => {
          const sparkleAngle = (360 / 4) * i;
          const sparkleRad = (sparkleAngle * Math.PI) / 180;
          const sx = 100 + Math.cos(sparkleRad) * 65;
          const sy = 100 + Math.sin(sparkleRad) * 65;

          return (
            <text
              key={`sparkle-${i}`}
              x={sx}
              y={sy}
              fontSize="16"
              opacity={Math.min(potency / 100, 0.8)}
              className="animate-pulse"
            >
              ✨
            </text>
          );
        })}
    </svg>
  );
};

export default SVGPlant;