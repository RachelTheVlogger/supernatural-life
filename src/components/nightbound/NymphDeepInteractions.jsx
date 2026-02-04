import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Sparkles, Droplets, Flower, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function NymphDeepInteractions({ nymph, partner, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const getAlignmentDialogue = () => {
    const alignment = nymph.alignment || 'pure';
    
    if (alignment === 'pure') {
      return {
        deep_talk: [
          `You and ${partner.displayName} talk about purity. Light. Healing. "You make the world better," they say. You try. Every day.`,
          `"I want to protect everyone," you confess. ${partner.displayName} smiles. "That's why I love you." Pure. Simple. True.`,
          `Deep talk by the spring. ${partner.displayName} sees your light. Your goodness. Chooses it. Chooses you.`
        ],
        romance: [
          `${partner.displayName} kissed you softly. Gentle. Pure. Magic sparkled around you both. Nature approved. Beautiful.`,
          `You made flowers bloom around ${partner.displayName}. They laughed. Joy. You kissed. Sweet. Innocent. Perfect.`,
          `Tender intimacy. ${partner.displayName} touched you with reverence. "You're sacred," they whispered. You felt it. Blessed.`
        ]
      };
    } else if (alignment === 'corrupted') {
      return {
        deep_talk: [
          `You told ${partner.displayName} about the darkness seeping in. Corruption. They held you. "I'll stay even if you fall."`,
          `"I'm not pure anymore," you confess. ${partner.displayName} kissed you. "Good. Pure is boring." Corruption feels... good. With them.`,
          `Dark conversation. You speak of power gained through corruption. ${partner.displayName} understands. Encourages it. Dangerous. Thrilling.`
        ],
        romance: [
          `${partner.displayName} kissed you hungrily. No gentle touches. Raw. Intense. Corruption made you bolder. They loved it.`,
          `You pulled ${partner.displayName} into dark waters. Intense. Overwhelming. Neither pure nor evil. Just... passion. Consuming.`,
          `Corrupted magic during intimacy. ${partner.displayName} felt it. Power. Darkness. They didn't pull away. They leaned in.`
        ]
      };
    } else {
      return {
        deep_talk: [
          `Balanced talk with ${partner.displayName}. You're neither saint nor demon. Just... yourself. They love that. All of you.`,
          `"Light and dark," ${partner.displayName} says. "You contain both." You do. Balance is hard. But worth it. For them.`,
          `You shared your struggles. Staying balanced. ${partner.displayName} listened. Understood. "You're doing great."Believed them.`
        ],
        romance: [
          `${partner.displayName} loves both sides of you. Gentle moments and intense passion. Balance in everything. Perfect.`,
          `You made love by the water. Sometimes tender. Sometimes wild. ${partner.displayName} matched your energy. Balanced. Beautiful.`,
          `Intimacy with ${partner.displayName}. They appreciate your complexity. Love your contradictions. All of you. Always.`
        ]
      };
    }
  };

  const alignmentDialogue = getAlignmentDialogue();

  const actions = [
    {
      id: 'deep_talk',
      icon: MessageCircle,
      label: 'Deep Conversation',
      color: 'from-blue-900/60 to-cyan-900/60',
      outcomes: alignmentDialogue.deep_talk,
      statChanges: { trust: [8, 15], purity: [2, 5] }
    },
    {
      id: 'heal',
      icon: Droplets,
      label: 'Heal Them',
      color: 'from-green-900/60 to-teal-900/60',
      outcomes: [
        `You placed hands on ${partner.displayName}. Healing water flowed. Their pain vanished. "You're a miracle," they breathed.`,
        `Purification ritual. You cleansed ${partner.displayName}'s wounds. Body. Mind. Soul. They're whole again. Because of you.`,
        `Your touch healed everything. ${partner.displayName} stared in wonder. "How?" You smiled. "Nature provides."`
      ],
      statChanges: { purity: [5, 10], connection: [3, 7] }
    },
    {
      id: 'garden',
      icon: Flower,
      label: 'Create Garden Together',
      color: 'from-pink-900/60 to-purple-900/60',
      outcomes: [
        `You and ${partner.displayName} planted seeds. Magic and love. Flowers bloomed instantly. Your garden. Together.`,
        `Creating beauty side by side. ${partner.displayName} helped you. Clumsy but earnest. The garden grew. So did your bond.`,
        `Shared creation. ${partner.displayName}'s hands in the earth. Your magic in the soil. Life bloomed. Perfect partnership.`
      ],
      statChanges: { connection: [8, 15], desire: [5, 10] }
    }
  ];

  if (nymph.boundaries_discussed && nymph.trust >= 70 && nymph.desire >= 60) {
    actions.push({
      id: 'romance',
      icon: Heart,
      label: 'Romantic Moment',
      color: 'from-red-900/60 to-pink-900/60',
      outcomes: alignmentDialogue.romance,
      statChanges: { desire: [10, 20], intimacy: [15, 25] }
    });
  }

  const handleBoundaries = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const text = `Serious talk with ${partner.displayName}. "We need boundaries. Consent. Communication." They appreciated your care. Trust bloomed. Connection deepened.`;
      
      setOutcome(text);

      await base44.entities.WaterNymph.update(nymph.id, {
        boundaries_discussed: true,
        trust: Math.min(100, (nymph.trust || 60) + 20),
        connection: Math.min(100, (nymph.connection || 50) + 15)
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
        className="bg-gradient-to-br from-teal-950 to-green-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-500/50"
      >
        <h2 className="text-2xl font-bold text-white mb-4">With {partner.displayName}</h2>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-black/40 rounded-lg p-2 border border-teal-500/20">
            <p className="text-teal-400 text-xs">Purity</p>
            <p className="text-white text-sm font-bold">{nymph.purity || 100}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-purple-500/20">
            <p className="text-purple-400 text-xs">Corruption</p>
            <p className="text-white text-sm font-bold">{nymph.corruption || 0}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-green-500/20">
            <p className="text-green-400 text-xs">Connection</p>
            <p className="text-white text-sm font-bold">{nymph.connection || 50}</p>
          </div>
        </div>

        {outcome ? (
          <div className="py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-teal-500/30"
            >
              <p className="text-teal-100 text-sm leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <p className="text-teal-300">Interacting...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={async () => {
                  if (action.id === 'boundaries') {
                    handleBoundaries();
                    return;
                  }

                  setProcessing(true);

                  setTimeout(async () => {
                    const result = action.outcomes[Math.floor(Math.random() * action.outcomes.length)];
                    setOutcome(result);

                    const updates = {};
                    if (action.statChanges) {
                      Object.keys(action.statChanges).forEach(stat => {
                        const change = Math.floor(Math.random() * (action.statChanges[stat][1] - action.statChanges[stat][0] + 1)) + action.statChanges[stat][0];
                        const currentVal = nymph[stat] || (stat === 'purity' ? 100 : stat === 'corruption' ? 0 : 50);
                        updates[stat] = Math.max(0, Math.min(100, currentVal + change));
                      });
                    }

                    await base44.entities.WaterNymph.update(nymph.id, updates);

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
                className={`bg-gradient-to-r ${action.color} border-2 border-teal-500/30 rounded-xl p-4 text-left transition-all hover:scale-105 disabled:opacity-50`}
              >
                <div className="flex items-start gap-3">
                  <action.icon className="w-6 h-6 text-white flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{action.label}</h4>
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