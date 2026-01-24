import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Flame, AlertCircle, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DIALOGUE_OPTIONS = {
  flirty: [
    { text: 'You intrigue me...', reaction: 'blush', explicit: false },
    { text: 'I\'ve been thinking about you.', reaction: 'smirk', explicit: false },
    { text: 'Want to come closer?', reaction: 'tense', explicit: true },
    { text: 'I can\'t stop thinking about last time...', reaction: 'intense', explicit: true },
    { text: 'You\'re dangerous. I like that.', reaction: 'grin', explicit: false }
  ],
  hostile: [
    { text: 'You\'re a monster.', reaction: 'anger', explicit: false },
    { text: 'I should kill you where you stand.', reaction: 'defiant', explicit: false },
    { text: 'Stay away from innocent people.', reaction: 'stern', explicit: false },
    { text: 'Your kind has taken enough.', reaction: 'grief', explicit: false }
  ],
  curious: [
    { text: 'What\'s it like being immortal?', reaction: 'thoughtful', explicit: false },
    { text: 'Tell me your story.', reaction: 'nostalgic', explicit: false },
    { text: 'Are you truly evil, or just surviving?', reaction: 'conflicted', explicit: false },
    { text: 'Do you ever regret what you are?', reaction: 'melancholy', explicit: false }
  ],
  provocative: [
    { text: 'I want you. Here. Now.', reaction: 'breathless', explicit: true },
    { text: 'Show me what you\'re made of...', reaction: 'predatory', explicit: true },
    { text: 'Take me like you did before.', reaction: 'hungry', explicit: true },
    { text: 'I crave the way you make me feel.', reaction: 'desperate', explicit: true }
  ],
  protective: [
    { text: 'I won\'t let you hurt others.', reaction: 'respectful', explicit: false },
    { text: 'Change. Stop feeding on humans.', reaction: 'sad', explicit: false },
    { text: 'There\'s still good in you.', reaction: 'surprised', explicit: false },
    { text: 'I\'ll help you find another way.', reaction: 'grateful', explicit: false }
  ]
};

const VAMPIRE_RESPONSES = {
  blush: {
    texts: [
      'A faint blush crosses their pale features.',
      'They look away, a small smile playing at their lips.',
      'Their composure wavers for just a moment.'
    ],
    emoji: '🥀'
  },
  smirk: {
    texts: [
      'They smirk, eyes gleaming with amusement.',
      'A dangerous smile spreads across their face.',
      'They lean in closer, their expression darkening with intrigue.'
    ],
    emoji: '😏'
  },
  tense: {
    texts: [
      'Their jaw tightens. Eyes flare red for a moment.',
      'They freeze, clearly fighting internal urges.',
      'The air between you grows thick with tension.'
    ],
    emoji: '⚡'
  },
  intense: {
    texts: [
      'Their breathing quickens. They move closer, unable to resist.',
      'Pure hunger flashes across their features.',
      'They reach for you, eyes completely red.'
    ],
    emoji: '🔥'
  },
  anger: {
    texts: [
      'Their eyes turn completely crimson. Fangs bare.',
      'A low growl reverberates through the room.',
      'Power radiates from them, dangerous and suffocating.'
    ],
    emoji: '😤'
  },
  defiant: {
    texts: [
      'They laugh, a dangerous sound echoing.',
      'Their expression hardens. "Try," they whisper.',
      'They stand taller, clearly unimpressed by your threat.'
    ],
    emoji: '⚔️'
  },
  stern: {
    texts: [
      'Something flashes in their eyes. Respect, maybe?',
      'They study you with newfound intensity.',
      'A moment of silence passes between you.'
    ],
    emoji: '👁️'
  },
  grief: {
    texts: [
      'Their expression goes distant, haunted.',
      'For a moment, you see the weight of centuries in their eyes.',
      'They look away, voice quiet. "You don\'t understand the cost."'
    ],
    emoji: '💔'
  },
  thoughtful: {
    texts: [
      'They pause, considering your question seriously.',
      'A far-away look crosses their face.',
      'They settle in, as if remembering lives long past.'
    ],
    emoji: '🤔'
  },
  nostalgic: {
    texts: [
      'They lean back, eyes distant with memory.',
      'A sad smile touches their lips.',
      'They begin speaking of centuries gone by...'
    ],
    emoji: '🌙'
  },
  conflicted: {
    texts: [
      'They struggle visibly with the question.',
      'Pain flickers across their features.',
      'They look at you with something like desperation.'
    ],
    emoji: '😔'
  },
  melancholy: {
    texts: [
      'Sadness washes over them.',
      'They shake their head slowly.',
      '"Every day," they whisper.'
    ],
    emoji: '🌧️'
  },
  breathless: {
    texts: [
      'They let out a shaky breath. Eyes glow red.',
      'They press against you, unable to hold back anymore.',
      'Words escape them in whispered need...'
    ],
    emoji: '💨'
  },
  predatory: {
    texts: [
      'A slow, predatory smile crosses their face.',
      'They advance on you with controlled intensity.',
      'The hunter becomes the hunted...'
    ],
    emoji: '🦇'
  },
  hungry: {
    texts: [
      'They pull you close, their hunger evident.',
      'Fangs trace along your neck...',
      'You\'re completely under their spell.'
    ],
    emoji: '🩸'
  },
  desperate: {
    texts: [
      'They grip you tightly, needing you.',
      'Their whispered pleas are lost against your skin.',
      'There\'s nothing controlled about them now...'
    ],
    emoji: '💫'
  },
  respectful: {
    texts: [
      'Respect flickers in their crimson eyes.',
      'They nod slowly, understanding your conviction.',
      'A moment of mutual recognition passes between you.'
    ],
    emoji: '🙏'
  },
  sad: {
    texts: [
      'They look at you with deep sorrow.',
      '"It\'s not that simple," they whisper.',
      'The weight of their nature is written on their face.'
    ],
    emoji: '😞'
  },
  surprised: {
    texts: [
      'Shock registers on their features.',
      'They study you with new intensity.',
      'For the first time, they seem vulnerable.'
    ],
    emoji: '😮'
  },
  grateful: {
    texts: [
      'Tears glimmer in their ancient eyes.',
      'They reach for you, voice breaking slightly.',
      '"No one has ever... Thank you."'
    ],
    emoji: '🌟'
  },
  grin: {
    texts: [
      'A wicked grin spreads across their face.',
      'They chuckle darkly, circling you like prey.',
      'Challenge lights up their eyes.'
    ],
    emoji: '😈'
  }
};

