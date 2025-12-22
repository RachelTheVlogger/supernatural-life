import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HUNTING_SCENES = [
  {
    title: 'City Silence',
    description: 'A quiet street. Breath fogs. The choice to approach or pass.',
    outcomes: [
      'You watched from shadow. Hunger sharpened without resolution.',
      'You moved closer. They never knew.',
      'You let the moment pass. Control held.'
    ]
  },
  {
    title: 'Forest Stillness',
    description: 'Movement between trees. Shared awareness.',
    outcomes: [
      'The forest held its breath with you.',
      'Something noticed you noticing.',
      'You moved without sound. The night approved.'
    ]
  },
  {
    title: 'Rooftop Watch',
    description: 'Hours pass. Hunger sharpens.',
    outcomes: [
      'Time stretched. You remained still.',
      'The city below felt farther than before.',
      'Patience became its own kind of feeding.'
    ]
  },
  {
    title: 'Train Platform',
    description: 'Crowds. Choice of restraint.',
    outcomes: [
      'You stood among them, unseen.',
      'The urge passed like a held breath.',
      'Proximity without touch. You left nothing behind.'
    ]
  }
];

export default function HuntingModal({ onClose, vampireState }) {
  const [selectedScene, setSelectedScene] = useState(null);
  const [hunting, setHunting] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const queryClient = useQueryClient();
  
  const handleHunt = async (scene) => {
    setSelectedScene(scene);
    setHunting(true);
    
    setTimeout(async () => {
      const randomOutcome = scene.outcomes[Math.floor(Math.random() * scene.outcomes.length)];
      setOutcome(randomOutcome);
      
      // Create log entry
      await base44.entities.NightLog.create({
        entry: randomOutcome,
        category: 'hunting',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries(['logs']);
      
      setTimeout(() => {
        setHunting(false);
        setOutcome(null);
        setSelectedScene(null);
        onClose();
      }, 3000);
    }, 2500);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl p-8 md:p-12 max-w-2xl w-full relative max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-100/40 hover:text-red-100/80 transition-slow"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl text-red-100/80 font-light tracking-widest mb-6 text-center">
          Hunt
        </h2>
        
        {!hunting && !outcome && (
          <div className="space-y-4">
            {HUNTING_SCENES.map((scene, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleHunt(scene)}
                className="w-full glass rounded-xl p-6 text-left hover:bg-red-950/20 transition-slow"
              >
                <h3 className="text-red-100/70 text-sm tracking-wider uppercase mb-2">
                  {scene.title}
                </h3>
                <p className="text-red-100/50 text-xs italic leading-relaxed">
                  {scene.description}
                </p>
              </motion.button>
            ))}
          </div>
        )}
        
        {hunting && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-red-100/60 text-sm italic mb-6">
              {selectedScene?.description}
            </p>
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-red-100/60 text-sm italic"
            >
              ...
            </motion.div>
          </motion.div>
        )}
        
        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center py-8"
          >
            <p className="text-red-100/70 text-sm leading-relaxed italic">
              {outcome}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}