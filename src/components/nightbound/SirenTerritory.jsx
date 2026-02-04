import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Anchor, Flag, Crosshair, Shield, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const OCEAN_TERRITORIES = [
  { id: 'coral_reef', name: 'Coral Reef Paradise', difficulty: 20, reward: 'Rich hunting grounds, beautiful songs echo here' },
  { id: 'shipwreck', name: 'Shipwreck Graveyard', difficulty: 30, reward: 'Ancient treasures, ghost ships, sailor souls' },
  { id: 'deep_trench', name: 'Abyssal Trench', difficulty: 50, reward: 'Ultimate power, creatures from the deep obey' },
  { id: 'coastal_bay', name: 'Moonlit Bay', difficulty: 15, reward: 'Easy prey, romantic meetings, peaceful waters' },
  { id: 'open_ocean', name: 'Open Ocean Expanse', difficulty: 40, reward: 'Freedom, migration routes, whale songs' },
  { id: 'underwater_cave', name: 'Crystal Caves', difficulty: 35, reward: 'Magical crystals, hidden sanctuaries' },
  { id: 'kelp_forest', name: 'Kelp Forest Maze', difficulty: 25, reward: 'Camouflage, sea life abundance' },
  { id: 'volcanic_vent', name: 'Volcanic Vents', difficulty: 60, reward: 'Primal power, heat resistance, rare minerals' }
];

export default function SirenTerritory({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(null);
  const [outcome, setOutcome] = useState('');

  const claimedTerritories = siren.territories_claimed || [];

  const handleClaimTerritory = async (territory) => {
    setClaiming(territory.id);

    setTimeout(async () => {
      const success = Math.random() * 100 < (100 - territory.difficulty + (siren.voice_power || 50));

      if (success) {
        setOutcome(`${territory.name} claimed! Your voice echoes through these waters. ${territory.reward}`);

        await base44.entities.Siren.update(siren.id, {
          territories_claimed: [...claimedTerritories, territory.id],
          voice_power: (siren.voice_power || 50) + 5,
          water_affinity: (siren.water_affinity || 50) + 3
        });

        await base44.entities.NightLog.create({
          entry: `Claimed ${territory.name}. Your domain expands.`,
          category: 'power',
          intensity: 'significant'
        });
      } else {
        setOutcome(`You tried to claim ${territory.name}, but another predator drove you away. You need more power.`);
      }

      queryClient.invalidateQueries();

      setTimeout(() => {
        setClaiming(null);
        setOutcome('');
      }, 4000);
    }, 2500);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-blue-950 to-cyan-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Ocean Territories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-cyan-300 text-sm mb-6">
          Claim territories to expand your domain. Your voice power: {siren.voice_power || 50}
        </p>

        {outcome && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 rounded-xl p-4 mb-6 border border-cyan-500/30"
          >
            <p className="text-cyan-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        <div className="space-y-3">
          {OCEAN_TERRITORIES.map(territory => {
            const claimed = claimedTerritories.includes(territory.id);
            const isClaiming = claiming === territory.id;

            return (
              <button
                key={territory.id}
                onClick={() => !claimed && !claiming && handleClaimTerritory(territory)}
                disabled={claimed || !!claiming}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  claimed 
                    ? 'bg-green-900/40 border-2 border-green-500/50 opacity-70' 
                    : isClaiming
                    ? 'bg-cyan-900/60 border-2 border-cyan-500/50 scale-95'
                    : 'bg-gray-800/60 hover:bg-gray-700/60 border-2 border-gray-600/50 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {claimed ? <Flag className="w-5 h-5 text-green-400 mt-1" /> : <Anchor className="w-5 h-5 text-cyan-400 mt-1" />}
                    <div>
                      <h4 className="text-white font-medium mb-1">{territory.name}</h4>
                      <p className="text-gray-400 text-xs mb-2">{territory.reward}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          territory.difficulty <= 20 ? 'bg-green-900/50 text-green-300' :
                          territory.difficulty <= 40 ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-red-900/50 text-red-300'
                        }`}>
                          {territory.difficulty <= 20 ? 'Easy' : territory.difficulty <= 40 ? 'Medium' : 'Hard'}
                        </span>
                        {claimed && <span className="text-xs text-green-400">✓ Claimed</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}