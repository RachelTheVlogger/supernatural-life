import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTERACTIONS = [
  { id: 'seduce', label: 'Seduce the Vampire', outcome: 'The vampire is entranced. Their cold heart warms.', charmGain: 5, relationshipGain: 10 },
  { id: 'share_energy', label: 'Share Life Energy', outcome: 'You share your essence. A bond forms between demon and undead.', charmGain: 3, relationshipGain: 15 },
  { id: 'dream_together', label: 'Walk Dreams Together', outcome: 'You explore the dreamscape as one. Intimacy deepens.', charmGain: 7, relationshipGain: 20 },
  { id: 'hunt_together', label: 'Hunt Together', outcome: 'Predators united. The night belongs to both of you.', charmGain: 4, relationshipGain: 12 },
  { id: 'feed_each_other', label: 'Exchange Essences', outcome: 'Blood and energy mix. An intoxicating exchange.', charmGain: 8, relationshipGain: 25 }
];

export default function SuccubusVampireInteraction({ succubus, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleInteraction = async (interaction) => {
    setInteracting(true);

    setTimeout(async () => {
      await base44.entities.Succubus.update(succubus.id, {
        charm_level: Math.min(100, (succubus.charm_level || 0) + interaction.charmGain)
      });

      await base44.entities.VampireState.update(vampire.id, {
        humanity: Math.min(100, (vampire.humanity || 50) + interaction.relationshipGain / 2)
      });

      await base44.entities.NightLog.create({
        entry: `${succubus.name} and ${vampire.vampire_name}: ${interaction.outcome}`,
        category: 'interaction',
        intensity: 'intense'
      });

      setOutcome(interaction.outcome);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
        onClose();
      }, 3000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-pink-950/90 to-purple-950/90 rounded-2xl p-6 max-w-md w-full border-2 border-pink-500/30"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-3">💋🦇</div>
          <h2 className="text-2xl font-bold text-pink-300 mb-2">Supernatural Connection</h2>
          <p className="text-pink-100 text-sm">{succubus.name} × {vampire.vampire_name}</p>
        </div>

        {outcome ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-white text-lg">{outcome}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {INTERACTIONS.map((interaction) => (
              <button
                key={interaction.id}
                onClick={() => handleInteraction(interaction)}
                disabled={interacting}
                className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-xl py-3 px-4 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <div>
                    <h3 className="text-white font-medium">{interaction.label}</h3>
                    <p className="text-pink-300 text-xs">+{interaction.charmGain} charm, +{interaction.relationshipGain} bond</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}