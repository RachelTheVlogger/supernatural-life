import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Heart, Brain, Zap, Eye, Target, X, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TRAIT_LIBRARY = [
  {
    id: 'empathic',
    name: 'Empathic',
    icon: Heart,
    color: 'from-pink-600 to-purple-600',
    description: 'Deep understanding of emotions. Unlocks peaceful dialogue options.',
    effects: {
      dialogue: ['curious', 'protective'],
      activityBonus: 'meditation',
      combatModifier: -10,
      relationshipBonus: 15
    },
    cost: 0,
    unlocked: true
  },
  {
    id: 'brutal',
    name: 'Brutal',
    icon: Sword,
    color: 'from-red-600 to-orange-600',
    description: 'Merciless in combat. Increases damage in hostile interactions.',
    effects: {
      dialogue: ['hostile'],
      activityBonus: 'train',
      combatModifier: 25,
      relationshipBonus: -10
    },
    cost: 0,
    unlocked: true
  },
  {
    id: 'tactical',
    name: 'Tactical Genius',
    icon: Brain,
    color: 'from-blue-600 to-cyan-600',
    description: 'Master strategist. Better planning and research outcomes.',
    effects: {
      dialogue: ['curious'],
      activityBonus: 'research',
      combatModifier: 15,
      exposureReduction: 20
    },
    cost: 100,
    unlocked: false
  },
  {
    id: 'seductive',
    name: 'Seductive',
    icon: Heart,
    color: 'from-red-600 to-pink-600',
    description: 'Irresistible charm. Unlocks flirty and provocative options.',
    effects: {
      dialogue: ['flirty', 'provocative'],
      activityBonus: null,
      combatModifier: 0,
      relationshipBonus: 25
    },
    cost: 100,
    unlocked: false
  },
  {
    id: 'nightstalker',
    name: 'Night Stalker',
    icon: Eye,
    color: 'from-purple-600 to-indigo-600',
    description: 'Expert tracker. Enhanced hunting and surveillance abilities.',
    effects: {
      huntingBonus: 30,
      activityBonus: 'research',
      combatModifier: 10,
      exposureReduction: 15
    },
    cost: 150,
    unlocked: false
  },
  {
    id: 'silverblood',
    name: 'Silver Blood',
    icon: Shield,
    color: 'from-gray-400 to-gray-600',
    description: 'Natural resistance to vampire influence. Cannot be turned.',
    effects: {
      resistancePowers: true,
      combatModifier: 20,
      cannotBeTurned: true
    },
    cost: 200,
    unlocked: false
  },
  {
    id: 'diplomatic',
    name: 'Diplomatic',
    icon: Heart,
    color: 'from-green-600 to-emerald-600',
    description: 'Natural negotiator. Can broker truces and alliances.',
    effects: {
      dialogue: ['protective', 'curious'],
      relationshipBonus: 20,
      truceChance: 50,
      combatModifier: -5
    },
    cost: 120,
    unlocked: false
  },
  {
    id: 'vengeful',
    name: 'Vengeful',
    icon: Target,
    color: 'from-red-700 to-red-900',
    description: 'Driven by loss. Massive damage boost but reckless.',
    effects: {
      dialogue: ['hostile'],
      combatModifier: 40,
      exposureIncrease: 20,
      activityBonus: 'train'
    },
    cost: 100,
    unlocked: false
  },
  {
    id: 'occultist',
    name: 'Occultist',
    icon: Zap,
    color: 'from-purple-600 to-purple-800',
    description: 'Supernatural knowledge. Can use magic-infused weapons.',
    effects: {
      magicWeapons: true,
      activityBonus: 'research',
      combatModifier: 30,
      dialogue: ['curious']
    },
    cost: 180,
    unlocked: false
  }
];

