import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Eye, Hand, Sparkles, Zap, Coffee, Music, Book, Utensils, Wine, Flame, Moon, Droplets, Wind, Smile, Lock, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
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

const TURNED_VAMPIRE_INTERACTIONS = {
  vampireFeed: {
    icon: Droplets,
    label: 'Feed together',
    category: 'vampire',
    tier: 1,
    gains: [20, 35],
    outcomes: {
      mid: ['You hunted together. Blood shared. Primal connection.', 'Two vampires. One prey. Intimate violence.', 'You fed side by side. Their hunger matched yours.'],
      high: ['You bit them while they fed. Ecstasy doubled. Perfect.', 'Feeding became foreplay. Blood and lust intertwined.', 'You shared the kill. The bond deepened impossibly.']
    }
  },
  vampireSex: {
    icon: Flame,
    label: 'Vampire intimacy',
    category: 'vampire',
    tier: 1,
    minRelationship: 50,
    gains: [25, 40],
    outcomes: {
      mid: ['Vampire bodies. Supernatural stamina. Hours passed like moments.', 'They felt everything deeper now. Every touch electric.', 'Turned. Heightened senses. The pleasure was overwhelming.'],
      high: ['Two immortals. Endless night. Consuming passion.', 'You fucked like vampires. Wild. Dangerous. Perfect.', 'Supernatural pleasure. You broke furniture. Neither noticed.', 'They felt everything infinitely more. Screamed your name for hours.']
    }
  },
  vampireHunt: {
    icon: Moon,
    label: 'Hunt together',
    category: 'vampire',
    tier: 1,
    gains: [15, 25],
    outcomes: {
      mid: ['You stalked prey together. Teaching them your ways.', 'Two predators in the night. Perfectly synchronized.', 'They moved like you now. Supernatural. Deadly.'],
      high: ['You hunted as one. No words needed. Perfect unity.', 'Twin shadows. The city was yours together.', 'They\'ve become your perfect hunting companion.']
    }
  }
};

