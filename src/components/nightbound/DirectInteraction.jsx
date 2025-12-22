import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Eye, Hand, Sparkles, Zap, Coffee, Music, Book, Utensils, Wine, Flame, Moon, Droplets, Wind, Smile } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import PowerUsage from './PowerUsage';

const getVariantModifier = (variant, category) => {
  const modifiers = {
    devoted: { physical: 1.2, social: 1.3, activity: 1.1, power: 1.0 },
    defiant: { physical: 0.8, social: 0.9, activity: 1.0, power: 0.7 },
    dreamer: { physical: 1.0, social: 1.1, activity: 1.3, power: 1.2 }
  };
  return modifiers[variant]?.[category] || 1.0;
};

const getVariantFlavor = (variant, tier, obsessionStage) => {
  const flavors = {
    devoted: {
      low: [' Their eyes never leave you.', ' They look at you with pure devotion.', ' Every moment with you is sacred to them.'],
      mid: [' They exist to please you.', ' Your happiness is their purpose.', ' They worship you.'],
      high: [' They are utterly yours.', ' Complete surrender. Complete devotion.', ' Nothing exists but you.']
    },
    defiant: {
      low: [' They hate how much they want this.', ' Conflicted. Resistant. Yet here.', ' Their pride wars with their desire.'],
      mid: [' The fight is leaving them.', ' Resistance crumbling.', ' They\'re losing themselves in you.'],
      high: [' All defiance gone. Only need remains.', ' They have surrendered completely.', ' You broke them. They thank you for it.']
    },
    dreamer: {
      low: [' They seem distant, somewhere else.', ' Reality blurs around them.', ' Lost in their own world.'],
      mid: [' Time doesn\'t work right around you.', ' They drift between worlds.', ' You\'re the only real thing.'],
      high: [' They exist in your shadow now.', ' Reality is just a dream. You are truth.', ' Completely untethered. Floating.']
    }
  };
  
  const flavorSet = flavors[variant]?.[tier] || flavors.devoted.low;
  return flavorSet[Math.floor(Math.random() * flavorSet.length)];
};

