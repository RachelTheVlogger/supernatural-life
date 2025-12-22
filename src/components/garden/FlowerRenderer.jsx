import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Seeded random for consistent procedural generation
const seededRandom = (seed) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const seededRange = (seed, min, max, offset = 0) => {
  return min + seededRandom(seed + offset) * (max - min);
};

export default function FlowerRenderer({ 
  flower, 
  isInteracting, 
  interactionType,
  onInteractionComplete 
}) {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [wobble, setWobble] = useState(0);
  const [glowOpacity, setGlowOpacity] = useState(0);
  
  const seed = flower.seed;
  const personality = flower.personality;
  
  // Generate flower characteristics from seed
  const characteristics = useMemo(() => {
    const petalCount = Math.floor(seededRange(seed, 5, 12, 1));
    const baseHue = flower.color_hue || seededRange(seed, 0, 360, 2);
    const stemHeight = seededRange(seed, 60, 120, 3);
    const petalSize = seededRange(seed, 15, 30, 4);
    const stemCurve = flower.stem_curve || seededRange(seed, -20, 20, 5);
    const centerSize = seededRange(seed, 8, 16, 6);
    
    // Personality-based adjustments
    let hueShift = 0;
    let saturation = 70;
    let lightness = 65;
    let hasGlow = false;
    let hasSpines = false;
    let isAsymmetric = false;
    let hasTentacles = false;
    
    if (personality === 'poisonous') {
      hueShift = seededRandom(seed + 100) > 0.5 ? 280 : 320; // Purple/magenta range
      saturation = 60;
      lightness = 45;
      hasSpines = true;
    } else if (personality === 'alien') {
      hasGlow = true;
      isAsymmetric = seededRandom(seed + 200) > 0.5;
      hasTentacles = seededRandom(seed + 201) > 0.6;
      saturation = 80;
      lightness = 60;
    }
    
    const finalHue = personality === 'poisonous' ? hueShift : baseHue;
    
    // Generate petal shapes
    const petals = Array.from({ length: petalCount }, (_, i) => {
      const angle = (360 / petalCount) * i + seededRange(seed, -10, 10, 10 + i);
      const size = petalSize * (isAsymmetric ? seededRange(seed, 0.7, 1.3, 20 + i) : 1);
      const elongation = seededRange(seed, 1.2, 2.2, 30 + i);
      return { angle, size, elongation };
    });
    
    return {
      petalCount,
      petals,
      baseHue: finalHue,
      saturation,
      lightness,
      stemHeight,
      petalSize,
      stemCurve,
      centerSize,
      hasGlow,
      hasSpines,
      isAsymmetric,
      hasTentacles
    };
  }, [seed, personality, flower.color_hue, flower.stem_curve]);
  
  // Handle interaction animations
  useEffect(() => {
    if (!isInteracting) {
      setPulseIntensity(0);
      setWobble(0);
      setGlowOpacity(0);
      return;
    }
    
    let intensity = 0;
    let wobbleAmount = 0;
    let glow = 0;
    
    if (personality === 'familiar') {
      // Immediate, warm response
      if (interactionType === 'water') {
        intensity = 1;
        glow = 0.6;
      } else if (interactionType === 'touch') {
        wobbleAmount = 15;
        intensity = 0.5;
      } else if (interactionType === 'hold') {
        intensity = 0.8;
        glow = 0.4;
      }
    } else if (personality === 'poisonous') {
      // Delayed, subtle response
      setTimeout(() => {
        if (interactionType === 'water') {
          setPulseIntensity(0.4);
        } else if (interactionType === 'touch') {
          setWobble(-10); // Slight recoil
        } else if (interactionType === 'hold') {
          setGlowOpacity(0.2);
        }
      }, 800);
      return;
    } else if (personality === 'alien') {
      // Unpredictable, strange response
      const randomBehavior = Math.floor(seededRandom(Date.now()) * 4);
      if (randomBehavior === 0) {
        intensity = 1.2;
        wobbleAmount = 25;
      } else if (randomBehavior === 1) {
        glow = 1;
      } else if (randomBehavior === 2) {
        wobbleAmount = -20;
        setTimeout(() => setWobble(20), 300);
      } else {
        intensity = 0.3;
        glow = 0.8;
      }
    }
    
    setPulseIntensity(intensity);
    setWobble(wobbleAmount);
    setGlowOpacity(glow);
    
  }, [isInteracting, interactionType, personality]);
  
  const { petals, baseHue, saturation, lightness, stemHeight, stemCurve, centerSize, hasGlow, hasSpines, hasTentacles } = characteristics;
  
  const flowerColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  const centerColor = `hsl(${(baseHue + 40) % 360}, ${saturation - 10}%, ${lightness - 20}%)`;
  const stemColor = `hsl(120, 30%, ${35 + (flower.growth_stage || 0) * 2}%)`;
  const glowColor = `hsl(${baseHue}, 80%, 70%)`;
  
  // Calculate scale based on growth
  const growthScale = 1 + (flower.growth_stage || 0) * 0.05;
  const dormantScale = flower.dormant ? 0.85 : 1;
  const dormantOpacity = flower.dormant ? 0.6 : 1;
  
  return (
    <motion.svg
      viewBox="-60 -140 120 160"
      className="w-full h-full"
      style={{ overflow: 'visible' }}
      animate={{
        scale: growthScale * dormantScale * (1 + pulseIntensity * 0.1),
        rotate: wobble,
        opacity: dormantOpacity
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    >
      {/* Glow effect for alien flowers */}
      {hasGlow && (
        <motion.ellipse
          cx="0"
          cy="-100"
          rx="40"
          ry="40"
          fill={glowColor}
          animate={{ opacity: 0.15 + glowOpacity * 0.3 }}
          style={{ filter: 'blur(15px)' }}
        />
      )}
      
      {/* Stem */}
      <motion.path
        d={`M 0 0 Q ${stemCurve} ${-stemHeight / 2} 0 ${-stemHeight}`}
        stroke={stemColor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={{ 
          d: `M 0 0 Q ${stemCurve + wobble * 0.3} ${-stemHeight / 2} 0 ${-stemHeight}` 
        }}
      />
      
      {/* Spines for poisonous flowers */}
      {hasSpines && (
        <>
          {[0.3, 0.5, 0.7].map((pos, i) => (
            <line
              key={i}
              x1={stemCurve * pos * 0.5}
              y1={-stemHeight * pos}
              x2={stemCurve * pos * 0.5 + (i % 2 === 0 ? 8 : -8)}
              y2={-stemHeight * pos - 5}
              stroke={stemColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </>
      )}
      
      {/* Tentacles for alien flowers */}
      {hasTentacles && (
        <>
          {[1, 2, 3].map((_, i) => (
            <motion.path
              key={i}
              d={`M 0 ${-stemHeight} Q ${15 * (i % 2 === 0 ? 1 : -1)} ${-stemHeight - 20} ${10 * (i % 2 === 0 ? 1 : -1)} ${-stemHeight - 30 - i * 5}`}
              stroke={`hsl(${(baseHue + i * 30) % 360}, 60%, 50%)`}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              animate={{
                d: `M 0 ${-stemHeight} Q ${(15 + Math.sin(Date.now() / 1000 + i) * 5) * (i % 2 === 0 ? 1 : -1)} ${-stemHeight - 20} ${(10 + Math.cos(Date.now() / 800 + i) * 3) * (i % 2 === 0 ? 1 : -1)} ${-stemHeight - 30 - i * 5}`
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
          ))}
        </>
      )}
      
      {/* Petals */}
      <g transform={`translate(0, ${-stemHeight})`}>
        {petals.map((petal, i) => (
          <motion.ellipse
            key={i}
            cx="0"
            cy={-petal.size * petal.elongation * 0.5}
            rx={petal.size * 0.6}
            ry={petal.size * petal.elongation * 0.5}
            fill={flowerColor}
            transform={`rotate(${petal.angle})`}
            style={{ transformOrigin: '0 0' }}
            animate={{
              scale: 1 + pulseIntensity * 0.15 * (i % 2 === 0 ? 1 : -0.5),
              opacity: 0.9
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
        
        {/* Center */}
        <motion.circle
          cx="0"
          cy="0"
          r={centerSize}
          fill={centerColor}
          animate={{ scale: 1 + pulseIntensity * 0.2 }}
        />
        
        {/* Inner glow for interaction */}
        <AnimatePresence>
          {glowOpacity > 0 && (
            <motion.circle
              cx="0"
              cy="0"
              r={centerSize * 2}
              fill={glowColor}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: glowOpacity * 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              style={{ filter: 'blur(8px)' }}
            />
          )}
        </AnimatePresence>
      </g>
      
      {/* Leaves */}
      <ellipse
        cx={stemCurve * 0.3 + 12}
        cy={-stemHeight * 0.4}
        rx="8"
        ry="14"
        fill={stemColor}
        transform={`rotate(30, ${stemCurve * 0.3 + 12}, ${-stemHeight * 0.4})`}
      />
      <ellipse
        cx={stemCurve * 0.6 - 10}
        cy={-stemHeight * 0.65}
        rx="6"
        ry="12"
        fill={stemColor}
        transform={`rotate(-25, ${stemCurve * 0.6 - 10}, ${-stemHeight * 0.65})`}
      />
    </motion.svg>
  );
}