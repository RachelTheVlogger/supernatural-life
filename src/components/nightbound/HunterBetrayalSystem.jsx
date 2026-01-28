import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HunterBetrayalSystem({ hunter, vampires = [], onClose }) {
  const queryClient = useQueryClient();
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const otherHunters = hunters.filter(h => h.id !== hunter.id);
  const betrayedHunters = otherHunters.filter(h => h.is_betrayed);

  const corruptionRisks = [
    {
      name: 'Seduction',
      description: 'A vampire seduces and corrupts them',
      effect: () => ({
        status: 'compromised',
        notes: 'Works for the vampire while appearing loyal'
      })
    },
    {
      name: 'Vampire Bite',
      description: 'Bitten and turned into a vampire servant',
      effect: () => ({
        status: 'converted',
        notes: 'Now serves the vampire directly'
      })
    },
    {
      name: 'Blackmail',
      description: 'Secrets used to force cooperation',
      effect: () => ({
        status: 'blackmailed',
        notes: 'Secretly helps the vampire to protect secrets'
      })
    },
    {
      name: 'Money & Power',
      description: 'Offered wealth and authority',
      effect: () => ({
        status: 'tempted',
        notes: 'Becoming greedy, may betray for profit'
      })
    }
  ];

  const handleTriggerBetrayalEvent = async (targetHunter, corruptionType) => {
    setLoading(true);
    try {
      const risk = Math.random() * 100;
      const success = risk < (50 + (vampire?.hunter_relationship || 0) / 2);

      if (success) {
        await base44.entities.Hunter.update(targetHunter.id, {
          is_betrayed: true,
          status: 'compromised',
          suspicion: 0
        });

        const vampire = vampires[0];
        await base44.entities.NightLog.create({
          entry: `${targetHunter.name} has been corrupted! They've become a double agent for ${vampire?.vampire_name || 'the vampire'}. Mission compromised!`,
          category: 'betrayal',
          intensity: 'critical'
        });

        queryClient.invalidateQueries(['hunters']);
        queryClient.invalidateQueries(['logs']);
        setTimeout(() => onClose(), 2000);
      } else {
        await base44.entities.NightLog.create({
          entry: `Attempted to corrupt ${targetHunter.name} but they resisted. Their suspicion increased.`,
          category: 'interaction',
          intensity: 'moderate'
        });

        await base44.entities.Hunter.update(targetHunter.id, {
          suspicion: Math.min(100, (targetHunter.suspicion || 0) + 20)
        });

        queryClient.invalidateQueries(['hunters']);
      }
    } catch (e) {
      console.error('Betrayal event failed:', e);
    }
    setLoading(false);
  };

  const handleExposeBetrayal = async (betrayedHunter) => {
    setLoading(true);
    try {
      await base44.entities.Hunter.update(betrayedHunter.id, {
        is_betrayed: false,
        status: 'investigating'
      });

      await base44.entities.NightLog.create({
        entry: `${betrayedHunter.name}'s betrayal has been exposed! They've been removed from active duty pending investigation.`,
        category: 'betrayal',
        intensity: 'significant'
      });

      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to expose betrayal:', e);
    }
    setLoading(false);
  };

  if (!selectedHunter) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                Betrayal System
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {betrayedHunters.length > 0 && (
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm font-bold mb-3">Exposed Traitors:</p>
              <div className="space-y-2">
                {betrayedHunters.map(traitor => (
                  <div key={traitor.id} className="flex items-center justify-between">
                    <span className="text-red-200">{traitor.name} (Status: {traitor.status})</span>
                    <button
                      onClick={() => handleExposeBetrayal(traitor)}
                      disabled={loading}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-400 text-sm mb-6">
            Corrupt rival hunters by turning them into double agents for your vampire allies.
          </p>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {otherHunters.filter(h => !h.is_betrayed).length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No hunters available to corrupt</p>
              </div>
            ) : (
              otherHunters
                .filter(h => !h.is_betrayed)
                .map(targetHunter => (
                  <button
                    key={targetHunter.id}
                    onClick={() => setSelectedHunter(targetHunter)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors border border-gray-700/30"
                  >
                    <h4 className="text-white font-bold">{targetHunter.name}</h4>
                    <p className="text-gray-400 text-sm">{targetHunter.specialty} • Suspicion: {targetHunter.suspicion}%</p>
                  </button>
                ))
            )}
          </div>

          <button onClick={onClose} className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors">
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Corrupt {selectedHunter.name}</h2>
          <button onClick={() => setSelectedHunter(null)} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm mb-3">Choose a corruption method:</p>
          <div className="space-y-2">
            {corruptionRisks.map((corruption, idx) => (
              <button
                key={idx}
                onClick={() => handleTriggerBetrayalEvent(selectedHunter, corruption)}
                disabled={loading}
                className="w-full bg-red-900/40 hover:bg-red-900/60 disabled:bg-gray-700 text-left p-4 rounded-lg border border-red-500/30 transition-colors"
              >
                <h4 className="text-white font-bold text-sm">{corruption.name}</h4>
                <p className="text-gray-400 text-xs">{corruption.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-6">
          Success depends on target's suspicion level and vampire relationship strength.
        </div>

        <button
          onClick={() => setSelectedHunter(null)}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}