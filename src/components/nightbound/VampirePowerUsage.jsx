import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Eye, Brain, Wind, Droplets, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { POWER_EFFECTS } from './vampirePowersConfig';

export default function VampirePowerUsage({ hunter, power, onClose }) {
  const queryClient = useQueryClient();
  const [using, setUsing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const effect = POWER_EFFECTS[power];

  const handleUse = async () => {
    setUsing(true);

    setTimeout(async () => {
      const selectedOutcome = effect.outcomes[Math.floor(Math.random() * effect.outcomes.length)];
      setOutcome(selectedOutcome);

      await base44.entities.Hunter.update(hunter.id, {
        experience: (hunter.experience || 0) + 5
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} used ${power.replace(/_/g, ' ')}: ${selectedOutcome}`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        onClose();
      }, 3000);
    }, 2000);
  };

  const ParticleEffect = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 bg-${effect.particles}-400 rounded-full`}
          initial={{
            x: '50%',
            y: '50%',
            opacity: 0,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-2xl w-full relative overflow-hidden border-2 border-purple-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              key="outcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center relative z-10"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                ⚡
              </motion.div>
              <p className="text-purple-100 text-xl leading-relaxed">{outcome}</p>
            </motion.div>
          ) : using ? (
            <motion.div
              key="using"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 relative"
            >
              <ParticleEffect />
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className="relative z-10"
              >
                <Zap className={`w-24 h-24 text-${effect.particles}-400 mx-auto`} />
              </motion.div>
              <p className="text-purple-300 mt-6 relative z-10">Channeling power...</p>
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center relative z-10"
            >
              <h2 className="text-3xl font-bold text-white mb-4 capitalize">
                {power.replace(/_/g, ' ')}
              </h2>
              <p className="text-gray-400 mb-8">
                Use your vampire power?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUse}
                  className={`px-8 py-3 bg-gradient-to-r from-${effect.particles}-600 to-purple-600 hover:from-${effect.particles}-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all shadow-lg`}
                >
                  Unleash Power
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}