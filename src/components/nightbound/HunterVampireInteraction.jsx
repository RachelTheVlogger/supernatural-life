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
  blush: [
    'They look away for a moment, a faint smile crossing their features.',
    'They pause, composure wavering slightly as they meet your eyes again.',
    'Something unguarded flashes across their face before they compose themselves.'
  ],
  smirk: [
    'A knowing smile plays at their lips as they regard you.',
    'They lean forward slightly, amusement evident in their expression.',
    'Their eyes dance with interest as they watch you.'
  ],
  tense: [
    'Their jaw clenches. They look away, clearly struggling.',
    'The air grows heavy between you. Their eyes briefly glow.',
    'They take a breath, composing themselves with visible effort.'
  ],
  intense: [
    'They move closer, eyes darkening with need.',
    'Their breathing becomes audible. They reach out slowly.',
    'Everything about their body language screams hunger.'
  ],
  anger: [
    'Their eyes flash crimson. Fangs bare momentarily.',
    'A low growl escapes them. Power radiates from their frame.',
    'They turn away sharply, clearly struggling for control.'
  ],
  defiant: [
    'They laugh, a dangerous sound in the silence.',
    '"You could try," they say quietly, facing you unflinching.',
    'They stand taller, utterly unmoved by your words.'
  ],
  stern: [
    'They study you for a long moment, something shifting in their gaze.',
    'A new respect seems to flicker across their features.',
    'They nod slowly, acknowledging your conviction.'
  ],
  grief: [
    'Their expression becomes distant, haunted.',
    'You see centuries of pain reflected in their eyes.',
    '"You really don\'t understand what it costs to be this," they say quietly.'
  ],
  thoughtful: [
    'They pause, considering your words seriously.',
    'A far-away look crosses their face as they think.',
    'They settle into silence, as if remembering.'
  ],
  nostalgic: [
    'They lean back, eyes distant with ancient memories.',
    'A bittersweet smile touches their lips.',
    'They speak softly of times long past.'
  ],
  conflicted: [
    'They struggle visibly, wrestling with something internal.',
    'Pain flickers across their features.',
    'They look at you, caught between desire and restraint.'
  ],
  melancholy: [
    'Sadness washes over them.',
    'They look away, voice dropping.',
    '"Every single day," they whisper.'
  ],
  breathless: [
    'They let out a shaky breath, eyes glowing red.',
    'They step closer, unable to maintain distance.',
    'Their voice drops to something barely audible.'
  ],
  predatory: [
    'A slow smile spreads across their face.',
    'They circle you deliberately, eyes tracking your every movement.',
    'The dynamic between you shifts.'
  ],
  hungry: [
    'They pull you close without hesitation.',
    'Their breathing becomes ragged against your skin.',
    'You feel completely at their mercy.'
  ],
  desperate: [
    'They grip you tightly, trembling slightly.',
    'Their voice breaks as they speak your name.',
    'There\'s nothing held back anymore.'
  ],
  respectful: [
    'Something in their expression shifts. Respect.',
    'They nod, understanding your resolve.',
    'A moment of mutual recognition passes between you.'
  ],
  sad: [
    'They look at you with deep sorrow.',
    '"It\'s not that simple," they say, almost helplessly.',
    'The weight of what they are seems to crush them.'
  ],
  surprised: [
    'Shock registers on their usually composed features.',
    'They study you as if seeing you for the first time.',
    'For once, they seem truly vulnerable.'
  ],
  grateful: [
    'Tears glimmer in their immortal eyes.',
    'They reach for you, voice breaking slightly.',
    '"No one has ever offered me that before."'
  ],
  grin: [
    'A wicked grin spreads across their face.',
    'They laugh, the sound both thrilling and dangerous.',
    'Their eyes glitter with dark amusement.'
  ]
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
      const responseTexts = VAMPIRE_RESPONSES[option.reaction];
      const vampireText = responseTexts[Math.floor(Math.random() * responseTexts.length)];
      
      setVampireResponse({
        ...option,
        vampireText: vampireText
      });

      setConversationHistory(prev => [...prev, {
        hunterMessage: option.text,
        vampireReaction: option.reaction,
        vampireText: vampireText
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
            className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 mb-6"
          >
            <div className="flex-1">
              <p className="text-red-300 mb-2">
                <span className="font-semibold">{vampire.vampire_name}:</span> {vampireResponse.vampireText}
              </p>
              {vampireResponse.explicit && (
                <span className="inline-block bg-red-600/50 text-red-200 text-xs px-2 py-1 rounded">
                  Explicit Content
                </span>
              )}
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