import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTEGRATION_EVENTS = [
  {
    id: 'meet_hunters',
    title: 'Introduce Vampire to Hunter Friends',
    description: 'Bring them to a casual gathering with your hunter colleagues. Risky but could work.',
    difficulty: 'Very Hard',
    success_chance: '40%',
    reward: 'bond +20 (if successful), exposure +15 (if failed)',
    effect: 'bond +20'
  },
  {
    id: 'meet_family',
    title: 'Bring Them Home to Family',
    description: 'Introduce them as your partner to your family. The ultimate normalcy.',
    difficulty: 'Extreme',
    success_chance: '20%',
    reward: 'bond +30 (if accepted), major problems (if exposed)',
    effect: 'bond +30'
  },
  {
    id: 'double_life',
    title: 'Maintain Two Separate Lives',
    description: 'Keep them completely separate from your hunter world. Exhausting but safest.',
    difficulty: 'Hard',
    success_chance: '80%',
    reward: 'stable relationship, but bond grows slower (-5% bond/week)',
    effect: 'stable'
  },
  {
    id: 'joint_identity',
    title: 'Build a Shared Civil Identity',
    description: 'Get them legal documents, a job, a normal life as cover.',
    difficulty: 'Hard',
    success_chance: '60%',
    reward: 'fully integrated life, bond +15, sustainable',
    effect: 'bond +15'
  },
  {
    id: 'supernatural_friends',
    title: 'Introduce to Supernatural Community',
    description: 'Connect them with other vampires/supernatural beings sympathetic to your situation.',
    difficulty: 'Medium',
    success_chance: '70%',
    reward: 'allies, support network, bond +10',
    effect: 'bond +10'
  },
  {
    id: 'public_relationship',
    title: 'Go Public Together',
    description: 'Announce your relationship openly. Reckless, but some hunters accept supernatural partners.',
    difficulty: 'Impossible',
    success_chance: '5%',
    reward: 'freedom and honesty (if accepted), exile (if rejected)',
    effect: 'bond +50'
  }
];

export default function HunterIntegration({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleIntegration = async (event) => {
    setLoading(true);
    try {
      const successRoll = Math.random() * 100;
      const successChance = parseInt(event.success_chance);
      const succeeded = successRoll < successChance;

      if (vampire.id && succeeded) {
        const bondGain = event.effect === 'stable' ? 0 : (parseInt(event.effect.split('+')[1]) || 0);
        if (bondGain > 0) {
          await base44.entities.VampireState.update(vampire.id, {
            hunter_relationship: Math.min(100, (vampire.hunter_relationship || 0) + bondGain)
          });
        }
      }

      await base44.entities.NightLog.create({
        entry: `${hunter.name} attempted integration: "${event.title}". Result: ${succeeded ? 'SUCCESS' : 'FAILED'}. ${event.reward}`,
        category: 'integration',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setSelectedEvent(null);
    } catch (e) {
      console.error('Failed to handle integration:', e);
    }
    setLoading(false);
  };

  const difficultyColors = {
    'Hard': 'text-yellow-400',
    'Very Hard': 'text-orange-400',
    'Extreme': 'text-red-500',
    'Medium': 'text-yellow-300',
    'Impossible': 'text-red-600'
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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-3xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Integration with the World
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-sm">How openly will you integrate your vampire partner into your life?</p>

        <div className="space-y-3">
          {INTEGRATION_EVENTS.map(event => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="w-full p-4 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-bold">{event.title}</h3>
                <span className={`text-xs font-bold ${difficultyColors[event.difficulty]}`}>{event.difficulty}</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{event.description}</p>
              <p className="text-gray-400 text-xs">Success Chance: <span className="text-purple-400">{event.success_chance}</span></p>
            </button>
          ))}
        </div>

        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-purple-950/30 border border-purple-500/30 rounded-lg"
          >
            <h3 className="text-white font-bold mb-4">{selectedEvent.title}</h3>
            
            <div className="space-y-2 mb-4 text-sm">
              <p><span className="text-gray-400">Description:</span> <span className="text-white">{selectedEvent.description}</span></p>
              <p><span className="text-gray-400">Difficulty:</span> <span className={difficultyColors[selectedEvent.difficulty]}>{selectedEvent.difficulty}</span></p>
              <p><span className="text-gray-400">Success Chance:</span> <span className="text-purple-400">{selectedEvent.success_chance}</span></p>
              <p><span className="text-gray-400">Outcome:</span> <span className="text-yellow-300">{selectedEvent.reward}</span></p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleIntegration(selectedEvent)}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Attempting...' : 'Attempt Integration'}
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}