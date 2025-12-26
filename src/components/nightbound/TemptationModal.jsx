import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Skull, Heart, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TEMPTATIONS = {
  feed_recklessly: {
    icon: Flame,
    title: 'Feed Without Restraint',
    descriptions: [
      'The hunger screams. Why hold back? Take everything.',
      'Control is overrated. Let the beast consume.',
      'One deep feed. No mercy. Pure release.'
    ],
    cost: 'Risk losing humanity. Chance to terrify servants.',
    accept: async (vampireState, servants, queryClient) => {
      await base44.entities.VampireState.update(vampireState.id, {
        hunger_state: 'sated',
        emotional_mode: 'ruthless'
      });
      
      // Damage relationship with random servant
      if (servants.length > 0) {
        const servant = servants[Math.floor(Math.random() * servants.length)];
        await base44.entities.Servant.update(servant.id, {
          relationship: Math.max((servant.relationship || 0) - 20, 0),
          emotional_state: 'terrified'
        });
      }
      
      await base44.entities.NightLog.create({
        entry: 'You fed recklessly. The hunger is gone, but something else is lost. Blood on your hands, chaos in your wake.',
        category: 'feeding',
        intensity: 'significant'
      });
      
      return 'Sated. Powerful. But at what cost?';
    },
    reject: async () => {
      await base44.entities.NightLog.create({
        entry: 'You resisted the urge. Control held. The hunger remains, but so does your humanity.',
        category: 'observation',
        intensity: 'moderate'
      });
      return 'Control maintained. The hunger whispers, but you do not listen.';
    }
  },
  
  turn_impulsively: {
    icon: Skull,
    title: 'Turn Them Now',
    descriptions: [
      'Why wait? Make them yours forever. Tonight.',
      'They want it. You know they do. Turn them.',
      'Immortality is a gift. Give it to them. Now.'
    ],
    cost: 'Skip the journey. Rush the bond. Risk their rejection.',
    accept: async (vampireState, servants, queryClient, servantId) => {
      if (!servantId || servants.length === 0) return 'No one to turn.';
      
      const servant = servants.find(s => s.id === servantId) || servants[0];
      
      // Chance of rejection if relationship too low
      if (servant.relationship < 40) {
        await base44.entities.Servant.delete(servant.id);
        await base44.entities.NightLog.create({
          entry: `You tried to turn ${servant.name}. They resisted. The process went wrong. They're gone.`,
          category: 'interaction',
          intensity: 'significant'
        });
        return 'They rejected the gift. Lost forever.';
      }
      
      await base44.entities.Servant.update(servant.id, {
        is_turned: true,
        obsession_stage: 5,
        relationship: Math.max(servant.relationship - 15, 0)
      });
      
      await base44.entities.NightLog.create({
        entry: `You turned ${servant.name} impulsively. Blood and rebirth. They are vampire now, but the bond feels... rushed.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      return 'Turned. Forever bound. But something is missing.';
    },
    reject: async () => {
      await base44.entities.NightLog.create({
        entry: 'Patience. The turning will come when the time is right. Not before.',
        category: 'observation',
        intensity: 'subtle'
      });
      return 'You wait. The bond deepens naturally.';
    }
  },
  
  seduce_stranger: {
    icon: Heart,
    title: 'Seduce a Stranger',
    descriptions: [
      'New blood. New thrills. Why limit yourself?',
      'Someone new walks by. Take them. Add them.',
      'Variety is the spice of immortality. Hunt someone fresh.'
    ],
    cost: 'Your current servants might feel replaced. Trust broken.',
    accept: async (vampireState, servants, queryClient) => {
      // Check if already at max servants (2)
      if (servants.length >= 2) {
        return 'You already have enough servants. Cannot seduce more.';
      }
      
      // Generate new servant
      const names = ['Ash', 'River', 'Sage', 'Rowan', 'Quinn', 'Jade', 'Raven'];
      const variants = ['devoted', 'defiant', 'dreamer'];
      const genders = ['man', 'woman', 'custom'];
      const sexualities = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'questioning'];
      const newName = names[Math.floor(Math.random() * names.length)];
      const newVariant = variants[Math.floor(Math.random() * variants.length)];
      
      await base44.entities.Servant.create({
        name: newName,
        gender: genders[Math.floor(Math.random() * genders.length)],
        sexuality: sexualities[Math.floor(Math.random() * sexualities.length)],
        variant: newVariant,
        obsession_stage: 1,
        relationship: 15,
        emotional_state: 'intrigued'
      });
      
      // Damage existing servants' relationships
      for (const servant of servants) {
        await base44.entities.Servant.update(servant.id, {
          relationship: Math.max((servant.relationship || 0) - 10, 0),
          emotional_state: 'jealous'
        });
      }
      
      await base44.entities.NightLog.create({
        entry: `You seduced ${newName}. New blood, new connection. Your other servants noticed. Jealousy stirs.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      return 'New servant claimed. Old bonds weakened.';
    },
    reject: async () => {
      await base44.entities.NightLog.create({
        entry: 'You resisted the temptation of new blood. Loyalty to those you have.',
        category: 'observation',
        intensity: 'moderate'
      });
      return 'Loyalty to your existing bonds. They notice your restraint.';
    }
  },
  
  abandon_control: {
    icon: Zap,
    title: 'Abandon All Control',
    descriptions: [
      'Why fight the nature? Become the beast.',
      'Let go. Embrace the darkness. No more restraint.',
      'Control is a cage. Break free. Be wild.'
    ],
    cost: 'Lose all progress. Reset relationships. Pure chaos.',
    accept: async (vampireState, servants, queryClient) => {
      await base44.entities.VampireState.update(vampireState.id, {
        emotional_mode: 'ruthless',
        hunger_state: 'restless'
      });
      
      // Damage all relationships severely
      for (const servant of servants) {
        await base44.entities.Servant.update(servant.id, {
          relationship: Math.max((servant.relationship || 0) - 30, 0),
          emotional_state: 'fearful'
        });
      }
      
      await base44.entities.NightLog.create({
        entry: 'You abandoned control. The beast unleashed. Chaos. Terror. Freedom.',
        category: 'power',
        intensity: 'significant'
      });
      
      return 'Free. Wild. Alone.';
    },
    reject: async () => {
      await base44.entities.NightLog.create({
        entry: 'Control is not a cage. It is strength. You remain yourself.',
        category: 'observation',
        intensity: 'significant'
      });
      return 'Control is power. You choose who you are.';
    }
  }
};

export default function TemptationModal({ vampireState, servants, onClose }) {
  const [selectedTemptation, setSelectedTemptation] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const queryClient = useQueryClient();
  
  if (!vampireState) {
    onClose();
    return null;
  }
  
  const availableTemptations = Object.entries(TEMPTATIONS).filter(([key]) => {
    if (key === 'turn_impulsively' && servants.every(s => s.is_turned)) return false;
    if (key === 'feed_recklessly' && vampireState.hunger_state === 'sated') return false;
    return true;
  });
  
  const randomTemptation = availableTemptations[Math.floor(Math.random() * availableTemptations.length)];
  const [temptationType, temptationData] = randomTemptation || [null, null];
  
  if (!temptationData) {
    onClose();
    return null;
  }
  
  const description = temptationData.descriptions[Math.floor(Math.random() * temptationData.descriptions.length)];
  const Icon = temptationData.icon;
  
  const handleAccept = async () => {
    setProcessing(true);
    const result = await temptationData.accept(vampireState, servants, queryClient);
    
    await base44.entities.Temptation.create({
      type: temptationType,
      description: description,
      cost: temptationData.cost,
      accepted: true,
      outcome: result
    });
    
    setOutcome(result);
    queryClient.invalidateQueries();
    
    setTimeout(() => {
      setProcessing(false);
      onClose();
    }, 4000);
  };
  
  const handleReject = async () => {
    setProcessing(true);
    const result = await temptationData.reject();
    
    await base44.entities.Temptation.create({
      type: temptationType,
      description: description,
      cost: temptationData.cost,
      accepted: false,
      outcome: result
    });
    
    setOutcome(result);
    queryClient.invalidateQueries();
    
    setTimeout(() => {
      setProcessing(false);
      onClose();
    }, 4000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-red-950/50 to-purple-950/50 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full relative border-2 border-red-900/50"
      >
        {/* Animated flames */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl pointer-events-none"
            style={{
              left: `${10 + i * 12}%`,
              bottom: '-10px'
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
              delay: i * 0.2
            }}
          >
            🔥
          </motion.div>
        ))}
        
        {outcome ? (
          <div className="text-center py-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-lg"
            >
              {outcome}
            </motion.p>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Icon className="w-12 h-12 text-red-400 mx-auto" />
            </motion.div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <Icon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                Temptation
              </h2>
              <p className="text-red-300 text-xl italic mb-4">
                {temptationData.title}
              </p>
            </div>
            
            <div className="bg-black/40 rounded-xl p-6 mb-6 border border-red-900/30">
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                {description}
              </p>
              <div className="border-t border-red-900/30 pt-4">
                <p className="text-red-400 text-sm">
                  <span className="font-bold">Cost:</span> {temptationData.cost}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleReject}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-4 font-medium transition-colors"
              >
                Resist
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-xl py-4 font-medium transition-all"
              >
                Give In
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}