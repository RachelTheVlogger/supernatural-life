import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const FEEDING_OUTCOMES = [
  { state: 'sated', log: 'The hunger dissolved. Everything felt distant and calm.' },
  { state: 'calm', log: 'You fed with restraint. Control held steady.' },
  { state: 'lingering', log: 'Hunger lingered longer than expected.' },
  { state: 'heightened', log: 'Your senses sharpened. The night became clearer.' },
  { state: 'restless', log: 'Something unsettled remained. You noticed it hours later.' }
];

export default function FeedingModal({ onClose, vampireState }) {
  const [feeding, setFeeding] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const queryClient = useQueryClient();
  
  const handleFeed = async () => {
    setFeeding(true);
    
    setTimeout(async () => {
      const randomOutcome = FEEDING_OUTCOMES[Math.floor(Math.random() * FEEDING_OUTCOMES.length)];
      setOutcome(randomOutcome);
      
      // Update vampire state
      if (vampireState.id) {
        await base44.entities.VampireState.update(vampireState.id, {
          hunger_state: randomOutcome.state,
          last_feed: new Date().toISOString()
        });
      }
      
      // Create log entry
      await base44.entities.NightLog.create({
        entry: randomOutcome.log,
        category: 'feeding',
        intensity: randomOutcome.state === 'restless' ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      
      setTimeout(() => {
        setFeeding(false);
        setOutcome(null);
        onClose();
      }, 3000);
    }, 2000);
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
        className="glass rounded-2xl p-8 md:p-12 max-w-lg w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-100/40 hover:text-red-100/80 transition-slow"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl text-red-100/80 font-light tracking-widest mb-6 text-center">
          Feed
        </h2>
        
        {!feeding && !outcome && (
          <div className="space-y-6">
            <p className="text-red-100/60 text-sm leading-relaxed text-center italic">
              The night offers many choices. You move toward one.
            </p>
            
            <button
              onClick={handleFeed}
              className="w-full glass rounded-xl py-4 text-red-100/70 text-sm tracking-widest uppercase hover:bg-red-950/30 transition-slow"
            >
              Feed
            </button>
          </div>
        )}
        
        {feeding && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
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
              {outcome.log}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}