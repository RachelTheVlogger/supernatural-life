import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Flame, Eye, Zap, Handshake, Skull, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTERACTIONS = {
  all: [
    { icon: Heart, text: 'Seduce them', category: 'seductive', explicit: true, turn: null },
    { icon: Flame, text: 'Make them beg', category: 'menacing', explicit: true, turn: null },
    { icon: Eye, text: 'Read their fear', category: 'mysterious', explicit: false, turn: null },
    { icon: Zap, text: 'Show your power', category: 'menacing', explicit: false, turn: null },
    { icon: Handshake, text: 'Propose a truce', category: 'bargain', explicit: false, turn: null },
    { icon: Skull, text: 'Turn them into a servant', category: 'convert', explicit: true, turn: 'servant' },
    { icon: Flame, text: 'Offer them the gift', category: 'convert', explicit: true, turn: 'vampire' },
    { icon: Eye, text: 'Bind them as a thrall', category: 'convert', explicit: true, turn: 'thrall' },
  ],
  seductive: [
    { icon: Heart, text: 'Seduce them', category: 'seductive', explicit: true, turn: null },
    { icon: Heart, text: 'Play with them', category: 'seductive', explicit: true, turn: null },
    { icon: Flame, text: 'Let them taste your bite', category: 'seductive', explicit: true, turn: null },
    { icon: Eye, text: 'Make them want you', category: 'seductive', explicit: true, turn: null },
  ],
  menacing: [
    { icon: Flame, text: 'Make them beg', category: 'menacing', explicit: true, turn: null },
    { icon: Zap, text: 'Show your power', category: 'menacing', explicit: false, turn: null },
    { icon: Skull, text: 'Promise them death', category: 'menacing', explicit: false, turn: null },
    { icon: Flame, text: 'Let them feel your hunger', category: 'menacing', explicit: true, turn: null },
  ],
  tactical: [
    { icon: Skull, text: 'Corner them', category: 'tactical', explicit: false, turn: null },
    { icon: Eye, text: 'Find their weakness', category: 'tactical', explicit: false, turn: null },
    { icon: Zap, text: 'Exploit their fear', category: 'tactical', explicit: false, turn: null },
    { icon: Handshake, text: 'Offer them a choice', category: 'tactical', explicit: false, turn: null },
  ],
  mysterious: [
    { icon: Eye, text: 'Read their fear', category: 'mysterious', explicit: false, turn: null },
    { icon: Eye, text: 'Hypnotize them', category: 'mysterious', explicit: false, turn: null },
    { icon: Zap, text: 'Reveal a secret', category: 'mysterious', explicit: false, turn: null },
    { icon: Heart, text: 'Show them your humanity', category: 'mysterious', explicit: false, turn: null },
  ],
  bargain: [
    { icon: Handshake, text: 'Propose a truce', category: 'bargain', explicit: false, turn: null },
    { icon: Handshake, text: 'Offer them immortality', category: 'bargain', explicit: false, turn: 'vampire' },
    { icon: Handshake, text: 'Make a blood pact', category: 'bargain', explicit: false, turn: 'servant' },
    { icon: Eye, text: 'Negotiate for their silence', category: 'bargain', explicit: false, turn: null },
  ],
  convert: [
    { icon: Flame, text: 'Offer them the gift', category: 'convert', explicit: true, turn: 'vampire' },
    { icon: Skull, text: 'Turn them into a servant', category: 'convert', explicit: true, turn: 'servant' },
    { icon: Eye, text: 'Bind them as a thrall', category: 'convert', explicit: true, turn: 'thrall' },
    { icon: Heart, text: 'Make them your sire\'s progeny', category: 'convert', explicit: true, turn: 'vampire' },
  ],
};

const RESPONSES = {
  seductive: [
    'They falter, caught between duty and desire. Your beauty is intoxicating.',
    'Their weapon lowers slightly. They\'re breathing hard, fighting an internal battle.',
    'You see it in their eyes—the moment they realize they want you more than they want to kill you.',
  ],
  menacing: [
    'Fear floods their features. They realize how completely outmatched they are.',
    'Their bravado crumbles. They\'re trembling, trying to hide it.',
    'They see the predator beneath the skin. Now they truly understand what they\'re hunting.',
  ],
  tactical: [
    'Their strategy crumbles as they see the trap closing. Too late.',
    'They realize you\'ve been three steps ahead the entire time.',
    'Desperation flashes across their face. They\'re calculating odds they can\'t win.',
  ],
  mysterious: [
    'Something ancient and terrifying looks back at them. They\'re frozen.',
    'For a moment, they see beyond the veil into what you truly are.',
    'Their certainty shatters. Nothing about you makes sense anymore.',
  ],
  bargain: [
    'They pause, considering. For the first time, there\'s something other than hatred in their eyes.',
    'The offer hangs between you. They\'re tempted, even if they won\'t admit it.',
    'Their hand lowers slightly. They\'re actually thinking about this.',
  ],
  convert: [
    'They close their eyes as your fangs sink in. When they open them again, everything is different.',
    'The transformation begins. They gasp as the gift flows through them, changing everything.',
    'They\'re yours now. No escape. No redemption. Only eternity.',
  ],
};

export default function VampireHunterInteraction({ vampire, hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const categoryColors = {
    seductive: 'from-pink-600 to-rose-600',
    menacing: 'from-red-600 to-orange-600',
    tactical: 'from-blue-600 to-cyan-600',
    mysterious: 'from-purple-600 to-violet-600',
    bargain: 'from-green-600 to-emerald-600',
    convert: 'from-red-700 to-purple-700',
  };

  const currentInteractions = INTERACTIONS[selectedCategory] || INTERACTIONS.all;

  const handleAction = async (interaction) => {
    setLoading(true);

    setTimeout(async () => {
      const responseTexts = RESPONSES[interaction.category];
      const hunterText = responseTexts[Math.floor(Math.random() * responseTexts.length)];
      
      setResponse({
        text: hunterText,
        action: interaction.text,
      });

      try {
        await base44.entities.NightLog.create({
          entry: `Confronted ${hunter.name}. You ${interaction.text.toLowerCase()}.\n${hunter.name}: ${hunterText}`,
          category: 'encounter',
          intensity: interaction.explicit ? 'high' : 'moderate'
        });

        queryClient.invalidateQueries(['vampireState']);
      } catch (e) {
        console.error('Failed to save interaction:', e);
      }

      setLoading(false);
    }, 1500);
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-3xl font-bold text-white">{hunter.name}</h2>
            <p className="text-gray-400 text-sm mt-2">They're here with you. What will you do?</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Response Display */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-950/40 border border-blue-500/50 rounded-xl p-5 mb-8"
          >
            <p className="text-blue-100 text-sm leading-relaxed">
              {response.hunterText}
            </p>
          </motion.div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'seductive', 'menacing', 'tactical', 'mysterious', 'bargain', 'convert'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setResponse(null);
              }}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {currentInteractions.map((interaction, idx) => {
            const Icon = interaction.icon;
            const colors = categoryColors[interaction.category];
            
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleAction(interaction)}
                disabled={loading}
                className={`w-full bg-gradient-to-r ${colors} hover:opacity-90 disabled:opacity-50 transition-all rounded-xl py-4 px-5 flex items-center gap-4 text-white font-medium text-base shadow-lg`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{interaction.text}</span>
                {interaction.explicit && (
                  <Flame className="w-4 h-4 flex-shrink-0 opacity-75" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors"
        >
          Leave
        </button>
      </motion.div>
    </motion.div>
  );
}