const INTERACTIONS = {
  // Physical - Intimate
  touch: {
    icon: Hand,
    label: 'Touch them',
    category: 'physical',
    gains: [5, 10],
    outcomes: {
      low: ['You brushed their hand. They flinched but didn\'t pull away.', 'Your fingers traced their jaw. Their breath caught.', 'You held their face. They closed their eyes.'],
      mid: ['You pulled them close. They leaned into you.', 'Your hand in their hair. They sighed softly.', 'You touched their neck. Their pulse quickened.'],
      high: ['They pressed against you, trembling.', 'You held them. They melted into your touch.', 'Your hands on their skin. They whispered your name.']
    }
  },
  kiss: {
    icon: Heart,
    label: 'Kiss them',
    category: 'physical',
    gains: [8, 15],
    outcomes: {
      low: ['A soft kiss. Hesitant. They stayed still.', 'You kissed them gently. They tensed, then relaxed.', 'Your lips on theirs. Brief. Careful.'],
      mid: ['You kissed them deeply. They responded eagerly.', 'They kissed you back with need.', 'Long, slow kiss. They didn\'t want it to end.'],
      high: ['Desperate kisses. Hands everywhere. Breathless.', 'You devoured them. They surrendered completely.', 'They kissed you like drowning, like breathing.']
    }
  },
  cuddle: {
    icon: Smile,
    label: 'Cuddle',
    category: 'physical',
    gains: [6, 12],
    outcomes: {
      low: ['You held them carefully. They were stiff at first.', 'They leaned against you hesitantly.', 'Awkward closeness. Slowly relaxing.'],
      mid: ['They curled into you. Perfect fit.', 'You wrapped around them. They sighed contentedly.', 'Warmth. Safety. They didn\'t want to move.'],
      high: ['Tangled together. No separation. Pure comfort.', 'They nuzzled into your neck. Utterly at peace.', 'Hours passed. Neither of you noticed.']
    }
  },
  makeout: {
    icon: Flame,
    label: 'Make out',
    category: 'physical',
    minRelationship: 30,
    gains: [12, 20],
    outcomes: {
      mid: ['Heated kisses. Exploring hands. Growing intensity.', 'You pushed them against the wall. They gasped.', 'Breathless. Flushed. Wanting more.'],
      high: ['Consuming passion. You couldn\'t get close enough.', 'They pulled you down. Desperate. Hungry.', 'Time stopped. Only sensation remained.']
    }
  },
  intimate: {
    icon: Sparkles,
    label: 'Be intimate',
    category: 'physical',
    minRelationship: 40,
    gains: [15, 25],
    outcomes: {
      mid: ['Skin on skin. Careful. Tender. They trusted you completely.', 'You undressed them slowly. They watched you with dark eyes.', 'Bodies intertwined. Time disappeared.'],
      high: ['Wild. Consuming. You took everything they offered.', 'They begged. You obliged. Perfect surrender.', 'Afterwards, they stayed in your arms. Utterly content.']
    }
  },
  bite: {
    icon: Droplets,
    label: 'Bite (feed)',
    category: 'physical',
    minRelationship: 20,
    gains: [10, 18],
    outcomes: {
      low: ['You bit carefully. They whimpered but stayed still.', 'Your fangs pierced skin. They trembled.', 'You fed. They gasped. Fear mixed with something else.'],
      mid: ['You bit. They moaned softly. Pleasure and pain.', 'They offered their neck willingly. You drank deep.', 'Your fangs sank in. They shuddered with pleasure.'],
      high: ['They begged you to bite. You obliged. Ecstasy.', 'You fed. They came undone beneath you.', 'Feeding became intimacy. They craved your bite.']
    }
  },
  
  // Social - Connection
  talk: {
    icon: MessageCircle,
    label: 'Talk deeply',
    category: 'social',
    gains: [10, 18],
    outcomes: {
      low: ['You asked about their life before. They spoke quietly.', 'They told you about their fears. You listened.', 'Conversation in low voices. Building trust.'],
      mid: ['They opened up about everything. You understood them.', 'You shared pieces of yourself. They treasured it.', 'Deep conversation until dawn approached.'],
      high: ['You talked about forever. They said yes.', 'No words needed anymore. You just know.', 'They confessed everything. You already knew.']
    }
  },
  joke: {
    icon: Smile,
    label: 'Joke around',
    category: 'social',
    gains: [5, 10],
    outcomes: {
      low: ['You made them smile. Small victory.', 'They laughed softly. Walls lowering.', 'Playful banter. They relaxed.'],
      mid: ['Genuine laughter. Their eyes lit up.', 'You teased them. They blushed and smiled.', 'Joy. Lightness. Connection.'],
      high: ['Inside jokes. Your private language.', 'They laughed until tears came. Beautiful.', 'You made them forget everything but this moment.']
    }
  },
  compliment: {
    icon: Heart,
    label: 'Compliment',
    category: 'social',
    gains: [4, 8],
    outcomes: {
      low: ['You praised them. They looked away, uncertain.', 'They didn\'t believe you. Yet.', 'Your words made them blush slightly.'],
      mid: ['You told them they\'re beautiful. They glowed.', 'Your compliment hit deep. They needed to hear it.', 'They smiled. Genuine. Pleased.'],
      high: ['Your words made them melt. They know you mean it.', 'You see them completely. They feel treasured.', 'Every compliment feels like worship to them now.']
    }
  },
  confess: {
    icon: Heart,
    label: 'Confess feelings',
    category: 'social',
    minRelationship: 50,
    gains: [20, 30],
    outcomes: {
      mid: ['You told them what they mean to you. They cried.', 'Your confession changed everything. They said it back.', 'Words hung between you. Sacred.'],
      high: ['I love you. They already knew. They feel it too.', 'You laid your heart bare. They held it carefully.', 'Forever pledged. Bonds deepened.']
    }
  },
  
  // Activities - Shared experiences
  observe: {
    icon: Eye,
    label: 'Watch them',
    category: 'activity',
    gains: [3, 7],
    outcomes: {
      low: ['You watched them move. They noticed. Looked away.', 'They tried not to meet your eyes. Failed.', 'You studied them. They pretended not to notice.'],
      mid: ['You watched them. They smiled, shy but pleased.', 'They moved for you. Wanting to be seen.', 'Your gaze followed them everywhere. They liked it.'],
      high: ['They performed for your eyes alone.', 'You looked at them like prey. They offered themselves.', 'They existed to be watched by you. Nothing else mattered.']
    }
  },
  coffee: {
    icon: Coffee,
    label: 'Share a drink',
    category: 'activity',
    gains: [5, 10],
    outcomes: {
      low: ['You poured them wine. They sipped carefully.', 'Drinks together. Comfortable silence.', 'They watched you over the rim of their glass.'],
      mid: ['You shared wine. Intimate. Relaxed.', 'They got tipsy. Looser. More honest.', 'Drinks led to confessions. Barriers dropped.'],
      high: ['You fed them wine from your lips. Intoxicating.', 'Drunk on you more than alcohol.', 'The drink was just an excuse to be close.']
    }
  },
  music: {
    icon: Music,
    label: 'Listen to music',
    category: 'activity',
    gains: [6, 11],
    outcomes: {
      low: ['Music played. You sat together. Peaceful.', 'They hummed along softly.', 'Shared silence. Shared sound.'],
      mid: ['They rested their head on you. Music surrounded you both.', 'You swayed together gently.', 'The music said what words couldn\'t.'],
      high: ['You danced slowly. Bodies pressed together.', 'Music became your heartbeat. Synchronized.', 'Lost in sound. Lost in each other.']
    }
  },
  read: {
    icon: Book,
    label: 'Read together',
    category: 'activity',
    gains: [7, 13],
    outcomes: {
      low: ['You read aloud. They listened.', 'Books between you. Safe distance.', 'They watched you read. Mesmerized.'],
      mid: ['You read poetry. They understood every word meant them.', 'Sharing stories. Sharing worlds.', 'They laid their head on your shoulder while you read.'],
      high: ['Words became foreplay. You didn\'t finish the book.', 'You quoted passages. They quoted back. Your language.', 'Reading forgotten. You memorized each other instead.']
    }
  },
  cook: {
    icon: Utensils,
    label: 'Cook for them',
    category: 'activity',
    gains: [8, 14],
    outcomes: {
      low: ['You prepared food. They ate quietly.', 'Your effort showed. They appreciated it.', 'Care expressed through cooking.'],
      mid: ['You cooked. They watched you work. Intimate.', 'They helped. Working together. Laughter.', 'You fed them directly. They closed their eyes.'],
      high: ['Cooking became seduction. Every gesture intentional.', 'They licked your fingers. Food forgotten.', 'Nourishment of body and soul.']
    }
  },
  stargaze: {
    icon: Moon,
    label: 'Stargaze',
    category: 'activity',
    gains: [9, 16],
    outcomes: {
      low: ['You looked at stars together. Quiet companionship.', 'They pointed out constellations.', 'Night sky. Shared wonder.'],
      mid: ['They moved closer. Stars reflected in their eyes.', 'You talked about infinity. They held your hand.', 'Under the stars, barriers dissolved.'],
      high: ['They said the stars were nothing compared to you.', 'You kissed under moonlight. Perfect moment.', 'The universe witnessed your connection.']
    }
  },
  
  // Vampire powers (requires unlocked powers)
  usePower: {
    icon: Zap,
    label: 'Use Power',
    category: 'power',
    special: true,
    gains: [0, 0]
  }
};

