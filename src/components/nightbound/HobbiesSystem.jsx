import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Palette, Music, Dumbbell, Camera, Coffee, Book } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HOBBIES = [
  { id: 'painting', label: 'Painting', icon: Palette, stat: 'creativity', color: 'purple' },
  { id: 'music', label: 'Playing Music', icon: Music, stat: 'expression', color: 'pink' },
  { id: 'fitness', label: 'Working Out', icon: Dumbbell, stat: 'energy', color: 'orange' },
  { id: 'photography', label: 'Photography', icon: Camera, stat: 'observation', color: 'blue' },
  { id: 'cooking', label: 'Cooking', icon: Coffee, stat: 'care', color: 'yellow' },
  { id: 'reading', label: 'Reading', icon: Book, stat: 'knowledge', color: 'green' }
];

export default function HobbiesSystem({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [doing, setDoing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleDoHobby = async (hobby) => {
    setDoing(true);

    setTimeout(async () => {
      const relationshipGain = Math.floor(Math.random() * 5) + 3;
      const newRelationship = Math.min(100, (servant.relationship || 0) + relationshipGain);

      await base44.entities.Servant.update(servant.id, {
        relationship: newRelationship
      });

      const outcomes = {
        painting: [
          `${servant.name} painted for hours. Lost in the colors. You watched. They smiled at you.`,
          `Canvas covered in emotion. ${servant.name} showed you their work. "What do you think?"`,
          `Brushstrokes gentle. ${servant.name} painted while you sat nearby. Peaceful.`
        ],
        music: [
          `${servant.name} played their instrument. The melody filled the room. You closed your eyes.`,
          `Music flowing. ${servant.name} glanced at you between notes. Playing for you.`,
          `${servant.name} hummed softly while practicing. You joined in. They laughed.`
        ],
        fitness: [
          `${servant.name} worked out. You spotted them. Closer than necessary. They didn't mind.`,
          `Sweat and determination. ${servant.name} pushed themselves. You admired the dedication.`,
          `${servant.name} asked you to join. You did. They corrected your form. Hands lingering.`
        ],
        photography: [
          `${servant.name} took photos around the house. Several of you. "You're photogenic," they said.`,
          `Camera clicking. ${servant.name} captured moments. Asked if they could photograph you properly.`,
          `${servant.name} showed you their portfolio. Half the photos were of you. "My muse," they whispered.`
        ],
        cooking: [
          `${servant.name} cooked. Made your favorite. Insisted you taste test everything.`,
          `Kitchen filled with warmth. ${servant.name} hummed while cooking. Made enough for two.`,
          `${servant.name} taught you a recipe. Standing close. Guiding your hands.`
        ],
        reading: [
          `${servant.name} read on the couch. You sat beside them. They leaned against you naturally.`,
          `Book in hand. ${servant.name} read passages aloud. Just for you. Voice soft.`,
          `${servant.name} recommended a book. "It reminded me of us," they said quietly.`
        ]
      };

      const hobbyOutcomes = outcomes[hobby.id];
      const result = hobbyOutcomes[Math.floor(Math.random() * hobbyOutcomes.length)];

      await base44.entities.NightLog.create({
        entry: result + ` +${relationshipGain} relationship.`,
        category: 'interaction',
        intensity: 'subtle'
      });

      setOutcome(result);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setDoing(false);
        setOutcome('');
      }, 3500);
    }, 2000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-pink-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Hobbies</h2>
            <p className="text-gray-400 text-sm">Spend time with {servant.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {HOBBIES.map(hobby => {
            const Icon = hobby.icon;
            return (
              <button
                key={hobby.id}
                onClick={() => handleDoHobby(hobby)}
                disabled={doing}
                className={`bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-all disabled:opacity-50 text-left`}
              >
                <Icon className={`w-6 h-6 text-${hobby.color}-400 mb-2`} />
                <h3 className="text-white font-medium mb-1">{hobby.label}</h3>
                <p className="text-gray-400 text-xs capitalize">+{hobby.stat}</p>
              </button>
            );
          })}
        </div>

        {doing && (
          <div className="mt-6 text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-purple-400"
            >
              Spending time together...
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="mt-6 bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
            <p className="text-gray-300 text-center leading-relaxed">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}