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
  const [vampireGender, setVampireGender] = useState('man');
  const [vampireSexuality, setVampireSexuality] = useState('bisexual');
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: async () => {
      try {
        return await base44.entities.VampireState.list();
      } catch (e) {
        console.error('Failed to fetch vampire state:', e);
        return [];
      }
    },
    retry: 2
  });
  
  const existingGame = vampireStates.length > 0;
  
  const startNewGame = async () => {
    if (!vampireName.trim()) {
      alert('Please enter a name for your vampire');
      return;
    }
    
    await base44.entities.VampireState.create({
      vampire_name: vampireName.trim(),
      gender: vampireGender,
      sexuality: vampireSexuality,
      job: 'Night Shift Nurse',
      hunger_state: 'calm',
      emotional_mode: 'feeling',
      vampire_stage: 2,
      vampire_power_level: 25,
      unlocked_powers: ['Enhanced Senses', 'Compulsion'],
      nights_passed: 0,
      current_date: new Date().toISOString(),
      humanity: 50,
      moral_path: 'balanced',
      time_of_day: 'night'
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-wider">SUPERNATURAL LIFE</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-4"
        >
          {existingGame && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleContinue();
              }}
              className="w-full bg-gradient-to-r from-red-900/60 to-purple-900/60 hover:from-red-900/80 hover:to-purple-900/80 border-2 border-red-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              Continue Game
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIntro(true);
            }}
            className="w-full bg-gradient-to-r from-purple-900/60 to-red-900/60 hover:from-purple-900/80 hover:to-red-900/80 border-2 border-purple-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all flex items-center justify-center gap-3"
          >
            <Moon className="w-5 h-5" />
            New Game
          </button>
        </motion.div>
        

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
                <h2 className="text-2xl font-bold text-white mb-4">What is your name?</h2>
                <input
                  type="text"
                  value={vampireName}
                  onChange={(e) => setVampireName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && vampireName.trim() && setIntroStep(1)}
                  placeholder="Your name..."
                  className="w-full bg-gray-900 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-red-500"
                  autoFocus
                />
                <button
                  onClick={() => setIntroStep(1)}
                  disabled={!vampireName.trim()}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 rounded-lg py-3 text-white font-medium transition-all disabled:opacity-50"
                >
                  Continue
                </button>
              </>
            )}

            {introStep === 1 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Your identity</h2>
                <p className="text-purple-300 text-sm mb-4">How do you see yourself?</p>
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setVampireGender('man')}
                    className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                      vampireGender === 'man' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">Man</span>
                    <p className="text-sm opacity-80">He/Him</p>
                  </button>
                  <button
                    onClick={() => setVampireGender('woman')}
                    className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                      vampireGender === 'woman' 
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">Woman</span>
                    <p className="text-sm opacity-80">She/Her</p>
                  </button>
                  <button
                    onClick={() => setVampireGender('custom')}
                    className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                      vampireGender === 'custom' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">Custom</span>
                    <p className="text-sm opacity-80">They/Them</p>
                  </button>
                </div>
                <button
                  onClick={() => setIntroStep(2)}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 rounded-lg py-3 text-white font-medium transition-all"
                >
                  Continue
                </button>
              </>
            )}

            {introStep === 2 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Your sexuality</h2>
                <p className="text-purple-300 text-sm mb-4">Who are you attracted to?</p>
                <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto">
                  {[
                    { value: 'straight', label: 'Straight', desc: 'Attracted to opposite gender' },
                    { value: 'gay', label: 'Gay', desc: 'Men attracted to men' },
                    { value: 'lesbian', label: 'Lesbian', desc: 'Women attracted to women' },
                    { value: 'bisexual', label: 'Bisexual', desc: 'Attracted to two or more genders' },
                    { value: 'pansexual', label: 'Pansexual', desc: 'Attracted to all genders' },
                    { value: 'asexual', label: 'Asexual', desc: 'Little to no sexual attraction' },
                    { value: 'questioning', label: 'Questioning', desc: 'Still figuring it out' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setVampireSexuality(option.value)}
                      className={`w-full rounded-lg py-3 px-4 text-left transition-all ${
                        vampireSexuality === option.value 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm opacity-80">{option.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIntroStep(1)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={startNewGame}
                    className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 rounded-lg py-3 text-white font-medium transition-all"
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