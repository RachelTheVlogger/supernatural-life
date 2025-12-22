import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const OPENING_SCENES = [
  {
    text: "The bar is dim. Smoke hangs in the air. You've been watching them for an hour.",
    delay: 0
  },
  {
    text: "They sit alone. Third drink. Their eyes keep drifting to the door.",
    delay: 3000
  },
  {
    text: "You slide into the seat across from them. They look up, startled.",
    delay: 6000
  },
  {
    text: '"Mind if I join you?" you ask.',
    delay: 9000
  },
  {
    text: 'Their pulse quickens. You can hear it. Smell it. They nod.',
    delay: 12000
  },
  {
    text: '"I\'m..." they start. Their name doesn\'t matter. Not yet.',
    delay: 15000
  },
  {
    text: 'This is how it begins.',
    delay: 18000
  }
];

export default function OpeningScene() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });
  
  const vampireState = vampireStates[0];
  
  React.useEffect(() => {
    const timers = [];
    
    OPENING_SCENES.forEach((scene, index) => {
      const timer = setTimeout(() => {
        setSceneIndex(index + 1);
        if (index === OPENING_SCENES.length - 1) {
          setTimeout(() => setShowContinue(true), 2000);
        }
      }, scene.delay);
      timers.push(timer);
    });
    
    return () => timers.forEach(t => clearTimeout(t));
  }, []);
  
  const handleContinue = async () => {
    // Generate random servant
    const variants = ['devoted', 'defiant', 'dreamer'];
    const names = [
      'Ash', 'River', 'Sage', 'Rowan', 'Quinn', 'Jade', 'Raven', 'Storm',
      'Alex', 'Blake', 'Eden', 'Gray', 'Haven', 'Indigo', 'Jules', 'Kai'
    ];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    // Create first servant
    await base44.entities.Servant.create({
      name: randomName,
      variant: randomVariant,
      obsession_stage: 1,
      relationship: 0,
      emotional_state: 'curious'
    });
    
    // Mark game as started
    if (vampireState?.id) {
      await base44.entities.VampireState.update(vampireState.id, {
        game_started: true
      });
    }
    
    // Create initial log
    await base44.entities.NightLog.create({
      entry: `You met ${randomName} in a dimly lit bar. The beginning of something eternal.`,
      category: 'interaction',
      intensity: 'significant'
    });
    
    queryClient.invalidateQueries();
    navigate(createPageUrl('Night'));
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ background: 'linear-gradient(to bottom, #0a0a14 0%, #1a0a1a 50%, #0a0014 100%)' }}>
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {OPENING_SCENES.slice(0, sceneIndex).map((scene, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-gray-300 text-lg leading-relaxed mb-6 italic text-center"
            >
              {scene.text}
            </motion.p>
          ))}
        </AnimatePresence>
        
        {showContinue && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-red-900/60 to-purple-900/60 hover:from-red-900/80 hover:to-purple-900/80 border-2 border-red-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all mt-12"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  );
}