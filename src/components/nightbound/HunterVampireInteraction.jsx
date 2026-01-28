import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import HunterIntimate from './HunterIntimate';

export default function HunterVampireInteraction({ hunter, vampire, onClose, visitType = 'meeting' }) {
  const queryClient = useQueryClient();
  const [interactionChoice, setInteractionChoice] = useState(null); // 'hostile' or 'peaceful'
  const [loading, setLoading] = useState(false);

  // Handle hostile choice - kill vampire
  const handleHostileChoice = async () => {
    setLoading(true);
    try {
      await base44.entities.VampireState.delete(vampire.id);
      await base44.entities.NightLog.create({
        entry: `${hunter.name} killed ${vampire.vampire_name} in combat. The threat has been eliminated.`,
        category: 'hunting',
        intensity: 'high'
      });
      queryClient.invalidateQueries();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error('Failed to kill vampire:', e);
    }
  };

  // Initial choice screen
  if (!interactionChoice) {
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Meeting with {vampire.vampire_name}</h2>
              <p className="text-gray-400 text-sm mt-2">How will you approach them?</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleHostileChoice}
              className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-700/50 rounded-2xl p-8 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">⚔️</span>
                <div className="text-left flex-1">
                  <h3 className="text-white text-2xl font-bold mb-2">Hostile Intent</h3>
                  <p className="text-red-300 text-sm">
                    Kill the vampire. End the threat permanently.
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setInteractionChoice('peaceful')}
              className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-700/50 rounded-2xl p-8 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">🤝</span>
                <div className="text-left flex-1">
                  <h3 className="text-white text-2xl font-bold mb-2">Peaceful Approach</h3>
                  <p className="text-purple-300 text-sm">
                    Talk to them. Understand them. Maybe you can find common ground.
                  </p>
                </div>
              </div>
            </motion.button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
          >
            Leave
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Show loading state after hostile choice
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <div className="text-center">
          <p className="text-red-400 text-2xl font-bold mb-4">Eliminating threat...</p>
          <p className="text-gray-400">The vampire has been killed.</p>
        </div>
      </motion.div>
    );
  }

  // Show intimate interactions if peaceful was chosen
  if (interactionChoice === 'peaceful') {
    return <HunterIntimate hunter={hunter} vampires={[vampire]} onClose={onClose} />;
  }

  // Initial choice screen
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Meeting with {vampire.vampire_name}</h2>
            <p className="text-gray-400 text-sm mt-2">How will you approach them?</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={handleHostileChoice}
            className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-700/50 rounded-2xl p-8 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl">⚔️</span>
              <div className="text-left flex-1">
                <h3 className="text-white text-2xl font-bold mb-2">Hostile Intent</h3>
                <p className="text-red-300 text-sm">
                  Kill the vampire. End the threat permanently.
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setInteractionChoice('peaceful')}
            className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-700/50 rounded-2xl p-8 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl">🤝</span>
              <div className="text-left flex-1">
                <h3 className="text-white text-2xl font-bold mb-2">Peaceful Approach</h3>
                <p className="text-purple-300 text-sm">
                  Talk to them. Understand them. Maybe you can find common ground.
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
        >
          Leave
        </button>
      </motion.div>
    </motion.div>
  );
}