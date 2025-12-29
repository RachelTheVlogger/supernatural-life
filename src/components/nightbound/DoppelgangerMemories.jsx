import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Eye, Heart, Zap, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const MEMORY_TYPES = [
  {
    id: 'implant_false',
    name: 'Implant False Memory',
    icon: Brain,
    color: 'from-purple-900 to-purple-950',
    borderColor: 'border-purple-500',
    description: 'Create a memory that never happened',
    humanityChange: -7,
    outcomes: [
      'You made them remember loving you. A childhood together that never existed. Now they feel it\'s real.',
      'You created a memory of you saving their life. They believe they owe you everything.',
      'You implanted fear. A memory of nearly dying. Now they cling to you for safety.',
      'You made them forget someone important. Replaced their memory with yourself instead.'
    ]
  },
  {
    id: 'steal_memory',
    name: 'Steal Their Memory',
    icon: Eye,
    color: 'from-red-900 to-red-950',
    borderColor: 'border-red-500',
    description: 'Take a precious memory from them',
    humanityChange: -10,
    outcomes: [
      'You took their first kiss. They remember nothing. You remember everything. It\'s yours now.',
      'You stole their happiest memory. They feel empty inside. Don\'t know why.',
      'You took a memory of their loved one. They can\'t remember their face anymore. Only yours.',
      'You extracted their trauma. Now YOU carry it. Their pain is in your mind.'
    ]
  },
  {
    id: 'restore_memory',
    name: 'Restore Lost Memory',
    icon: Heart,
    color: 'from-blue-900 to-blue-950',
    borderColor: 'border-blue-500',
    description: 'Return what was taken from them',
    humanityChange: 8,
    outcomes: [
      'You gave back what others stole. Memories of their family. They weep with gratitude.',
      'You restored their childhood. Years of suppressed joy flooding back. They hug you.',
      'You returned their identity. Who they really are. They see you as their savior.',
      'You healed their mind. Trauma erased. Peace restored. They owe you their sanity.'
    ]
  },
  {
    id: 'share_memory',
    name: 'Share Your Memory',
    icon: Zap,
    color: 'from-green-900 to-green-950',
    borderColor: 'border-green-500',
    description: 'Let them experience your past',
    humanityChange: 5,
    outcomes: [
      'You showed them your turning. The pain. The rebirth. They understand you now.',
      'You shared centuries of loneliness. They felt every year. Now they don\'t fear you.',
      'You let them see through your eyes. A vampire\'s view of the world. Beautiful. Terrible.',
      'You gave them your first kill. The horror. The ecstasy. They can\'t look away.'
    ]
  },
  {
    id: 'erase_awareness',
    name: 'Erase Their Awareness',
    icon: AlertTriangle,
    color: 'from-gray-800 to-gray-900',
    borderColor: 'border-gray-600',
    description: 'Make them forget they\'re a doppelgänger',
    humanityChange: -3,
    outcomes: [
      'You erased the truth. They don\'t know what they are anymore. Blissful ignorance.',
      'You removed their existential dread. They think they\'re fully human again.',
      'You deleted their awareness. The burden of being a copy is gone. For now.',
      'You made them forget their purpose. No longer afraid of their fate.'
    ]
  },
  {
    id: 'awaken_instinct',
    name: 'Awaken Their Instinct',
    icon: Zap,
    color: 'from-yellow-900 to-orange-950',
    borderColor: 'border-yellow-500',
    description: 'Activate dormant doppelgänger abilities',
    humanityChange: 0,
    outcomes: [
      'You awakened something primal. They can sense other doppelgängers now. Hunting instinct.',
      'You triggered their supernatural awareness. They see things humans can\'t. Ghosts. Magic. You.',
      'You unlocked their shapeshifting potential. Minor changes. Enough to be dangerous.',
      'You activated their bloodline memory. They remember past lives. Past deaths. All the versions.'
    ]
  }
];

export default function DoppelgangerMemories({ doppelganger, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleMemoryAction = async (memoryType) => {
    setProcessing(true);

    setTimeout(async () => {
      const result = memoryType.outcomes[Math.floor(Math.random() * memoryType.outcomes.length)];

      // Update doppelganger based on action
      const updates = {};
      
      if (memoryType.id === 'implant_false' || memoryType.id === 'erase_awareness') {
        updates.relationship_vampire = Math.min((doppelganger.relationship_vampire || 0) + 15, 100);
        updates.is_aware = false;
      } else if (memoryType.id === 'steal_memory') {
        updates.relationship_vampire = Math.max((doppelganger.relationship_vampire || 0) - 20, -100);
        updates.power_level = Math.max((doppelganger.power_level || 100) - 15, 20);
      } else if (memoryType.id === 'restore_memory') {
        updates.relationship_vampire = Math.min((doppelganger.relationship_vampire || 0) + 40, 100);
        updates.power_level = Math.min((doppelganger.power_level || 100) + 10, 150);
      } else if (memoryType.id === 'share_memory') {
        updates.relationship_vampire = Math.min((doppelganger.relationship_vampire || 0) + 25, 100);
        updates.is_aware = true;
      } else if (memoryType.id === 'awaken_instinct') {
        updates.power_level = Math.min((doppelganger.power_level || 100) + 20, 150);
        // Track awakening progress
        const awakeningLevel = (doppelganger.awakening_level || 0) + 1;
        updates.awakening_level = awakeningLevel;
      }

      await base44.entities.Doppelganger.update(doppelganger.id, updates);

      // Update vampire humanity
      if (vampireState && memoryType.humanityChange !== 0) {
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: Math.max(0, Math.min(100, (vampireState.humanity || 50) + memoryType.humanityChange))
        });
      }

      await base44.entities.NightLog.create({
        entry: result,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome(result);

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 4000);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🧠 Memory Manipulation</h2>
        <p className="text-gray-400 text-sm mb-6">
          Doppelgängers have unstable minds. Malleable. You can reshape their memories. Their very identity.
        </p>

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 border border-purple-500/30 rounded-xl p-6"
            >
              <p className="text-purple-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🧠
            </motion.div>
            <p className="text-purple-400">Manipulating memories...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MEMORY_TYPES.map(memory => {
              const Icon = memory.icon;
              return (
                <button
                  key={memory.id}
                  onClick={() => handleMemoryAction(memory)}
                  className={`w-full bg-gradient-to-r ${memory.color} hover:opacity-90 border-2 ${memory.borderColor} rounded-xl p-4 text-left transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">{memory.name}</h4>
                      <p className="text-gray-300 text-sm mb-2">{memory.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        {memory.humanityChange > 0 ? (
                          <span className="text-green-400">+{memory.humanityChange} Humanity</span>
                        ) : memory.humanityChange < 0 ? (
                          <span className="text-red-400">{memory.humanityChange} Humanity</span>
                        ) : (
                          <span className="text-gray-400">Neutral</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}