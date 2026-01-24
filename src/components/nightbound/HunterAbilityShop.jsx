import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Check, Crosshair, Radar, Shield, Flame, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const ABILITIES = {
  // Tier 1 - Tracking
  enhanced_tracking: {
    id: 'enhanced_tracking',
    name: 'Enhanced Tracking',
    icon: Radar,
    type: 'passive',
    cost: 100,
    tier: 1,
    description: 'Improved ability to locate vampire hiding spots. +20% vampire detection range.',
    effects: ['detection_range +20%']
  },
  tracking_mastery: {
    id: 'tracking_mastery',
    name: 'Tracking Mastery',
    icon: Radar,
    type: 'passive',
    cost: 250,
    tier: 2,
    requires: 'enhanced_tracking',
    description: 'See vampire trail patterns. Gain information about vampire movements.',
    effects: ['detect_movement_trails', 'predict_location +15%']
  },

  // Tier 1 - Combat
  precision_strike: {
    id: 'precision_strike',
    name: 'Precision Strike',
    icon: Crosshair,
    type: 'active',
    cost: 150,
    tier: 1,
    description: 'Focused attack. +30% damage to vital areas. 60s cooldown.',
    effects: ['damage +30%', '60s_cooldown']
  },
  combat_reflexes: {
    id: 'combat_reflexes',
    name: 'Combat Reflexes',
    icon: Zap,
    type: 'passive',
    cost: 200,
    tier: 1,
    description: 'Faster reaction time. +15% evasion chance.',
    effects: ['evasion +15%']
  },
  whirlwind_attack: {
    id: 'whirlwind_attack',
    name: 'Whirlwind Attack',
    icon: Flame,
    type: 'active',
    cost: 350,
    tier: 2,
    requires: 'precision_strike',
    description: 'Strike all nearby enemies. Reduced cooldown. 90s cooldown.',
    effects: ['multi_target', 'damage +25%', '90s_cooldown']
  },

  // Tier 1 - Defense
  supernatural_resistance: {
    id: 'supernatural_resistance',
    name: 'Supernatural Resistance',
    icon: Shield,
    type: 'passive',
    cost: 200,
    tier: 1,
    description: 'Resistance to vampire powers. -20% damage from supernatural attacks.',
    effects: ['supernatural_defense +20%']
  },
  barrier_spell: {
    id: 'barrier_spell',
    name: 'Barrier Spell',
    icon: Shield,
    type: 'active',
    cost: 300,
    tier: 2,
    requires: 'supernatural_resistance',
    description: 'Create protective barrier. -50% incoming damage for 30s. 120s cooldown.',
    effects: ['damage_reduction -50%', 'duration_30s', '120s_cooldown']
  },

  // Tier 1 - Awareness
  heightened_senses: {
    id: 'heightened_senses',
    name: 'Heightened Senses',
    icon: Eye,
    type: 'passive',
    cost: 120,
    tier: 1,
    description: 'Enhanced perception. Detect vampires in darkness. +10% awareness.',
    effects: ['darkness_vision', 'awareness +10%']
  },
  mind_fortress: {
    id: 'mind_fortress',
    name: 'Mind Fortress',
    icon: Zap,
    type: 'passive',
    cost: 280,
    tier: 2,
    requires: 'heightened_senses',
    description: 'Resistance to mental intrusion. Immune to mind control attempts.',
    effects: ['mind_control_immunity', 'compulsion_resistance +50%']
  }
};

const ABILITY_CATEGORIES = {
  tracking: {
    name: 'Tracking',
    abilities: ['enhanced_tracking', 'tracking_mastery'],
    color: 'blue'
  },
  combat: {
    name: 'Combat',
    abilities: ['precision_strike', 'combat_reflexes', 'whirlwind_attack'],
    color: 'red'
  },
  defense: {
    name: 'Defense',
    abilities: ['supernatural_resistance', 'barrier_spell'],
    color: 'green'
  },
  awareness: {
    name: 'Awareness',
    abilities: ['heightened_senses', 'mind_fortress'],
    color: 'purple'
  }
};

