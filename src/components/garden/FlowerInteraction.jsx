import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FantasyFlowerRenderer from './FantasyFlowerRenderer';

export default function FlowerInteraction({ 
  flower, 
  size,
  onWater,
  onTouch,
  onHold,
  onInteractionComplete
}) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState(null);
  const [showWaterDrops, setShowWaterDrops] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const touchStartRef = useRef(null);
  const holdStartRef = useRef(null);
  
  const handleTouchStart = useCallback((e) => {
    e.stopPropagation();
    touchStartRef.current = Date.now();
    holdStartRef.current = Date.now();
    
    // Start hold timer
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(elapsed / 1500, 1); // 1.5 seconds to complete hold
      setHoldProgress(progress);
      
      if (progress >= 1) {
        clearInterval(holdTimerRef.current);
        setInteractionType('hold');
        setIsInteracting(true);
        onHold?.(flower);
        
        setTimeout(() => {
          setIsInteracting(false);
          setHoldProgress(0);
          onInteractionComplete?.();
        }, 1500);
      }
    }, 50);
  }, [flower, onHold, onInteractionComplete]);
  
  const handleTouchEnd = useCallback((e) => {
    e.stopPropagation();
    const touchDuration = Date.now() - touchStartRef.current;
    
    clearInterval(holdTimerRef.current);
    
    if (holdProgress < 1) {
      if (touchDuration < 300) {
        // Quick tap = touch
        setInteractionType('touch');
        setIsInteracting(true);
        onTouch?.(flower);
        
        setTimeout(() => {
          setIsInteracting(false);
          onInteractionComplete?.();
        }, 800);
      }
    }
    
    setHoldProgress(0);
  }, [flower, holdProgress, onTouch, onInteractionComplete]);
  
  const handleWater = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    
    setInteractionType('water');
    setIsInteracting(true);
    setShowWaterDrops(true);
    onWater?.(flower);
    
    setTimeout(() => {
      setShowWaterDrops(false);
    }, 1000);
    
    setTimeout(() => {
      setIsInteracting(false);
      onInteractionComplete?.();
    }, 1500);
  }, [flower, onWater, onInteractionComplete]);
  
  useEffect(() => {
    return () => {
      clearInterval(holdTimerRef.current);
    };
  }, []);
  
  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{ 
        width: size, 
        height: size * 1.4,
        touchAction: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => {
        clearInterval(holdTimerRef.current);
        setHoldProgress(0);
      }}
      onDoubleClick={handleWater}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <FantasyFlowerRenderer
        flower={flower}
        isInteracting={isInteracting}
        interactionType={interactionType}
      />
      
      {/* Hold progress indicator */}
      <AnimatePresence>
        {holdProgress > 0 && holdProgress < 1 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg className="w-16 h-16" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 * (1 - holdProgress)}
                transform="rotate(-90, 50, 50)"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Water drops animation */}
      <AnimatePresence>
        {showWaterDrops && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-3 rounded-full bg-blue-300/70"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: '20%'
                }}
                initial={{ y: 0, opacity: 1, scale: 0.5 }}
                animate={{ 
                  y: 80 + Math.random() * 40, 
                  opacity: 0,
                  scale: 1
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.8 + Math.random() * 0.4,
                  delay: i * 0.1,
                  ease: 'easeIn'
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}