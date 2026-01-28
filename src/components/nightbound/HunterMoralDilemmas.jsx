import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DILEMMAS = [
  {
    id: 'protect_vs_duty',
    scenario: 'A hunter colleague asks you to help track a vampire. You realize it\'s your partner.',
    choices: [
      { label: 'Protect Your Partner', effect: 'bond +15, loyalty -10, suspicion -5', vampireEffect: { hunter_relationship: 15 }, hunterEffect: { suspicion: -5 } },
      { label: 'Follow Hunter Duty', effect: 'loyalty +15, bond -20, conflict risk', vampireEffect: { hunter_relationship: -20 }, hunterEffect: { suspicion: 10 } }
    ]
  },
  {
    id: 'feed_or_arrest',
    scenario: 'Your partner is starving. A criminal is in custody nearby. Do you let them feed?',
    choices: [
      { label: 'Allow the Feeding', effect: 'bond +10, moral -5, exposure +8', vampireEffect: { hunger_state: 'sated' }, hunterEffect: { exposure_level: 8 } },
      { label: 'Find Another Way', effect: 'bond +5, moral +10, harder path', vampireEffect: {}, hunterEffect: {} }
    ]
  },
  {
    id: 'run_away',
    scenario: 'You\'re both discovered. A hunter squad is closing in. Do you flee together?',
    choices: [
      { label: 'Escape Together', effect: 'bond +20, you lose everything', vampireEffect: { hunter_relationship: 20 }, hunterEffect: { suspicion: 50 } },
      { label: 'Stay and Fight', effect: 'uncertain outcome, high risk', vampireEffect: {}, hunterEffect: {} }
    ]
  },
  {
    id: 'turn_or_stay',
    scenario: 'Your partner offers to turn you into a vampire so you can be together forever.',
    choices: [
      { label: 'Accept the Bite', effect: 'bond +30, become vampire, story changes', vampireEffect: { coven_size: 1 }, hunterEffect: {} },
      { label: 'Decline But Stay', effect: 'bond +15, relationship tested, mortal life continues', vampireEffect: {}, hunterEffect: {} }
    ]
  }
];

export default function HunterMoralDilemmas({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedDilemma, setSelectedDilemma] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChoice = async (choice) => {
    setLoading(true);
    try {
      if (selectedDilemma) {
        const dilemma = DILEMMAS.find(d => d.id === selectedDilemma);
        
        if (vampire.id && choice.vampireEffect) {
          await base44.entities.VampireState.update(vampire.id, choice.vampireEffect);
        }
        
        await base44.entities.NightLog.create({
          entry: `${hunter.name} faced a moral dilemma: ${dilemma.scenario.substring(0, 50)}... They chose: ${choice.label}`,
          category: 'moral',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
        setSelectedDilemma(null);
        setSelectedChoice(null);
      }
    } catch (e) {
      console.error('Failed to resolve dilemma:', e);
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
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            Moral Dilemmas
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedDilemma ? (
          <div className="space-y-3">
            {DILEMMAS.map(dilemma => (
              <button
                key={dilemma.id}
                onClick={() => setSelectedDilemma(dilemma.id)}
                className="w-full bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 rounded-lg p-4 text-left transition-colors"
              >
                <p className="text-white font-medium text-sm leading-relaxed">{dilemma.scenario}</p>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-gray-300 text-center mb-6">
              {DILEMMAS.find(d => d.id === selectedDilemma)?.scenario}
            </p>
            
            <div className="space-y-3">
              {DILEMMAS.find(d => d.id === selectedDilemma)?.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChoice(idx)}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    selectedChoice === idx
                      ? 'bg-purple-600/50 border-purple-500'
                      : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="text-white font-medium text-left mb-1">{choice.label}</p>
                  <p className="text-gray-400 text-xs text-left">{choice.effect}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleChoice(DILEMMAS.find(d => d.id === selectedDilemma)?.choices[selectedChoice])}
                disabled={selectedChoice === null || loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Decide'}
              </button>
              <button
                onClick={() => setSelectedDilemma(null)}
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