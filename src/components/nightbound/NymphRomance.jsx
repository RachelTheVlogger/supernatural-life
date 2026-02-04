import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, Droplets, Flower } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import NymphRomanceExpanded from '@/components/nightbound/NymphRomanceExpanded';
import TitleSelector from '@/components/nightbound/TitleSelector';

const DIALOGUE_TREES = {
  pure: {
    initial: [
      { text: 'Your purity is beautiful. I want to honor it.', trust: 15, desire: 5 },
      { text: 'What made you so good in a broken world?', trust: 18, desire: 3 },
      { text: 'I\'ve never felt this safe with anyone.', trust: 20, desire: 8 }
    ],
    trust30: [
      { text: 'I want to protect you. Let me be your sanctuary.', trust: 15, desire: 12 },
      { text: 'You\'ve changed me. Made me want to be better.', trust: 18, desire: 15 },
      { text: 'This connection... it\'s healing something in me.', trust: 16, desire: 18 }
    ],
    trust60: [
      { text: 'You\'ve become everything to me. My whole world.', trust: 22, desire: 20 },
      { text: 'I want to spend forever with you. Building something sacred.', trust: 25, desire: 18 },
      { text: 'You don\'t realize how much you\'ve transformed me.', trust: 28, desire: 22 }
    ],
    intimacy: [
      { text: 'Take me gently. I trust you completely.', bdsm: 'vanilla', desire: 25 },
      { text: 'Make love to me like I\'m sacred to you.', bdsm: 'vanilla', desire: 28 },
      { text: 'I want to feel you. All of you. Tenderly.', bdsm: 'vanilla', desire: 30 },
      { text: 'Teach me. I want to learn how to love you with my whole being.', bdsm: 'vanilla', desire: 32 }
    ]
  },
  balanced: {
    initial: [
      { text: 'You\'re interesting. Complex. I want to know you deeper.', trust: 8, desire: 10 },
      { text: 'There\'s something magnetic about you.', trust: 5, desire: 12 },
      { text: 'Water recognizes water. We\'re kin in some way.', trust: 10, desire: 8 }
    ],
    trust30: [
      { text: 'I\'m comfortable being vulnerable with you.', trust: 15, desire: 15 },
      { text: 'You balance my nature perfectly. Light and shadow.', trust: 12, desire: 18 },
      { text: 'This is what I\'ve been searching for.', trust: 18, desire: 20 }
    ],
    trust60: [
      { text: 'I feel complete with you. Like I\'ve found my other half.', trust: 20, desire: 25 },
      { text: 'Stay. Promise me you\'ll always stay.', trust: 25, desire: 22 },
      { text: 'I\'m ready to give you all of me. Everything I am.', trust: 28, desire: 28 }
    ],
    intimacy: [
      { text: 'Kiss me. Show me what you\'ve been holding back.', bdsm: 'switch', desire: 28 },
      { text: 'I want to explore this with you. No limits.', bdsm: 'switch', desire: 30 },
      { text: 'Take me somewhere between gentle and wild.', bdsm: 'switch', desire: 32 },
      { text: 'I want to discover every way you can make me feel alive.', bdsm: 'switch', desire: 35 }
    ]
  },
  corrupted: {
    initial: [
      { text: 'Your darkness is intoxicating. I want more.', trust: -5, desire: 20 },
      { text: 'Show me what corruption looks like on you.', trust: -8, desire: 18 },
      { text: 'Let\'s drown in this together.', trust: -3, desire: 22 }
    ],
    trust30: [
      { text: 'I\'m falling into this abyss with you willingly.', trust: 8, desire: 25 },
      { text: 'Corruption is just another form of truth.', trust: 5, desire: 28 },
      { text: 'Take me deeper. I want to lose myself in you.', trust: 10, desire: 30 }
    ],
    trust60: [
      { text: 'I\'m losing myself in your darkness and I don\'t want to be found.', trust: 12, desire: 35 },
      { text: 'Transform me completely. I want to become like you.', trust: 15, desire: 38 },
      { text: 'We\'re going to burn everything down together.', trust: 18, desire: 40 }
    ],
    intimacy: [
      { text: 'I surrender to your darkness. Use me.', bdsm: 'submissive', desire: 35 },
      { text: 'Make me feel the power of your corruption.', bdsm: 'submissive', desire: 32 },
      { text: 'Drown me in your desires. I beg you.', bdsm: 'submissive', desire: 38 },
      { text: 'Break me. Remake me into what you want me to be.', bdsm: 'submissive', desire: 42 }
    ]
  }
};

const BDSM_PREFERENCES = [
  { label: 'Vanilla (Pure)', value: 'vanilla', color: 'green' },
  { label: 'Submissive', value: 'submissive', color: 'blue' },
  { label: 'Dominant', value: 'dominant', color: 'purple' },
  { label: 'Switch', value: 'switch', color: 'emerald' },
  { label: 'Sensual', value: 'sensual', color: 'pink' }
];

