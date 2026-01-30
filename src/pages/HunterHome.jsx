import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, FileText, Utensils, Heart, Zap, Trash2, BookOpen, Target, Users, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import HunterHomeActivities from '@/components/nightbound/HunterHomeActivities';
import HunterIntimate from '@/components/nightbound/HunterIntimate';
import HunterAbilityShop from '@/components/nightbound/HunterAbilityShop';
import HunterVampireInteraction from '@/components/nightbound/HunterVampireInteraction';
import VampireInitiatedInteractions from '@/components/nightbound/VampireInitiatedInteractions';
import HunterTraits from '@/components/nightbound/HunterTraits';
import HunterManagement from '@/components/nightbound/HunterManagement';
import HunterProgression from '@/components/nightbound/HunterProgression';
import SafeHouseManagement from '@/components/nightbound/SafeHouseManagement';
import HunterEquipment from '@/components/nightbound/HunterEquipment';
import HunterContracts from '@/components/nightbound/HunterContracts';
import HunterAchievements from '@/components/nightbound/HunterAchievements';
import HunterTeamManagement from '@/components/nightbound/HunterTeamManagement';
import TeamMissions from '@/components/nightbound/TeamMissions';
import TeamChat from '@/components/nightbound/TeamChat';
import HunterVampireTracking from '@/components/nightbound/HunterVampireTracking';
import HunterMentorSystem from '@/components/nightbound/HunterMentorSystem';
import HunterBetrayalSystem from '@/components/nightbound/HunterBetrayalSystem';
import HunterCouncilSystem from '@/components/nightbound/HunterCouncilSystem';
import TurnedHunterSystem from '@/components/nightbound/TurnedHunterSystem';
import HunterVampirePowerTree from '@/components/nightbound/HunterVampirePowerTree';
import TurnedHunterVampireInteraction from '@/components/nightbound/TurnedHunterVampireInteraction';
import HunterCrimsonBliss from '@/components/nightbound/HunterCrimsonBliss';
import HunterTortureSystem from '@/components/nightbound/HunterTortureSystem';


