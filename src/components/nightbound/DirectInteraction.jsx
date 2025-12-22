import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, MessageCircle, Eye, Hand, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTERACTIONS = {
  touch: {
    icon: Hand,
    label: 'Touch them',
    outcomes: {
      low: ['You brushed their hand. They flinched but didn\'t pull away.', 'Your fingers traced their jaw. Their breath caught.', 'You held their face. They closed their eyes.'],
      mid: ['You pulled them close. They leaned into you.', 'Your hand in their hair. They sighed softly.', 'You touched their neck. Their pulse quickened.'],
      high: ['They pressed against you, trembling.', 'You held them. They melted into your touch.', 'Your hands on their skin. They whispered your name.']
    }
  },
  kiss: {
    icon: Heart,
    label: 'Kiss them',
    outcomes: {
      low: ['A soft kiss. Hesitant. They stayed still.', 'You kissed them gently. They tensed, then relaxed.', 'Your lips on theirs. Brief. Careful.'],
      mid: ['You kissed them deeply. They responded eagerly.', 'They kissed you back with need.', 'Long, slow kiss. They didn\'t want it to end.'],
      high: ['Desperate kisses. Hands everywhere. Breathless.', 'You devoured them. They surrendered completely.', 'They kissed you like drowning, like breathing.']
    }
  },
  intimate: {
    icon: Sparkles,
    label: 'Be intimate',
    minRelationship: 40,
    outcomes: {
      mid: ['Skin on skin. Careful. Tender. They trusted you completely.', 'You undressed them slowly. They watched you with dark eyes.', 'Bodies intertwined. Time disappeared.'],
      high: ['Wild. Consuming. You took everything they offered.', 'They begged. You obliged. Perfect surrender.', 'Afterwards, they stayed in your arms. Utterly content.']
    }
  },
  talk: {
    icon: MessageCircle,
    label: 'Talk deeply',
    outcomes: {
      low: ['You asked about their life before. They spoke quietly.', 'They told you about their fears. You listened.', 'Conversation in low voices. Building trust.'],
      mid: ['They opened up about everything. You understood them.', 'You shared pieces of yourself. They treasured it.', 'Deep conversation until dawn approached.'],
      high: ['You talked about forever. They said yes.', 'No words needed anymore. You just know.', 'They confessed everything. You already knew.']
    }
  },
  observe: {
    icon: Eye,
    label: 'Watch them',
    outcomes: {
      low: ['You watched them move. They noticed. Looked away.', 'They tried not to meet your eyes. Failed.', 'You studied them. They pretended not to notice.'],
      mid: ['You watched them. They smiled, shy but pleased.', 'They moved for you. Wanting to be seen.', 'Your gaze followed them everywhere. They liked it.'],
      high: ['They performed for your eyes alone.', 'You looked at them like prey. They offered themselves.', 'They existed to be watched by you. Nothing else mattered.']
    }
  }
};

export default function DirectInteraction({ servant, vampireState, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [interactionType, setInteractionType] = useState('');
  const queryClient = useQueryClient();
  
  const getRelationshipTier = (rel) => {
    if (rel >= 60) return 'high';
    if (rel >= 30) return 'mid';
    return 'low';
  };
  
  const handleInteraction = async (type) => {
    setProcessing(true);
    setInteractionType(type);
    
    const interaction = INTERACTIONS[type];
    const rel = servant.relationship || 0;
    const tier = getRelationshipTier(rel);
    
    const outcomes = interaction.outcomes[tier] || interaction.outcomes.low;
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    setOutcome(outcome);
    
    setTimeout(async () => {
      // Calculate relationship gain based on interaction type
      const gains = {
        touch: [5, 10],
        kiss: [8, 15],
        intimate: [15, 25],
        talk: [10, 18],
        observe: [3, 7]
      };
      
      const [min, max] = gains[type];
      const relationshipGain = Math.floor(Math.random() * (max - min + 1)) + min;
      const newRel = Math.min((servant.relationship || 0) + relationshipGain, 100);
      
      await base44.entities.Servant.update(servant.id, {
        relationship: newRel,
        obsession_stage: Math.min(Math.floor(newRel / 20) + 1, 5)
      });
      
      await base44.entities.NightLog.create({
        entry: `With ${servant.name}: ${outcome}`,
        category: 'interaction',
        intensity: type === 'intimate' ? 'significant' : 'moderate'
      });
      
      // Update quest progress
      const quests = await base44.entities.Quest.filter({ servant_id: servant.id });
      const activeQuest = quests.find(q => !q.completed);
      if (activeQuest) {
        const progress = activeQuest.progress || {};
        const newCount = (progress.interact || 0) + 1;
        await base44.entities.Quest.update(activeQuest.id, {
          progress: { ...progress, interact: newCount }
        });
      }
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setInteractionType('');
        onClose();
      }, 5000);
    }, 2000);
  };
  
  const rel = servant.relationship || 0;
  
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
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {servant.name}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          They're here with you. What will you do?
        </p>
        
        {outcome ? (
          <div className="text-center py-12 relative overflow-hidden">
            {/* Animated particles based on interaction type */}
            {interactionType === 'kiss' && [...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  opacity: 1,
                  scale: 0 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100 - 50}%`,
                  opacity: 0,
                  scale: 1.5
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: 'easeOut'
                }}
              >
                ❤️
              </motion.div>
            ))}
            
            {interactionType === 'intimate' && [...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ 
                  x: '50%', 
                  y: '100%',
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: '-20%',
                  opacity: 0
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random(),
                  ease: 'easeOut'
                }}
              >
                {['🔥', '💋', '✨'][Math.floor(Math.random() * 3)]}
              </motion.div>
            ))}
            
            {interactionType === 'touch' && [...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity
                }}
              >
                ✨
              </motion.div>
            ))}
            
            {interactionType === 'observe' && [...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ 
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                  scale: 0.5
                }}
                animate={{ 
                  x: `${50 + Math.cos(i * Math.PI / 4) * 40}%`,
                  y: `${50 + Math.sin(i * Math.PI / 4) * 40}%`,
                  opacity: 0,
                  scale: 1
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
              >
                👁️
              </motion.div>
            ))}
            
            {interactionType === 'talk' && [...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm"
                initial={{ 
                  x: `${20 + Math.random() * 60}%`,
                  y: '100%',
                  opacity: 0
                }}
                animate={{ 
                  y: '-10%',
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: 'linear'
                }}
              >
                💬
              </motion.div>
            ))}
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-lg relative z-10"
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
            {Object.entries(INTERACTIONS).map(([key, interaction]) => {
              const disabled = interaction.minRelationship && rel < interaction.minRelationship;
              const Icon = interaction.icon;
              
              return (
                <button
                  key={key}
                  onClick={() => handleInteraction(key)}
                  disabled={disabled}
                  className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Icon className="w-5 h-5" />
                  <span>{interaction.label}</span>
                  {disabled && <span className="text-xs ml-auto">({interaction.minRelationship}% bond needed)</span>}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}