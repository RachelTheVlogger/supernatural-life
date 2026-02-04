import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Flower, Droplets, Sparkles, Moon, Wind, Leaf, Gift, Waves } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const ROMANCE_INTERACTIONS = {
  pure: {
    date: [
      { text: 'Watch the sunrise together in a sacred place', icon: Moon, reward: { desire: 7, trust: 12 } },
      { text: 'Meditate by sacred waters hand in hand', icon: Droplets, reward: { desire: 5, trust: 14 } },
      { text: 'Create a garden of flowers for the future', icon: Flower, reward: { desire: 6, trust: 13 } }
    ],
    gifts: [
      { text: 'A crystal blessed by moonlight', icon: Sparkles, reward: { desire: 8, trust: 12 } },
      { text: 'Seeds to plant in her sacred ground', icon: Leaf, reward: { desire: 6, trust: 14 } },
      { text: 'A song of pure devotion', icon: Heart, reward: { desire: 10, trust: 13 } }
    ],
    touch: [
      { text: 'Hold me like I\'m sacred', icon: Heart, reward: { desire: 11, trust: 13, intimacy: 7 } },
      { text: 'Kiss my forehead and promise forever', icon: Flower, reward: { desire: 9, trust: 15, intimacy: 8 } },
      { text: 'Trace the water on my skin tenderly', icon: Droplets, reward: { desire: 13, trust: 14, intimacy: 10 } }
    ],
    talk: [
      { text: 'Tell me what makes you believe in goodness', icon: Sparkles, reward: { desire: 8, trust: 14 } },
      { text: 'Ask me about my deepest spiritual connection', icon: Moon, reward: { desire: 6, trust: 16 } },
      { text: 'Promise we\'ll protect each other\'s purity', icon: Heart, reward: { desire: 9, trust: 17 } }
    ]
  },
  balanced: {
    date: [
      { text: 'Dance in the rain under moonlight', icon: Wind, reward: { desire: 10, trust: 11 } },
      { text: 'Explore a hidden waterfall together', icon: Waves, reward: { desire: 9, trust: 12 } },
      { text: 'Share a meal by the water\'s edge', icon: Flower, reward: { desire: 8, trust: 11 } }
    ],
    gifts: [
      { text: 'Pearls from the deepest waters', icon: Droplets, reward: { desire: 10, trust: 11 } },
      { text: 'A poem about our connection', icon: Sparkles, reward: { desire: 9, trust: 13 } },
      { text: 'A rare flower that only blooms once', icon: Flower, reward: { desire: 11, trust: 12 } }
    ],
    touch: [
      { text: 'Pull me close under the stars', icon: Moon, reward: { desire: 13, trust: 12, intimacy: 8 } },
      { text: 'Let our bodies move like water together', icon: Waves, reward: { desire: 15, trust: 13, intimacy: 10 } },
      { text: 'Kiss me while the world drowns away', icon: Heart, reward: { desire: 16, trust: 14, intimacy: 12 } }
    ],
    talk: [
      { text: 'Tell me your wildest fantasy', icon: Sparkles, reward: { desire: 11, trust: 12 } },
      { text: 'Ask me what I\'ve always wanted to try', icon: Wind, reward: { desire: 13, trust: 11 } },
      { text: 'Describe what eternity with me looks like', icon: Moon, reward: { desire: 12, trust: 15 } }
    ]
  },
  corrupted: {
    date: [
      { text: 'Sink into darkness together', icon: Moon, reward: { desire: 14, trust: 3 } },
      { text: 'Corrupt something beautiful together', icon: Wind, reward: { desire: 16, trust: 2 } },
      { text: 'Drown in depravity', icon: Droplets, reward: { desire: 18, trust: 1 } }
    ],
    gifts: [
      { text: 'A artifact of forbidden magic', icon: Sparkles, reward: { desire: 13, trust: 5 } },
      { text: 'Blood of a destroyed enemy', icon: Heart, reward: { desire: 15, trust: 3 } },
      { text: 'Something beautiful, poisoned', icon: Flower, reward: { desire: 14, trust: 4 } }
    ],
    touch: [
      { text: 'Take me roughly - I want to feel your darkness', icon: Wind, reward: { desire: 18, trust: 4, intimacy: 10 } },
      { text: 'Mark me with your corruption', icon: Droplets, reward: { desire: 20, trust: 2, intimacy: 12 } },
      { text: 'Let me consume you completely', icon: Heart, reward: { desire: 19, trust: 3, intimacy: 14 } }
    ],
    talk: [
      { text: 'Tell me the worst thing you\'ve done', icon: Moon, reward: { desire: 12, trust: 2 } },
      { text: 'Describe how you\'d destroy someone for me', icon: Sparkles, reward: { desire: 16, trust: 1 } },
      { text: 'Promise we\'ll burn it all down together', icon: Wind, reward: { desire: 15, trust: 0 } }
    ]
  }
};

