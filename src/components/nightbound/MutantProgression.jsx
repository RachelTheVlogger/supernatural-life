import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Brain, Heart, Zap as Lightning, Dna, Droplet } from 'lucide-react';

const MUTANT_PATHS = [
  {
    id: 'feral',
    name: 'Feral Instinct',
    description: 'Enhanced animal power, regeneration, primal force',
    icon: Zap,
    color: 'from-red-600 to-orange-600',
    stat: 'power_level',
    maxLevel: 100
  },
  {
    id: 'psychic',
    name: 'Psychic Mind',
    description: 'Telepathy, telekinesis, mental dominance',
    icon: Brain,
    color: 'from-purple-600 to-pink-600',
    stat: 'power_level',
    maxLevel: 100
  },
  {
    id: 'elemental',
    name: 'Elemental Command',
    description: 'Fire, ice, electricity, nature control',
    icon: Flame,
    color: 'from-blue-600 to-cyan-600',
    stat: 'power_level',
    maxLevel: 100
  },
  {
    id: 'healer',
    name: 'Healing Touch',
    description: 'Regeneration, cure, vitality restoration',
    icon: Heart,
    color: 'from-green-600 to-emerald-600',
    stat: 'power_level',
    maxLevel: 100
  },
  {
    id: 'enhanced',
    name: 'Enhanced Form',
    description: 'Super strength, speed, durability, senses',
    icon: Lightning,
    color: 'from-yellow-600 to-amber-600',
    stat: 'power_level',
    maxLevel: 100
  },
  {
    id: 'shapeshifter',
    name: 'Shape Shifter',
    description: 'Transform forms, mimic abilities, adapt',
    icon: Dna,
    color: 'from-indigo-600 to-violet-600',
    stat: 'power_level',
    maxLevel: 100
  },
  {
    id: 'toxic',
    name: 'Toxic Mastery',
    description: 'Poison, venom, contamination, toxins',
    icon: Droplet,
    color: 'from-green-700 to-lime-600',
    stat: 'power_level',
    maxLevel: 100
  }
];

export default function MutantProgression({ mutant, onSelectPath }) {
  const currentPath = MUTANT_PATHS.find(p => p.id === mutant?.mutant_type);
  const progress = Math.min(((mutant?.power_level || 0) / (currentPath?.maxLevel || 100)) * 100, 100);

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Mutation Paths
      </h3>

      <div className="space-y-3">
        {MUTANT_PATHS.map(path => {
          const Icon = path.icon;
          const isActive = path.id === mutant?.mutant_type;
          const pathProgress = isActive ? progress : 0;

          return (
            <motion.button
              key={path.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectPath?.(path)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? `bg-gradient-to-r ${path.color} border-white/50 shadow-lg`
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-1 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {path.name}
                  </h4>
                  <p className={`text-xs mb-3 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {path.description}
                  </p>
                  {isActive && (
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pathProgress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${path.color}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}