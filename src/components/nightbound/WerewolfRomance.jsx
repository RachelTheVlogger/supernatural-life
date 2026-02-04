import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Moon, Swords, Zap, X, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DIALOGUE_TREES = {
  lone_wolf: [
    {
      trust: 0,
      dialogues: [
        "You keep your distance. Werewolves are solitary creatures.",
        "There's something wild about them. Untamed. Dangerous.",
        "They watch you with predatory eyes. What do they want?"
      ]
    },
    {
      trust: 30,
      dialogues: [
        "They seem... interested. The way they look at you has changed.",
        "You catch them watching you in the shadows. Is that longing?",
        "They move closer. The air between you crackles with tension."
      ]
    },
    {
      trust: 60,
      dialogues: [
        "'I don't usually do this,' they admit. 'Getting close to someone. It's dangerous. I could hurt you.'",
        "'You make me want to be better. More human. Less beast.'",
        "'I've never felt like this before. It scares me more than the transformation.'"
      ]
    },
    {
      trust: 100,
      dialogues: [
        "'You're mine now. The pack knows it. I know it. Everything in me claims you as my mate.'",
        "'I love you. Wild. Fierce. Completely. That's the only way I know how.'",
        "'Stay with me. Through every transformation. Every hunt. Every moonlit night. Forever.'"
      ]
    }
  ],
  beta: [
    {
      trust: 0,
      dialogues: [
        "They're more open than lone wolves. Pack mentality. But still guarded.",
        "Curious. That's what they are. Curious about you.",
        "They approach with calculated interest."
      ]
    },
    {
      trust: 30,
      dialogues: [
        "'The alpha might have issues with this. Us.'",
        "'You'd have to understand what you're getting into. Pack dynamics. Pack bonds.'",
        "'Are you sure? Once I claim you, there's no going back.'"
      ]
    },
    {
      trust: 60,
      dialogues: [
        "'The pack sees you as mine. That's a position of power. And danger.'",
        "'I want to show you everything. My strength. My loyalty. My heart.'",
        "'You make me want to challenge for alpha. To build something just for us.'"
      ]
    },
    {
      trust: 100,
      dialogues: [
        "'You're my second. My equal. My mate in every way that matters.'",
        "'I'd stand against the entire pack for you. The entire world.'",
        "'Let me turn you. Make you like me. Be immortal at my side.'"
      ]
    }
  ],
  alpha: [
    {
      trust: 0,
      dialogues: [
        "The alpha doesn't usually fraternize with outsiders.",
        "They carry themselves with absolute authority.",
        "Their attention is intoxicating. Dangerous."
      ]
    },
    {
      trust: 30,
      dialogues: [
        "'You interest me. That's rare.'",
        "'I lead my pack with strength and control. But you... you make me want to lose that control.'",
        "'Others have tried to get close. None succeeded. You might be different.'"
      ]
    },
    {
      trust: 60,
      dialogues: [
        "'The pack respects strength. They respect that I chose you. That I want you.'",
        "'Every full moon, I transform. Every transformation, I think of you. Dream of you.'",
        "'I've never had weakness. Until you. Now I'd call it my greatest strength.'"
      ]
    },
    {
      trust: 100,
      dialogues: [
        "'You are my mate. My pack recognizes this. They serve you as they serve me.'",
        "'I will build an empire with you. Our bloodline will rule. Together.'",
        "'Bite me. Accept the venom. Become eternal. Become my equal. Become alpha queen/king with me.'"
      ]
    }
  ]
};

const BDSM_PREFERENCES = [
  { id: 'dominance', label: 'Dominance', icon: '👑', color: 'text-amber-400' },
  { id: 'submission', label: 'Submission', icon: '🙏', color: 'text-blue-400' },
  { id: 'possession', label: 'Possession', icon: '🔗', color: 'text-purple-400' },
  { id: 'claiming', label: 'Claiming/Marking', icon: '🐺', color: 'text-red-400' },
  { id: 'wild_passion', label: 'Wild Passion', icon: '🔥', color: 'text-orange-400' },
  { id: 'primal_instinct', label: 'Primal Instinct', icon: '⚡', color: 'text-yellow-400' },
  { id: 'protection', label: 'Protection', icon: '🛡️', color: 'text-cyan-400' },
  { id: 'trust_vulnerability', label: 'Trust & Vulnerability', icon: '💔', color: 'text-pink-400' }
];

