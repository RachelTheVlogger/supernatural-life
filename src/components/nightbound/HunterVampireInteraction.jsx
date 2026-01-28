import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Flame, AlertCircle, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DIALOGUE_OPTIONS = {
  flirty: [
    { text: 'You intrigue me...', category: 'flirty', explicit: false },
    { text: 'I\'ve been thinking about you.', category: 'flirty', explicit: false },
    { text: 'Want to come closer?', category: 'flirty', explicit: true },
    { text: 'I can\'t stop thinking about last time...', category: 'flirty', explicit: true },
    { text: 'You\'re dangerous. I like that.', category: 'flirty', explicit: false }
  ],
  hostile: [
    { text: 'You\'re a monster.', category: 'hostile', explicit: false },
    { text: 'I should kill you where you stand.', category: 'hostile', explicit: false },
    { text: 'Stay away from innocent people.', category: 'hostile', explicit: false },
    { text: 'Your kind has taken enough.', category: 'hostile', explicit: false }
  ],
  curious: [
    { text: 'What\'s it like being immortal?', category: 'curious', explicit: false },
    { text: 'Tell me your story.', category: 'curious', explicit: false },
    { text: 'Are you truly evil, or just surviving?', category: 'curious', explicit: false },
    { text: 'Do you ever regret what you are?', category: 'curious', explicit: false }
  ],
  provocative: [
    { text: 'I want you. Here. Now.', category: 'provocative', explicit: true },
    { text: 'Show me what you\'re made of...', category: 'provocative', explicit: true },
    { text: 'Take me like you did before.', category: 'provocative', explicit: true },
    { text: 'I crave the way you make me feel.', category: 'provocative', explicit: true }
  ],
  protective: [
    { text: 'I won\'t let you hurt others.', category: 'protective', explicit: false },
    { text: 'Change. Stop feeding on humans.', category: 'protective', explicit: false },
    { text: 'There\'s still good in you.', category: 'protective', explicit: false },
    { text: 'I\'ll help you find another way.', category: 'protective', explicit: false }
  ]
};

const VAMPIRE_RESPONSES = {
  flirty: [
    'They look away for a moment, a faint smile crossing their pale features. When they meet your eyes again, something vulnerable flickers there before they mask it.',
    'They pause mid-breath, composure wavering slightly. Their fingers curl and uncurl at their sides as they compose themselves.',
    'Something unguarded flashes across their face—raw, honest. They touch their neck, steadying themselves before looking back at you.'
  ],
  flirty: [
    'A knowing smile plays at their lips as they regard you with amusement. "I like the way you think," they murmur.',
    'They lean forward slightly, amusement evident in their expression. Their eyes gleam as they watch you with renewed interest.',
    'Their eyes dance with intrigue. They tilt their head, studying you like a puzzle they\'re beginning to understand.',
    'They let out a shaky breath, eyes glowing bright red. They step closer, unable to maintain any distance anymore.',
    'Their breathing becomes ragged. They reach for you with trembling hands. "I can\'t... I don\'t want to stop," they whisper.'
  ],
  hostile: [
    'Their eyes flash crimson instantly. Fangs bare as a growl reverberates through their chest. "Careful," they warn.',
    'A low, dangerous sound escapes them. Power radiates from their frame, making the air around you crackle.',
    'They turn away sharply, their whole body trembling with the effort of restraint. "Leave. Now," they snarl.',
    'They laugh—a dangerous, thrilling sound that echoes. "You could try," they say with absolute certainty, facing you unflinching.',
    'Their expression hardens into something predatory. They step closer instead of backing down. "I dare you."'
  ],
  curious: [
    'They pause, genuinely considering your words. A far-away look crosses their face as memories seem to surface.',
    'They settle into silence, fingers steepled as they think. Minutes pass before they speak again, carefully.',
    'They walk to the window, staring out into the darkness. "That\'s... a fair question. One I haven\'t allowed myself to ask in centuries."',
    'They lean back slowly, eyes distant with ancient memories. A bittersweet smile touches their lips. "There was a time..."',
    'They begin speaking softly of centuries gone by, of lives and loves lost to time. Their voice carries the weight of ages.'
  ],
  provocative: [
    'Everything about their body language screams raw hunger. Their voice drops to something almost animal. "I want you."',
    'A slow, predatory smile spreads across their face. They circle you deliberately, eyes tracking your every movement. The hunter becomes the hunted.',
    'They move with liquid grace, completely in control. Every step is calculated, drawing you deeper under their spell.',
    'They pull you close without hesitation, eyes completely red. Their hunger is palpable, overwhelming.',
    'They grip you tightly, trembling with need. Their voice breaks as they speak your name. "I need... please, I need..."'
  ],
  protective: [
    'Something in their expression shifts fundamentally. Genuine respect flickers across their features as they nod slowly.',
    'They step back, giving you space. When they speak, their voice is different—sincere. "I see you now."',
    'A moment of mutual recognition passes between you—not as predator and prey, but as equals. Something changes.',
    'Shock registers on their usually composed features. They study you as if seeing you for the first time.',
    'Tears glimmer in their immortal eyes—real tears. They reach for you, voice breaking. "No one has ever... Thank you."'
  ]
};

