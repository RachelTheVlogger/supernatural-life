import React from 'react';
import { motion } from 'framer-motion';

const PERSONALITY_TRAITS = [
  { value: 'sweet', label: 'Sweet', icon: '🌸', color: 'from-pink-600 to-pink-400' },
  { value: 'bratty', label: 'Bratty', icon: '😤', color: 'from-orange-600 to-orange-400' },
  { value: 'bitchy', label: 'Bitchy', icon: '💅', color: 'from-red-600 to-red-400' },
  { value: 'submissive', label: 'Submissive', icon: '🙇', color: 'from-purple-600 to-purple-400' },
  { value: 'dominant', label: 'Dominant', icon: '👑', color: 'from-indigo-600 to-indigo-400' },
  { value: 'sarcastic', label: 'Sarcastic', icon: '🙄', color: 'from-cyan-600 to-cyan-400' },
  { value: 'clingy', label: 'Clingy', icon: '🤗', color: 'from-pink-600 to-purple-400' },
  { value: 'independent', label: 'Independent', icon: '💪', color: 'from-blue-600 to-blue-400' },
  { value: 'manipulative', label: 'Manipulative', icon: '🎭', color: 'from-violet-600 to-violet-400' },
  { value: 'naive', label: 'Naive', icon: '😇', color: 'from-yellow-600 to-yellow-400' },
  { value: 'ambitious', label: 'Ambitious', icon: '🚀', color: 'from-emerald-600 to-emerald-400' },
  { value: 'lazy', label: 'Lazy', icon: '😴', color: 'from-gray-600 to-gray-400' },
  { value: 'jealous', label: 'Jealous', icon: '😠', color: 'from-green-600 to-green-400' },
  { value: 'loyal', label: 'Loyal', icon: '🛡️', color: 'from-blue-600 to-indigo-400' },
  { value: 'chaotic', label: 'Chaotic', icon: '🌪️', color: 'from-red-600 to-purple-400' },
  { value: 'cold', label: 'Cold', icon: '🧊', color: 'from-cyan-600 to-blue-400' },
  { value: 'warm', label: 'Warm', icon: '☀️', color: 'from-orange-600 to-yellow-400' },
  { value: 'tsundere', label: 'Tsundere', icon: '😳', color: 'from-pink-600 to-red-400' },
  { value: 'sadistic', label: 'Sadistic', icon: '😈', color: 'from-red-700 to-black' },
  { value: 'controlling', label: 'Controlling', icon: '🎮', color: 'from-purple-700 to-purple-500' },
  { value: 'possessive', label: 'Possessive', icon: '⛓️', color: 'from-red-600 to-pink-600' },
  { value: 'charming', label: 'Charming', icon: '✨', color: 'from-yellow-500 to-pink-500' }
];

export default function PersonalitySelector({ selected, onSelect, filterTraits = null }) {
  const traits = filterTraits ? PERSONALITY_TRAITS.filter(t => filterTraits.includes(t.value)) : PERSONALITY_TRAITS;

  return (
    <div>
      <label className="text-white font-medium mb-3 block">Personality</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[40vh] overflow-y-auto p-1">
        {traits.map(trait => (
          <motion.button
            key={trait.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(trait.value)}
            className={`relative rounded-xl p-3 text-center transition-all ${
              selected === trait.value
                ? `bg-gradient-to-br ${trait.color} text-white shadow-lg ring-2 ring-white`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="text-2xl mb-1">{trait.icon}</div>
            <div className="text-xs font-medium">{trait.label}</div>
            {selected === trait.value && (
              <div className="absolute -top-1 -right-1 bg-white text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}