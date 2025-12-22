import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function HandDrawnFlower({ flower, isInteracting }) {
  const seed = flower.seed;
  const personality = flower.personality;
  
  const seededRandom = (s) => {
    const x = Math.sin(s * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  const hue = useMemo(() => {
    if (personality === 'poisonous') return 280;
    if (personality === 'alien') return 190;
    return seededRandom(seed) * 360;
  }, [seed, personality]);
  
  const petalCount = 5 + Math.floor(seededRandom(seed + 1) * 3);
  
  return (
    <motion.div 
      className="relative w-full h-full flex items-end justify-center"
      animate={{ scale: isInteracting ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 250 }}
    >
      <svg 
        viewBox="0 0 100 140" 
        className="w-full h-full"
        style={{ 
          filter: 'contrast(0.95) saturate(0.9)',
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Hand-drawn texture filter */}
          <filter id={`sketch-${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
          
          {/* Paper texture */}
          <filter id={`paper-${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="1">
              <feDistantLight azimuth="45" elevation="35" />
            </feDiffuseLighting>
          </filter>
        </defs>
        
        {/* Stem - wobbly path */}
        <path
          d={`M 50 140 Q ${48 + seededRandom(seed + 2) * 4} 100, 50 60`}
          stroke={`hsl(120, 35%, ${30 + seededRandom(seed + 3) * 10}%)`}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          filter={`url(#sketch-${seed})`}
          opacity="0.85"
        />
        
        {/* Leaf - imperfect oval */}
        <ellipse
          cx={35 + seededRandom(seed + 4) * 5}
          cy="90"
          rx="10"
          ry="16"
          fill={`hsl(120, 40%, 40%)`}
          transform={`rotate(-25, ${35 + seededRandom(seed + 4) * 5}, 90)`}
          filter={`url(#sketch-${seed})`}
          opacity="0.75"
        />
        
        {/* Petals - hand-drawn style */}
        <g transform="translate(50, 55)">
          {Array.from({ length: petalCount }).map((_, i) => {
            const angle = (360 / petalCount) * i + seededRandom(seed + i + 10) * 10;
            const wobbleX = seededRandom(seed + i + 20) * 3 - 1.5;
            const wobbleY = seededRandom(seed + i + 30) * 3 - 1.5;
            const size = 15 + seededRandom(seed + i + 40) * 5;
            
            return (
              <ellipse
                key={i}
                cx={wobbleX}
                cy={-size + wobbleY}
                rx={size * 0.6}
                ry={size}
                fill={`hsl(${hue}, ${60 + seededRandom(seed + i) * 15}%, ${55 + seededRandom(seed + i) * 15}%)`}
                transform={`rotate(${angle})`}
                filter={`url(#sketch-${seed})`}
                opacity="0.85"
                strokeWidth="1"
                stroke={`hsl(${hue}, 50%, 40%)`}
              />
            );
          })}
          
          {/* Center - rough circle */}
          <circle
            cx={seededRandom(seed + 50) * 2 - 1}
            cy={seededRandom(seed + 51) * 2 - 1}
            r="8"
            fill={`hsl(${(hue + 40) % 360}, 60%, 50%)`}
            filter={`url(#sketch-${seed})`}
            opacity="0.9"
          />
          
          {/* Center detail dots */}
          {[...Array(5)].map((_, i) => (
            <circle
              key={i}
              cx={seededRandom(seed + 60 + i) * 6 - 3}
              cy={seededRandom(seed + 70 + i) * 6 - 3}
              r="1"
              fill={`hsl(${(hue + 60) % 360}, 50%, 35%)`}
              opacity="0.6"
            />
          ))}
          
          {/* Alien trait - sketchy aura */}
          {personality === 'alien' && (
            <motion.circle
              cx="0"
              cy="0"
              r="25"
              fill="none"
              stroke={`hsl(${hue}, 70%, 60%)`}
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity="0.4"
              filter={`url(#sketch-${seed})`}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </g>
        
        {/* Texture overlay */}
        <rect 
          width="100" 
          height="140" 
          fill="white" 
          filter={`url(#paper-${seed})`}
          opacity="0.08"
          pointerEvents="none"
        />
      </svg>
    </motion.div>
  );
}