const INTERACTIONS = {
  // Physical - Tier 1 (Always available)
  touch: {
    icon: Hand,
    label: 'Touch them',
    category: 'physical',
    tier: 1,
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
    tier: 1,
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
    tier: 1,
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
    tier: 2,
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
    tier: 2,
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
    tier: 2,
    minRelationship: 20,
    gains: [10, 18],
    outcomes: {
      low: ['You bit carefully. They whimpered but stayed still.', 'Your fangs pierced skin. They trembled.', 'You fed. They gasped. Fear mixed with something else.'],
      mid: ['You bit. They moaned softly. Pleasure and pain.', 'They offered their neck willingly. You drank deep.', 'Your fangs sank in. They shuddered with pleasure.'],
      high: ['They begged you to bite. You obliged. Ecstasy.', 'You fed. They came undone beneath you.', 'Feeding became intimacy. They craved your bite.']
    }
  },
  roughSex: {
    icon: Flame,
    label: 'Rough intimacy',
    category: 'physical',
    tier: 3,
    minRelationship: 60,
    gains: [20, 30],
    outcomes: {
      mid: ['Rough. Intense. They wanted it harder.', 'You pinned them down. They begged for more.', 'Wild. Animalistic. Perfect.'],
      high: ['You fucked them savagely. They loved every second.', 'Marks. Bruises. Screaming. Ecstasy.', 'Complete domination. They surrendered utterly.']
    }
  },
  worship: {
    icon: Star,
    label: 'Let them worship you',
    category: 'physical',
    tier: 4,
    minRelationship: 70,
    gains: [25, 35],
    outcomes: {
      mid: ['They worshipped your body. Every inch. Devoted.', 'On their knees. Serving you. Perfect submission.', 'They treated you like a god. You allowed it.'],
      high: ['Hours of worship. They existed only to please you.', 'Complete devotion. Your pleasure was their religion.', 'They served you endlessly. You took everything.']
    }
  },
  
  // Social - Tier 1
  talk: {
    icon: MessageCircle,
    label: 'Talk deeply',
    category: 'social',
    tier: 1,
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
    tier: 1,
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
    tier: 1,
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
    tier: 2,
    minRelationship: 50,
    gains: [20, 30],
    outcomes: {
      mid: ['You told them what they mean to you. They cried.', 'Your confession changed everything. They said it back.', 'Words hung between you. Sacred.'],
      high: ['I love you. They already knew. They feel it too.', 'You laid your heart bare. They held it carefully.', 'Forever pledged. Bonds deepened.']
    }
  },
  shareSecret: {
    icon: MessageCircle,
    label: 'Share a secret',
    category: 'social',
    tier: 3,
    minRelationship: 60,
    gains: [15, 25],
    outcomes: {
      mid: ['You told them something you never tell anyone.', 'A secret shared. The bond deepened.', 'They held your secret carefully. Sacred.'],
      high: ['Complete honesty. No more walls between you.', 'You told them everything. They understood.', 'Secrets exchanged. Total trust.']
    }
  },
  promise: {
    icon: Heart,
    label: 'Make a promise',
    category: 'social',
    tier: 4,
    minRelationship: 70,
    gains: [20, 35],
    outcomes: {
      mid: ['You promised them forever. You meant it.', 'A vow made. Unbreakable.', 'Your promise hung in the air. Sacred.'],
      high: ['Forever pledged. Nothing could break this.', 'You swore eternity. They believed you.', 'An eternal promise. Binding.']
    }
  },
  
  // Activity - Tier 1
  observe: {
    icon: Eye,
    label: 'Watch them',
    category: 'activity',
    tier: 1,
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
    tier: 1,
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
    tier: 1,
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
    tier: 2,
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
    tier: 2,
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
    tier: 2,
    gains: [9, 16],
    outcomes: {
      low: ['You looked at stars together. Quiet companionship.', 'They pointed out constellations.', 'Night sky. Shared wonder.'],
      mid: ['They moved closer. Stars reflected in their eyes.', 'You talked about infinity. They held your hand.', 'Under the stars, barriers dissolved.'],
      high: ['They said the stars were nothing compared to you.', 'You kissed under moonlight. Perfect moment.', 'The universe witnessed your connection.']
    }
  },
  travel: {
    icon: Wind,
    label: 'Travel together',
    category: 'activity',
    tier: 3,
    minRelationship: 50,
    gains: [12, 20],
    outcomes: {
      mid: ['You explored the city together. New places. New memories.', 'Adventure shared. The bond grew.', 'Traveling side by side. The world felt smaller.'],
      high: ['You disappeared together for days. Just the two of you.', 'The world became your playground together.', 'Every journey brought you closer.']
    }
  },
  ritual: {
    icon: Moon,
    label: 'Perform a ritual',
    category: 'activity',
    tier: 4,
    minRelationship: 65,
    gains: [15, 25],
    outcomes: {
      mid: ['An ancient ritual performed together. Sacred.', 'Blood and moonlight. The ritual bonded you.', 'Magic flowed between you. Powerful.'],
      high: ['The ritual completed. You became one.', 'Eternal binding through ancient magic.', 'Power surged. The bond became supernatural.']
    }
  },
  
  // Vampire powers (requires unlocked powers)
  usePower: {
    icon: Zap,
    label: 'Use Power',
    category: 'power',
    tier: 1,
    special: true,
    gains: [0, 0]
  },
  
  // Dark option
  kill: {
    icon: Skull,
    label: 'Kill them',
    category: 'power',
    tier: 1,
    minRelationship: 0,
    gains: [0, 0],
    outcomes: {
      low: ['You drained them completely. They collapsed. Dead.', 'Their life ended in your arms. Quick. Final.', 'You killed them. No hesitation. No remorse.']
    }
  }
};

