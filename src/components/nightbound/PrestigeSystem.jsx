import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Award, Zap, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const PRESTIGE_BONUSES = [
  { name: 'Ancient Memories', cost: 100, desc: 'Start with 3 random powers unlocked' },
  { name: 'Eternal Knowledge', cost: 150, desc: '+50% XP gain permanently' },
  { name: 'Sire Bond', cost: 200, desc: 'Start with loyal servant' },
  { name: 'Daywalker Essence', cost: 300, desc: 'Sunlight resistance from start' },
  { name: 'Blood Legacy', cost: 250, desc: 'Inherit powers from past lives' }
];

export default function PrestigeSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const { data: prestigeData = [] } = useQuery({
    queryKey: ['prestigeData'],
    queryFn: async () => {
      const data = await base44.entities.PrestigeData.list();
      if (data.length === 0) {
        const newData = await base44.entities.PrestigeData.create({
          prestige_level: 0,
          total_lifetimes: 1,
          legacy_points: 0
        });
        return [newData];
      }
      return data;
    }
  });

  const prestige = prestigeData[0];

  const handlePrestige = async () => {
    if (!confirm('Prestige? This will reset your vampire but grant permanent bonuses.')) return;

    const pointsEarned = Math.floor((vampireState.vampire_power_level || 0) / 10) +
                        Math.floor((vampireState.nights_passed || 0) / 5) +
                        (vampireState.unlocked_powers?.length || 0) * 10;

    await base44.entities.PrestigeData.update(prestige.id, {
      prestige_level: (prestige.prestige_level || 0) + 1,
      total_lifetimes: (prestige.total_lifetimes || 1) + 1,
      legacy_points: (prestige.legacy_points || 0) + pointsEarned
    });

    // Delete current vampire and start fresh
    await base44.entities.VampireState.delete(vampireState.id);

    // Delete servants
    const servants = await base44.entities.Servant.list();
    await Promise.all(servants.map(s => base44.entities.Servant.delete(s.id)));

    await base44.entities.NightLog.create({
      entry: `Prestige ${(prestige.prestige_level || 0) + 1} achieved. Reborn with ancient knowledge. +${pointsEarned} Legacy Points.`,
      category: 'milestone',
      intensity: 'extreme'
    });

    queryClient.invalidateQueries();
    window.location.href = '/';
  };

  const handleBuyBonus = async (bonus) => {
    if ((prestige.legacy_points || 0) < bonus.cost) {
      alert(`Need ${bonus.cost} legacy points`);
      return;
    }

    await base44.entities.PrestigeData.update(prestige.id, {
      legacy_points: (prestige.legacy_points || 0) - bonus.cost,
      permanent_bonuses: [...(prestige.permanent_bonuses || []), bonus.name]
    });

    queryClient.invalidateQueries();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">⭐ Prestige System</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4 mb-6">
          <p className="text-purple-400 text-sm mb-2">Prestige Level: {prestige?.prestige_level || 0}</p>
          <p className="text-yellow-400 text-sm mb-2">Legacy Points: {prestige?.legacy_points || 0}</p>
          <p className="text-gray-400 text-sm">Lifetimes: {prestige?.total_lifetimes || 1}</p>
        </div>

        <button
          onClick={handlePrestige}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl mb-6 font-bold"
        >
          <RefreshCw className="w-5 h-5 inline mr-2" />
          Prestige Now (Reset for Bonuses)
        </button>

        <h3 className="text-white font-bold mb-3">Permanent Bonuses</h3>
        <div className="space-y-3">
          {PRESTIGE_BONUSES.map(bonus => {
            const owned = prestige?.permanent_bonuses?.includes(bonus.name);
            return (
              <div key={bonus.name} className={`${owned ? 'bg-green-950/20' : 'bg-gray-800'} border border-purple-500/30 rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-bold">{bonus.name}</p>
                    <p className="text-gray-400 text-sm">{bonus.desc}</p>
                  </div>
                  {owned ? (
                    <span className="text-green-400 text-sm">✓ Owned</span>
                  ) : (
                    <span className="text-yellow-400 text-sm">{bonus.cost} LP</span>
                  )}
                </div>
                {!owned && (
                  <button
                    onClick={() => handleBuyBonus(bonus)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm"
                  >
                    Purchase
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}