export default function WerewolfRomance({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState('main');
  const [selectedAction, setSelectedAction] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showBDSMModal, setShowBDSMModal] = useState(false);

  const packRank = werewolf.pack_rank || 'lone_wolf';
  const currentDialogues = DIALOGUE_TREES[packRank] || DIALOGUE_TREES.lone_wolf;

  const getTrustDialogue = () => {
    const trust = werewolf.trust || 0;
    let dialogueGroup = currentDialogues[0];
    
    if (trust >= 100) dialogueGroup = currentDialogues[3];
    else if (trust >= 60) dialogueGroup = currentDialogues[2];
    else if (trust >= 30) dialogueGroup = currentDialogues[1];

    return dialogueGroup.dialogues[Math.floor(Math.random() * dialogueGroup.dialogues.length)];
  };

  const handleConversation = async () => {
    setProcessing(true);
    setStage('processing');

    setTimeout(async () => {
      const dialogue = getTrustDialogue();
      setOutcome(dialogue);

      const trustIncrease = 5;
      await base44.entities.Werewolf.update(werewolf.id, {
        trust: Math.min(100, (werewolf.trust || 0) + trustIncrease)
      });

      await base44.entities.NightLog.create({
        entry: `Werewolf (${werewolf.name}): ${dialogue}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setStage('main');
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleHunt = async () => {
    setProcessing(true);
    setStage('processing');

    setTimeout(async () => {
      const outcomes = [
        `You ran through the forest together, side by side. Their paws pounded the earth in rhythm with your heartbeat. The hunt was exhilarating. Primal. Perfect.`,
        `Under the moonlight, you chased prey together. They transformed mid-leap, moving with liquid grace. When they looked back at you, their eyes glowed amber with possessive hunger.`,
        `The hunt bonded you in ways words never could. Blood. Speed. The wild symphony of the forest. By the time you returned, they were looking at you like you were their greatest prize.`,
        `Running as one. Moving as one. Breathing as one. This is what they wanted you to understand. This is what pack meant. This is what mates were.`
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      const newTrust = Math.min(100, (werewolf.trust || 0) + 8);
      const newBond = Math.min(100, (werewolf.loyalty || 0) + 5);

      await base44.entities.Werewolf.update(werewolf.id, {
        trust: newTrust,
        loyalty: newBond,
        beast_rage: Math.max(0, (werewolf.beast_rage || 50) - 10)
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'high'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setStage('main');
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleTransformWatch = async () => {
    setProcessing(true);
    setStage('processing');

    setTimeout(async () => {
      const outcomes = [
        `You watched as their body twisted and reformed. Bones cracking. Fur erupting. It should be horrifying. But all you felt was awe. This was them. All of them. And they were beautiful.`,
        `The transformation was violent and beautiful. When the wolf emerged, they approached you slowly, recognizing you even in beast form. Their head rested against your chest.`,
        `Your hand stayed on their shoulder through the entire transformation. They growled, not in aggression, but in acknowledgment. Trust. You saw their humanity in those predatory eyes.`,
        `This act—allowing you to witness the transformation—was intimate beyond measure. They were showing you the deepest part of themselves. The wild. The dangerous. The irreplaceable.`
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      const newTrust = Math.min(100, (werewolf.trust || 0) + 12);

      await base44.entities.Werewolf.update(werewolf.id, {
        trust: newTrust,
        beast_rage: Math.max(0, (werewolf.beast_rage || 50) - 15)
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setStage('main');
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleClaimingRitual = async () => {
    setProcessing(true);
    setStage('processing');

    setTimeout(async () => {
      const outcomes = [
        `Their hands gripped your shoulders, possessive and claiming. "You're mine," they growled, voice dropping into something primal. They marked your neck with their teeth—not hard enough to draw blood, but hard enough to leave marks. Marks that said to the world: CLAIMED.`,
        `They stood over you, breathing heavily, eyes glowing. "I need to mark you. Make it so everyone knows." Their fangs grazed your skin as they moved along your neck, your shoulders, your inner wrist. Each mark was a declaration of ownership. Of love. Of forever.`,
        `"Let me claim you properly," they whispered. They scented you like an animal, moving along your body with their face against your skin. When they finally bit down—careful not to break skin but hard enough to bruise—you felt the completeness of it. This was pack bonding. This was mating ritual.`,
        `Their hands and teeth mapped your body, marking you in places only you would know. Under your clothes. Hidden from the world but intimate beyond measure. "Mine," they kept whispering. "Forever mine."`
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      const newIntimacy = Math.min(100, (werewolf.intimacy_level || 0) + 15);

      await base44.entities.Werewolf.update(werewolf.id, {
        intimacy_level: newIntimacy,
        trust: Math.min(100, (werewolf.trust || 0) + 5)
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'intimacy',
        intensity: 'high'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setStage('main');
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleTurning = async () => {
    setProcessing(true);
    setStage('processing');

    setTimeout(async () => {
      const outcomes = [
        `"I want to turn you," they whispered against your skin. "Make you immortal. Make you like me. Make you pack." Their fangs extended as they positioned themselves over your neck. "Say yes. Say you want this."`,
        `Their eyes glowed with predatory hunger as they held you close. "The bite. The venom. It will change you. Transform you. You'll be stronger. Faster. Ours forever." They waited, fangs ready, for your consent.`,
        `"Become my mate in every way," they growled. "Take my bite. Take my venom. Join the pack not as human but as werewolf. As MY werewolf." The hunger in their voice was intoxicating.`,
        `"I can't claim you completely as long as you're human," they admitted. "Turn. Let me turn you. Let us be equals in the hunt. In the transformation. In everything."`
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      const newTrust = Math.min(100, (werewolf.trust || 0) + 10);

      await base44.entities.Werewolf.update(werewolf.id, {
        trust: newTrust,
        intimacy_level: Math.min(100, (werewolf.intimacy_level || 0) + 20)
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'intimacy',
        intensity: 'extreme'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setStage('main');
        setOutcome('');
      }, 4000);
    }, 2000);
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
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-amber-500/50"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-200 text-lg leading-relaxed italic"
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
          <span className="text-4xl">🐺</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-amber-950 to-orange-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-amber-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Moon className="w-6 h-6 text-amber-400" />
            {werewolf.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 border border-amber-500/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Trust</p>
              <p className="text-amber-400 font-bold text-lg">{werewolf.trust || 0}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Beast Rage</p>
              <p className="text-orange-400 font-bold text-lg">{werewolf.beast_rage || 50}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Intimacy</p>
              <p className="text-red-400 font-bold text-lg">{werewolf.intimacy_level || 0}%</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleConversation}
            disabled={processing}
            className="w-full bg-gradient-to-r from-amber-900/60 to-orange-900/60 hover:from-amber-900/80 hover:to-orange-900/80 border-2 border-amber-500/50 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
          >
            <Heart className="w-5 h-5 text-amber-400" />
            <div className="flex-1 text-left">
              <h3 className="text-white font-medium">Talk</h3>
              <p className="text-amber-300 text-sm">Have an intimate conversation.</p>
            </div>
          </button>

          {(werewolf.trust || 0) >= 30 && (
            <button
              onClick={handleHunt}
              disabled={processing}
              className="w-full bg-gradient-to-r from-red-900/60 to-orange-900/60 hover:from-red-900/80 hover:to-orange-900/80 border-2 border-red-500/50 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
            >
              <Swords className="w-5 h-5 text-red-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Hunt Together</h3>
                <p className="text-red-300 text-sm">Bond through the primal experience.</p>
              </div>
            </button>
          )}

          {(werewolf.trust || 0) >= 40 && (
            <button
              onClick={handleTransformWatch}
              disabled={processing}
              className="w-full bg-gradient-to-r from-yellow-900/60 to-amber-900/60 hover:from-yellow-900/80 hover:to-amber-900/80 border-2 border-yellow-500/50 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Watch Transformation</h3>
                <p className="text-yellow-300 text-sm">Witness their true nature.</p>
              </div>
            </button>
          )}

          {(werewolf.trust || 0) >= 60 && (
            <button
              onClick={handleClaimingRitual}
              disabled={processing}
              className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Claiming Ritual</h3>
                <p className="text-purple-300 text-sm">Let them mark you as theirs.</p>
              </div>
            </button>
          )}

          {(werewolf.intimacy_level || 0) >= 40 && (
            <button
              onClick={() => setShowBDSMModal(true)}
              disabled={processing}
              className="w-full bg-gradient-to-r from-pink-900/60 to-red-900/60 hover:from-pink-900/80 hover:to-red-900/80 border-2 border-pink-500/50 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
            >
              <Heart className="w-5 h-5 text-pink-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Discuss Preferences</h3>
                <p className="text-pink-300 text-sm">Explore desires together.</p>
              </div>
            </button>
          )}

          {(werewolf.trust || 0) >= 80 && (
            <button
              onClick={handleTurning}
              disabled={processing}
              className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-900/80 hover:to-purple-900/80 border-2 border-indigo-500/50 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">The Turning</h3>
                <p className="text-indigo-300 text-sm">Become one with the pack forever.</p>
              </div>
            </button>
          )}
        </div>

        {/* BDSM Modal */}
        <AnimatePresence>
          {showBDSMModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90"
              onClick={() => setShowBDSMModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-amber-950 to-orange-950 rounded-2xl p-6 max-w-md w-full border-2 border-amber-500/50"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Primal Desires</h3>
                <p className="text-amber-300 text-sm mb-6">What calls to the beast in you both?</p>
                
                <div className="space-y-2 mb-6">
                  {BDSM_PREFERENCES.map(pref => (
                    <button
                      key={pref.id}
                      onClick={() => setShowBDSMModal(false)}
                      className="w-full bg-black/40 hover:bg-black/60 rounded-lg p-3 text-left border border-amber-500/30 transition-all"
                    >
                      <span className={`text-lg ${pref.color} mr-3`}>{pref.icon}</span>
                      <span className="text-white font-medium">{pref.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowBDSMModal(false)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}