export default function HunterHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const [turningIntoVampire, setTurningIntoVampire] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [selectedVampire, setSelectedVampire] = useState(null);
  const [showTraits, setShowTraits] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const [showSafeHouse, setShowSafeHouse] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const [showTeamMissions, setShowTeamMissions] = useState(false);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingVampire, setTrackingVampire] = useState(null);
  const [showMentor, setShowMentor] = useState(false);
  const [showBetrayal, setShowBetrayal] = useState(false);
  const [showCouncil, setShowCouncil] = useState(false);
  const [showCrimsonBliss, setShowCrimsonBliss] = useState(false);
  const [showTorture, setShowTorture] = useState(false);
  const [torturableVampire, setTorturableVampire] = useState(null);


  const { data: hunters = [], refetch: refetchHunters, isLoading: huntersLoading } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list(),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Force refetch hunters data periodically when transformation is happening
  useEffect(() => {
    if (turningIntoVampire) {
      const interval = setInterval(() => {
        refetchHunters();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [turningIntoVampire, refetchHunters]);

  const { data: vampires = [], refetch: refetchVampires, isLoading: vampiresLoading } = useQuery({
    queryKey: ['vampireState'],
    queryFn: async () => {
      try {
        const result = await base44.entities.VampireState.list();
        return result || [];
      } catch (e) {
        console.error('Failed to fetch vampires:', e);
        return [];
      }
    },
    retry: 3,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });



  const { data: teams = [] } = useQuery({
    queryKey: ['hunterTeams'],
    queryFn: async () => {
      try {
        return await base44.entities.HunterTeam.list();
      } catch (e) {
        return [];
      }
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const hunterId = urlParams.get('id');
  const hunter = hunterId ? hunters.find(h => h.id === hunterId) : hunters[0];
  const myTeam = teams.find(t => t.member_ids?.includes(hunter?.id));

  if (huntersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Loading hunter data...</p>
      </div>
    );
  }

  if (!huntersLoading && hunters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No hunters found</p>
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Game
          </button>
        </div>
      </div>
    );
  }
  const hunterTargets = vampires.length > 0 ? vampires : [];

  const hasVampireRelationship = vampires.length > 0 && (vampires[0].hunter_relationship || 0) > 0;
  const isTurnedVampire = hunter?.is_turned;

  return (
    <div className="min-h-screen relative p-4 md:p-6 pb-24 overflow-x-hidden" style={{
      background: isTurnedVampire
        ? 'linear-gradient(to bottom, #4A0E0E 0%, #2D0A0A 50%, #1A0404 100%)'
        : 'linear-gradient(to bottom, #1a0a0a 0%, #2d1a1a 50%, #1a0a14 100%)'
    }}>
      {/* Blood drop particles for turned hunters */}
      {isTurnedVampire && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-3 bg-red-600/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
              }}
              animate={{
                y: ['0vh', '110vh'],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 max-w-4xl mx-auto relative z-10"
      >
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${isTurnedVampire ? 'text-rose-100' : 'text-white'}`}>
            {hunter.name}
          </h1>
          <p className={`text-sm capitalize ${isTurnedVampire ? 'text-rose-300' : 'text-gray-400'}`}>
            {isTurnedVampire ? '🦇 Vampire' : `${hunter.specialty} hunter`} • {isTurnedVampire ? `Stage ${hunter.vampire_stage}` : `Skill: ${hunter.skill_level}%`}
          </p>
          {hasVampireRelationship && !isTurnedVampire && (
            <p className="text-red-400 text-sm mt-1">💗 Bond with {vampires[0].vampire_name}: {vampires[0].hunter_relationship}%</p>
          )}
        </div>
        {!isTurnedVampire && (
          <button
            onClick={() => vampires.length > 0 ? navigate(createPageUrl(`Night?id=${vampires[0].id}`)) : null}
            disabled={vampires.length === 0}
            className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
          >
            Switch to Vampire <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        )}
      </motion.div>

      {/* Emotional state for turned vampire */}
      {isTurnedVampire && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto rounded-xl p-4 mb-6 bg-gradient-to-br from-rose-950/60 to-red-950/60 border border-rose-500/30"
        >
          <p className="text-sm italic text-center text-rose-100">
            Every sense heightened. Every emotion deeper. The hunger pulses through you like a second heartbeat. You are vampire.
          </p>
        </motion.div>
      )}

      {/* Turn into Vampire Option */}
      {!isTurnedVampire && vampires.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-6"
        >
          <button
            onClick={async () => {
              if (turningIntoVampire) return;
              setTurningIntoVampire(true);
              try {
                console.log('Starting transformation for hunter:', hunter.id);

                const updated = await base44.entities.Hunter.update(hunter.id, {
                  is_turned: true,
                  vampire_stage: 1,
                  status: 'recruited',
                  vampire_power_level: 10,
                  nights_as_vampire: 0,
                  unlocked_powers: ['Enhanced Senses']
                });

                console.log('Hunter updated:', updated);

                await base44.entities.NightLog.create({
                  entry: `${hunter.name} accepted the dark gift. The transformation is complete. No longer human, no longer just a hunter. Something new.`,
                  category: 'interaction',
                  intensity: 'extreme'
                });

                // Force refetch
                await refetchHunters();
                await queryClient.invalidateQueries();

                setTurningIntoVampire(false);
              } catch (e) {
                console.error('Transformation failed:', e);
                alert('Failed: ' + e.message);
                setTurningIntoVampire(false);
              }
            }}
            disabled={turningIntoVampire}
            className="w-full bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 border-2 border-red-500 text-white rounded-xl py-6 px-6 text-center transition-all shadow-lg disabled:opacity-50"
          >
            <div className="text-3xl mb-2">🦇</div>
            <div className="text-xl font-bold mb-2">{turningIntoVampire ? 'Transforming...' : 'Accept Eternal Life'}</div>
            <div className="text-sm text-red-200">{turningIntoVampire ? 'The dark gift flows through you...' : `Become a vampire alongside ${vampires[0].vampire_name}`}</div>
          </button>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-8 max-w-4xl mx-auto"
      >
        {isTurnedVampire ? (
          <>
            <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
              <p className="text-rose-400 text-xs mb-1">Vampire Stage</p>
              <p className="text-white text-lg font-bold">
                {hunter.vampire_stage === 1 ? '🩸 Newborn' : hunter.vampire_stage === 2 ? '🌙 Fledgling' : hunter.vampire_stage === 3 ? '⚡ Established' : '👑 Elder'}
              </p>
            </div>
            <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
              <p className="text-rose-400 text-xs mb-1">Power Level</p>
              <p className="text-white text-lg font-bold">{hunter.vampire_power_level || 0}/100</p>
            </div>
            <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
              <p className="text-rose-400 text-xs mb-1">Nights as Vampire</p>
              <p className="text-white text-lg font-bold">{hunter.nights_as_vampire || 0}</p>
            </div>
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
              <p className="text-rose-400 text-xs mb-1">Bond with Sire</p>
              <p className="text-white text-lg font-bold">{vampires[0]?.hunter_relationship || 0}%</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
              <Target className="w-5 h-5 text-red-400 mb-2" />
              <p className="text-gray-400 text-xs mb-1">Active Targets</p>
              <p className="text-white text-2xl font-bold">{hunterTargets.length}</p>
              <p className="text-gray-500 text-[10px] mt-1">DB: {vampires.length}</p>
            </div>
            <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-4">
              <Zap className="w-5 h-5 text-yellow-400 mb-2" />
              <p className="text-gray-400 text-xs mb-1">Suspicion</p>
              <p className="text-white text-2xl font-bold">{hunter.suspicion}%</p>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
              <Heart className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-gray-400 text-xs mb-1">Status</p>
              <p className="text-white text-2xl font-bold capitalize">{hunter.status}</p>
            </div>
          </>
        )}
        {!isTurnedVampire && (
          <>
            <button
              onClick={() => setShowTeams(true)}
              className="bg-black/40 border border-blue-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-gray-400 text-xs mb-1">Team</p>
              <p className="text-white text-lg font-bold">{myTeam ? '✓' : 'None'}</p>
            </button>
            <button
              onClick={() => setShowMentor(true)}
              className="bg-black/40 border border-purple-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
            >
              <Users className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-gray-400 text-xs mb-1">Mentor</p>
              <p className="text-white text-lg font-bold">👨‍🏫</p>
            </button>
            <button
              onClick={() => setShowBetrayal(true)}
              className="bg-black/40 border border-red-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
            >
              <Zap className="w-5 h-5 text-red-400 mb-2" />
              <p className="text-gray-400 text-xs mb-1">Betrayal</p>
              <p className="text-white text-lg font-bold">⚠️</p>
            </button>
            <button
              onClick={() => setShowCouncil(true)}
              className="bg-black/40 border border-yellow-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
            >
              <Target className="w-5 h-5 text-yellow-400 mb-2" />
              <p className="text-gray-400 text-xs mb-1">Council</p>
              <p className="text-white text-lg font-bold">👑</p>
            </button>
            {!isTurnedVampire && (
              <button
                onClick={() => setShowCrimsonBliss(true)}
                className="bg-black/40 border border-red-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
              >
                <Droplets className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-gray-400 text-xs mb-1">Crimson Bliss</p>
                <p className="text-white text-lg font-bold">🩸</p>
              </button>
            )}
          </>
        )}
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-4 gap-2 mb-8">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'hunting', label: 'Powers', icon: Zap },
              { id: 'activities', label: 'Activities', icon: Utensils },
              { id: 'vamp', label: 'Sire', icon: Heart, show: vampires.length > 0 }
            ].filter(tab => tab.show !== false).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg p-3 transition-all flex flex-col items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >

              <div className="grid md:grid-cols-3 gap-4">
                  {isTurnedVampire ? (
                    <>
                      {/* Vampire Stats */}
                      <div className="bg-black/40 border border-red-700/50 rounded-2xl p-6">
                        <h3 className="text-rose-100 text-lg font-bold mb-4">Vampire Stats</h3>
                        <div className="space-y-2">
                          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                            <p className="text-rose-300 text-xs">Powers Unlocked</p>
                            <p className="text-rose-100 font-bold">{hunter.unlocked_powers?.length || 0}/10</p>
                          </div>
                          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                            <p className="text-rose-300 text-xs">Experience</p>
                            <p className="text-rose-100 font-bold">{hunter.experience || 0} XP</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-red-700/50 rounded-2xl p-6">
                        <h3 className="text-rose-100 text-lg font-bold mb-4 flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          Your Sire
                        </h3>
                        {vampires[0] && (
                          <>
                            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 mb-3">
                              <h4 className="text-rose-100 font-bold">{vampires[0].vampire_name}</h4>
                              <p className="text-rose-300 text-sm">Bond: {vampires[0].hunter_relationship || 0}%</p>
                            </div>
                            <button
                              onClick={() => setActiveTab('vamp')}
                              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all"
                            >
                              Visit Sire
                            </button>
                          </>
                        )}
                      </div>

                      <div className="bg-black/40 border border-red-700/50 rounded-2xl p-6">
                        <h3 className="text-rose-100 text-lg font-bold mb-4">Daily Life</h3>
                        <button
                          onClick={() => setActiveTab('activities')}
                          className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
                        >
                          <h4 className="text-white font-bold mb-1">Activities</h4>
                          <p className="text-gray-400 text-sm">Train • Rest • Grow</p>
                        </button>
                      </div>
                    </>
                  ) : (
                      <>
                        {/* Hunter Network */}
                        <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
                          <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Hunter Network
                          </h3>
                          <button
                            onClick={() => setShowManagement(true)}
                            className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 rounded-lg p-4 text-center transition-colors border border-red-500/30"
                          >
                            <h4 className="text-white font-bold text-lg mb-2">Manage Hunters</h4>
                            <p className="text-red-300 text-sm">
                              {hunters.length} active hunter{hunters.length !== 1 ? 's' : ''}
                            </p>
                          </button>
                        </div>

                        {/* Living Space */}
                        <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Safe House
                        </h3>
                        <div className="space-y-2">
                        <button
                        onClick={() => setShowSafeHouse(true)}
                        className="w-full bg-gradient-to-r from-orange-900/60 to-orange-950/60 hover:from-orange-900/80 hover:to-orange-950/80 rounded-lg p-4 text-center transition-colors border border-orange-500/30"
                        >
                        <h4 className="text-white font-bold text-lg mb-2">Upgrade Base</h4>
                        <p className="text-orange-300 text-sm">Build facilities & customize</p>
                        </button>
                        <button
                        onClick={() => setShowActivities(true)}
                        className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
                        >
                        <h4 className="text-white font-bold text-lg mb-2">Daily Activities</h4>
                        <p className="text-gray-400 text-sm">Rest, train, and prepare</p>
                        </button>
                        </div>
                        </div>

                    {/* Current Status */}
                    {/* Hunter Progression & Equipment */}
                    <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
                      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Progression
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowProgression(true)}
                          className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 rounded-lg p-4 text-center transition-colors border border-blue-500/30"
                        >
                          <h4 className="text-white font-bold text-lg mb-2">Skill Trees</h4>
                          <p className="text-blue-300 text-sm">
                            Level {Math.floor(Math.sqrt((hunter.experience || 0) / 50)) + 1} • {hunter.experience || 0} EXP
                          </p>
                        </button>
                        <button
                          onClick={() => setShowEquipment(true)}
                          className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
                        >
                          <h4 className="text-white font-bold text-lg mb-2">Equipment</h4>
                          <p className="text-gray-400 text-sm">Gear & weapons</p>
                        </button>
                      </div>
                    </div>

                    {/* Contracts & Achievements */}
                    <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
                      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Missions
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowContracts(true)}
                          className="w-full bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-900/80 hover:to-green-950/80 rounded-lg p-4 text-center transition-colors border border-green-500/30"
                        >
                          <h4 className="text-white font-bold text-lg mb-2">Contracts</h4>
                          <p className="text-green-300 text-sm">Available missions</p>
                        </button>
                        <button
                          onClick={() => setShowAchievements(true)}
                          className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
                        >
                          <h4 className="text-white font-bold text-lg mb-2">Achievements</h4>
                          <p className="text-gray-400 text-sm">Track progress</p>
                        </button>
                      </div>
                    </div>

                    {/* Team Operations */}
                    {myTeam && (
                      <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Team Operations
                        </h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowTeamMissions(true)}
                            className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 rounded-lg p-4 text-center transition-colors border border-blue-500/30"
                          >
                            <h4 className="text-white font-bold text-lg mb-2">Team Missions</h4>
                            <p className="text-blue-300 text-sm">Coordinate operations</p>
                          </button>
                          <button
                            onClick={() => setShowTeamChat(true)}
                            className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
                          >
                            <h4 className="text-white font-bold text-lg mb-2">Team Chat</h4>
                            <p className="text-gray-400 text-sm">Communicate with team</p>
                          </button>
                        </div>
                      </div>
                    )}



                    <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
                      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Current Mission
                      </h3>
                      

                      {hunterTargets.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-gray-400 text-sm">
                            {hunterTargets.length} known vampire threat{hunterTargets.length !== 1 ? 's' : ''} active in area
                          </p>
                          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3 mb-3">
                            <p className="text-red-300 text-sm font-medium">Status: HUNTING</p>
                            <p className="text-gray-400 text-xs mt-1">Stay alert. They're out there.</p>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {hunterTargets.map(target => (
                              <div key={target.id} className="space-y-2">
                                <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-3">
                                  <p className="text-white font-medium mb-1">{target.vampire_name}</p>
                                  {target.living_with_hunter && (
                                    <p className="text-green-400 text-xs mb-2">💚 Living together</p>
                                  )}
                                  {target.hunter_relationship > 0 && (
                                    <p className="text-purple-400 text-xs mb-2">
                                      Bond: {target.hunter_relationship}%
                                    </p>
                                  )}
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        setTrackingVampire(target);
                                        setShowTracking(true);
                                      }}
                                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs"
                                    >
                                      👁️ Track
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedVampire(target);
                                        setShowInteraction(true);
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs"
                                    >
                                      ⚔️ Confront
                                    </button>
                                    <button
                                      onClick={() => {
                                        setTorturableVampire(target);
                                        setShowTorture(true);
                                      }}
                                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs col-span-2"
                                    >
                                      🔥 Torture
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
                          <p className="text-green-300 text-sm font-medium">No Active Threats</p>
                          <p className="text-gray-400 text-xs mt-1">The city is clear. For now.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                </div>
            </motion.div>
          )}

          {activeTab === 'hunting' && (
            <motion.div
              key="hunting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HunterVampirePowerTree hunter={hunter} onClose={() => setActiveTab('home')} />
            </motion.div>
          )}

          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HunterHomeActivities hunter={hunter} onClose={() => setActiveTab('home')} />
            </motion.div>
          )}


          </AnimatePresence>



          {showInteraction && selectedVampire && !isTurnedVampire && (
            <HunterVampireInteraction 
              hunter={hunter} 
              vampire={selectedVampire} 
              onClose={() => {
                setShowInteraction(false);
                setSelectedVampire(null);
              }} 
              visitType="meeting"
            />
          )}

          {showTraits && (
            <HunterTraits hunter={hunter} onClose={() => setShowTraits(false)} />
          )}

          {showManagement && (
            <HunterManagement onClose={() => setShowManagement(false)} />
          )}

          {showProgression && (
            <HunterProgression hunter={hunter} onClose={() => setShowProgression(false)} />
          )}

          {showSafeHouse && (
            <SafeHouseManagement hunter={hunter} onClose={() => setShowSafeHouse(false)} />
          )}

          {showEquipment && (
            <HunterEquipment hunter={hunter} onClose={() => setShowEquipment(false)} />
          )}

          {showContracts && (
            <HunterContracts hunter={hunter} onClose={() => setShowContracts(false)} />
          )}

          {showAchievements && (
            <HunterAchievements hunter={hunter} onClose={() => setShowAchievements(false)} />
          )}

          {showTeams && (
            <HunterTeamManagement hunter={hunter} onClose={() => setShowTeams(false)} />
          )}

          {showTeamMissions && myTeam && (
            <TeamMissions hunter={hunter} team={myTeam} onClose={() => setShowTeamMissions(false)} />
          )}

          {showTeamChat && myTeam && (
            <TeamChat hunter={hunter} team={myTeam} onClose={() => setShowTeamChat(false)} />
          )}

          {showTracking && trackingVampire && (
            <HunterVampireTracking
              hunter={hunter}
              vampire={trackingVampire}
              onClose={() => {
                setShowTracking(false);
                setTrackingVampire(null);
              }}
            />
          )}

          <AnimatePresence mode="wait">
          {activeTab === 'vamp' && (
            <motion.div
              key="vamp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {vampires.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-red-950/60 to-red-900/60 rounded-lg p-4 border border-red-500/50">
                    <div>
                      <h3 className="text-red-100 text-lg font-bold">{vampires[0].vampire_name}</h3>
                      <p className="text-red-300 text-sm">{isTurnedVampire ? 'Your Sire' : 'Hunter\'s Bond'}: {vampires[0].hunter_relationship || 0}%</p>
                    </div>
                    {!isTurnedVampire && (
                      <button
                        onClick={() => navigate(createPageUrl(`Night?id=${vampires[0].id}`))}
                        className="text-red-200 hover:text-red-100 transition-colors text-sm font-medium"
                      >
                        Switch to Vampire →
                      </button>
                    )}
                  </div>

                  {isTurnedVampire ? (
                    <div className="bg-black/40 border border-red-700/50 rounded-2xl p-6">
                      <h3 className="text-rose-100 text-xl font-bold mb-4">🦇 Vampire Bonding</h3>
                      <p className="text-rose-300 text-sm mb-4">
                        Train with your sire, share power, and strengthen your eternal bond.
                      </p>
                      <button
                        onClick={() => setShowInteraction(true)}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-4 rounded-xl transition-all"
                      >
                        Interact with {vampires[0].vampire_name}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedVampire(vampires[0])}
                        className="w-full rounded-lg p-4 transition-all font-bold text-base bg-red-600 hover:bg-red-700 text-white"
                      >
                        Seduce
                      </button>

                      {selectedVampire === vampires[0] && (
                        <HunterIntimate hunter={hunter} vampires={vampires} onClose={() => setSelectedVampire(null)} />
                      )}

                      <VampireInitiatedInteractions 
                        vampire={vampires[0]}
                        hunter={hunter}
                        onClose={() => setActiveTab('home')}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400">No vampires found. Seduce one first.</p>
                </div>
              )}
            </motion.div>
          )}

          </AnimatePresence>

          {showActivities && (
            <HunterHomeActivities hunter={hunter} onClose={() => setShowActivities(false)} />
          )}

          {showMentor && (
            <HunterMentorSystem hunter={hunter} onClose={() => setShowMentor(false)} />
          )}

          {showBetrayal && (
            <HunterBetrayalSystem hunter={hunter} vampires={vampires} onClose={() => setShowBetrayal(false)} />
          )}

          {showCouncil && !isTurnedVampire && (
            <HunterCouncilSystem hunter={hunter} onClose={() => setShowCouncil(false)} />
          )}

          {showInteraction && isTurnedVampire && vampires[0] && (
            <TurnedHunterVampireInteraction 
              hunter={hunter} 
              vampire={vampires[0]} 
              onClose={() => setShowInteraction(false)} 
            />
          )}

          {showCrimsonBliss && !isTurnedVampire && (
            <HunterCrimsonBliss 
              hunter={hunter} 
              vampires={hunterTargets} 
              onClose={() => setShowCrimsonBliss(false)} 
            />
          )}

          {showTorture && torturableVampire && !isTurnedVampire && (
            <HunterTortureSystem 
              hunter={hunter} 
              vampire={torturableVampire} 
              onClose={() => {
                setShowTorture(false);
                setTorturableVampire(null);
              }} 
            />
          )}
          </motion.div>
          </div>
          );
          }