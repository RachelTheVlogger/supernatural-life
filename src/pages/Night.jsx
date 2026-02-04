import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Droplets, Users, BookOpen, Eye, Zap, Home, Moon, HelpCircle, Heart, User, Target, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import FeedingModal from '@/components/nightbound/FeedingModal';
import ServantsList from '@/components/nightbound/ServantsList';
import NightLogView from '@/components/nightbound/NightLogView';
import HuntingModal from '@/components/nightbound/HuntingModal';
import PowersModal from '@/components/nightbound/PowersModal';
import AdvanceNight from '@/components/nightbound/AdvanceNight';
import NPCInteraction from '@/components/nightbound/NPCInteraction';

import HospitalJob from '@/components/nightbound/HospitalJob';
import RivalVampireModal from '@/components/nightbound/RivalVampireModal';
import VampireCouncilModal from '@/components/nightbound/VampireCouncilModal';
import TerritoryMap from '@/components/nightbound/TerritoryMap';

import BloodTypeSystem from '@/components/nightbound/BloodTypeSystem';
import VampireWeaknessModal from '@/components/nightbound/VampireWeaknessModal';
import HunterEncounter from '@/components/nightbound/HunterEncounter';
import MilestonesDisplay from '@/components/nightbound/MilestonesDisplay';
import CovenManagement from '@/components/nightbound/CovenManagement';
import ServantInteractions from '@/components/nightbound/ServantInteractions';
import DaylightRingCrafting from '@/components/nightbound/DaylightRingCrafting';
import VampireClubScene from '@/components/nightbound/VampireClubScene';
import ArtifactCollection from '@/components/nightbound/ArtifactCollection';
import ServantFamilySystem from '@/components/nightbound/ServantFamilySystem';
import BloodBondSystem from '@/components/nightbound/BloodBondSystem';
import VampirePolitics from '@/components/nightbound/VampirePolitics';
import VampireAgingSystem from '@/components/nightbound/VampireAgingSystem';
import StalkingSystem from '@/components/nightbound/StalkingSystem';
import PossessionSystem from '@/components/nightbound/PossessionSystem';
import DoppelgangerSystem from '@/components/nightbound/DoppelgangerSystem';
import AICompanion from '@/components/nightbound/AICompanion';

import MemoryRecorder from '@/components/nightbound/MemoryRecorder';
import EmotionMonitor from '@/components/nightbound/EmotionMonitor';
import HolographicCall from '@/components/nightbound/HolographicCall';
import FuturePredictor from '@/components/nightbound/FuturePredictor';
import BloodAddiction from '@/components/nightbound/BloodAddiction';
import FeedingParty from '@/components/nightbound/FeedingParty';
import WitchLivingTogether from '@/components/nightbound/WitchLivingTogether';
import VampireSnakeFamiliar from '@/components/nightbound/VampireSnakeFamiliar';
import DreamManipulation from '@/components/nightbound/DreamManipulation';
import ThrallSystem from '@/components/nightbound/ThrallSystem';
import MemoryAlteration from '@/components/nightbound/MemoryAlteration';
import BloodVintageSystem from '@/components/nightbound/BloodVintageSystem';
import SupernaturalDating from '@/components/nightbound/SupernaturalDating';
import HunterVampirePowerTree from '@/components/nightbound/HunterVampirePowerTree';
import DLCStore from '@/components/nightbound/DLCStore';
import SoulTradingSystem from '@/components/nightbound/SoulTradingSystem';
import BlackMarketSystem from '@/components/nightbound/BlackMarketSystem';
import ProphecySystem from '@/components/nightbound/ProphecySystem';
import WorldEventsSystem from '@/components/nightbound/WorldEventsSystem';
import MemoryPalaceSystem from '@/components/nightbound/MemoryPalaceSystem';
import RitualMagicSystem from '@/components/nightbound/RitualMagicSystem';
import DreamRealmExplorer from '@/components/nightbound/DreamRealmExplorer';
import PrestigeSystem from '@/components/nightbound/PrestigeSystem';

