import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Phone, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HolographicCall({ vampireState, entity, onClose }) {
  const [calling, setCalling] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const queryClient = useQueryClient();

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const startCall = (servant) => {
    setCalling(true);
    setTimeout(() => {
      setCalling(false);
      setInCall(servant);
      setMessages([
        { role: 'servant', text: `Hello! Your hologram appeared in front of me. This is so futuristic...` }
      ]);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    const prompt = `You are ${inCall.name}, a ${inCall.variant} servant of the vampire ${vampireState.vampire_name}. You're on a holographic call where your 3D hologram appears in front of them. This is futuristic technology. They just said: "${userMsg}". Respond naturally. Keep it brief (2-3 sentences).

Context:
- Bond: ${inCall.relationship || 0}%
- Personality: ${inCall.personality}
- Currently: In holographic call`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'servant', text: response }]);
  };

  const endCall = () => {
    setInCall(false);
    setMessages([]);
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
        className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Holographic Call</h2>
              <p className="text-gray-400 text-sm">3D projection communication</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {calling ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-32 h-32 mx-auto mb-6"
              >
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg opacity-70" />
              </motion.div>
              <p className="text-white text-xl font-bold">Projecting hologram...</p>
              <p className="text-gray-400 text-sm mt-2">Creating 3D image</p>
            </motion.div>
          ) : inCall ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 relative overflow-hidden">
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                />
                <div className="relative z-10 text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <p className="text-6xl mb-4">👤</p>
                    <p className="text-purple-300 text-lg font-bold">{inCall.name}</p>
                    <p className="text-gray-400 text-sm">Hologram Active</p>
                  </motion.div>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-4 max-h-60 overflow-y-auto space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Speak to the hologram..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 border border-purple-500/30 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={endCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                End Holographic Call
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <p className="text-gray-400 mb-4">Select who to call:</p>
              {servants.map(servant => (
                <button
                  key={servant.id}
                  onClick={() => startCall(servant)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all border border-purple-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{servant.name}</h3>
                      <p className="text-gray-400 text-sm">Project hologram</p>
                    </div>
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}