export default function DirectInteraction({ servant, vampireState, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [interactionType, setInteractionType] = useState('');
  const [showPowers, setShowPowers] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();
  
  const getRelationshipTier = (rel) => {
    if (rel >= 60) return 'high';
    if (rel >= 30) return 'mid';
    return 'low';
  };
  
  const handleInteraction = async (type) => {
    if (type === 'usePower') {
      setShowPowers(true);
      return;
    }
    
    setProcessing(true);
    setInteractionType(type);
    
    const interaction = INTERACTIONS[type];
    const rel = servant.relationship || 0;
    const tier = getRelationshipTier(rel);
    
    const outcomes = interaction.outcomes[tier] || interaction.outcomes.low;
    const baseOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    // Add variant-specific flavor
    const variantFlavor = getVariantFlavor(servant.variant, tier, servant.obsession_stage);
    const outcome = baseOutcome + variantFlavor;
    
    setOutcome(outcome);
    
    setTimeout(async () => {
      const [min, max] = interaction.gains;
      const baseGain = Math.floor(Math.random() * (max - min + 1)) + min;
      
      // Apply variant modifier
      const modifier = getVariantModifier(servant.variant, interaction.category);
      const relationshipGain = Math.round(baseGain * modifier);
      const newRel = Math.min((servant.relationship || 0) + relationshipGain, 100);
      
      // Update emotional state based on variant and new relationship
      const emotionalStates = {
        devoted: ['shy', 'longing', 'devoted', 'worshipful', 'transcendent'],
        defiant: ['conflicted', 'resistant', 'surrendering', 'accepting', 'bound'],
        dreamer: ['distant', 'drifting', 'fading', 'ethereal', 'dissolved']
      };
      const stateIndex = Math.min(Math.floor(newRel / 20), 4);
      const newEmotionalState = emotionalStates[servant.variant][stateIndex];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: newRel,
        obsession_stage: Math.min(Math.floor(newRel / 20) + 1, 5),
        emotional_state: newEmotionalState,
        last_interaction: new Date().toISOString()
      });
      
      // Determine humanity impact of interaction
      let humanityChange = 0;
      if (interaction.category === 'social') humanityChange = 1; // Positive interactions
      else if (['bite', 'intimate'].includes(type) && rel < 40) humanityChange = -2; // Forcing intimacy
      
      // Update vampire state with humanity
      if (humanityChange !== 0 && vampireState.id) {
        const newHumanity = Math.max(0, Math.min(100, (vampireState.humanity ?? 50) + humanityChange));
        let moral_path = 'balanced';
        if (newHumanity >= 75) moral_path = 'humane';
        else if (newHumanity >= 25) moral_path = 'balanced';
        else if (newHumanity >= 10) moral_path = 'ruthless';
        else moral_path = 'monster';
        
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: newHumanity,
          moral_path: moral_path
        });
      }
      
      await base44.entities.NightLog.create({
        entry: `With ${servant.name}: ${outcome}`,
        category: 'interaction',
        intensity: ['intimate', 'makeout', 'bite'].includes(type) ? 'significant' : 'moderate'
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
      }, 5000);
    }, 2000);
  };
  
  const rel = servant.relationship || 0;
  
  const categories = ['all', 'physical', 'social', 'activity', 'power'];
  const filteredInteractions = Object.entries(INTERACTIONS).filter(([key, interaction]) => {
    if (selectedCategory === 'all') return true;
    return interaction.category === selectedCategory;
  });
  
  return (
    <>
      <AnimatePresence>
        {showPowers && (
          <PowerUsage
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowPowers(false)}
            onPowerUsed={() => {
              setShowPowers(false);
              queryClient.invalidateQueries();
              onClose();
            }}
          />
        )}
      </AnimatePresence>
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
        <p className="text-gray-400 text-sm mb-4">
          They're here with you. What will you do?
        </p>
        
        {/* Category filter */}
        {!outcome && !processing && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
        
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
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredInteractions.map(([key, interaction]) => {
              const disabled = interaction.minRelationship && rel < interaction.minRelationship;
              const Icon = interaction.icon;
              
              return (
                <button
                  key={key}
                  onClick={() => handleInteraction(key)}
                  disabled={disabled}
                  className="bitlife-btn w-full rounded-xl py-3 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{interaction.label}</span>
                  {disabled && <span className="text-xs ml-auto">({interaction.minRelationship}+)</span>}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
    </>
  );
}