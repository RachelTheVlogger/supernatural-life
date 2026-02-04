import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Heart, Swords, Sparkles, X, Zap, Shield, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const INTERACTION_TREES = {
  // Predatory Siren + Pure Nymph
  predatory_pure: {
    initial: [
      { 
        text: 'Your purity is intoxicating. I want to taint it.',
        type: 'corrupt',
        siren: { trust: -15, desire: 20 },
        nymph: { trust: -20, fear: 15, corruption: 10 }
      },
      { 
        text: 'Let me show you darkness. You might like it.',
        type: 'corrupt',
        siren: { trust: -10, desire: 15 },
        nymph: { trust: -15, fear: 10, corruption: 8 }
      }
    ],
    bonded: [
      { 
        text: 'You\'re changing. Becoming like me. It\'s perfect.',
        type: 'corrupt',
        siren: { trust: 10, desire: 25 },
        nymph: { trust: 5, corruption: 15 }
      }
    ]
  },
  // Benevolent Siren + Pure Nymph
  benevolent_pure: {
    initial: [
      { 
        text: 'Your goodness reminds me I can be better. Thank you.',
        type: 'ally',
        siren: { trust: 20, desire: 10 },
        nymph: { trust: 20, purity: 5 }
      },
      { 
        text: 'Let\'s protect these waters together. For the innocent.',
        type: 'collaborate',
        siren: { trust: 18, alignment: 'benevolent' },
        nymph: { trust: 22, nature_bond: 5 }
      }
    ],
    intimate: [
      { 
        text: 'With you, I feel redeemed. Like I was always meant to find you.',
        type: 'romance',
        siren: { trust: 30, desire: 25, intimacy_level: 20 },
        nymph: { trust: 30, desire: 20, intimacy_level: 20 }
      }
    ]
  },
  // Neutral Siren + Balanced Nymph
  neutral_balanced: {
    initial: [
      { 
        text: 'We\'re interesting. Water recognizes water.',
        type: 'ally',
        siren: { trust: 12, desire: 12 },
        nymph: { trust: 12, nature_bond: 8 }
      },
      { 
        text: 'What\'s your story? I think we could understand each other.',
        type: 'collaborate',
        siren: { trust: 15, desire: 10 },
        nymph: { trust: 15, connection: 10 }
      }
    ],
    competitive: [
      { 
        text: 'These waters... I claim them. What\'s your claim?',
        type: 'rival',
        siren: { trust: -8, voice_power: 3 },
        nymph: { trust: -8, nature_bond: 3 }
      }
    ]
  },
  // Predatory Siren + Corrupted Nymph
  predatory_corrupted: {
    initial: [
      { 
        text: 'Darkness to darkness. We\'d be unstoppable together.',
        type: 'ally',
        siren: { trust: 15, desire: 20 },
        nymph: { trust: 15, corruption: 10 }
      },
      { 
        text: 'Let\'s drown the world in shadow. You and me.',
        type: 'collaborate',
        siren: { trust: 12, desire: 25 },
        nymph: { trust: 12, corruption: 15 }
      }
    ],
    intimate: [
      { 
        text: 'We\'re perfect monsters. Forever.',
        type: 'romance',
        siren: { trust: 25, desire: 35, intimacy_level: 25 },
        nymph: { trust: 25, desire: 30, intimacy_level: 25 }
      }
    ]
  }
};

