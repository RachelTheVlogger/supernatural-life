import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Moon, Home, Droplets } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const ROUTINES = [
  { id: 'hide_during_day', label: 'Hide During Day', icon: '🛏️', description: 'Create a secure resting place for daylight', effect: 'exposure -5, bond +3' },
  { id: 'grocery_run', label: 'Buy Blood Supplies', icon: '🛒', description: 'Get supplies for feeding without suspicion', effect: 'suspicion -3, expenses +100' },
  { id: 'clean_evidence', label: 'Clean Up Evidence', icon: '🧹', description: 'Remove traces of vampire activities', effect: 'exposure -8, time +2h' },
  { id: 'rest_together', label: 'Rest Together', icon: '🛋️', description: 'Spend time relaxing and bonding', effect: 'bond +5, stress -20' },
  { id: 'plan_feeding', label: 'Plan Feeding Route', icon: '📍', description: 'Map out safe feeding locations', effect: 'suspicion -2, bond +2' }
];

export default function HunterDomesticRoutines({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoutine = async (routine) => {
    setLoading(true);
    try {
      let updates = {};
      switch(routine.id) {
        case 'hide_during_day':
          updates = { exposure_level: Math.max(0, (vampire.exposure_level || 0) - 5) };
          break;
        case 'clean_evidence':
          updates = { exposure_level: Math.max(0, (vampire.exposure_level || 0) - 8) };
          break;
        case 'plan_feeding':
          updates = { suspicion: Math.max(0, (hunter.suspicion || 0) - 2) };
          break;
      }
      
      if (vampire.id) {
        await base44.entities.VampireState.update(vampire.id, updates);
      }
      
      await base44.entities.NightLog.create({
        entry: `${hunter.name} and ${vampire.vampire_name}: ${routine.label}. ${routine.effect}`,
        category: 'domestic',
        intensity: 'low'
      });

      queryClient.invalidateQueries();
      setSelected(null);
    } catch (e) {
      console.error('Failed to perform routine:', e);
    }
    setLoading(false);
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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Daily Routines</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {ROUTINES.map(routine => (
            <button
              key={routine.id}
              onClick={() => setSelected(routine)}
              className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg p-4 text-left transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{routine.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{routine.label}</h3>
                  <p className="text-gray-400 text-sm mb-2">{routine.description}</p>
                  <p className="text-purple-400 text-xs">{routine.effect}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-purple-950/30 border border-purple-500/30 rounded-lg"
          >
            <p className="text-white mb-4">Proceed with "{selected.label}"?</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleRoutine(selected)}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setSelected(null)}
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