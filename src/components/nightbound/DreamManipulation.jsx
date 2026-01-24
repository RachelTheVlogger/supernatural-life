import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sparkles, Skull, Heart, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DREAM_TYPES = [
  { id: 'nightmare', label: 'Send Nightmare', icon: Skull, effect: 'fear', color: 'red' },
  { id: 'desire', label: 'Plant Desire', icon: Heart, effect: 'obsession', color: 'pink' },
  { id: 'memory', label: 'Alter Memory', icon: Sparkles, effect: 'confusion', color: 'purple' },
  { id: 'prophecy', label: 'Show Prophecy', icon: Moon, effect: 'destiny', color: 'blue' },
  { id: 'seduce', label: 'Seduce in Dreams', icon: Heart, effect: 'attraction', color: 'purple' }
];

export default function DreamManipulation({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [dreamType, setDreamType] = useState(null);
  const [manipulating, setManipulating] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const { data: npcs = [] } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const allTargets = [
    ...servants.map(s => ({ ...s, type: 'servant' })),
    ...npcs.map(n => ({ ...n, type: 'npc' })),
    ...hunters.map(h => ({ ...h, type: 'hunter' }))
  ];

  const handleManipulate = async () => {
    setManipulating(true);

    setTimeout(async () => {
      const outcomes = {
        nightmare: [
          `You invaded ${selectedTarget.name}'s sleep. Darkness consumed them. Terror rooted deep. They woke screaming.`,
          `Their dreams became your canvas. You painted horrors. ${selectedTarget.name} will remember this fear.`,
          `Nightmare delivered. ${selectedTarget.name} won't sleep peacefully again. Your presence haunts them now.`
        ],
        desire: [
          `You planted thoughts of you in ${selectedTarget.name}'s dreams. Desire bloomed. They woke wanting you.`,
          `Their subconscious now craves you. The dream was so real. So vivid. They can't stop thinking about it.`,
          `Desire manipulation successful. ${selectedTarget.name} dreamed of your touch. They're obsessed now.`
        ],
        memory: [
          `You rewrote their memories in sleep. ${selectedTarget.name} now remembers things differently. Your version.`,
          `Memory altered. They think the past happened differently. You control their history now.`,
          `Their memories bent to your will. ${selectedTarget.name} believes your lies as truth.`
        ],
        prophecy: [
          `You showed ${selectedTarget.name} a vision of their future. With you. They believe it's destiny now.`,
          `Prophetic dream planted. ${selectedTarget.name} thinks you're meant to be together. Fate, they call it.`,
          `The prophecy took hold. ${selectedTarget.name} saw their future. You were central to it. They're convinced.`
        ],
        seduce: [
          `Dream seduction complete. ${selectedTarget.name} experienced pleasure beyond reality. They're addicted to the dream of you.`,
          `You made love to them in their dreams. So vivid. So real. They woke aroused, confused, wanting more.`,
          `Seduction in sleep successful. ${selectedTarget.name} can't distinguish dream from reality anymore. They want you.`
        ]
      };

      const result = outcomes[dreamType.id][Math.floor(Math.random() * outcomes[dreamType.id].length)];
      setOutcome(result);

      try {
        if (selectedTarget.type === 'servant') {
          const gain = dreamType.effect === 'obsession' ? 15 : 10;
          await base44.entities.Servant.update(selectedTarget.id, {
            relationship: Math.min((selectedTarget.relationship || 0) + gain, 100),
            obsession_stage: Math.min((selectedTarget.obsession_stage || 1) + 1, 5)
          });
        } else if (selectedTarget.type === 'npc') {
          await base44.entities.NPC.update(selectedTarget.id, {
            relationship_vampire: Math.min((selectedTarget.relationship_vampire || 0) + 10, 100)
          });
        } else if (selectedTarget.type === 'hunter') {
          if (dreamType.id === 'nightmare') {
            await base44.entities.Hunter.update(selectedTarget.id, {
              suspicion: Math.max((selectedTarget.suspicion || 0) - 10, 0)
            });
          } else if (dreamType.id === 'seduce') {
            await base44.entities.Hunter.update(selectedTarget.id, {
              status: 'conflicted',
              suspicion: Math.max((selectedTarget.suspicion || 0) - 20, 0)
            });
          }
        }

        await base44.entities.NightLog.create({
          entry: result,
          category: 'power',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Dream manipulation failed:', e);
      }

      setTimeout(() => {
        setManipulating(false);
        setOutcome('');
        setSelectedTarget(null);
        setDreamType(null);
      }, 4000);
    }, 3000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Moon className="w-6 h-6 text-purple-400" />
          Dream Manipulation
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Enter their dreams. Control their subconscious. Shape their thoughts while they sleep.
        </p>

        {manipulating ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Moon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-purple-400">Entering their dreams...</p>
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <p className="text-gray-300 leading-relaxed">{outcome}</p>
          </div>
        ) : !selectedTarget ? (
          <div className="space-y-3">
            <h3 className="text-white font-medium mb-3">Select Target</h3>
            {allTargets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No targets available</p>
            ) : (
              allTargets.map(target => (
                <button
                  key={`${target.type}-${target.id}`}
                  onClick={() => setSelectedTarget(target)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <h4 className="text-white font-medium">{target.name}</h4>
                  <p className="text-gray-400 text-sm capitalize">{target.type}</p>
                </button>
              ))
            )}
          </div>
        ) : !dreamType ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedTarget(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-3"
            >
              ← Back
            </button>

            <h3 className="text-white font-medium mb-3">Choose Dream Type for {selectedTarget.name}</h3>

            {DREAM_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setDreamType(type)}
                  className={`w-full bg-${type.color}-900/40 hover:bg-${type.color}-900/60 border border-${type.color}-500/30 rounded-xl p-4 text-left transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 text-${type.color}-400`} />
                    <div>
                      <h4 className="text-white font-medium">{type.label}</h4>
                      <p className="text-gray-400 text-xs capitalize">{type.effect}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setDreamType(null)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              ← Back
            </button>

            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-6 text-center">
              <p className="text-white mb-4">
                You will enter <span className="font-bold">{selectedTarget.name}</span>'s dreams and <span className="font-bold lowercase">{dreamType.label}</span>.
              </p>
              <button
                onClick={handleManipulate}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Enter Their Dreams
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}