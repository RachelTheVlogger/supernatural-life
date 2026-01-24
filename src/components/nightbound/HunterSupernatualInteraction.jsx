import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Zap, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const SUPERNATURAL_TARGETS = [
  { type: 'vampire', icon: '🦇', color: 'red', difficulty: 85, reward: 500 },
  { type: 'werewolf', icon: '🐺', color: 'orange', difficulty: 80, reward: 450 },
  { type: 'witch', icon: '✨', color: 'purple', difficulty: 75, reward: 400 },
  { type: 'demon', icon: '👿', color: 'red', difficulty: 90, reward: 600 },
  { type: 'fae', icon: '🧚', color: 'pink', difficulty: 70, reward: 350 },
  { type: 'siren', icon: '🌊', color: 'cyan', difficulty: 65, reward: 300 }
];

const INTERACTION_TYPES = [
  { id: 'intelligence', label: 'Gather Intelligence', icon: '🕵️', desc: 'Learn weaknesses, habits, locations' },
  { id: 'trap', label: 'Set Trap', icon: '🪤', desc: 'Prepare ambush location' },
  { id: 'infiltrate', label: 'Infiltrate Group', icon: '🎭', desc: 'Go undercover, gain trust' },
  { id: 'negotiate', label: 'Negotiate', icon: '🤝', desc: 'Cut a deal. Maybe hunter and creature can help each other' },
  { id: 'study', label: 'Study Lore', icon: '📚', desc: 'Research weaknesses and behavior' }
];

export default function HunterSupernaturalInteraction({ hunter, onClose, onInteraction }) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleInteraction = async (target, interaction) => {
    setProcessing(true);

    const outcomes = {
      intelligence: [
        `Found ${target.type}'s weakness: They're vulnerable at dawn.`,
        `Discovered ${target.type}'s lair location. Perfect for an ambush.`,
        `Learned ${target.type}'s habits. Predictable. Exploitable.`,
        `Intercepted communication. You know their next move.`
      ],
      trap: [
        `Trap set. When they arrive, it's over.`,
        `Prepared three escape routes. They won't see it coming.`,
        `Silver trap ready. They'll walk right into it.`,
        `Barrier complete. They're trapped when they enter.`
      ],
      infiltrate: [
        `You're in. They trust you now. You're one of them.`,
        `Deepcover successful. No one suspects a thing.`,
        `Gained their trust. You're closer to the leader now.`,
        `They invited you to their gathering. Perfect opportunity.`
      ],
      negotiate: [
        `Deal made. This ${target.type} is no longer your enemy.`,
        `Mutual interest discovered. ${target.type} agrees to help you.`,
        `Pact formed. You have a supernatural ally.`,
        `They revealed their enemy. Now THAT is your target instead.`
      ],
      study: [
        `Learned ${target.type} lore. You're an expert now.`,
        `Ancient texts reveal the secret. Critical weakness found.`,
        `Study complete. You understand them better than they understand themselves.`,
        `Research breakthrough. You know how to kill them.`
      ]
    };

    const successChance = 1 - (target.difficulty / 100) + (hunter.skill_level / 100);
    const success = Math.random() < successChance;
    const outcomesForType = outcomes[interaction.id];
    const outcomeText = outcomesForType[Math.floor(Math.random() * outcomesForType.length)];

    setTimeout(async () => {
      setOutcome(`${interaction.label} on ${target.type}\n\n${outcomeText}`);

      try {
        if (success && interaction.id === 'negotiate') {
          // Create an ally
          await base44.entities.NPC.create({
            name: `${target.type.charAt(0).toUpperCase() + target.type.slice(1)} Ally`,
            personality: 'helpful',
            location: 'various',
            occupation: `${target.type} informant`,
            knows_vampire_secret: true
          });
        }

        await base44.entities.NightLog.create({
          entry: `Hunter ${hunter.name}: ${interaction.label} vs ${target.type}. ${outcomeText}`,
          category: 'hunting',
          intensity: 'moderate'
        });

        if (onInteraction) {
          onInteraction({
            target,
            interaction,
            success,
            reward: success ? target.reward : target.reward / 2
          });
        }

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Interaction failed:', e);
      }

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedTarget(null);
        setSelectedInteraction(null);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Supernatural Targets</h2>
            <p className="text-gray-400 text-sm">{hunter.name} - Skill: {hunter.skill_level}%</p>
          </div>
        </div>

        {outcome ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-300 whitespace-pre-line">{outcome}</p>
          </motion.div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              Operating...
            </motion.p>
          </div>
        ) : !selectedTarget ? (
          <div className="space-y-2">
            <h3 className="text-white font-medium mb-3">Choose Target Type</h3>
            {SUPERNATURAL_TARGETS.map(target => (
              <button
                key={target.type}
                onClick={() => setSelectedTarget(target)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{target.icon}</span>
                    <div>
                      <h4 className="text-white font-medium capitalize">{target.type}</h4>
                      <p className="text-gray-400 text-sm">Difficulty: {target.difficulty}%</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold">${target.reward}</span>
                </div>
              </button>
            ))}
          </div>
        ) : !selectedInteraction ? (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedTarget(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h3 className="text-white font-medium mb-3">
              Interact with {selectedTarget.type.toUpperCase()}
            </h3>

            {INTERACTION_TYPES.map(interaction => (
              <button
                key={interaction.id}
                onClick={() => {
                  setSelectedInteraction(interaction);
                  handleInteraction(selectedTarget, interaction);
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{interaction.icon}</span>
                  <div>
                    <h4 className="text-white font-medium">{interaction.label}</h4>
                    <p className="text-gray-400 text-sm">{interaction.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}