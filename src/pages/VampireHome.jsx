import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, Book, Clock, Zap, Heart, Brain, Eye, Scroll, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EvolutionTree from '@/components/nightbound/EvolutionTree';
import DirectInteraction from '@/components/nightbound/DirectInteraction';
import TemptationModal from '@/components/nightbound/TemptationModal';

export default function VampireHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState(null);
  const [meditating, setMeditating] = useState(false);
  const [showEvolutionTree, setShowEvolutionTree] = useState(false);
  const [selectedServantForInteraction, setSelectedServantForInteraction] = useState(null);
  const [showTemptation, setShowTemptation] = useState(false);
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });
  
  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });
  
  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: () => base44.entities.NightLog.list()
  });
  
  const vampireState = vampireStates[0] || {
    hunger_state: 'calm',
    emotional_mode: 'feeling',
    unlocked_powers: [],
    nights_passed: 0
  };
  
  const handleMeditate = async () => {
    setMeditating(true);
    setTimeout(async () => {
      await base44.entities.NightLog.create({
        entry: 'You meditated in silence. The hunger quieted, if only for a moment.',
        category: 'observation',
        intensity: 'subtle'
      });
      
      if (vampireState.id && vampireState.hunger_state !== 'sated') {
        const hungerStates = ['restless', 'heightened', 'lingering', 'calm', 'sated'];
        const currentIndex = hungerStates.indexOf(vampireState.hunger_state);
        if (currentIndex < hungerStates.length - 1) {
          await base44.entities.VampireState.update(vampireState.id, {
            hunger_state: hungerStates[currentIndex + 1]
          });
        }
      }
      
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      setMeditating(false);
      setActiveAction(null);
    }, 3000);
  };
  
  const handleReadLore = () => {
    setActiveAction('lore');
  };
  
  const handlePracticePower = async () => {
    setActiveAction('practice');
    setTimeout(async () => {
      await base44.entities.NightLog.create({
        entry: 'You practiced your abilities in solitude. Control sharpens with repetition.',
        category: 'power',
        intensity: 'moderate'
      });
      queryClient.invalidateQueries(['logs']);
      setActiveAction(null);
    }, 2500);
  };
  
  const turnedServants = servants.filter(s => s.is_turned);
  const totalRelationship = servants.reduce((sum, s) => sum + (s.relationship || 0), 0);
  const avgRelationship = servants.length > 0 ? Math.round(totalRelationship / servants.length) : 0;
  
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
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {servants.length > 0 && (
            <button
              onClick={() => navigate(createPageUrl(`ServantHome?id=${servants[0].id}`))}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              Switch to Servant →
            </button>
          )}
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Your Sanctuary</h1>
            <p className="text-gray-400">Where the night begins and ends</p>
          </motion.div>
          
          {/* Quick Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Clock className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{vampireState.nights_passed}</p>
              <p className="text-xs text-gray-400">Nights Survived</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Heart className="w-6 h-6 text-red-400 mb-2" />
              <p className="text-2xl font-bold text-white">{servants.length}</p>
              <p className="text-xs text-gray-400">Servants</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Zap className="w-6 h-6 text-yellow-400 mb-2" />
              <p className="text-2xl font-bold text-white">{vampireState.unlocked_powers?.length || 0}</p>
              <p className="text-xs text-gray-400">Powers Unlocked</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Eye className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{logs.length}</p>
              <p className="text-xs text-gray-400">Events Witnessed</p>
            </div>
          </motion.div>
          
          {/* Evolution Tree Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <button
              onClick={() => setShowEvolutionTree(true)}
              className="w-full bg-gradient-to-r from-purple-900/40 to-red-900/40 hover:from-purple-900/60 hover:to-red-900/60 border-2 border-purple-500/50 rounded-2xl p-6 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TreePine className="w-10 h-10 text-purple-400" />
                  <div className="text-left">
                    <h3 className="text-white text-xl font-bold mb-1">Evolution Paths</h3>
                    <p className="text-gray-300 text-sm">Unlock new powers and specialize your abilities</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 text-2xl font-bold">{vampireState.unlocked_powers?.length || 0}</p>
                  <p className="text-gray-400 text-xs">Powers</p>
                </div>
              </div>
            </button>
          </motion.div>
          
          {/* Vampire Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Vampire Practices
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={handleMeditate}
                disabled={meditating}
                className="bg-purple-950/30 hover:bg-purple-950/50 border border-purple-800/50 rounded-xl p-4 text-left transition-all disabled:opacity-50"
              >
                <Brain className="w-6 h-6 text-purple-400 mb-2" />
                <h3 className="text-white font-medium mb-1">Meditate</h3>
                <p className="text-gray-400 text-sm">Calm the hunger. Center yourself.</p>
              </button>
              
              <button
                onClick={handleReadLore}
                className="bg-blue-950/30 hover:bg-blue-950/50 border border-blue-800/50 rounded-xl p-4 text-left transition-all"
              >
                <Scroll className="w-6 h-6 text-blue-400 mb-2" />
                <h3 className="text-white font-medium mb-1">Ancient Texts</h3>
                <p className="text-gray-400 text-sm">Read fragments of vampire lore.</p>
              </button>
              
              <button
                onClick={handlePracticePower}
                disabled={!vampireState.unlocked_powers?.length}
                className="bg-red-950/30 hover:bg-red-950/50 border border-red-800/50 rounded-xl p-4 text-left transition-all disabled:opacity-50"
              >
                <Zap className="w-6 h-6 text-red-400 mb-2" />
                <h3 className="text-white font-medium mb-1">Practice Powers</h3>
                <p className="text-gray-400 text-sm">Hone your abilities in solitude.</p>
              </button>
            </div>
          </motion.div>
          
          {/* Temptation System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <button
              onClick={() => setShowTemptation(true)}
              className="w-full bg-gradient-to-r from-red-950/40 to-purple-950/40 hover:from-red-950/60 hover:to-purple-950/60 border-2 border-red-500/50 rounded-2xl p-6 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔥
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-white text-xl font-bold mb-1">Face a Temptation</h3>
                    <p className="text-gray-300 text-sm">Risk and reward. Choose wisely.</p>
                  </div>
                </div>
              </div>
            </button>
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
          
          {/* Progress & Relationships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Current State */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Current State
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Hunger</span>
                  <span className="text-white text-sm capitalize font-medium">{vampireState.hunger_state}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Emotional Mode</span>
                  <button
                    onClick={async () => {
                      if (vampireState.id) {
                        await base44.entities.VampireState.update(vampireState.id, {
                          emotional_mode: vampireState.emotional_mode === 'feeling' ? 'ruthless' : 'feeling'
                        });
                        queryClient.invalidateQueries(['vampireState']);
                      }
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm capitalize font-medium transition-colors"
                  >
                    {vampireState.emotional_mode} ⚡
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Turned Servants</span>
                  <span className="text-white text-sm font-medium">{turnedServants.length}</span>
                </div>
              </div>
            </div>
            
            {/* Relationships */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Bonds
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Average Bond</span>
                  <span className="text-white text-sm font-medium">{avgRelationship}/100</span>
                </div>
                {servants.slice(0, 3).map(servant => (
                  <div key={servant.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{servant.name}</span>
                      {servant.obsession_stage >= 2 && (
                        <button
                          onClick={() => setSelectedServantForInteraction(servant)}
                          className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
                        >
                          <Heart className="w-3 h-3 inline" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-1.5">
                        <div
                          style={{ width: `${servant.relationship || 0}%` }}
                          className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-red-500"
                        />
                      </div>
                      <span className="text-white text-xs w-8">{servant.relationship || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Unlocked Powers Display */}
          {vampireState.unlocked_powers?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30"
            >
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Mastered Abilities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vampireState.unlocked_powers.map((power, i) => (
                  <div
                    key={i}
                    className="bg-purple-950/20 border border-purple-800/30 rounded-lg px-3 py-2 text-sm text-purple-300"
                  >
                    {power}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Action Modals */}
      <AnimatePresence>
        {showEvolutionTree && (
          <EvolutionTree
            vampireState={vampireState}
            servants={servants}
            onClose={() => setShowEvolutionTree(false)}
          />
        )}
        {selectedServantForInteraction && (
          <DirectInteraction
            servant={selectedServantForInteraction}
            vampireState={vampireState}
            onClose={() => setSelectedServantForInteraction(null)}
          />
        )}
        {showTemptation && (
          <TemptationModal
            vampireState={vampireState}
            servants={servants}
            onClose={() => setShowTemptation(false)}
          />
        )}
        {meditating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <Moon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Meditating...</p>
            </motion.div>
          </motion.div>
        )}
        
        {activeAction === 'lore' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setActiveAction(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-900/30"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Ancient Texts</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p className="italic border-l-2 border-purple-500 pl-4">
                  "The first night is always the longest. Every night after is borrowed time."
                </p>
                <p className="italic border-l-2 border-red-500 pl-4">
                  "To turn another is to bind yourself. Their hunger becomes yours. Their death, your death."
                </p>
                <p className="italic border-l-2 border-blue-500 pl-4">
                  "Memory is the only immortality that matters. What you remember, you become."
                </p>
                <p className="italic border-l-2 border-purple-500 pl-4">
                  "The oldest vampires don't hunt. They don't need to. They've learned to feed on time itself."
                </p>
              </div>
              <button
                onClick={() => setActiveAction(null)}
                className="mt-6 w-full bitlife-btn py-3 rounded-xl"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {activeAction === 'practice' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <Zap className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Practicing...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}