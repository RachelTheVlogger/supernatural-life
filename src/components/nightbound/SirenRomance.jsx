import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Zap, Music, Waves } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import SirenRomanceExpanded from '@/components/nightbound/SirenRomanceExpanded';
import TitleSelector from '@/components/nightbound/TitleSelector';

const DIALOGUE_TREES = {
  predatory: {
    initial: [
      { text: 'Your prey looks delicious. Are they?', trust: -5, desire: 15 },
      { text: 'Tell me about your victims.', trust: -10, desire: 10 },
      { text: 'How many have you lured to their doom?', trust: -8, desire: 12 }
    ],
    trust30: [
      { text: 'Your darkness calls to mine. Intoxicating.', trust: 10, desire: 20 },
      { text: 'We could hunt together. Unstoppable.', trust: 8, desire: 18 },
      { text: 'Show me your true nature. Uncaged.', trust: 5, desire: 25 }
    ],
    trust60: [
      { text: 'I\'ve never wanted anyone the way I want you.', trust: 15, desire: 30 },
      { text: 'What would you do to keep me? I need to know you\'d burn the world.', trust: 12, desire: 28 },
      { text: 'Tell me you\'d kill for me. Tell me you\'d corrupt yourself.', trust: 10, desire: 32 }
    ],
    intimacy: [
      { text: 'Take what you want from me. No restraints.', bdsm: 'submissive', desire: 30 },
      { text: 'Drown me in your darkness. I want to feel you lose control.', bdsm: 'submissive', desire: 35 },
      { text: 'Let me consume you. Completely.', bdsm: 'dominant', desire: 28 },
      { text: 'Mark me. Make it clear I belong to you. Only you.', bdsm: 'submissive', desire: 38 }
    ]
  },
  neutral: {
    initial: [
      { text: 'You intrigue me. What secrets are you hiding?', trust: 5, desire: 8 },
      { text: 'Shall we see where this goes? No promises.', trust: 3, desire: 10 },
      { text: 'I\'m curious about you. Tell me something real.', trust: 8, desire: 5 }
    ],
    trust30: [
      { text: 'I think I\'m starting to trust you. Don\'t make me regret it.', trust: 15, desire: 12 },
      { text: 'You\'re not what I expected. In a good way.', trust: 12, desire: 15 },
      { text: 'There\'s something between us. I feel it too.', trust: 10, desire: 20 }
    ],
    trust60: [
      { text: 'You\'ve become someone I can\'t imagine losing.', trust: 18, desire: 25 },
      { text: 'Stay with me. Through everything. Forever.', trust: 20, desire: 22 },
      { text: 'I\'m letting you see the real me. The one I hide from everyone.', trust: 22, desire: 28 }
    ],
    intimacy: [
      { text: 'Kiss me. I want to feel something real.', bdsm: 'vanilla', desire: 25 },
      { text: 'Be gentle. I\'m more vulnerable than I let on.', bdsm: 'vanilla', desire: 20 },
      { text: 'Take control. But respect when I say stop.', bdsm: 'switch', desire: 28 },
      { text: 'I want to feel every part of you. Slowly. All night.', bdsm: 'switch', desire: 32 }
    ]
  },
  benevolent: {
    initial: [
      { text: 'Can I ask you something? What made you kind in a cruel world?', trust: 15, desire: 3 },
      { text: 'I want to be better. Can you help me?', trust: 20, desire: 5 },
      { text: 'You don\'t fear me. Why?', trust: 12, desire: 8 }
    ],
    trust30: [
      { text: 'I\'ve stopped hurting people. Because of you.', trust: 20, desire: 10 },
      { text: 'You make me want to be more than a predator.', trust: 18, desire: 12 },
      { text: 'I\'ve never felt this way. Safe. Seen.', trust: 22, desire: 15 }
    ],
    trust60: [
      { text: 'I love you. I\'ve never said that to anyone. I love you.', trust: 25, desire: 20 },
      { text: 'You saved me. From myself. From the monster I was becoming.', trust: 28, desire: 18 },
      { text: 'I want to build something with you. A life. A future.', trust: 30, desire: 22 }
    ],
    intimacy: [
      { text: 'Let me show you how much this means to me. Slowly. Tenderly.', bdsm: 'vanilla', desire: 22 },
      { text: 'I want to make love to you. Really love you.', bdsm: 'vanilla', desire: 25 },
      { text: 'I trust you completely. Do with me what you will.', bdsm: 'submissive', desire: 28 },
      { text: 'Make me feel your love in every touch. I\'m yours. Completely.', bdsm: 'vanilla', desire: 30 }
    ]
  }
};

