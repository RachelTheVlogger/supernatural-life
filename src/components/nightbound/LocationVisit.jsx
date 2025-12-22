import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const LOCATION_VISUALS = {
  'Night walk through the city': {
    bg: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
    emoji: '🌃',
    ambience: ['Streetlights flicker', 'Distant sirens', 'Empty sidewalks', 'Your footsteps echo']
  },
  'Visit an abandoned building': {
    bg: 'linear-gradient(to bottom, #0d0d0d 0%, #1a1a1a 50%, #262626 100%)',
    emoji: '🏚️',
    ambience: ['Broken windows', 'Dust drifts in moonlight', 'Silence presses in', 'Shadows deepen']
  },
  'Go to a rooftop': {
    bg: 'linear-gradient(to bottom, #000428 0%, #004e92 50%, #1a1a2e 100%)',
    emoji: '🌆',
    ambience: ['City spreads below', 'Wind pulls at clothes', 'Stars above', 'The world feels distant']
  },
  'Walk through the forest': {
    bg: 'linear-gradient(to bottom, #0a1f0a 0%, #1a331a 50%, #0d260d 100%)',
    emoji: '🌲',
    ambience: ['Branches whisper', 'Moonlight filters through', 'Earth beneath your feet', 'Ancient stillness']
  },
  'Visit a cemetery': {
    bg: 'linear-gradient(to bottom, #0a0a14 0%, #1a1a2e 50%, #0f0f1f 100%)',
    emoji: '⚰️',
    ambience: ['Stone angels watch', 'Mist curls low', 'Names half-faded', 'Death has no weight here']
  }
};

export default function LocationVisit({ location, servantName, outcome, onClose }) {
  const [phase, setPhase] = useState('arriving');
  const visual = LOCATION_VISUALS[location.name];
  
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('present'), 2000);
    const timer2 = setTimeout(() => setPhase('outcome'), 4000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: visual.bg }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="max-w-2xl w-full text-center">
        {/* Location emoji */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-9xl mb-8"
        >
          {visual.emoji}
        </motion.div>
        
        {/* Location name */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          {location.name}
        </motion.h2>
        
        {/* Ambience details */}
        {phase === 'present' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mb-8"
          >
            {visual.ambience.map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.4 }}
                className="text-gray-300 text-lg"
              >
                {text}
              </motion.p>
            ))}
          </motion.div>
        )}
        
        {/* Outcome */}
        {phase === 'outcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-6"
          >
            <p className="text-white text-xl mb-4">
              {outcome}
            </p>
            <p className="text-purple-300">
              With {servantName}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}