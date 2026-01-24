import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Zap, Shield, ChevronRight } from 'lucide-react';
import HunterSkillTree from './HunterSkillTree';

const HUNTER_PATHS = [
  {
    id: 'combat_mastery',
    name: 'Path of the Slayer',
    description: 'Master weapons and combat techniques',
    icon: Crosshair,
    color: 'red',
    stat: 'combat_skill',
    maxLevel: 250
  },
  {
    id: 'supernatural_knowledge',
    name: 'Path of the Scholar',
    description: 'Understand your prey and their weaknesses',
    icon: Zap,
    color: 'yellow',
    stat: 'knowledge_level',
    maxLevel: 250
  },
  {
    id: 'survival',
    name: 'Path of the Survivor',
    description: 'Endure supernatural encounters',
    icon: Shield,
    color: 'orange',
    stat: 'survival_skill',
    maxLevel: 250
  }
];

export default function HunterProgression({ hunter }) {
  const [selectedPath, setSelectedPath] = useState(null);

  const getProgressPercentage = (currentValue, maxValue) => {
    return Math.min((currentValue / maxValue) * 100, 100);
  };

  const getColorClasses = (color) => {
    const colors = {
      red: 'from-red-600 to-orange-500 border-red-500/30',
      yellow: 'from-yellow-600 to-amber-500 border-yellow-500/30',
      orange: 'from-orange-600 to-red-500 border-orange-500/30'
    };
    return colors[color];
  };

  const getIconColor = (color) => {
    const colors = {
      red: 'text-red-400',
      yellow: 'text-yellow-400',
      orange: 'text-orange-400'
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Your Hunter Progression</h2>

      {selectedPath ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => setSelectedPath(null)}
            className="text-red-400 hover:text-red-300 text-sm mb-4 flex items-center gap-1"
          >
            ← Back to Paths
          </button>
          <HunterSkillTree hunter={hunter} />
        </motion.div>
      ) : (
        <div className="space-y-4">
          {HUNTER_PATHS.map(path => {
            const Icon = path.icon;
            const currentValue = hunter?.[path.stat] || 0;
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