export default function HunterTraits({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTrait, setSelectedTrait] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  const hunterTraits = hunter.traits || [];
  const hunterExp = hunter.experience || 0;

  const handleUnlockTrait = async (trait) => {
    if (hunterExp < trait.cost) {
      alert(`Need ${trait.cost} experience. You have ${hunterExp}.`);
      return;
    }

    if (hunterTraits.length >= 3) {
      alert('Maximum 3 traits. Remove one first.');
      return;
    }

    setUnlocking(true);

    try {
      const newTraits = [...hunterTraits, trait.id];
      await base44.entities.Hunter.update(hunter.id, {
        traits: newTraits,
        experience: hunterExp - trait.cost
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} unlocked the ${trait.name} trait. ${trait.description}`,
        category: 'hunting',
        intensity: 'significant'
      });

      queryClient.invalidateQueries(['hunters']);
      setUnlocking(false);
    } catch (e) {
      console.error('Failed to unlock trait:', e);
      setUnlocking(false);
    }
  };

  const handleRemoveTrait = async (traitId) => {
    try {
      const newTraits = hunterTraits.filter(t => t !== traitId);
      await base44.entities.Hunter.update(hunter.id, {
        traits: newTraits
      });

      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to remove trait:', e);
    }
  };

  const activeTraits = TRAIT_LIBRARY.filter(t => hunterTraits.includes(t.id));
  const availableTraits = TRAIT_LIBRARY.filter(t => !hunterTraits.includes(t.id));

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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Hunter Traits</h2>
            <p className="text-gray-400">Active: {hunterTraits.length}/3 • Experience: {hunterExp}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Active Traits */}
        {activeTraits.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white text-xl font-bold mb-4">Active Traits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {activeTraits.map(trait => {
                const Icon = trait.icon;
                return (
                  <motion.div
                    key={trait.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gradient-to-r ${trait.color} rounded-2xl p-6 border-2 border-white/20`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-white" />
                        <h4 className="text-white font-bold text-lg">{trait.name}</h4>
                      </div>
                      <button
                        onClick={() => handleRemoveTrait(trait.id)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-white/80 text-sm mb-4">{trait.description}</p>
                    <div className="space-y-1 text-xs text-white/70">
                      {trait.effects.combatModifier && (
                        <p>Combat: {trait.effects.combatModifier > 0 ? '+' : ''}{trait.effects.combatModifier}%</p>
                      )}
                      {trait.effects.relationshipBonus && (
                        <p>Relationship: {trait.effects.relationshipBonus > 0 ? '+' : ''}{trait.effects.relationshipBonus}%</p>
                      )}
                      {trait.effects.dialogue && (
                        <p>Unlocks: {trait.effects.dialogue.join(', ')} dialogue</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Traits */}
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Available Traits</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTraits.map(trait => {
              const Icon = trait.icon;
              const canAfford = hunterExp >= trait.cost;
              const canEquip = hunterTraits.length < 3;
              
              return (
                <motion.button
                  key={trait.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedTrait(trait)}
                  disabled={!canAfford || !canEquip}
                  className={`bg-black/40 border rounded-2xl p-6 text-left transition-all ${
                    canAfford && canEquip
                      ? 'border-gray-700 hover:border-gray-600 hover:bg-black/60'
                      : 'border-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Icon className="w-6 h-6 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">{trait.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-sm">{trait.cost} EXP</span>
                        {!canAfford && <Lock className="w-3 h-3 text-red-400" />}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{trait.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Trait Detail Modal */}
        {selectedTrait && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-10 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedTrait(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-gradient-to-br ${selectedTrait.color} rounded-2xl p-8 max-w-md w-full border-2 border-white/20`}
            >
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(selectedTrait.icon, { className: "w-12 h-12 text-white" })}
                <h3 className="text-white text-2xl font-bold">{selectedTrait.name}</h3>
              </div>
              <p className="text-white/90 mb-6">{selectedTrait.description}</p>
              
              <div className="space-y-2 mb-6 text-white/80 text-sm">
                <p className="font-bold">Effects:</p>
                {selectedTrait.effects.combatModifier && (
                  <p>• Combat: {selectedTrait.effects.combatModifier > 0 ? '+' : ''}{selectedTrait.effects.combatModifier}%</p>
                )}
                {selectedTrait.effects.relationshipBonus && (
                  <p>• Relationship: {selectedTrait.effects.relationshipBonus > 0 ? '+' : ''}{selectedTrait.effects.relationshipBonus}%</p>
                )}
                {selectedTrait.effects.dialogue && (
                  <p>• Unlocks: {selectedTrait.effects.dialogue.join(', ')} dialogue</p>
                )}
                {selectedTrait.effects.exposureReduction && (
                  <p>• Exposure: -{selectedTrait.effects.exposureReduction}%</p>
                )}
                {selectedTrait.effects.huntingBonus && (
                  <p>• Hunting: +{selectedTrait.effects.huntingBonus}%</p>
                )}
                {selectedTrait.effects.resistancePowers && (
                  <p>• Immune to vampire powers</p>
                )}
                {selectedTrait.effects.cannotBeTurned && (
                  <p>• Cannot be turned into vampire</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTrait(null)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleUnlockTrait(selectedTrait);
                    setSelectedTrait(null);
                  }}
                  disabled={hunterExp < selectedTrait.cost || hunterTraits.length >= 3 || unlocking}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unlock ({selectedTrait.cost} EXP)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}