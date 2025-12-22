import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function GardenBackground() {
  // Get time-based gradient - darker mystical theme
  const timeGradient = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 8) {
      // Dawn - soft twilight
      return {
        from: '#2d2438',
        via: '#3a2f4a',
        to: '#1a1625'
      };
    } else if (hour >= 8 && hour < 17) {
      // Day - deep forest
      return {
        from: '#1f2937',
        via: '#374151',
        to: '#1f2937'
      };
    } else if (hour >= 17 && hour < 20) {
      // Dusk - purple twilight
      return {
        from: '#312e40',
        via: '#433d5a',
        to: '#1e1b2e'
      };
    } else {
      // Night - deep cosmic
      return {
        from: '#0f0a1e',
        via: '#1a1335',
        to: '#050308'
      };
    }
  }, []);
  
  // Mystical floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.4
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
      
      {/* Mystical floating particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: particle.id % 3 === 0 ? 'rgba(150, 200, 255, 0.5)' :
                       particle.id % 3 === 1 ? 'rgba(200, 150, 255, 0.5)' :
                       'rgba(255, 200, 200, 0.4)',
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.3)`
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(particle.id) * 10, 0],
            opacity: [particle.opacity * 0.3, particle.opacity, particle.opacity * 0.3]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
      
      {/* Bottom ground gradient - mystical fog */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(100, 80, 120, 0.3) 100%)',
          backdropFilter: 'blur(1px)'
        }}
      />
    </div>
  );
}