import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Heart, Star, Swords } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const PERSONALITY_TRAITS = [
  { id: 'playful', label: 'Playful', icon: '🎮', color: 'bg-blue-600' },
  { id: 'aggressive', label: 'Aggressive', icon: '⚔️', color: 'bg-red-600' },
  { id: 'lazy', label: 'Lazy', icon: '😴', color: 'bg-gray-600' },
  { id: 'curious', label: 'Curious', icon: '🔍', color: 'bg-yellow-600' },
  { id: 'loyal', label: 'Loyal', icon: '❤️', color: 'bg-pink-600' },
  { id: 'independent', label: 'Independent', icon: '🦅', color: 'bg-purple-600' },
  { id: 'protective', label: 'Protective', icon: '🛡️', color: 'bg-green-600' },
  { id: 'mischievous', label: 'Mischievous', icon: '😈', color: 'bg-orange-600' },
  { id: 'affectionate', label: 'Affectionate', icon: '💕', color: 'bg-rose-600' },
  { id: 'calculating', label: 'Calculating', icon: '🧠', color: 'bg-indigo-600' },
  { id: 'fearless', label: 'Fearless', icon: '🔥', color: 'bg-amber-600' },
  { id: 'shy', label: 'Shy', icon: '🙈', color: 'bg-cyan-600' }
];

const SNAKE_MOODS = [
  { id: 'content', emoji: '😌', label: 'Content' },
  { id: 'playful', emoji: '😄', label: 'Playful' },
  { id: 'aggressive', emoji: '😠', label: 'Aggressive' },
  { id: 'sleepy', emoji: '😴', label: 'Sleepy' },
  { id: 'affectionate', emoji: '🥰', label: 'Affectionate' },
  { id: 'curious', emoji: '🤔', label: 'Curious' },
  { id: 'hungry', emoji: '🤤', label: 'Hungry' },
  { id: 'alert', emoji: '👀', label: 'Alert' }
];

export default function SnakePersonality({ snake, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTraits, setSelectedTraits] = useState(snake.personality_traits || []);
  const [selectedMood, setSelectedMood] = useState(snake.mood || 'content');

  const handleSave = async () => {
    await base44.entities.SnakeFamiliar.update(snake.id, {
      personality_traits: selectedTraits,
      mood: selectedMood
    });

    await base44.entities.NightLog.create({
      entry: `${snake.custom_name}'s personality solidified: ${selectedTraits.join(', ')}. Currently ${selectedMood}.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🐍 {snake.custom_name}'s Personality</h2>
        <p className="text-gray-400 text-sm mb-6">Define your snake's unique personality and current mood</p>

        {/* Personality Traits */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Personality Traits (Choose up to 3)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PERSONALITY_TRAITS.map(trait => (
              <button
                key={trait.id}
                onClick={() => {
                  if (selectedTraits.includes(trait.id)) {
                    setSelectedTraits(selectedTraits.filter(t => t !== trait.id));
                  } else if (selectedTraits.length < 3) {
                    setSelectedTraits([...selectedTraits, trait.id]);
                  }
                }}
                className={`${
                  selectedTraits.includes(trait.id) 
                    ? `${trait.color} text-white border-2 border-white` 
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                } rounded-lg p-3 transition-all text-sm font-medium`}
              >
                <div className="text-2xl mb-1">{trait.icon}</div>
                {trait.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Mood */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Current Mood</h3>
          <div className="grid grid-cols-4 gap-2">
            {SNAKE_MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`${
                  selectedMood === mood.id
                    ? 'bg-purple-600 text-white border-2 border-purple-400'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                } rounded-lg p-3 transition-all text-xs font-medium`}
              >
                <div className="text-3xl mb-1">{mood.emoji}</div>
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition-colors"
        >
          Save Personality
        </button>
      </motion.div>
    </motion.div>
  );
}