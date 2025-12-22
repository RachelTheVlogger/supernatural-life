import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function GardenBackground() {
  // Get time-based gradient
  const timeGradient = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 8) {
      // Dawn - soft pink/orange
      return {
        from: '#fef3e3',
        via: '#fce7d6',
        to: '#f5e6d3'
      };
    } else if (hour >= 8 && hour < 17) {
      // Day - warm cream/sage
      return {
        from: '#f8f6f0',
        via: '#f0ebe3',
        to: '#e8e4dc'
      };
    } else if (hour >= 17 && hour < 20) {
      // Dusk - lavender/rose
      return {
        from: '#f0ebe8',
        via: '#ebe4e1',
        to: '#e5ddd8'
      };
    } else {
      // Night - deep blue/purple tints
      return {
        from: '#e8e6ed',
        via: '#e0dde6',
        to: '#d8d4df'
      };
    }
  }, []);
  
  // Subtle floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10
    }));
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0 transition-colors"
        style={{
          background: `linear-gradient(180deg, ${timeGradient.from} 0%, ${timeGradient.via} 50%, ${timeGradient.to} 100%)`,
          transitionDuration: '3000ms'
        }}
      />
      
      {/* Subtle organic shapes */}
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4c5b0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d4c5b0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c5d4c5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c5d4c5" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <motion.ellipse
          cx="20%"
          cy="30%"
          rx="25%"
          ry="20%"
          fill="url(#blob1)"
          animate={{
            cx: ['20%', '25%', '20%'],
            cy: ['30%', '35%', '30%']
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <motion.ellipse
          cx="75%"
          cy="70%"
          rx="30%"
          ry="25%"
          fill="url(#blob2)"
          animate={{
            cx: ['75%', '70%', '75%'],
            cy: ['70%', '65%', '70%']
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      
      {/* Floating particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
      
      {/* Bottom ground gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(139, 125, 107, 0.1) 100%)'
        }}
      />
    </div>
  );
}