export default function HunterVampireInteraction({ hunter, vampire, onClose, visitType = 'meeting' }) {
  const queryClient = useQueryClient();
  const [interactionChoice, setInteractionChoice] = useState(null); // 'hostile' or 'peaceful'
  const [vampireResponse, setVampireResponse] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Get hunter traits
  const hunterTraits = hunter.traits || [];
  const hasEmpathic = hunterTraits.includes('empathic');
  const hasBrutal = hunterTraits.includes('brutal');
  const hasSeductive = hunterTraits.includes('seductive');
  const hasDiplomatic = hunterTraits.includes('diplomatic');

  // Get all available options based on interaction choice and traits
  const getAvailableOptions = () => {
    let options = [];
    
    if (interactionChoice === 'hostile') {
      options = [...DIALOGUE_OPTIONS.hostile];
    } else {
      options = [...DIALOGUE_OPTIONS.curious, ...DIALOGUE_OPTIONS.protective];
      if (hasSeductive) {
        options = [...options, ...DIALOGUE_OPTIONS.flirty, ...DIALOGUE_OPTIONS.provocative];
      }
    }
    
    return options;
  };

  // Filter explicit content in lite mode
  const filterExplicit = vampire?.content_filter === 'lite';
  const currentOptions = getAvailableOptions().filter(option => !filterExplicit || !option.explicit);

  const handleSendMessage = async (option) => {
    setLoading(true);
    setSelectedMessage(option);

    // Simulate message being sent
    setTimeout(async () => {
      const responseTexts = VAMPIRE_RESPONSES[option.category];
      const vampireText = responseTexts[Math.floor(Math.random() * responseTexts.length)];
      
      // Apply trait bonuses
      let combatBonus = 0;
      let relationshipBonus = 0;
      
      if (hasBrutal) combatBonus += 25;
      if (hasEmpathic) {
        relationshipBonus += 15;
        combatBonus -= 10;
      }
      if (hasDiplomatic) relationshipBonus += 20;
      if (hasSeductive) relationshipBonus += 25;

      // Determine outcome based on hunter's skill and vampire's exposure
      const hunterSkill = (hunter.skill_level || 30) + combatBonus;
      const vampireExposure = vampire.exposure_level || 0;
      const roll = Math.random() * 100;
      
      let outcomeType;
      if (option.category === 'hostile') {
        outcomeType = hunterSkill > 60 ? 'positive' : 'neutral';
      } else if (option.category === 'flirty' || option.category === 'provocative') {
        outcomeType = roll < 40 ? 'positive' : 'neutral';
      } else if (option.category === 'protective') {
        outcomeType = 'positive';
      } else {
        outcomeType = 'neutral';
      }
      
      setVampireResponse({
        ...option,
        vampireText: vampireText,
        outcomeType: outcomeType
      });

      setConversationHistory(prev => [...prev, {
        hunterMessage: option.text,
        vampireText: vampireText
      }]);

      try {
        await base44.entities.NightLog.create({
          entry: `Encountered ${vampire.vampire_name}. ${option.text}\n${vampire.vampire_name}: ${vampireText}`,
          category: 'interaction',
          intensity: option.explicit ? 'high' : 'moderate'
        });

        queryClient.invalidateQueries(['hunters']);
      } catch (e) {
        console.error('Failed to save interaction:', e);
      }

      setLoading(false);
    }, 2000);
  };

  // Initial choice screen
  if (!interactionChoice) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Meeting with {vampire.vampire_name}</h2>
              <p className="text-gray-400 text-sm mt-2">How will you approach them?</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setInteractionChoice('hostile')}
              className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-700/50 rounded-2xl p-8 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">⚔️</span>
                <div className="text-left flex-1">
                  <h3 className="text-white text-2xl font-bold mb-2">Hostile Intent</h3>
                  <p className="text-red-300 text-sm">
                    Confront them. Challenge them. Make your mission clear.
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setInteractionChoice('peaceful')}
              className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-700/50 rounded-2xl p-8 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">🤝</span>
                <div className="text-left flex-1">
                  <h3 className="text-white text-2xl font-bold mb-2">Peaceful Approach</h3>
                  <p className="text-purple-300 text-sm">
                    Talk to them. Understand them. Maybe you can find common ground.
                  </p>
                </div>
              </div>
            </motion.button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
          >
            Leave
          </button>
        </motion.div>
      </motion.div>
    );
  }

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
            <p className="text-gray-400 text-sm capitalize">
              {interactionChoice === 'hostile' ? 'Hostile Confrontation' : 'Peaceful Discussion'}
            </p>
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
                <div className="bg-blue-950/40 rounded p-3 border-l-2 border-blue-500">
                  <p className="text-blue-300 text-sm"><span className="font-semibold">You:</span> {msg.hunterMessage}</p>
                </div>
                <div className="bg-red-950/40 rounded p-3 border-l-2 border-red-500">
                  <p className="text-red-300 text-sm"><span className="font-semibold">{vampire.vampire_name}:</span> {msg.vampireText}</p>
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

        {/* Dialogue Options */}
        <div className="space-y-2 mb-6">
          {currentOptions.map((option, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleSendMessage(option)}
              disabled={loading}
              className={`w-full p-4 rounded-xl text-left transition-all ${
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