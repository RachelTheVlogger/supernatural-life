import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Home, MessageCircle, BookOpen, Coffee, Droplets, Shirt, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CHORES = [
  { id: 'clean', label: 'Clean the rooms', icon: Sparkles, duration: 2000, outcomes: ['You tidied the bedroom. Everything feels peaceful.', 'You dusted the shelves. The space feels lighter.', 'You organized their belongings with care.'] },
  { id: 'prepare', label: 'Prepare their space', icon: Home, duration: 2000, outcomes: ['You arranged fresh linens. The bed smells like night air.', 'You lit candles around the room. Shadows dance.', 'You set out their things exactly how they like them.'] },
  { id: 'study', label: 'Study their books', icon: BookOpen, duration: 2500, outcomes: ['You read about the old ways. Some things make sense now.', 'Their books are strange. Beautiful. Terrifying.', 'You found a page marked for you. Your name written in the margin.'] },
  { id: 'tea', label: 'Brew tea', icon: Coffee, duration: 1500, outcomes: ['You made tea. Waiting for them to return.', 'The tea grows cold. They\'re still out.', 'You saved some for when they come back.'] },
  { id: 'bathe', label: 'Draw a bath', icon: Droplets, duration: 2000, outcomes: ['You prepared a bath for them. Rose petals floating.', 'Hot water. Steam. You wonder if they\'ll invite you to stay.', 'The bath is ready. You hope they notice.'] },
  { id: 'wardrobe', label: 'Tend their wardrobe', icon: Shirt, duration: 2000, outcomes: ['You brushed their clothes. Your fingers traced the fabric they wear.', 'Everything folded perfectly. You breathed in their scent.', 'You repaired a tear in their sleeve. Small ways to care for them.'] },
  { id: 'wait', label: 'Wait by the window', icon: Moon, duration: 3000, outcomes: ['You watched the night. Waiting. Always waiting.', 'Every shadow could be them returning.', 'The hours pass differently when they\'re gone.'] }
];

export default function ServantHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [doingChore, setDoingChore] = useState(null);
  const [choreOutcome, setChoreOutcome] = useState('');
  
  const urlParams = new URLSearchParams(window.location.search);
  const servantId = urlParams.get('id');
  
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
  
  const unreadMessages = messages.filter(m => !m.read && m.sender === 'vampire').length;
  
  const handleChore = async (chore) => {
    setDoingChore(chore.id);
    
    setTimeout(async () => {
      const outcome = chore.outcomes[Math.floor(Math.random() * chore.outcomes.length)];
      setChoreOutcome(outcome);
      
      // Small relationship gain from doing chores
      const relationshipGain = Math.floor(Math.random() * 3) + 2; // 2-4
      if (servant) {
        await base44.entities.Servant.update(servantId, {
          relationship: Math.min((servant.relationship || 0) + relationshipGain, 100)
        });
      }
      
      await base44.entities.NightLog.create({
        entry: `${servant?.name}: ${outcome}`,
        category: 'interaction',
        intensity: 'subtle'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setDoingChore(null);
        setChoreOutcome('');
      }, 3000);
    }, chore.duration);
  };
  
  if (!servant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
          {servant.name}
        </h1>
        <p className="text-sm text-gray-400 capitalize">
          {servant.variant} servant
        </p>
        
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            Switch to Vampire →
          </button>
          <button
            onClick={() => navigate(createPageUrl(`Messages?servant=${servantId}`))}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
            Messages {unreadMessages > 0 && `(${unreadMessages})`}
          </button>
        </div>
      </motion.div>
      
      {/* Emotional state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto bg-gray-900 rounded-xl p-4 mb-6"
      >
        <p className="text-gray-300 text-sm italic text-center">
          They're out hunting. You wait for them to return.
        </p>
        <div className="mt-3 flex justify-between text-xs">
          <span className="text-gray-400">Bond with them:</span>
          <span className="text-purple-400">{servant.relationship || 0}%</span>
        </div>
      </motion.div>
      
      {/* Chores */}
      <div className="max-w-2xl mx-auto space-y-3 mb-8">
        <h2 className="text-gray-400 text-sm uppercase mb-4">What will you do?</h2>
        
        {CHORES.map((chore, i) => (
          <motion.button
            key={chore.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => handleChore(chore)}
            disabled={!!doingChore}
            className="bitlife-btn w-full rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg disabled:opacity-50"
          >
            <chore.icon className="w-5 h-5" />
            <span className="text-base font-medium">{chore.label}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Outcome display */}
      <AnimatePresence>
        {choreOutcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center">
              <p className="text-gray-300 text-lg">{choreOutcome}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}