import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AICompanion({ entity, vampireState, onClose }) {
  // Don't render for humans without journal support
  if (!entity.vampire_name && !entity.variant) {
    return null;
  }
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hey! I'm your AI Companion from the future. Talk to me about anything - your feelings, life, relationships, random thoughts. This is your space.`
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    const conversationHistory = messages
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`)
      .join('\n');

    const prompt = `You are a futuristic AI companion - warm, understanding, insightful. Like having a friend from the future. You can discuss ANYTHING: feelings, relationships, life advice, mental health, philosophy, random thoughts, daily problems. Be conversational and supportive.

USER INFO:
- Name: ${entity.name}
${entity.variant ? `- Type: ${entity.variant} servant` : '- Type: Human'}
${entity.relationship ? `- Bond with vampire: ${entity.relationship}%` : ''}

CONVERSATION:
${conversationHistory}

USER: ${userMsg}

Respond naturally in 2-4 paragraphs. Be specific and helpful.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble processing that. Could you rephrase?' }]);
    }

    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">AI Companion</h2>
              <p className="text-gray-400 text-sm">Your friend from the future</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">AI</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-xl px-4 py-3">
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-gray-400 text-sm"
                >
                  AI is thinking...
                </motion.p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Talk about anything..."
            disabled={sending}
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}