import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function GardenBackground() {
  // Simple gradient background
  const timeGradient = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 8) {
      return { from: '#e8d5c4', to: '#f5e6d8' };
    } else if (hour >= 8 && hour < 17) {
      return { from: '#d4e4f7', to: '#e8f2ff' };
    } else if (hour >= 17 && hour < 20) {
      return { from: '#f0d9e8', to: '#f5e6f0' };
    } else {
      return { from: '#2d3748', to: '#4a5568' };
    }
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Simple gradient */}
      <div 
        className="absolute inset-0 transition-colors"
        style={{
          background: `linear-gradient(180deg, ${timeGradient.from} 0%, ${timeGradient.to} 100%)`,
          transitionDuration: '3000ms'
        }}
      />
    </div>
  );
}