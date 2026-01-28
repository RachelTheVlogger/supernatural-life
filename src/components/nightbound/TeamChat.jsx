import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function TeamChat({ hunter, team, onClose }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['teamMessages', team?.id],
    queryFn: () => base44.entities.TeamMessage.filter({ team_id: team.id }, '-created_date', 50),
    refetchInterval: 3000 // Poll every 3 seconds
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await base44.entities.TeamMessage.create({
        team_id: team.id,
        sender_id: hunter.id,
        sender_name: hunter.name,
        content: message,
        message_type: 'text'
      });

      setMessage('');
      queryClient.invalidateQueries(['teamMessages']);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'mission_update': return 'border-l-blue-500';
      case 'alert': return 'border-l-red-500';
      case 'system': return 'border-l-gray-500';
      default: return 'border-l-purple-500';
    }
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 max-w-2xl w-full h-[80vh] flex flex-col border border-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Team Chat</h2>
            <p className="text-gray-400">{team?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800/50 rounded-lg p-4 border-l-4 ${getMessageColor(msg.message_type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-medium">{msg.sender_name}</p>
                  <span className="text-gray-500 text-xs">
                    {new Date(msg.created_date).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-300">{msg.content}</p>
                {msg.message_type !== 'text' && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                    {msg.message_type.replace('_', ' ')}
                  </span>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}