const BDSM_PREFERENCES = [
  { label: 'Vanilla (Tender)', value: 'vanilla', color: 'pink' },
  { label: 'Submissive', value: 'submissive', color: 'blue' },
  { label: 'Dominant', value: 'dominant', color: 'red' },
  { label: 'Switch', value: 'switch', color: 'purple' },
  { label: 'Bondage', value: 'bondage', color: 'orange' }
];

export default function SirenRomance({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState('menu');
  const [selectedDialogue, setSelectedDialogue] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);

  const alignment = siren.alignment || 'neutral';
  const trust = siren.trust || 30;
  const desire = siren.desire || 40;
  const intimacy = siren.intimacy_level || 0;

  const getDialogueOptions = () => {
    const tree = DIALOGUE_TREES[alignment] || DIALOGUE_TREES.neutral;
    
    if (intimacy >= 75) {
      return tree.intimacy;
    } else if (trust >= 60) {
      return tree.trust60;
    } else if (trust >= 30) {
      return tree.trust30;
    } else {
      return tree.initial;
    }
  };

  const handleDialogue = async (option) => {
    setSelectedDialogue(option);
    setProcessing(true);

    setTimeout(async () => {
      const responses = {
        predatory: {
          negative: [
            'Your cruelty matches mine perfectly. I could devour you right now.',
            'Yes. We\'re monsters together. Perfect monsters.',
            'I want to drown in your darkness with you.'
          ],
          intimate: [
            'Take me. Mark me. Make me yours.',
            'I surrender completely to you. Own me.',
            'Yes. YES. Don\'t hold back.'
          ]
        },
        neutral: {
          curious: [
            'I\'m beginning to understand you. It\'s changing how I see everything.',
            'There\'s real connection here. Surprising.',
            'You\'re pulling me toward something I didn\'t expect.'
          ],
          intimate: [
            'This is what I needed. You. Us.',
            'Slow. Let me feel every moment with you.',
            'I\'m ready to give you all of me.'
          ]
        },
        benevolent: {
          redemption: [
            'I see who you\'re becoming. It\'s beautiful.',
            'Your heart is changing. I can feel it.',
            'Stay with me. Keep choosing this path.'
          ],
          intimate: [
            'I love you. Completely. Entirely.',
            'This is sacred. You\'re sacred to me.',
            'Let me show you how deeply I feel this.'
          ]
        }
      };

      const responseType = intimacy >= 75 ? 'intimate' : alignment === 'benevolent' ? 'redemption' : alignment === 'neutral' ? 'curious' : 'negative';
      const responseList = responses[alignment]?.[responseType] || ['...'];
      const response = responseList[Math.floor(Math.random() * responseList.length)];

      setOutcome(response);

      const updates = {
        trust: Math.min(100, (trust || 0) + (option.trust || 0)),
        desire: Math.min(100, (desire || 0) + (option.desire || 0))
      };

      if (intimacy >= 75 && option.desire) {
        updates.intimacy_level = Math.min(100, intimacy + 15);
      }

      await base44.entities.Siren.update(siren.id, updates);

      await base44.entities.NightLog.create({
        entry: `Deep conversation with ${siren.name}. ${response}`,
        category: 'interaction',
        intensity: intimacy >= 75 ? 'extreme' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        if (intimacy >= 75 && option.desire) {
          setStage('intimate');
        } else {
          setOutcome('');
          setSelectedDialogue(null);
        }
      }, 3000);
    }, 2000);
  };

  const handleBoundariesDiscussion = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const updates = {
        boundaries_discussed: true,
        bdsm_preferences: selectedPreference ? [selectedPreference] : [],
        trust: Math.min(100, (trust || 0) + 10),
        intimacy_level: Math.min(100, intimacy + 5)
      };

      await base44.entities.Siren.update(siren.id, updates);

      await base44.entities.NightLog.create({
        entry: `You discussed boundaries and consent with ${siren.name}. ${selectedPreference || 'Vanilla connection established.'}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome('Boundaries established. Trust deepened.');

      setTimeout(() => {
        setProcessing(false);
        setShowBoundaries(false);
        setOutcome('');
      }, 2000);
    }, 2000);
  };

  const handleIntimate = async (intensity) => {
    setProcessing(true);

    setTimeout(async () => {
      const vampireStates = await base44.entities.VampireState.list();
      const vampireState = vampireStates[0];
      const isLiteMode = vampireState?.content_filter === 'lite';

      const scenarios = {
        predatory: {
          locations: ['in the moonlit ocean', 'against the rocks', 'in the depths of her waters'],
          intense: isLiteMode ? [
            'Passion consumes you both. Claws. Fangs. Power. Dangerous. Exhilarating.',
            'You take her with predatory intensity. She matches your darkness perfectly.',
            'Raw. Primal. You lose yourself in her completely.'
          ] : [
            'Her nails rake your back as you claim her. She moans your name. Rough. Perfect.',
            'She pins you down, dominates you completely. You surrender. She controls it all.',
            'Tangled together, bodies moving in urgent rhythm. You both gasp as passion peaks.'
          ]
        },
        neutral: {
          locations: ['beneath starlight', 'on soft shore', 'where the waves meet sand'],
          intense: isLiteMode ? [
            'Tender. Connected. Bodies aligned. Breathing synchronized. Perfect.',
            'Gentle touches turn passionate. She whispers your name.',
            'Slow. Meaningful. Every touch feels like a promise.'
          ] : [
            'She gasps as you enter her. Slow at first, then building intensity.',
            'Wrapped together, moving in perfect rhythm. She cries out your name.',
            'Intimate. Real. You feel everything with her.'
          ]
        },
        benevolent: {
          locations: ['in sacred waters', 'under moonlight', 'in your sanctuary together'],
          intense: isLiteMode ? [
            'Love made manifest. Sacred union. Two becoming one.',
            'Gentle. Reverent. This is more than physical.',
            'You make love to her soul, not just her body.'
          ] : [
            'You make love to her slowly, reverently. Every moment sacred.',
            'She trembles beneath you as you kiss her tenderly. Passion builds slowly.',
            'Intimate. Vulnerable. You pour everything you feel into her.'
          ]
        }
      };

      const config = scenarios[alignment] || scenarios.neutral;
      const location = config.locations[Math.floor(Math.random() * config.locations.length)];
      const baseText = config.intense[Math.floor(Math.random() * config.intense.length)];
      const text = `${baseText} (${location})`;

      setOutcome(text);

      const updates = {
        intimacy_level: 100,
        trust: Math.min(100, (trust || 0) + 15),
        desire: Math.min(100, (desire || 0) + 20),
        relationship_status: 'serious'
      };

      if (alignment === 'benevolent') {
        updates.alignment = 'benevolent';
      }

      await base44.entities.InteractionMemory.create({
        entity_1_id: siren.id,
        entity_1_type: 'siren',
        entity_2_id: 'player',
        entity_2_type: 'player',
        interaction_type: 'romance',
        description: text,
        relationship_impact: 30
      });

      await base44.entities.Siren.update(siren.id, updates);

      await base44.entities.NightLog.create({
        entry: `You became intimate with ${siren.name}. ${text}`,
        category: 'interaction',
        intensity: 'extreme'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setStage('menu');
      }, 4000);
    }, 3000);
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
        className="bg-gradient-to-br from-pink-950 to-purple-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-pink-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400" />
            {siren.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 border border-pink-500/30">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-pink-300 text-xs mb-1">Trust</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  style={{ width: `${trust}%` }}
                  className="h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded"
                />
              </div>
              <p className="text-white text-sm font-bold mt-1">{trust}</p>
            </div>
            <div>
              <p className="text-pink-300 text-xs mb-1">Desire</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  style={{ width: `${desire}%` }}
                  className="h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded"
                />
              </div>
              <p className="text-white text-sm font-bold mt-1">{desire}</p>
            </div>
            <div>
              <p className="text-pink-300 text-xs mb-1">Intimacy</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  style={{ width: `${intimacy}%` }}
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded"
                />
              </div>
              <p className="text-white text-sm font-bold mt-1">{intimacy}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 rounded-xl p-6 mb-6 border border-pink-500/30"
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
        ) : stage === 'menu' ? (
          <div className="space-y-3">
            <button
              onClick={() => setStage('dialogue')}
              className="w-full bg-gradient-to-r from-pink-900/60 to-purple-900/60 hover:from-pink-900/80 hover:to-purple-900/80 border-2 border-pink-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Music className="w-5 h-5 text-pink-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Deep Conversation</h3>
                <p className="text-pink-300 text-sm">Connect emotionally.</p>
              </div>
            </button>

            <button
              onClick={() => setShowBoundaries(true)}
              className="w-full bg-gradient-to-r from-blue-900/60 to-purple-900/60 hover:from-blue-900/80 hover:to-purple-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-blue-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Discuss Boundaries</h3>
                <p className="text-blue-300 text-sm">{siren.boundaries_discussed ? 'Already discussed' : 'Talk about consent & desires.'}</p>
              </div>
            </button>

            {intimacy >= 75 && siren.boundaries_discussed && (
              <button
                onClick={() => setStage('intimate')}
                className="w-full bg-gradient-to-r from-red-900/60 to-pink-900/60 hover:from-red-900/80 hover:to-pink-900/80 border-2 border-red-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Waves className="w-5 h-5 text-red-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">Become Intimate</h3>
                  <p className="text-red-300 text-sm">Physical connection.</p>
                </div>
              </button>
            )}

            {siren.boundaries_discussed && (
              <button
                onClick={() => setStage('expanded')}
                className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Heart className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">Romance Interactions</h3>
                  <p className="text-purple-300 text-sm">Deepen your connection (dates, gifts, more).</p>
                </div>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-3 transition-colors text-gray-300"
            >
              Close
            </button>
          </div>
        ) : stage === 'dialogue' ? (
          <div className="space-y-3">
            <button
              onClick={() => setStage('menu')}
              className="text-pink-400 hover:text-pink-300 text-sm mb-3"
            >
              ← Back
            </button>
            {getDialogueOptions().map((option, i) => (
              <button
                key={i}
                onClick={() => handleDialogue(option)}
                className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-4 border border-pink-500/30 transition-all text-left"
              >
                <p className="text-pink-100">{option.text}</p>
              </button>
            ))}
          </div>
        ) : stage === 'intimate' ? (
          <div className="space-y-3">
            <button
              onClick={() => setStage('menu')}
              className="text-pink-400 hover:text-pink-300 text-sm mb-3"
            >
              ← Back
            </button>
            <button
              onClick={() => handleIntimate('tender')}
              className="w-full bg-gradient-to-r from-pink-900/60 to-red-900/60 hover:from-pink-900/80 hover:to-red-900/80 border-2 border-pink-500/50 rounded-xl py-4 px-6 transition-all"
            >
              <p className="text-white font-medium">Be With Her</p>
              <p className="text-pink-300 text-sm">Passion awaits.</p>
            </button>
          </div>
        ) : stage === 'expanded' ? (
          <SirenRomanceExpanded siren={siren} onClose={() => setStage('menu')} />
        ) : null}

        {/* Boundaries Modal */}
        <AnimatePresence>
          {showBoundaries && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 rounded-xl z-60 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-white mb-4">BDSM Preferences</h3>
                <p className="text-gray-400 text-sm mb-4">What does {siren.name} prefer?</p>

                <div className="space-y-2 mb-6">
                  {BDSM_PREFERENCES.map(pref => (
                    <button
                      key={pref.value}
                      onClick={() => setSelectedPreference(pref.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedPreference === pref.value
                          ? `bg-${pref.color}-900/60 border-${pref.color}-500`
                          : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <p className="text-white font-medium">{pref.label}</p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBoundaries(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBoundariesDiscussion}
                    disabled={!selectedPreference}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    Discuss
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}