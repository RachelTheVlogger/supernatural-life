import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Eye, Heart, Skull, Wind, Moon, Sparkles, Shield, Sun, Star, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';

// Morality-based power system
const POWER_LIBRARY = {
  // Humane powers (Humanity >= 60)
  'Soothing Presence': {
    icon: Heart,
    description: 'Calm their fears. They feel safe with you.',
    cost: 'Minor hunger. Deep trust.',
    hungerCost: 1,
    moralityRequirement: { min: 60, path: 'humane' },
    conditions: { emotionalStates: ['terrified', 'anxious', 'hurt'] },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'Your presence washed over them. Fear dissolved. Peace.',
        'They relaxed completely. Safe in your arms.',
        'You soothed their terror. They trust you absolutely.',
        'Calmness radiated from you. They breathed easier.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 12, 100),
        emotional_state: 'peaceful'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'healing',
    upgradeEffects: {
      1: { relationshipBonus: 12, description: 'Basic calming effect' },
      2: { relationshipBonus: 18, description: 'Deep peace and healing' },
      3: { relationshipBonus: 25, description: 'Complete emotional restoration' }
    }
  },
  
  'Empathic Bond': {
    icon: Sparkles,
    description: 'Feel their emotions. Share their joy and pain.',
    cost: 'None. Pure connection.',
    hungerCost: 0,
    moralityRequirement: { min: 70, path: 'humane' },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You felt everything they felt. The connection was beautiful.',
        'Their emotions flooded through you. Understanding complete.',
        'You shared their pain. Their joy. You became one.',
        'The empathic link formed. No secrets between you.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 10, 100)
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'connection',
    upgradeEffects: {
      1: { relationshipBonus: 10, description: 'Surface emotions' },
      2: { relationshipBonus: 15, description: 'Deep emotional insight' },
      3: { relationshipBonus: 22, description: 'Complete emotional fusion' }
    }
  },
  
  // Balanced powers (Humanity 25-75)
  'Hypnotic Charm': {
    icon: Eye,
    description: 'Make them desire you irresistibly.',
    cost: 'Temporary. May create dependency.',
    hungerCost: 0,
    moralityRequirement: { min: 25, max: 75 },
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
    },
    visualEffect: 'charm',
    upgradeEffects: {
      1: { relationshipBonus: 15, description: 'Basic attraction' },
      2: { relationshipBonus: 20, description: 'Intense desire' },
      3: { relationshipBonus: 28, description: 'Irresistible allure' }
    }
  },
  
  'Shadow Step': {
    icon: Wind,
    description: 'Move impossibly fast. Appear behind them.',
    cost: 'Minor hunger increase.',
    hungerCost: 1,
    moralityRequirement: { min: 20, max: 80 },
    conditions: { timeOfNight: ['midnight', 'late', 'early'] },
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
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'shadow',
    upgradeEffects: {
      1: { relationshipBonus: 8, description: 'Quick movement' },
      2: { relationshipBonus: 12, description: 'Teleportation-like speed' },
      3: { relationshipBonus: 15, description: 'Instant translocation' }
    }
  },
  
  // Ruthless powers (Humanity <= 40)
  'Mind Control': {
    icon: Brain,
    description: 'Command them. They cannot resist.',
    cost: 'Hunger increases. Relationship strain.',
    hungerCost: 1,
    moralityRequirement: { max: 40, path: 'ruthless' },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'They obeyed without question. Eyes glazed.',
        'You spoke. They moved. Perfect obedience.',
        'Their will bent completely to yours.',
        'They did exactly as commanded. No hesitation.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.max((servant.relationship || 0) - 5, 0),
        obsession_stage: Math.min(servant.obsession_stage + 1, 5)
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'domination',
    upgradeEffects: {
      1: { relationshipCost: 5, description: 'Basic commands' },
      2: { relationshipCost: 3, description: 'Complex instructions' },
      3: { relationshipCost: 1, description: 'Total mental domination' }
    }
  },
  
  'Invoke Fear': {
    icon: Skull,
    description: 'Show them what you truly are.',
    cost: 'Terror. Relationship damage. Obedience through fear.',
    hungerCost: 0,
    moralityRequirement: { max: 35, path: 'ruthless' },
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
    },
    visualEffect: 'fear',
    upgradeEffects: {
      1: { relationshipCost: 15, description: 'Mild terror' },
      2: { relationshipCost: 10, description: 'Paralyzing fear' },
      3: { relationshipCost: 5, description: 'Existential dread' }
    }
  },
  
  // Monster powers (Humanity <= 15)
  'Dominate': {
    icon: Shield,
    description: 'Break their will entirely. Make them your puppet.',
    cost: 'They become hollow. Relationship destroyed.',
    hungerCost: 2,
    moralityRequirement: { max: 15, path: 'monster' },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You shattered their will. Nothing remains but obedience.',
        'Dominated completely. They are yours. Empty. Perfect.',
        'Their personality dissolved. Only your commands exist.',
        'You broke them. They smile. Empty eyes. Yours.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: 0,
        obsession_stage: 5,
        emotional_state: 'broken'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'destruction',
    upgradeEffects: {
      1: { description: 'Basic domination' },
      2: { description: 'Complete mental control' },
      3: { description: 'Soul binding' }
    }
  },
  
  // Universal powers (always available)
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
    },
    visualEffect: 'perception',
    upgradeEffects: {
      1: { relationshipBonus: 5, description: 'Surface thoughts' },
      2: { relationshipBonus: 8, description: 'Hidden desires' },
      3: { relationshipBonus: 12, description: 'Complete mind reading' }
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
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'bond',
    upgradeEffects: {
      1: { relationshipBonus: 30, description: 'Basic blood bond' },
      2: { relationshipBonus: 40, description: 'Deep vampiric connection' },
      3: { relationshipBonus: 50, description: 'Eternal soul binding' }
    }
  }
};

