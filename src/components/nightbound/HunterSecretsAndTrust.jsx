import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TRUST_MOMENTS = [
  { id: 'reveal_weakness', label: 'Show Your Vulnerability', icon: '💔', description: 'Share a personal secret or fear', bondGain: 8, riskLevel: 'low' },
  { id: 'confess_past', label: 'Confess to a Kill', icon: '🩸', description: 'Tell them about a vampire you hunted down', bondGain: 12, riskLevel: 'high' },
  { id: 'share_dream', label: 'Share Your Dreams', icon: '💭', description: 'Talk about your future together', bondGain: 6, riskLevel: 'low' },
  { id: 'physical_intimacy', label: 'Get Physical', icon: '💋', description: 'Express affection physically', bondGain: 15, riskLevel: 'medium' },
  { id: 'promise_protection', label: 'Promise Protection', icon: '🛡️', description: 'Swear you\'ll protect them no matter what', bondGain: 10, riskLevel: 'medium' }
];

export default function HunterSecretsAndTrust({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrustMoment = async (moment) => {
    setLoading(true);
    try {
      await base44.entities.VampireState.update(vampire.id, {
        hunter_relationship: Math.min(100, (vampire.hunter_relationship || 0) + moment.bondGain)
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} and ${vampire.vampire_name}: ${moment.label}. Relationship deepened (+${moment.bondGain}%).`,
        category: 'intimacy',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setSelectedMoment(null);
    } catch (e) {
      console.error('Failed to create trust moment:', e);
    }
    setLoading(false);
  };

  const riskColors = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400' };

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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Build Trust & Share Secrets</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-sm">Current Relationship: <span className="text-purple-400">{vampire.hunter_relationship || 0}%</span></p>

        <div className="space-y-3">
          {TRUST_MOMENTS.map(moment => (
            <button
              key={moment.id}
              onClick={() => setSelectedMoment(moment)}
              className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg p-4 text-left transition-colors"
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{moment.icon}</span>
                    <h3 className="text-white font-medium">{moment.label}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{moment.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${riskColors[moment.riskLevel]}`}>{moment.riskLevel}</p>
                  <p className="text-green-400 text-sm">+{moment.bondGain}%</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedMoment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-purple-950/30 border border-purple-500/30 rounded-lg"
          >
            <p className="text-white mb-4">Share this moment with {vampire.vampire_name}?</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleTrustMoment(selectedMoment)}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed'}
              </button>
              <button
                onClick={() => setSelectedMoment(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}