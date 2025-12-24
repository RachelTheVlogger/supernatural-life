import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Droplets, Zap, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const BLOOD_TYPES = {
  'O-': { rarity: 'universal', powerBoost: 1.5, description: 'Universal donor. Pure. Powerful. Rare.' },
  'O+': { rarity: 'common', powerBoost: 1.2, description: 'Common but potent. Reliable.' },
  'A-': { rarity: 'uncommon', powerBoost: 1.3, description: 'Uncommon. Clarity and focus.' },
  'A+': { rarity: 'common', powerBoost: 1.1, description: 'Common. Steady energy.' },
  'B-': { rarity: 'rare', powerBoost: 1.4, description: 'Rare. Heightened senses.' },
  'B+': { rarity: 'uncommon', powerBoost: 1.2, description: 'Uncommon. Strength boost.' },
  'AB-': { rarity: 'very rare', powerBoost: 1.6, description: 'Extremely rare. Maximum power.' },
  'AB+': { rarity: 'rare', powerBoost: 1.4, description: 'Rare. Versatile abilities.' }
};

export default function BloodTypeSystem({ onClose, vampireState, servants }) {
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (servant) => {
    setAnalyzing(true);

    setTimeout(async () => {
      const types = Object.keys(BLOOD_TYPES);
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      await base44.entities.Servant.update(servant.id, {
        blood_type: randomType
      });

      await base44.entities.NightLog.create({
        entry: `Analyzed ${servant.name}'s blood: ${randomType}. ${BLOOD_TYPES[randomType].description}`,
        category: 'observation',
        intensity: 'subtle'
      });

      queryClient.invalidateQueries();
      setAnalyzing(false);
    }, 2000);
  };

  const handleSetPreference = async (bloodType) => {
    if (vampireState.id) {
      await base44.entities.VampireState.update(vampireState.id, {
        blood_type_preference: bloodType
      });

      await base44.entities.NightLog.create({
        entry: `You developed a preference for ${bloodType} blood. Feeding on it grants ${BLOOD_TYPES[bloodType].powerBoost}x power boost.`,
        category: 'power',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
    }
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Blood Types</h2>
        <p className="text-gray-400 text-sm mb-4">
          Different blood types grant different power levels.
          {vampireState.blood_type_preference && ` Your preference: ${vampireState.blood_type_preference}`}
        </p>

        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Set Preferred Blood Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(BLOOD_TYPES).map(([type, info]) => (
              <button
                key={type}
                onClick={() => handleSetPreference(type)}
                className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center transition-colors ${
                  vampireState.blood_type_preference === type ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <Droplets className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-white font-bold">{type}</p>
                <p className="text-purple-400 text-xs">{info.powerBoost}x power</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3">Analyze Servants</h3>
          <div className="space-y-2">
            {servants.map(servant => (
              <div key={servant.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{servant.name}</p>
                  {servant.blood_type ? (
                    <p className="text-gray-400 text-sm">
                      Type: <span className="text-red-400">{servant.blood_type}</span>
                      {' • '}
                      <span className="text-purple-400">{BLOOD_TYPES[servant.blood_type].powerBoost}x boost</span>
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">Unknown type</p>
                  )}
                </div>
                {!servant.blood_type && (
                  <button
                    onClick={() => handleAnalyze(servant)}
                    disabled={analyzing}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}