const VISUAL_EFFECTS = {
  healing: { color: 'blue', emoji: '💙', particles: 15 },
  connection: { color: 'purple', emoji: '✨', particles: 20 },
  charm: { color: 'pink', emoji: '💖', particles: 18 },
  shadow: { color: 'black', emoji: '🌑', particles: 12 },
  domination: { color: 'red', emoji: '🧠', particles: 16 },
  fear: { color: 'red', emoji: '💀', particles: 20 },
  destruction: { color: 'black', emoji: '⚡', particles: 25 },
  perception: { color: 'cyan', emoji: '👁️', particles: 10 },
  bond: { color: 'crimson', emoji: '🩸', particles: 22 }
};

export default function PowerUsage({ servant, vampireState, onClose, onPowerUsed }) {
  const [selectedPower, setSelectedPower] = useState(null);
  const [using, setUsing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [visualEffect, setVisualEffect] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: powerProgress = [] } = useQuery({
    queryKey: ['powerProgress'],
    queryFn: () => base44.entities.PowerProgress.list()
  });
  
  const humanity = vampireState.humanity ?? 50;
  const unlockedPowers = vampireState.unlocked_powers || [];
  
  // Get time of night (simplified)
  const getTimeOfNight = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) return 'late';
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'day';
    if (hour >= 18 && hour < 21) return 'early';
    return 'midnight';
  };
  
  const timeOfNight = getTimeOfNight();
  
  // Filter available powers based on morality and conditions
  const availablePowers = Object.entries(POWER_LIBRARY).filter(([name, power]) => {
    if (!unlockedPowers.includes(name)) return false;
    
    const req = power.moralityRequirement;
    if (req) {
      if (req.min && humanity < req.min) return false;
      if (req.max && humanity > req.max) return false;
    }
    
    return true;
  });
  
  const canUsePower = (power) => {
    if (power.conditions) {
      if (power.conditions.timeOfNight && !power.conditions.timeOfNight.includes(timeOfNight)) {
        return false;
      }
      if (power.conditions.emotionalStates && !power.conditions.emotionalStates.includes(servant.emotional_state)) {
        return false;
      }
    }
    return true;
  };
  
  const getPowerLevel = (powerName) => {
    const progress = powerProgress.find(p => p.power_name === powerName);
    return progress?.upgrade_level || 1;
  };
  
  const handleUsePower = async (powerName, powerData) => {
    setUsing(true);
    setSelectedPower(powerName);
    setVisualEffect(powerData.visualEffect);
    
    setTimeout(async () => {
      const level = getPowerLevel(powerName);
      const result = await powerData.effects(servant, vampireState);
      setOutcome(result);
      
      // Update power progress
      const existingProgress = powerProgress.find(p => p.power_name === powerName);
      if (existingProgress) {
        const newTimesUsed = existingProgress.times_used + 1;
        const newMastery = Math.min(existingProgress.mastery + 5, 100);
        const newLevel = newMastery >= 100 && existingProgress.upgrade_level < 3 
          ? existingProgress.upgrade_level + 1 
          : existingProgress.upgrade_level;
        
        await base44.entities.PowerProgress.update(existingProgress.id, {
          times_used: newTimesUsed,
          mastery: newMastery >= 100 && newLevel > existingProgress.upgrade_level ? 0 : newMastery,
          upgrade_level: newLevel
        });
      } else {
        await base44.entities.PowerProgress.create({
          power_name: powerName,
          times_used: 1,
          mastery: 5,
          upgrade_level: 1
        });
      }
      
      // Update hunger
      if (powerData.hungerCost > 0) {
        const hungerStates = ['sated', 'calm', 'lingering', 'heightened', 'restless'];
        const currentIndex = hungerStates.indexOf(vampireState.hunger_state);
        const newIndex = Math.min(currentIndex + powerData.hungerCost, hungerStates.length - 1);
        await base44.entities.VampireState.update(vampireState.id, {
          hunger_state: hungerStates[newIndex]
        });
      }
      
      // Humanity impact
      const humanityChange = powerData.moralityRequirement?.path === 'ruthless' ? -2 : 
                            powerData.moralityRequirement?.path === 'humane' ? 1 : -1;
      const newHumanity = Math.max(0, Math.min(100, humanity + humanityChange));
      let moral_path = 'balanced';
      if (newHumanity >= 75) moral_path = 'humane';
      else if (newHumanity >= 25) moral_path = 'balanced';
      else if (newHumanity >= 10) moral_path = 'ruthless';
      else moral_path = 'monster';
      
      await base44.entities.VampireState.update(vampireState.id, {
        humanity: newHumanity,
        moral_path: moral_path
      });
      
      await base44.entities.NightLog.create({
        entry: `Used ${powerName} (Lvl ${level}) on ${servant.name}: ${result}`,
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
          <p className="text-gray-400 mb-4">No powers available at your current morality level.</p>
          <button onClick={onClose} className="bitlife-btn px-6 py-2 rounded-xl">
            Close
          </button>
        </div>
      </motion.div>
    );
  }
  
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
          <div className="text-center py-12 relative overflow-hidden">
            {visualEffect && VISUAL_EFFECTS[visualEffect] && 
              [...Array(VISUAL_EFFECTS[visualEffect].particles)].map((_, i) => (
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
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5
                  }}
                >
                  {VISUAL_EFFECTS[visualEffect].emoji}
                </motion.div>
              ))
            }
            
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
            <p className="text-gray-400 text-sm mb-4">
              Every power has consequences. Current time: {timeOfNight}
            </p>
            
            <div className="space-y-3">
              {availablePowers.map(([name, power]) => {
                const Icon = power.icon;
                const usable = canUsePower(power);
                const level = getPowerLevel(name);
                const progress = powerProgress.find(p => p.power_name === name);
                const mastery = progress?.mastery || 0;
                
                return (
                  <button
                    key={name}
                    onClick={() => usable && handleUsePower(name, power)}
                    disabled={!usable}
                    className={`w-full rounded-xl p-4 text-left transition-colors ${
                      usable 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-gray-800/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-6 h-6 text-purple-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{name}</h3>
                          <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                            Lvl {level}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{power.description}</p>
                        
                        {/* Mastery bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Mastery</span>
                            <span>{mastery}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div 
                              style={{ width: `${mastery}%` }}
                              className="h-1 bg-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                        
                        <p className="text-red-400 text-xs">Cost: {power.cost}</p>
                        
                        {!usable && power.conditions && (
                          <p className="text-yellow-400 text-xs mt-1">
                            <Lock className="w-3 h-3 inline mr-1" />
                            {power.conditions.timeOfNight && 'Requires: ' + power.conditions.timeOfNight.join('/')}
                            {power.conditions.emotionalStates && 'Requires servant in: ' + power.conditions.emotionalStates.join('/')}
                          </p>
                        )}
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