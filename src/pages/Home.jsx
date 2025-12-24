import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TutorialSystem from '@/components/nightbound/TutorialSystem';

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vampireName, setVampireName] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });
  
  const existingGame = vampireStates.length > 0;
  
  const startNewGame = async () => {
    if (!vampireName.trim()) {
      alert('Please enter a name for your vampire');
      return;
    }
    
    // Delete old vampire state
    if (vampireStates.length > 0) {
      await base44.entities.VampireState.delete(vampireStates[0].id);
    }
    
    // Create new vampire
    await base44.entities.VampireState.create({
      vampire_name: vampireName.trim(),
      job: 'Night Shift Nurse',
      hunger_state: 'calm',
      emotional_mode: 'feeling',
      unlocked_powers: [],
      nights_passed: 0,
      humanity: 50,
      moral_path: 'balanced'
    });
    
    queryClient.invalidateQueries();
    navigate(createPageUrl('Night'));
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wider">NIGHTBOUND</h1>
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
          
          <button
            onClick={() => setShowIntro(true)}
            className="w-full bg-gradient-to-r from-purple-900/60 to-red-900/60 hover:from-purple-900/80 hover:to-red-900/80 border-2 border-purple-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all flex items-center justify-center gap-3"
          >
            <Moon className="w-5 h-5" />
            New Game
          </button>
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

      {/* Intro Popup */}
      {showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 max-w-lg w-full border-2 border-red-900/50"
          >
            {introStep === 0 && (
              <>
                <h2 className="text-3xl font-bold text-red-400 mb-4">You died.</h2>
                <p className="text-gray-300 mb-4">Three nights ago. Car accident. Quick. Painless.</p>
                <p className="text-gray-300 mb-4">But you didn't stay dead.</p>
                <p className="text-gray-300 mb-4">Something ancient woke you. Changed you. You're a vampire now. Male. Immortal.</p>
                <p className="text-gray-300 mb-6">The nights stretch endlessly ahead.</p>
                <button
                  onClick={() => setIntroStep(1)}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 rounded-lg py-3 text-white font-medium transition-all"
                >
                  Continue
                </button>
              </>
            )}
            
            {introStep === 1 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">What is your name?</h2>
                <p className="text-purple-300 text-sm mb-4">The name you'll carry through eternity</p>
                <input
                  type="text"
                  value={vampireName}
                  onChange={(e) => setVampireName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && vampireName.trim() && startNewGame()}
                  placeholder="Your eternal name..."
                  className="w-full bg-gray-900 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-red-500"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowIntro(false); setIntroStep(0); }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startNewGame}
                    disabled={!vampireName.trim()}
                    className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 rounded-lg py-3 text-white font-medium transition-all disabled:opacity-50"
                  >
                    Begin
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}