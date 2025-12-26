import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const INTERACTION_CATEGORIES = {
  'Obsessive Love': [
    { id: 'stare', label: 'Stare at them', icon: '👁️' },
    { id: 'touch', label: 'Touch their face', icon: '✋' },
    { id: 'smell', label: 'Smell their clothes', icon: '👃' },
    { id: 'worship', label: 'Worship them', icon: '🙏' },
    { id: 'possess', label: 'Mark them', icon: '💋' },
    { id: 'cling', label: 'Never let go', icon: '🤝' }
  ],
  'Toxic Romance': [
    { id: 'jealous', label: 'Jealous rage', icon: '😡' },
    { id: 'manipulate', label: 'Manipulate', icon: '🎭' },
    { id: 'control', label: 'Control them', icon: '👑' },
    { id: 'test', label: 'Test their loyalty', icon: '🔍' },
    { id: 'isolate', label: 'Isolate them', icon: '🚪' },
    { id: 'gaslight', label: 'Make them doubt', icon: '💭' }
  ],
  'Intimacy': [
    { id: 'kiss', label: 'Kiss deeply', icon: '💋' },
    { id: 'rough', label: 'Rough sex', icon: '🔥' },
    { id: 'tender', label: 'Gentle sex', icon: '💕' },
    { id: 'desperate', label: 'Desperate', icon: '😈' },
    { id: 'bloodplay', label: 'Blood play', icon: '🩸' },
    { id: 'aftercare', label: 'Aftercare', icon: '🛁' }
  ],
  'Dark Bonding': [
    { id: 'confession', label: 'Confess kills', icon: '💀' },
    { id: 'share-trophy', label: 'Show trophies', icon: '🏆' },
    { id: 'plan', label: 'Plan together', icon: '📋' },
    { id: 'cover', label: 'They cover for you', icon: '🧹' },
    { id: 'watch', label: 'Watch you work', icon: '👀' },
    { id: 'gift', label: 'Gift them a trophy', icon: '🎁' }
  ],
  'Daily Life': [
    { id: 'cook', label: 'Cook together', icon: '🍳' },
    { id: 'sleep', label: 'Sleep together', icon: '😴' },
    { id: 'shower', label: 'Shower together', icon: '🚿' },
    { id: 'movie', label: 'Watch horror', icon: '🎬' },
    { id: 'drive', label: 'Night drive', icon: '🚗' },
    { id: 'cuddle', label: 'Cuddle', icon: '🤗' }
  ]
};

