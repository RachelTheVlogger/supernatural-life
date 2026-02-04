import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Music, Moon, Waves, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function SirenDeepInteractions({ siren, partner, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const getAlignmentDialogue = () => {
    const alignment = siren.alignment || 'neutral';
    
    if (alignment === 'benevolent') {
      return {
        deep_talk: [
          `You and ${partner.displayName} talk for hours by the water. You speak of using your voice for good. Helping, not hurting. They admire your choice.`,
          `"I don't want to hurt people," you confess. ${partner.displayName} holds your hand. "Then don't. You're more than your nature." Hope blooms.`,
          `Deep conversation. ${partner.displayName} sees the good in you. Chooses you anyway. Despite what you are. Because of who you choose to be.`
        ],
        romance: [
          `${partner.displayName} kisses you under moonlight. Gentle. Pure. "You're beautiful," they whisper. You believe them.`,
          `You sang softly. Just for ${partner.displayName}. Love song. Real. Not magic. Just... feeling. They cried. Beautiful tears.`,
          `Intimacy with ${partner.displayName}. Tender. Caring. Magic minimal. Just two souls connecting. Perfect.`
        ]
      };
    } else if (alignment === 'predatory') {
      return {
        deep_talk: [
          `You told ${partner.displayName} about the hunt. The thrill. The power. They should fear you. But they don't. They're intrigued. Dangerous.`,
          `"I've drowned sailors," you confess. ${partner.displayName} doesn't flinch. "I know what you are." They stay anyway. Thrilling.`,
          `Dark conversation. You speak of control. Dominance. ${partner.displayName} listens. Fascinated. "Show me," they breathe.`
        ],
        romance: [
          `${partner.displayName} surrendered to you completely. Your voice commanded. They obeyed. Power and passion mixing perfectly.`,
          `You sang your darkest song. ${partner.displayName} fell deeper under your spell. "Mine," you growled. "Yours," they echoed. Perfect.`,
          `Intense. Consuming. You took control. ${partner.displayName} loved every second. Predator and prey. Both enjoying the dance.`
        ]
      };
    } else {
      return {
        deep_talk: [
          `You and ${partner.displayName} share stories. Ocean tales. Land memories. Different worlds. Same connection.`,
          `"What's it like?" ${partner.displayName} asks. "Being siren?" You think. "Lonely. Beautiful. Powerful." They understand.`,
          `Late night honesty. You show ${partner.displayName} your true self. Scales. Tail. Magic. They don't run. They stare. Awed.`
        ],
        romance: [
          `${partner.displayName} kisses you in the water. Moonlight on waves. Your tail wrapped around them. Perfect moment.`,
          `You sang for ${partner.displayName}. Real song. No magic. Just emotion. They held you after. "That was beautiful."`,
          `Intimacy by the shore. ${partner.displayName} touched your scales. Fascinated. Loving. Accepting all of you.`
        ]
      };
    }
  };

  const alignmentDialogue = getAlignmentDialogue();

  const getAvailableActions = () => {
    const trust = siren.trust || 30;
    const fear = siren.fear_of_discovery || 50;
    const desire = siren.desire || 40;
    const intimacy = siren.intimacy_level || 0;
    const isLiteMode = false; // Get from vampire state if needed

    const actions = [
      {
        id: 'deep_talk',
        icon: MessageCircle,
        label: 'Deep Conversation',
        color: 'from-blue-900/60 to-cyan-900/60',
        relGain: [8, 15],
        statChanges: { trust: [5, 10], fear: [-3, -1] },
        outcomes: alignmentDialogue.deep_talk
      },
      {
        id: 'sing',
        icon: Music,
        label: 'Sing for Them',
        color: 'from-purple-900/60 to-pink-900/60',
        relGain: [6, 12],
        statChanges: { desire: [8, 15] },
        outcomes: [
          `You sang softly. Just for ${partner.displayName}. No magic. Just beauty. They listened. Mesmerized by you, not by compulsion.`,
          `Your voice filled the air. ${partner.displayName} closed their eyes. "I could listen forever." And they mean it.`,
          `Song without enchantment. Pure emotion. ${partner.displayName} heard your soul. Loved what they heard.`
        ]
      },
      {
        id: 'show_form',
        icon: Waves,
        label: 'Show True Form',
        color: 'from-teal-900/60 to-blue-900/60',
        relGain: [10, 18],
        statChanges: { trust: [15, 25], fear: [-10, -5] },
        outcomes: [
          `You transformed. Legs became tail. ${partner.displayName} stared. "You're... magnificent." Acceptance. Complete.`,
          `You revealed your true form. Scales shimmering. ${partner.displayName} touched your tail. "Beautiful. All of you."`,
          `No more hiding. You showed ${partner.displayName} everything. Siren. Monster. Magic. They didn't run. They stayed. Chose you.`
        ]
      }
    ];

    if (trust >= 60 && desire >= 50 && !siren.boundaries_discussed) {
      actions.push({
        id: 'boundaries',
        icon: MessageCircle,
        label: 'Discuss Boundaries',
        color: 'from-blue-900/60 to-purple-900/60',
        special: true
      });
    }

    if (siren.boundaries_discussed && trust >= 70 && desire >= 60) {
      actions.push({
        id: 'romance',
        icon: Heart,
        label: 'Romantic Intimacy',
        color: 'from-pink-900/60 to-red-900/60',
        relGain: [12, 20],
        statChanges: { desire: [10, 20], intimacy: [15, 25] },
        outcomes: alignmentDialogue.romance
      });
    }

    return actions;
  };

  const deepActions = getAvailableActions();

  const handleBoundaries = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const text = `You and ${partner.displayName} talked seriously. "Before we go further, we need boundaries. Consent. Safety." They nodded. Grateful. You discussed everything. Trust deepened.`;
      
      setOutcome(text);

      await base44.entities.Siren.update(siren.id, {
        boundaries_discussed: true,
        trust: Math.min(100, (siren.trust || 30) + 20)
      });

      await base44.entities.NightLog.create({
        entry: text,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 5000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-cyan-950 to-blue-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500/50"
      >
        <h2 className="text-2xl font-bold text-white mb-4">With {partner.displayName}</h2>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-black/40 rounded-lg p-2 border border-blue-500/20">
            <p className="text-blue-400 text-xs">Trust</p>
            <p className="text-white text-sm font-bold">{siren.trust || 30}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-red-500/20">
            <p className="text-red-400 text-xs">Fear</p>
            <p className="text-white text-sm font-bold">{siren.fear_of_discovery || 50}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-pink-500/20">
            <p className="text-pink-400 text-xs">Desire</p>
            <p className="text-white text-sm font-bold">{siren.desire || 40}</p>
          </div>
        </div>

        {outcome ? (
          <div className="py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-cyan-500/30"
            >
              <p className="text-cyan-100 text-sm leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4"
            >
              🌊
            </motion.div>
            <p className="text-cyan-300">Interacting...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deepActions.map(action => (
              <button
                key={action.id}
                onClick={async () => {
                  if (action.special) {
                    if (action.id === 'boundaries') {
                      handleBoundaries();
                    }
                    return;
                  }

                  setProcessing(true);

                  setTimeout(async () => {
                    const result = action.outcomes[Math.floor(Math.random() * action.outcomes.length)];
                    setOutcome(result);

                    const updates = {};
                    const relGain = Math.floor(Math.random() * (action.relGain[1] - action.relGain[0] + 1)) + action.relGain[0];

                    if (action.statChanges) {
                      Object.keys(action.statChanges).forEach(stat => {
                        const change = Math.floor(Math.random() * (action.statChanges[stat][1] - action.statChanges[stat][0] + 1)) + action.statChanges[stat][0];
                        updates[stat] = Math.max(0, Math.min(100, (siren[stat] || (stat === 'trust' ? 30 : stat === 'fear_of_discovery' ? 50 : 40)) + change));
                      });
                    }

                    await base44.entities.Siren.update(siren.id, updates);

                    await base44.entities.NightLog.create({
                      entry: result,
                      category: 'interaction',
                      intensity: 'significant'
                    });

                    queryClient.invalidateQueries();

                    setTimeout(() => {
                      setProcessing(false);
                      setOutcome('');
                    }, 5000);
                  }, 2000);
                }}
                disabled={processing}
                className={`bg-gradient-to-r ${action.color} border-2 border-cyan-500/30 rounded-xl p-4 text-left transition-all hover:scale-105 disabled:opacity-50`}
              >
                <div className="flex items-start gap-3">
                  <action.icon className="w-6 h-6 text-white flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{action.label}</h4>
                    <p className="text-gray-300 text-xs">
                      {action.special ? 'Special interaction' : `+${action.relGain[0]}-${action.relGain[1]} connection`}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Back
        </button>
      </motion.div>
    </motion.div>
  );
}