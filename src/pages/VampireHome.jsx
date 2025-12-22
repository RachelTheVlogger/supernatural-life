import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Book, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function VampireHome() {
  const navigate = useNavigate();
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });
  
  const vampireState = vampireStates[0];
  
  return (
    <div className="min-h-screen relative overflow-hidden"
         style={{ background: 'linear-gradient(to bottom, #0a0a14 0%, #1a0a1a 50%, #0a0014 100%)' }}>
      
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(createPageUrl('Night'))}
          className="text-white/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Your Sanctuary</h1>
            <p className="text-gray-400">Where the night begins and ends</p>
          </motion.div>
          
          {/* Room sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Main chamber */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30"
            >
              <div className="text-6xl mb-4">🕯️</div>
              <h3 className="text-white text-xl font-bold mb-2">Main Chamber</h3>
              <p className="text-gray-400 text-sm">
                Velvet curtains drawn. Candles cast long shadows. The air holds centuries.
              </p>
            </motion.div>
            
            {/* Library */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30"
            >
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-white text-xl font-bold mb-2">Library</h3>
              <p className="text-gray-400 text-sm">
                Books older than memory. Knowledge accumulated through endless nights.
              </p>
            </motion.div>
            
            {/* Windows */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30"
            >
              <div className="text-6xl mb-4">🌙</div>
              <h3 className="text-white text-xl font-bold mb-2">The View</h3>
              <p className="text-gray-400 text-sm">
                Floor to ceiling windows. The city sleeps below. You do not.
              </p>
            </motion.div>
            
            {/* Resting place */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30"
            >
              <div className="text-6xl mb-4">🛏️</div>
              <h3 className="text-white text-xl font-bold mb-2">Resting Place</h3>
              <p className="text-gray-400 text-sm">
                Where dawn finds you. Silk sheets, darkness absolute. Safety.
              </p>
            </motion.div>
          </div>
          
          {/* Stats display */}
          {vampireState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30"
            >
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Your Current State
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Night:</span>
                  <span className="text-white ml-2">{vampireState.nights_passed}</span>
                </div>
                <div>
                  <span className="text-gray-400">Hunger:</span>
                  <span className="text-white ml-2 capitalize">{vampireState.hunger_state}</span>
                </div>
                <div>
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-white ml-2 capitalize">{vampireState.emotional_mode}</span>
                </div>
                <div>
                  <span className="text-gray-400">Powers:</span>
                  <span className="text-white ml-2">{vampireState.unlocked_powers?.length || 0}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}