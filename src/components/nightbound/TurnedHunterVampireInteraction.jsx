import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Droplets, Zap, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const VAMPIRE_INTERACTIONS = [
  { id: 'feed_together', label: 'Hunt and feed together', category: 'bonding', xp: 10 },
  { id: 'blood_exchange', label: 'Exchange blood intimately', category: 'intimate', xp: 15 },
  { id: 'share_power', label: 'Share vampire power', category: 'bonding', xp: 20 },
  { id: 'merged_hunt', label: 'Merged consciousness hunt', category: 'intimate', xp: 25 },
  { id: 'eternal_bond', label: 'Strengthen eternal bond', category: 'bonding', xp: 15 },
  { id: 'vampire_passion', label: 'Vampire passion (no limits)', category: 'intimate', xp: 20 },
  { id: 'teach_me', label: 'Teach me your ways', category: 'training', xp: 0 },
  { id: 'bloodlust_control', label: 'Learn bloodlust control', category: 'training', xp: 30 },
  { id: 'advanced_feeding', label: 'Advanced feeding techniques', category: 'training', xp: 25 },
  { id: 'power_mastery', label: 'Master vampire powers', category: 'training', xp: 35 }
];

const TRAINING_LESSONS = {
  bloodlust_control: {
    outcomes: [
      'Your sire pins you down as the bloodlust threatens to take over. "Control it," they whisper. "Don\'t let it control you." Slowly, you breathe. The red fades from your vision.',
      'The human\'s pulse pounds in your ears. Your sire\'s hand on your shoulder steadies you. "Feed, but stop. You can do this." You do. The human lives.',
      'Bloodlust surges through you. Your sire grips your chin, forcing you to meet their eyes. "You are not a monster. You are more." The hunger quiets.'
    ]
  },
  advanced_feeding: {
    outcomes: [
      'Your sire teaches you to feed without killing. To take just enough. To leave no trace. "This is how we survive undetected," they explain.',
      'You learn to compel the human to forget. To make them enjoy the feeding. Your sire smiles proudly. "Now you\'re thinking like a vampire."',
      'The technique is precise. A bite that brings pleasure, not pain. Your sire demonstrates, then watches as you try. "Perfect," they praise.'
    ]
  },
  power_mastery: {
    outcomes: [
      'Your sire demonstrates supernatural speed. You try. Fail. Try again. Suddenly, you\'re moving like liquid shadow. They grin. "There it is."',
      'Power flows between you as your sire guides you. You feel the ancient strength awakening. This is what you were meant to become.',
      'Your sire pushes you, testing your limits. You break through. Strength you never imagined. "You\'re a natural," they admit.'
    ]
  }
};

export default function TurnedHunterVampireInteraction({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'bonding', 'intimate', 'training'];
  const currentActions = selectedCategory === 'all' 
    ? VAMPIRE_INTERACTIONS 
    : VAMPIRE_INTERACTIONS.filter(a => a.category === selectedCategory);

  const handleAction = async (action) => {
    setProcessing(true);

    setTimeout(async () => {
      try {
        let message = '';
        
        if (action.category === 'training') {
          const lessons = TRAINING_LESSONS[action.id];
          if (lessons) {
            message = lessons.outcomes[Math.floor(Math.random() * lessons.outcomes.length)];
          } else {
            message = `${vampire.vampire_name} teaches you the ways of vampires. You learn quickly, your hunter instincts adapting to this new existence.`;
          }
        } else if (action.category === 'intimate') {
          const intimateOutcomes = [
            `You and ${vampire.vampire_name} feed together, your fangs in the same victim. The shared experience is overwhelming. Electric. You feel closer than ever.`,
            `Blood exchange with your sire is unlike anything else. Their ancient blood mingles with yours. Power. Connection. Unity.`,
            `Your bodies move together with supernatural grace. Two vampires, perfectly in sync. The passion is intense, primal, endless.`,
            `${vampire.vampire_name} bites your neck as you bite theirs. Blood flowing between you. Ecstasy beyond mortal understanding.`
          ];
          message = intimateOutcomes[Math.floor(Math.random() * intimateOutcomes.length)];
        } else {
          const bondingOutcomes = [
            `You hunt side by side with ${vampire.vampire_name}. Moving as one. Predators together. The bond between sire and progeny strengthens.`,
            `${vampire.vampire_name} shares their power with you. Ancient energy flowing into your being. You feel yourself growing stronger.`,
            `The eternal bond deepens. You understand now why vampires mate for life. This connection transcends everything.`
          ];
          message = bondingOutcomes[Math.floor(Math.random() * bondingOutcomes.length)];
        }

        await base44.entities.Hunter.update(hunter.id, {
          experience: (hunter.experience || 0) + action.xp,
          vampire_power_level: Math.min(100, (hunter.vampire_power_level || 0) + Math.floor(action.xp / 5))
        });

        await base44.entities.VampireState.update(vampire.id, {
          hunter_relationship: Math.min(100, (vampire.hunter_relationship || 0) + 5)
        });

        await base44.entities.NightLog.create({
          entry: message,
          category: 'interaction',
          intensity: 'high'
        });

        setOutcome(message);
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
        }, 5000);
      } catch (e) {
        console.error('Interaction failed:', e);
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
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-500/50"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-200 text-lg leading-relaxed italic"
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
          <span className="text-4xl">🦇</span>
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
        className="bg-gradient-to-br from-gray-900 to-red-950 rounded-2xl p-6 max-w-lg w-full border-2 border-red-500/50 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Vampire Bond
            </h2>
            <p className="text-gray-400 text-sm">With your sire, {vampire.vampire_name}</p>
            <p className="text-red-400 text-xs mt-1">Bond: {vampire.hunter_relationship || 0}% • XP: {hunter.experience || 0}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat === 'all' ? '🔮 All' : 
               cat === 'bonding' ? '❤️ Bonding' : 
               cat === 'intimate' ? '💋 Intimate' : '📖 Training'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {currentActions.map(action => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAction(action)}
              className="w-full bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-3 px-5 font-medium transition-all text-sm text-left"
            >
              <div className="flex items-center justify-between">
                <span>{action.label}</span>
                {action.xp > 0 && (
                  <span className="text-xs bg-black/30 px-2 py-1 rounded">+{action.xp} XP</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-black/40 rounded-lg border border-red-500/30">
          <p className="text-red-200 text-sm">
            Your sire can teach you control, technique, and power. Train with them to master your vampire nature.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}