export default function NymphRomanceExpanded({ nymph, onClose }) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState('menu');
  const [category, setCategory] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const alignment = nymph.alignment || 'balanced';
  const interactions = ROMANCE_INTERACTIONS[alignment] || ROMANCE_INTERACTIONS.balanced;
  const trust = nymph.trust || 60;
  const desire = nymph.desire || 30;
  const intimacy = nymph.intimacy_level || 0;

  const handleInteraction = async (interaction, type) => {
    setProcessing(true);

    setTimeout(async () => {
      const responses = {
        pure: {
          date: ['This moment feels blessed. Like the earth itself approves.', 'With you, I feel my soul awakening.'],
          gifts: ['This is beautiful. I\'ll treasure it forever.', 'You see the sacred in me. Thank you.'],
          touch: ['Yes... this is what love should be.', 'I\'ve been waiting my whole life to feel this way.'],
          talk: ['You understand my heart completely.', 'Tell me again. I need to hear it.']
        },
        balanced: {
          date: ['This is perfect. You\'re perfect.', 'I\'ve never felt this alive.'],
          gifts: ['I\'m keeping this close to my heart.', 'You know me better than I know myself.'],
          touch: ['More... I want all of you.', 'Yes... don\'t ever let me go.'],
          talk: ['I\'ve never been so honest with anyone.', 'Stay with me. Always.']
        },
        corrupted: {
          date: ['This darkness... it\'s intoxicating.', 'I\'m losing myself in you and I don\'t care.'],
          gifts: ['Perfect. Just like us. Beautiful and terrible.', 'I\'m yours now. Completely corrupted.'],
          touch: ['Yes... take me. Break me.', 'I want to disappear into you forever.'],
          talk: ['Say it again. The way you describe destruction.', 'Promise you\'ll never leave me.']
        }
      };

      const responseList = responses[alignment]?.[type] || ['...'];
      const response = responseList[Math.floor(Math.random() * responseList.length)];
      setOutcome(`${interaction.text}\n\n"${response}"`);

      const updates = { ...interaction.reward };
      updates.trust = Math.min(100, Math.max(0, (trust || 0) + (interaction.reward.trust || 0)));
      updates.desire = Math.min(100, (desire || 0) + (interaction.reward.desire || 0));
      if (interaction.reward.intimacy) {
        updates.intimacy_level = Math.min(100, intimacy + interaction.reward.intimacy);
      }

      await base44.entities.WaterNymph.update(nymph.id, updates);

      await base44.entities.NightLog.create({
        entry: `Romantic moment with ${nymph.name}: ${interaction.text}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setCategory(null);
      }, 4000);
    }, 2000);
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
        className="bg-gradient-to-br from-teal-950 to-green-950 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-teal-400" />
            {nymph.name} - Romance
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 border border-teal-500/30 grid grid-cols-3 gap-4">
          <div>
            <p className="text-teal-300 text-xs mb-1">Trust</p>
            <p className="text-white font-bold">{trust}</p>
            <div className="w-full bg-gray-800 rounded h-1.5 mt-1">
              <div style={{ width: `${Math.min(trust, 100)}%` }} className="h-1.5 bg-teal-500 rounded" />
            </div>
          </div>
          <div>
            <p className="text-teal-300 text-xs mb-1">Desire</p>
            <p className="text-white font-bold">{desire}</p>
            <div className="w-full bg-gray-800 rounded h-1.5 mt-1">
              <div style={{ width: `${desire}%` }} className="h-1.5 bg-green-500 rounded" />
            </div>
          </div>
          <div>
            <p className="text-teal-300 text-xs mb-1">Intimacy</p>
            <p className="text-white font-bold">{intimacy}</p>
            <div className="w-full bg-gray-800 rounded h-1.5 mt-1">
              <div style={{ width: `${intimacy}%` }} className="h-1.5 bg-emerald-500 rounded" />
            </div>
          </div>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 rounded-xl p-6 mb-6 border border-teal-500/30 whitespace-pre-wrap"
          >
            <p className="text-teal-100 leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-teal-400"
            >
              ...
            </motion.p>
          </div>
        ) : !category ? (
          <div className="space-y-3">
            {Object.entries(interactions).map(([key, options]) => {
              const icons = { date: Moon, gifts: Gift, touch: Heart, talk: Sparkles };
              const Icon = icons[key];
              const labels = { date: 'Go on Dates', gifts: 'Give Gifts', touch: 'Physical Affection', talk: 'Deep Conversations' };
              
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className="w-full bg-gradient-to-r from-teal-900/40 to-green-900/40 hover:from-teal-900/60 hover:to-green-900/60 border-2 border-teal-500/30 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
                >
                  <Icon className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{labels[key]}</h3>
                    <p className="text-teal-300 text-sm">{options.length} options available</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setCategory(null)}
              className="text-teal-400 hover:text-teal-300 text-sm mb-3"
            >
              ← Back
            </button>
            {interactions[category]?.map((interaction, i) => (
              <button
                key={i}
                onClick={() => handleInteraction(interaction, category)}
                disabled={processing}
                className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-4 border border-teal-500/30 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <interaction.icon className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-teal-100 font-medium">{interaction.text}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {interaction.reward.trust > 0 && `+${interaction.reward.trust} Trust`}
                      {interaction.reward.trust < 0 && `${interaction.reward.trust} Trust`}
                      {interaction.reward.trust === 0 && 'No Trust Change'}
                      {' • '}
                      {interaction.reward.desire > 0 && `+${interaction.reward.desire} Desire`}
                      {interaction.reward.intimacy > 0 && ` • +${interaction.reward.intimacy} Intimacy`}
                    </p>
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