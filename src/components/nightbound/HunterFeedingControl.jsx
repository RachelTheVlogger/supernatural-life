import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Droplets } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const FEEDING_STRATEGIES = [
  {
    id: 'hospital_supply',
    title: 'Hospital Blood Supply',
    description: 'Use your hunter access to get medical blood bags discreetly.',
    safety: 'Very Safe',
    frequency: 'Once per week',
    risk: 'Low - nobody notices inventory discrepancies',
    effect: 'exposure -5, hunger sated, bond +3'
  },
  {
    id: 'criminal_donation',
    title: 'Criminal Volunteers',
    description: 'Find willing criminals or dangerous people as feeding sources.',
    safety: 'Safe',
    frequency: 'Twice per week',
    risk: 'Medium - could attract unwanted attention',
    effect: 'exposure -3, hunger sated, bond +2'
  },
  {
    id: 'consensual_humans',
    title: 'Consensual Humans',
    description: 'Find humans who volunteer, knowing or not fully understanding what they\'re getting into.',
    safety: 'Moderate',
    frequency: 'Thrice per week',
    risk: 'High - memory wipes needed, relationships complicated',
    effect: 'hunger sated, bond +5, moral -3'
  },
  {
    id: 'you_donate',
    title: 'You Donate Blood',
    description: 'Let them feed from you. Intimate but dangerous if done too often.',
    safety: 'Variable',
    frequency: 'Once per month (too often = weakened)',
    risk: 'High - physically taxing on you, but incredible bonding',
    effect: 'hunger sated, bond +10, your health -5'
  },
  {
    id: 'hunting_together',
    title: 'Hunt Together (Controlled)',
    description: 'Go out together and find safe targets, you play lookout.',
    safety: 'Risky',
    frequency: 'Once per week',
    risk: 'Very High - exposure, getting caught together',
    effect: 'exposure +10, suspicion +5, bond +15'
  }
];

export default function HunterFeedingControl({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStrategy = async (strategy) => {
    setLoading(true);
    try {
      const updates = {};
      
      // Apply effects based on strategy
      if (strategy.id === 'hospital_supply') {
        updates.exposure_level = Math.max(0, (vampire.exposure_level || 0) - 5);
      } else if (strategy.id === 'you_donate') {
        updates.hunter_relationship = Math.min(100, (vampire.hunter_relationship || 0) + 10);
      } else if (strategy.id === 'hunting_together') {
        updates.exposure_level = (vampire.exposure_level || 0) + 10;
        updates.hunter_relationship = Math.min(100, (vampire.hunter_relationship || 0) + 15);
      }

      if (vampire.id) {
        await base44.entities.VampireState.update(vampire.id, {
          ...updates,
          hunger_state: 'sated'
        });
      }

      await base44.entities.NightLog.create({
        entry: `${hunter.name} helped ${vampire.vampire_name} feed safely. Strategy: ${strategy.title}`,
        category: 'feeding',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setSelectedStrategy(null);
    } catch (e) {
      console.error('Failed to implement feeding strategy:', e);
    }
    setLoading(false);
  };

  const safetyColors = {
    'Very Safe': 'text-green-400',
    'Safe': 'text-green-300',
    'Moderate': 'text-yellow-400',
    'Risky': 'text-orange-400',
    'Variable': 'text-yellow-300'
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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-3xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-red-500" />
            Feeding Control
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {FEEDING_STRATEGIES.map(strategy => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy)}
              className="w-full p-4 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-bold">{strategy.title}</h3>
                <span className={`text-xs font-bold ${safetyColors[strategy.safety]}`}>{strategy.safety}</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{strategy.description}</p>
              <p className="text-gray-400 text-xs">Frequency: {strategy.frequency}</p>
            </button>
          ))}
        </div>

        {selectedStrategy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-950/30 border border-red-500/30 rounded-lg"
          >
            <h3 className="text-white font-bold mb-3">{selectedStrategy.title}</h3>
            
            <div className="space-y-2 mb-4 text-sm">
              <p><span className="text-gray-400">Safety:</span> <span className={safetyColors[selectedStrategy.safety]}>{selectedStrategy.safety}</span></p>
              <p><span className="text-gray-400">Risk:</span> <span className="text-red-300">{selectedStrategy.risk}</span></p>
              <p><span className="text-gray-400">Effect:</span> <span className="text-purple-300">{selectedStrategy.effect}</span></p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStrategy(selectedStrategy)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Implementing...' : 'Implement Strategy'}
              </button>
              <button
                onClick={() => setSelectedStrategy(null)}
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