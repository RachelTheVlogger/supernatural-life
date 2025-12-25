import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Users, Eye, Home, MessageCircle, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const VAMPIRE_INTERACTIONS = {
  meet: {
    icon: Eye,
    label: 'Meet them',
    outcomes: {
      cautious: ['They froze when they saw you. Fear and fascination warring in their eyes.', 'You extended your hand. They took it hesitantly. Cold. They shivered.', '"So you\'re real," they whispered. You smiled. They stepped back.'],
      curious: ['Their eyes widened. "Incredible. You\'re actually..." Words failed them.', 'You let them look. Study you. They circled like examining art.', '"Can you show me? Your powers?" Eager. Fascinated.'],
      'thrill-seeking': ['"Holy shit," they breathed. Grinning. "This is amazing."', 'No fear. Only excitement. They stepped closer. "Show me what you can do."', 'They offered their wrist immediately. "Can you bite me?"'],
      lonely: ['They looked at you like salvation. "Will you... can I stay?"', 'Tears in their eyes. "I want this. Please."', 'They knelt without being asked. "I\'ll do anything."']
    }
  },
  charm: {
    icon: Heart,
    label: 'Use charm on them',
    minCuriosity: 40,
    outcomes: {
      cautious: ['Your charm washed over them. Fear melted. They stepped closer.', 'Resistance crumbled. They wanted you. Confused. Hungry.', 'You spoke softly. They listened. Transfixed.'],
      curious: ['Charm hit them hard. Desire bloomed instantly. "Oh god..."', 'Their heartbeat raced. You smiled. They blushed.', 'Fascination became infatuation. Immediate.'],
      'thrill-seeking': ['Charmed. Desperate. "I need... fuck, I need you."', 'No resistance. Pure want. "Please."', 'They grabbed you first. The charm made them bold.'],
      lonely: ['Your charm filled the void in them. Instant devotion.', 'They looked at you like you were everything. You were.', 'Complete surrender. "I\'m yours."']
    }
  },
  drink: {
    icon: Users,
    label: 'Share a drink',
    outcomes: {
      cautious: ['Wine loosened their tongue. Questions came easier.', 'They drank. Relaxed. Opened up.', 'Alcohol and curiosity. Dangerous mix.'],
      curious: ['They asked a thousand questions. You answered some.', 'Tipsy confessions. "I think about you. A lot."', 'The wine made them brave. Honest.'],
      'thrill-seeking': ['"To danger," they toasted. You clinked glasses.', 'Drunk on wine and adrenaline.', 'They proposed something reckless. You considered it.'],
      lonely: ['They didn\'t want to leave. Ever. "Can I just... stay?"', 'Wine and company. They hadn\'t felt this alive in years.', '"I don\'t want to go back to being alone."']
    }
  },
  bite: {
    icon: Heart,
    label: 'Feed from them',
    minCuriosity: 60,
    outcomes: {
      cautious: ['You bit. They gasped. Pain. Pleasure. Confusion.', 'Their blood. Sweet. Terrified. You controlled yourself.', 'They trembled as you fed. Didn\'t pull away.'],
      curious: ['"Yes. Do it. I want to know." You obliged.', 'You fed. They moaned. "Oh my god. It feels..."', 'Their blood sang with curiosity. Delicious.'],
      'thrill-seeking': ['You sank your fangs in. They cried out in pleasure. "More."', 'They grabbed your head, holding you to their neck. "Don\'t stop."', 'Feeding on adrenaline-soaked blood. Intoxicating.'],
      lonely: ['They offered willingly. "Take everything."', 'You fed. They clung to you. Needed. Wanted.', 'Their blood tasted of longing. You understood.']
    }
  },
  invite: {
    icon: Home,
    label: 'Invite them to live with you',
    minCuriosity: 70,
    outcomes: {
      cautious: ['"Live here? With you?" Long pause. "...Yes."', 'Fear warred with desire. Desire won. "I\'ll come."', 'They agreed. Hands shaking. "When do I move in?"'],
      curious: ['"Really? I can stay here?" Eyes bright. "Yes! God, yes."', 'No hesitation. "I want to see everything. Learn everything."', 'They started planning immediately. "I\'ll bring my things tomorrow."'],
      'thrill-seeking': ['"Fuck yes. When can I move in?" Immediate.', '"Living with a vampire. This is insane. I love it."', 'Packed and ready. "Let\'s do this."'],
      lonely: ['Tears. "You want me to stay? Really?"', '"I thought you\'d never ask." Relief. Joy.', 'They hugged you. "Thank you. Thank you."']
    }
  },
  seduce: {
    icon: Heart,
    label: 'Seduce them',
    minCuriosity: 50,
    outcomes: {
      cautious: ['Your touch. They froze. Then leaned in. "I shouldn\'t..."', 'You pulled them close. Hesitation melted. "Oh god..."', 'They kissed back. Terrified. Wanting.'],
      curious: ['You seduced them easily. They wanted to experience everything.', '"Show me what it\'s like. With a vampire." You did.', 'Curiosity became desire. Hands exploring. Learning.'],
      'thrill-seeking': ['No seduction needed. They wanted you immediately. "Now. Please."', 'Wild. Urgent. Dangerous sex. They loved every second.', 'You fucked them. Hard. They screamed. "Again."'],
      lonely: ['They melted into your touch. Starving for connection.', 'You gave them everything they craved. They cried.', 'Intimate. Desperate. They clung to you after.']
    }
  }
};

