import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Heart, Coffee, Eye, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function ServantInteractions({ servants, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedPair, setSelectedPair] = useState(null);
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');

  // Get pronoun helpers
  const getPronouns = () => {
    if (vampireState.gender === 'female') return { subject: 'she', object: 'her', possessive: 'her' };
    if (vampireState.gender === 'custom') return { subject: 'they', object: 'them', possessive: 'their' };
    return { subject: 'he', object: 'him', possessive: 'his' };
  };
  const pronouns = getPronouns();

  const interactions = [
    { 
      id: 'vampire-talk',
      icon: Sparkles,
      label: 'Talk about the vampire',
      outcomes: {
        positive: [
          `"Living with ${pronouns.object}... it's incredible. I never want to leave."`,
          `"${pronouns.subject === 'they' ? 'They are' : pronouns.subject === 'she' ? 'She\'s' : 'He\'s'} everything. I'd die for ${pronouns.object}."`,
          `"The way ${pronouns.subject} looks at me... I feel alive. Ironically."`,
          `"I love serving ${pronouns.object}. Every moment is a gift."`,
          `"${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} presence... intoxicating. Addictive."`,
        ],
        neutral: [
          `"It's... different. Living with a vampire."`,
          `"Some nights are better than others."`,
          `"I'm still getting used to all of this."`,
        ],
        negative: [
          `"Sometimes I wonder if ${pronouns.subject} even sees me."`,
          `"I want ${pronouns.possessive} attention. Not yours."`,
          `"Why do you get more time with ${pronouns.object}?"`,
          `"I should be ${pronouns.possessive} favorite. Not you."`,
        ]
      }
    },
    { 
      id: 'chat', 
      icon: MessageCircle, 
      label: 'Let them talk',
      outcomes: {
        positive: [
          'They bonded over their shared devotion to you.',
          'They laughed together. Growing closer.',
          'They shared stories. Understanding each other better.',
          'A friendship forming between your servants.',
        ],
        neutral: [
          'They talked. Nothing special.',
          'Small talk. Polite. Distant.',
          'They exchanged words. Neither impressed.',
        ],
        negative: [
          'Tension. They don\'t like each other.',
          'Jealousy brewing. Both want your attention.',
          'They argued. About you. Always about you.',
          'Competition. Rivalry. Possessiveness.',
        ]
      }
    },
    { 
      id: 'bond', 
      icon: Heart, 
      label: 'Encourage bonding',
      outcomes: {
        positive: [
          'They embraced. Your servants becoming allies.',
          'Understanding bloomed. They accept each other.',
          'United in their devotion. A bond formed.',
          'They swore to support each other. For you.',
        ],
        neutral: [
          'They tried. Still awkward.',
          'Forced smiles. Polite distance remains.',
          'Some progress. But walls still up.',
        ],
        negative: [
          'They resent this. Both want you alone.',
          'Jealousy intensified. This made it worse.',
          'They pretended. But hatred festers.',
        ]
      }
    },
    {
      id: 'observe',
      icon: Eye,
      label: 'Watch them interact',
      outcomes: {
        positive: [
          'They didn\'t know you were watching. Natural chemistry.',
          'You saw them laugh together. Genuine connection.',
          'They spoke fondly of you. Both admiring.',
          'Comfortable with each other. Good.',
        ],
        neutral: [
          'They kept their distance. Professional.',
          'Polite nods. Nothing more.',
          'They coexist. That\'s all.',
        ],
        negative: [
          'You saw the glares. The tension.',
          'They compete for your attention. Obviously.',
          'Silent hostility. They can\'t hide it.',
          'One clearly jealous of the other.',
        ]
      }
    },
    {
      id: 'together',
      icon: Sparkles,
      label: 'Spend time together (all 3)',
      outcomes: {
        positive: [
          'A perfect night. You with both of them.',
          'They learned to share you. Reluctantly. But they did.',
          'Together, the three of you felt complete.',
          'They competed for your affection. You enjoyed every moment.',
          'Your attention divided. Both satisfied.',
        ],
        neutral: [
          'Awkward. But manageable.',
          'They tolerated each other. For you.',
          'Not perfect. But it worked.',
        ],
        negative: [
          'They fought over you. Right in front of you.',
          'Jealousy exploded. This was a mistake.',
          'One stormed off. Furious.',
          'They can\'t share you. Not yet.',
        ]
      }
    },
  ];

  const handleInteraction = async (interactionId) => {
    setInteracting(true);
    
    setTimeout(async () => {
      const [servant1, servant2] = selectedPair;
      const interaction = interactions.find(i => i.id === interactionId);
      
      // Determine outcome based on relationship levels
      const avgRel = ((servant1.relationship || 0) + (servant2.relationship || 0)) / 2;
      const jealousy1 = servant1.jealousy_level || 0;
      const jealousy2 = servant2.jealousy_level || 0;
      const avgJealousy = (jealousy1 + jealousy2) / 2;
      
      let outcomeType;
      if (avgJealousy > 60 || avgRel < 30) {
        outcomeType = 'negative';
      } else if (avgRel > 70 && avgJealousy < 30) {
        outcomeType = 'positive';
      } else {
        outcomeType = 'neutral';
      }
      
      const outcomeText = interaction.outcomes[outcomeType][
        Math.floor(Math.random() * interaction.outcomes[outcomeType].length)
      ];
      
      setOutcome(outcomeText);
      
      // Update jealousy based on outcome
      let jealousyChange = 0;
      if (outcomeType === 'positive') {
        jealousyChange = -5;
      } else if (outcomeType === 'negative') {
        jealousyChange = 5;
      }
      
      try {
        await Promise.all([
          base44.entities.Servant.update(servant1.id, {
            jealousy_level: Math.max(0, Math.min(100, (servant1.jealousy_level || 0) + jealousyChange))
          }),
          base44.entities.Servant.update(servant2.id, {
            jealousy_level: Math.max(0, Math.min(100, (servant2.jealousy_level || 0) + jealousyChange))
          })
        ]);
        
        // Relationship bonus for spending time together
        if (interactionId === 'together' && outcomeType !== 'negative') {
          await Promise.all([
            base44.entities.Servant.update(servant1.id, {
              relationship: Math.min(100, (servant1.relationship || 0) + 5)
            }),
            base44.entities.Servant.update(servant2.id, {
              relationship: Math.min(100, (servant2.relationship || 0) + 5)
            })
          ]);
        }
      } catch (e) {
        console.error('Failed to update servants:', e);
      }
      
      await base44.entities.NightLog.create({
        entry: `${servant1.name} and ${servant2.name}: ${outcomeText}`,
        category: 'interaction',
        intensity: outcomeType === 'negative' ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
        setSelectedPair(null);
      }, 3000);
    }, 2000);
  };

  const getServantPairs = () => {
    const pairs = [];
    for (let i = 0; i < servants.length; i++) {
      for (let j = i + 1; j < servants.length; j++) {
        pairs.push([servants[i], servants[j]]);
      }
    }
    return pairs;
  };

  const pairs = getServantPairs();

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Servant Interactions</h2>
        <p className="text-gray-400 text-sm mb-6">Your servants together. Watch them. Guide them. Control them.</p>

        {!selectedPair ? (
          <div className="space-y-3">
            <h3 className="text-white font-medium mb-3">Select servants to interact:</h3>
            {pairs.map(([s1, s2], i) => {
              const avgJealousy = ((s1.jealousy_level || 0) + (s2.jealousy_level || 0)) / 2;
              const relationStatus = avgJealousy > 60 ? '⚠️ High tension' : avgJealousy > 30 ? '😐 Neutral' : '✓ Good dynamic';
              
              return (
                <button
                  key={`${s1.id}-${s2.id}`}
                  onClick={() => setSelectedPair([s1, s2])}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👥</span>
                      <div>
                        <p className="text-white font-medium">{s1.name} & {s2.name}</p>
                        <p className="text-gray-400 text-sm">
                          {s1.variant} • {s2.variant}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{relationStatus}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{s1.name} jealousy: {s1.jealousy_level || 0}%</span>
                    <span>{s2.name} jealousy: {s2.jealousy_level || 0}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-lg"
            >
              {outcome}
            </motion.p>
          </div>
        ) : interacting ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              ...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedPair(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h3 className="text-white text-xl font-bold mb-4">
              {selectedPair[0].name} & {selectedPair[1].name}
            </h3>

            {interactions.map(interaction => (
              <button
                key={interaction.id}
                onClick={() => handleInteraction(interaction.id)}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <interaction.icon className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="text-white font-medium">{interaction.label}</h4>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}