export default function HunterAbilityShop({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('combat');
  const [purchasing, setPurchasing] = useState(false);

  const unlockedAbilities = hunter.unlocked_abilities || [];
  const currency = hunter.experience || 0;

  const handleUnlock = async (abilityId) => {
    const ability = ABILITIES[abilityId];
    
    if (currency < ability.cost) {
      alert('Not enough experience!');
      return;
    }

    if (ability.requires && !unlockedAbilities.includes(ability.requires)) {
      alert(`You must unlock "${ABILITIES[ability.requires].name}" first!`);
      return;
    }

    setPurchasing(true);

    try {
      const newAbilities = [...unlockedAbilities, abilityId];
      const newExperience = currency - ability.cost;

      await base44.entities.Hunter.update(hunter.id, {
        unlocked_abilities: newAbilities,
        experience: newExperience
      });

      await base44.entities.NightLog.create({
        entry: `Unlocked ability: ${ability.name}. ${ability.description}`,
        category: 'hunting',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries(['hunters']);
      setPurchasing(false);
    } catch (e) {
      console.error('Failed to unlock ability:', e);
      setPurchasing(false);
    }
  };

  const categoryAbilities = ABILITY_CATEGORIES[selectedCategory].abilities
    .map(id => ABILITIES[id]);

  const colors = {
    blue: 'from-blue-900/60 to-cyan-900/60',
    red: 'from-red-900/60 to-orange-900/60',
    green: 'from-green-900/60 to-emerald-900/60',
    purple: 'from-purple-900/60 to-pink-900/60'
  };

  const borderColors = {
    blue: 'border-blue-500/50',
    red: 'border-red-500/50',
    green: 'border-green-500/50',
    purple: 'border-purple-500/50'
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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Ability Shop</h2>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Experience</p>
            <p className="text-white text-2xl font-bold">{currency}</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(ABILITY_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`rounded-lg p-3 transition-all font-medium ${
                selectedCategory === key
                  ? `bg-gradient-to-r ${colors[category.color]} border-2 ${borderColors[category.color]} text-white`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Abilities Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <AnimatePresence>
            {categoryAbilities.map((ability) => {
              const isUnlocked = unlockedAbilities.includes(ability.id);
              const canAfford = currency >= ability.cost;
              const requirementMet = !ability.requires || unlockedAbilities.includes(ability.requires);
              const Icon = ability.icon;

              return (
                <motion.div
                  key={ability.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    isUnlocked
                      ? `bg-gradient-to-br ${colors[ABILITY_CATEGORIES[selectedCategory].color]} border-green-500/50`
                      : 'bg-gray-800/50 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isUnlocked ? 'bg-green-500/20' : 'bg-gray-700/50'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isUnlocked ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-300'}`}>
                          {ability.name}
                        </h3>
                        <p className={`text-xs ${
                          isUnlocked ? 'text-green-300' : 'text-gray-500'
                        }`}>
                          {ability.type === 'active' ? '⚡ Active' : '✦ Passive'} • Tier {ability.tier}
                        </p>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  <p className={`text-sm mb-3 ${
                    isUnlocked ? 'text-gray-200' : 'text-gray-400'
                  }`}>
                    {ability.description}
                  </p>

                  {ability.requires && !unlockedAbilities.includes(ability.requires) && (
                    <p className="text-xs text-yellow-400 mb-2">
                      Requires: {ABILITIES[ability.requires].name}
                    </p>
                  )}

                  {isUnlocked ? (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 text-center">
                      <p className="text-green-300 text-sm font-medium">Unlocked</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUnlock(ability.id)}
                      disabled={!canAfford || !requirementMet || purchasing}
                      className={`w-full py-2 rounded-lg font-medium transition-all text-sm ${
                        canAfford && requirementMet
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {purchasing ? 'Unlocking...' : `Unlock (${ability.cost} XP)`}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}