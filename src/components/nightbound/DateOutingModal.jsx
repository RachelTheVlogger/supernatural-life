import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Music, Wine, Theater, Moon, MapPin, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DATES = {
  theater: {
    icon: Theater,
    label: 'Theater',
    cost: 50,
    outcomes: {
      low: ['The play was beautiful. They held your hand in the dark.', 'Theater together. Shared culture. Shared silence.', 'They leaned against you. Performance forgotten.'],
      mid: ['The show ended. They kissed you in the dark theater.', 'You watched them more than the stage. Mesmerized.', 'Theater date. Intimate darkness. Perfect.'],
      high: ['You fucked in the theater bathroom during intermission. Dangerous. Thrilling.', 'The play forgotten. Hands wandering. Public risk.', 'Theater seats. Hidden touches. They came silently.']
    }
  },
  club: {
    icon: Music,
    label: 'Nightclub',
    cost: 75,
    outcomes: {
      low: ['Dancing together. Bodies close. Music loud.', 'Club lights. Pulsing beat. They moved with you.', 'Nightclub energy. They let loose.'],
      mid: ['Dancing became grinding. Everyone watched. Neither cared.', 'Club bathroom. Quick. Intense. Back to dancing.', 'They danced for you. Sensual. Intentional.'],
      high: ['You fucked them in the club. Dark corner. Music covering their moans. Risky. Perfect.', 'VIP room. Private. You used them while the club pulsed below.', 'Dance floor. Your hand under their clothes. They came standing, legs shaking.']
    }
  },
  restaurant: {
    icon: Wine,
    label: 'Fine Dining',
    cost: 100,
    outcomes: {
      low: ['Expensive wine. Good food. Better company.', 'Dinner conversation. Learning more about them.', 'They dressed up for you. Beautiful.'],
      mid: ['You fed them from your fork. Intimate gestures.', 'Under the table. Your hand on their thigh. Higher.', 'Wine made them bold. Confessions flowed.'],
      high: ['Bathroom sex between courses. Quickie. Returned flushed.', 'Your hand between their legs. They tried not to moan. Failed.', 'Made them cum at the table. Public. Hidden. Thrilling.']
    }
  },
  rooftop: {
    icon: Moon,
    label: 'Rooftop Views',
    cost: 0,
    outcomes: {
      low: ['City lights below. Stars above. Perfect moment.', 'Rooftop. Wind. Privacy. They opened up.', 'You kissed them under moonlight. Romantic.'],
      mid: ['Rooftop sex. City watching. They didn\'t care.', 'Against the railing. Wind and moans. Dangerous.', 'You took them on the rooftop. Stars witnessed.'],
      high: ['Fucked them on the edge. City lights below. Risk of falling. Heightened everything.', 'Rooftop. Edge play. Literal. They trusted you completely.', 'Sex on the rooftop. Loud. Shameless. The city heard them scream.']
    }
  },
  gallery: {
    icon: Camera,
    label: 'Art Gallery',
    cost: 40,
    outcomes: {
      low: ['Art appreciation together. Culture. Refinement.', 'They explained paintings. You listened.', 'Gallery wandering. Quiet connection.'],
      mid: ['Storage room. You made your own art on their skin.', 'Between sculptures. Hidden kisses. Secret touches.', 'Gallery after hours. Private viewing. Of each other.'],
      high: ['You fucked them against a priceless painting. Art in motion.', 'Gallery bathroom. Quick but intense. Came back to art.', 'Security caught you kissing. Banned for life. Worth it.']
    }
  }
};

export default function DateOutingModal({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleDate = async (dateType) => {
    setProcessing(true);
    setSelectedDate(dateType);

    const date = DATES[dateType];
    const rel = servant.relationship || 0;
    const tier = rel >= 60 ? 'high' : rel >= 30 ? 'mid' : 'low';
    
    const outcomeText = date.outcomes[tier][Math.floor(Math.random() * date.outcomes[tier].length)];

    setTimeout(async () => {
      setOutcome(outcomeText);

      const relGain = Math.floor(Math.random() * 10) + 10;
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + relGain)
      });

      await base44.entities.NightLog.create({
        entry: `Date with ${servant.name}: ${outcomeText}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        onClose();
      }, 4000);
    }, 2000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
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

        <h2 className="text-2xl font-bold text-white mb-2">Take {servant.name} Out</h2>
        <p className="text-gray-400 text-sm mb-6">Where do you want to go together?</p>

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
        ) : processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              ...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(DATES).map(([key, date]) => {
              const Icon = date.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleDate(key)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors flex items-center gap-3"
                >
                  <Icon className="w-6 h-6 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{date.label}</h3>
                    <p className="text-gray-400 text-xs">${date.cost}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}