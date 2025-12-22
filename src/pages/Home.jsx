import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();
  const [vampireName, setVampireName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });
  
  const existingGame = vampireStates.length > 0;
  
  const handleNewGame = async () => {
    if (!vampireName.trim()) {
      alert('Please enter a name for your vampire');
      return;
    }
    
    // Clear all existing data
    const servants = await base44.entities.Servant.list();
    const logs = await base44.entities.NightLog.list();
    const quests = await base44.entities.Quest.list();
    const messages = await base44.entities.Message.list();
    const temptations = await base44.entities.Temptation.list();
    const powerProgress = await base44.entities.PowerProgress.list();
    const interactionProgress = await base44.entities.InteractionProgress.list();
    
    await Promise.all([
      ...servants.map(s => base44.entities.Servant.delete(s.id)),
      ...logs.map(l => base44.entities.NightLog.delete(l.id)),
      ...quests.map(q => base44.entities.Quest.delete(q.id)),
      ...messages.map(m => base44.entities.Message.delete(m.id)),
      ...temptations.map(t => base44.entities.Temptation.delete(t.id)),
      ...powerProgress.map(p => base44.entities.PowerProgress.delete(p.id)),
      ...interactionProgress.map(i => base44.entities.InteractionProgress.delete(i.id)),
      ...vampireStates.map(v => base44.entities.VampireState.delete(v.id))
    ]);
    
    // Create new vampire state
    await base44.entities.VampireState.create({
      vampire_name: vampireName.trim(),
      hunger_state: 'calm',
      emotional_mode: 'feeling',
      humanity_on: true,
      ripper_mode: false,
      unlocked_powers: [],
      nights_passed: 0,
      humanity: 50,
      moral_path: 'balanced',
      game_started: false,
      game_start_date: new Date().toISOString()
    });
    
    navigate(createPageUrl('OpeningScene'));
  };
  
  const handleContinue = () => {
    navigate(createPageUrl('Night'));
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center"
         style={{ background: 'linear-gradient(to bottom, #0a0a14 0%, #1a0a1a 50%, #0a0014 100%)' }}>
      
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center max-w-xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Moon className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-white mb-2 tracking-wider">NIGHTBOUND</h1>
          <p className="text-red-300 text-sm italic mb-12">Where immortality begins</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-4"
        >
          {existingGame && (
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-red-900/60 to-purple-900/60 hover:from-red-900/80 hover:to-purple-900/80 border-2 border-red-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              Continue Game
            </button>
          )}
          
          {!showNameInput ? (
            <button
              onClick={() => setShowNameInput(true)}
              className="w-full bg-gradient-to-r from-purple-900/60 to-red-900/60 hover:from-purple-900/80 hover:to-red-900/80 border-2 border-purple-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all flex items-center justify-center gap-3"
            >
              <Moon className="w-5 h-5" />
              New Game
            </button>
          ) : (
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30">
              <h3 className="text-white text-lg font-bold mb-4">Name Your Vampire</h3>
              <input
                type="text"
                value={vampireName}
                onChange={(e) => setVampireName(e.target.value)}
                placeholder="Enter your eternal name..."
                className="w-full bg-gray-900 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-purple-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNameInput(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewGame}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 rounded-lg py-3 text-white font-medium transition-all"
                >
                  Begin
                </button>
              </div>
            </div>
          )}
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-gray-500 text-xs mt-12"
        >
          Every choice echoes through eternity
        </motion.p>
      </div>
    </div>
  );
}