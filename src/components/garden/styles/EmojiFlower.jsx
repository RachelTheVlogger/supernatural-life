import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function EmojiFlower({ flower, isInteracting }) {
  const seed = flower.seed;
  const personality = flower.personality;
  
  const seededRandom = (s) => {
    const x = Math.sin(s * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  const flowerEmoji = useMemo(() => {
    if (personality === 'poisonous') {
      const poisonous = ['🥀', '🍄', '🌺', '💐'];
      return poisonous[Math.floor(seededRandom(seed) * poisonous.length)];
    }
    if (personality === 'alien') {
      const alien = ['🪷', '🌸', '🪻', '💮', '🏵️'];
      return alien[Math.floor(seededRandom(seed) * alien.length)];
    }
    const regular = ['🌻', '🌷', '🌹', '🌼', '🌺', '💐'];
    return regular[Math.floor(seededRandom(seed) * regular.length)];
  }, [seed, personality]);
  
  const hue = seededRandom(seed + 1) * 360;
  
  return (
    <motion.div 
      className="relative w-full h-full flex flex-col items-center justify-end pb-4"
      animate={{ scale: isInteracting ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Flower emoji */}
      <motion.div
        className="text-6xl relative z-10"
        style={{
          filter: personality === 'alien' 
            ? `hue-rotate(${hue}deg) saturate(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.5))`
            : personality === 'poisonous'
            ? 'saturate(0.8) contrast(1.2)'
            : 'none'
        }}
        animate={{
          rotate: isInteracting ? [0, -5, 5, 0] : 0,
          y: isInteracting ? -10 : 0
        }}
      >
        {flowerEmoji}
      </motion.div>
      
      {/* Stem */}
      <div 
        className="w-1 rounded-full absolute bottom-0"
        style={{
          height: '40%',
          backgroundColor: '#65a30d',
          background: 'linear-gradient(to bottom, #84cc16, #65a30d)',
          transform: `rotate(${-5 + seededRandom(seed + 2) * 10}deg)`,
          transformOrigin: 'bottom center'
        }}
      />
      
      {/* Leaf emoji */}
      <div 
        className="absolute text-2xl"
        style={{
          bottom: '30%',
          left: seededRandom(seed + 3) > 0.5 ? '20%' : '70%',
          transform: 'rotate(-20deg)'
        }}
      >
        🍃
      </div>
      
      {/* Alien glow */}
      {personality === 'alien' && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '80px',
            height: '80px',
            background: `radial-gradient(circle, hsla(${hue}, 80%, 70%, 0.3), transparent)`,
            filter: 'blur(20px)',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
      
      {/* Poisonous indicator - skull */}
      {personality === 'poisonous' && seededRandom(seed + 4) > 0.5 && (
        <div 
          className="absolute text-xs opacity-60"
          style={{
            bottom: '60%',
            right: '30%'
          }}
        >
          ☠️
        </div>
      )}
    </motion.div>
  );
}