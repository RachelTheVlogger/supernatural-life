import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Trash2, Edit, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MEMORY_ACTIONS = [
  { id: 'erase', label: 'Erase Memory', icon: Trash2, desc: 'Remove specific memory completely' },
  { id: 'alter', label: 'Rewrite Memory', icon: Edit, desc: 'Change how they remember events' },
  { id: 'implant', label: 'Create False Memory', icon: Plus, desc: 'Plant memories that never happened' }
];

export default function MemoryAlteration({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [action, setAction] = useState(null);
  const [customMemory, setCustomMemory] = useState('');
  const [processing, setProcessing] = useState(false);
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

  const handleAlter = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = {
        erase: [
          `You erased their memory. ${selectedTarget.name} has no recollection. Clean slate.`,
          `Memory deleted. ${selectedTarget.name} forgot everything about that moment. Gone forever.`,
          `Specific memory removed. ${selectedTarget.name} can't remember what they saw. Perfect.`
        ],
        alter: [
          `Memory rewritten. ${selectedTarget.name} now remembers events differently. Your version is their truth.`,
          `You changed how they remember. ${selectedTarget.name} believes the lie. History altered.`,
          `Manipulation complete. ${selectedTarget.name}'s memory modified. They think it happened your way.`
        ],
        implant: [
          `False memory planted. ${selectedTarget.name} now remembers something that never happened. Completely convinced.`,
          `You created a memory from nothing. ${selectedTarget.name} swears it's real. Believes it fully.`,
          `Implantation successful. ${selectedTarget.name} has vivid memories of events that never occurred.`
        ]
      };

      const result = outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)];
      setOutcome(result);

      try {
        if (selectedTarget.type === 'hunter') {
          await base44.entities.Hunter.update(selectedTarget.id, {
            suspicion: Math.max((selectedTarget.suspicion || 0) - 40, 0)
          });
        } else if (selectedTarget.type === 'npc') {
          await base44.entities.NPC.update(selectedTarget.id, {
            knows_vampire_secret: false,
            relationship_vampire: action.id === 'implant' ? Math.min((selectedTarget.relationship_vampire || 50) + 20, 100) : selectedTarget.relationship_vampire
          });
        } else if (selectedTarget.type === 'servant') {
          if (action.id === 'implant') {
            await base44.entities.Servant.update(selectedTarget.id, {
              relationship: Math.min((selectedTarget.relationship || 0) + 15, 100)
            });
          }
        }

        const memoryNote = customMemory ? ` Memory: "${customMemory}"` : '';
        await base44.entities.NightLog.create({
          entry: `${result}${memoryNote}`,
          category: 'power',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Memory alteration failed:', e);
      }

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedTarget(null);
        setAction(null);
        setCustomMemory('');
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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          Memory Alteration
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Enter their mind. Rewrite the past. Erase, alter, or create memories at will.
        </p>

        {processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-cyan-400">Altering memories...</p>
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
        ) : !action ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedTarget(null)}
              className="text-cyan-400 hover:text-cyan-300 text-sm mb-3"
            >
              ← Back
            </button>

            <h3 className="text-white font-medium mb-3">What will you do to {selectedTarget.name}?</h3>

            {MEMORY_ACTIONS.map(act => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => setAction(act)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-white font-medium">{act.label}</h4>
                      <p className="text-gray-400 text-xs">{act.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setAction(null)}
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              ← Back
            </button>

            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">
                {action.label} - {selectedTarget.name}
              </h3>
              
              {(action.id === 'alter' || action.id === 'implant') && (
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">
                    Describe the memory {action.id === 'implant' ? 'to create' : 'change'}:
                  </label>
                  <textarea
                    value={customMemory}
                    onChange={(e) => setCustomMemory(e.target.value)}
                    placeholder="e.g., 'They remember we first met at a café, and I saved them from danger'"
                    className="w-full bg-gray-800 text-white rounded-lg p-3 text-sm min-h-[80px]"
                  />
                </div>
              )}

              <button
                onClick={handleAlter}
                disabled={((action.id === 'alter' || action.id === 'implant') && !customMemory)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
              >
                Execute Memory Alteration
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}