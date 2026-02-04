import React from 'react';
import { motion } from 'framer-motion';

const TITLE_PAIRS = [
  {
    id: 'master',
    dominant: 'Master',
    submissive: 'Slave',
    traditional: true,
    icon: '👑'
  },
  {
    id: 'mistress',
    dominant: 'Mistress',
    submissive: 'Slave',
    traditional: true,
    icon: '👑'
  },
  {
    id: 'sir',
    dominant: 'Sir',
    submissive: 'Sub',
    traditional: true,
    icon: '🎩'
  },
  {
    id: 'madam',
    dominant: 'Madam',
    submissive: 'Sub',
    traditional: true,
    icon: '🎩'
  },
  {
    id: 'daddy',
    dominant: 'Daddy',
    submissive: 'Baby',
    playful: true,
    icon: '💕'
  },
  {
    id: 'mommy',
    dominant: 'Mommy',
    submissive: 'Baby',
    playful: true,
    icon: '💕'
  },
  {
    id: 'lord',
    dominant: 'Lord',
    submissive: 'Servant',
    traditional: true,
    icon: '⚜️'
  },
  {
    id: 'queen',
    dominant: 'Queen',
    submissive: 'Servant',
    traditional: true,
    icon: '⚜️'
  },
  {
    id: 'boss',
    dominant: 'Boss',
    submissive: 'Employee',
    modern: true,
    icon: '💼'
  },
  {
    id: 'professor',
    dominant: 'Professor',
    submissive: 'Student',
    modern: true,
    icon: '📚'
  }
];

// Get appropriate titles based on character gender
export const getTitlesForGender = (dominantGender, submissiveGender) => {
  const titles = [];

  // Always include universal options
  titles.push(TITLE_PAIRS.find(t => t.id === 'sir'));
  titles.push(TITLE_PAIRS.find(t => t.id === 'boss'));

  // Gender-specific
  if (dominantGender === 'woman') {
    titles.push(TITLE_PAIRS.find(t => t.id === 'mistress'));
    titles.push(TITLE_PAIRS.find(t => t.id === 'madam'));
    titles.push(TITLE_PAIRS.find(t => t.id === 'queen'));
    titles.push(TITLE_PAIRS.find(t => t.id === 'mommy'));
  } else if (dominantGender === 'man') {
    titles.push(TITLE_PAIRS.find(t => t.id === 'master'));
    titles.push(TITLE_PAIRS.find(t => t.id === 'lord'));
    titles.push(TITLE_PAIRS.find(t => t.id === 'daddy'));
  } else {
    titles.push(TITLE_PAIRS.find(t => t.id === 'master'));
    titles.push(TITLE_PAIRS.find(t => t.id === 'mistress'));
  }

  // Always include academic/modern
  titles.push(TITLE_PAIRS.find(t => t.id === 'professor'));

  return titles.filter(Boolean);
};

export default function TitleSelector({ dominantGender, submissiveGender, onSelect, selectedTitle }) {
  const availableTitles = getTitlesForGender(dominantGender, submissiveGender);

  return (
    <div className="space-y-3">
      <p className="text-gray-400 text-sm mb-4">How should they address you?</p>
      {availableTitles.map((title, i) => (
        <motion.button
          key={title.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(title)}
          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
            selectedTitle?.id === title.id
              ? 'bg-gradient-to-r from-pink-900/60 to-purple-900/60 border-pink-500'
              : 'bg-black/40 border-gray-600 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{title.icon}</span>
            <div>
              <p className="text-white font-medium">
                {title.dominant} / {title.submissive}
              </p>
              <p className="text-gray-400 text-xs">
                {title.traditional ? 'Traditional' : title.playful ? 'Intimate' : 'Modern'}
              </p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}