import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Droplets, Users, Heart, Target, Shield, Brain, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HYBRID_ABILITIES = [
  { id: 'tactical_hunt', name: 'Tactical Hunt', description: 'Use hunter tactics with vampire speed', icon: Target, category: 'combat' },
  { id: 'silent_infiltration', name: 'Silent Infiltration', description: 'Hunter stealth + vampire invisibility', icon: Eye, category: 'infiltration' },
  { id: 'blood_sense', name: 'Blood Sense', description: 'Track enemies like a hunter using vampire senses', icon: Droplets, category: 'tracking' },
  { id: 'double_agent', name: 'Double Agent', description: 'Manipulate both hunter and vampire networks', icon: Brain, category: 'politics' },
  { id: 'eternal_bonds', name: 'Eternal Bonds', description: 'Bond with hunters on both sides', icon: Heart, category: 'bonds' }
];

const TURNED_HUNTER_CONFLICTS = [
  { id: 'team_discovery', name: 'Team Discovery', severity: 'critical', description: 'Your former team found out what you are' },
  { id: 'mentor_confrontation', name: 'Mentor Confrontation', severity: 'high', description: 'Your mentor wants you dead or back' },
  { id: 'vampire_distrust', name: 'Vampire Distrust', severity: 'high', description: 'Some vampires don\'t trust your conversion' },
  { id: 'identity_crisis', name: 'Identity Crisis', severity: 'medium', description: 'Struggling with what you\'ve become' },
  { id: 'safe_house_raid', name: 'Safe House Raid', severity: 'critical', description: 'Hunters raided your safe house' }
];

