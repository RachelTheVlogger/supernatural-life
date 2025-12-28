import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Heart, Coffee, Eye, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function ServantInteractions({ servants, vampireState, currentServant, onClose }) {
  const queryClient = useQueryClient();
  const [selectedPair, setSelectedPair] = useState(null);
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');

  const getInteractions = (pair, vState) => {
    // Get pronoun helpers
    const getPronouns = () => {
      if (!vState) return { subject: 'they', object: 'them', possessive: 'their' };
      if (vState.gender === 'woman') return { subject: 'she', object: 'her', possessive: 'her' };
      if (vState.gender === 'custom') return { subject: 'they', object: 'them', possessive: 'their' };
      return { subject: 'he', object: 'him', possessive: 'his' };
    };
    const p = getPronouns();
    return [
    { 
      id: 'vampire-talk',
      icon: Sparkles,
      label: 'Talk about the vampire',
      description: 'Let them discuss their feelings about you',
      outcomes: {
        positive: [
          `${pair?.[0]?.name}: "Living with ${p.object}... it's incredible. I never want to leave."\n${pair?.[1]?.name}: "I know exactly what you mean. ${p.subject === 'they' ? 'They\'re' : p.subject === 'she' ? 'She\'s' : 'He\'s'} everything."`,
          `${pair?.[0]?.name}: "${p.subject === 'they' ? 'They are' : p.subject === 'she' ? 'She\'s' : 'He\'s'} everything to me. I'd die for ${p.object}."\n${pair?.[1]?.name}: "Same. We're lucky to be chosen."`,
          `They talk for hours about you. Their devotion matching. A mutual understanding forms.`,
          `${pair?.[0]?.name}: "The way ${p.subject} looks at me..."\n${pair?.[1]?.name}: "I know that look. It's intoxicating."\nThey bond over their shared addiction to you.`,
        ],
        neutral: [
          `${pair?.[0]?.name}: "It's... different. Living with a vampire."\n${pair?.[1]?.name}: "Yeah." Awkward silence.`,
          `They talk about you politely. No real connection made.`,
          `${pair?.[0]?.name}: "Some nights are better than others."\n${pair?.[1]?.name} nods but doesn't elaborate.`,
        ],
        negative: [
          `${pair?.[0]?.name}: "Sometimes I wonder if ${p.subject} even sees me."\n${pair?.[1]?.name}: "Oh, ${p.subject} sees me just fine. Maybe you're the problem."\nTension rises.`,
          `${pair?.[0]?.name}: "I want ${p.possessive} attention. Not yours."\n${pair?.[1]?.name} walks away, hurt and angry.`,
          `${pair?.[1]?.name}: "Why does ${p.subject} spend more time with you?"\n${pair?.[0]?.name}: "Because I'm better at this than you."\nThe rivalry deepens.`,
        ]
      }
    },
    { 
      id: 'deep-conversation', 
      icon: MessageCircle, 
      label: 'Have a deep conversation',
      description: 'Encourage them to open up to each other',
      outcomes: {
        positive: [
          `${pair?.[0]?.name} shares their fears. ${pair?.[1]?.name} listens, really listens. "We're in this together," they say. A bond forms.`,
          `They talk about their past lives. Before you. Both realize how empty they were. How complete they are now. Understanding blooms.`,
          `${pair?.[0]?.name}: "Do you ever miss your old life?"\n${pair?.[1]?.name}: "Not for a second. This is where I belong."\nThey smile at each other. United.`,
          `They share their devotion stories. How they fell for you. Different paths, same destination. Respect grows.`,
        ],
        neutral: [
          `They try to connect but the conversation stays surface level. Polite. Safe. Distant.`,
          `${pair?.[0]?.name} opens up a little. ${pair?.[1]?.name} doesn't reciprocate. It fizzles out.`,
          `Small talk that goes nowhere. They're too different. Or too similar.`,
        ],
        negative: [
          `${pair?.[0]?.name} tries to connect. ${pair?.[1]?.name} shuts them down. "I don't need a friend. I need ${p.object}."`,
          `The conversation turns competitive. Each trying to prove they're more devoted. More worthy. More needed.`,
          `${pair?.[1]?.name}: "You don't understand ${p.object} like I do."\n${pair?.[0]?.name}: "Keep telling yourself that."\nHostility festers.`,
        ]
      }
    },
    { 
      id: 'bond', 
      icon: Heart, 
      label: 'Encourage bonding',
      description: 'Push them to form a connection',
      outcomes: {
        positive: [
          `You tell them they're both important. Both cherished. They look at each other differently now. Allies, not rivals.`,
          `${pair?.[0]?.name} reaches out. ${pair?.[1]?.name} takes their hand. "We're family now," one whispers. The other agrees.`,
          `You explain that loving you means accepting each other. They understand. They try. It works.`,
          `They embrace. Tentatively at first, then genuine. United in their devotion to you.`,
        ],
        neutral: [
          `They try for your sake. Forced smiles. Stiff hugs. The walls remain, but they're trying.`,
          `${pair?.[0]?.name}: "For ${p.object}, I'll try."\n${pair?.[1]?.name}: "Same."\nSmall progress.`,
          `They tolerate each other now. Not friends, but not enemies. It's something.`,
        ],
        negative: [
          `${pair?.[0]?.name}: "I don't want to share ${p.object}."\n${pair?.[1]?.name}: "Good. Neither do I."\nYour intervention made it worse.`,
          `They pretend to bond in front of you. The moment you leave, the masks drop. Hatred intensifies.`,
          `${pair?.[1]?.name} storms off. "I'm not doing this." ${pair?.[0]?.name} looks relieved they left.`,
        ]
      }
    },
    {
      id: 'observe',
      icon: Eye,
      label: 'Secretly observe them',
      description: 'Watch how they act when you\'re not around',
      outcomes: {
        positive: [
          `You watch from the shadows. They don't know you're there. ${pair?.[0]?.name} makes ${pair?.[1]?.name} laugh. Genuine. Natural. Beautiful.`,
          `They talk about you fondly. Both admiring different things about you. No jealousy. Just shared appreciation.`,
          `${pair?.[0]?.name} helps ${pair?.[1]?.name} with something. A small gesture of kindness. You smile.`,
          `They're comfortable together. No pretense. No competition. Just... peaceful coexistence.`,
        ],
        neutral: [
          `They ignore each other mostly. Polite nods when paths cross. Nothing more.`,
          `They coexist in silence. Not hostile, not friendly. Just... there.`,
          `${pair?.[0]?.name} reads. ${pair?.[1]?.name} stares out the window. Separate worlds.`,
        ],
        negative: [
          `You hear ${pair?.[0]?.name} whisper: "I wish ${p.subject}'d turn just me. Send ${pair?.[1]?.name} away."\n${pair?.[1]?.name} glares from across the room. They heard it too.`,
          `${pair?.[1]?.name} hides something of yours. ${pair?.[0]?.name} sees it. "That's pathetic," they mutter. War brewing.`,
          `Silent hostility. They can't hide it. Every movement calculated to avoid the other.`,
          `One deliberately takes your attention from the other. Sabotage. Manipulation. Jealousy uncontained.`,
        ]
      }
    },
    {
      id: 'confide',
      icon: Heart,
      label: 'Share secrets & vulnerabilities',
      description: 'Deep emotional connection - let them be vulnerable',
      outcomes: {
        positive: [
          `${pair?.[0]?.name} shares a childhood fear. ${pair?.[1]?.name} reaches out, squeezes their hand. "Me too," they whisper. Walls crumbling.`,
          `They talk about what scares them most. Losing you. Losing themselves. Being alone again. Understanding blooms between them.`,
          `${pair?.[0]?.name} cries. ${pair?.[1]?.name} doesn't judge. Just holds them. "We're the same," they say. Beautiful.`,
          `They share their deepest insecurities. Both feel the same fears. The same desperate need to be chosen. To be enough. United in vulnerability.`,
          `Raw honesty. Tears. Laughter. They see each other now. Really see each other. A true bond forms.`
        ],
        neutral: [
          `They try to open up but it's hard. Small steps. Surface vulnerability. Progress, but slow.`,
          `${pair?.[0]?.name} shares something small. ${pair?.[1]?.name} nods but doesn't reciprocate yet. One-sided but starting.`,
          `Tentative emotional steps. They're learning to trust each other. Awkward but genuine effort.`
        ],
        negative: [
          `${pair?.[0]?.name} opens up. ${pair?.[1]?.name} uses it against them later. "At least I'm not THAT pathetic."`,
          `Vulnerability becomes weaponized. Each using the other's fears to hurt them. Trust destroyed.`,
          `${pair?.[1]?.name}: "You think YOU have problems? Try being the less favorite one." Competition even here.`
        ]
      }
    },
    {
      id: 'together',
      icon: Coffee,
      label: 'Spend quality time (all 3)',
      description: 'An evening together - you and both servants',
      outcomes: {
        positive: [
          `A perfect night. You sit between them. They both lean into you. Content. Safe. Complete.\n"This is enough," ${pair?.[0]?.name} whispers. ${pair?.[1]?.name} agrees.`,
          `You read to them. They hang on every word. Not competing, just enjoying your presence. Together.`,
          `They take turns telling you stories. You laugh. They smile at each other. A moment of unity.`,
          `${pair?.[0]?.name} on your left. ${pair?.[1]?.name} on your right. Both holding your hands. Perfect balance.`,
          `You watch them learn to share you. It's beautiful. They're learning. For you, they'll do anything.`,
        ],
        neutral: [
          `Awkward but manageable. They're civil for your sake. Stiff. Trying too hard.`,
          `You talk. They listen. Separately. Not connecting with each other, only with you.`,
          `It works. Barely. The tension is there but controlled. Baby steps.`,
        ],
        negative: [
          `${pair?.[0]?.name} reaches for you. ${pair?.[1]?.name} pulls you away. "My turn," they hiss. A fight erupts.`,
          `You try to give them equal attention. It's not enough. It's never enough. Both want more. Both want all.`,
          `${pair?.[1]?.name} storms off mid-evening. "I can't do this. I can't watch ${p.object} with someone else."\n${pair?.[0]?.name} looks satisfied. Victory.`,
          `They fight over you right in front of you. Words become sharp. Jealousy explosive. This was a terrible mistake.`,
        ]
      }
    },
    {
      id: 'heart-to-heart',
      icon: Heart,
      label: 'Facilitate heart-to-heart',
      description: 'Create space for genuine emotional connection',
      outcomes: {
        positive: [
          `You give them space. Leave the room. When you return, they're talking softly. Smiling. Connected.`,
          `${pair?.[0]?.name}: "I was jealous of you." ${pair?.[1]?.name}: "I was jealous of YOU." They laugh. Understanding achieved.`,
          `They bond over shared experiences. Both changed by you. Both devoted. Different paths, same love.`,
          `Real friendship forming. Not forced. Natural. Beautiful. You smile watching them.`
        ],
        neutral: [
          `They talk but stay guarded. Small connection made but walls remain up. Baby steps.`,
          `Polite conversation that scratches the surface. Not deep but not hostile. Progress.`,
          `They try but struggle to truly open up. The effort is there. That matters.`
        ],
        negative: [
          `${pair?.[0]?.name} tries to connect. ${pair?.[1]?.name}: "Stop pretending. We both know you want ${p.object} all to yourself."`,
          `The conversation becomes passive aggressive. Each subtly putting the other down. Failed attempt.`,
          `They can't do it. Too much jealousy. Too much competition. They walk away angry.`
        ]
      }
    },
    {
      id: 'assign-task',
      icon: Sparkles,
      label: 'Assign them a task together',
      description: 'Make them work as a team',
      outcomes: {
        positive: [
          `They work in sync. ${pair?.[0]?.name} starts something, ${pair?.[1]?.name} finishes it. Natural teamwork. You're impressed.`,
          `${pair?.[0]?.name}: "Hand me that."\n${pair?.[1]?.name} passes it without hesitation. They're learning each other's rhythms.`,
          `The task gets done efficiently. They complement each other well. Different strengths. One team.`,
          `"We make a good team," ${pair?.[0]?.name} admits. ${pair?.[1]?.name} nods. "For ${p.object}, we do."`,
        ],
        neutral: [
          `They complete the task separately. Side by side but not together. It works. Barely.`,
          `Minimal cooperation. The task gets done but there's no chemistry. Just obligation.`,
          `They divide the work silently. Efficient but cold. Professional distance.`,
        ],
        negative: [
          `${pair?.[0]?.name} does it one way. ${pair?.[1]?.name} undoes it and does it differently. "You're doing it wrong," they snap at each other.`,
          `They sabotage each other. Each trying to prove they're better. The task fails. You're disappointed.`,
          `${pair?.[1]?.name}: "I don't need ${p.possessive} help."\n${pair?.[0]?.name}: "Good. Because I wasn't offering."\nThe task abandoned.`,
        ]
      }
    },
  ];
  };

  const handleInteraction = async (interactionId) => {
    setInteracting(true);
    
    setTimeout(async () => {
      const [servant1, servant2] = selectedPair;
      const interactions = getInteractions(selectedPair, vampireState);
      const interaction = interactions.find(i => i.id === interactionId);
      
      // Determine outcome based on relationship levels and jealousy
      const avgRel = ((servant1.relationship || 0) + (servant2.relationship || 0)) / 2;
      const jealousy1 = servant1.jealousy_level || 0;
      const jealousy2 = servant2.jealousy_level || 0;
      const avgJealousy = (jealousy1 + jealousy2) / 2;
      
      // More nuanced outcome determination
      let outcomeType;
      const roll = Math.random() * 100;
      
      if (avgJealousy > 70 || avgRel < 25) {
        // Very likely negative
        outcomeType = roll < 80 ? 'negative' : 'neutral';
      } else if (avgJealousy > 40 || avgRel < 50) {
        // Mixed outcomes
        if (roll < 30) outcomeType = 'negative';
        else if (roll < 70) outcomeType = 'neutral';
        else outcomeType = 'positive';
      } else if (avgRel > 70 && avgJealousy < 25) {
        // Very likely positive
        outcomeType = roll < 80 ? 'positive' : 'neutral';
      } else {
        // Balanced
        if (roll < 25) outcomeType = 'negative';
        else if (roll < 60) outcomeType = 'neutral';
        else outcomeType = 'positive';
      }
      
      const outcomeText = interaction.outcomes[outcomeType][
        Math.floor(Math.random() * interaction.outcomes[outcomeType].length)
      ];
      
      setOutcome(outcomeText);
      
      // Update stats based on outcome and interaction type
      let jealousyChange1 = 0, jealousyChange2 = 0;
      let relChange1 = 0, relChange2 = 0;
      
      if (outcomeType === 'positive') {
        jealousyChange1 = Math.floor(Math.random() * 8) - 10; // -10 to -2
        jealousyChange2 = Math.floor(Math.random() * 8) - 10;
        relChange1 = Math.floor(Math.random() * 5) + 3; // 3-7
        relChange2 = Math.floor(Math.random() * 5) + 3;
      } else if (outcomeType === 'negative') {
        jealousyChange1 = Math.floor(Math.random() * 8) + 5; // 5-12
        jealousyChange2 = Math.floor(Math.random() * 8) + 5;
        relChange1 = Math.floor(Math.random() * 5) - 7; // -7 to -3
        relChange2 = Math.floor(Math.random() * 5) - 7;
      } else {
        jealousyChange1 = Math.floor(Math.random() * 5) - 2; // -2 to 2
        jealousyChange2 = Math.floor(Math.random() * 5) - 2;
        relChange1 = Math.floor(Math.random() * 3); // 0-2
        relChange2 = Math.floor(Math.random() * 3);
      }
      
      // Bonus effects for certain interactions
      if (interactionId === 'together' && outcomeType === 'positive') {
        relChange1 += 5;
        relChange2 += 5;
      }
      if (interactionId === 'bond' && outcomeType === 'positive') {
        jealousyChange1 -= 5;
        jealousyChange2 -= 5;
      }
      if (interactionId === 'assign-task' && outcomeType === 'positive') {
        relChange1 += 3;
        relChange2 += 3;
      }
      
      try {
        await Promise.all([
          base44.entities.Servant.update(servant1.id, {
            jealousy_level: Math.max(0, Math.min(100, (jealousy1 + jealousyChange1))),
            relationship: Math.max(0, Math.min(100, ((servant1.relationship || 0) + relChange1)))
          }),
          base44.entities.Servant.update(servant2.id, {
            jealousy_level: Math.max(0, Math.min(100, (jealousy2 + jealousyChange2))),
            relationship: Math.max(0, Math.min(100, ((servant2.relationship || 0) + relChange2)))
          })
        ]);
      } catch (e) {
        console.error('Failed to update servants:', e);
      }
      
      await base44.entities.NightLog.create({
        entry: outcomeText,
        category: 'interaction',
        intensity: outcomeType === 'negative' ? 'significant' : outcomeType === 'positive' ? 'moderate' : 'subtle'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
        setSelectedPair(null);
      }, 4000);
    }, 2500);
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
          <div className="py-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-purple-500/30"
            >
              <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                {outcome}
              </p>
            </motion.div>
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

            {getInteractions(selectedPair, vampireState).map(interaction => (
              <button
                key={interaction.id}
                onClick={() => handleInteraction(interaction.id)}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors touch-manipulation"
              >
                <div className="flex items-start gap-3">
                  <interaction.icon className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h4 className="text-white font-medium mb-1">{interaction.label}</h4>
                    <p className="text-gray-400 text-xs">{interaction.description}</p>
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