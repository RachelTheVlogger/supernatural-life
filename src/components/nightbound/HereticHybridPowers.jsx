import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Zap, Heart, Plus, Trash2 } from 'lucide-react';

const HYBRID_COMBINATIONS = [
  {
    id: 'blood_weave',
    name: 'Blood Weave',
    vampire: 'Compulsion',
    witch: 'Spell Weave',
    desc: 'Compel targets through magical spells',
    category: 'offensive',
    bonus: 15
  },
  {
    id: 'shadow_hex',
    name: 'Shadow Hex',
    vampire: 'Shadow Step',
    witch: 'Hex',
    desc: 'Curse enemies while staying hidden',
    category: 'offensive',
    bonus: 12
  },
  {
    id: 'regenerative_magic',
    name: 'Regenerative Magic',
    vampire: 'Regeneration',
    witch: 'Lunar Shield',
    desc: 'Heal using moonlight-infused magic',
    category: 'defensive',
    bonus: 10
  },
  {
    id: 'primal_ritual',
    name: 'Primal Ritual',
    vampire: 'Blood Rage',
    witch: 'Potion Craft',
    desc: 'Amplify power with ritual preparation',
    category: 'offensive',
    bonus: 18
  },
  {
    id: 'ethereal_bond',
    name: 'Ethereal Bond',
    vampire: 'Enhanced Senses',
    witch: 'Familiar Bond',
    desc: 'Share senses with familiar through blood',
    category: 'utility',
    bonus: 8
  }
];

export default function HereticHybridPowers({ heretic, onClose }) {
  const queryClient = useQueryClient();
  const [selectedHybrid, setSelectedHybrid] = useState(null);

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

  const { data: hybridPowers = [] } = useQuery({
    queryKey: ['heretic-hybrid-powers', heretic.id],
    queryFn: async () => {
      try {
        return await base44.entities.HereticHybridAbility.filter({ heretic_id: heretic.id });
      } catch (e) {
        console.error('Failed to fetch hybrid powers:', e);
        return [];
      }
    },
    enabled: !!heretic?.id
  });

  const canCreateHybrid = (combo) => {
    const hasVampire = abilities.some(a => a.name === combo.vampire && a.is_unlocked);
    const hasWitch = abilities.some(a => a.name === combo.witch && a.is_unlocked);
    return hasVampire && hasWitch;
  };

  const handleCreateHybrid = async (combo) => {
    if (!canCreateHybrid(combo)) return;

    try {
      const existing = hybridPowers.find(h => h.name === combo.name);
      
      if (existing) {
        await base44.entities.HereticHybridAbility.update(existing.id, {
          level: Math.min((existing.level || 1) + 1, 5)
        });
      } else {
        await base44.entities.HereticHybridAbility.create({
          heretic_id: heretic.id,
          name: combo.name,
          description: combo.desc,
          vampire_component: combo.vampire,
          witch_component: combo.witch,
          category: combo.category,
          power_cost: 35,
          is_unlocked: true,
          synergy_bonus: combo.bonus
        });
      }

      queryClient.invalidateQueries(['heretic-hybrid-powers']);
    } catch (e) {
      console.error('Failed to create hybrid:', e);
    }
  };

  const handleDeleteHybrid = async (hybridId) => {
    if (confirm('Forget this hybrid power?')) {
      try {
        await base44.entities.HereticHybridAbility.delete(hybridId);
        queryClient.invalidateQueries(['heretic-hybrid-powers']);
        setSelectedHybrid(null);
      } catch (e) {
        console.error('Failed to delete hybrid:', e);
      }
    }
  };

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
        className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-fuchsia-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-fuchsia-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-fuchsia-400" />
              Hybrid Powers
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">Combine vampire & witch powers for unique abilities</p>
        </div>

        <div className="p-6">
          {/* Unlocked Hybrids */}
          {hybridPowers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-bold mb-3">Your Hybrid Powers</h3>
              <div className="space-y-2 mb-6">
                {hybridPowers.map(hybrid => (
                  <motion.div
                    key={hybrid.id}
                    className="bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 rounded-lg p-3 border border-fuchsia-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{hybrid.name}</h4>
                        <p className="text-gray-400 text-xs">{hybrid.description}</p>
                        <p className="text-fuchsia-400 text-xs mt-1">
                          Synergy Bonus: +{hybrid.synergy_bonus}% Power
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-xs bg-gray-800 px-2 py-1 rounded">
                          Lvl {hybrid.level || 1}
                        </span>
                        <button
                          onClick={() => handleDeleteHybrid(hybrid.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Available Combinations */}
          <div>
            <h3 className="text-white font-bold mb-3">Available Combinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {HYBRID_COMBINATIONS.map(combo => {
                const canCreate = canCreateHybrid(combo);
                const hasHybrid = hybridPowers.some(h => h.name === combo.name);
                const vampireAbility = abilities.find(a => a.name === combo.vampire);
                const witchAbility = abilities.find(a => a.name === combo.witch);

                return (
                  <motion.button
                    key={combo.id}
                    onClick={() => canCreate && !hasHybrid && handleCreateHybrid(combo)}
                    disabled={!canCreate || hasHybrid}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      canCreate && !hasHybrid
                        ? 'border-fuchsia-500/50 bg-fuchsia-900/30 hover:bg-fuchsia-900/50 cursor-pointer'
                        : 'border-gray-700 bg-gray-800/50 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{combo.name}</h4>
                      {canCreate && !hasHybrid && <Plus className="w-4 h-4 text-fuchsia-400" />}
                    </div>

                    <p className="text-gray-400 text-xs mb-3">{combo.desc}</p>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">
                          {vampireAbility ? '✓' : '✗'} {combo.vampire}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">
                          {witchAbility ? '✓' : '✗'} {combo.witch}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-fuchsia-400 text-xs font-medium">
                        +{combo.bonus}% Power Synergy
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}