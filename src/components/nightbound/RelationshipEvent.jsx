import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const RELATIONSHIP_EVENTS = {
  20: {
    title: 'First Trust',
    text: 'They no longer flinch when you approach. Something has shifted.',
    emoji: '🌙'
  },
  40: {
    title: 'Growing Bond',
    text: 'They seek you out now. Watch for you in the darkness.',
    emoji: '💫'
  },
  60: {
    title: 'Deep Connection',
    text: 'They would follow you anywhere. Trust absolute.',
    emoji: '🔮'
  },
  80: {
    title: 'Soul Bound',
    text: 'Their life and yours have become inseparable. They are bound to you completely.',
    emoji: '❤️‍🔥'
  },
  100: {
    title: 'Perfect Unity',
    text: 'Two souls, one darkness. The bond is unbreakable.',
    emoji: '🖤'
  }
};

export default function RelationshipEvent({ milestone, servantName, onClose }) {
  const event = RELATIONSHIP_EVENTS[milestone];
  
  if (!event) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-purple-900/40 to-red-900/40 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-purple-500/30 relative"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-7xl text-center mb-4"
        >
          {event.emoji}
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {event.title}
        </h2>
        
        <p className="text-purple-200 text-center mb-6">
          {servantName}
        </p>
        
        <p className="text-gray-300 text-center leading-relaxed">
          {event.text}
        </p>
      </motion.div>
    </motion.div>
  );
}