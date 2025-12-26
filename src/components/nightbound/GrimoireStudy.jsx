import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const GRIMOIRES = [
  { name: 'Basic Herbology', cost: 0, powerGain: 5, time: 2000, unlocks: 'Basic herb knowledge' },
  { name: 'Elemental Mastery', cost: 20, powerGain: 10, time: 3000, unlocks: 'Better elemental spells' },
  { name: 'Psychic Arts', cost: 30, powerGain: 12, time: 3500, unlocks: 'Enhanced mind magic' },
  { name: 'Dark Grimoire', cost: 40, powerGain: 15, time: 4000, unlocks: 'Forbidden knowledge' },
  { name: 'Ancient Rituals', cost: 50, powerGain: 20, time: 5000, unlocks: 'Powerful rituals' }
];

export default function GrimoireStudy({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [studying, setStudying] = useState(null);
  const [outcome, setOutcome] = useState('');

  if (!witch) {
    return null;
  }

  const handleStudy = async (grimoire) => {
    if (!witch || witch.power_level < grimoire.cost) {
      alert(`Need ${grimoire.cost} power to study this!`);
      return;
    }

    setStudying(grimoire);

    setTimeout(async () => {
      await base44.entities.Witch.update(witch.id, {
        power_level: witch.power_level - grimoire.cost + grimoire.powerGain
      });

      const outcomeText = `Studied ${grimoire.name}. Gained ${grimoire.powerGain} power. ${grimoire.unlocks} unlocked.`;
      setOutcome(outcomeText);

      await base44.entities.NightLog.create({
        entry: `${witch.name} studied ${grimoire.name}. ${grimoire.unlocks}.`,
        category: 'power',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setStudying(null);
        setOutcome('');
      }, 3000);
    }, grimoire.time);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">📖 Study Grimoire</h2>
        <p className="text-gray-400 text-sm mb-6">Learn from ancient texts</p>

        {!studying && !outcome && (
          <div className="space-y-3">
            {GRIMOIRES.map(grimoire => (
              <button
                key={grimoire.name}
                onClick={() => handleStudy(grimoire)}
                disabled={witch.power_level < grimoire.cost}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left disabled:opacity-50"
              >
                <h3 className="text-white font-medium mb-1">{grimoire.name}</h3>
                <p className="text-gray-400 text-xs mb-2">{grimoire.unlocks}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-400">Cost: {grimoire.cost} power</span>
                  <span className="text-green-400">Gain: +{grimoire.powerGain}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {studying && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mx-auto mb-4"
            >
              📖
            </motion.div>
            <p className="text-red-400">Studying {studying.name}...</p>
          </div>
        )}

        {outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-red-500/30 text-center">
            <p className="text-white">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}