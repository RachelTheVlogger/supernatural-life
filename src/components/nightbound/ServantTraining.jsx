import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Sword, Briefcase, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const SPECIALIZATIONS = {
  seduction: {
    icon: Heart,
    label: 'Seduction',
    description: 'Train them to seduce, charm, and manipulate',
    benefits: '+50% OnlyFangs earnings, can recruit servants for you',
    training: [
      'You taught them how to move. Sensual. Hypnotic. They learned quickly.',
      'Seduction training. Eye contact. Touch. Voice. They practiced on you.',
      'You showed them how to read desire. They\'re getting good at this.',
      'Training in the art of temptation. They\'re a natural.',
      'You taught them to use their body as a weapon. Powerful.'
    ]
  },
  combat: {
    icon: Sword,
    label: 'Combat',
    description: 'Train them to fight and protect',
    benefits: 'Can defend against hunters, fight rival vampires',
    training: [
      'Combat training. They\'re fast. Learning to use vampire strength.',
      'You sparred. They landed a hit. Impressive. They\'re improving.',
      'Fighting techniques. They absorbed everything. Deadly now.',
      'You taught them to kill efficiently. No hesitation. Perfect.',
      'Combat mastery advancing. They\'re becoming dangerous.'
    ]
  },
  business: {
    icon: Briefcase,
    label: 'Business',
    description: 'Train them in management and wealth building',
    benefits: '+100% passive income, unlocks advanced business features',
    training: [
      'Business training. Numbers. Strategy. They\'re sharp.',
      'You taught them about investments. Money making money.',
      'Management skills developing. They can run empires now.',
      'Business acumen sharpening. They see opportunities everywhere.',
      'You made them a business genius. Profitable.'
    ]
  },
  espionage: {
    icon: Eye,
    label: 'Espionage',
    description: 'Train them in secrets and infiltration',
    benefits: 'Can spy on rivals, reduce exposure, gather intel',
    training: [
      'Espionage training. Shadows. Silence. Information gathering.',
      'You taught them to move unseen. To listen. To observe.',
      'Infiltration techniques. They can go anywhere now.',
      'Spy craft mastered. They extract secrets effortlessly.',
      'Perfect spy. They see everything. Report everything.'
    ]
  }
};

export default function ServantTraining({ servant, onClose }) {
  if (!servant) {
    return null;
  }

  const queryClient = useQueryClient();
  const [training, setTraining] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleTrain = async (spec) => {
    setTraining(true);

    const specialization = SPECIALIZATIONS[spec];
    const outcomeText = specialization.training[Math.floor(Math.random() * specialization.training.length)];
    
    setTimeout(async () => {
      setOutcome(outcomeText);

      await base44.entities.Servant.update(servant.id, {
        training_specialization: spec,
        relationship: Math.min(100, (servant.relationship || 0) + 15)
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name}: ${outcomeText}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        onClose();
      }, 4000);
    }, 2500);
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
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Train {servant.name}</h2>
        <p className="text-gray-400 text-sm mb-6">
          Choose their specialization. This is permanent and shapes their future.
        </p>

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
        ) : training ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              Training...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(SPECIALIZATIONS).map(([key, spec]) => {
              const Icon = spec.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleTrain(key)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-purple-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">{spec.label}</h3>
                      <p className="text-gray-400 text-sm mb-2">{spec.description}</p>
                      <p className="text-purple-400 text-xs italic">{spec.benefits}</p>
                    </div>
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