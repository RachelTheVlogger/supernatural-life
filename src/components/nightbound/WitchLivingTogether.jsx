import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Coffee, Moon, Sparkles, Flame, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import WitchDeepInteractions from './WitchDeepInteractions';

export default function WitchLivingTogether({ witch, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showDeepInteractions, setShowDeepInteractions] = useState(false);

  const getDailyActivities = () => {
    const p = vampireState.gender === 'woman' ? { subject: 'she', object: 'her', possessive: 'her' } 
      : vampireState.gender === 'custom' ? { subject: 'they', object: 'them', possessive: 'their' }
      : { subject: 'he', object: 'him', possessive: 'his' };

    return [
      {
        id: 'morning',
        icon: Coffee,
        label: 'Morning routine together',
        outcomes: [
          `You wake up. ${witch.name} is already brewing tea. Magic herbs floating in the cup. "${p.subject === 'they' ? 'They\'re' : p.subject === 'she' ? 'She\'s' : 'He\'s'} still asleep," ${p.subject} mutters. You smile.`,
          `Sunrise. You're in your coffin. ${witch.name} casts a protective spell over you. "Sleep well, my vampire," ${p.subject} whispers.`,
          `${witch.name} performs a morning ritual. Candles. Incense. Magic filling the air. You watch, mesmerized.`,
          `Breakfast for ${p.object}. Blood for you. Domestic bliss. Supernatural style.`
        ]
      },
      {
        id: 'study',
        icon: Sparkles,
        label: 'Study magic together',
        outcomes: [
          `${witch.name} teaches you basic spells. Your vampire nature resists. But ${p.subject} persists. "You're getting better," ${p.subject} says. Pride in ${p.possessive} eyes.`,
          `You read ancient grimoires together. Vampire lore. Witch history. Your worlds intertwining.`,
          `${witch.name} practices a new spell. You're ${p.possessive} test subject. It tickles. You both laugh.`,
          `Magic lessons. ${witch.name} channels power through you. Vampire and witch energy merging. Intoxicating.`
        ]
      },
      {
        id: 'intimate',
        icon: Heart,
        label: 'Intimate moment',
        outcomes: [
          `${witch.name} kisses you deeply. Magic and darkness colliding. Perfect union.`,
          `You make love slowly. Witch fingers tracing vampire skin. Every touch electric.`,
          `Supernatural passion. ${witch.name} beneath you. Or above. Doesn't matter. Just... perfect.`,
          `Afterglow. ${witch.name} curled against you. "Stay with me forever," ${p.subject} whispers. "Always," you promise.`
        ]
      },
      {
        id: 'protect',
        icon: Flame,
        label: 'Protective spells',
        outcomes: [
          `${witch.name} casts wards around your home. "No one can hurt you here," ${p.subject} promises. You feel safer.`,
          `Hunters nearby. ${witch.name} creates illusions. They pass by, unseeing. You're grateful.`,
          `${witch.name} makes you a daylight ring. "For emergencies," ${p.subject} says. You kiss ${p.object} deeply.`,
          `Boundary spell. ${witch.name} traps a rival vampire trying to enter. "This is OUR home," ${p.subject} declares.`
        ]
      },
      {
        id: 'night',
        icon: Moon,
        label: 'Evening together',
        outcomes: [
          `Sunset. You rise. ${witch.name} is there, waiting. Always waiting. "Good evening, love," ${p.subject} smiles.`,
          `You hunt together. ${witch.name} using magic to lure prey. Team work. Perfect partnership.`,
          `Stargazing. You lie together. Talking about eternity. Immortality. Forever.`,
          `${witch.name} performs a moon ritual. You watch, entranced. Witch and vampire. Under the same moon.`
        ]
      },
      {
        id: 'conflict',
        icon: Sparkles,
        label: 'Resolve tensions',
        outcomes: [
          `Small argument. ${witch.name}'s magic accidentally hurt you. "I'm sorry," ${p.subject} cries. You forgive. Always.`,
          `Jealousy. ${witch.name} saw you with a servant. You reassure ${p.object}. "You're different. Special. Mine."`,
          `${witch.name} wants to introduce you to ${p.possessive} coven. You're hesitant. But for ${p.object}? Anything.`,
          `You fight. Words hurled like weapons. But then... reconciliation. Passionate. Perfect. Stronger than before.`
        ]
      }
    ];
  };

  const handleActivity = async (activity) => {
    setInteracting(true);

    setTimeout(async () => {
      const outcome = activity.outcomes[Math.floor(Math.random() * activity.outcomes.length)];
      setOutcome(outcome);

      const relChange = Math.floor(Math.random() * 5) + 3; // 3-7
      await base44.entities.Witch.update(witch.id, {
        relationship: Math.min(100, (witch.relationship || 0) + relChange)
      });

      await base44.entities.NightLog.create({
        entry: outcome,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 3500);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-950 to-pink-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-purple-500/50"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Living with {witch.name}</h2>
        <p className="text-purple-300 text-sm mb-6">
          Witch and vampire. Sharing a home. Sharing a life.
        </p>

        {outcome ? (
          <div className="py-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-purple-500/30"
            >
              <p className="text-purple-100 text-base leading-relaxed">
                {outcome}
              </p>
            </motion.div>
          </div>
        ) : interacting ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
            </motion.div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setShowDeepInteractions(true)}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 border-2 border-pink-500/50 rounded-xl p-4 text-center transition-all mb-4"
            >
              <div className="flex items-center justify-center gap-3">
                <MessageCircle className="w-6 h-6 text-white" />
                <div>
                  <h4 className="text-white font-bold text-lg">Deep Interactions</h4>
                  <p className="text-pink-200 text-xs">Advanced relationship system</p>
                </div>
              </div>
            </button>

            {getDailyActivities().map(activity => (
              <button
                key={activity.id}
                onClick={() => handleActivity(activity)}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <activity.icon className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">{activity.label}</h4>
                    <p className="text-gray-400 text-xs">Daily life together</p>
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={async () => {
                if (confirm(`Ask ${witch.name} to move out? This will end your cohabitation.`)) {
                  await base44.entities.Witch.update(witch.id, { living_with_vampire: false });
                  await base44.entities.NightLog.create({
                    entry: `${witch.name} moved out. The apartment feels emptier now. A chapter closed.`,
                    category: 'interaction',
                    intensity: 'significant'
                  });
                  queryClient.invalidateQueries();
                  onClose();
                }
              }}
              className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-400" />
                <div>
                  <h4 className="text-white font-medium">Ask {witch.name} to Move Out</h4>
                  <p className="text-gray-400 text-xs">End cohabitation</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {showDeepInteractions && (
          <WitchDeepInteractions
            witch={witch}
            vampireState={vampireState}
            onClose={() => setShowDeepInteractions(false)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}