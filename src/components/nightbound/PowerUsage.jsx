import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Eye, Heart, Skull, Wind, Moon, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

// Active vampire powers that can be used
const ACTIVE_POWERS = {
  'Mind Control': {
    icon: Brain,
    description: 'Command them. They cannot resist.',
    cost: 'Hunger increases. Relationship strain.',
    hungerCost: 1,
    effects: async (servant, vampireState) => {
      const commands = [
        'They obeyed without question. Eyes glazed.',
        'You spoke. They moved. Perfect obedience.',
        'Their will bent completely to yours.',
        'They did exactly as commanded. No hesitation.'
      ];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.max((servant.relationship || 0) - 5, 0),
        obsession_stage: Math.min(servant.obsession_stage + 1, 5)
      });
      
      const newHunger = vampireState.hunger_state === 'sated' ? 'calm' :
                        vampireState.hunger_state === 'calm' ? 'lingering' :
                        vampireState.hunger_state === 'lingering' ? 'heightened' : 'restless';
      
      await base44.entities.VampireState.update(vampireState.id, {
        hunger_state: newHunger
      });
      
      return commands[Math.floor(Math.random() * commands.length)];
    }
  },
  
  'Hypnotic Charm': {
    icon: Heart,
    description: 'Make them desire you irresistibly.',
    cost: 'Temporary. May create dependency.',
    hungerCost: 0,
    effects: async (servant, vampireState) => {
      const outcomes = [
        'Their eyes dilated. Pure desire. They wanted you desperately.',
        'Charmed. They couldn\'t look away. Need radiated from them.',
        'You became their entire world in that moment.',
        'They touched you like starving. The charm overwhelming.'
      ];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 15, 100),
        emotional_state: 'infatuated'
      });
      
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    }
  },
  
  'Invoke Fear': {
    icon: Skull,
    description: 'Show them what you truly are.',
    cost: 'Terror. Relationship damage. Obedience through fear.',
    hungerCost: 0,
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You let them see the monster. They froze in terror.',
        'Your true nature revealed. They couldn\'t move. Couldn\'t scream.',
        'Fear absolute. They understood what you could do.',
        'You showed your fangs. They trembled violently.'
      ];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.max((servant.relationship || 0) - 15, 0),
        obsession_stage: Math.min(servant.obsession_stage + 1, 5),
        emotional_state: 'terrified'
      });
      
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    }
  },
  
  'Shadow Step': {
    icon: Wind,
    description: 'Move impossibly fast. Appear behind them.',
    cost: 'Minor hunger increase.',
    hungerCost: 1,
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You vanished. Appeared behind them. They gasped.',
        'Impossible speed. You were there, then not, then behind them.',
        'They blinked. You moved. Supernatural.',
        'You stepped through shadow. Their eyes widened in awe.'
      ];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 8, 100)
      });
      
      const newHunger = vampireState.hunger_state === 'sated' ? 'calm' :
                        vampireState.hunger_state === 'calm' ? 'lingering' : 'heightened';
      
      await base44.entities.VampireState.update(vampireState.id, {
        hunger_state: newHunger
      });
      
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    }
  },
  
  'Blood Bond': {
    icon: Sparkles,
    description: 'Share your blood. Create deep connection.',
    cost: 'Permanent bond. They become addicted.',
    hungerCost: 2,
    effects: async (servant, vampireState) => {
      const outcomes = [
        'Your blood on their lips. The bond formed instantly. Unbreakable.',
        'They drank. Eyes rolled back. Connection absolute.',
        'Blood bond complete. They feel you in their veins now.',
        'You cut yourself. They drank eagerly. Bound forever.'
      ];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 30, 100),
        obsession_stage: 5,
        emotional_state: 'bound'
      });
      
      const newHunger = vampireState.hunger_state === 'sated' ? 'lingering' :
                        vampireState.hunger_state === 'calm' ? 'heightened' : 'restless';
      
      await base44.entities.VampireState.update(vampireState.id, {
        hunger_state: newHunger
      });
      
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    }
  },
  
  'Enhanced Senses': {
    icon: Eye,
    description: 'Perceive their deepest desires.',
    cost: 'None. Pure observation.',
    hungerCost: 0,
    effects: async (servant, vampireState) => {
      const desires = [
        'You sensed their desire for you. Overwhelming. Consuming.',
        'Their heartbeat told you everything. They craved your touch.',
        'You smelled their arousal. Their need. Undeniable.',
        'Every micro-expression revealed. They wanted to surrender.',
        'You heard their thoughts whisper your name. Over and over.'
      ];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 5, 100)
      });
      
      return desires[Math.floor(Math.random() * desires.length)];
    }
  }
};

export default function PowerUsage({ servant, vampireState, onClose, onPowerUsed }) {
  const [selectedPower, setSelectedPower] = useState(null);
  const [using, setUsing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const queryClient = useQueryClient();
  
  const unlockedPowers = vampireState.unlocked_powers || [];
  const availablePowers = Object.entries(ACTIVE_POWERS).filter(([name]) => 
    unlockedPowers.includes(name)
  );
  
  if (availablePowers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md text-center">
          <p className="text-gray-400 mb-4">You haven't unlocked any active powers yet.</p>
          <button onClick={onClose} className="bitlife-btn px-6 py-2 rounded-xl">
            Close
          </button>
        </div>
      </motion.div>
    );
  }
  
  const handleUsePower = async (powerName, powerData) => {
    setUsing(true);
    setSelectedPower(powerName);
    
    setTimeout(async () => {
      const result = await powerData.effects(servant, vampireState);
      setOutcome(result);
      
      await base44.entities.NightLog.create({
        entry: `Used ${powerName} on ${servant.name}: ${result}`,
        category: 'power',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        if (onPowerUsed) onPowerUsed();
        onClose();
      }, 4000);
    }, 1500);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full relative max-h-[80vh] overflow-y-auto"
      >
        {outcome ? (
          <div className="text-center py-12 relative">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  opacity: 1,
                  scale: 0 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 2
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.5
                }}
              >
                ⚡
              </motion.div>
            ))}
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-lg relative z-10"
            >
              {outcome}
            </motion.p>
          </div>
        ) : using ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Zap className="w-16 h-16 text-purple-400 mx-auto" />
            </motion.div>
            <p className="text-gray-400 mt-4">Using {selectedPower}...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              Use Power on {servant.name}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Choose wisely. Every power has consequences.
            </p>
            
            <div className="space-y-3">
              {availablePowers.map(([name, power]) => {
                const Icon = power.icon;
                return (
                  <button
                    key={name}
                    onClick={() => handleUsePower(name, power)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-6 h-6 text-purple-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{power.description}</p>
                        <p className="text-red-400 text-xs">Cost: {power.cost}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={onClose}
              className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl py-3 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}