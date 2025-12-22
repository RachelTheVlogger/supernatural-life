import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function PixelFlower({ flower, isInteracting }) {
  const seed = flower.seed;
  const personality = flower.personality;
  
  const seededRandom = (s) => {
    const x = Math.sin(s * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  const colors = useMemo(() => {
    if (personality === 'poisonous') {
      return {
        petal: '#a855f7',
        petalDark: '#7e22ce',
        center: '#fbbf24',
        stem: '#4d7c0f'
      };
    }
    if (personality === 'alien') {
      return {
        petal: '#06b6d4',
        petalDark: '#0e7490',
        center: '#f0abfc',
        stem: '#065f46'
      };
    }
    const hue = seededRandom(seed) * 360;
    return {
      petal: `hsl(${hue}, 70%, 60%)`,
      petalDark: `hsl(${hue}, 70%, 45%)`,
      center: `hsl(${(hue + 40) % 360}, 70%, 55%)`,
      stem: '#65a30d'
    };
  }, [seed, personality]);
  
  const pixelSize = 6;
  
  const Pixel = ({ x, y, color, className = '' }) => (
    <div
      className={className}
      style={{
        position: 'absolute',
        width: pixelSize,
        height: pixelSize,
        backgroundColor: color,
        left: x * pixelSize,
        top: y * pixelSize,
        imageRendering: 'pixelated'
      }}
    />
  );
  
  return (
    <motion.div 
      className="relative w-full h-full flex items-end justify-center"
      animate={{ scale: isInteracting ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{ imageRendering: 'pixelated' }}
    >
      <div 
        className="relative"
        style={{
          width: pixelSize * 15,
          height: pixelSize * 20,
          imageRendering: 'pixelated'
        }}
      >
        {/* Stem */}
        <Pixel x={7} y={8} color={colors.stem} />
        <Pixel x={7} y={9} color={colors.stem} />
        <Pixel x={7} y={10} color={colors.stem} />
        <Pixel x={7} y={11} color={colors.stem} />
        <Pixel x={7} y={12} color={colors.stem} />
        <Pixel x={7} y={13} color={colors.stem} />
        <Pixel x={7} y={14} color={colors.stem} />
        <Pixel x={7} y={15} color={colors.stem} />
        <Pixel x={7} y={16} color={colors.stem} />
        
        {/* Leaf */}
        <Pixel x={5} y={12} color={colors.stem} />
        <Pixel x={6} y={13} color={colors.stem} />
        
        {/* Flower - top petal */}
        <Pixel x={7} y={4} color={colors.petal} />
        <Pixel x={7} y={5} color={colors.petalDark} />
        
        {/* Right petal */}
        <Pixel x={9} y={6} color={colors.petal} />
        <Pixel x={10} y={6} color={colors.petalDark} />
        
        {/* Bottom right petal */}
        <Pixel x={9} y={8} color={colors.petal} />
        <Pixel x={10} y={8} color={colors.petalDark} />
        
        {/* Bottom left petal */}
        <Pixel x={5} y={8} color={colors.petal} />
        <Pixel x={4} y={8} color={colors.petalDark} />
        
        {/* Left petal */}
        <Pixel x={5} y={6} color={colors.petal} />
        <Pixel x={4} y={6} color={colors.petalDark} />
        
        {/* Center */}
        <Pixel x={7} y={7} color={colors.center} />
        <Pixel x={7} y={6} color={colors.center} />
        <Pixel x={6} y={7} color={colors.center} />
        <Pixel x={8} y={7} color={colors.center} />
        
        {/* Alien sparkle effect */}
        {personality === 'alien' && (
          <motion.div
            animate={{
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Pixel x={6} y={4} color="#fff" />
            <Pixel x={10} y={5} color="#fff" />
          </motion.div>
        )}
        
        {/* Poisonous thorns */}
        {personality === 'poisonous' && (
          <>
            <Pixel x={6} y={10} color={colors.petalDark} />
            <Pixel x={8} y={13} color={colors.petalDark} />
          </>
        )}
      </div>
    </motion.div>
  );
}