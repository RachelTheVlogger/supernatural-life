import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, FileText, Utensils, Heart, Zap, Trash2, BookOpen, Target, Users, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import HunterHuntLog from '@/components/nightbound/HunterHuntLog';
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


export default function HunterHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const [turningIntoVampire, setTurningIntoVampire] = useState(false);
  const [showHuntLog, setShowHuntLog] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showIntimate, setShowIntimate] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
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
  const [showTurnedHunter, setShowTurnedHunter] = useState(false);

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list(),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0
  });

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

  const { data: notes = [] } = useQuery({
    queryKey: ['hunterNotes'],
    queryFn: async () => {
      try {
        return await base44.entities.HunterNote.list();
      } catch (e) {
        return [];
      }
    }
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

  const hunter = hunters[0];
  const myTeam = teams.find(t => t.member_ids?.includes(hunter?.id));

  if (hunters.length === 0) {
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
        ? 'linear-gradient(to bottom, #3d0a0a 0%, #4d1a1a 50%, #3d0a14 100%)'
        : 'linear-gradient(to bottom, #1a0a0a 0%, #2d1a1a 50%, #1a0a14 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 max-w-4xl mx-auto"
      >
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${isTurnedVampire ? 'text-red-100' : 'text-white'}`}>
            {hunter.name}
            {isTurnedVampire && <span className="text-red-400 ml-2">🦇</span>}
          </h1>
          <p className={`capitalize ${isTurnedVampire ? 'text-red-300' : 'text-gray-400'}`}>
            {isTurnedVampire ? 'Vampire' : hunter.specialty} • {isTurnedVampire ? `Stage ${hunter.vampire_stage}` : `Skill: ${hunter.skill_level}%`}
          </p>
          {hasVampireRelationship && !isTurnedVampire && (
            <p className="text-red-400 text-sm mt-1">💗 Bond with {vampires[0].vampire_name}: {vampires[0].hunter_relationship}%</p>
          )}
        </div>
        <button
          onClick={() => vampires.length > 0 ? navigate(createPageUrl(`Night?id=${vampires[0].id}`)) : null}
          disabled={vampires.length === 0}
          className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
        >
          Switch to Vampire <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </motion.div>

      {/* Turn into Vampire Option */}
      {!isTurnedVampire && vampires.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-6"
        >
          <button
            onClick={async () => {
              setTurningIntoVampire(true);
              try {
                await base44.entities.Hunter.update(hunter.id, {
                  is_turned: true,
                  vampire_stage: 1,
                  status: 'recruited',
                  vampire_power_level: 10
                });

                await base44.entities.NightLog.create({
                  entry: `${hunter.name} accepted the dark gift. The transformation is complete. No longer human, no longer just a hunter. Something new.`,
                  category: 'interaction',
                  intensity: 'extreme'
                });

                await queryClient.invalidateQueries();
                await queryClient.refetchQueries({ queryKey: ['hunters'] });
                
                setTimeout(() => window.location.reload(), 500);
              } catch (e) {
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
        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 max-w-4xl mx-auto"
      >
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
        <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4">
          <FileText className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-gray-400 text-xs mb-1">Hunt Notes</p>
          <p className="text-white text-2xl font-bold">{notes.length}</p>
        </div>
        <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
          <Heart className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-gray-400 text-xs mb-1">Status</p>
          <p className="text-white text-2xl font-bold capitalize">{hunter.status}</p>
        </div>
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
        {isTurnedVampire && (
          <button
            onClick={() => setShowTurnedHunter(true)}
            className="bg-black/40 border border-red-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
          >
            <Zap className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Hybrid Powers</p>
            <p className="text-white text-lg font-bold">🦇</p>
          </button>
        )}
        </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-5 gap-2 mb-8">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'hunting', label: isTurnedVampire ? 'Feed' : 'Hunt Log', icon: isTurnedVampire ? Droplets : FileText },
              { id: 'activities', label: 'Activities', icon: Utensils },
              { id: 'intimate', label: 'Intimate', icon: Heart },
              { id: 'vamp', label: isTurnedVampire ? 'Powers' : 'Vamp', icon: Zap }
            ].map(tab => {
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
              {isTurnedVampire && (
                <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-6 mb-6">
                  <h2 className="text-2xl font-bold text-red-100 mb-2">🦇 Vampire Hunter Hybrid</h2>
                  <p className="text-red-300 mb-4">You are no longer human. Hunter training combined with vampire powers makes you unstoppable.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                      <p className="text-gray-400 text-xs">Vampire Power</p>
                      <p className="text-red-200 text-xl font-bold">{hunter.vampire_power_level || 10}%</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                      <p className="text-gray-400 text-xs">Hunter Skills</p>
                      <p className="text-red-200 text-xl font-bold">{hunter.skill_level}%</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-4">
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
              <HunterHuntLog hunter={hunter} vampires={hunterTargets} notes={notes} />
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

          {activeTab === 'intimate' && (
            <HunterIntimate hunter={hunter} vampires={vampires} onClose={() => setActiveTab('home')} />
          )}
          </AnimatePresence>

          {showAbilities && (
            <HunterAbilityShop hunter={hunter} onClose={() => setShowAbilities(false)} />
          )}

          {showInteraction && selectedVampire && activeTab !== 'intimate' && (
            <HunterVampireInteraction 
              hunter={hunter} 
              vampire={selectedVampire} 
              onClose={() => setShowInteraction(false)} 
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
                      <p className="text-red-300 text-sm">Hunter's Bond: {vampires[0].hunter_relationship || 0}%</p>
                    </div>
                    <button
                      onClick={() => navigate(createPageUrl(`Night?id=${vampires[0].id}`))}
                      className="text-red-200 hover:text-red-100 transition-colors text-sm font-medium"
                    >
                      Switch to Vampire →
                    </button>
                  </div>

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

          {showCouncil && (
            <HunterCouncilSystem hunter={hunter} onClose={() => setShowCouncil(false)} />
          )}

          {showTurnedHunter && isTurnedVampire && (
            <TurnedHunterSystem hunter={hunter} onClose={() => setShowTurnedHunter(false)} />
          )}

          {showTurnedHunter && isTurnedVampire && (
            <TurnedHunterSystem hunter={hunter} onClose={() => setShowTurnedHunter(false)} />
          )}
          </motion.div>
          </div>
          );
          }