import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HOUSEHOLD_DECISIONS = [
  {
    id: 'work_split',
    title: 'How to Split Responsibilities',
    description: 'Who does the hunting, who stays home, how to balance your different natures?',
    options: [
      { label: 'You Hunt, They Stay Home', effect: 'efficient, bond -2, exposure risk' },
      { label: 'They Hunt, You Cover', effect: 'dangerous but romantic, bond +5' },
      { label: 'Trade Off Nights', effect: 'flexible, moderate exposure' }
    ]
  },
  {
    id: 'hide_identity',
    title: 'How to Hide Their Nature',
    description: 'Create a cover story for why they only go out at night.',
    options: [
      { label: 'Night Shift Worker', effect: 'believable, common' },
      { label: 'Nocturnal Illness', effect: 'arouses suspicion if too theatrical' },
      { label: 'Artistic/Creative Schedule', effect: 'trendy, less questions' }
    ]
  },
  {
    id: 'money_matters',
    title: 'Financial Decisions',
    description: 'How to support yourself without raising red flags?',
    options: [
      { label: 'Your Hunter Salary', effect: 'normal income, stable' },
      { label: 'Their Unknown Sources', effect: 'risky, questions asked' },
      { label: 'Build a Business Together', effect: 'time-intensive, bonds you' }
    ]
  },
  {
    id: 'social_life',
    title: 'Social Life & Friends',
    description: 'Can they meet your hunter friends? Do you need a normal social life?',
    options: [
      { label: 'Keep It Secret', effect: 'isolating, bond -3' },
      { label: 'Introduce Them (No Details)', effect: 'risky but closer, bond +5' },
      { label: 'Build Separate Lives', effect: 'complicated, time-consuming' }
    ]
  }
];

export default function HunterHouseholdDecisions({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChoice = async (option) => {
    setLoading(true);
    try {
      const decision = HOUSEHOLD_DECISIONS.find(d => d.id === selectedDecision);
      
      // Apply relationship changes based on choice
      if (vampire.id && selectedChoice === 1) { // Second option (romantic/risk)
        await base44.entities.VampireState.update(vampire.id, {
          hunter_relationship: Math.min(100, (vampire.hunter_relationship || 0) + 5)
        });
      }

      await base44.entities.NightLog.create({
        entry: `${hunter.name} and ${vampire.vampire_name} made a household decision: "${decision.title}". They chose: ${option.label}`,
        category: 'domestic',
        intensity: 'low'
      });

      queryClient.invalidateQueries();
      setSelectedDecision(null);
      setSelectedChoice(null);
    } catch (e) {
      console.error('Failed to make household decision:', e);
    }
    setLoading(false);
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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="w-6 h-6" />
            Household Decisions
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedDecision ? (
          <div className="space-y-3">
            {HOUSEHOLD_DECISIONS.map(decision => (
              <button
                key={decision.id}
                onClick={() => setSelectedDecision(decision.id)}
                className="w-full bg-blue-950/30 hover:bg-blue-950/50 border border-blue-500/30 rounded-lg p-4 text-left transition-colors"
              >
                <h3 className="text-white font-bold mb-1">{decision.title}</h3>
                <p className="text-gray-300 text-sm">{decision.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-300 mb-6 font-medium">
              {HOUSEHOLD_DECISIONS.find(d => d.id === selectedDecision)?.title}
            </p>
            
            <div className="space-y-2 mb-6">
              {HOUSEHOLD_DECISIONS.find(d => d.id === selectedDecision)?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChoice(idx)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedChoice === idx
                      ? 'bg-blue-600/50 border-blue-500'
                      : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="text-white font-medium text-sm">{option.label}</p>
                  <p className="text-gray-400 text-xs">{option.effect}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleChoice(HOUSEHOLD_DECISIONS.find(d => d.id === selectedDecision)?.options[selectedChoice])}
                disabled={selectedChoice === null || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Deciding...' : 'Agree'}
              </button>
              <button
                onClick={() => setSelectedDecision(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}