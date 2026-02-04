import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Music, Waves, Sparkles, Zap, Moon, Droplets, Wine, Gift, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const ROMANCE_INTERACTIONS = {
  predatory: {
    date: [
      { text: 'Hunt together under moonlight', icon: Moon, reward: { desire: 8, trust: -2 } },
      { text: 'Share a kill - messy and primal', icon: Zap, reward: { desire: 12, trust: 3 } },
      { text: 'Teach me your hunting techniques', icon: Sparkles, reward: { desire: 6, trust: 5 } }
    ],
    gifts: [
      { text: 'A pearl taken from a drowned victim', icon: Droplets, reward: { desire: 10, trust: 8 } },
      { text: 'Blood of a worthy enemy', icon: Wine, reward: { desire: 12, trust: 5 } },
      { text: 'Stolen jewelry from your conquests', icon: Gift, reward: { desire: 8, trust: 10 } }
    ],
    touch: [
      { text: 'Trace your claws down my spine', icon: Flame, reward: { desire: 15, trust: 5, intimacy: 5 } },
      { text: 'Bite me. Mark me as yours.', icon: Zap, reward: { desire: 18, trust: 8, intimacy: 8 } },
      { text: 'Let me taste your power', icon: Music, reward: { desire: 16, trust: 6, intimacy: 6 } }
    ],
    talk: [
      { text: 'Tell me about your darkest fantasy', icon: Sparkles, reward: { desire: 12, trust: 3 } },
      { text: 'What\'s the most twisted thing you\'ve done?', icon: Zap, reward: { desire: 10, trust: 5 } },
      { text: 'Describe how you\'d destroy someone for me', icon: Flame, reward: { desire: 14, trust: 2 } }
    ]
  },
  neutral: {
    date: [
      { text: 'Walk along the shore at dusk', icon: Moon, reward: { desire: 6, trust: 8 } },
      { text: 'Sing to each other in the moonlight', icon: Music, reward: { desire: 8, trust: 10 } },
      { text: 'Explore a hidden cove together', icon: Waves, reward: { desire: 7, trust: 9 } }
    ],
    gifts: [
      { text: 'A beautiful seashell from distant waters', icon: Droplets, reward: { desire: 8, trust: 10 } },
      { text: 'Flowers that only bloom at night', icon: Sparkles, reward: { desire: 7, trust: 12 } },
      { text: 'A song written just for you', icon: Music, reward: { desire: 10, trust: 11 } }
    ],
    touch: [
      { text: 'Hold my hand as waves crash around us', icon: Droplets, reward: { desire: 10, trust: 12, intimacy: 6 } },
      { text: 'Dance with me in the shallow waters', icon: Music, reward: { desire: 12, trust: 13, intimacy: 8 } },
      { text: 'Kiss me like the ocean knows your secret', icon: Heart, reward: { desire: 14, trust: 14, intimacy: 10 } }
    ],
    talk: [
      { text: 'Tell me your real dreams - not the ones you show others', icon: Sparkles, reward: { desire: 8, trust: 12 } },
      { text: 'What scares you most about loving someone?', icon: Heart, reward: { desire: 6, trust: 14 } },
      { text: 'Describe what forever would look like with me', icon: Moon, reward: { desire: 10, trust: 16 } }
    ]
  },
  benevolent: {
    date: [
      { text: 'Watch the sunrise and plan redemption', icon: Sparkles, reward: { desire: 8, trust: 15 } },
      { text: 'Help an innocent person together', icon: Heart, reward: { desire: 5, trust: 18 } },
      { text: 'Plant gardens that will bloom for years', icon: Droplets, reward: { desire: 6, trust: 16 } }
    ],
    gifts: [
      { text: 'A ring symbolizing your commitment to change', icon: Gift, reward: { desire: 12, trust: 18 } },
      { text: 'Write a letter forgiving someone you hurt', icon: Music, reward: { desire: 8, trust: 20 } },
      { text: 'Create something beautiful together', icon: Sparkles, reward: { desire: 10, trust: 17 } }
    ],
    touch: [
      { text: 'Hold me like you\'re trying to save me', icon: Heart, reward: { desire: 12, trust: 16, intimacy: 8 } },
      { text: 'Touch my face and tell me you see the good in me', icon: Droplets, reward: { desire: 10, trust: 18, intimacy: 10 } },
      { text: 'Embrace me like I\'m worth saving', icon: Sparkles, reward: { desire: 13, trust: 20, intimacy: 12 } }
    ],
    talk: [
      { text: 'Tell me you believe I can be better', icon: Heart, reward: { desire: 9, trust: 18 } },
      { text: 'Share your own darkness - let me help you carry it', icon: Sparkles, reward: { desire: 7, trust: 20 } },
      { text: 'Promise me a future where we\'re both redeemed', icon: Moon, reward: { desire: 11, trust: 22 } }
    ]
  }
};