export default function TurnedHunterSystem({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('powers');
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [unlockedAbilities, setUnlockedAbilities] = useState(hunter?.unlocked_skills || []);

  const handleUnlockAbility = async (abilityId) => {
    const ability = HYBRID_ABILITIES.find(a => a.id === abilityId);
    const expCost = 500;
    
    if (hunter.experience < expCost) {
      alert(`Need ${expCost} EXP. You have ${hunter.experience}`);
      return;
    }

    try {
      await base44.entities.Hunter.update(hunter.id, {
        experience: (hunter.experience || 0) - expCost,
        unlocked_skills: [...(hunter.unlocked_skills || []), abilityId]
      });
      setUnlockedAbilities([...unlockedAbilities, abilityId]);
      queryClient.invalidateQueries({ queryKey: ['hunters'] });
    } catch (e) {
      console.error('Failed to unlock ability:', e);
    }
  };

  const handleResolveConflict = async (conflictId) => {
    try {
      await base44.entities.NightLog.create({
        entry: `${hunter.name} resolved conflict: ${TURNED_HUNTER_CONFLICTS.find(c => c.id === conflictId)?.name}`,
        category: 'turned_hunter',
        intensity: 'high'
      });
      queryClient.invalidateQueries();
      setSelectedConflict(null);
    } catch (e) {
      console.error('Failed to resolve conflict:', e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-red-950 to-gray-950 rounded-2xl p-6 max-w-2xl w-full border-2 border-red-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-red-100 mb-1">
              {hunter.name} 🦇
            </h2>
            <p className="text-red-300">Turned Vampire Hunter • Stage {hunter.vampire_stage || 1}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Experience</p>
            <p className="text-red-200 text-lg font-bold">{hunter.experience || 0}</p>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Morale</p>
            <p className="text-purple-200 text-lg font-bold">{hunter.morale || 100}%</p>
          </div>
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Unlocked Abilities</p>
            <p className="text-blue-200 text-lg font-bold">{unlockedAbilities.length}</p>
          </div>
          <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Conflicts</p>
            <p className="text-yellow-200 text-lg font-bold">{TURNED_HUNTER_CONFLICTS.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-red-500/30">
          {[
            { id: 'powers', label: 'Hybrid Powers', icon: Zap },
            { id: 'conflicts', label: 'Conflicts', icon: Target },
            { id: 'bonds', label: 'Double Bonds', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-red-200 border-red-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'powers' && (
              <motion.div
                key="powers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-gray-400 text-sm mb-4">Combine hunter training with vampire powers. Cost: 500 EXP each</p>
                {HYBRID_ABILITIES.map(ability => {
                  const Icon = ability.icon;
                  const isUnlocked = unlockedAbilities.includes(ability.id);
                  return (
                    <motion.div
                      key={ability.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border transition-all ${
                        isUnlocked
                          ? 'bg-green-950/40 border-green-500/50'
                          : 'bg-gray-800/40 border-gray-700/50 hover:border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-1 ${isUnlocked ? 'text-green-400' : 'text-gray-400'}`} />
                          <div>
                            <h4 className="text-white font-bold">{ability.name}</h4>
                            <p className="text-gray-400 text-sm">{ability.description}</p>
                            <p className="text-gray-500 text-xs mt-1 capitalize">Category: {ability.category}</p>
                          </div>
                        </div>
                        {!isUnlocked && (
                          <button
                            onClick={() => handleUnlockAbility(ability.id)}
                            disabled={hunter.experience < 500}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium text-sm whitespace-nowrap transition-colors"
                          >
                            Unlock
                          </button>
                        )}
                        {isUnlocked && (
                          <div className="px-4 py-2 rounded-lg bg-green-600/30 text-green-300 font-medium text-sm">
                            ✓ Unlocked
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'conflicts' && (
              <motion.div
                key="conflicts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-gray-400 text-sm mb-4">Active conflicts from your transformation</p>
                {TURNED_HUNTER_CONFLICTS.map(conflict => (
                  <motion.div
                    key={conflict.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:bg-opacity-50 ${
                      conflict.severity === 'critical'
                        ? 'bg-red-950/40 border-red-500/50'
                        : conflict.severity === 'high'
                        ? 'bg-orange-950/40 border-orange-500/50'
                        : 'bg-yellow-950/40 border-yellow-500/50'
                    }`}
                    onClick={() => setSelectedConflict(conflict)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-bold flex items-center gap-2">
                          {conflict.name}
                          <span className={`text-xs px-2 py-1 rounded ${
                            conflict.severity === 'critical' ? 'bg-red-600/50 text-red-200' :
                            conflict.severity === 'high' ? 'bg-orange-600/50 text-orange-200' :
                            'bg-yellow-600/50 text-yellow-200'
                          }`}>
                            {conflict.severity}
                          </span>
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">{conflict.description}</p>
                      </div>
                      <Zap className="w-5 h-5 text-red-400" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'bonds' && (
              <motion.div
                key="bonds"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-purple-950/40 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="text-purple-200 font-bold mb-2">🦇 Vampire Bonds</h4>
                  <p className="text-gray-400 text-sm">Your sire who turned you. Eternal connection forged.</p>
                  <p className="text-gray-500 text-xs mt-2">Bond Strength: {Math.min(100, (hunter.experience || 0) / 10)}%</p>
                </div>

                <div className="bg-red-950/40 border border-red-500/50 rounded-lg p-4">
                  <h4 className="text-red-200 font-bold mb-2">⚔️ Hunter Bonds</h4>
                  <p className="text-gray-400 text-sm">Former allies. Some want you back, others want you dead.</p>
                  <p className="text-gray-500 text-xs mt-2">Loyalty Risk: {Math.max(0, 100 - (hunter.morale || 100))}%</p>
                </div>

                <div className="bg-blue-950/40 border border-blue-500/50 rounded-lg p-4">
                  <h4 className="text-blue-200 font-bold mb-2">🤝 Double Agent Network</h4>
                  <p className="text-gray-400 text-sm">Manipulate both sides. Information is your greatest weapon.</p>
                  <button
                    onClick={() => {
                      base44.entities.NightLog.create({
                        entry: `${hunter.name} activated double agent network`,
                        category: 'turned_hunter',
                        intensity: 'high'
                      });
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Activate Network
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Conflict Detail Modal */}
      {selectedConflict && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedConflict(null)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-red-500/50"
          >
            <h3 className="text-xl font-bold text-white mb-2">{selectedConflict.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{selectedConflict.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedConflict(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleResolveConflict(selectedConflict.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
              >
                Confront
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}