export default function SirenNymphAdvanced({ siren, nymph, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);

  const { data: memories = [] } = useQuery({
    queryKey: ['memories', siren?.id, nymph?.id],
    queryFn: async () => {
      if (!siren?.id || !nymph?.id) return [];
      const all = await base44.entities.InteractionMemory.list();
      return all.filter(m => 
        (m.entity_1_id === siren.id && m.entity_2_id === nymph.id) ||
        (m.entity_1_id === nymph.id && m.entity_2_id === siren.id)
      );
    },
    enabled: !!siren?.id && !!nymph?.id
  });

  const getSirenAlignment = () => siren?.alignment || 'neutral';
  const getNymphAlignment = () => nymph?.alignment || 'balanced';
  const getTreeKey = () => `${getSirenAlignment()}_${getNymphAlignment()}`;

  const getInteractionOptions = () => {
    const key = getTreeKey();
    const tree = INTERACTION_TREES[key];
    
    if (!tree) {
      return [
        { 
          text: 'We should talk. Really talk.',
          type: 'ally',
          siren: { trust: 10 },
          nymph: { trust: 10 }
        }
      ];
    }

    // Show different options based on relationship history
    if (memories.length > 3) {
      return tree.intimate || tree.bonded || tree.initial;
    } else if (memories.length > 0) {
      return tree.bonded || tree.initial;
    }
    
    return tree.initial || [];
  };

  const handleInteraction = async (option) => {
    setSelectedAction(option);
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = {
        corrupt: 'You feel your boundaries dissolving. The darkness is seductive.',
        ally: 'Understanding passes between you. You\'re not alone.',
        collaborate: 'Your powers align. Something beautiful emerges.',
        romance: 'The space between you disappears. All that exists is this moment.',
        rival: 'Tension crackles. You both want what the other has.',
        save: 'You gave them something they desperately needed. They won\'t forget.'
      };

      const text = outcomes[option.type] || 'Something shifts between you.';
      setOutcome(text);

      // Update both entities
      const sirenUpdates = option.siren || {};
      const nymphUpdates = option.nymph || {};

      // Create memory
      await base44.entities.InteractionMemory.create({
        entity_1_id: siren.id,
        entity_1_type: 'siren',
        entity_2_id: nymph.id,
        entity_2_type: 'nymph',
        interaction_type: option.type,
        description: text,
        entity_1_alignment_before: getSirenAlignment(),
        entity_2_alignment_before: getNymphAlignment()
      });

      // Apply updates
      if (Object.keys(sirenUpdates).length > 0) {
        await base44.entities.Siren.update(siren.id, {
          ...sirenUpdates,
          alignment: sirenUpdates.alignment || siren.alignment
        });
      }

      if (Object.keys(nymphUpdates).length > 0) {
        await base44.entities.WaterNymph.update(nymph.id, {
          ...nymphUpdates,
          alignment: nymphUpdates.alignment || nymph.alignment
        });
      }

      await base44.entities.NightLog.create({
        entry: `${siren.name} and ${nymph.name}: ${text}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
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
        className="bg-gradient-to-br from-purple-950 to-teal-950 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {siren.name} ⟷ {nymph.name}
            </h2>
            <p className="text-gray-400 text-sm">
              {memories.length} shared memories • Interaction: {getTreeKey()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Memory Timeline */}
        {memories.length > 0 && (
          <div className="bg-black/40 rounded-xl p-4 mb-6 border border-purple-500/30 max-h-32 overflow-y-auto">
            <p className="text-purple-300 text-xs font-bold mb-3">Shared Memories</p>
            <div className="space-y-2">
              {memories.slice(-3).map((mem, i) => (
                <div key={i} className="text-xs text-gray-400 border-l border-purple-500/30 pl-3">
                  <span className="text-purple-300 font-medium capitalize">{mem.interaction_type}:</span> {mem.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outcome Display */}
        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 rounded-xl p-6 mb-6 border border-purple-500/30"
          >
            <p className="text-purple-100 leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {/* Interaction Options */}
        {processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-purple-400"
            >
              ...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            {getInteractionOptions().map((option, i) => {
              const icons = {
                corrupt: Zap,
                ally: Heart,
                collaborate: Sparkles,
                romance: Music,
                rival: Swords,
                save: Shield
              };
              const Icon = icons[option.type] || Heart;
              const colors = {
                corrupt: 'from-red-900/60 to-purple-900/60 border-red-500/50',
                ally: 'from-green-900/60 to-teal-900/60 border-green-500/50',
                collaborate: 'from-blue-900/60 to-cyan-900/60 border-blue-500/50',
                romance: 'from-pink-900/60 to-purple-900/60 border-pink-500/50',
                rival: 'from-yellow-900/60 to-orange-900/60 border-yellow-500/50',
                save: 'from-emerald-900/60 to-green-900/60 border-emerald-500/50'
              };

              return (
                <button
                  key={i}
                  onClick={() => handleInteraction(option)}
                  className={`w-full bg-gradient-to-r ${colors[option.type]} hover:opacity-80 border-2 rounded-xl py-3 px-4 flex items-center gap-3 transition-all text-left`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <p className="text-white">{option.text}</p>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 rounded-xl py-3 transition-colors text-gray-300"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}