export default function KillerLoverInteraction({ killer, lover, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleInteraction = async (interactionId) => {
    setProcessing(true);

    const outcomes = {
      // Obsessive Love
      stare: `You stared at them. Watched every micro-expression. Every breath. They looked back. "What?" they whispered. "Nothing," you lied. "You're perfect."`,
      touch: `Your hand traced their jaw. Possessive. Reverent. They leaned into it. "I'm yours," they breathed. You smiled. "Always have been."`,
      smell: `You buried your face in their hoodie. Their scent. Your drug. They caught you. Smiled. "Obsessed with me?" "Completely."`,
      worship: `On your knees. Kissing their hands. Their wrists. "You're everything," you whispered. They pulled you up. Kissed you hard. "I know."`,
      possess: `Hickeys. Bite marks. Scratches. You marked every inch. "Mine," you growled. They moaned. "Yours. Only yours."`,
      cling: `You held them. Couldn't let go. "Don't leave," you begged. They kissed your forehead. "Never. I'm not going anywhere."`,

      // Toxic Romance
      jealous: `"Who were you talking to?" Your voice sharp. Dangerous. They backed up. "N-no one important." "Everyone's important when it comes to you."`,
      manipulate: `You made them think it was their idea. To stay in. To cancel plans. To choose you. Again. They smiled. "I just want to be with you."`,
      control: `"Wear this." "Don't talk to them." "Stay home." They obeyed. Every time. Devotion or fear? Both. Definitely both.`,
      test: `You flirted with someone else. Watched them. They clenched their fists. Tears in their eyes. Good. They care. "I was testing you," you admitted.`,
      isolate: `One by one, their friends disappeared. Too busy. Too far. Too inconvenient. Until it was just you. Just how you wanted it.`,
      gaslight: `"I never said that." "You're remembering wrong." "You're being crazy." They doubted themselves. Exactly as planned.`,

      // Intimacy
      kiss: `You kissed them like you were drowning. Like they were air. They kissed back just as desperately. Need. Pure need.`,
      rough: `Hard. Fast. Bruising. You fucked them against the wall. They screamed your name. Clawed your back. "Harder," they begged.`,
      tender: `Slow. Gentle. Worshipful. Every touch deliberate. "I love you," you whispered. They cried. "I love you too. So much."`,
      desperate: `Couldn't wait. Needed them NOW. Clothes ripped. Frantic. Consuming. "Mine," you gasped. "Yours," they moaned.`,
      bloodplay: `A small cut. Your blood. Their tongue. They licked it off your finger. Eyes dark. "More?" they asked. God yes.`,
      aftercare: `You held them. Cleaned them. Kissed their bruises. "Did I hurt you?" "In the best way," they smiled. Safe. Loved.`,

      // Dark Bonding
      confession: `"I killed someone tonight." Silence. Then: "Tell me everything." No judgment. Just curiosity. Just acceptance. Perfect.`,
      'share-trophy': `You showed them your collection. Expected horror. Got fascination. "This one?" they asked. "First kill," you said. They smiled.`,
      plan: `"What about them?" They pointed at the target. You grinned. "You're learning." "I'm yours," they said. "Teach me everything."`,
      cover: `They cleaned the blood. Disposed of evidence. Lied to cops. All for you. "Why?" you asked. "Because I love you." Simple. True.`,
      watch: `They watched you work. Didn't flinch. Didn't look away. When it was over, they kissed you. Blood on your lips. "Beautiful," they said.`,
      gift: `You gave them a trophy. "This is yours now." They held it. Reverently. "I'll keep it safe. Like you keep me safe."`,

      // Daily Life
      cook: `You cooked together. Their arms around your waist. Swaying to music. Normal. Almost. If you ignored the bloodstains you just washed out.`,
      sleep: `Tangled together. Their head on your chest. Your fingers in their hair. Peace. Rare. Precious. "I love you," you whispered.`,
      shower: `Hot water. Wandering hands. Kisses. They washed blood from under your nails. No questions. Just love. Just acceptance.`,
      movie: `Horror movie. They flinched. You held them. "It's not real," they said. You said nothing. They knew. They chose you anyway.`,
      drive: `3 AM. Empty roads. Your hand on their thigh. Music low. "Where are we going?" "Nowhere. Everywhere. Does it matter?" "Not with you."`,
      cuddle: `Just holding them. Nothing else. Breathing them in. "This is nice," they murmured. "Yeah," you agreed. "This is perfect."`
    };

    const interactionOutcome = outcomes[interactionId] || 'You spent time together. Obsessively. Possessively. Completely.';
    
    setTimeout(async () => {
      setOutcome(interactionOutcome);

      // Update stats based on interaction type
      let devotionChange = 5;
      let guiltChange = 0;
      let obsessionChange = 0;

      if (['confession', 'share-trophy', 'watch', 'gift'].includes(interactionId)) {
        guiltChange = 10;
        devotionChange = 15;
        obsessionChange = 1;
      } else if (['jealous', 'manipulate', 'control', 'test', 'isolate', 'gaslight'].includes(interactionId)) {
        devotionChange = 10;
        guiltChange = 5;
      } else if (['stare', 'worship', 'possess', 'cling'].includes(interactionId)) {
        devotionChange = 8;
        obsessionChange = 1;
      }

      await base44.entities.ObsessedLover.update(lover.id, {
        devotion: Math.min(100, lover.devotion + devotionChange),
        guilt_level: Math.min(100, lover.guilt_level + guiltChange),
        obsession_stage: Math.min(5, lover.obsession_stage + (obsessionChange > 0 ? (Math.random() > 0.7 ? 1 : 0) : 0))
      });

      if (['bloodplay', 'watch', 'confession'].includes(interactionId)) {
        await base44.entities.SerialKiller.update(killer.id, {
          urge_level: Math.max(0, killer.urge_level - 10)
        });
      }

      await base44.entities.NightLog.create({
        entry: `${killer.killer_name} & ${lover.name}: ${interactionOutcome.substring(0, 100)}...`,
        category: 'interaction',
        intensity: 'significant'
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-red-900/50"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{killer.killer_name} & {lover.name}</h2>
            <p className="text-gray-400 text-sm">Obsessive. Toxic. Completely consumed.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!processing && !outcome && (
          <div className="space-y-6">
            {Object.entries(INTERACTION_CATEGORIES).map(([category, interactions]) => (
              <div key={category}>
                <h3 className="text-red-400 font-bold mb-3">{category}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {interactions.map(interaction => (
                    <button
                      key={interaction.id}
                      onClick={() => handleInteraction(interaction.id)}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-center transition-all"
                    >
                      <div className="text-2xl mb-1">{interaction.icon}</div>
                      <p className="text-white text-xs">{interaction.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {processing && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Heart className="w-16 h-16 text-red-500" />
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-300 leading-relaxed">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}