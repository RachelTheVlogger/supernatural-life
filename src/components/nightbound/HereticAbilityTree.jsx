import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap, Lock, Star, BookOpen } from 'lucide-react';

const VAMPIRE_ABILITIES = [
  { id: 'compulsion', name: 'Compulsion', desc: 'Control minds', cost: 20, unlock: 'vampire_power:30', category: 'offensive' },
  { id: 'enhanced_senses', name: 'Enhanced Senses', desc: 'See in darkness', cost: 10, unlock: 'vampire_power:20', category: 'utility' },
  { id: 'blood_rage', name: 'Blood Rage', desc: 'Extreme power surge', cost: 30, unlock: 'vampire_power:50', category: 'offensive' },
  { id: 'shadow_step', name: 'Shadow Step', desc: 'Move unseen', cost: 15, unlock: 'vampire_power:35', category: 'utility' },
  { id: 'regeneration', name: 'Regeneration', desc: 'Heal wounds quickly', cost: 25, unlock: 'vampire_power:45', category: 'defensive' }
];

const WITCH_ABILITIES = [
  { id: 'hex', name: 'Hex', desc: 'Curse your enemies', cost: 20, unlock: 'witch_power:30', category: 'offensive' },
  { id: 'lunar_shield', name: 'Lunar Shield', desc: 'Protective barrier', cost: 15, unlock: 'witch_power:25', category: 'defensive' },
  { id: 'potion_craft', name: 'Potion Craft', desc: 'Create powerful brews', cost: 25, unlock: 'witch_power:40', category: 'utility' },
  { id: 'spell_weave', name: 'Spell Weave', desc: 'Chain multiple spells', cost: 30, unlock: 'witch_power:50', category: 'offensive' },
  { id: 'familiar_bond', name: 'Familiar Bond', desc: 'Summon spirit companion', cost: 20, unlock: 'witch_power:35', category: 'utility' }
];

export default function HereticAbilityTree({ heretic, onClose }) {
  const queryClient = useQueryClient();
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [activeTab, setActiveTab] = useState('vampire');

  const { data: abilities = [] } = useQuery({
    queryKey: ['heretic-abilities', heretic.id],
    queryFn: async () => {
      try {
        return await base44.entities.HereticAbility.filter({ heretic_id: heretic.id });
      } catch (e) {
        console.error('Failed to fetch abilities:', e);
        return [];
      }
    },
    enabled: !!heretic?.id
  });

  const checkUnlock = (requirement) => {
    const [stat, value] = requirement.split(':');
    const heretic_val = heretic[stat] || 0;
    return heretic_val >= parseInt(value);
  };

  const handleUnlockAbility = async (abilityData) => {
    try {
      const existing = abilities.find(a => a.name === abilityData.name);
      
      if (existing) {
        await base44.entities.HereticAbility.update(existing.id, {
          is_unlocked: true,
          level: Math.min((existing.level || 1) + 1, 5)
        });
      } else {
        await base44.entities.HereticAbility.create({
          heretic_id: heretic.id,
          name: abilityData.name,
          type: activeTab === 'vampire' ? 'vampire' : 'witch',
          category: abilityData.category,
          description: abilityData.desc,
          power_cost: abilityData.cost,
          unlock_requirement: abilityData.unlock,
          is_unlocked: true
        });
      }

      queryClient.invalidateQueries(['heretic-abilities']);
    } catch (e) {
      console.error('Failed to unlock ability:', e);
    }
  };

  const abilityList = activeTab === 'vampire' ? VAMPIRE_ABILITIES : WITCH_ABILITIES;
  const unlockedList = abilities.filter(a => a.type === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              Ability Tree
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('vampire')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'vampire'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🦇 Vampire Powers
            </button>
            <button
              onClick={() => setActiveTab('witch')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'witch'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ✨ Witch Powers
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Available Abilities */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg mb-4">Available Powers</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {abilityList.map(ability => {
                const isUnlocked = checkUnlock(ability.unlock);
                const hasAbility = unlockedList.some(a => a.name === ability.name);

                return (
                  <motion.button
                    key={ability.id}
                    onClick={() => setSelectedAbility(ability)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedAbility?.id === ability.id
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-gray-700 hover:border-purple-500/50 bg-gray-800/50'
                    } ${!isUnlocked ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!isUnlocked && <Lock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />}
                      {hasAbility && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium">{ability.name}</h4>
                        <p className="text-gray-400 text-xs">{ability.desc}</p>
                        <p className="text-gray-500 text-xs mt-1">Cost: {ability.cost} power</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Ability Details */}
          <div>
            {selectedAbility ? (
              <motion.div
                key={selectedAbility.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 rounded-lg p-4 space-y-4 h-full"
              >
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">{selectedAbility.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedAbility.desc}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Power Cost</span>
                    <span className="text-white font-medium">{selectedAbility.cost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white font-medium capitalize">{selectedAbility.category}</span>
                  </div>
                </div>

                {/* Unlock Requirement */}
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-2">Unlock Requirement:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        style={{
                          width: `${Math.min(
                            (heretic[selectedAbility.unlock.split(':')[0]] || 0) / 
                            parseInt(selectedAbility.unlock.split(':')[1]) * 100,
                            100
                          )}%`
                        }}
                        className="h-2 rounded-full bg-purple-500"
                      />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">{selectedAbility.unlock}</p>
                </div>

                {/* Unlock Button */}
                {checkUnlock(selectedAbility.unlock) && !unlockedList.some(a => a.name === selectedAbility.name) && (
                  <button
                    onClick={() => handleUnlockAbility(selectedAbility)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium transition-all"
                  >
                    Unlock Power
                  </button>
                )}

                {unlockedList.some(a => a.name === selectedAbility.name) && (
                  <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-center">
                    <p className="text-green-400 text-sm font-medium">✓ Power Unlocked</p>
                  </div>
                )}

                {!checkUnlock(selectedAbility.unlock) && (
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Keep developing to unlock</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <BookOpen className="w-12 h-12 opacity-20" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}