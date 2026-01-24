import React from 'react';
import { motion } from 'framer-motion';

// Feral - Aggressive shake and pulse
export const FeralAnimation = ({ children }) => (
  <motion.div
    animate={{
      x: [0, -2, 2, -2, 0],
      opacity: [1, 0.8, 1],
      scale: [1, 1.02, 1]
    }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className="relative"
  >
    {children}
  </motion.div>
);

// Psychic - Floating with rotation
export const PsychicAnimation = ({ children }) => (
  <motion.div
    animate={{
      y: [-5, 5, -5],
      rotate: [0, 5, -5, 0],
      opacity: [0.9, 1, 0.9]
    }}
    transition={{ duration: 2, repeat: Infinity }}
    className="relative"
  >
    {children}
  </motion.div>
);

// Elemental - Color shifting waves
export const ElementalAnimation = ({ children }) => (
  <motion.div
    animate={{
      boxShadow: [
        '0 0 20px rgba(59, 130, 246, 0.5)',
        '0 0 30px rgba(168, 85, 247, 0.7)',
        '0 0 20px rgba(59, 130, 246, 0.5)'
      ],
      scale: [1, 1.05, 1]
    }}
    transition={{ duration: 2, repeat: Infinity }}
    className="relative"
  >
    {children}
  </motion.div>
);

// Healer - Gentle glow and shimmer
export const HealerAnimation = ({ children }) => (
  <motion.div
    animate={{
      opacity: [0.8, 1, 0.8],
      boxShadow: [
        '0 0 20px rgba(34, 197, 94, 0.3)',
        '0 0 40px rgba(34, 197, 94, 0.6)',
        '0 0 20px rgba(34, 197, 94, 0.3)'
      ]
    }}
    transition={{ duration: 2.5, repeat: Infinity }}
    className="relative"
  >
    {children}
  </motion.div>
);

// Enhanced - Expanding power aura
export const EnhancedAnimation = ({ children }) => (
  <motion.div
    animate={{
      scale: [1, 1.1, 1],
      boxShadow: [
        '0 0 10px rgba(202, 138, 4, 0.4)',
        '0 0 40px rgba(202, 138, 4, 0.8)',
        '0 0 10px rgba(202, 138, 4, 0.4)'
      ]
    }}
    transition={{ duration: 1.2, repeat: Infinity }}
    className="relative"
  >
    {children}
  </motion.div>
);

// Shapeshifter - Morphing and shifting
export const ShapeshifterAnimation = ({ children }) => (
  <motion.div
    animate={{
      borderRadius: ['20%', '50%', '20%'],
      skewX: [0, 5, -5, 0],
      opacity: [0.85, 1, 0.85]
    }}
    transition={{ duration: 2, repeat: Infinity }}
    className="relative"
  >
    {children}
  </motion.div>
);

// Toxic - Dripping and spreading
export const ToxicAnimation = ({ children }) => (
  <motion.div
    animate={{
      y: [0, 3, 0],
      opacity: [0.7, 0.9, 0.7],
      boxShadow: [
        '0 0 15px rgba(132, 204, 22, 0.3)',
        '0 0 35px rgba(132, 204, 22, 0.7)',
        '0 0 15px rgba(132, 204, 22, 0.3)'
      ]
    }}
    transition={{ duration: 1.8, repeat: Infinity }}
    className="relative"
  >
    {children}
  </motion.div>
);

// Generic wrapper that applies the right animation
export const MutantAnimationWrapper = ({ mutantType, children }) => {
  const animationMap = {
    feral: FeralAnimation,
    psychic: PsychicAnimation,
    elemental: ElementalAnimation,
    healer: HealerAnimation,
    enhanced: EnhancedAnimation,
    shapeshifter: ShapeshifterAnimation,
    toxic: ToxicAnimation
  };

  const Animation = animationMap[mutantType] || FeralAnimation;
  return <Animation>{children}</Animation>;
};