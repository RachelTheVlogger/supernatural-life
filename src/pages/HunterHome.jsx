import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, FileText, Utensils, Heart, Zap, Trash2, BookOpen, Target } from 'lucide-react';
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

export default function HunterHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const [showHuntLog, setShowHuntLog] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showIntimate, setShowIntimate] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [selectedVampire, setSelectedVampire] = useState(null);
  const [showTraits, setShowTraits] = useState(false);

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampires'],
    queryFn: () => base44.entities.VampireState.list()
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

  const hunter = hunters[0];
  const hunterTargets = vampires.length > 0 ? vampires : [];

  return (
    <div className="min-h-screen relative p-4 md:p-6 pb-24 overflow-x-hidden" style={{
      background: 'linear-gradient(to bottom, #1a0a0a 0%, #2d1a1a 50%, #1a0a14 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 max-w-4xl mx-auto"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{hunter.name}</h1>
          <p className="text-gray-400 capitalize">{hunter.specialty} • Skill: {hunter.skill_level}%</p>
        </div>
        <button
          onClick={() => vampires.length > 0 ? navigate(createPageUrl(`Night?id=${vampires[0].id}`)) : null}
          disabled={vampires.length === 0}
          className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
        >
          Switch to Vampire <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-4xl mx-auto"
      >
        <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
          <Target className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-gray-400 text-xs mb-1">Active Targets</p>
          <p className="text-white text-2xl font-bold">{hunterTargets.length}</p>
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
              { id: 'hunting', label: 'Hunt Log', icon: FileText },
              { id: 'activities', label: 'Activities', icon: Utensils },
              { id: 'intimate', label: 'Intimate', icon: Heart },
              { id: 'vamp', label: 'Vamp', icon: Zap }
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
              <div className="grid md:grid-cols-2 gap-4">
              {/* Living Space */}
              <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Safe House
              </h3>
              <button
                onClick={() => setShowActivities(true)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
              >
                <h4 className="text-white font-bold text-lg mb-2">Enter Safe House</h4>
                <p className="text-gray-400 text-sm">Choose your activities inside</p>
              </button>
              </div>

                {/* Current Status */}
                {/* Hunter Traits */}
                <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Hunter Traits
                  </h3>
                  <button
                    onClick={() => setShowTraits(true)}
                    className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 rounded-lg p-4 text-center transition-colors border border-purple-500/30"
                  >
                    <h4 className="text-white font-bold text-lg mb-2">Manage Traits</h4>
                    <p className="text-purple-300 text-sm">
                      {hunter.traits?.length || 0}/3 traits active • {hunter.experience || 0} EXP
                    </p>
                  </button>
                </div>

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
                          <button
                            key={target.id}
                            onClick={() => {
                              setSelectedVampire(target);
                              setShowInteraction(true);
                            }}
                            className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors"
                          >
                            <p className="text-white font-medium">{target.vampire_name}</p>
                            <p className="text-gray-400 text-xs">Click to interact</p>
                          </button>
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
              <HunterHomeActivities hunter={hunter} />
            </motion.div>
          )}

          {showActivities && (
            <HunterHomeActivities hunter={hunter} onClose={() => setShowActivities(false)} />
          )}

          {activeTab === 'intimate' && (
            <motion.div
              key="intimate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-white text-lg font-bold mb-4">When the Vampire Visits You</h3>
              {vampires.length > 0 ? (
                <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
                  {vampires.map(vampire => (
                    <button
                      key={vampire.id}
                      onClick={() => {
                        setSelectedVampire(vampire);
                        setShowInteraction(true);
                      }}
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors border border-red-500/30"
                    >
                      <p className="text-white font-bold">{vampire.vampire_name}</p>
                      <p className="text-gray-400 text-sm">What do they do when they visit?</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400">No vampires found</p>
                </div>
              )}
            </motion.div>
          )}

          {showAbilities && (
            <HunterAbilityShop hunter={hunter} onClose={() => setShowAbilities(false)} />
          )}

          {showInteraction && selectedVampire && (
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

          {activeTab === 'vamp' && (
            <motion.div
              key="vamp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold">Vampire's Perspective</h3>
                <button
                  onClick={() => vampires.length > 0 ? navigate(createPageUrl(`Night?id=${vampires[0].id}`)) : null}
                  disabled={vampires.length === 0}
                  className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Switch to Vampire
                </button>
              </div>
              {vampires.length > 0 ? (
                <VampireInitiatedInteractions 
                  vampire={vampires[0]}
                  hunter={hunter}
                  onClose={() => setActiveTab('home')}
                />
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400">No vampires found</p>
                </div>
              )}
            </motion.div>
          )}

          {showInteraction && selectedVampire && activeTab === 'intimate' && (
            <VampireInitiatedInteractions 
              vampire={selectedVampire}
              hunter={hunter}
              onClose={() => setShowInteraction(false)}
            />
          )}
          </AnimatePresence>
      </motion.div>
    </div>
  );
}