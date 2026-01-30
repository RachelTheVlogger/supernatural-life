import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
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
import DateOutingModal from '@/components/nightbound/DateOutingModal';
import ServantJealousyEvent from '@/components/nightbound/ServantJealousyEvent';
import CrimsonBlissLab from '@/components/nightbound/CrimsonBlissLab';
import ServantIdentityRevelation from '@/components/nightbound/ServantIdentityRevelation';
import FoodSystem from '@/components/nightbound/FoodSystem';
import WitchEncounter from '@/components/nightbound/WitchEncounter';
import CovenManagement from '@/components/nightbound/CovenManagement';
import DayCycleToggle from '@/components/nightbound/DayCycleToggle';
import DaylightRingCrafting from '@/components/nightbound/DaylightRingCrafting';
import VampireClubScene from '@/components/nightbound/VampireClubScene';
import ArtifactCollection from '@/components/nightbound/ArtifactCollection';
import ServantFamilySystem from '@/components/nightbound/ServantFamilySystem';
import BloodBondSystem from '@/components/nightbound/BloodBondSystem';
import VampirePolitics from '@/components/nightbound/VampirePolitics';
import VampireAgingSystem from '@/components/nightbound/VampireAgingSystem';
import SuccubusVampireInteraction from '@/components/nightbound/SuccubusVampireInteraction';
import DonorSystem from '@/components/nightbound/DonorSystem';
import StalkingSystem from '@/components/nightbound/StalkingSystem';
import JournalSystem from '@/components/nightbound/JournalSystem';
import DoppelgangerSystem from '@/components/nightbound/DoppelgangerSystem';
import PersonalitySelector from '@/components/nightbound/PersonalitySelector';
import VampireSnakeFamiliar from '@/components/nightbound/VampireSnakeFamiliar';
import VampireHunterInteraction from '@/components/nightbound/VampireHunterInteraction';
import VictimTrophies from '@/components/nightbound/VictimTrophies';

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
  const [dateServant, setDateServant] = useState(null);
  const [jealousyEvent, setJealousyEvent] = useState(null);
  const [showCrimsonBliss, setShowCrimsonBliss] = useState(false);
  const [identityRevelation, setIdentityRevelation] = useState(null);
  const [showVampireIdentity, setShowVampireIdentity] = useState(false);
  const [showFoodSystem, setShowFoodSystem] = useState(false);
  const [showWitchEncounter, setShowWitchEncounter] = useState(false);
  const [showCovenManagement, setShowCovenManagement] = useState(false);
  const [showDaylightRings, setShowDaylightRings] = useState(false);
  const [showClubs, setShowClubs] = useState(false);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showBloodBonds, setShowBloodBonds] = useState(false);
  const [showPolitics, setShowPolitics] = useState(false);
  const [showAging, setShowAging] = useState(false);
  const [showSuccubusInteraction, setShowSuccubusInteraction] = useState(false);
  const [showVampireSelector, setShowVampireSelector] = useState(false);
  const [showDonors, setShowDonors] = useState(false);
  const [showStalking, setShowStalking] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showDoppelgangers, setShowDoppelgangers] = useState(false);
  const [showSnakeFamiliar, setShowSnakeFamiliar] = useState(false);
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [showTrophies, setShowTrophies] = useState(false);

  const { data: vampireStates = [], isLoading: vampireLoading } = useQuery({
    queryKey: ['vampireState'],
    queryFn: async () => {
      try {
        return await base44.entities.VampireState.list();
      } catch (e) {
        console.error('Failed to fetch vampire state:', e);
        return [];
      }
    },
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0
  });
  
  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: async () => {
      try {
        return await base44.entities.Servant.list();
      } catch (e) {
        console.error('Failed to fetch servants:', e);
        return [];
      }
    }
  });
  
  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      try {
        return await base44.entities.NightLog.list();
      } catch (e) {
        console.error('Failed to fetch logs:', e);
        return [];
      }
    }
  });

  const { data: allFriends = [] } = useQuery({
    queryKey: ['allFriends'],
    queryFn: async () => {
      try {
        const friends = await base44.entities.PotentialServant.list();
        // Filter out friends whose servant no longer exists
        const validServantIds = servants.map(s => s.id);
        return friends.filter(f => validServantIds.includes(f.met_through_servant_id));
      } catch (e) {
        console.error('Failed to fetch friends:', e);
        return [];
      }
    },
    enabled: servants.length > 0
  });

  const { data: powerProgress = [] } = useQuery({
    queryKey: ['powerProgress'],
    queryFn: async () => {
      try {
        return await base44.entities.PowerProgress.list();
      } catch (e) {
        console.error('Failed to fetch power progress:', e);
        return [];
      }
    }
  });

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: async () => {
      try {
        return await base44.entities.Witch.list();
      } catch (e) {
        console.error('Failed to fetch witches:', e);
        return [];
      }
    }
  });



  const { data: succubi = [] } = useQuery({
    queryKey: ['succubi'],
    queryFn: async () => {
      try {
        return await base44.entities.Succubus.list();
      } catch (e) {
        console.error('Failed to fetch succubi:', e);
        return [];
      }
    }
  });

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: async () => {
      try {
        return await base44.entities.Hunter.list();
      } catch (e) {
        console.error('Failed to fetch hunters:', e);
        return [];
      }
    }
  });

  const vampireState = React.useMemo(() => 
    vampireStates.length > 0 ? vampireStates[0] : null, 
    [vampireStates]
  );

  const succubus = succubi[0];
  
  const handleMeditate = React.useCallback(async () => {
    if (!vampireState?.id) return;
    setMeditating(true);
    setTimeout(async () => {
      try {
        await base44.entities.NightLog.create({
          entry: 'You meditated in silence. The hunger quieted, if only for a moment.',
          category: 'observation',
          intensity: 'subtle'
        });
        
        if (vampireState.hunger_state !== 'sated') {
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
      } catch (e) {
        console.error('Failed to meditate:', e);
      } finally {
        setMeditating(false);
        setActiveAction(null);
      }
    }, 3000);
  }, [vampireState, queryClient]);
  
  const handleReadLore = React.useCallback(() => {
    setActiveAction('lore');
  }, []);
  
  const handlePracticePower = React.useCallback(async () => {
    if (!vampireState?.id) return;
    setActiveAction('practice');
    setTimeout(async () => {
      try {
        await base44.entities.NightLog.create({
          entry: 'You practiced your abilities in solitude. Control sharpens with repetition.',
          category: 'power',
          intensity: 'moderate'
        });
        queryClient.invalidateQueries(['logs']);
      } catch (e) {
        console.error('Failed to practice:', e);
      } finally {
        setActiveAction(null);
      }
    }, 2500);
  }, [vampireState, queryClient]);

  // Check for jealousy events (only for servants who can be jealous)
  useEffect(() => {
    if (vampireState && servants.length >= 2) {
      const jealousServants = servants.filter(s => !['open', 'no-strings'].includes(s.boundaries));
      const highJealousy = jealousServants.filter(s => (s.jealousy_level || 0) > 60);
      if (highJealousy.length >= 2 && !jealousyEvent && Math.random() > 0.7) {
        setJealousyEvent({ s1: highJealousy[0], s2: highJealousy[1] });
      }
    }
  }, [servants, jealousyEvent, vampireState]);

  // Check for identity revelation events
  useEffect(() => {
    if (vampireState && servants.length > 0) {
      const needsRevelation = servants.filter(s => !s.identity_revealed && (s.relationship || 0) > 30);
      if (needsRevelation.length > 0 && !identityRevelation && Math.random() > 0.6) {
        setIdentityRevelation(needsRevelation[0]);
      }
    }
  }, [servants, identityRevelation, vampireState]);

  // Don't render if still loading or no vampire
  if (vampireLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!vampireState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No vampire found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Create Vampire
          </button>
        </div>
      </div>
    );
  }
  
  const turnedServants = servants.filter(s => s.is_turned);
  const totalRelationship = servants.reduce((sum, s) => sum + (s.relationship || 0), 0);
  const avgRelationship = servants.length > 0 ? Math.round(totalRelationship / servants.length) : 0;
  const isDaytime = vampireState?.time_of_day === 'day';

  return (
    <div 
      key={`vampire-home-${vampireState?.time_of_day}`}
      className="min-h-screen relative overflow-x-hidden"
         style={{ 
           background: isDaytime 
             ? 'linear-gradient(to bottom, #FFB347 0%, #FFCC99 50%, #FFD4A3 100%)' 
             : 'linear-gradient(to bottom, #0a0a14 0%, #1a0a1a 50%, #0a0014 100%)' 
         }}>

      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${isDaytime ? 'bg-orange-300/40' : 'bg-purple-400/30'}`}
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
      
      <div className="relative z-10 p-6 overflow-y-auto pb-32">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(createPageUrl('Night'));
            }}
            className="text-white/60 hover:text-white transition-colors touch-manipulation p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2 items-center">
            {vampireStates.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVampireSelector(true);
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm touch-manipulation p-2"
              >
                Switch Vampire ({vampireStates.length})
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(createPageUrl('Night'));
              }}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm touch-manipulation font-medium flex items-center gap-1"
            >
              Switch to Hunter →
            </button>
            {servants.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(createPageUrl(`ServantHome?id=${servants[0].id}`));
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm touch-manipulation p-2"
              >
                Switch to Servant →
              </button>
            )}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className={`text-4xl font-bold mb-2 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>
              {vampireState.vampire_name}
            </h1>
            {vampireStates.length < 3 && (
              <button
                onClick={() => navigate(createPageUrl('Home'))}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                + Create Another Vampire
              </button>
            )}
          </motion.div>
          
          {/* Day/Night Cycle Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <DayCycleToggle vampireState={vampireState} />
          </motion.div>

          {/* Vampire Identity Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mb-6"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVampireIdentity(true);
              }}
              className="w-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border-2 border-purple-500/50 rounded-xl p-4 transition-all touch-manipulation"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-white font-medium">Your Identity</h3>
                  <p className="text-gray-400 text-sm capitalize">
                    {vampireState.gender === 'female' ? 'woman' : vampireState.gender === 'male' ? 'man' : vampireState.gender} • {vampireState.sexuality}
                  </p>
                </div>
                <Heart className="w-5 h-5 text-purple-400" />
              </div>
            </button>
          </motion.div>

          {/* Quick Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <div className={`${isDaytime ? 'bg-white/70' : 'bg-black/40'} backdrop-blur-sm rounded-xl p-4 border ${isDaytime ? 'border-orange-300/50' : 'border-purple-900/30'}`}>
              <Moon className="w-6 h-6 text-purple-400 mb-2" />
              <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{vampireState.humanity || 50}</p>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Humanity</p>
              </div>

              <div className={`${isDaytime ? 'bg-white/70' : 'bg-black/40'} backdrop-blur-sm rounded-xl p-4 border ${isDaytime ? 'border-orange-300/50' : 'border-purple-900/30'}`}>
              <Heart className="w-6 h-6 text-red-400 mb-2" />
              <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{servants.length}</p>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Servants</p>
              </div>

              <div className={`${isDaytime ? 'bg-white/70' : 'bg-black/40'} backdrop-blur-sm rounded-xl p-4 border ${isDaytime ? 'border-orange-300/50' : 'border-purple-900/30'}`}>
              <Zap className="w-6 h-6 text-yellow-400 mb-2" />
              <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{vampireState.unlocked_powers?.length || 0}</p>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Powers Unlocked</p>
              </div>

              <div className={`${isDaytime ? 'bg-white/70' : 'bg-black/40'} backdrop-blur-sm rounded-xl p-4 border ${isDaytime ? 'border-orange-300/50' : 'border-purple-900/30'}`}>
              <Eye className="w-6 h-6 text-blue-400 mb-2" />
              <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{logs.length}</p>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Events Witnessed</p>
              </div>
          </motion.div>
          
          {/* Vampire Progression Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-purple-950/60 to-red-950/60 border-2 border-purple-500/50 rounded-2xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">Your Vampire Progression</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-purple-300 text-xs mb-1">Stage</p>
                  <p className="text-white font-bold">
                    {(vampireState.vampire_stage || 1) === 1 ? '🩸 Newborn' : 
                     (vampireState.vampire_stage || 1) === 2 ? '🌙 Fledgling' : 
                     (vampireState.vampire_stage || 1) === 3 ? '⚡ Established' : '👑 Elder'}
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-purple-300 text-xs mb-1">Power Level</p>
                  <p className="text-white font-bold">{vampireState.vampire_power_level || 0}/100</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  style={{ width: `${vampireState.vampire_power_level || 0}%` }}
                  className="h-2 bg-gradient-to-r from-purple-600 to-red-500 rounded-full"
                />
              </div>
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
              onClick={(e) => {
                e.stopPropagation();
                setShowEvolutionTree(true);
              }}
              className="w-full bg-gradient-to-r from-purple-900/40 to-red-900/40 hover:from-purple-900/60 hover:to-red-900/60 border-2 border-purple-500/50 rounded-2xl p-6 transition-all touch-manipulation"
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
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  if (vampireState.id) {
                    const newMode = vampireState.emotional_mode === 'feeling' ? 'ruthless' : 'feeling';
                    await base44.entities.VampireState.update(vampireState.id, {
                      emotional_mode: newMode
                    });
                    queryClient.invalidateQueries(['vampireState']);
                  }
                } catch (e) {
                  console.error('Failed to toggle mode:', e);
                }
              }}
              className={`w-full rounded-2xl p-6 transition-all border-2 touch-manipulation ${
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
          {vampireState.content_filter !== 'lite' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOnlyFangs(true);
              }}
              className="w-full bg-gradient-to-r from-pink-950/40 to-red-950/40 hover:from-pink-950/60 hover:to-red-950/60 border-2 border-pink-500/50 rounded-2xl p-6 transition-all touch-manipulation"
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

              {/* Crimson Bliss Lab */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.21 }}
                className="mb-8"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCrimsonBliss(true);
                  }}
                  className="w-full bg-gradient-to-r from-red-950/40 to-purple-950/40 hover:from-red-950/60 hover:to-purple-950/60 border-2 border-red-500/50 rounded-2xl p-6 transition-all touch-manipulation"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🧪</div>
                      <div className="text-left">
                        <h3 className="text-white text-xl font-bold mb-1">Crimson Bliss Lab</h3>
                        <p className="text-gray-300 text-sm">Blood drugs. Addictive. Trippy. Profitable.</p>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* Food System */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="mb-8"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFoodSystem(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-950/40 to-emerald-950/40 hover:from-green-950/60 hover:to-emerald-950/60 border-2 border-green-500/50 rounded-2xl p-6 transition-all touch-manipulation"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🍽️</div>
                      <div className="text-left">
                        <h3 className="text-white text-xl font-bold mb-1">Food & Meals</h3>
                        <p className="text-gray-300 text-sm">Cook together. Share meals. Vampires can eat too.</p>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* Donor System */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.225 }}
                className="mb-8"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDonors(true);
                  }}
                  className="w-full bg-gradient-to-r from-red-950/40 to-rose-950/40 hover:from-red-950/60 hover:to-rose-950/60 border-2 border-red-500/50 rounded-2xl p-6 transition-all touch-manipulation"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🩸</div>
                      <div className="text-left">
                        <h3 className="text-white text-xl font-bold mb-1">Donors</h3>
                        <p className="text-gray-300 text-sm">Humans who willingly feed you. Consensual arrangements.</p>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* Stalking System */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.23 }}
                className="mb-8"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStalking(true);
                  }}
                  className="w-full bg-gradient-to-r from-purple-950/40 to-pink-950/40 hover:from-purple-950/60 hover:to-pink-950/60 border-2 border-purple-500/50 rounded-2xl p-6 transition-all touch-manipulation"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">💕</div>
                      <div className="text-left">
                        <h3 className="text-white text-xl font-bold mb-1">Mutual Obsession</h3>
                        <p className="text-gray-300 text-sm">Humans who crave your attention. They want to be watched.</p>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* Journal System */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="mb-8"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowJournal(true);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-950/40 to-purple-950/40 hover:from-indigo-950/60 hover:to-purple-950/60 border-2 border-indigo-500/50 rounded-2xl p-6 transition-all touch-manipulation"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">📖</div>
                      <div className="text-left">
                        <h3 className="text-white text-xl font-bold mb-1">Journal</h3>
                        <p className="text-gray-300 text-sm">Chronicle your eternal nights. AI-powered reflections.</p>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* Doppelgängers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-8"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDoppelgangers(true);
                  }}
                  className="w-full bg-gradient-to-r from-gray-950/40 to-purple-950/40 hover:from-gray-950/60 hover:to-purple-950/60 border-2 border-gray-500/50 rounded-2xl p-6 transition-all touch-manipulation"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">👥</div>
                      <div className="text-left">
                        <h3 className="text-white text-xl font-bold mb-1">Doppelgängers</h3>
                        <p className="text-gray-300 text-sm">Find supernatural doubles. Their blood is ancient power.</p>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>



              {/* Friends System */}
              {allFriends.length > 0 && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mb-8"
              >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllFriends(true);
                }}
                className="w-full bg-gradient-to-r from-blue-950/40 to-cyan-950/40 hover:from-blue-950/60 hover:to-cyan-950/60 border-2 border-blue-500/50 rounded-2xl p-6 transition-all touch-manipulation"
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
              onClick={(e) => {
                e.stopPropagation();
                setShowTemptation(true);
              }}
              className="w-full bg-gradient-to-r from-red-950/40 to-purple-950/40 hover:from-red-950/60 hover:to-purple-950/60 border-2 border-red-500/50 rounded-2xl p-6 transition-all touch-manipulation"
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
          
          {/* Supernatural & Systems Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3"
          >
            <button onClick={() => setShowWitchEncounter(true)} className={`${isDaytime ? 'bg-orange-100/60 border-orange-400/40' : 'bg-purple-900/40 border-purple-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>✨ Encounter Witch</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Meet powerful witches</p>
            </button>

            <button onClick={() => setShowSnakeFamiliar(true)} className={`${isDaytime ? 'bg-emerald-100/60 border-emerald-400/40' : 'bg-green-900/40 border-green-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>🐍 Snake Familiar</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Vampire serpent spy</p>
            </button>



            <button onClick={() => setShowCovenManagement(true)} className={`${isDaytime ? 'bg-orange-100/60 border-orange-400/40' : 'bg-purple-900/40 border-purple-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>🦇 Coven</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Your vampire family</p>
            </button>

            <button onClick={() => setShowDaylightRings(true)} className={`${isDaytime ? 'bg-amber-100/60 border-amber-400/40' : 'bg-yellow-900/40 border-yellow-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>☀️ Daylight Rings</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Walk in sunlight</p>
            </button>

            <button onClick={() => setShowClubs(true)} className={`${isDaytime ? 'bg-orange-100/60 border-orange-400/40' : 'bg-pink-900/40 border-pink-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>🍷 Vampire Clubs</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Underground nightlife</p>
            </button>

            <button onClick={() => setShowArtifacts(true)} className={`${isDaytime ? 'bg-orange-100/60 border-orange-400/40' : 'bg-red-900/40 border-red-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>⚡ Artifacts</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Cursed objects</p>
            </button>

            <button onClick={() => setShowBloodBonds(true)} className={`${isDaytime ? 'bg-orange-100/60 border-orange-400/40' : 'bg-red-900/40 border-red-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>🩸 Blood Bonds</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Sire lines</p>
            </button>

            <button onClick={() => setShowPolitics(true)} className={`${isDaytime ? 'bg-orange-100/60 border-orange-400/40' : 'bg-purple-900/40 border-purple-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>👑 Politics</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Elections & power</p>
            </button>

            <button onClick={() => setShowAging(true)} className={`${isDaytime ? 'bg-orange-50/60 border-orange-300/40' : 'bg-gray-900/40 border-gray-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>⏳ Age Forward</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Pass decades/centuries</p>
            </button>

            {hunters.length > 0 && (
              <button onClick={() => setSelectedHunter(hunters[0])} className={`${isDaytime ? 'bg-red-100/60 border-red-400/40' : 'bg-red-900/40 border-red-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
                <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>🎯 Confront Hunter</h3>
                <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Engage your pursuer</p>
              </button>
            )}

            <button onClick={() => setShowTrophies(true)} className={`${isDaytime ? 'bg-red-100/60 border-red-400/40' : 'bg-red-900/40 border-red-500/30'} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
              <h3 className={`font-medium mb-1 ${isDaytime ? 'text-gray-800' : 'text-white'}`}>💀 Trophy Collection</h3>
              <p className={`text-xs ${isDaytime ? 'text-gray-600' : 'text-gray-400'}`}>Victims' possessions</p>
            </button>

            </motion.div>

          {/* Room sections - Interactive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-h-[60vh] overflow-y-auto">
            {/* Main chamber */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleMeditate();
              }}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left touch-manipulation"
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
              onClick={(e) => {
                e.stopPropagation();
                handleReadLore();
              }}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left touch-manipulation"
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
              onClick={(e) => {
                e.stopPropagation();
                setActiveAction('view');
              }}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left touch-manipulation"
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
              onClick={(e) => {
                e.stopPropagation();
                setActiveAction('rest');
              }}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30 transition-all text-left touch-manipulation"
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
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
                {servants.filter(s => s && s.id).slice(0, 2).map(servant => (
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
                    <div className="flex gap-1">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedServantForInteraction(servant);
                       }}
                       className="flex-1 bg-pink-950/30 hover:bg-pink-950/50 border border-pink-800/30 rounded-lg py-1.5 text-xs text-pink-300 transition-colors touch-manipulation"
                     >
                       Interact
                     </button>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setDateServant(servant);
                       }}
                       className="flex-1 bg-purple-950/30 hover:bg-purple-950/50 border border-purple-800/30 rounded-lg py-1.5 text-xs text-purple-300 transition-colors touch-manipulation"
                     >
                       Date
                     </button>
                    </div>
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
        {showEvolutionTree && vampireState && (
          <EvolutionTree
            vampireState={vampireState}
            servants={servants}
            onClose={() => setShowEvolutionTree(false)}
          />
        )}
        {selectedServantForInteraction && vampireState && (
          <DirectInteraction
            servant={selectedServantForInteraction}
            vampireState={vampireState}
            onClose={() => setSelectedServantForInteraction(null)}
          />
        )}
        {showTemptation && vampireState && (
          <TemptationModal
            vampireState={vampireState}
            servants={servants}
            onClose={() => setShowTemptation(false)}
          />
        )}
        {showOnlyFangs && vampireState && (
          <OnlyFangsManagement
            servant={{ id: vampireState.id, name: vampireState.vampire_name }}
            vampireState={vampireState}
            onClose={() => setShowOnlyFangs(false)}
          />
        )}
        {selectedFriend && vampireState && servants.length > 0 && (() => {
          const matchingServant = servants.find(s => s.id === selectedFriend.met_through_servant_id);
          if (!matchingServant) {
            // Clean up invalid friend reference
            base44.entities.PotentialServant.delete(selectedFriend.id).catch(() => {});
            setSelectedFriend(null);
            return null;
          }
          return (
            <FriendInteraction
              friend={selectedFriend}
              servant={matchingServant}
              vampireState={vampireState}
              onClose={() => setSelectedFriend(null)}
            />
          );
        })()}
        {dateServant && vampireState && (
          <DateOutingModal
            servant={dateServant}
            vampireState={vampireState}
            onClose={() => setDateServant(null)}
          />
        )}
        {jealousyEvent && (
          <ServantJealousyEvent
            servant1={jealousyEvent.s1}
            servant2={jealousyEvent.s2}
            onClose={() => setJealousyEvent(null)}
          />
        )}
        {showCrimsonBliss && vampireState && (
          <CrimsonBlissLab
            vampireState={vampireState}
            servants={servants}
            onClose={() => setShowCrimsonBliss(false)}
          />
        )}
        {showFoodSystem && vampireState && (
          <FoodSystem
            vampireState={vampireState}
            servants={servants}
            onClose={() => setShowFoodSystem(false)}
          />
        )}
        {identityRevelation && vampireState && (
          <ServantIdentityRevelation
            servant={identityRevelation}
            vampireState={vampireState}
            onClose={() => setIdentityRevelation(null)}
          />
        )}
        {showWitchEncounter && vampireState && (
          <WitchEncounter vampireState={vampireState} onClose={() => setShowWitchEncounter(false)} />
        )}
        {showCovenManagement && vampireState && (
          <CovenManagement vampireState={vampireState} servants={servants} onClose={() => setShowCovenManagement(false)} />
        )}
        {showDaylightRings && vampireState && (
          <DaylightRingCrafting vampireState={vampireState} witches={witches} onClose={() => setShowDaylightRings(false)} />
        )}
        {showClubs && vampireState && (
          <VampireClubScene vampireState={vampireState} onClose={() => setShowClubs(false)} />
        )}
        {showArtifacts && vampireState && (
          <ArtifactCollection vampireState={vampireState} onClose={() => setShowArtifacts(false)} />
        )}
        {showFamily && vampireState && servants.length > 0 && (
          <ServantFamilySystem servant={servants[0]} vampireState={vampireState} onClose={() => setShowFamily(false)} />
        )}
        {showBloodBonds && vampireState && (
          <BloodBondSystem vampireState={vampireState} servants={servants} onClose={() => setShowBloodBonds(false)} />
        )}
        {showPolitics && vampireState && (
          <VampirePolitics vampireState={vampireState} onClose={() => setShowPolitics(false)} />
        )}
        {showAging && vampireState && (
          <VampireAgingSystem vampireState={vampireState} onClose={() => setShowAging(false)} />
        )}
        {showSuccubusInteraction && succubus && (
          <SuccubusVampireInteraction
            succubus={succubus}
            vampire={vampireState}
            onClose={() => setShowSuccubusInteraction(false)}
          />
        )}
        {showDonors && vampireState && (
          <DonorSystem
            vampireState={vampireState}
            onClose={() => setShowDonors(false)}
          />
        )}
        {showStalking && vampireState && (
          <StalkingSystem
            vampireState={vampireState}
            onClose={() => setShowStalking(false)}
          />
        )}
        {showJournal && vampireState && (
          <JournalSystem
            vampire={vampireState}
            onClose={() => setShowJournal(false)}
          />
        )}
        {showDoppelgangers && vampireState && (
          <DoppelgangerSystem
            vampireState={vampireState}
            onClose={() => setShowDoppelgangers(false)}
          />
        )}
        {showSnakeFamiliar && vampireState && (
          <VampireSnakeFamiliar
            vampireState={vampireState}
            onClose={() => setShowSnakeFamiliar(false)}
          />
        )}
        {selectedHunter && vampireState && (
          <VampireHunterInteraction
            vampire={vampireState}
            hunter={selectedHunter}
            onClose={() => setSelectedHunter(null)}
          />
        )}
        {showTrophies && vampireState && (
          <VictimTrophies
            vampireState={vampireState}
            onClose={() => setShowTrophies(false)}
          />
        )}
        {showVampireIdentity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowVampireIdentity(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVampireIdentity(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-2">Your Identity</h2>
              <p className="text-gray-400 text-sm mb-4">Who you are, who you've always been</p>

              <div className="space-y-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Name</label>
                  <input
                    type="text"
                    defaultValue={vampireState.vampire_name}
                    onBlur={async (e) => {
                      const newName = e.target.value.trim();
                      if (newName && newName !== vampireState.vampire_name) {
                        try {
                          await base44.entities.VampireState.update(vampireState.id, { vampire_name: newName });
                          queryClient.invalidateQueries(['vampireState']);
                        } catch (e) {
                          console.error('Failed to update name:', e);
                        }
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Your vampire name..."
                  />
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Gender</label>
                  <div className="space-y-2">
                    {[
                      { value: 'man', label: 'Man', pronouns: 'He/Him' },
                      { value: 'woman', label: 'Woman', pronouns: 'She/Her' },
                      { value: 'custom', label: 'Custom', pronouns: 'They/Them' }
                    ].map(g => (
                      <button
                        key={g.value}
                        onClick={async () => {
                          try {
                            await base44.entities.VampireState.update(vampireState.id, { gender: g.value });
                            queryClient.invalidateQueries();
                          } catch (e) {
                            console.error('Failed to update gender:', e);
                          }
                        }}
                        className={`w-full rounded-lg py-3 px-4 text-left transition-colors ${
                          vampireState.gender === g.value 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="font-medium">{g.label}</span>
                        <p className="text-sm opacity-80">{g.pronouns}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Sexuality</label>
                  <div className="space-y-2">
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
                        onClick={async () => {
                          try {
                            await base44.entities.VampireState.update(vampireState.id, { sexuality: option.value });
                            queryClient.invalidateQueries();
                          } catch (e) {
                            console.error('Failed to update sexuality:', e);
                          }
                        }}
                        className={`w-full rounded-lg py-2 px-3 text-left transition-colors text-sm ${
                          vampireState.sexuality === option.value 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        <p className="text-xs opacity-70">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <PersonalitySelector
                    selected={Array.isArray(vampireState.personality) ? vampireState.personality : (vampireState.personality ? [vampireState.personality] : ['charming'])}
                    onSelect={async (personality) => {
                      try {
                        await base44.entities.VampireState.update(vampireState.id, { personality });
                        queryClient.invalidateQueries();
                      } catch (e) {
                        console.error('Failed to update personality:', e);
                      }
                    }}
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVampireIdentity(false);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors mt-4 touch-manipulation"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
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
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowAllFriends(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-4">Friends</h2>

              {allFriends.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No friends discovered yet. Your servants will introduce you to people over time.
                </p>
              ) : (
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
                )}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAction(null);
                }}
                className="mt-6 w-full bitlife-btn py-3 rounded-xl touch-manipulation"
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
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAction(null);
                }}
                className="mt-6 w-full bitlife-btn py-3 rounded-xl touch-manipulation"
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
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAction(null);
                }}
                className="mt-6 w-full bitlife-btn py-3 rounded-xl touch-manipulation"
              >
                Rise
              </button>
            </motion.div>
          </motion.div>
        )}
        {showVampireSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowVampireSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowVampireSelector(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-4">Your Vampires</h2>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {vampireStates.map(vamp => (
                  <div
                    key={vamp.id}
                    className={`w-full rounded-xl p-4 transition-all ${
                      vamp.id === vampireState?.id
                        ? 'bg-purple-600 border-2 border-purple-400'
                        : 'bg-gray-800'
                    }`}
                  >
                    <button
                      onClick={async () => {
                        if (vamp.id !== vampireState?.id) {
                          queryClient.setQueryData(['vampireState'], [vamp]);
                          setShowVampireSelector(false);
                        }
                      }}
                      className="w-full text-left"
                    >
                      <h3 className="text-white font-bold text-lg">{vamp.vampire_name}</h3>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-400 capitalize">{vamp.gender}</span>
                        <span className="text-gray-400 capitalize">{vamp.sexuality}</span>
                        <span className="text-purple-400">Stage {vamp.vampire_stage}</span>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-gray-400">Humanity: {vamp.humanity}</span>
                        <span className="text-gray-400">Powers: {vamp.unlocked_powers?.length || 0}</span>
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const currentVampId = vampireState?.id;
                        if (confirm(`Delete ${vamp.vampire_name}? This cannot be undone.`)) {
                          await base44.entities.VampireState.delete(vamp.id);
                          queryClient.invalidateQueries(['vampireState']);
                          if (vamp.id === currentVampId) {
                            setShowVampireSelector(false);
                            navigate(createPageUrl('Home'));
                          }
                        }
                      }}
                      className="w-full mt-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 py-2 rounded-lg transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {vampireStates.length < 3 && (
                <button
                  onClick={() => {
                    setShowVampireSelector(false);
                    navigate(createPageUrl('Home'));
                  }}
                  className="w-full mt-4 bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 text-white py-3 rounded-xl transition-colors"
                >
                  + Create New Vampire
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}