export default function SirenRomanceExpanded({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState('menu');
  const [category, setCategory] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const alignment = siren.alignment || 'neutral';
  const interactions = ROMANCE_INTERACTIONS[alignment] || ROMANCE_INTERACTIONS.neutral;
  const trust = siren.trust || 30;
  const desire = siren.desire || 40;
  const intimacy = siren.intimacy_level || 0;

  const handleInteraction = async (interaction, type) => {
    setProcessing(true);

    setTimeout(async () => {
      const responses = {
        predatory: {
          date: ['Your energy intoxicates me. I crave more.', 'This is exhilarating. Dangerous. Perfect.'],
          gifts: ['You understand me completely. This is mine. Forever.', 'Such a thoughtful touch of depravity.'],
          touch: ['Yes. Yes. Don\'t stop.', 'You know exactly what I want. Exactly how to break me.'],
          talk: ['The way you describe destruction... I\'ve never been more attracted.', 'Say it again. I need to hear it.']
        },
        neutral: {
          date: ['This moment with you feels like home.', 'I didn\'t know I could feel this way.'],
          gifts: ['You see me. The real me. Not the monster.', 'This is beautiful. I\'ll treasure it.'],
          touch: ['I\'ve been waiting for this my whole life.', 'You fit me perfectly. Like we were made for each other.'],
          talk: ['I\'ve never told anyone that before. Thank you for listening.', 'With you, I can be honest. Vulnerable.']
        },
        benevolent: {
          date: ['You inspire me to be better every single day.', 'This is what salvation feels like.'],
          gifts: ['I\'m keeping this forever. It reminds me who I\'m becoming.', 'Your faith in me... it changes everything.'],
          touch: ['I feel loved. Truly loved. Not for what I can do, but for who I am.', 'In your arms, I\'m not the monster. I\'m home.'],
          talk: ['Hearing you say that... I believe I can change. For you.', 'I love you. I think I always will.']
        }
      };

      const responseList = responses[alignment]?.[type] || ['...'];
      const response = responseList[Math.floor(Math.random() * responseList.length)];
      setOutcome(`${interaction.text}\n\n"${response}"`);

      const updates = { ...interaction.reward };
      updates.trust = Math.min(100, (trust || 0) + (interaction.reward.trust || 0));
      updates.desire = Math.min(100, (desire || 0) + (interaction.reward.desire || 0));
      if (interaction.reward.intimacy) {
        updates.intimacy_level = Math.min(100, intimacy + interaction.reward.intimacy);
      }

      await base44.entities.Siren.update(siren.id, updates);

      await base44.entities.NightLog.create({
        entry: `Romantic moment with ${siren.name}: ${interaction.text}`,
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
        className="bg-gradient-to-br from-pink-950 to-purple-950 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-pink-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400" />
            {siren.name} - Romance
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 border border-pink-500/30 grid grid-cols-3 gap-4">
          <div>
            <p className="text-pink-300 text-xs mb-1">Trust</p>
            <p className="text-white font-bold">{trust}</p>
            <div className="w-full bg-gray-800 rounded h-1.5 mt-1">
              <div style={{ width: `${trust}%` }} className="h-1.5 bg-pink-500 rounded" />
            </div>
          </div>
          <div>
            <p className="text-pink-300 text-xs mb-1">Desire</p>
            <p className="text-white font-bold">{desire}</p>
            <div className="w-full bg-gray-800 rounded h-1.5 mt-1">
              <div style={{ width: `${desire}%` }} className="h-1.5 bg-red-500 rounded" />
            </div>
          </div>
          <div>
            <p className="text-pink-300 text-xs mb-1">Intimacy</p>
            <p className="text-white font-bold">{intimacy}</p>
            <div className="w-full bg-gray-800 rounded h-1.5 mt-1">
              <div style={{ width: `${intimacy}%` }} className="h-1.5 bg-purple-500 rounded" />
            </div>
          </div>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 rounded-xl p-6 mb-6 border border-pink-500/30 whitespace-pre-wrap"
          >
            <p className="text-pink-100 leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-pink-400"
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
                  className="w-full bg-gradient-to-r from-pink-900/40 to-purple-900/40 hover:from-pink-900/60 hover:to-purple-900/60 border-2 border-pink-500/30 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
                >
                  <Icon className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{labels[key]}</h3>
                    <p className="text-pink-300 text-sm">{options.length} options available</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setCategory(null)}
              className="text-pink-400 hover:text-pink-300 text-sm mb-3"
            >
              ← Back
            </button>
            {interactions[category]?.map((interaction, i) => (
              <button
                key={i}
                onClick={() => handleInteraction(interaction, category)}
                disabled={processing}
                className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-4 border border-pink-500/30 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <interaction.icon className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-pink-100 font-medium">{interaction.text}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {interaction.reward.trust > 0 && `+${interaction.reward.trust} Trust`}
                      {interaction.reward.trust < 0 && `${interaction.reward.trust} Trust`}
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