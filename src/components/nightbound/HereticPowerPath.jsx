import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Map, Zap, Wand2, Heart } from 'lucide-react';

const POWER_PATHS = [
  {
    id: 'pure_vampire',
    name: 'Pure Vampire',
    icon: '🦇',
    description: 'Master vampire powers. Enhanced blood abilities.',
    bonuses: { vampire_power_boost: 15, witch_power_penalty: 5 },
    abilities: ['Compulsion', 'Blood Rage', 'Enhanced Senses']
  },
  {
    id: 'pure_witch',
    name: 'Pure Witch',
    icon: '✨',
    description: 'Master magical arts. Enhanced spellcasting.',
    bonuses: { witch_power_boost: 15, vampire_power_penalty: 5 },
    abilities: ['Hex', 'Spell Weave', 'Potion Craft']
  },
  {
    id: 'balanced_hybrid',
    name: 'Balanced Hybrid',
    icon: '⚡',
    description: 'Perfect equilibrium. Both powers equally strong.',
    bonuses: { vampire_power_boost: 8, witch_power_boost: 8, balance_bonus: 10 },
    abilities: ['Shadow Step', 'Lunar Shield', 'Ethereal Bond']
  },
  {
    id: 'aggressive_vampire',
    name: 'Aggressive Vampire',
    icon: '🩸',
    description: 'Lean into vampire nature for combat dominance.',
    bonuses: { vampire_power_boost: 20, conflict_reduction: 5 },
    abilities: ['Blood Rage', 'Regeneration', 'Compulsion']
  },
  {
    id: 'mystical_witch',
    name: 'Mystical Witch',
    icon: '🌙',
    description: 'Embrace magic over hunger. Spellcaster focused.',
    bonuses: { witch_power_boost: 20, magic_recovery: 5 },
    abilities: ['Spell Weave', 'Potion Craft', 'Familiar Bond']
  },
  {
    id: 'dark_hybrid',
    name: 'Dark Hybrid',
    icon: '🌑',
    description: 'Combine dark magic and blood for devastating power.',
    bonuses: { vampire_power_boost: 12, witch_power_boost: 12, dark_bonus: 15 },
    abilities: ['Blood Weave', 'Shadow Hex', 'Primal Ritual']
  },
  {
    id: 'harmonious_hybrid',
    name: 'Harmonious Hybrid',
    icon: '☮️',
    description: 'Balance power with control. Harmony focused.',
    bonuses: { balance_bonus: 20, conflict_reduction: 10 },
    abilities: ['Regenerative Magic', 'Ethereal Bond', 'Shadow Step']
  }
];

export default function HereticPowerPath({ heretic, onClose }) {
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState(null);

  const { data: paths = [] } = useQuery({
    queryKey: ['heretic-power-paths', heretic.id],
    queryFn: async () => {
      try {
        return await base44.entities.HereticPowerPath.filter({ heretic_id: heretic.id });
      } catch (e) {
        console.error('Failed to fetch paths:', e);
        return [];
      }
    },
    enabled: !!heretic?.id
  });

  const activePath = paths.find(p => p.is_active);

  const handleSelectPath = async (pathData) => {
    try {
      // Deactivate previous path
      if (activePath) {
        await base44.entities.HereticPowerPath.update(activePath.id, { is_active: false });
      }

      // Check if path already exists
      const existing = paths.find(p => p.path_name === pathData.id);

      if (existing) {
        await base44.entities.HereticPowerPath.update(existing.id, { is_active: true });
      } else {
        await base44.entities.HereticPowerPath.create({
          heretic_id: heretic.id,
          path_name: pathData.id,
          bonuses: pathData.bonuses,
          abilities_unlocked: pathData.abilities,
          is_active: true
        });
      }

      queryClient.invalidateQueries(['heretic-power-paths']);
    } catch (e) {
      console.error('Failed to select path:', e);
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
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto border border-indigo-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-indigo-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Map className="w-6 h-6 text-indigo-400" />
              Power Development Paths
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">Choose your heretic's destiny</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POWER_PATHS.map(path => {
              const isActive = activePath?.path_name === path.id;
              const pathProgress = paths.find(p => p.path_name === path.id);

              return (
                <motion.button
                  key={path.id}
                  onClick={() => handleSelectPath(path)}
                  className={`text-left p-4 rounded-lg border transition-all transform hover:scale-105 ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-900/40 shadow-lg shadow-indigo-500/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{path.icon}</span>
                    {isActive && <span className="text-indigo-400 text-xs font-bold">ACTIVE</span>}
                  </div>

                  <h3 className="text-white font-bold mb-1">{path.name}</h3>
                  <p className="text-gray-400 text-xs mb-3">{path.description}</p>

                  {/* Bonuses */}
                  <div className="bg-black/30 rounded p-2 mb-3">
                    <p className="text-indigo-400 text-xs font-medium mb-1">Bonuses:</p>
                    <ul className="space-y-0.5">
                      {Object.entries(path.bonuses).map(([key, value]) => (
                        <li key={key} className="text-gray-400 text-xs">
                          +{value} {key.replace(/_/g, ' ')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Abilities */}
                  <div className="space-y-1">
                    {path.abilities.map(ability => (
                      <div key={ability} className="text-gray-400 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {ability}
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  {isActive && pathProgress && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-indigo-400">{pathProgress.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pathProgress.progress || 0}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-2 rounded-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Active Path Details */}
          {activePath && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-lg p-6 border border-indigo-500/30"
            >
              <h3 className="text-white font-bold text-lg mb-3">Current Path Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Milestones Reached</p>
                  <p className="text-white text-3xl font-bold">{activePath.milestones_reached || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Overall Progress</p>
                  <p className="text-white text-3xl font-bold">{activePath.progress || 0}%</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}