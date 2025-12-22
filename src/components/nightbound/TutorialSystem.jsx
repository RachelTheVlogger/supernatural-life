import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, BookOpen, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const TUTORIALS = {
  welcome: {
    id: 'welcome',
    title: 'Welcome to Nightbound',
    steps: [
      {
        title: 'You are a vampire',
        content: 'Ancient. Powerful. Eternal. You exist in the shadows, feeding on the living.',
        icon: '🌙'
      },
      {
        title: 'Manage your hunger',
        content: 'The blood hunger is constant. Feed regularly or risk losing control.',
        icon: '🩸'
      },
      {
        title: 'Your servant awaits',
        content: 'A human has become enthralled to you. Their devotion grows deeper each night.',
        icon: '💜'
      },
      {
        title: 'Choose your path',
        content: 'Will you maintain your humanity, or embrace the monster within?',
        icon: '⚖️'
      }
    ]
  },
  
  house: {
    id: 'house',
    title: 'Your House',
    steps: [
      {
        title: 'Your sanctuary',
        content: 'This is where you rest between hunts. Each room serves a purpose.',
        icon: '🏠'
      },
      {
        title: 'Main Chamber',
        content: 'Meditate here to calm your hunger and center yourself.',
        icon: '🕯️'
      },
      {
        title: 'Library',
        content: 'Read ancient texts to unlock lore and vampire knowledge.',
        icon: '📚'
      },
      {
        title: 'The View',
        content: 'Observe the city. Choose your hunting grounds.',
        icon: '🌙'
      },
      {
        title: 'Your bed',
        content: 'Where dawn finds you. Rest and recover.',
        icon: '🛏️'
      }
    ]
  },

  servant: {
    id: 'servant',
    title: 'Servant Management',
    steps: [
      {
        title: 'Bond strength',
        content: 'Your bond with servants grows through interaction. Higher bonds unlock deeper connections.',
        icon: '💕'
      },
      {
        title: 'Servant variants',
        content: 'Devoted servants worship you. Defiant ones resist. Dreamers drift between worlds.',
        icon: '✨'
      },
      {
        title: 'Interactions',
        content: 'Touch, kiss, talk, feed - each interaction deepens your bond and unlocks new tiers.',
        icon: '🤝'
      },
      {
        title: 'Turning servants',
        content: 'At high bond levels, you can turn them into vampires. This changes everything.',
        icon: '🦇'
      },
      {
        title: 'Messages',
        content: 'Sense their thoughts through your bond. The connection runs deep.',
        icon: '💭'
      }
    ]
  },

  business: {
    id: 'business',
    title: 'Gothic Jewelry Business',
    steps: [
      {
        title: 'Your servant\'s craft',
        content: 'Your servant creates and sells gothic jewelry. A mundane life hiding an extraordinary secret.',
        icon: '💎'
      },
      {
        title: 'Materials & crafting',
        content: 'Buy materials (silver, moonstone, onyx) and craft jewelry pieces.',
        icon: '⚒️'
      },
      {
        title: 'Orders & shipping',
        content: 'Customers place orders. Craft items and ship them for income.',
        icon: '📦'
      },
      {
        title: 'Reviews',
        content: 'Satisfied customers leave reviews. Build your reputation.',
        icon: '⭐'
      },
      {
        title: 'Automation',
        content: 'Set up routines so your servant manages the business automatically.',
        icon: '⚙️'
      }
    ]
  },

  powers: {
    id: 'powers',
    title: 'Vampire Powers',
    steps: [
      {
        title: 'Evolution paths',
        content: 'Unlock powers through the Evolution Tree. Four paths: Persuasion, Shadow, Domination, Might.',
        icon: '⚡'
      },
      {
        title: 'Using powers',
        content: 'Powers can be used on servants, during hunts, and in special situations.',
        icon: '✨'
      },
      {
        title: 'Power mastery',
        content: 'Use powers repeatedly to increase mastery and unlock upgrades.',
        icon: '📈'
      },
      {
        title: 'Humanity cost',
        content: 'Some powers affect your humanity. Choose wisely.',
        icon: '⚖️'
      }
    ]
  },

  ripper: {
    id: 'ripper',
    title: 'Ripper Mode',
    steps: [
      {
        title: 'Lose control',
        content: 'Toggle Ripper Mode to embrace your savage nature. No mercy. Pure instinct.',
        icon: '🩸'
      },
      {
        title: 'Consequences',
        content: 'Ripper Mode affects how you interact with servants and the world. Relationships change.',
        icon: '⚠️'
      },
      {
        title: 'Humanity drops',
        content: 'Extended time in Ripper Mode lowers humanity. You may become a monster.',
        icon: '😈'
      }
    ]
  }
};

export default function TutorialSystem({ tutorialId, onComplete, onSkip }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);

  const { data: completedTutorials = [] } = useQuery({
    queryKey: ['tutorials'],
    queryFn: () => base44.entities.Tutorial.list()
  });

  const tutorial = TUTORIALS[tutorialId];
  const isCompleted = completedTutorials.some(t => t.tutorial_id === tutorialId && (t.completed || t.skipped));

  useEffect(() => {
    if (isCompleted) {
      setShow(false);
    }
  }, [isCompleted]);

  if (!show || !tutorial || isCompleted) return null;

  const step = tutorial.steps[currentStep];
  const isLastStep = currentStep === tutorial.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    await base44.entities.Tutorial.create({
      tutorial_id: tutorialId,
      completed: true
    });
    
    queryClient.invalidateQueries(['tutorials']);
    setShow(false);
    if (onComplete) onComplete();
  };

  const handleSkip = async () => {
    await base44.entities.Tutorial.create({
      tutorial_id: tutorialId,
      skipped: true
    });
    
    queryClient.invalidateQueries(['tutorials']);
    setShow(false);
    if (onSkip) onSkip();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-gray-900 to-purple-900/30 rounded-2xl p-8 max-w-lg w-full border-2 border-purple-500/30 shadow-2xl"
        >
          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {tutorial.steps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i <= currentStep ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl mb-6"
            >
              {step.icon}
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-3">
              {step.title}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {step.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              Skip All
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isLastStep ? (
                <>
                  <Check className="w-5 h-5" />
                  Got it!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Step indicator */}
          <p className="text-center text-gray-500 text-sm mt-4">
            {currentStep + 1} of {tutorial.steps.length}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}