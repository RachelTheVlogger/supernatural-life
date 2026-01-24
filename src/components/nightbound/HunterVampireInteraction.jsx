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
  blush: [
    'They look away for a moment, a faint smile crossing their pale features. When they meet your eyes again, something vulnerable flickers there before they mask it.',
    'They pause mid-breath, composure wavering slightly. Their fingers curl and uncurl at their sides as they compose themselves.',
    'Something unguarded flashes across their face—raw, honest. They touch their neck, steadying themselves before looking back at you.'
  ],
  smirk: [
    'A knowing smile plays at their lips as they regard you with amusement. "I like the way you think," they murmur.',
    'They lean forward slightly, amusement evident in their expression. Their eyes gleam as they watch you with renewed interest.',
    'Their eyes dance with intrigue. They tilt their head, studying you like a puzzle they\'re beginning to understand.'
  ],
  tense: [
    'Their jaw clenches visibly. They look away, fists tightening as they clearly fight something internal. "Don\'t," they say quietly.',
    'The air grows heavy between you. Their eyes briefly glow red before they squeeze them shut, regaining control.',
    'They take a sharp breath, composing themselves with visible effort. Sweat beads on their temple despite their cool exterior.'
  ],
  intense: [
    'They move closer without permission, eyes darkening to pure red. "You\'re making this difficult," they breathe.',
    'Their breathing becomes audible, almost ragged. They reach out slowly, fingers hovering inches from your skin.',
    'Everything about their body language screams raw hunger. Their voice drops to something almost animal. "I want you."'
  ],
  anger: [
    'Their eyes flash crimson instantly. Fangs bare as a growl reverberates through their chest. "Careful," they warn.',
    'A low, dangerous sound escapes them. Power radiates from their frame, making the air around you crackle.',
    'They turn away sharply, their whole body trembling with the effort of restraint. "Leave. Now," they snarl.'
  ],
  defiant: [
    'They laugh—a dangerous, thrilling sound that echoes. "You could try," they say with absolute certainty, facing you unflinching.',
    'Their expression hardens into something predatory. They step closer instead of backing down. "I dare you."',
    'They stand taller, completely unmoved by your threat. Confidence radiates from them as they smile wickedly.'
  ],
  stern: [
    'They study you for a long moment, something fundamental shifting in their gaze. They nod slowly, respect evident now.',
    'A new respect seems to flicker across their usually cold features. They incline their head toward you slightly.',
    'They reach out and touch your arm gently. "I underestimated you," they admit quietly.'
  ],
  grief: [
    'Their expression becomes distant, haunted by centuries. You see the weight of ages in their eyes as they look away.',
    'When they speak, their voice is hollow. "You really don\'t understand what it costs to be this." They sink into a chair.',
    'Tears—actual tears—glimmer in their ancient eyes. "Every day is a choice to keep going, and every day I wonder why."'
  ],
  thoughtful: [
    'They pause, genuinely considering your words. A far-away look crosses their face as memories seem to surface.',
    'They settle into silence, fingers steepled as they think. Minutes pass before they speak again, carefully.',
    'They walk to the window, staring out into the darkness. "That\'s... a fair question. One I haven\'t allowed myself to ask in centuries."'
  ],
  nostalgic: [
    'They lean back slowly, eyes distant with ancient memories. A bittersweet smile touches their lips. "There was a time..."',
    'They begin speaking softly of centuries gone by, of lives and loves lost to time. Their voice carries the weight of ages.',
    'They sit down heavily, as if the weight of memory is suddenly too much to bear standing. "I remember when the world was different."'
  ],
  conflicted: [
    'They struggle visibly, wrestling with something internal. Pain flickers across their features as they wrestle with themselves.',
    'They look at you, caught between desire and restraint, wanting and refusing. "This is cruel," they whisper.',
    'They run their hands through their hair in frustration. "I want to... but I can\'t... I won\'t," they say, tormented.'
  ],
  melancholy: [
    'Sadness washes over them like a tide. They look away, voice dropping to barely a whisper. "Every single day."',
    'They sit down slowly, as if the weight of the world just became too much. "Does it ever get easier?" they ask softly.',
    'A long silence falls. When they finally speak, their voice is hollow. "I stopped counting the centuries ago."'
  ],
  breathless: [
    'They let out a shaky breath, eyes glowing bright red. They step closer, unable to maintain any distance anymore.',
    'Their breathing becomes ragged. They reach for you with trembling hands. "I can\'t... I don\'t want to stop," they whisper.',
    'Everything about them screams need. Their voice drops to something desperate. "Please," they breathe against your skin.'
  ],
  predatory: [
    'A slow, predatory smile spreads across their face. They circle you deliberately, eyes tracking your every movement. The hunter becomes the hunted.',
    'They move with liquid grace, completely in control. Every step is calculated, drawing you deeper under their spell.',
    'Their eyes glitter with dark amusement as they toy with you. "Run if you want. I love the chase."'
  ],
  hungry: [
    'They pull you close without hesitation, eyes completely red. Their hunger is palpable, overwhelming.',
    'Their breathing becomes ragged against your skin. Fangs trace along your neck as they inhale deeply.',
    'You feel completely at their mercy, pinned by their gaze and their strength. They whisper your name like a prayer and a curse.'
  ],
  desperate: [
    'They grip you tightly, trembling with need. Their voice breaks as they speak your name. "I need... please, I need..."',
    'There\'s nothing held back anymore. They kiss you urgently, desperately, like you\'re the last thing keeping them sane.',
    'They hold you like you might disappear. "Don\'t leave," they plead, their composure completely shattered.'
  ],
  respectful: [
    'Something in their expression shifts fundamentally. Genuine respect flickers across their features as they nod slowly.',
    'They step back, giving you space. When they speak, their voice is different—sincere. "I see you now."',
    'A moment of mutual recognition passes between you—not as predator and prey, but as equals. Something changes.'
  ],
  sad: [
    'They look at you with deep, aching sorrow. "It\'s not that simple," they say, almost helplessly, sitting down heavily.',
    'The weight of their nature seems to crush them in that moment. "I wish I could be what you want me to be."',
    'They touch your face gently, sadly. "Some curses can\'t be broken by love or will. Some just... are."'
  ],
  surprised: [
    'Shock registers on their usually composed features. They study you as if seeing you for the first time.',
    'For once, they seem truly vulnerable—the mask slipped. "I didn\'t expect..." they trail off, uncertain.',
    'They blink, processing what you\'ve said. "You... you really see me, don\'t you?" they whisper in wonder.'
  ],
  grateful: [
    'Tears glimmer in their immortal eyes—real tears. They reach for you, voice breaking. "No one has ever... Thank you."',
    'They pull you close gently, reverently. "In five hundred years, no one offered me redemption. Until you."',
    'They hold you like you\'re the most precious thing they\'ve ever touched. "I don\'t deserve this. But God, I need it."'
  ],
  grin: [
    'A wicked grin spreads across their face. They chuckle darkly, the sound thrilling and dangerous. "I like you."',
    'They circle you like a predator savoring the hunt. Their eyes glitter with dark amusement and hunger.',
    'They laugh—a sound both thrilling and terrifying. "You\'re either very brave or very stupid. I haven\'t decided which yet."'
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
      const responseTexts = VAMPIRE_RESPONSES[option.category];
      const vampireText = responseTexts[Math.floor(Math.random() * responseTexts.length)];
      
      // Determine outcome based on hunter's skill and vampire's exposure
      const hunterSkill = hunter.skill_level || 30;
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

        {/* Message Categories */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {Object.keys(DIALOGUE_OPTIONS).map(category => {
            const categoryColors = {
              flirty: 'from-pink-600 to-red-600',
              hostile: 'from-orange-600 to-red-600',
              curious: 'from-blue-600 to-purple-600',
              provocative: 'from-red-600 to-pink-600',
              protective: 'from-green-600 to-blue-600'
            };
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setVampireResponse(null);
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