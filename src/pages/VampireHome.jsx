import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, Book, Zap, Heart, Brain, Eye, Scroll, TreePine, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EvolutionTree from '@/components/nightbound/EvolutionTree';
import DirectInteraction from '@/components/nightbound/DirectInteraction';
import TemptationModal from '@/components/nightbound/TemptationModal';
import OnlyFangsManagement from '@/components/nightbound/OnlyFangsManagement';
import MoralityDisplay from '@/components/nightbound/MoralityDisplay';
import FriendInteraction from '@/components/nightbound/FriendInteraction';

export default function VampireHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState(null);
  const [meditating, setMeditating] = useState(false);
  const [showEvolutionTree, setShowEvolutionTree] = useState(false);
  const [selectedServantForInteraction, setSelectedServantForInteraction] = useState(null);
  const [showTemptation, setShowTemptation] = useState(false);
  const [showOnlyFangs, setShowOnlyFangs] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showAllFriends, setShowAllFriends] = useState(false);

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  // Redirect to Home if no vampire state exists - do this immediately
  useEffect(() => {
    if (vampireStates.length === 0) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [vampireStates, navigate]);
  
  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });
  
  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: () => base44.entities.NightLog.list()
  });

  const { data: allFriends = [] } = useQuery({
    queryKey: ['allFriends'],
    queryFn: () => base44.entities.PotentialServant.list()
  });

  const { data: powerProgress = [] } = useQuery({
    queryKey: ['powerProgress'],
    queryFn: () => base44.entities.PowerProgress.list()
  });
  
  // Don't render anything if no vampire state
  if (vampireStates.length === 0) {
    return null;
  }

  const vampireState = vampireStates[0];
  
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
            <h1 className="text-4xl font-bold text-white mb-2">Your House</h1>
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
              <Moon className="w-6 h-6 text-purple-400 mb-2" />
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
          
          {/* Vampire Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <button
              onClick={async () => {
                if (vampireState.id) {
                  const newMode = vampireState.emotional_mode === 'feeling' ? 'ruthless' : 'feeling';
                  await base44.entities.VampireState.update(vampireState.id, {
                    emotional_mode: newMode
                  });
                  queryClient.invalidateQueries(['vampireState']);
                }
              }}
              className={`w-full rounded-2xl p-6 transition-all border-2 ${
                vampireState.emotional_mode === 'ruthless'
                  ? 'bg-red-950/40 border-red-500/50 hover:bg-red-950/60'
                  : 'bg-purple-950/40 border-purple-500/50 hover:bg-purple-950/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: vampireState.emotional_mode === 'ruthless' ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 1, repeat: vampireState.emotional_mode === 'ruthless' ? Infinity : 0 }}
                    className="text-4xl"
                  >
                    {vampireState.emotional_mode === 'ruthless' ? '🩸' : '🌙'}
                  </motion.div>
                  <div className="text-left">
                    <h3 className={`text-xl font-bold mb-1 ${
                      vampireState.emotional_mode === 'ruthless' ? 'text-red-400' : 'text-purple-400'
                    }`}>
                      {vampireState.emotional_mode === 'ruthless' ? 'RIPPER MODE' : 'Controlled'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {vampireState.emotional_mode === 'ruthless' 
                        ? 'Out of control. Hunger unleashed. No mercy.' 
                        : 'Emotions intact. Humanity preserved. Click to let go.'}
                    </p>
                  </div>
                </div>
                <div className={`text-xs uppercase font-bold px-4 py-2 rounded-lg ${
                  vampireState.emotional_mode === 'ruthless'
                    ? 'bg-red-500 text-white'
                    : 'bg-purple-500 text-white'
                }`}>
                  {vampireState.emotional_mode === 'ruthless' ? 'ACTIVE' : 'Toggle'}
                </div>
              </div>
            </button>
          </motion.div>
          
          {/* OnlyFangs Management */}
          {servants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <button
                onClick={() => setShowOnlyFangs(true)}
                className="w-full bg-gradient-to-r from-pink-950/40 to-red-950/40 hover:from-pink-950/60 hover:to-red-950/60 border-2 border-pink-500/50 rounded-2xl p-6 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">❤️</div>
                    <div className="text-left">
                      <h3 className="text-white text-xl font-bold mb-1">OnlyFangs</h3>
                      <p className="text-gray-300 text-sm">Create content. Livestream. Build your empire.</p>
                    </div>
                  </div>
                </div>
              </button>
              </motion.div>
              )}

              {/* Friends System */}
              {allFriends.length > 0 && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mb-8"
              >
              <button
                onClick={() => setShowAllFriends(true)}
                className="w-full bg-gradient-to-r from-blue-950/40 to-cyan-950/40 hover:from-blue-950/60 hover:to-cyan-950/60 border-2 border-blue-500/50 rounded-2xl p-6 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Users className="w-10 h-10 text-blue-400" />
                    <div className="text-left">
                      <h3 className="text-white text-xl font-bold mb-1">Friends of Your Servants</h3>
                      <p className="text-gray-300 text-sm">Curious souls. Potential recruits.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 text-2xl font-bold">{allFriends.length}</p>
                    <p className="text-gray-400 text-xs">People</p>
                  </div>
                </div>
              </button>
              </motion.div>
              )}

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
          
          {/* Room sections - Interactive */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Main chamber */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleMeditate}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left"
            >
              <div className="text-6xl mb-4">🕯️</div>
              <h3 className="text-white text-xl font-bold mb-2">Main Chamber</h3>
              <p className="text-gray-400 text-sm">
                Velvet curtains drawn. Candles cast long shadows. Click to meditate.
              </p>
            </motion.button>

            {/* Library */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleReadLore}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left"
            >
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-white text-xl font-bold mb-2">Library</h3>
              <p className="text-gray-400 text-sm">
                Books older than memory. Click to read ancient texts.
              </p>
            </motion.button>

            {/* Windows */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setActiveAction('view')}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left"
            >
              <div className="text-6xl mb-4">🌙</div>
              <h3 className="text-white text-xl font-bold mb-2">The View</h3>
              <p className="text-gray-400 text-sm">
                Floor to ceiling windows. Click to observe the city.
              </p>
            </motion.button>

            {/* Resting place */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setActiveAction('rest')}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left"
            >
              <div className="text-6xl mb-4">🛏️</div>
              <h3 className="text-white text-xl font-bold mb-2">Resting Place</h3>
              <p className="text-gray-400 text-sm">
                Where dawn finds you. Click to rest.
              </p>
            </motion.button>
          </div>
          
          {/* Progress & Relationships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Morality Display */}
            <MoralityDisplay vampireState={vampireState} />
            
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
                  <div key={servant.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-sm">{servant.name}</span>
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
                    <button
                      onClick={() => setSelectedServantForInteraction(servant)}
                      className="w-full bg-pink-950/30 hover:bg-pink-950/50 border border-pink-800/30 rounded-lg py-1.5 text-xs text-pink-300 transition-colors"
                    >
                      Interact
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Unlocked Powers Display with Levels */}
          {vampireState.unlocked_powers?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30"
            >
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Vampire Powers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vampireState.unlocked_powers.map((power, i) => {
                  const progress = powerProgress.find(p => p.power_name === power);
                  const level = progress?.upgrade_level || 1;
                  const mastery = progress?.mastery || 0;
                  const timesUsed = progress?.times_used || 0;

                  return (
                    <div
                      key={i}
                      className="bg-purple-950/20 border border-purple-800/30 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-300 font-medium text-sm">{power}</span>
                        <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                          Lvl {level}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Mastery</span>
                          <span>{mastery}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            style={{ width: `${mastery}%` }}
                            className="h-1.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used {timesUsed} times</p>
                      </div>
                    </div>
                  );
                })}
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
        {showOnlyFangs && servants.length > 0 && (
          <OnlyFangsManagement
            servant={servants[0]}
            vampireState={vampireState}
            onClose={() => setShowOnlyFangs(false)}
          />
        )}
        {selectedFriend && (
          <FriendInteraction
            friend={selectedFriend}
            servant={servants.find(s => s.id === selectedFriend.met_through_servant_id)}
            vampireState={vampireState}
            onClose={() => setSelectedFriend(null)}
          />
        )}
        {showAllFriends && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowAllFriends(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <button
                onClick={() => setShowAllFriends(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-4">Friends</h2>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {allFriends.map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => {
                      setShowAllFriends(false);
                      setSelectedFriend(friend);
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-medium">{friend.name}</h3>
                        <p className="text-gray-400 text-xs capitalize">{friend.personality}</p>
                      </div>
                      {friend.knows_about_vampires && (
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                          Knows
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 text-xs">
                      <span className="text-blue-400">Curiosity: {friend.curiosity_level}</span>
                      <span className="text-purple-400">Friendship: {friend.friendship_level}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
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

        {activeAction === 'view' && (
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
              <h2 className="text-2xl font-bold text-white mb-4">The City Below</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>You stand at the window. The city sprawls beneath you, a tapestry of light and shadow.</p>
                <p>Each light is a life. A heartbeat. A potential meal.</p>
                <p>They move through their nights, unaware. You watch. You wait.</p>
                <p className="text-purple-400 italic">The city is yours. They just don't know it yet.</p>
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

        {activeAction === 'rest' && (
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
              <h2 className="text-2xl font-bold text-white mb-4">Rest</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>You lie down. The darkness is complete. Comforting.</p>
                <p>No dreams. Only the void between this night and the next.</p>
                <p>When you wake, the hunger will return. It always does.</p>
                <p className="text-purple-400 italic">But for now, peace. Absolute stillness.</p>
              </div>
              <button
                onClick={() => setActiveAction(null)}
                className="mt-6 w-full bitlife-btn py-3 rounded-xl"
              >
                Rise
              </button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}