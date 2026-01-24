import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTIMATE_ACTIONS = {
  all: [
    { id: 'touch', label: 'Touch them', icon: '👋', category: 'physical' },
    { id: 'kiss', label: 'Kiss them', icon: '💋', category: 'romantic' },
    { id: 'dance', label: 'Dance with them', icon: '💃', category: 'romantic' },
    { id: 'seduce', label: 'Seduce from behind', icon: '😈', category: 'physical' },
    { id: 'whisper', label: 'Whisper to them', icon: '🤫', category: 'romantic' },
    { id: 'pin', label: 'Pin them against wall', icon: '🔥', category: 'physical' },
    { id: 'undress', label: 'Undress them slowly', icon: '✨', category: 'physical' },
    { id: 'claim', label: 'Mark them as yours', icon: '💋', category: 'physical' }
  ],
  romantic: [
    { id: 'dance', label: 'Dance with them', icon: '💃', category: 'romantic' },
    { id: 'whisper', label: 'Whisper sweet threats', icon: '🤫', category: 'romantic' },
    { id: 'kiss', label: 'Kiss them', icon: '💋', category: 'romantic' }
  ],
  physical: [
    { id: 'touch', label: 'Touch them', icon: '👋', category: 'physical' },
    { id: 'seduce', label: 'Seduce from behind', icon: '😈', category: 'physical' },
    { id: 'pin', label: 'Pin them against wall', icon: '🔥', category: 'physical' },
    { id: 'undress', label: 'Undress them slowly', icon: '✨', category: 'physical' },
    { id: 'claim', label: 'Mark them as yours', icon: '💋', category: 'physical' }
  ],
  bdsm: [
    { id: 'pin', label: 'Pin them against wall', icon: '🔥', category: 'physical' },
    { id: 'bind', label: 'Bind their hands', icon: '⛓️', category: 'bdsm' },
    { id: 'command', label: 'Give them orders', icon: '👑', category: 'bdsm' }
  ],
  social: [
    { id: 'dance', label: 'Dance with them', icon: '💃', category: 'romantic' },
    { id: 'kiss', label: 'Kiss them publicly', icon: '💋', category: 'social' }
  ],
  activity: [
    { id: 'hunt', label: 'Hunt together', icon: '🔫', category: 'activity' },
    { id: 'explore', label: 'Explore the night', icon: '🌙', category: 'activity' }
  ]
};

export default function HunterIntimate({ hunter, vampires }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const validPartners = vampires.map(v => ({
    id: v.id,
    name: v.vampire_name,
    type: 'vampire',
    icon: '🦇'
  }));

  const categories = ['all', 'romantic', 'physical', 'bdsm', 'social', 'activity'];
  const currentActions = INTIMATE_ACTIONS[selectedCategory] || INTIMATE_ACTIONS.all;

  const handleAction = async (action, partner) => {
    setProcessing(true);
    setSelectedAction(action);

    const outcomes = {
      touch: `You reached out and touched ${partner.name}. Electric. Raw. Undeniable.`,
      kiss: `Your lips met theirs. The world stopped. Everything else faded away.`,
      dance: `You moved together in the darkness. Two hunters, momentarily forgetting the hunt.`,
      seduce: `You traced a finger down their spine. They shivered. Control shifted.`,
      whisper: `You whispered dangerous things into their ear. They leaned in, captivated.`,
      pin: `You pushed them against the wall. Eyes locked. Nowhere to run.`,
      undress: `You peeled away their clothes slowly. Every inch revealed. Vulnerable.`,
      claim: `You marked them with your lips and hands. They belonged to you now.`,
      bind: `You secured their wrists. They tested the restraints, a smile playing at their lips.`,
      command: `You gave them orders. They obeyed. The power was intoxicating.`,
      hunt: `You hunted together that night. Two predators working as one. Deadly.`,
      explore: `You explored the night together. Discovered new heights of desire.`
    };

    setTimeout(async () => {
      try {
        await base44.entities.NightLog.create({
          entry: `${hunter.name}: ${outcomes[action.id] || 'An intimate moment shared.'}`,
          category: 'interaction',
          intensity: 'high'
        });

        setOutcome(outcomes[action.id] || 'A moment shared.');
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
          setSelectedAction(null);
          setSelectedPartner(null);
        }, 3000);
      } catch (e) {
        console.error('Activity failed:', e);
        setProcessing(false);
      }
    }, 1500);
  };

  if (processing && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-purple-500/50"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-purple-200 text-lg leading-relaxed italic"
          >
            {outcome}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-4xl">💜</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-lg w-full border-2 border-purple-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {validPartners[0]?.name || 'Intimate Encounter'}
            </h2>
            <p className="text-gray-400">They're here with you. What will you do?</p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions Grid */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {currentActions.map(action => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAction(action, validPartners[0] || { name: 'them' })}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl py-4 px-6 font-medium transition-all flex items-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-125 transition-transform">{action.icon}</span>
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}