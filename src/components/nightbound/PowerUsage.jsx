import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Eye, Heart, Skull, Wind, Moon, Sparkles, Shield, Sun, Star, Lock, Clock, Droplets } from 'lucide-react';
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
    upgradeEffects: (level) => ({
      relationshipBonus: 12 + (level * 6),
      description: level <= 3 ? ['Basic calming effect', 'Deep peace and healing', 'Complete emotional restoration'][level - 1] : `Master level ${level} - Divine tranquility`
    })
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
    upgradeEffects: (level) => ({
      relationshipBonus: 10 + (level * 5),
      description: level <= 3 ? ['Surface emotions', 'Deep emotional insight', 'Complete emotional fusion'][level - 1] : `Master level ${level} - Soul reading`
    })
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
    upgradeEffects: (level) => ({
      relationshipBonus: 15 + (level * 5),
      description: level <= 3 ? ['Basic attraction', 'Intense desire', 'Irresistible allure'][level - 1] : `Master level ${level} - Overwhelming magnetism`
    })
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
    upgradeEffects: (level) => ({
      relationshipBonus: 8 + (level * 4),
      description: level <= 3 ? ['Quick movement', 'Teleportation-like speed', 'Instant translocation'][level - 1] : `Master level ${level} - Reality bending`
    })
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
    upgradeEffects: (level) => ({
      relationshipCost: Math.max(1, 5 - level),
      description: level <= 3 ? ['Basic commands', 'Complex instructions', 'Total mental domination'][level - 1] : `Master level ${level} - Absolute control`
    })
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
    upgradeEffects: (level) => ({
      relationshipCost: Math.max(2, 15 - (level * 3)),
      description: level <= 3 ? ['Mild terror', 'Paralyzing fear', 'Existential dread'][level - 1] : `Master level ${level} - Pure horror`
    })
  },
  
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
    upgradeEffects: (level) => ({
      description: level <= 3 ? ['Basic domination', 'Complete mental control', 'Soul binding'][level - 1] : `Master level ${level} - Reality erasure`
    })
  },

  'Feral Rage': {
    icon: Skull,
    description: 'Unleash primal vampire fury',
    cost: 'Lose control temporarily. High hunger cost.',
    hungerCost: 3,
    moralityRequirement: { max: 30, path: 'ruthless' },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You lost control. Animal instincts took over. They saw the beast.',
        'Pure rage. Supernatural strength. They cowered in terror.',
        'The monster emerged. Raw. Brutal. Unrestrained.',
        'Feral. You moved like a predator. They were prey.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.max((servant.relationship || 0) - 20, 0),
        emotional_state: 'terrified',
        obsession_stage: Math.min(servant.obsession_stage + 1, 5)
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'fear',
    upgradeEffects: (level) => ({
      relationshipCost: Math.max(5, 20 - (level * 3)),
      description: level <= 3 ? ['Controlled fury', 'Devastating rage', 'Primal apocalypse'][level - 1] : `Master level ${level} - Embodiment of terror`
    })
  },

  'Dream Walking': {
    icon: Moon,
    description: 'Enter their dreams. Control their subconscious.',
    cost: 'Requires deep bond. Hunger increase.',
    hungerCost: 1,
    moralityRequirement: { min: 30, max: 70 },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You slipped into their dreams. Shaped their fantasies.',
        'Their subconscious opened to you. You planted seeds.',
        'Dream walking complete. They\'ll remember you differently now.',
        'You rewrote their dreams. Made yourself the center.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 18, 100),
        emotional_state: 'enchanted'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'connection',
    upgradeEffects: (level) => ({
      relationshipBonus: 18 + (level * 7),
      description: level <= 3 ? ['Surface dreams', 'Deep manipulation', 'Reality alteration'][level - 1] : `Master level ${level} - Architect of dreams`
    })
  },

  'Time Dilation': {
    icon: Clock,
    description: 'Slow their perception. Moments become eternities.',
    cost: 'Extreme hunger cost. Reality bending.',
    hungerCost: 4,
    moralityRequirement: { min: 40 },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'Time slowed for them. A second became an hour in their mind.',
        'You bent reality. They experienced infinity in a moment.',
        'Time dilation complete. They aged subjectively while you watched.',
        'Their perception shattered. Time lost all meaning.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 25, 100),
        emotional_state: 'awestruck'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'perception',
    upgradeEffects: (level) => ({
      relationshipBonus: 25 + (level * 10),
      hungerCost: Math.max(2, 4 - Math.floor(level / 3)),
      description: level <= 3 ? ['Slow moments', 'Stop time', 'Reverse flow'][level - 1] : `Master level ${level} - Master of temporal reality`
    })
  },

  'Soul Gaze': {
    icon: Eye,
    description: 'See into their very soul. Know them completely.',
    cost: 'No hunger cost. Perfect understanding.',
    hungerCost: 0,
    moralityRequirement: { min: 50 },
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You gazed into their soul. Saw everything. Every secret. Every desire.',
        'Soul gaze complete. Their essence laid bare before you.',
        'You looked deeper than flesh. Than mind. Into the core of them.',
        'Their soul opened like a book. You read every page.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 20, 100),
        emotional_state: 'vulnerable'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'perception',
    upgradeEffects: (level) => ({
      relationshipBonus: 20 + (level * 8),
      description: level <= 3 ? ['Surface soul', 'Deep essence', 'Cosmic truth'][level - 1] : `Master level ${level} - See all that was and will be`
    })
  },

  // Vampire-to-Vampire Powers
  'Eternal Bond': {
    icon: Moon,
    description: 'Create unbreakable connection between vampires',
    cost: 'Both vampires bound forever.',
    hungerCost: 0,
    requiresTurned: true,
    effects: async (servant, vampireState) => {
      const outcomes = [
        'Your blood called to theirs. The bond formed. Eternal. Unbreakable.',
        'Vampire to vampire. The connection snapped into place. Forever bound.',
        'You felt their immortal soul link to yours. Eternal bond complete.',
        'Two vampires. One bond. Nothing can break this now.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: 100,
        emotional_state: 'eternally_bound'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'bond',
    upgradeEffects: (level) => ({
      description: level <= 3 ? ['Basic vampire bond', 'Deep immortal connection', 'Soul fusion'][level - 1] : `Master level ${level} - One being, two bodies`
    })
  },

  'Blood Exchange': {
    icon: Droplets,
    description: 'Share power through intimate feeding',
    cost: 'Intensely intimate. Both changed.',
    hungerCost: 1,
    requiresTurned: true,
    effects: async (servant, vampireState) => {
      const outcomes = [
        'You fed from them. They fed from you. Power flowed both ways. Intoxicating.',
        'Blood exchange. Your fangs in their neck. Theirs in yours. Pleasure overwhelming.',
        'You tasted immortal blood. They tasted yours. The world dissolved.',
        'Vampire feeding on vampire. Taboo. Ecstatic. Perfect.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 30, 100),
        emotional_state: 'euphoric'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'bond',
    upgradeEffects: (level) => ({
      relationshipBonus: 30 + (level * 12),
      description: level <= 3 ? ['Shared feeding', 'Power exchange', 'Essence fusion'][level - 1] : `Master level ${level} - Infinite pleasure loop`
    })
  },

  'Immortal Passion': {
    icon: Heart,
    description: 'Supernatural intensity in every touch',
    cost: 'Addictive. Overwhelming.',
    hungerCost: 0,
    requiresTurned: true,
    effects: async (servant, vampireState) => {
      const outcomes = [
        'Your touch ignited them. Vampire skin on vampire skin. Electric. Burning.',
        'Every kiss supernatural. Every caress overwhelming. Immortal passion.',
        'You moved together. Vampire speed. Vampire strength. Endless stamina.',
        'They gasped. You grinned. Vampire-to-vampire intimacy hits different.'
      ];
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min((servant.relationship || 0) + 25, 100),
        emotional_state: 'passionate'
      });
      return outcomes[Math.floor(Math.random() * outcomes.length)];
    },
    visualEffect: 'charm',
    upgradeEffects: (level) => ({
      relationshipBonus: 25 + (level * 10),
      description: level <= 3 ? ['Intense touch', 'Overwhelming pleasure', 'Transcendent ecstasy'][level - 1] : `Master level ${level} - Reality-breaking intimacy`
    })
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
    upgradeEffects: (level) => ({
      relationshipBonus: 5 + (level * 3),
      description: level <= 3 ? ['Surface thoughts', 'Hidden desires', 'Complete mind reading'][level - 1] : `Master level ${level} - Soul perception`
    })
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
    upgradeEffects: (level) => ({
      relationshipBonus: 30 + (level * 10),
      description: level <= 3 ? ['Basic blood bond', 'Deep vampiric connection', 'Eternal soul binding'][level - 1] : `Master level ${level} - Cosmic unity`
    })
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
  const [selectedPowers, setSelectedPowers] = useState([]);
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
    
    // Check if servant is turned for vampire-to-vampire powers
    if (power.requiresTurned && !servant.is_turned) return false;
    
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
  
  const togglePower = (powerName) => {
    if (selectedPowers.includes(powerName)) {
      setSelectedPowers(selectedPowers.filter(p => p !== powerName));
    } else {
      setSelectedPowers([...selectedPowers, powerName]);
    }
  };
  
  const handleUsePowers = async () => {
    if (selectedPowers.length === 0) return;
    
    setUsing(true);
    
    setTimeout(async () => {
      let combinedOutcome = '';
      const effects = [];
      
      for (const powerName of selectedPowers) {
        const power = POWER_LIBRARY[powerName];
        const level = getPowerLevel(powerName);
        const result = await power.effects(servant, vampireState);
        effects.push({ name: powerName, result, visualEffect: power.visualEffect });
      
        // Update power progress - INFINITE LEVELS
        const existingProgress = powerProgress.find(p => p.power_name === powerName);
        if (existingProgress) {
          const newTimesUsed = existingProgress.times_used + 1;
          const masteryGain = 5;
          const newMastery = Math.min(existingProgress.mastery + masteryGain, 100);
          const shouldLevelUp = newMastery >= 100;
          const newLevel = shouldLevelUp ? existingProgress.upgrade_level + 1 : existingProgress.upgrade_level;
          
          await base44.entities.PowerProgress.update(existingProgress.id, {
            times_used: newTimesUsed,
            mastery: shouldLevelUp ? 0 : newMastery,
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
        if (power.hungerCost > 0) {
          const hungerStates = ['sated', 'calm', 'lingering', 'heightened', 'restless'];
          const currentIndex = hungerStates.indexOf(vampireState.hunger_state);
          const newIndex = Math.min(currentIndex + power.hungerCost, hungerStates.length - 1);
          await base44.entities.VampireState.update(vampireState.id, {
            hunger_state: hungerStates[newIndex]
          });
        }
      }
      
      // Combined outcome
      combinedOutcome = selectedPowers.length === 1 
        ? effects[0].result
        : effects.map(e => `${e.name}: ${e.result}`).join('\n\n');
      
      setOutcome(combinedOutcome);
      setVisualEffect(effects[0].visualEffect);
      
      // Total humanity impact
      const totalHumanityChange = selectedPowers.reduce((sum, powerName) => {
        const powerData = POWER_LIBRARY[powerName];
        const change = powerData.moralityRequirement?.path === 'ruthless' ? -2 : 
                      powerData.moralityRequirement?.path === 'humane' ? 1 : -1;
        return sum + change;
      }, 0);
      
      const newHumanity = Math.max(0, Math.min(100, humanity + totalHumanityChange));
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
        entry: selectedPowers.length === 1 
          ? `Used ${selectedPowers[0]} on ${servant.name}: ${effects[0].result}`
          : `Used multiple powers on ${servant.name}: ${selectedPowers.join(', ')}`,
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
            <p className="text-gray-400 mt-4">Using power{selectedPowers.length > 1 ? 's' : ''}...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              Use Power on {servant.name}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Every power has consequences. Current time: {timeOfNight}
            </p>
            
            <div className="space-y-3 mb-4">
              {availablePowers.map(([name, power]) => {
                const Icon = power.icon;
                const usable = canUsePower(power);
                const level = getPowerLevel(name);
                const progress = powerProgress.find(p => p.power_name === name);
                const mastery = progress?.mastery || 0;
                const isSelected = selectedPowers.includes(name);
                
                return (
                  <button
                    key={name}
                    onClick={() => usable && togglePower(name)}
                    disabled={!usable}
                    className={`w-full rounded-xl p-4 text-left transition-colors ${
                      isSelected 
                        ? 'bg-purple-700 border-2 border-purple-400' 
                        : usable 
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
            
            {selectedPowers.length > 0 && (
              <button
                onClick={handleUsePowers}
                className="w-full mb-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl py-3 transition-colors"
              >
                Use {selectedPowers.length} Power{selectedPowers.length > 1 ? 's' : ''} Together
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl py-3 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}