import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HUNTING_SCENES = [
  {
    title: 'City Silence',
    description: 'a quiet street. Breath fogs. The choice to approach or pass.',
    outcomes: [
      'you watched from shadow. Hunger sharpened without resolution.',
      'you moved closer. They never knew.',
      'you let the moment pass. Control held.'
    ]
  },
  {
    title: 'Forest Stillness',
    description: 'movement between trees. Shared awareness.',
    outcomes: [
      'the forest held its breath with you.',
      'something noticed you noticing.',
      'you moved without sound. The night approved.'
    ]
  },
  {
    title: 'Rooftop Watch',
    description: 'hours pass. Hunger sharpens.',
    outcomes: [
      'time stretched. You remained still.',
      'the city below felt farther than before.',
      'patience became its own kind of feeding.'
    ]
  },
  {
    title: 'Train Platform',
    description: 'crowds. Choice of restraint.',
    outcomes: [
      'you stood among them, unseen.',
      'the urge passed like a held breath.',
      'proximity without touch. You left nothing behind.'
    ]
  }
];

export default function HuntingModal({ onClose, vampireState, servants }) {
  const [selectedScene, setSelectedScene] = useState(null);
  const [hunting, setHunting] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [selectedServant, setSelectedServant] = useState(null);
  const [showServantSelect, setShowServantSelect] = useState(false);
  const queryClient = useQueryClient();
  
  const handleHunt = async (scene, withServant = false) => {
    setSelectedScene(scene);
    setHunting(true);
    setShowServantSelect(false);
    
    setTimeout(async () => {
      let randomOutcome = scene.outcomes[Math.floor(Math.random() * scene.outcomes.length)];
      
      if (withServant && selectedServant) {
        randomOutcome = `you hunted with ${selectedServant.name}. ${randomOutcome} Your bond deepened.`;
        
        // Update servant obsession
        await base44.entities.Servant.update(selectedServant.id, {
          obsession_stage: Math.min(selectedServant.obsession_stage + 1, 5)
        });
        
        // Unlock joint hunting power
        if (!vampireState.unlocked_powers?.includes('Pack Bond')) {
          const updatedPowers = [...(vampireState.unlocked_powers || []), 'Pack Bond'];
          await base44.entities.VampireState.update(vampireState.id, {
            unlocked_powers: updatedPowers
          });
        }
      }
      
      setOutcome(randomOutcome);
      
      // Create log entry
      await base44.entities.NightLog.create({
        entry: randomOutcome,
        category: 'hunting',
        intensity: withServant ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries(['logs']);
      queryClient.invalidateQueries(['servants']);
      queryClient.invalidateQueries(['vampireState']);
      
      setTimeout(() => {
        setHunting(false);
        setOutcome(null);
        setSelectedScene(null);
        setSelectedServant(null);
        onClose();
      }, 3000);
    }, 2500);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full relative max-h-[80vh] overflow-y-auto"
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
        
        <h2 className="text-2xl font-bold text-white mb-6">
          Hunt
        </h2>
        
        {!hunting && !outcome && !showServantSelect && (
          <div className="space-y-3">
            {HUNTING_SCENES.map((scene, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleHunt(scene)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <h3 className="text-white font-medium mb-1">
                  {scene.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {scene.description}
                </p>
              </motion.button>
            ))}
            
            {servants.length > 0 && (
              <button
                onClick={() => setShowServantSelect(true)}
                className="w-full bitlife-btn rounded-xl py-4 mt-4"
              >
                Hunt with a Servant
              </button>
            )}
          </div>
        )}
        
        {showServantSelect && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">Choose a servant to hunt with:</p>
            {servants.map((servant) => (
              <button
                key={servant.id}
                onClick={() => {
                  setSelectedServant(servant);
                  const scene = HUNTING_SCENES[Math.floor(Math.random() * HUNTING_SCENES.length)];
                  handleHunt(scene, true);
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <p className="text-white font-medium">{servant.name}</p>
                <p className="text-gray-400 text-sm capitalize">{servant.variant}</p>
              </button>
            ))}
            <button
              onClick={() => setShowServantSelect(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-3 text-gray-400 transition-colors"
            >
              Back
            </button>
          </div>
        )}
        
        {hunting && !outcome && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-6">
              {selectedScene?.description}
            </p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              ...
            </motion.p>
          </div>
        )}
        
        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-white leading-relaxed">
              {outcome}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}