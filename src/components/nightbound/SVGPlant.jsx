import React from 'react';

const SVGPlant = ({ plantType, stage, potency, size = 120 }) => {
  const colorVariants = {
    cannabis: {
      light: '#4ade80',
      medium: '#22c55e',
      dark: '#16a34a',
      glow: '#86efac'
    },
    psilocybin: {
      light: '#c084fc',
      medium: '#a855f7',
      dark: '#7e22ce',
      glow: '#e9d5ff'
    },
    opium_poppy: {
      light: '#f97316',
      medium: '#ea580c',
      dark: '#c2410c',
      glow: '#fed7aa'
    },
    coca: {
      light: '#fbbf24',
      medium: '#f59e0b',
      dark: '#d97706',
      glow: '#fef3c7'
    },
    ergot: {
      light: '#9333ea',
      medium: '#7e22ce',
      dark: '#581c87',
      glow: '#e9d5ff'
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
        stroke={colors.dark}
        strokeWidth="4"
        opacity={opacity}
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
              cx={x + 2}
              cy={y + 2}
              rx={20 * opacity}
              ry={35 * opacity}
              fill={colors.dark}
              opacity="0.2"
              transform={`rotate(${angle} ${x} ${y})`}
            />

            {/* Main leaf */}
            <ellipse
              cx={x}
              cy={y}
              rx={20 * opacity}
              ry={35 * opacity}
              fill="url(#leafGrad)"
              opacity={opacity}
              transform={`rotate(${angle} ${x} ${y})`}
              stroke={colors.dark}
              strokeWidth="1"
            />

            {/* Leaf vein */}
            <line
              x1={x}
              y1={y - 30 * opacity}
              x2={x}
              y2={y + 30 * opacity}
              stroke={colors.light}
              strokeWidth="1"
              opacity={opacity * 0.6}
              transform={`rotate(${angle} ${x} ${y})`}
            />
          </g>
        );
      })}

      {/* Center bud/flower */}
      <circle
        cx="100"
        cy={100 - stage * 5}
        r={8 * opacity}
        fill={colors.medium}
        opacity={opacity}
        filter="drop-shadow(0 0 4px rgba(0,0,0,0.3))"
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