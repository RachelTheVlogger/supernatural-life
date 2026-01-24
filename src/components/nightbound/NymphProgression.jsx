import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Heart, Flower, ChevronRight } from 'lucide-react';
import NymphPowerTree from './NymphPowerTree';

const NYMPH_PATHS = [
  {
    id: 'nature_bond',
    name: 'Path of Nature\'s Love',
    description: 'Deepen your connection with all living things',
    icon: Flower,
    color: 'green',
    stat: 'nature_bond',
    maxLevel: 250
  },
  {
    id: 'water_purity',
    name: 'Path of Crystal Waters',
    description: 'Purify and master the waters you protect',
    icon: Droplets,
    color: 'cyan',
    stat: 'water_purity',
    maxLevel: 100
  },
  {
    id: 'compassion',
    name: 'Path of the Guardian',
    description: 'Save those in need and build your legacy',
    icon: Heart,
    color: 'pink',
    stat: 'humans_saved',
    maxLevel: 100
  }
];

export default function NymphProgression({ nymph }) {
  const [selectedPath, setSelectedPath] = useState(null);

  const getProgressPercentage = (currentValue, maxValue) => {
    return Math.min((currentValue / maxValue) * 100, 100);
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'from-green-600 to-teal-500 border-green-500/30',
      cyan: 'from-cyan-600 to-blue-500 border-cyan-500/30',
      pink: 'from-pink-600 to-rose-500 border-pink-500/30'
    };
    return colors[color];
  };

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-400',
      cyan: 'text-cyan-400',
      pink: 'text-pink-400'
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Your Nymph Progression</h2>

      {selectedPath ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => setSelectedPath(null)}
            className="text-teal-400 hover:text-teal-300 text-sm mb-4 flex items-center gap-1"
          >
            ← Back to Paths
          </button>
          <NymphPowerTree nymph={nymph} />
        </motion.div>
      ) : (
        <div className="space-y-4">
          {NYMPH_PATHS.map(path => {
            const Icon = path.icon;
            const currentValue = nymph?.[path.stat] || 0;
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