import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HUNTER_ACTIVITIES = [
  { id: 'clean', name: '🧹 Clean & Organize', desc: 'Organize weapons, clean equipment, maintain safe house', duration: 2, outcome: 'Your weapons are polished and ready. Equipment secured. Everything in order.', type: 'peaceful' },
  { id: 'cook', name: '🍳 Cook Meal', desc: 'Prepare food, regain energy, cook with focus on the hunt', duration: 1, outcome: 'You prepared a hearty meal. Energy restored. Mind sharp.', type: 'peaceful' },
  { id: 'sleep', name: '🛏️ Sleep & Rest', desc: 'Get proper rest, recover stamina, prepare for night hunting', duration: 3, outcome: 'You woke refreshed. Senses sharp. Ready to hunt.', type: 'peaceful' },
  { id: 'research', name: '📚 Research Creatures', desc: 'Study supernatural lore, improve knowledge, learn weaknesses', duration: 2, outcome: 'Knowledge gained. You understand them better now.', type: 'hostile' },
  { id: 'train', name: '💪 Physical Training', desc: 'Combat drills, fitness training, weapon practice', duration: 2, outcome: 'Your combat skills sharpened. Reflexes faster. Ready for anything.', type: 'hostile' },
  { id: 'meditate', name: '🧘 Meditate', desc: 'Center yourself, focus intention, prepare mentally', duration: 1, outcome: 'Mind clear. Purpose focused. Fear conquered.', type: 'peaceful' }
];

const VAMPIRE_ACTIVITIES = [
  { id: 'hunt', name: 'Hunt with Sire', desc: 'Learn predator instincts', duration: 1, outcome: 'You hunted beside your sire. Their movements fluid. Yours clumsy. But improving.', type: 'vampire', power: 5, xp: 15 },
  { id: 'feed', name: 'Practice Controlled Feeding', desc: 'Don\'t kill the prey', duration: 1, outcome: 'You fed but stopped before death. Control. Your sire nodded approval.', type: 'vampire', power: 3, xp: 10 },
  { id: 'speed', name: 'Speed Training', desc: 'Blur through shadows', duration: 1, outcome: 'You blurred through the night. Faster than before. The world a smear.', type: 'vampire', power: 4, xp: 12 },
  { id: 'strength', name: 'Test Your Strength', desc: 'Break things. Carefully.', duration: 1, outcome: 'You snapped a steel bar. Your sire raised an eyebrow. Impressed.', type: 'vampire', power: 4, xp: 12 },
  { id: 'compulsion', name: 'Practice Compulsion', desc: 'Bend minds to your will', duration: 1, outcome: 'You looked into human eyes. "Forget." They did. Power absolute.', type: 'vampire', power: 6, xp: 18 },
  { id: 'meditate_power', name: 'Meditate on Power', desc: 'Feel the vampire within', duration: 1, outcome: 'You felt the vampire within. Ancient. Powerful. Growing.', type: 'vampire', power: 3, xp: 8 },
  { id: 'night_walk', name: 'Walk the Night', desc: 'Embrace the darkness', duration: 2, outcome: 'You walked through shadows. This is home now. No longer afraid.', type: 'peaceful' },
  { id: 'blood_meditation', name: 'Blood Meditation', desc: 'Connect with vampiric nature', duration: 1, outcome: 'Connected with your vampiric nature. The hunger is part of you.', type: 'peaceful' },
  { id: 'read_lore', name: 'Read Vampire Lore', desc: 'Study ancient knowledge', duration: 2, outcome: 'Learned ancient vampire history. You understand your heritage now.', type: 'peaceful' },
  { id: 'rest_dark', name: 'Rest in Darkness', desc: 'Deep restorative sleep', duration: 6, outcome: 'Deep restorative sleep. You wake stronger, refreshed.', type: 'peaceful' }
];

