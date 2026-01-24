import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Heart, Waves, ChevronRight } from 'lucide-react';
import SirenPowerTree from './SirenPowerTree';

const SIREN_PATHS = [
  {
    id: 'voice_mastery',
    name: 'Path of the Hypnotic Voice',
    description: 'Perfect your enchanting melodies',
    icon: Music,
    color: 'cyan',
    stat: 'voice_power',
    maxLevel: 250
  },
  {
    id: 'ocean_bond',
    name: 'Path of the Ocean',
    description: 'Master the waters that bind you',
    icon: Waves,
    color: 'blue',
    stat: 'water_affinity',
    maxLevel: 250
  },
  {
    id: 'seduction',
    name: 'Path of Seduction',
    description: 'Become irresistible to all',
    icon: Heart,
    color: 'pink',
    stat: 'charm_level',
    maxLevel: 250
  }
];

export default function SirenProgression({ siren }) {
  const [selectedPath, setSelectedPath] = useState(null);

  const getProgressPercentage = (currentValue, maxValue) => {
    return Math.min((currentValue / maxValue) * 100, 100);
  };

  const getColorClasses = (color) => {
    const colors = {
      cyan: 'from-cyan-600 to-cyan-500 border-cyan-500/30',
      blue: 'from-blue-600 to-blue-500 border-blue-500/30',
      pink: 'from-pink-600 to-pink-500 border-pink-500/30'
    };
    return colors[color];
  };

  const getIconColor = (color) => {
    const colors = {
      cyan: 'text-cyan-400',
      blue: 'text-blue-400',
      pink: 'text-pink-400'
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Your Siren Progression</h2>

      {selectedPath ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => setSelectedPath(null)}
            className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 flex items-center gap-1"
          >
            ← Back to Paths
          </button>
          <SirenPowerTree siren={siren} />
        </motion.div>
      ) : (
        <div className="space-y-4">
          {SIREN_PATHS.map(path => {
            const Icon = path.icon;
            const currentValue = siren?.[path.stat] || 0;
            const percentage = getProgressPercentage(currentValue, path.maxLevel);

            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-r ${getColorClasses(path.color)} bg-opacity-10 border-2 rounded-xl p-6 hover:bg-opacity-20 transition-all cursor-pointer`}
                onClick={() => setSelectedPath(path.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gray-800/50 ${getIconColor(path.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{path.name}</h3>
                      <p className="text-gray-400 text-sm">{path.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${getIconColor(path.color)}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{path.stat.replace(/_/g, ' ')}</span>
                    <span className={getIconColor(path.color)}>{Math.floor(currentValue)}/{path.maxLevel}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, type: 'spring' }}
                      className={`h-full bg-gradient-to-r ${getColorClasses(path.color)}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}