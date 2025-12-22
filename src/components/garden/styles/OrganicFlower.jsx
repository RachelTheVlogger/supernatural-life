import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function OrganicFlower({ flower, isInteracting }) {
  const seed = flower.seed;
  const personality = flower.personality;
  
  const seededRandom = (s) => {
    const x = Math.sin(s * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  const hue = useMemo(() => {
    if (personality === 'poisonous') return 280 + seededRandom(seed) * 40;
    if (personality === 'alien') return 180 + seededRandom(seed) * 80;
    return seededRandom(seed) * 360;
  }, [seed, personality]);
  
  const petalCount = 5 + Math.floor(seededRandom(seed + 1) * 7);
  
  return (
    <motion.div 
      className="relative w-full h-full flex items-end justify-center"
      animate={{ scale: isInteracting ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Stem */}
      <div 
        className="absolute bottom-0 rounded-full"
        style={{
          width: '4px',
          height: '60%',
          background: `linear-gradient(to top, 
            hsl(120, 40%, 30%), 
            hsl(120, 50%, 40%)
          )`,
          filter: 'blur(0.5px)',
          transform: `rotate(${-5 + seededRandom(seed + 2) * 10}deg)`,
          transformOrigin: 'bottom center'
        }}
      />
      
      {/* Leaves */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '20px',
          height: '35px',
          background: `radial-gradient(ellipse at 30% 30%, 
            hsl(120, 45%, 45%), 
            hsl(120, 50%, 30%)
          )`,
          filter: 'blur(1px)',
          bottom: '35%',
          left: '35%',
          transform: 'rotate(-30deg)',
          opacity: 0.9
        }}
      />
      
      {/* Flower head container */}
      <div 
        className="absolute"
        style={{
          bottom: '55%',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        {/* Petals */}
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (360 / petalCount) * i;
          const size = 30 + seededRandom(seed + i + 10) * 15;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size * 1.6,
                background: `radial-gradient(ellipse at 50% 30%, 
                  hsla(${hue}, 70%, ${70 + seededRandom(seed + i) * 10}%, 0.95),
                  hsla(${hue}, 60%, ${50 + seededRandom(seed + i) * 15}%, 0.85)
                )`,
                filter: 'blur(1.5px)',
                transform: `rotate(${angle}deg) translateY(-${size * 0.5}px)`,
                transformOrigin: 'center center',
                boxShadow: `inset 0 -${size * 0.2}px ${size * 0.3}px hsla(${hue}, 50%, 40%, 0.3)`
              }}
              animate={{
                scale: isInteracting ? [1, 1.15, 1] : 1
              }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            />
          );
        })}
        
        {/* Center */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '20px',
            height: '20px',
            background: `radial-gradient(circle at 40% 40%, 
              hsl(${(hue + 40) % 360}, 70%, 65%),
              hsl(${(hue + 40) % 360}, 60%, 45%)
            )`,
            filter: 'blur(0.5px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          animate={{
            scale: isInteracting ? 1.2 : 1
          }}
        />
        
        {/* Soft glow for alien flowers */}
        {personality === 'alien' && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '60px',
              height: '60px',
              background: `radial-gradient(circle, 
                hsla(${hue}, 80%, 70%, 0.4),
                transparent
              )`,
              filter: 'blur(15px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}