export default function HunterHomeActivities({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [interactionChoice, setInteractionChoice] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const isTurnedVampire = hunter?.is_turned;
  const ACTIVITIES = isTurnedVampire ? VAMPIRE_ACTIVITIES : HUNTER_ACTIVITIES;

  const handleActivity = async (activity) => {
    setProcessing(true);
    setSelectedActivity(activity);

    setTimeout(async () => {
      try {
        const updates = {};
        
        if (isTurnedVampire && activity.power) {
          updates.vampire_power_level = Math.min(100, (hunter.vampire_power_level || 0) + activity.power);
          updates.experience = (hunter.experience || 0) + (activity.xp || activity.power * 2);
          updates.nights_as_vampire = (hunter.nights_as_vampire || 0) + 1;

          // Auto-unlock powers at thresholds
          const newPower = updates.vampire_power_level;
          let newStage = hunter.vampire_stage || 1;
          if (newPower >= 25 && newStage === 1) newStage = 2;
          if (newPower >= 50 && newStage === 2) newStage = 3;
          if (newPower >= 75 && newStage === 3) newStage = 4;
          updates.vampire_stage = newStage;
        }

        if (Object.keys(updates).length > 0) {
          await base44.entities.Hunter.update(hunter.id, updates);
        }

        await base44.entities.NightLog.create({
          entry: `${hunter.name}: ${activity.name}. ${activity.outcome}`,
          category: 'activity',
          intensity: 'minor'
        });

        setOutcome(activity.outcome);
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
          setSelectedActivity(null);
        }, 3000);
      } catch (e) {
        console.error('Activity failed:', e);
        setProcessing(false);
      }
    }, activity.duration * 1000);
  };

  if (processing && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/40 border border-green-500/30 rounded-2xl p-12 text-center"
      >
        <motion.p
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-gray-300 text-lg mb-4"
        >
          {outcome}
        </motion.p>
      </motion.div>
    );
  }

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/40 border border-gray-700/50 rounded-2xl p-12 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Loader2 className="w-8 h-8 text-gray-400" />
        </motion.div>
        <p className="text-gray-400">{selectedActivity?.name}...</p>
      </motion.div>
    );
  }

  // Initial choice screen
  if (!interactionChoice) {
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
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">{isTurnedVampire ? 'Your Lair' : 'Your Safe House'}</h2>
              <p className="text-gray-400 text-sm mt-2">What's your mindset?</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <span className="text-2xl">×</span>
            </button>
          </div>

          <div className="space-y-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setInteractionChoice('hostile')}
              className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-700/50 rounded-2xl p-8 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{isTurnedVampire ? '🦇' : '⚔️'}</span>
                <div className="text-left flex-1">
                  <h3 className="text-white text-2xl font-bold mb-2">{isTurnedVampire ? 'Vampire Training' : 'Combat Ready'}</h3>
                  <p className="text-red-300 text-sm">
                    {isTurnedVampire ? 'Train your powers. Embrace the vampire within.' : 'Train. Sharpen. Prepare for war. Every moment counts.'}
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setInteractionChoice('peaceful')}
              className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 border-2 border-blue-700/50 rounded-2xl p-8 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">🏠</span>
                <div className="text-left flex-1">
                  <h3 className="text-white text-2xl font-bold mb-2">Peaceful Rest</h3>
                  <p className="text-blue-300 text-sm">
                    Rest. Recover. {isTurnedVampire ? 'Meditate.' : 'Cook. Organize.'} Take care of yourself.
                  </p>
                </div>
              </div>
            </motion.button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
          >
            Back
          </button>
        </motion.div>
      </motion.div>
    );
  }

  const filteredActivities = ACTIVITIES.filter(a => 
    interactionChoice === 'hostile' 
      ? (isTurnedVampire ? a.type === 'vampire' : a.type === 'hostile')
      : a.type === 'peaceful'
  );

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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-800"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {interactionChoice === 'hostile' ? (isTurnedVampire ? 'Vampire Training' : 'Combat Ready') : 'Peaceful Activities'}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {interactionChoice === 'hostile' ? (isTurnedVampire ? 'Train your powers' : 'Train and prepare for battle') : 'Rest and recover'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <button
          onClick={() => setInteractionChoice(null)}
          className="text-gray-400 hover:text-white text-sm mb-4 transition-colors"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map(activity => (
            <motion.button
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleActivity(activity)}
              className={`border rounded-2xl p-6 text-left transition-all ${
                isTurnedVampire && activity.power
                  ? 'bg-rose-900/40 hover:bg-rose-900/60 border-rose-500/30'
                  : 'bg-black/40 border-gray-700/50 hover:border-gray-600/80 hover:bg-black/60'
              }`}
            >
              <h3 className={`font-bold text-lg mb-2 ${isTurnedVampire ? 'text-rose-100' : 'text-white'}`}>{activity.name}</h3>
              <p className={`text-sm mb-3 ${isTurnedVampire ? 'text-rose-300' : 'text-gray-400'}`}>{activity.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Duration: {activity.duration}h</span>
                {activity.power && (
                  <span className="text-rose-400">+{activity.power} power</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}