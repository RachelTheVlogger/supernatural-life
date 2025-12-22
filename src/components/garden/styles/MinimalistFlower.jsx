import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function MinimalistFlower({ flower, isInteracting }) {
  const seed = flower.seed;
  const personality = flower.personality;
  
  const seededRandom = (s) => {
    const x = Math.sin(s * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  const hue = useMemo(() => {
    if (personality === 'poisonous') return 280;
    if (personality === 'alien') return 200;
    return 30 + seededRandom(seed) * 60;
  }, [seed, personality]);
  
  const shape = Math.floor(seededRandom(seed + 1) * 3);
  
  return (
    <motion.div 
      className="relative w-full h-full flex items-end justify-center"
      animate={{ scale: isInteracting ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Stem - single line */}
      <div 
        className="absolute bottom-0"
        style={{
          width: '2px',
          height: '50%',
          backgroundColor: `hsl(120, 20%, 40%)`,
          transformOrigin: 'bottom center'
        }}
      />
      
      {/* Flower head - geometric shape */}
      <motion.div
        className="absolute"
        style={{
          bottom: '48%',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        animate={{
          y: isInteracting ? -5 : 0
        }}
      >
        {shape === 0 && (
          // Circle
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: `hsl(${hue}, 65%, 60%)`,
              border: `3px solid hsl(${hue}, 70%, 45%)`
            }}
          />
        )}
        
        {shape === 1 && (
          // Square/Diamond
          <div
            style={{
              width: '45px',
              height: '45px',
              backgroundColor: `hsl(${hue}, 65%, 60%)`,
              border: `3px solid hsl(${hue}, 70%, 45%)`,
              transform: 'rotate(45deg)'
            }}
          />
        )}
        
        {shape === 2 && (
          // Triangle
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '25px solid transparent',
              borderRight: '25px solid transparent',
              borderBottom: `50px solid hsl(${hue}, 65%, 60%)`,
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '22px solid transparent',
                borderRight: '22px solid transparent',
                borderBottom: `44px solid hsl(${hue}, 70%, 45%)`
              }}
            />
          </div>
        )}
        
        {/* Center dot */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: `hsl(${(hue + 180) % 360}, 60%, 40%)`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: isInteracting ? [1, 1.5, 1] : 1
          }}
        />
        
        {/* Alien trait - orbital ring */}
        {personality === 'alien' && (
          <motion.div
            className="absolute rounded-full border-2"
            style={{
              width: '70px',
              height: '70px',
              borderColor: `hsl(${hue}, 70%, 50%)`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.4
            }}
            animate={{
              rotate: 360
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}