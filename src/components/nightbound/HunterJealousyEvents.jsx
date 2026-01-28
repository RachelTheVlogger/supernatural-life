import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const JEALOUSY_SCENARIOS = [
  {
    id: 'suspicious_colleague',
    title: 'Suspicious Colleague',
    scenario: 'A fellow hunter is asking suspicious questions about your personal life and whereabouts.',
    choices: [
      { label: 'Brush It Off', effect: 'suspicion +5, risky' },
      { label: 'Mislead Them', effect: 'suspicion +2, bond -2' },
      { label: 'Confide in Partner', effect: 'bond +5, relationship -5 with hunter' }
    ]
  },
  {
    id: 'rival_hunter',
    title: 'Rival Hunter Shows Interest',
    scenario: 'Another hunter starts flirting with your partner. How do you react?',
    choices: [
      { label: 'Ignore It', effect: 'partner jealous, bond -3' },
      { label: 'Warn Them Off', effect: 'confrontation, suspicion +3' },
      { label: 'Reassure Partner', effect: 'bond +8, conflict averted' }
    ]
  },
  {
    id: 'rival_vampire',
    title: 'Another Vampire Threatens',
    scenario: 'A rival vampire offers your partner a better life without you.',
    choices: [
      { label: 'Trust Them', effect: 'bond +10, risk high' },
      { label: 'Eliminate Threat', effect: 'bond +15, exposure +10' },
      { label: 'Make Concessions', effect: 'bond +5, lose something' }
    ]
  }
];

export default function HunterJealousyEvents({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChoice = async (choice) => {
    setLoading(true);
    try {
      const scenario = JEALOUSY_SCENARIOS.find(s => s.id === selectedScenario);
      
      if (vampire.id) {
        const choiceIndex = selectedChoice;
        if (choiceIndex === 2) { // Reassure/Trust/Concessions choices
          await base44.entities.VampireState.update(vampire.id, {
            hunter_relationship: Math.min(100, (vampire.hunter_relationship || 0) + 5)
          });
        }
      }

      await base44.entities.NightLog.create({
        entry: `${hunter.name} handled jealousy: ${scenario.title}. They chose to ${choice.label}.`,
        category: 'conflict',
        intensity: 'medium'
      });

      queryClient.invalidateQueries();
      setSelectedScenario(null);
      setSelectedChoice(null);
    } catch (e) {
      console.error('Failed to handle jealousy event:', e);
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
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            Jealousy & Conflict
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedScenario ? (
          <div className="space-y-3">
            {JEALOUSY_SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className="w-full bg-yellow-950/30 hover:bg-yellow-950/50 border border-yellow-500/30 rounded-lg p-4 text-left transition-colors"
              >
                <h3 className="text-white font-bold mb-1">{scenario.title}</h3>
                <p className="text-gray-300 text-sm">{scenario.scenario}</p>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-300 mb-6">{JEALOUSY_SCENARIOS.find(s => s.id === selectedScenario)?.scenario}</p>
            
            <div className="space-y-2 mb-6">
              {JEALOUSY_SCENARIOS.find(s => s.id === selectedScenario)?.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChoice(idx)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedChoice === idx
                      ? 'bg-yellow-600/50 border-yellow-500'
                      : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="text-white font-medium text-sm">{choice.label}</p>
                  <p className="text-gray-400 text-xs">{choice.effect}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleChoice(JEALOUSY_SCENARIOS.find(s => s.id === selectedScenario)?.choices[selectedChoice])}
                disabled={selectedChoice === null || loading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Resolving...' : 'Choose'}
              </button>
              <button
                onClick={() => setSelectedScenario(null)}
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