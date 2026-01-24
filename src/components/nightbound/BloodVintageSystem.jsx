import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Droplet, Clock, Sparkles, Wine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const PRESERVATION_METHODS = [
  { id: 'crystal_vial', label: 'Crystal Vial', bonus: 5, cost: 0 },
  { id: 'silver_flask', label: 'Silver Flask', bonus: 10, cost: 100 },
  { id: 'enchanted_bottle', label: 'Enchanted Bottle', bonus: 20, cost: 500 },
  { id: 'stone_urn', label: 'Ancient Stone Urn', bonus: 30, cost: 1000 }
];

export default function BloodVintageSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [bottling, setBottling] = useState(false);
  const [drinking, setDrinking] = useState(null);
  const [outcome, setOutcome] = useState('');

  const { data: vintages = [] } = useQuery({
    queryKey: ['bloodVintages', vampireState?.id],
    queryFn: async () => {
      if (!vampireState?.id) return [];
      return await base44.entities.BloodVintage.filter({ vampire_id: vampireState.id });
    },
    enabled: !!vampireState?.id
  });

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const getQuality = (days) => {
    if (days < 7) return 'fresh';
    if (days < 30) return 'aged';
    if (days < 90) return 'vintage';
    if (days < 180) return 'ancient';
    return 'spoiled';
  };

  const handleBottle = async (servant, method) => {
    setBottling(true);

    setTimeout(async () => {
      try {
        await base44.entities.BloodVintage.create({
          vampire_id: vampireState.id,
          blood_type: servant.blood_type || 'O+',
          source_name: servant.name,
          age_days: 0,
          quality: 'fresh',
          potency: 50 + method.bonus,
          preservation_method: method.id,
          bottled_date: new Date().toISOString()
        });

        await base44.entities.NightLog.create({
          entry: `You bottled ${servant.name}'s blood in a ${method.label}. Preservation begins. Aging will enhance potency.`,
          category: 'feeding',
          intensity: 'subtle'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Failed to bottle blood:', e);
      }

      setBottling(false);
    }, 1500);
  };

  const handleDrink = async (vintage) => {
    setDrinking(vintage.id);

    setTimeout(async () => {
      const quality = getQuality(vintage.age_days || 0);
      const powerGain = quality === 'ancient' ? 30 : quality === 'vintage' ? 20 : quality === 'aged' ? 10 : 5;

      const outcomes = {
        fresh: `Fresh blood. ${vintage.source_name}'s essence. Standard potency.`,
        aged: `Aged blood. Richer. Deeper. ${vintage.source_name}'s power concentrated.`,
        vintage: `Vintage ${vintage.source_name}. Exquisite. Power surges through you.`,
        ancient: `Ancient vintage. ${vintage.source_name}'s blood perfected over time. Overwhelming power.`,
        spoiled: `Spoiled. Ruined. ${vintage.source_name}'s blood gone bad. Wasted.`
      };

      setOutcome(outcomes[quality]);

      try {
        await base44.entities.BloodVintage.delete(vintage.id);

        if (quality !== 'spoiled') {
          await base44.entities.VampireState.update(vampireState.id, {
            vampire_power_level: Math.min((vampireState.vampire_power_level || 0) + powerGain, 100),
            hunger_state: 'sated'
          });
        }

        await base44.entities.NightLog.create({
          entry: outcomes[quality],
          category: 'feeding',
          intensity: quality === 'ancient' || quality === 'vintage' ? 'significant' : 'moderate'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Failed to drink vintage:', e);
      }

      setTimeout(() => {
        setDrinking(null);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleAge = async () => {
    try {
      for (const vintage of vintages) {
        const newAge = (vintage.age_days || 0) + 1;
        const quality = getQuality(newAge);
        
        await base44.entities.BloodVintage.update(vintage.id, {
          age_days: newAge,
          quality: quality,
          potency: Math.min((vintage.potency || 50) + 2, 100)
        });
      }
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to age vintages:', e);
    }
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Wine className="w-6 h-6 text-red-400" />
          Blood Vintage Cellar
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Bottle and age blood like fine wine. Time enhances potency. Patience rewards power.
        </p>

        {outcome ? (
          <div className="text-center py-12">
            <p className="text-gray-300 leading-relaxed">{outcome}</p>
          </div>
        ) : (
          <>
            <h3 className="text-white font-medium mb-3">Your Collection ({vintages.length})</h3>
            
            {vintages.length > 0 && (
              <div className="space-y-3 mb-6">
                {vintages.map(vintage => {
                  const quality = getQuality(vintage.age_days || 0);
                  const qualityColors = {
                    fresh: 'red',
                    aged: 'orange',
                    vintage: 'purple',
                    ancient: 'yellow',
                    spoiled: 'gray'
                  };
                  const color = qualityColors[quality];

                  return (
                    <div
                      key={vintage.id}
                      className="bg-gray-800 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">{vintage.source_name}'s Blood</h4>
                          <p className="text-gray-400 text-sm">{vintage.blood_type} • {vintage.preservation_method.replace('_', ' ')}</p>
                        </div>
                        <span className={`text-${color}-400 text-sm capitalize font-medium`}>
                          {quality}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <p className="text-gray-500">Age</p>
                          <p className="text-white">{vintage.age_days || 0} days</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Potency</p>
                          <p className="text-white">{vintage.potency || 50}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDrink(vintage)}
                        disabled={drinking === vintage.id}
                        className="w-full bg-red-900/40 hover:bg-red-900/60 disabled:bg-gray-700 border border-red-500/30 rounded-lg py-2 text-red-300 text-sm transition-colors"
                      >
                        {drinking === vintage.id ? 'Drinking...' : 'Drink'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <h3 className="text-white font-medium mb-3">Bottle New Blood</h3>
            {servants.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No servants to bottle blood from</p>
            ) : (
              <div className="space-y-3">
                {servants.map(servant => (
                  <div key={servant.id} className="bg-gray-800 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">{servant.name}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESERVATION_METHODS.map(method => (
                        <button
                          key={method.id}
                          onClick={() => handleBottle(servant, method)}
                          disabled={bottling}
                          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg p-2 text-xs text-white transition-colors"
                        >
                          {method.label}
                          <p className="text-gray-400 text-[10px]">+{method.bonus} potency</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}