export default function HunterVampireInteraction({ hunter, vampire, onClose, visitType = 'meeting' }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('curious');
  const [vampireResponse, setVampireResponse] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const currentOptions = DIALOGUE_OPTIONS[selectedCategory] || [];

  const handleSendMessage = async (option) => {
    setLoading(true);
    setSelectedMessage(option);

    // Simulate message being sent
    setTimeout(async () => {
      const response = VAMPIRE_RESPONSES[option.reaction];
      setVampireResponse({
        ...option,
        vampireText: response.texts[Math.floor(Math.random() * response.texts.length)],
        emoji: response.emoji
      });

      setConversationHistory(prev => [...prev, {
        hunterMessage: option.text,
        vampireReaction: option.reaction,
        vampireText: response.texts[Math.floor(Math.random() * response.texts.length)]
      }]);

      try {
        // Update interaction stats
        const existingInteractions = hunter.vampire_interactions || {};
        const vampireKey = vampire.id;
        
        existingInteractions[vampireKey] = (existingInteractions[vampireKey] || 0) + 1;

        await base44.entities.Hunter.update(hunter.id, {
          vampire_interactions: existingInteractions,
          last_vampire_interaction: new Date().toISOString()
        });

        await base44.entities.NightLog.create({
          entry: `Encountered ${vampire.vampire_name}. ${option.text}`,
          category: 'interaction',
          intensity: option.explicit ? 'high' : 'moderate'
        });

        queryClient.invalidateQueries(['hunters']);
      } catch (e) {
        console.error('Failed to save interaction:', e);
      }

      setLoading(false);
    }, 1200);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Meeting with {vampire.vampire_name}</h2>
            <p className="text-gray-400 text-sm capitalize">{visitType}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Display */}
        {conversationHistory.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto space-y-3">
            <p className="text-gray-400 text-xs mb-3">Conversation History</p>
            {conversationHistory.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className="bg-blue-900/30 rounded p-2 border-l-2 border-blue-500">
                  <p className="text-blue-300 text-sm">{msg.hunterMessage}</p>
                </div>
                <div className="bg-red-900/30 rounded p-2 border-l-2 border-red-500">
                  <p className="text-red-300 text-sm">{msg.vampireText}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Response */}
        {vampireResponse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-900/40 to-purple-900/40 border border-red-500/30 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <span className="text-4xl">{vampireResponse.emoji}</span>
              <div className="flex-1">
                <p className="text-white mb-2">
                  <span className="font-semibold text-red-300">{vampire.vampire_name}:</span> {vampireResponse.vampireText}
                </p>
                {vampireResponse.explicit && (
                  <span className="inline-block bg-red-600/50 text-red-200 text-xs px-2 py-1 rounded">
                    Explicit Content
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Message Categories */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {Object.keys(DIALOGUE_OPTIONS).map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setVampireResponse(null);
              }}
              disabled={loading}
              className={`rounded-lg p-2 text-xs font-medium transition-all capitalize ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Message Options */}
        <div className="space-y-2 mb-6">
          <p className="text-gray-400 text-sm mb-3">Choose your words:</p>
          {currentOptions.map((option, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => handleSendMessage(option)}
              disabled={loading}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                option.explicit
                  ? 'bg-gradient-to-r from-red-900/60 to-pink-900/60 hover:from-red-900/80 hover:to-pink-900/80 border-2 border-red-500/50 text-red-200'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300'
              } disabled:opacity-50 flex items-center justify-between`}
            >
              <span>{option.text}</span>
              <div className="flex items-center gap-2">
                {option.explicit && <Flame className="w-4 h-4 text-red-400" />}
                <MessageCircle className="w-4 h-4 opacity-50" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
          >
            Leave
          </button>
          {conversationHistory.length > 0 && (
            <button
              onClick={() => {
                setConversationHistory([]);
                setVampireResponse(null);
              }}
              className="flex-1 bg-red-900/50 hover:bg-red-900/70 text-red-300 py-3 rounded-lg transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}