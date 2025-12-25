import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart, Flame, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const QUICK_MESSAGES = {
  flirty: [
    'Thinking about you...',
    'Missing your touch',
    'Wish you were here',
    'Can\'t stop thinking about last night',
    'You drive me crazy'
  ],
  dominant: [
    'Behave yourself',
    'I expect you waiting for me',
    'Don\'t forget who you belong to',
    'Be ready when I get home',
    'Good {pet_name}'
  ],
  sweet: [
    'Hope your day is going well',
    'Checking in on you',
    'Can\'t wait to see you tonight',
    'You make everything better',
    'Love you'
  ],
  explicit: [
    'Thinking about your body',
    'I want you. Now.',
    'Remember what I did to you?',
    'Tonight, I\'m going to...',
    'You\'re mine'
  ]
};

export default function HospitalTexting({ servant, vampireState, onClose }) {
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState('');
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', servant.id],
    queryFn: () => base44.entities.Message.filter({ servant_id: servant.id }, '-created_date', 5)
  });

  const handleSendMessage = async (messageText) => {
    setSending(true);

    // Replace {pet_name} with actual title
    const title = vampireState.preferred_title || 'Master';
    const processedMessage = messageText.replace('{pet_name}', title);

    await base44.entities.Message.create({
      servant_id: servant.id,
      content: processedMessage,
      sender: 'vampire'
    });

    queryClient.invalidateQueries(['messages']);

    // Small relationship boost
    const relationshipGain = Math.floor(Math.random() * 4) + 3;
    await base44.entities.Servant.update(servant.id, {
      relationship: Math.min((servant.relationship || 0) + relationshipGain, 100)
    });

    // Get AI response
    setTimeout(async () => {
      const variantTraits = {
        devoted: 'deeply devoted, soft, eager to please, affectionate',
        defiant: 'resistant but fascinated, struggles with feelings, tsundere',
        dreamer: 'detached, poetic, ethereal, dreamy'
      };

      const prompt = `You are ${servant.name}, texting your vampire lover ${vampireState.vampire_name} back during work. Personality: ${variantTraits[servant.variant]}. Bond: ${servant.relationship}/100.

They texted: "${processedMessage}"

Respond in 1-2 sentences. Be authentic, flirty, and match their energy. If they're explicit, respond explicitly. If sweet, be sweet. Show your personality.`;

      try {
        const aiResponse = await base44.integrations.Core.InvokeLLM({ prompt });
        
        await base44.entities.Message.create({
          servant_id: servant.id,
          content: aiResponse,
          sender: 'servant'
        });

        setResponse(aiResponse);
      } catch (error) {
        setResponse('...');
      }

      queryClient.invalidateQueries(['messages']);
      
      setTimeout(() => {
        setSending(false);
        setCustomMessage('');
        setResponse('');
      }, 3000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Text {servant.name}</h2>
          <p className="text-gray-400 text-sm">On your break. Quick message.</p>
        </div>

        {response ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-4"
            >
              💬
            </motion.div>
            <p className="text-white italic mb-2">"{response}"</p>
            <p className="text-gray-400 text-sm">- {servant.name}</p>
          </div>
        ) : sending ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <MessageCircle className="w-12 h-12 text-purple-400 mx-auto" />
            </motion.div>
            <p className="text-gray-400 mt-4">Sending...</p>
          </div>
        ) : (
          <>
            {/* Recent messages */}
            {messages.length > 0 && (
              <div className="mb-6 bg-black/40 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-3">Recent conversation</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {messages.slice(0, 3).map((msg) => (
                    <div key={msg.id} className={`text-xs ${msg.sender === 'vampire' ? 'text-purple-300' : 'text-gray-400'}`}>
                      <span className="font-medium">{msg.sender === 'vampire' ? 'You' : servant.name}:</span> {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick messages */}
            <div className="space-y-4 mb-6">
              {Object.entries(QUICK_MESSAGES).map(([category, msgs]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    {category === 'flirty' && <Heart className="w-4 h-4 text-pink-400" />}
                    {category === 'dominant' && <Flame className="w-4 h-4 text-red-400" />}
                    {category === 'sweet' && <Heart className="w-4 h-4 text-blue-400" />}
                    {category === 'explicit' && <Flame className="w-4 h-4 text-orange-400" />}
                    <p className="text-gray-400 text-xs uppercase">{category}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msgs.map((msg, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(msg)}
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        {msg.replace('{pet_name}', vampireState.preferred_title || 'Master')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom message */}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-400 text-xs mb-2">Or type your own</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && customMessage.trim() && handleSendMessage(customMessage)}
                  placeholder="Type anything..."
                  className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none text-sm"
                />
                <button
                  onClick={() => customMessage.trim() && handleSendMessage(customMessage)}
                  disabled={!customMessage.trim()}
                  className="bitlife-btn rounded-xl px-6 py-3 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}