export default function FriendInteraction({ friend, servant, vampireState, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const queryClient = useQueryClient();

  const handleInteraction = async (type) => {
    const interaction = VAMPIRE_INTERACTIONS[type];
    
    if (type === 'invite' && !confirm(`Invite ${friend.name} to live with you?`)) {
      return;
    }
    
    setProcessing(true);
    
    setTimeout(async () => {
      const outcomes = interaction.outcomes[friend.personality];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);
      
      // Update friend stats
      const curiosityGain = type === 'bite' ? 30 : type === 'charm' ? 25 : type === 'meet' ? 15 : 20;
      const friendshipGain = type === 'drink' ? 15 : type === 'seduce' ? 25 : 10;
      
      const newCuriosity = Math.min(friend.curiosity_level + curiosityGain, 100);
      const newFriendship = Math.min(friend.friendship_level + friendshipGain, 100);
      
      await base44.entities.PotentialServant.update(friend.id, {
        curiosity_level: newCuriosity,
        friendship_level: newFriendship,
        knows_about_vampires: true,
        relationship_vampire: Math.min((friend.relationship_vampire || 0) + friendshipGain, 100)
      });
      
      // If invited to live, convert to servant
      if (type === 'invite') {
        // Check if already at max servants (2)
        const allServants = await base44.entities.Servant.list();
        if (allServants.length >= 2) {
          setOutcome('You already have 2 servants. Cannot invite more.');
          setTimeout(() => {
            setProcessing(false);
            setOutcome('');
          }, 3000);
          return;
        }
        
        const variantMap = {
          cautious: 'defiant',
          curious: 'dreamer',
          'thrill-seeking': 'devoted',
          lonely: 'devoted'
        };
        
        const genders = ['male', 'female', 'custom'];
        const sexualities = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'questioning'];
        
        await base44.entities.Servant.create({
          name: friend.name,
          gender: genders[Math.floor(Math.random() * genders.length)],
          sexuality: sexualities[Math.floor(Math.random() * sexualities.length)],
          variant: variantMap[friend.personality] || 'devoted',
          obsession_stage: 1,
          relationship: Math.floor(newFriendship / 2),
          emotional_state: 'curious'
        });
        
        await base44.entities.PotentialServant.delete(friend.id);
        
        await base44.entities.NightLog.create({
          entry: `${friend.name} moved in. They live with you now. Another soul bound to yours.`,
          category: 'interaction',
          intensity: 'significant'
        });
        
        queryClient.invalidateQueries();
        
        setTimeout(() => {
          onClose();
        }, 4000);
        return;
      }
      
      await base44.entities.NightLog.create({
        entry: `You interacted with ${friend.name}, ${servant?.name || 'your servant'}'s friend. ${result}`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
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
          {friend.name}
        </h2>
        <p className="text-gray-400 text-sm mb-1 capitalize">
          {friend.personality}
        </p>
        <p className="text-gray-500 text-xs mb-4">
          Friend of {servant?.name || 'your servant'}
        </p>

        {outcome ? (
          <div className="text-center py-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 leading-relaxed"
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
          <div className="space-y-2">
            {Object.entries(VAMPIRE_INTERACTIONS).map(([key, interaction]) => {
              const Icon = interaction.icon;
              const disabled = interaction.minCuriosity && friend.curiosity_level < interaction.minCuriosity;
              
              return (
                <button
                  key={key}
                  onClick={() => !disabled && handleInteraction(key)}
                  disabled={disabled}
                  className={`bitlife-btn w-full rounded-xl py-3 flex items-center gap-3 disabled:opacity-30 ${
                    disabled ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{interaction.label}</span>
                  {disabled && (
                    <span className="text-xs ml-auto">({interaction.minCuriosity}+ curiosity)</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}