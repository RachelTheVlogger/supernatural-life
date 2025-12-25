import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Flame, Cross, Droplets, Zap, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const WEAKNESSES = {
  sunlight: {
    icon: Sun,
    label: 'Sunlight Exposure',
    severity: 'fatal',
    description: 'Even indirect sunlight burns. Death in minutes.',
    resistance: 'Build tolerance through gradual exposure. Painful. Slow.'
  },
  fire: {
    icon: Flame,
    label: 'Fire',
    severity: 'severe',
    description: 'Burns worse than humans. Scars permanent.',
    resistance: 'Exposure therapy. Controlled burns. Build immunity.'
  },
  faith: {
    icon: Cross,
    label: 'True Faith',
    severity: 'moderate',
    description: 'Genuine belief repels you. Physical pain.',
    resistance: 'Confront believers. Resist the pain. Overcome.'
  },
  garlic: {
    icon: Droplets,
    label: 'Garlic',
    severity: 'minor',
    description: 'Nausea. Discomfort. Weakening.',
    resistance: 'Consume regularly. Build tolerance. Suffer through.'
  }
};

export default function VampireWeaknessModal({ onClose, vampireState }) {
  const queryClient = useQueryClient();
  const [training, setTraining] = useState(null);
  const [outcome, setOutcome] = useState('');

  const handleTrain = async (weakness) => {
    setTraining(weakness);

    const outcomes = {
      sunlight: [
        'You stepped into dawn light. Skin burning. Agony. But you endured. Slightly longer than before.',
        'Sunlight training. Painful. Your flesh smoked. But resistance grew.',
        'Dawn touched you. Burning. Screaming. Barely survived. Stronger now.'
      ],
      fire: [
        'You held your hand over flame. Burning. Healing. Burning. Tolerance building.',
        'Fire training. Pain beyond measure. But you\'re adapting.',
        'Burns covered your arm. Healing slowly. Resistance increased.'
      ],
      faith: [
        'You visited a church. The pain was intense. But you stayed. Fought it.',
        'Confronting faith. Crosses burned to look at. You stared anyway.',
        'Believer\'s prayer. It hurt. But less than before. Progress.'
      ],
      garlic: [
        'You ate garlic. Nausea. Vomiting. But you kept it down. Tolerance up.',
        'Garlic consumption. Your body rejected it. You forced it. Adapting.',
        'Garlic training. Disgusting. Painful. But easier than last time.'
      ]
    };

    const outcomeText = outcomes[weakness][Math.floor(Math.random() * outcomes[weakness].length)];
    setOutcome(outcomeText);

    setTimeout(async () => {
      if (vampireState.id) {
        await base44.entities.VampireState.update(vampireState.id, {
          weakness_resistance: Math.min(100, (vampireState.weakness_resistance || 0) + 5),
          humanity: Math.max(0, (vampireState.humanity || 50) - 2)
        });
      }

      await base44.entities.NightLog.create({
        entry: outcomeText,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setTraining(null);
        setOutcome('');
      }, 4000);
    }, 3000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Vampire Weaknesses</h2>
        <p className="text-gray-400 text-sm mb-4">
          Resistance: {vampireState.weakness_resistance || 0}/100
        </p>

        {outcome ? (
          <div className="text-center py-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-lg"
            >
              {outcome}
            </motion.p>
          </div>
        ) : training ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🔥
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              Enduring pain...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(WEAKNESSES).map(([key, weakness]) => {
              const Icon = weakness.icon;
              return (
                <div key={key} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Icon className="w-6 h-6 text-red-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white font-bold">{weakness.label}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          weakness.severity === 'fatal' ? 'bg-red-900 text-red-300' :
                          weakness.severity === 'severe' ? 'bg-orange-900 text-orange-300' :
                          weakness.severity === 'moderate' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {weakness.severity}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{weakness.description}</p>
                      <p className="text-purple-400 text-xs italic">{weakness.resistance}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTrain(key)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2 rounded-lg transition-all text-sm"
                  >
                    Train Resistance (-2 Humanity)
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}