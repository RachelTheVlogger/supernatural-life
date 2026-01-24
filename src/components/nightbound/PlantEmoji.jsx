import React from 'react';

const PLANT_VISUALS = {
  green: ['🌱', '🌿', '🍃', '💚', '✅'],
  red: ['🔴', '❤️', '🌹', '🍒', '🔺'],
  purple: ['🟣', '💜', '🍆', '🔮', '📍'],
  cyan: ['🔵', '💙', '🌀', '⭐', '☄️'],
  orange: ['🟠', '🧡', '🔥', '☀️', '💥'],
  yellow: ['🟡', '💛', '⭐', '✨', '💫'],
  dark: ['⚫', '⬛', '◼️', '🌑', '💤']
};

const STAGE_GROWTH = {
  1: '🌰',
  2: '🌱', 
  3: '🌿',
  4: '🌳',
  5: '👑'
};

export default function PlantEmoji({ plantType, stage, potency }) {
  const colorMap = {
    cannabis: 'green',
    psilocybin: 'purple',
    opium_poppy: 'red',
    coca: 'yellow',
    ergot: 'dark'
  };

  const color = colorMap[plantType] || 'green';
  const variants = PLANT_VISUALS[color];
  
  // Use potency to determine which emoji variant
  const variantIndex = Math.min(Math.floor((potency / 100) * variants.length), variants.length - 1);
  const emoji = variants[variantIndex];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-6xl animate-pulse">
        {emoji}
      </div>
      <div className="text-2xl opacity-75">
        {STAGE_GROWTH[stage] || '🌿'}
      </div>
    </div>
  );
}