import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
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
          let responses = DIALOGUE_BANKS[servant.variant]?.[servant.obsession_stage] || ['...'];
          
          // High relationship unlocks special dialogue
          if (rel >= 80) {
            const highRelDialogue = {
              devoted: ['I would follow you anywhere. Forever.', 'You are all I think about. All I need.', 'I belong to you. Completely.'],
              defiant: ['Hate how much I need you. And I do need you.', 'You broke me. And I\'m glad you did.', 'I\'m yours. Even if it terrifies me.'],
              dreamer: ['You\'re in my dreams. You are my dreams.', 'I see you in everything.', 'Reality bends around you. Around us.']
            };
            if (Math.random() < 0.4) {
              responses = highRelDialogue[servant.variant] || responses;
            }
          } else if (rel >= 60) {
            const midRelDialogue = {
              devoted: ['I trust you completely.', 'Being near you feels right.', 'Tell me what you need. I\'ll do it.'],
              defiant: ['I... I think I understand you now.', 'This is getting complicated.', 'Why do I keep coming back to you?'],
              dreamer: ['There\'s something different about you.', 'I feel like I\'m waking up. Or falling asleep. I can\'t tell.', 'Time feels strange when you\'re here.']
            };
            if (Math.random() < 0.3) {
              responses = midRelDialogue[servant.variant] || responses;
            }
          }
          
          const response = responses[Math.floor(Math.random() * responses.length)];
          
          await base44.entities.Message.create({
            servant_id: servantId,
            content: response,
            sender: 'servant'
          });
          
          setIsTyping(false);
          queryClient.invalidateQueries(['messages', servantId]);
        }, 3000 + Math.random() * 6000);
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
      <div className="bg-gray-900 p-4 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={() => navigate(createPageUrl('Night'))}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-white font-medium">{servant.name}</h2>
          <p className="text-gray-400 text-xs capitalize">{servant.variant}</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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