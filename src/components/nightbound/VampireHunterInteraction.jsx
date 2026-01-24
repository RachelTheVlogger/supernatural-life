import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Flame, AlertCircle, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DIALOGUE_OPTIONS = {
  seductive: [
    { text: 'You fascinate me, hunter...', category: 'seductive', explicit: false },
    { text: 'I could make this so much easier for you.', category: 'seductive', explicit: true },
    { text: 'Stop fighting what you want.', category: 'seductive', explicit: true },
    { text: 'Give in. Let me show you a different world.', category: 'seductive', explicit: true },
  ],
  menacing: [
    { text: 'You\'re hunting the wrong prey.', category: 'menacing', explicit: false },
    { text: 'I could end you whenever I want.', category: 'menacing', explicit: false },
    { text: 'You\'re playing a game you can\'t win.', category: 'menacing', explicit: false },
    { text: 'I\'ve already marked you.', category: 'menacing', explicit: false },
  ],
  dangerous: [
    { text: 'Dance with me.', category: 'dangerous', explicit: true },
    { text: 'Let\'s see how long you last.', category: 'dangerous', explicit: true },
    { text: 'I want to know how you taste.', category: 'dangerous', explicit: true },
    { text: 'Surrender. It will hurt less.', category: 'dangerous', explicit: true },
  ],
  curious: [
    { text: 'Why do you hunt us?', category: 'curious', explicit: false },
    { text: 'What made you choose this life?', category: 'curious', explicit: false },
    { text: 'Don\'t you wonder what it would be like?', category: 'curious', explicit: false },
    { text: 'Tell me your story.', category: 'curious', explicit: false },
  ],
  commanding: [
    { text: 'Kneel.', category: 'commanding', explicit: true },
    { text: 'You belong to me now.', category: 'commanding', explicit: true },
    { text: 'Obey, and you\'ll survive this.', category: 'commanding', explicit: true },
    { text: 'Submit.', category: 'commanding', explicit: true },
  ],
};

const HUNTER_RESPONSES = {
  seductive: [
    'For a moment, you see them truly—beautiful and terrible. Your hand wavers.',
    'Something in their voice makes your pulse quicken. You steady your weapon.',
    'They smile, and you remember why they\'re so dangerous. You grip your stakes tighter.',
  ],
  menacing: [
    'Their confidence is chilling. You realize how outmatched you might be.',
    'Fear spikes through you. You push it down, focus on the mission.',
    'A chill runs down your spine. This vampire is different. Older. Stronger.',
  ],
  dangerous: [
    'Every instinct screams at you to run. You stand your ground.',
    'This is what you trained for. Your hands tremble slightly.',
    'The predator in them is fully visible now. No pretense. Just hunger.',
  ],
  curious: [
    'For a moment, you see yourself through their eyes. It\'s unsettling.',
    'The question catches you off-guard. You hesitate to answer.',
    'There\'s something almost sad in their question. You feel a flicker of empathy.',
  ],
  commanding: [
    'Their voice carries an otherworldly power. You feel the pull of it.',
    'Your knees weaken slightly. You fight against the compulsion.',
    'Something ancient and terrible commands you. You resist with all your will.',
  ],
};

export default function VampireHunterInteraction({ vampire, hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('seductive');
  const [hunterResponse, setHunterResponse] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const currentOptions = DIALOGUE_OPTIONS[selectedCategory] || [];

  const handleSendMessage = async (option) => {
    setLoading(true);
    setSelectedMessage(option);

    setTimeout(async () => {
      const responseTexts = HUNTER_RESPONSES[option.category];
      const hunterText = responseTexts[Math.floor(Math.random() * responseTexts.length)];
      
      setHunterResponse({
        ...option,
        hunterText: hunterText,
      });

      setConversationHistory(prev => [...prev, {
        vampireMessage: option.text,
        hunterText: hunterText
      }]);

      try {
        await base44.entities.NightLog.create({
          entry: `Confronted ${hunter.name}. "${option.text}"\n${hunter.name}: ${hunterText}`,
          category: 'encounter',
          intensity: option.explicit ? 'high' : 'moderate'
        });

        queryClient.invalidateQueries(['vampireState']);
      } catch (e) {
        console.error('Failed to save interaction:', e);
      }

      setLoading(false);
    }, 2000);
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
            <h2 className="text-2xl font-bold text-white mb-1">Confrontation with {hunter.name}</h2>
            <p className="text-gray-400 text-sm capitalize">Hunter • Skill: {hunter.skill_level}%</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Display */}
        {conversationHistory.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto space-y-3">
            <p className="text-gray-400 text-xs mb-4 font-medium">Conversation History</p>
            {conversationHistory.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className="bg-red-950/40 rounded p-3 border-l-2 border-red-500">
                  <p className="text-red-300 text-sm"><span className="font-semibold">You:</span> {msg.vampireMessage}</p>
                </div>
                <div className="bg-blue-950/40 rounded p-3 border-l-2 border-blue-500">
                  <p className="text-blue-300 text-sm"><span className="font-semibold">{hunter.name}:</span> {msg.hunterText}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Response */}
        {hunterResponse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 mb-6"
          >
            <div className="flex-1">
              <p className="text-blue-300 mb-2">
                <span className="font-semibold">{hunter.name}:</span> {hunterResponse.hunterText}
              </p>
              {hunterResponse.explicit && (
                <span className="inline-block bg-red-600/50 text-red-200 text-xs px-2 py-1 rounded">
                  Explicit Content
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Message Categories */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {Object.keys(DIALOGUE_OPTIONS).map(category => {
            const categoryColors = {
              seductive: 'from-pink-600 to-red-600',
              menacing: 'from-orange-600 to-red-600',
              dangerous: 'from-red-600 to-purple-600',
              curious: 'from-blue-600 to-purple-600',
              commanding: 'from-purple-600 to-pink-600',
            };
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setHunterResponse(null);
                }}
                disabled={loading}
                className={`rounded-lg p-2 text-xs font-medium transition-all capitalize ${
                  selectedCategory === category
                    ? `bg-gradient-to-r ${categoryColors[category]} text-white`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {category}
              </button>
            );
          })}
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
                setHunterResponse(null);
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