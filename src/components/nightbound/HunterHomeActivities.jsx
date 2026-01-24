import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const ACTIVITIES = [
  {
    id: 'clean',
    name: '🧹 Clean & Organize',
    desc: 'Organize weapons, clean equipment, maintain safe house',
    duration: 2,
    outcome: 'Your weapons are polished and ready. Equipment secured. Everything in order.'
  },
  {
    id: 'cook',
    name: '🍳 Cook Meal',
    desc: 'Prepare food, regain energy, cook with focus on the hunt',
    duration: 1,
    outcome: 'You prepared a hearty meal. Energy restored. Mind sharp.'
  },
  {
    id: 'sleep',
    name: '🛏️ Sleep & Rest',
    desc: 'Get proper rest, recover stamina, prepare for night hunting',
    duration: 3,
    outcome: 'You woke refreshed. Senses sharp. Ready to hunt.'
  },
  {
    id: 'research',
    name: '📚 Research Creatures',
    desc: 'Study supernatural lore, improve knowledge, learn weaknesses',
    duration: 2,
    outcome: 'Knowledge gained. You understand them better now.'
  },
  {
    id: 'train',
    name: '💪 Physical Training',
    desc: 'Combat drills, fitness training, weapon practice',
    duration: 2,
    outcome: 'Your combat skills sharpened. Reflexes faster. Ready for anything.'
  },
  {
    id: 'meditate',
    name: '🧘 Meditate',
    desc: 'Center yourself, focus intention, prepare mentally',
    duration: 1,
    outcome: 'Mind clear. Purpose focused. Fear conquered.'
  }
];

export default function HunterHomeActivities({ hunter }) {
  const queryClient = useQueryClient();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleActivity = async (activity) => {
    setProcessing(true);
    setSelectedActivity(activity);

    setTimeout(async () => {
      try {
        await base44.entities.NightLog.create({
          entry: `${hunter.name}: ${activity.name}. ${activity.outcome}`,
          category: 'hunting',
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ACTIVITIES.map(activity => (
        <motion.button
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleActivity(activity)}
          className="bg-black/40 border border-gray-700/50 hover:border-gray-600/80 rounded-2xl p-6 text-left transition-all hover:bg-black/60"
        >
          <h3 className="text-white font-bold text-lg mb-2">{activity.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{activity.desc}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Duration: {activity.duration}h</span>
            <span className="text-gray-600 hover:text-gray-400">Click to start →</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}