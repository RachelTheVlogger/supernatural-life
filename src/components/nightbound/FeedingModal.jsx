import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Zap, Flame, Droplets } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const FEEDING_OUTCOMES = {
  ethical: [
    { state: 'sated', log: 'You fed carefully. They survived. Control maintained.', humanity: 2 },
    { state: 'sated', log: 'You took only what you needed. Restraint is power.', humanity: 3 },
    { state: 'calm', log: 'You fed with care. They will recover.', humanity: 1 }
  ],
  neutral: [
    { state: 'sated', log: 'You fed. They barely noticed.', humanity: 0 },
    { state: 'calm', log: 'Blood. Relief. The deed is done.', humanity: 0 },
    { state: 'lingering', log: 'You fed quickly. Efficient.', humanity: -1 }
  ],
  brutal: [
    { state: 'sated', log: 'You fed ravenously. They screamed. You didn\'t stop.', humanity: -4 },
    { state: 'calm', log: 'You drained them nearly dry. The beast was satisfied.', humanity: -3 },
    { state: 'lingering', log: 'You took more than you should. Their fear was intoxicating.', humanity: -2 }
  ]
};

export default function FeedingModal({ onClose, vampireState }) {
  const [feeding, setFeeding] = useState(false);
  const [selectingMethod, setSelectingMethod] = useState(true);
  const [selectingBloodType, setSelectingBloodType] = useState(false);
  const [bloodType, setBloodType] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const queryClient = useQueryClient();
  
  const handleBloodTypeChoice = (type) => {
    setBloodType(type);
    setSelectingBloodType(false);
    setSelectingMethod(true);
  };

  const handleFeedingChoice = (method) => {
    setSelectingMethod(false);
    setFeeding(true);
    
    setTimeout(async () => {
      const outcomes = FEEDING_OUTCOMES[method];
      let randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      // Modify based on blood type
      const bloodTypeMods = {
        bloodbag: { humanity: 2, text: ' (Blood bag. Safe, sterile, unsatisfying.)' },
        animal: { humanity: 1, text: ' (Animal blood. It sustains, but barely.)' },
        human: { humanity: 0, text: '' }
      };
      const mod = bloodTypeMods[bloodType];
      randomOutcome = {
        ...randomOutcome,
        humanity: randomOutcome.humanity + mod.humanity,
        log: randomOutcome.log + mod.text
      };
      
      setOutcome(randomOutcome);
      
      // Update vampire state with humanity
      try {
        if (vampireState.id) {
          const newHumanity = Math.max(0, Math.min(100, (vampireState.humanity ?? 50) + randomOutcome.humanity));
          let moral_path = 'balanced';
          if (newHumanity >= 75) moral_path = 'humane';
          else if (newHumanity >= 25) moral_path = 'balanced';
          else if (newHumanity >= 10) moral_path = 'ruthless';
          else moral_path = 'monster';
          
          await base44.entities.VampireState.update(vampireState.id, {
            hunger_state: randomOutcome.state,
            last_feed: new Date().toISOString(),
            humanity: newHumanity,
            moral_path: moral_path
          });
        }
      } catch (e) {
        console.error('Failed to update vampire state:', e);
      }
      
      // Create log entry
      await base44.entities.NightLog.create({
        entry: randomOutcome.log,
        category: 'feeding',
        intensity: method === 'brutal' ? 'significant' : 'moderate'
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
  
  // Start with blood type selection
  React.useEffect(() => {
    if (!bloodType) {
      setSelectingBloodType(true);
      setSelectingMethod(false);
    }
  }, [bloodType]);

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
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-red-100/40 hover:text-red-100/80 transition-slow z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl text-red-100/80 font-light tracking-widest mb-6 text-center">
          Feed
        </h2>
        
        {!feeding && !outcome && !selectingMethod && selectingBloodType && (
          <div className="space-y-4">
            <p className="text-red-100/60 text-sm leading-relaxed text-center italic mb-6">
              Choose your source.
            </p>
            
            <button
              onClick={() => handleBloodTypeChoice('human')}
              className="w-full glass rounded-xl p-4 text-left hover:bg-red-950/30 transition-slow border border-red-500/20 touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <Droplets className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="text-white font-medium mb-1">Human Blood - Direct</p>
                  <p className="text-gray-400 text-sm">Fresh from the vein. Warm. Alive. Satisfying.</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleBloodTypeChoice('bloodbag')}
              className="w-full glass rounded-xl p-4 text-left hover:bg-purple-950/30 transition-slow border border-purple-500/20 touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <p className="text-white font-medium mb-1">Blood Bag</p>
                  <p className="text-gray-400 text-sm">Hospital supply. Safe. Ethical. Less fulfilling. <span className="text-green-400">++Humanity</span></p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleBloodTypeChoice('animal')}
              className="w-full glass rounded-xl p-4 text-left hover:bg-green-950/30 transition-slow border border-green-500/20 touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="text-white font-medium mb-1">Animal Blood</p>
                  <p className="text-gray-400 text-sm">Wild prey. Sustains life. Barely. <span className="text-green-400">+Humanity</span></p>
                </div>
              </div>
            </button>
            
            {(vampireState.nights_passed >= 10) && (
              <button
                onClick={() => handleBloodTypeChoice('synthetic')}
                className="w-full glass rounded-xl p-4 text-left hover:bg-blue-950/30 transition-slow border border-blue-500/20 touch-manipulation"
              >
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <p className="text-white font-medium mb-1">Synthetic Blood</p>
                    <p className="text-gray-400 text-sm">Lab-created. Perfect nutrition. No guilt. <span className="text-green-400">+++Humanity</span></p>
                  </div>
                </div>
              </button>
            )}
            
            {(vampireState.humanity <= 20) && (
              <button
                onClick={() => handleBloodTypeChoice('vampire')}
                className="w-full glass rounded-xl p-4 text-left hover:bg-red-950/50 transition-slow border border-red-500/30 touch-manipulation"
              >
                <div className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <p className="text-white font-medium mb-1">Vampire Blood</p>
                    <p className="text-gray-400 text-sm">Forbidden. Powerful. Addictive. <span className="text-red-400">---Humanity</span></p>
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
        
        {!feeding && !outcome && selectingMethod && bloodType && (
          <div className="space-y-4">
            <p className="text-red-100/60 text-sm leading-relaxed text-center italic mb-6">
              The hunger calls. How will you feed?
            </p>
            
            <button
              onClick={() => handleFeedingChoice('ethical')}
              className="w-full glass rounded-xl p-4 text-left hover:bg-blue-950/30 transition-slow border border-blue-500/20 touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-white font-medium mb-1">Feed Carefully</p>
                  <p className="text-gray-400 text-sm">Take only what you need. Leave them alive. <span className="text-green-400">+Humanity</span></p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleFeedingChoice('neutral')}
              className="w-full glass rounded-xl p-4 text-left hover:bg-purple-950/30 transition-slow border border-purple-500/20 touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <p className="text-white font-medium mb-1">Feed Efficiently</p>
                  <p className="text-gray-400 text-sm">Take what you need. Nothing more, nothing less. <span className="text-gray-400">Neutral</span></p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleFeedingChoice('brutal')}
              className="w-full glass rounded-xl p-4 text-left hover:bg-red-950/30 transition-slow border border-red-500/20 touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <Flame className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="text-white font-medium mb-1">Feed Brutally</p>
                  <p className="text-gray-400 text-sm">Take everything. The beast demands satisfaction. <span className="text-red-400">-Humanity</span></p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                setBloodType(null);
                setSelectingMethod(false);
                setSelectingBloodType(true);
              }}
              className="w-full glass rounded-xl p-2 text-center hover:bg-gray-800/50 transition-slow text-gray-400 text-sm touch-manipulation"
            >
              ← Change Blood Source
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
              Feeding...
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