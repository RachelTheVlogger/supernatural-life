import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Heart, Swords, Handshake, Music, Droplets, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function SirenNymphInteraction({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [selectedNymph, setSelectedNymph] = useState(null);

  const { data: nymphs = [] } = useQuery({
    queryKey: ['waterNymphs'],
    queryFn: () => base44.entities.WaterNymph.list()
  });

  const handleInteract = async (nymph, interactionType) => {
    setAction('processing');

    setTimeout(async () => {
      const interactions = {
        ally: `You approached ${nymph.name}. "We should work together," you said. They hesitated, but nodded. Alliance formed. Siren and nymph. Unlikely. Powerful.`,
        compete: `You challenged ${nymph.name}. Who controls these waters? Your voice against their purity. The water chose... balance. Rivalry established.`,
        romance: `${nymph.name} saw through your predatory nature. Loved you anyway. "We're both water children," they said. You kissed. Siren and nymph. Forbidden. Perfect.`,
        harmonize: `You sang. ${nymph.name} channeled nature. Your powers combined. Water and voice. Something new. Beautiful. Powerful. Perfect synergy.`,
        corrupt: `You tempted ${nymph.name}. "Power over purity," you whispered. They wavered. Corruption started. Small. But growing. You smiled.`,
        purify: `${nymph.name} touched you. Pure water magic. Your predatory urges... calmed. "You don't have to hurt people," they said. Maybe they're right.`
      };

      const text = interactions[interactionType];
      setOutcome(text);

      // Update siren
      const sirenUpdates = {};
      if (interactionType === 'purify') {
        sirenUpdates.alignment = siren.alignment === 'predatory' ? 'neutral' : 'benevolent';
        sirenUpdates.trust = Math.min(100, (siren.trust || 30) + 15);
      } else if (interactionType === 'romance') {
        sirenUpdates.desire = Math.min(100, (siren.desire || 40) + 20);
      } else if (interactionType === 'harmonize') {
        sirenUpdates.water_affinity = Math.min(100, (siren.water_affinity || 50) + 10);
      }

      if (Object.keys(sirenUpdates).length > 0) {
        await base44.entities.Siren.update(siren.id, sirenUpdates);
      }

      // Update nymph
      const nymphUpdates = {};
      if (interactionType === 'corrupt') {
        nymphUpdates.corruption = Math.min(100, (nymph.corruption || 0) + 15);
        nymphUpdates.purity = Math.max(0, (nymph.purity || 100) - 10);
      } else if (interactionType === 'romance') {
        nymphUpdates.desire = Math.min(100, (nymph.desire || 30) + 20);
      } else if (interactionType === 'harmonize') {
        nymphUpdates.connection = Math.min(100, (nymph.connection || 50) + 10);
      }

      if (Object.keys(nymphUpdates).length > 0) {
        await base44.entities.WaterNymph.update(nymph.id, nymphUpdates);
      }

      await base44.entities.NightLog.create({
        entry: text,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setSelectedNymph(null);

      setTimeout(() => {
        setAction(null);
        setOutcome('');
      }, 5000);
    }, 2500);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-cyan-950 to-teal-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Siren × Nymph</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 rounded-xl p-6 mb-6 border border-cyan-500/30"
          >
            <p className="text-cyan-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {!selectedNymph && nymphs.length > 0 ? (
          <div>
            <h3 className="text-white font-bold mb-3">Water Nymphs</h3>
            <div className="space-y-3">
              {nymphs.map(n => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNymph(n)}
                  className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-4 border border-teal-500/30 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{n.name}</h4>
                      <p className="text-gray-400 text-xs">Purity: {n.purity || 100} • Nature Bond: {n.nature_bond || 50}</p>
                    </div>
                    <Droplets className="w-5 h-5 text-teal-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : selectedNymph ? (
          <div>
            <button
              onClick={() => setSelectedNymph(null)}
              className="text-gray-400 hover:text-white mb-4 text-sm"
            >
              ← Back
            </button>

            <div className="bg-black/40 rounded-xl p-4 border border-teal-500/30 mb-6">
              <h3 className="text-white font-bold">{selectedNymph.name}</h3>
              <p className="text-gray-400 text-sm">Alignment: <span className="capitalize text-teal-400">{selectedNymph.alignment || 'pure'}</span></p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleInteract(selectedNymph, 'harmonize')}
                disabled={!!action}
                className="w-full bg-purple-900/60 hover:bg-purple-900/80 border border-purple-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
              >
                <Music className="w-5 h-5 text-purple-400" />
                <span className="text-white">Harmonize Powers</span>
              </button>

              <button
                onClick={() => handleInteract(selectedNymph, 'ally')}
                disabled={!!action}
                className="w-full bg-green-900/60 hover:bg-green-900/80 border border-green-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
              >
                <Handshake className="w-5 h-5 text-green-400" />
                <span className="text-white">Form Alliance</span>
              </button>

              <button
                onClick={() => handleInteract(selectedNymph, 'romance')}
                disabled={!!action}
                className="w-full bg-pink-900/60 hover:bg-pink-900/80 border border-pink-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
              >
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-white">Pursue Romance</span>
              </button>

              {siren.alignment === 'predatory' && (
                <button
                  onClick={() => handleInteract(selectedNymph, 'corrupt')}
                  disabled={!!action}
                  className="w-full bg-red-900/60 hover:bg-red-900/80 border border-red-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
                >
                  <Waves className="w-5 h-5 text-red-400" />
                  <span className="text-white">Corrupt Them</span>
                </button>
              )}

              {selectedNymph.purity >= 80 && (
                <button
                  onClick={() => handleInteract(selectedNymph, 'purify')}
                  disabled={!!action}
                  className="w-full bg-blue-900/60 hover:bg-blue-900/80 border border-blue-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
                >
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Let Them Purify You</span>
                </button>
              )}

              <button
                onClick={() => handleInteract(selectedNymph, 'compete')}
                disabled={!!action}
                className="w-full bg-yellow-900/60 hover:bg-yellow-900/80 border border-yellow-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
              >
                <Swords className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Compete for Territory</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No water nymphs found</p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}