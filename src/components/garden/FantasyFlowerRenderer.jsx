import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function FantasyFlowerRenderer({ 
  flower, 
  isInteracting, 
  interactionType 
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [particles, setParticles] = useState([]);
  
  const personality = flower.personality;
  const seed = flower.seed;
  
  const seededRandom = (s) => {
    const x = Math.sin(s * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  // Generate flower image if not exists
  useEffect(() => {
    if (flower.image_url) {
      setImageUrl(flower.image_url);
      return;
    }
    
    const generateFlower = async () => {
      setIsGenerating(true);
      
      let prompt = '';
      if (personality === 'familiar') {
        prompt = 'Beautiful soft fantasy flower, gentle pink and cream colors, bokeh background, soft natural lighting, peaceful garden atmosphere, delicate petals, watercolor style, dreamy and calming';
      } else if (personality === 'poisonous') {
        prompt = 'Dark fantasy flower with deep purple and black petals, sharp thorns, glowing yellow-green center, mystical fog background, dramatic lighting, dangerous beauty, gothic botanical art';
      } else {
        prompt = 'Alien bioluminescent flower with flowing ethereal petals, glowing teal and purple gradients, cosmic starfield background, translucent curving tendrils, magical particles, otherworldly and mysterious';
      }
      
      try {
        const result = await base44.integrations.Core.GenerateImage({ 
          prompt: prompt + ', high detail, fantasy art style, centered composition, dark background edges'
        });
        setImageUrl(result.url);
      } catch (error) {
        console.error('Failed to generate flower:', error);
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateFlower();
  }, [flower.image_url, personality]);
  
  // Generate particles on interaction
  useEffect(() => {
    if (!isInteracting) return;
    
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      angle: Math.random() * 360,
      distance: 30 + Math.random() * 40,
      duration: 1 + Math.random() * 1.5,
      delay: i * 0.05
    }));
    
    setParticles(newParticles);
    
    setTimeout(() => setParticles([]), 2500);
  }, [isInteracting]);
  
  const glowIntensity = isInteracting ? 1 : 0.3;
  const glowColor = personality === 'familiar' ? 'rgba(255, 220, 180, 0.6)' :
                    personality === 'poisonous' ? 'rgba(180, 100, 255, 0.7)' :
                    'rgba(100, 200, 255, 0.8)';
  
  if (isGenerating) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-t-transparent"
          style={{ 
            borderColor: personality === 'alien' ? '#60a5fa' : 
                        personality === 'poisonous' ? '#a855f7' : '#f9a8d4'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }
  
  if (!imageUrl) return null;
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end">
      {/* Plant in pot */}
      <motion.div
        className="relative flex flex-col items-center"
        animate={{ 
          scale: isInteracting ? 1.05 : 1,
          y: isInteracting ? -4 : 0
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Plant image */}
        <div 
          className="relative w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden mb-1"
          style={{
            filter: flower.dormant ? 'grayscale(0.5) brightness(0.7)' : 'none'
          }}
        >
          <img 
            src={imageUrl} 
            alt="Fantasy plant"
            className="w-full h-full object-cover"
          />
          
          {/* Subtle glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 70%, ${glowColor}, transparent)`,
              mixBlendMode: 'screen',
              opacity: glowIntensity * 0.4
            }}
            animate={{
              opacity: [glowIntensity * 0.3, glowIntensity * 0.5, glowIntensity * 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>
        
        {/* Pot */}
        <div className="relative">
          <svg width="50" height="32" viewBox="0 0 50 32" className="md:w-[70px] md:h-[45px]">
            <defs>
              <linearGradient id={`potGrad-${flower.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={
                  personality === 'alien' ? '#4a5568' :
                  personality === 'poisonous' ? '#6b4e71' :
                  '#c17855'
                } />
                <stop offset="100%" stopColor={
                  personality === 'alien' ? '#2d3748' :
                  personality === 'poisonous' ? '#4a3550' :
                  '#8b5a3c'
                } />
              </linearGradient>
            </defs>
            <path
              d="M 8 2 L 12 28 L 38 28 L 42 2 Z"
              fill={`url(#potGrad-${flower.id})`}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1"
            />
            <ellipse
              cx="25"
              cy="2"
              rx="17"
              ry="3"
              fill={
                personality === 'alien' ? '#5a6778' :
                personality === 'poisonous' ? '#7b5e81' :
                '#d18865'
              }
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="0.5"
            />
            <rect
              x="10"
              y="26"
              width="30"
              height="6"
              rx="2"
              fill="rgba(0,0,0,0.1)"
            />
          </svg>
        </div>
      </motion.div>
      
      {/* Center glow pulse */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '40%',
          height: '40%',
          left: '30%',
          top: '30%',
          background: `radial-gradient(circle, ${glowColor}, transparent)`,
          filter: 'blur(20px)',
          mixBlendMode: 'screen'
        }}
        animate={{
          opacity: [glowIntensity * 0.5, glowIntensity, glowIntensity * 0.5],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Interaction particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '6px',
              height: '6px',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: personality === 'alien' ? 'rgba(100, 220, 255, 0.9)' :
                         personality === 'poisonous' ? 'rgba(200, 120, 255, 0.9)' :
                         'rgba(255, 200, 150, 0.9)',
              boxShadow: `0 0 10px ${glowColor}`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
              x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
              y: Math.sin(particle.angle * Math.PI / 180) * particle.distance
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut'
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Floating ambient particles */}
      {!flower.dormant && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '3px',
                height: '3px',
                left: `${20 + seededRandom(seed + i) * 60}%`,
                top: `${20 + seededRandom(seed + i + 100) * 60}%`,
                background: glowColor,
                opacity: 0.4,
                boxShadow: `0 0 8px ${glowColor}`
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 3 + seededRandom(seed + i + 200) * 2,
                repeat: Infinity,
                delay: seededRandom(seed + i + 300) * 2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </>
      )}
      
      {/* Growth stage indicator - subtle glow around edges */}
      {flower.growth_stage > 0 && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: `inset 0 0 ${10 + flower.growth_stage * 3}px ${glowColor}`,
            opacity: 0.3
          }}
        />
      )}
    </div>
  );
}