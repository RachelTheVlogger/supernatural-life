import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';

export default function HereticReputation({ heretic, onClose }) {
  const queryClient = useQueryClient();

  const { data: reputation } = useQuery({
    queryKey: ['heretic-reputation', heretic.id],
    queryFn: async () => {
      try {
        const reps = await base44.entities.HereticReputation.filter({ heretic_id: heretic.id });
        return reps[0] || null;
      } catch (e) {
        console.error('Failed to fetch reputation:', e);
        return null;
      }
    },
    enabled: !!heretic?.id
  });

  if (!reputation) {
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
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-yellow-500/30 text-center"
        >
          <p className="text-gray-400">No reputation data yet.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  }

  const getReputationTier = (value) => {
    if (value >= 80) return { label: 'Legendary', color: 'text-yellow-400' };
    if (value >= 60) return { label: 'Respected', color: 'text-green-400' };
    if (value >= 40) return { label: 'Known', color: 'text-blue-400' };
    if (value >= 20) return { label: 'Feared', color: 'text-red-400' };
    return { label: 'Hated', color: 'text-red-600' };
  };

  const overallTier = getReputationTier(reputation.overall_reputation || 50);
  const vampireTier = getReputationTier(reputation.vampire_circles_reputation || 50);
  const witchTier = getReputationTier(reputation.witch_circles_reputation || 50);
  const humanTier = getReputationTier(reputation.human_reputation || 50);

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
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-yellow-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-yellow-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Reputation & Legend
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Reputation */}
          <motion.div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Overall Reputation</h3>
              <span className={`text-2xl font-bold ${overallTier.color}`}>{overallTier.label}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reputation.overall_reputation || 50}%` }}
                transition={{ duration: 0.5 }}
                className="h-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
            <p className="text-gray-400 text-sm mt-2 text-center">
              {reputation.overall_reputation}/100
            </p>
          </motion.div>

          {/* Reputation by Circle */}
          <div className="space-y-4">
            <h3 className="text-white font-bold">Reputation by Circle</h3>

            {/* Vampire Circles */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Vampire Circles 🦇</span>
                <span className={`text-sm ${vampireTier.color}`}>{vampireTier.label}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  style={{ width: `${reputation.vampire_circles_reputation || 50}%` }}
                  className="h-2 rounded-full bg-red-500"
                />
              </div>
            </div>

            {/* Witch Circles */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Witch Circles ✨</span>
                <span className={`text-sm ${witchTier.color}`}>{witchTier.label}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  style={{ width: `${reputation.witch_circles_reputation || 50}%` }}
                  className="h-2 rounded-full bg-purple-500"
                />
              </div>
            </div>

            {/* Human Reputation */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Human World 👤</span>
                <span className={`text-sm ${humanTier.color}`}>{humanTier.label}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  style={{ width: `${reputation.human_reputation || 50}%` }}
                  className="h-2 rounded-full bg-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2">
            <h3 className="text-white font-bold">Status</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className={`bg-gray-800 rounded-lg p-3 text-center border ${
                reputation.respected ? 'border-green-500 bg-green-900/30' : 'border-gray-700'
              }`}>
                <p className="text-white font-medium text-sm">Respected</p>
                <p className={reputation.respected ? 'text-green-400 text-xs' : 'text-gray-500 text-xs'}>
                  {reputation.respected ? '✓' : '✗'}
                </p>
              </div>

              <div className={`bg-gray-800 rounded-lg p-3 text-center border ${
                reputation.feared ? 'border-red-500 bg-red-900/30' : 'border-gray-700'
              }`}>
                <p className="text-white font-medium text-sm">Feared</p>
                <p className={reputation.feared ? 'text-red-400 text-xs' : 'text-gray-500 text-xs'}>
                  {reputation.feared ? '✓' : '✗'}
                </p>
              </div>

              <div className={`bg-gray-800 rounded-lg p-3 text-center border ${
                reputation.hunted ? 'border-orange-500 bg-orange-900/30' : 'border-gray-700'
              }`}>
                <p className="text-white font-medium text-sm">Hunted</p>
                <p className={reputation.hunted ? 'text-orange-400 text-xs' : 'text-gray-500 text-xs'}>
                  {reputation.hunted ? '⚠️' : '✗'}
                </p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="text-white font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Heroic Achievements
            </h3>
            <p className="text-white text-lg font-bold">{reputation.heroic_acts || 0}</p>

            <h3 className="text-white font-bold flex items-center gap-2 mt-4">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Dark Deeds
            </h3>
            <p className="text-white text-lg font-bold">{reputation.dark_acts || 0}</p>
          </div>

          {/* Rumors */}
          {reputation.rumors && reputation.rumors.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Rumors About You</h3>
              <ul className="space-y-2">
                {reputation.rumors.map((rumor, i) => (
                  <li key={i} className="text-gray-400 text-sm">• {rumor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}