export default function NymphRomance({ nymph, onClose }) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState('menu');
  const [selectedDialogue, setSelectedDialogue] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);

  const alignment = nymph.alignment || 'balanced';
  const trust = nymph.trust || 60;
  const desire = nymph.desire || 30;
  const intimacy = nymph.intimacy_level || 0;

  const getDialogueOptions = () => {
    const tree = DIALOGUE_TREES[alignment] || DIALOGUE_TREES.balanced;
    
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
        pure: {
          tender: [
            'Your kindness heals me. In you I find my sanctuary.',
            'I feel safe in a way I never have before. With you.',
            'You\'re home. You\'ve always been home.'
          ],
          intimate: [
            'Yes. Take me. Show me what love truly means.',
            'I\'m yours. Completely. Utterly.',
            'This is sacred. This is everything.'
          ]
        },
        balanced: {
          connected: [
            'We complete each other. The way water completes water.',
            'This feels like destiny. Like you were always meant to find me.',
            'I\'m giving you my heart. Guard it well.'
          ],
          intimate: [
            'I want you. I need you. All of you.',
            'Let\'s burn together. Beautifully.',
            'Take what you need. I\'m here for you.'
          ]
        },
        corrupted: {
          dark: [
            'Your corruption calls to mine. We\'re perfect together.',
            'Drown me. I want to disappear into you.',
            'Let\'s become monsters. Together.'
          ],
          intimate: [
            'Break me. Remake me in your image.',
            'Yes. Yes. Take everything from me.',
            'I\'m yours to corrupt. Completely.'
          ]
        }
      };

      const responseType = intimacy >= 75 ? 'intimate' : alignment === 'pure' ? 'tender' : alignment === 'corrupted' ? 'dark' : 'connected';
      const responseList = responses[alignment]?.[responseType] || ['...'];
      const response = responseList[Math.floor(Math.random() * responseList.length)];

      setOutcome(response);

      const updates = {
        trust: Math.min(100, Math.max(0, (trust || 0) + (option.trust || 0))),
        desire: Math.min(100, (desire || 0) + (option.desire || 0))
      };

      if (intimacy >= 75 && option.desire) {
        updates.intimacy_level = Math.min(100, intimacy + 15);
      }

      await base44.entities.WaterNymph.update(nymph.id, updates);

      await base44.entities.NightLog.create({
        entry: `Deep conversation with ${nymph.name}. ${response}`,
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

      await base44.entities.WaterNymph.update(nymph.id, updates);

      await base44.entities.NightLog.create({
        entry: `You discussed boundaries and desires with ${nymph.name}. ${selectedPreference || 'Pure connection.'}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome('Boundaries shared. Trust deepened.');

      setTimeout(() => {
        setProcessing(false);
        setShowBoundaries(false);
        setOutcome('');
      }, 2000);
    }, 2000);
  };

  const handleIntimate = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const vampireStates = await base44.entities.VampireState.list();
      const vampireState = vampireStates[0];
      const isLiteMode = vampireState?.content_filter === 'lite';

      const scenarios = {
        pure: {
          locations: ['in sacred waters', 'beneath the moonlight', 'in the grove'],
          intense: isLiteMode ? [
            'Sacred union beneath starlight. Two becoming one. Perfect.',
            'Gentle. Reverent. This is love made manifest.',
            'You make love to her soul. Tender. True. Forever.'
          ] : [
            'She gasps as you enter her tenderly. Sacred. Holy.',
            'Slow movements. Deep kisses. Complete vulnerability.',
            'Water and soul entwined. She cries your name in ecstasy.'
          ]
        },
        balanced: {
          locations: ['where waters meet', 'on soft moss', 'beneath ancient trees'],
          intense: isLiteMode ? [
            'Wild and tender. You match her perfectly. Passionate.',
            'Bodies moving together like water finding its course.',
            'She shudders against you. Both of you lost in sensation.'
          ] : [
            'Passionate and deliberate. She wraps around you completely.',
            'Your bodies move together in perfect rhythm.',
            'She moans your name as pleasure builds between you.'
          ]
        },
        corrupted: {
          locations: ['in dark waters', 'where shadows pool', 'in the abyss together'],
          intense: isLiteMode ? [
            'Dark passion. Dangerous. Addictive.',
            'You consume each other in shadow and desire.',
            'Lost in depravity together. Perfect monsters.'
          ] : [
            'Rough. Hungry. She claws at you, desperate.',
            'You take her hard, and she meets every thrust.',
            'She screams as you push her toward ecstasy.'
          ]
        }
      };

      const config = scenarios[alignment] || scenarios.balanced;
      const location = config.locations[Math.floor(Math.random() * config.locations.length)];
      const baseText = config.intense[Math.floor(Math.random() * config.intense.length)];
      const text = `${baseText} (${location})`;

      setOutcome(text);

      const updates = {
        intimacy_level: 100,
        trust: Math.min(100, (trust || 0) + 15),
        desire: Math.min(100, (desire || 0) + 20),
        relationship_status: 'serious',
        healing_services_performed: (nymph.healing_services_performed || 0) + 1
      };

      await base44.entities.InteractionMemory.create({
        entity_1_id: nymph.id,
        entity_1_type: 'nymph',
        entity_2_id: 'player',
        entity_2_type: 'player',
        interaction_type: 'romance',
        description: text,
        relationship_impact: 30
      });

      await base44.entities.WaterNymph.update(nymph.id, updates);

      await base44.entities.NightLog.create({
        entry: `You became intimate with ${nymph.name}. ${text}`,
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
        className="bg-gradient-to-br from-teal-950 to-green-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-teal-400" />
            {nymph.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 border border-teal-500/30">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-teal-300 text-xs mb-1">Trust</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  style={{ width: `${trust}%` }}
                  className="h-2 bg-gradient-to-r from-teal-500 to-green-500 rounded"
                />
              </div>
              <p className="text-white text-sm font-bold mt-1">{trust}</p>
            </div>
            <div>
              <p className="text-teal-300 text-xs mb-1">Desire</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  style={{ width: `${desire}%` }}
                  className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded"
                />
              </div>
              <p className="text-white text-sm font-bold mt-1">{desire}</p>
            </div>
            <div>
              <p className="text-teal-300 text-xs mb-1">Intimacy</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  style={{ width: `${intimacy}%` }}
                  className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded"
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
            className="bg-black/60 rounded-xl p-6 mb-6 border border-teal-500/30"
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
        ) : stage === 'menu' ? (
          <div className="space-y-3">
            <button
              onClick={() => setStage('dialogue')}
              className="w-full bg-gradient-to-r from-teal-900/60 to-green-900/60 hover:from-teal-900/80 hover:to-green-900/80 border-2 border-teal-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Sparkles className="w-5 h-5 text-teal-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Deep Conversation</h3>
                <p className="text-teal-300 text-sm">Connect through nature.</p>
              </div>
            </button>

            <button
              onClick={() => setShowBoundaries(true)}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-teal-900/60 hover:from-cyan-900/80 hover:to-teal-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-cyan-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Discuss Boundaries</h3>
                <p className="text-cyan-300 text-sm">{nymph.boundaries_discussed ? 'Already discussed' : 'Talk about consent & desires.'}</p>
              </div>
            </button>

            {intimacy >= 75 && nymph.boundaries_discussed && (
              <button
                onClick={() => setStage('intimate')}
                className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Flower className="w-5 h-5 text-green-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">Become Intimate</h3>
                  <p className="text-green-300 text-sm">Sacred union.</p>
                </div>
              </button>
            )}

            {nymph.boundaries_discussed && (
              <button
                onClick={() => setStage('expanded')}
                className="w-full bg-gradient-to-r from-cyan-900/60 to-teal-900/60 hover:from-cyan-900/80 hover:to-teal-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Heart className="w-5 h-5 text-cyan-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">Romance Interactions</h3>
                  <p className="text-cyan-300 text-sm">Deepen your connection (dates, gifts, more).</p>
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
              className="text-teal-400 hover:text-teal-300 text-sm mb-3"
            >
              ← Back
            </button>
            {getDialogueOptions().map((option, i) => (
              <button
                key={i}
                onClick={() => handleDialogue(option)}
                className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-4 border border-teal-500/30 transition-all text-left"
              >
                <p className="text-teal-100">{option.text}</p>
              </button>
            ))}
          </div>
        ) : stage === 'intimate' ? (
          <div className="space-y-3">
            <button
              onClick={() => setStage('menu')}
              className="text-teal-400 hover:text-teal-300 text-sm mb-3"
            >
              ← Back
            </button>
            <button
              onClick={handleIntimate}
              className="w-full bg-gradient-to-r from-teal-900/60 to-green-900/60 hover:from-teal-900/80 hover:to-green-900/80 border-2 border-teal-500/50 rounded-xl py-4 px-6 transition-all"
            >
              <p className="text-white font-medium">Be With Her</p>
              <p className="text-teal-300 text-sm">Sacred connection awaits.</p>
            </button>
          </div>
        ) : stage === 'expanded' ? (
          <NymphRomanceExpanded nymph={nymph} onClose={() => setStage('menu')} />
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
                <h3 className="text-xl font-bold text-white mb-4">Intimacy Preferences</h3>
                <p className="text-gray-400 text-sm mb-4">What does {nymph.name} desire?</p>

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
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50"
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