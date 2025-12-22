import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const DIALOGUE_BANKS = {
  devoted: {
    1: ['I waited where you left me.', 'You do not have to ask.', 'I feel steadier when you are near.'],
    2: ['I think about you constantly.', 'Tell me what you need.', 'I am here. Always.'],
    3: ['I cannot imagine life without you.', 'You are all I see.', 'Take whatever you want from me.'],
    4: ['I exist for this.', 'You are everything.', 'I belong to you.'],
    5: ['We are bound.', 'I feel you in my blood.', 'Forever.']
  },
  defiant: {
    1: ['I should not want this.', 'You are dangerous. I came anyway.', 'Tell me what you expect of me.'],
    2: ['I hate how much I need you.', 'This is not normal.', 'Why do I keep coming back?'],
    3: ['I have stopped fighting it.', 'You have won.', 'I do not recognize myself anymore.'],
    4: ['Take me. I am tired of resisting.', 'You were right about me.', 'I surrender.'],
    5: ['I am yours completely.', 'Resistance was pointless.', 'Command me.']
  },
  dreamer: {
    1: ['I dreamed of your voice again.', 'The night feels thinner lately.', 'I do not feel like myself anymore.'],
    2: ['Reality feels distant now.', 'Are you real?', 'I am drifting.'],
    3: ['I see you even when you are not here.', 'I am losing time.', 'Nothing else matters.'],
    4: ['I am more with you than without.', 'I barely remember daylight.', 'Keep me here.'],
    5: ['I am gone.', 'I live in your shadow.', 'The world dissolved.']
  }
};

export default function Messages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tab, setTab] = useState('messages');
  
  const urlParams = new URLSearchParams(window.location.search);
  const servantId = urlParams.get('servant');
  
  const { data: servant } = useQuery({
    queryKey: ['servant', servantId],
    queryFn: async () => {
      const servants = await base44.entities.Servant.list();
      return servants.find(s => s.id === servantId);
    },
    enabled: !!servantId
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', servantId],
    queryFn: () => base44.entities.Message.filter({ servant_id: servantId }, '-created_date'),
    enabled: !!servantId
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', servantId],
    queryFn: () => base44.entities.BusinessOrder.filter({ servant_id: servantId }, '-created_date'),
    enabled: !!servantId
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries(['messages', servantId]);
      setInput('');
      
      // Small relationship gain from messaging
      const relationshipGain = Math.floor(Math.random() * 3) + 2; // 2-4
      const oldRel = servant.relationship || 0;
      await base44.entities.Servant.update(servantId, {
        relationship: Math.min(oldRel + relationshipGain, 100)
      });
      queryClient.invalidateQueries(['servant', servantId]);
      
      // Simulate servant response after delay
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(async () => {
          const rel = servant.relationship || 0;

          // Build conversation history for context
          const recentMessages = messages.slice(-6).map(m => 
            `${m.sender === 'vampire' ? 'You' : servant.name}: ${m.content}`
          ).join('\n');

          // Build personality prompt
          const variantTraits = {
            devoted: 'You are deeply devoted, soft, earnest, and emotionally anchored to the vampire. You express warmth and devotion.',
            defiant: 'You have controlled resistance through fascination. You struggle with your feelings but are drawn to the vampire despite yourself.',
            dreamer: 'You are detached, poetic, and already half-gone into the vampire\'s world. You speak in dreamy, abstract ways.'
          };

          const relationshipContext = rel >= 80 ? 'deeply bound and utterly devoted' : 
                                    rel >= 60 ? 'trusting and devoted' :
                                    rel >= 40 ? 'beginning to trust' :
                                    rel >= 20 ? 'curious but cautious' : 'wary and uncertain';

          const prompt = `You are ${servant.name}, a human who has become a servant to a vampire. ${variantTraits[servant.variant]}

      Your current emotional state: ${relationshipContext}
      Obsession stage: ${servant.obsession_stage}/5

      Recent conversation:
      ${recentMessages}
      You: ${input}

      Respond as ${servant.name} in 1-2 short sentences. Be emotional and stay in character, but keep things subtle and not overly explicit. Keep it brief and natural.`;

          try {
            const response = await base44.integrations.Core.InvokeLLM({
              prompt: prompt
            });

            await base44.entities.Message.create({
              servant_id: servantId,
              content: response,
              sender: 'servant'
            });
          } catch (error) {
            // Fallback to dialogue bank if LLM fails
            const responses = DIALOGUE_BANKS[servant.variant]?.[servant.obsession_stage] || ['...'];
            const response = responses[Math.floor(Math.random() * responses.length)];

            await base44.entities.Message.create({
              servant_id: servantId,
              content: response,
              sender: 'servant'
            });
          }

          setIsTyping(false);
          queryClient.invalidateQueries(['messages', servantId]);
        }, 3000 + Math.random() * 3000);
      }, 500);
    }
  });
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    sendMessageMutation.mutate({
      servant_id: servantId,
      content: input,
      sender: 'vampire'
    });

    // Update quest progress
    base44.entities.Quest.filter({ servant_id: servantId }).then(quests => {
      const activeQuest = quests.find(q => !q.completed);
      if (activeQuest) {
        const progress = activeQuest.progress || {};
        const newCount = (progress.message || 0) + 1;
        base44.entities.Quest.update(activeQuest.id, {
          progress: { ...progress, message: newCount }
        });
      }
    });
  };
  
  const handleClearMessages = async () => {
    if (messages.length === 0) return;
    if (!confirm('Clear all messages with this servant?')) return;
    
    await base44.entities.Message.filter({ servant_id: servantId }).then(async (msgs) => {
      for (const msg of msgs) {
        await base44.entities.Message.delete(msg.id);
      }
    });
    
    queryClient.invalidateQueries(['messages', servantId]);
  };

  if (!servant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-white font-medium">{servant.name}</h2>
            <p className="text-gray-400 text-xs capitalize">{servant.variant}</p>
          </div>
          <button
            onClick={handleClearMessages}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Clear messages"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('messages')}
            className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
              tab === 'messages' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setTab('business')}
            className={`flex-1 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 ${
              tab === 'business' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            <Package className="w-4 h-4" />
            Business {orders.length > 0 && `(${orders.length})`}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tab === 'messages' ? (
          <>
            {messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'vampire' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.sender === 'vampire'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-800 text-gray-400 rounded-2xl px-4 py-2">
                  <p className="text-sm">typing...</p>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        ) : (
          <>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No orders yet...</p>
            ) : (
              orders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-medium">{order.customer_name}</h3>
                      <p className="text-gray-400 text-sm">{order.item}</p>
                    </div>
                    <p className="text-purple-400 font-medium">${order.price}</p>
                  </div>
                  {order.message && (
                    <p className="text-gray-300 text-sm italic mb-2">"{order.message}"</p>
                  )}
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    order.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                    order.status === 'crafting' ? 'bg-purple-900/30 text-purple-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {order.status}
                  </span>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>
      
      {/* Input */}
      <div className="bg-gray-900 p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Send a message..."
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bitlife-btn rounded-xl px-6 py-3 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}