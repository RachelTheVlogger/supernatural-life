import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MOON_PHASES = [
  { name: 'New Moon', icon: '🌑', boost: 10, description: 'New beginnings, fresh power' },
  { name: 'Waxing Crescent', icon: '🌒', boost: 12, description: 'Growing power' },
  { name: 'First Quarter', icon: '🌓', boost: 15, description: 'Building strength' },
  { name: 'Waxing Gibbous', icon: '🌔', boost: 18, description: 'Power accumulates' },
  { name: 'Full Moon', icon: '🌕', boost: 30, description: 'MAXIMUM POWER' },
  { name: 'Waning Gibbous', icon: '🌖', boost: 18, description: 'Still powerful' },
  { name: 'Last Quarter', icon: '🌗', boost: 15, description: 'Fading but strong' },
  { name: 'Waning Crescent', icon: '🌘', boost: 12, description: 'Quiet power' }
];

export default function MoonRitual({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [performing, setPerforming] = useState(false);
  const [outcome, setOutcome] = useState('');

  const currentPhase = MOON_PHASES[Math.floor(Math.random() * MOON_PHASES.length)];

  const handleRitual = async () => {
    setPerforming(true);

    setTimeout(async () => {
      await base44.entities.Witch.update(witch.id, {
        power_level: witch.power_level + currentPhase.boost
      });

      const outcomeText = `Channeled the ${currentPhase.name}. Gained ${currentPhase.boost} power!`;
      setOutcome(outcomeText);

      await base44.entities.NightLog.create({
        entry: `${witch.name} performed a ${currentPhase.name} ritual. Power surged.`,
        category: 'power',
        intensity: currentPhase.boost >= 30 ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setPerforming(false);
        setOutcome('');
        onClose();
      }, 3000);
    }, 4000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">🌕 Moon Ritual</h2>
        <p className="text-gray-400 text-sm mb-6">Draw power from the moon</p>

        {!performing && !outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-blue-500/30">
            <div className="text-center mb-4">
              <span className="text-7xl">{currentPhase.icon}</span>
              <h3 className="text-white text-xl font-bold mt-2">{currentPhase.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{currentPhase.description}</p>
            </div>

            <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
              <p className="text-blue-300 text-center text-lg">
                Power Boost: <span className="font-bold text-blue-200">+{currentPhase.boost}</span>
              </p>
            </div>

            <button
              onClick={handleRitual}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Perform Moon Ritual
            </button>
          </div>
        )}

        {performing && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mx-auto mb-4"
            >
              {currentPhase.icon}
            </motion.div>
            <p className="text-blue-400">Channeling lunar energy...</p>
          </div>
        )}

        {outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-blue-500/30 text-center">
            <p className="text-white text-lg">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}