export default function DirectInteraction({ servant, vampireState, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [interactionType, setInteractionType] = useState('');
  const [showPowers, setShowPowers] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();
  
  const { data: interactionProgress = [] } = useQuery({
    queryKey: ['interactionProgress'],
    queryFn: () => base44.entities.InteractionProgress.list()
  });
  
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
    
    if (type === 'kill') {
      if (!confirm(`Kill ${servant.name}? This cannot be undone.`)) {
        return;
      }
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
      
      // Update interaction progress for unlocking new tiers
      const category = interaction.category;
      if (category !== 'power') {
        const categoryProgress = interactionProgress.find(p => p.category === category);
        if (categoryProgress) {
          const newTimesUsed = categoryProgress.times_used + 1;
          const newTier = Math.floor(newTimesUsed / 5) + 1; // Unlock new tier every 5 uses
          await base44.entities.InteractionProgress.update(categoryProgress.id, {
            times_used: newTimesUsed,
            unlocked_tier: newTier
          });
        } else {
          await base44.entities.InteractionProgress.create({
            category: category,
            times_used: 1,
            unlocked_tier: 1
          });
        }
      }

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

      // If killed, delete the servant
      if (type === 'kill') {
        await base44.entities.Servant.delete(servant.id);
        setTimeout(() => {
          onClose();
        }, 3000);
        return;
      }

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setInteractionType('');
      }, 5000);
      }, 2000);
      };
  
  const rel = servant.relationship || 0;

  // Get unlocked tiers for each category
  const getUnlockedTier = (category) => {
    const progress = interactionProgress.find(p => p.category === category);
    return progress?.unlocked_tier || 1;
  };

  // Combine interactions - add vampire interactions if servant is turned
  const allInteractions = servant.is_turned 
    ? { ...INTERACTIONS, ...TURNED_VAMPIRE_INTERACTIONS }
    : INTERACTIONS;

  const categories = servant.is_turned 
    ? ['all', 'vampire', 'physical', 'social', 'activity', 'power']
    : ['all', 'physical', 'social', 'activity', 'power'];

  // Filter by category and tier
  const filteredInteractions = Object.entries(allInteractions).filter(([key, interaction]) => {
    // Category filter
    if (selectedCategory !== 'all' && interaction.category !== selectedCategory) {
      return false;
    }

    // Tier filter - check if unlocked
    const unlockedTier = getUnlockedTier(interaction.category);
    if (interaction.tier && interaction.tier > unlockedTier) {
      return false;
    }

    return true;
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
        
        {/* Category filter with tier display */}
        {!outcome && !processing && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {categories.map(cat => {
                const unlockedTier = getUnlockedTier(cat);
                const progress = interactionProgress.find(p => p.category === cat);
                const timesUsed = progress?.times_used || 0;
                const nextTierAt = unlockedTier * 5;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors relative ${
                      selectedCategory === cat 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      {cat !== 'all' && cat !== 'power' && (
                        <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px]">
                          T{unlockedTier}
                        </span>
                      )}
                    </div>
                    {cat !== 'all' && cat !== 'power' && selectedCategory === cat && (
                      <div className="mt-1 text-[10px] text-purple-200">
                        {timesUsed}/{nextTierAt} to T{unlockedTier + 1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
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
              const isNew = interaction.tier && interaction.tier === getUnlockedTier(interaction.category);

              return (
                <button
                  key={key}
                  onClick={() => handleInteraction(key)}
                  disabled={disabled}
                  className={`bitlife-btn w-full rounded-xl py-3 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed text-sm relative ${
                    isNew ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{interaction.label}</span>
                  {isNew && <span className="text-xs text-yellow-400 ml-auto">NEW!</span>}
                  {disabled && <span className="text-xs ml-auto">({interaction.minRelationship}+)</span>}
                  {interaction.tier && (
                    <span className="text-[10px] text-gray-500 absolute bottom-1 right-2">
                      Tier {interaction.tier}
                    </span>
                  )}
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