export default function Night() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const hunterParam = urlParams.get('hunter');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedServant, setSelectedServant] = useState(null);
  const [showDaylightRings, setShowDaylightRings] = useState(false);
  const [showClubs, setShowClubs] = useState(false);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showBloodBonds, setShowBloodBonds] = useState(false);
  const [showPolitics, setShowPolitics] = useState(false);
  const [showAging, setShowAging] = useState(false);
  const [showStalking, setShowStalking] = useState(false);
  const [showPossession, setShowPossession] = useState(false);
  const [showDoppelgangers, setShowDoppelgangers] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);
  const [showHolo, setShowHolo] = useState(false);
  const [showPredictor, setShowPredictor] = useState(false);
  const [showAddiction, setShowAddiction] = useState(false);
  const [showFeedingParty, setShowFeedingParty] = useState(false);
  const [showWitchHome, setShowWitchHome] = useState(false);
  const [showSnake, setShowSnake] = useState(false);
  const [showDreams, setShowDreams] = useState(false);
  const [showThralls, setShowThralls] = useState(false);
  const [showMemoryEdit, setShowMemoryEdit] = useState(false);
  const [showVintage, setShowVintage] = useState(false);
  const [showSupernaturalDating, setShowSupernaturalDating] = useState(false);
  const [showHunterWalk, setShowHunterWalk] = useState(false);
  const [servantsInitialized, setServantsInitialized] = useState(false);
  const [showDLC, setShowDLC] = useState(false);
  const [showSoulTrading, setShowSoulTrading] = useState(false);
  const [showBlackMarket, setShowBlackMarket] = useState(false);
  const [showProphecy, setShowProphecy] = useState(false);
  const [showWorldEvents, setShowWorldEvents] = useState(false);
  const [showMemoryPalace, setShowMemoryPalace] = useState(false);
  const [showRituals, setShowRituals] = useState(false);
  const [showDreamRealm, setShowDreamRealm] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);

  // Fetch vampire state
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
    retry: 2
  });

  // Fetch servants
  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: async () => {
      try {
        return await base44.entities.Servant.list('-last_interaction');
      } catch (e) {
        console.error('Failed to fetch servants:', e);
        return [];
      }
    },
    retry: 2
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

  // Removed Hybrid entity query - entity doesn't exist

  // Fetch hunters
  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const turnedHunter = hunterParam ? hunters.find(h => h.id === hunterParam) : null;

  // Fetch recent logs
  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      try {
        return await base44.entities.NightLog.list('-created_date', 10);
      } catch (e) {
        console.error('Failed to fetch logs:', e);
        return [];
      }
    },
    retry: 1
  });

  const vampireState = vampireStates.length > 0 ? vampireStates[0] : null;
  
  // Random name generator with duplicate checking - unique pool for servants
  const generateRandomName = (existingNames = []) => {
    const names = [
      'Ash', 'River', 'Sage', 'Rowan', 'Quinn', 'Jade', 'Raven', 'Storm',
      'Blake', 'Eden', 'Gray', 'Haven', 'Indigo', 'Jules', 'Kai',
      'Morgan', 'Nova', 'Onyx', 'Phoenix', 'Rain', 'Shadow', 'Sky', 'Wren',
      'Ember', 'Luna', 'Atlas', 'Iris', 'Orion', 'Lyra', 'Dante',
      'Celeste', 'Zephyr', 'Vesper', 'Sable', 'Crimson', 'Nyx', 'Aspen'
    ];
    
    // Filter out already used names
    const availableNames = names.filter(name => !existingNames.includes(name));
    
    // If all names are taken, add a number suffix
    if (availableNames.length === 0) {
      const baseName = names[Math.floor(Math.random() * names.length)];
      let counter = 2;
      let newName = `${baseName} ${counter}`;
      while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseName} ${counter}`;
      }
      return newName;
    }
    
    return availableNames[Math.floor(Math.random() * availableNames.length)];
  };
  
  useEffect(() => {
    const initServants = async () => {
      // Clean up if more than 2 servants exist (keep 2 most recent)
      if (servants.length > 2) {
        const toDelete = servants.slice(2);
        await Promise.all(toDelete.map(s => base44.entities.Servant.delete(s.id)));
        queryClient.invalidateQueries(['servants']);
        return;
      }

      if (servants.length === 0 && !servantsInitialized) {
        setServantsInitialized(true);
        const variants = ['devoted', 'defiant', 'dreamer'];
        const emotionalStates = ['curious', 'wary', 'distant'];
        const genders = ['male', 'female', 'custom'];
        const sexualities = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'questioning'];
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        const randomState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];
        
        await base44.entities.Servant.create({
          name: generateRandomName([]),
          gender: genders[Math.floor(Math.random() * genders.length)],
          sexuality: sexualities[Math.floor(Math.random() * sexualities.length)],
          variant: randomVariant,
          obsession_stage: 1,
          emotional_state: randomState
        });
        queryClient.invalidateQueries(['servants']);
      }
    };
    
    initServants();
  }, [servants.length, servantsInitialized, queryClient]);

  // Redirect to home if no vampire or turned hunter exists
  useEffect(() => {
    if (!vampireLoading && vampireStates.length === 0 && !turnedHunter) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [vampireStates, vampireLoading, turnedHunter, navigate]);
  
  if (vampireLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!vampireState && !turnedHunter) {
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

  // Show turned hunter vampire power tree
  if (turnedHunter && turnedHunter.is_turned) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen p-4 md:p-6"
        style={{ background: 'linear-gradient(to bottom, #4A0E0E 0%, #2D0A0A 50%, #1A0404 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 max-w-4xl mx-auto"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-rose-100">{turnedHunter.name}</h1>
            <p className="text-rose-300 text-sm mt-1">🦇 Vampire • Stage {turnedHunter.vampire_stage} • Power: {turnedHunter.vampire_power_level || 0}%</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-rose-300 hover:text-rose-100 transition-colors text-sm font-medium"
          >
            Back →
          </button>
        </motion.div>
        <HunterVampirePowerTree hunter={turnedHunter} onClose={() => navigate(createPageUrl('Home'))} />
      </motion.div>
    );
  }
  
  const hungerColor = {
    sated: 'rgba(60, 20, 20, 0.6)',
    calm: 'rgba(80, 0, 0, 0.6)',
    lingering: 'rgba(120, 0, 0, 0.7)',
    heightened: 'rgba(160, 0, 0, 0.8)',
    restless: 'rgba(200, 0, 0, 0.9)'
  }[vampireState.hunger_state];
  
  const handleAddServant = async () => {
    if (servants.length >= 2) {
      alert('You can only have 2 servants at a time.');
      return;
    }

    try {
      const variants = ['devoted', 'defiant', 'dreamer'];
      const emotionalStates = ['curious', 'wary', 'distant'];
      const genders = ['man', 'woman', 'custom'];
      const sexualities = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'questioning'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      const randomState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];

      const existingNames = servants.map(s => s.name);
      const newName = generateRandomName(existingNames);

      await base44.entities.Servant.create({
        name: newName,
        gender: genders[Math.floor(Math.random() * genders.length)],
        sexuality: sexualities[Math.floor(Math.random() * sexualities.length)],
        variant: randomVariant,
        obsession_stage: 1,
        emotional_state: randomState
      });

      await base44.entities.NightLog.create({
        entry: `${newName} has entered your life. A new servant begins their journey.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries(['servants']);
    } catch (e) {
      console.error('Failed to add servant:', e);
    }
  };

  const actions = [
    { icon: Droplets, label: 'Feed', modal: 'feeding' },
    { icon: Users, label: 'Servants', modal: 'servants' },
    { icon: Eye, label: 'Hunt', modal: 'hunting' },
    { icon: Heart, label: 'Mutual Watch', modal: 'stalking' },
    { icon: Zap, label: 'Powers', modal: 'powers' },
    { icon: User, label: 'Possess Someone', modal: 'possession' },
    { icon: Users, label: 'Town People', modal: 'npcs' },
    { icon: Home, label: 'Hospital Shift', modal: 'hospital' },
    { icon: BookOpen, label: 'Night Log', modal: 'log' },
    { icon: Moon, label: 'Advance Night', modal: 'advance' }
  ];
  
  return (
    <div className="min-h-screen relative p-4 md:p-6 pb-32 overflow-y-auto">
      {/* DLC Banner - Top Visibility */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto mb-6"
      >
        <button
          onClick={() => setShowDLC(true)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-2 border-purple-400 rounded-xl py-3 sm:py-4 px-4 sm:px-6 shadow-lg transition-all"
          >
          <div className="text-center">
            <p className="text-white font-bold text-sm sm:text-base">🎮 FREE DLC</p>
          </div>
        </button>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {vampireState.time_of_day === 'day' ? 'Daytime' : 'Nighttime'}
          </h1>
          <span className="text-3xl">
            {vampireState.time_of_day === 'day' ? '☀️' : '🌙'}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {format(new Date(vampireState.current_date || new Date()), 'MMMM d, yyyy')}
        </p>

        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <Moon className="w-4 h-4" />
            Main Menu
          </button>
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Your House
          </button>
        </div>
      </motion.div>
      
      {/* Action buttons - Bitlife style */}
      <div className="max-w-2xl mx-auto space-y-3 mb-8 max-h-[50vh] overflow-y-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          onClick={handleAddServant}
          disabled={servants.length >= 2}
          className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 disabled:from-gray-700 disabled:to-gray-700 disabled:border-gray-600 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg transition-all disabled:opacity-50"
        >
          <Users className="w-5 h-5 text-white" />
          <span className="text-base font-medium text-white">
            {servants.length >= 2 ? 'Max Servants (2/2)' : 'Add New Servant'}
          </span>
        </motion.button>

        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: (servants.length > 1 ? 0.1 : 0.05) + i * 0.05 }}
            onClick={() => action.action ? action.action() : setActiveModal(action.modal)}
            className="bitlife-btn w-full rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg"
            >
            <action.icon className="w-5 h-5" />
            <span className="text-base font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto bg-gray-900 rounded-xl p-4 space-y-2"
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Hunger:</span>
          <span className="text-white capitalize">{vampireState.hunger_state}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Mode:</span>
          <button
            onClick={async () => {
              try {
                if (vampireState.id) {
                  await base44.entities.VampireState.update(vampireState.id, {
                    emotional_mode: vampireState.emotional_mode === 'feeling' ? 'ruthless' : 'feeling'
                  });
                  queryClient.invalidateQueries(['vampireState']);
                }
              } catch (e) {
                console.error('Failed to toggle mode:', e);
              }
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors capitalize"
          >
            {vampireState.emotional_mode} ⚡
          </button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Powers:</span>
          <span className="text-white">{vampireState.unlocked_powers?.length || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Exposure:</span>
          <span className={`${(vampireState.exposure_level || 0) > 50 ? 'text-red-400' : 'text-green-400'}`}>
            {vampireState.exposure_level || 0}%
          </span>
        </div>
        </motion.div>

        {/* New Systems Access */}
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto mt-4 grid grid-cols-2 md:grid-cols-4 gap-2"
        >
        <button
          onClick={() => setActiveModal('rivals')}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">⚔️</span>
          <p className="text-white text-xs mt-1">Rivals</p>
        </button>
        <button
          onClick={() => setActiveModal('council')}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">👑</span>
          <p className="text-white text-xs mt-1">Council</p>
        </button>
        <button
          onClick={() => setActiveModal('territory')}
          className="bg-yellow-950/40 hover:bg-yellow-950/60 border border-yellow-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🗺️</span>
          <p className="text-white text-xs mt-1">Territory</p>
        </button>

        <button
          onClick={() => setActiveModal('blood')}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🩸</span>
          <p className="text-white text-xs mt-1">Blood</p>
        </button>
        <button
          onClick={() => setActiveModal('weakness')}
          className="bg-gray-950/40 hover:bg-gray-950/60 border border-gray-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">☀️</span>
          <p className="text-white text-xs mt-1">Weakness</p>
        </button>
        <button
          onClick={() => setActiveModal('milestones')}
          className="bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🏆</span>
          <p className="text-white text-xs mt-1">Milestones</p>
        </button>
        <button
          onClick={() => setActiveModal('coven')}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">👥</span>
          <p className="text-white text-xs mt-1">Coven</p>
        </button>
        <button
          onClick={() => setShowDaylightRings(true)}
          className="bg-yellow-950/40 hover:bg-yellow-950/60 border border-yellow-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">☀️</span>
          <p className="text-white text-xs mt-1">Daylight</p>
        </button>
        <button
          onClick={() => setShowClubs(true)}
          className="bg-pink-950/40 hover:bg-pink-950/60 border border-pink-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🍷</span>
          <p className="text-white text-xs mt-1">Clubs</p>
        </button>
        <button
          onClick={() => setShowArtifacts(true)}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">⚡</span>
          <p className="text-white text-xs mt-1">Artifacts</p>
        </button>
        <button
          onClick={() => setShowFamily(true)}
          disabled={servants.length === 0}
          className="bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/30 rounded-lg p-3 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-2xl">👨‍👩‍👧</span>
          <p className="text-white text-xs mt-1">Family</p>
        </button>
        <button
          onClick={() => setShowBloodBonds(true)}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🩸</span>
          <p className="text-white text-xs mt-1">Blood Bonds</p>
        </button>
        <button
          onClick={() => setShowPolitics(true)}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">👑</span>
          <p className="text-white text-xs mt-1">Politics</p>
        </button>
        <button
          onClick={() => setShowAging(true)}
          className="bg-gray-950/40 hover:bg-gray-950/60 border border-gray-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">⏳</span>
          <p className="text-white text-xs mt-1">Aging</p>
        </button>
        <button
          onClick={() => setShowAI(true)}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🤖</span>
          <p className="text-white text-xs mt-1">AI Companion</p>
        </button>
        <button
          onClick={() => setShowMemory(true)}
          className="bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">📹</span>
          <p className="text-white text-xs mt-1">Memory Recorder</p>
        </button>
        <button
          onClick={() => setShowEmotion(true)}
          disabled={servants.length === 0}
          className="bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/30 rounded-lg p-3 text-center transition-colors disabled:opacity-50"
        >
          <span className="text-2xl">📊</span>
          <p className="text-white text-xs mt-1">Emotion Monitor</p>
        </button>
        <button
          onClick={() => setShowHolo(true)}
          disabled={servants.length === 0}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors disabled:opacity-50"
        >
          <span className="text-2xl">📞</span>
          <p className="text-white text-xs mt-1">Holographic Call</p>
        </button>
        <button
          onClick={() => setShowPredictor(true)}
          disabled={servants.length === 0}
          className="bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-3 text-center transition-colors disabled:opacity-50"
        >
          <span className="text-2xl">🔮</span>
          <p className="text-white text-xs mt-1">Future Predictor</p>
        </button>
        {vampireState?.content_filter !== 'lite' && (
          <>
            <button
              onClick={() => setShowSoulTrading(true)}
              className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
            >
              <span className="text-2xl">👁️</span>
              <p className="text-white text-xs mt-1">Soul Trading</p>
            </button>
            <button
              onClick={() => setShowBlackMarket(true)}
              className="bg-gray-950/40 hover:bg-gray-950/60 border border-gray-500/30 rounded-lg p-3 text-center transition-colors"
            >
              <span className="text-2xl">🛒</span>
              <p className="text-white text-xs mt-1">Black Market</p>
            </button>
          </>
        )}
        <button
          onClick={() => setShowProphecy(true)}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🔮</span>
          <p className="text-white text-xs mt-1">Prophecies</p>
        </button>
        <button
          onClick={() => setShowWorldEvents(true)}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🌍</span>
          <p className="text-white text-xs mt-1">World Events</p>
        </button>
        <button
          onClick={() => setShowMemoryPalace(true)}
          className="bg-blue-950/40 hover:bg-blue-950/60 border border-blue-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🏛️</span>
          <p className="text-white text-xs mt-1">Memory Palace</p>
        </button>
        {vampireState?.content_filter !== 'lite' && (
          <button
            onClick={() => setShowRituals(true)}
            className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
          >
            <span className="text-2xl">🔥</span>
            <p className="text-white text-xs mt-1">Rituals</p>
          </button>
        )}
        <button
          onClick={() => setShowDreamRealm(true)}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🌌</span>
          <p className="text-white text-xs mt-1">Dream Realms</p>
        </button>
        <button
          onClick={() => setShowPrestige(true)}
          className="bg-yellow-950/40 hover:bg-yellow-950/60 border border-yellow-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">⭐</span>
          <p className="text-white text-xs mt-1">Prestige</p>
        </button>
        <button
          onClick={() => setShowAddiction(true)}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">💉</span>
          <p className="text-white text-xs mt-1">Addiction</p>
        </button>
        <button
          onClick={() => setShowFeedingParty(true)}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🍷</span>
          <p className="text-white text-xs mt-1">Feeding Party</p>
        </button>
        <button
          onClick={() => setShowSnake(true)}
          className="bg-green-950/40 hover:bg-green-950/60 border border-green-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🐍</span>
          <p className="text-white text-xs mt-1">Snake Familiar</p>
        </button>
        <button
          onClick={() => setShowDreams(true)}
          className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🌙</span>
          <p className="text-white text-xs mt-1">Dream Control</p>
        </button>
        <button
          onClick={() => setShowThralls(true)}
          className="bg-gray-950/40 hover:bg-gray-950/60 border border-gray-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🧠</span>
          <p className="text-white text-xs mt-1">Thralls</p>
        </button>
        <button
          onClick={() => setShowMemoryEdit(true)}
          className="bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🧠</span>
          <p className="text-white text-xs mt-1">Memory Edit</p>
        </button>
        <button
          onClick={() => setShowVintage(true)}
          className="bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">🍷</span>
          <p className="text-white text-xs mt-1">Blood Cellar</p>
        </button>
        <button
          onClick={() => setShowSupernaturalDating(true)}
          className="bg-pink-950/40 hover:bg-pink-950/60 border border-pink-500/30 rounded-lg p-3 text-center transition-colors"
        >
          <span className="text-2xl">💕</span>
          <p className="text-white text-xs mt-1">Supernatural Dating</p>
        </button>

        {witches.length > 0 && witches[0].relationship >= 70 && !witches[0].living_with_vampire && (
          <button
            onClick={async () => {
              if (confirm(`Ask ${witches[0].name} to move in with you?`)) {
                await base44.entities.Witch.update(witches[0].id, { living_with_vampire: true, disposition: 'in_love' });
                await base44.entities.NightLog.create({
                  entry: `${witches[0].name} moved in. Witch and vampire, living together. A new chapter begins.`,
                  category: 'interaction',
                  intensity: 'significant'
                });
                queryClient.invalidateQueries();
              }
            }}
            className="bg-pink-950/40 hover:bg-pink-950/60 border border-pink-500/30 rounded-lg p-3 text-center transition-colors"
          >
            <span className="text-2xl">💕</span>
            <p className="text-white text-xs mt-1">Ask Witch to Move In</p>
          </button>
        )}
        {witches.length > 0 && witches[0].living_with_vampire && (
          <button
            onClick={() => setShowWitchHome(true)}
            className="bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
          >
            <span className="text-2xl">🏠</span>
            <p className="text-white text-xs mt-1">With {witches[0].name}</p>
          </button>
        )}
        </motion.div>
      

      
      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'feeding' && (
          <FeedingModal 
            onClose={() => setActiveModal(null)}
            vampireState={vampireState}
          />
        )}
        {activeModal === 'servants' && (
          <ServantsList
            onClose={() => setActiveModal(null)}
            servants={servants}
            vampireState={vampireState}
          />
        )}
        {activeModal === 'hunting' && (
          <HuntingModal
            onClose={() => setActiveModal(null)}
            vampireState={vampireState}
            servants={servants}
          />
        )}
        {activeModal === 'powers' && (
          <PowersModal
            onClose={() => setActiveModal(null)}
            vampireState={vampireState}
          />
        )}
        {activeModal === 'log' && (
          <NightLogView
            onClose={() => setActiveModal(null)}
            logs={logs}
          />
        )}
        {activeModal === 'advance' && (
          <AdvanceNight
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'stalking' && (
          <StalkingSystem
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'possession' && (
          <PossessionSystem
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'npcs' && (
          <NPCInteraction
            onClose={() => setActiveModal(null)}
            viewMode="vampire"
          />
        )}
        {activeModal === 'hospital' && (
          <HospitalJob
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'rivals' && (
          <RivalVampireModal
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'council' && (
          <VampireCouncilModal
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'territory' && (
          <TerritoryMap
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'blood' && (
          <BloodTypeSystem
            vampireState={vampireState}
            servants={servants}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'weakness' && (
          <VampireWeaknessModal
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'milestones' && (
          <MilestonesDisplay
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'coven' && (
          <CovenManagement
            vampireState={vampireState}
            servants={servants}
            onClose={() => setActiveModal(null)}
          />
        )}
        {showDaylightRings && (
          <DaylightRingCrafting vampireState={vampireState} witches={witches} onClose={() => setShowDaylightRings(false)} />
        )}
        {showClubs && (
          <VampireClubScene vampireState={vampireState} onClose={() => setShowClubs(false)} />
        )}
        {showArtifacts && (
          <ArtifactCollection vampireState={vampireState} onClose={() => setShowArtifacts(false)} />
        )}
        {showFamily && servants.length > 0 && (
          <ServantFamilySystem servant={servants[0]} vampireState={vampireState} onClose={() => setShowFamily(false)} />
        )}
        {showBloodBonds && (
          <BloodBondSystem vampireState={vampireState} servants={servants} onClose={() => setShowBloodBonds(false)} />
        )}
        {showPolitics && (
          <VampirePolitics vampireState={vampireState} onClose={() => setShowPolitics(false)} />
        )}
        {showAging && (
          <VampireAgingSystem vampireState={vampireState} onClose={() => setShowAging(false)} />
        )}
        {showDoppelgangers && (
          <DoppelgangerSystem vampireState={vampireState} onClose={() => setShowDoppelgangers(false)} />
        )}
        {showAI && vampireState && (
          <AICompanion entity={vampireState} vampireState={vampireState} onClose={() => setShowAI(false)} />
        )}
        {showMemory && vampireState && (
          <MemoryRecorder entity={vampireState} onClose={() => setShowMemory(false)} />
        )}
        {showEmotion && servants[0] && (
          <EmotionMonitor entity={servants[0]} onClose={() => setShowEmotion(false)} />
        )}
        {showHolo && vampireState && (
          <HolographicCall vampireState={vampireState} entity={vampireState} onClose={() => setShowHolo(false)} />
        )}
        {showPredictor && vampireState && (
          <FuturePredictor vampireState={vampireState} onClose={() => setShowPredictor(false)} />
        )}
        {showAddiction && vampireState && (
          <BloodAddiction vampireState={vampireState} onClose={() => setShowAddiction(false)} />
        )}
        {showFeedingParty && vampireState && (
          <FeedingParty vampireState={vampireState} onClose={() => setShowFeedingParty(false)} />
        )}
        {showWitchHome && witches[0] && (
          <WitchLivingTogether witch={witches[0]} vampireState={vampireState} onClose={() => setShowWitchHome(false)} />
        )}
        {showSnake && vampireState && (
          <VampireSnakeFamiliar vampireState={vampireState} onClose={() => setShowSnake(false)} />
        )}
        {showDreams && vampireState && (
          <DreamManipulation vampireState={vampireState} onClose={() => setShowDreams(false)} />
        )}
        {showThralls && vampireState && (
          <ThrallSystem vampireState={vampireState} onClose={() => setShowThralls(false)} />
        )}
        {showMemoryEdit && vampireState && (
          <MemoryAlteration vampireState={vampireState} onClose={() => setShowMemoryEdit(false)} />
        )}
        {showVintage && vampireState && (
          <BloodVintageSystem vampireState={vampireState} onClose={() => setShowVintage(false)} />
        )}
        {showSupernaturalDating && vampireState && (
          <SupernaturalDating vampireState={vampireState} onClose={() => setShowSupernaturalDating(false)} />
        )}

        {showDLC && (
          <DLCStore onClose={() => setShowDLC(false)} />
        )}
        {showSoulTrading && vampireState && (
          <SoulTradingSystem vampireState={vampireState} onClose={() => setShowSoulTrading(false)} />
        )}
        {showBlackMarket && vampireState && (
          <BlackMarketSystem vampireState={vampireState} onClose={() => setShowBlackMarket(false)} />
        )}
        {showProphecy && vampireState && (
          <ProphecySystem vampireState={vampireState} onClose={() => setShowProphecy(false)} />
        )}
        {showWorldEvents && vampireState && (
          <WorldEventsSystem vampireState={vampireState} onClose={() => setShowWorldEvents(false)} />
        )}
        {showMemoryPalace && vampireState && (
          <MemoryPalaceSystem entity={vampireState} onClose={() => setShowMemoryPalace(false)} />
        )}
        {showRituals && vampireState && (
          <RitualMagicSystem vampireState={vampireState} onClose={() => setShowRituals(false)} />
        )}
        {showDreamRealm && vampireState && (
          <DreamRealmExplorer vampireState={vampireState} onClose={() => setShowDreamRealm(false)} />
        )}
        {showPrestige && vampireState && (
          <PrestigeSystem vampireState={vampireState} onClose={() => setShowPrestige(false)} />
        )}

        </AnimatePresence>
    </div>
  );
}