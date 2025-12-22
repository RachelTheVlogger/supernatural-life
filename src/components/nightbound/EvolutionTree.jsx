import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Zap, Eye, Brain, Shield, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const POWER_PATHS = {
  persuasion: {
    name: 'Path of Persuasion',
    icon: Brain,
    color: 'purple',
    description: 'Master the minds of mortals',
    powers: [
      {
        name: 'Subtle Influence',
        description: 'Plant thoughts that feel like their own',
        requirements: { nights: 5, relationship: 20 },
        tier: 1
      },
      {
        name: 'Commanding Presence',
        description: 'Your words carry unnatural weight',
        requirements: { nights: 15, relationship: 40, prerequisite: 'Subtle Influence' },
        tier: 2
      },
      {
        name: 'Mass Compulsion',
        description: 'Bend multiple minds at once',
        requirements: { nights: 30, relationship: 70, servants: 3, prerequisite: 'Commanding Presence' },
        tier: 3
      },
      {
        name: 'Perfect Thrall',
        description: 'Create servants who cannot disobey',
        requirements: { nights: 50, relationship: 90, turned: 1, prerequisite: 'Mass Compulsion' },
        tier: 4
      }
    ]
  },
  stealth: {
    name: 'Path of Shadow',
    icon: Eye,
    color: 'blue',
    description: 'Become invisible to mortal eyes',
    powers: [
      {
        name: 'Mist Form',
        description: 'Dissolve into fog',
        requirements: { nights: 8, hunts: 5 },
        tier: 1
      },
      {
        name: 'Silent Movement',
        description: 'Your footsteps make no sound',
        requirements: { nights: 18, hunts: 12, prerequisite: 'Mist Form' },
        tier: 2
      },
      {
        name: 'Veil of Darkness',
        description: 'Bend shadows around yourself',
        requirements: { nights: 35, hunts: 25, prerequisite: 'Silent Movement' },
        tier: 3
      },
      {
        name: 'Phantom Walk',
        description: 'Phase through solid matter',
        requirements: { nights: 60, hunts: 40, powers: 8, prerequisite: 'Veil of Darkness' },
        tier: 4
      }
    ]
  },
  control: {
    name: 'Path of Domination',
    icon: Shield,
    color: 'red',
    description: 'Command absolute obedience',
    powers: [
      {
        name: 'Blood Bond',
        description: 'Create unbreakable loyalty through feeding',
        requirements: { nights: 10, feeds: 8 },
        tier: 1
      },
      {
        name: 'Servant Network',
        description: 'Your servants can sense each other',
        requirements: { nights: 20, servants: 3, prerequisite: 'Blood Bond' },
        tier: 2
      },
      {
        name: 'Shared Senses',
        description: 'See through your servants\' eyes',
        requirements: { nights: 40, servants: 4, relationship: 60, prerequisite: 'Servant Network' },
        tier: 3
      },
      {
        name: 'Hive Mind',
        description: 'All your servants act as one',
        requirements: { nights: 70, turned: 2, relationship: 85, prerequisite: 'Shared Senses' },
        tier: 4
      }
    ]
  },
  power: {
    name: 'Path of Might',
    icon: Zap,
    color: 'yellow',
    description: 'Transcend mortal limitations',
    powers: [
      {
        name: 'Heightened Reflexes',
        description: 'Move faster than mortal eyes can follow',
        requirements: { nights: 7, hunts: 8 },
        tier: 1
      },
      {
        name: 'Supernatural Strength',
        description: 'Bend steel with your hands',
        requirements: { nights: 22, hunts: 15, prerequisite: 'Heightened Reflexes' },
        tier: 2
      },
      {
        name: 'Regeneration',
        description: 'Wounds close in moments',
        requirements: { nights: 45, feeds: 30, prerequisite: 'Supernatural Strength' },
        tier: 3
      },
      {
        name: 'Ancient Form',
        description: 'Transform into a creature of nightmare',
        requirements: { nights: 80, turned: 3, powers: 12, prerequisite: 'Regeneration' },
        tier: 4
      }
    ]
  }
};

export default function EvolutionTree({ vampireState, servants, onClose }) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [unlocking, setUnlocking] = useState(null);
  const queryClient = useQueryClient();
  
  const calculateStats = () => {
    const totalRelationship = servants.reduce((sum, s) => sum + (s.relationship || 0), 0);
    const avgRelationship = servants.length > 0 ? Math.round(totalRelationship / servants.length) : 0;
    const turnedCount = servants.filter(s => s.is_turned).length;
    
    return {
      nights: vampireState.nights_passed || 0,
      servants: servants.length,
      relationship: avgRelationship,
      turned: turnedCount,
      powers: vampireState.unlocked_powers?.length || 0,
      hunts: 0, // Would need to track this
      feeds: 0  // Would need to track this
    };
  };
  
  const stats = calculateStats();
  const unlockedPowers = vampireState.unlocked_powers || [];
  
  const canUnlock = (power) => {
    if (unlockedPowers.includes(power.name)) return false;
    
    const reqs = power.requirements;
    if (reqs.prerequisite && !unlockedPowers.includes(reqs.prerequisite)) return false;
    
    return (
      (!reqs.nights || stats.nights >= reqs.nights) &&
      (!reqs.servants || stats.servants >= reqs.servants) &&
      (!reqs.relationship || stats.relationship >= reqs.relationship) &&
      (!reqs.turned || stats.turned >= reqs.turned) &&
      (!reqs.powers || stats.powers >= reqs.powers) &&
      (!reqs.hunts || stats.hunts >= reqs.hunts) &&
      (!reqs.feeds || stats.feeds >= reqs.feeds)
    );
  };
  
  const handleUnlock = async (power) => {
    if (!canUnlock(power)) return;
    
    setUnlocking(power.name);
    setTimeout(async () => {
      const updatedPowers = [...unlockedPowers, power.name];
      await base44.entities.VampireState.update(vampireState.id, {
        unlocked_powers: updatedPowers
      });
      
      await base44.entities.NightLog.create({
        entry: `Power awakened: ${power.name}. ${power.description}`,
        category: 'power',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      setUnlocking(null);
    }, 2000);
  };
  
  const getTierColor = (tier) => {
    const colors = ['text-gray-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-red-400'];
    return colors[tier] || colors[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-3xl font-bold text-white mb-2">Evolution Paths</h2>
        <p className="text-gray-400 text-sm mb-6">Choose your path. Become what you were meant to be.</p>
        
        {/* Stats Bar */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
          <div>
            <p className="text-gray-400 text-xs">Nights</p>
            <p className="text-white font-bold">{stats.nights}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Servants</p>
            <p className="text-white font-bold">{stats.servants}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Avg Bond</p>
            <p className="text-white font-bold">{stats.relationship}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Turned</p>
            <p className="text-white font-bold">{stats.turned}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Powers</p>
            <p className="text-white font-bold">{stats.powers}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Total</p>
            <p className="text-purple-400 font-bold">{unlockedPowers.length}</p>
          </div>
        </div>
        
        {!selectedPath ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(POWER_PATHS).map(([key, path]) => {
              const Icon = path.icon;
              const pathPowers = path.powers.filter(p => unlockedPowers.includes(p.name));
              const progress = (pathPowers.length / path.powers.length) * 100;
              
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPath(key)}
                  className={`bg-${path.color}-950/20 border border-${path.color}-800/50 rounded-xl p-6 text-left transition-all hover:bg-${path.color}-950/30`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`w-8 h-8 text-${path.color}-400`} />
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">{path.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{path.description}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div
                            style={{ width: `${progress}%` }}
                            className={`h-2 rounded-full bg-${path.color}-500`}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{pathPowers.length}/{path.powers.length}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ChevronRight className="w-3 h-3" />
                        <span>View Tree</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedPath(null)}
              className="text-gray-400 hover:text-white text-sm mb-4 transition-colors"
            >
              ← Back to Paths
            </button>
            
            <div className="space-y-3">
              {POWER_PATHS[selectedPath].powers.map((power, i) => {
                const isUnlocked = unlockedPowers.includes(power.name);
                const canBeUnlocked = canUnlock(power);
                const isUnlocking = unlocking === power.name;
                const Icon = POWER_PATHS[selectedPath].icon;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border rounded-xl p-4 ${
                      isUnlocked 
                        ? 'bg-green-950/20 border-green-800/50' 
                        : canBeUnlocked 
                        ? 'bg-purple-950/20 border-purple-800/50 cursor-pointer hover:bg-purple-950/30' 
                        : 'bg-gray-800/20 border-gray-700/50 opacity-60'
                    }`}
                    onClick={() => canBeUnlocked && !isUnlocked && handleUnlock(power)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {isUnlocked ? (
                          <Check className="w-6 h-6 text-green-400" />
                        ) : canBeUnlocked ? (
                          <Icon className="w-6 h-6 text-purple-400" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-bold ${getTierColor(power.tier)}`}>
                            {power.name}
                          </h4>
                          <span className="text-xs text-gray-500">Tier {power.tier}</span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3">{power.description}</p>
                        
                        {!isUnlocked && (
                          <div className="flex flex-wrap gap-2">
                            {power.requirements.nights && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                stats.nights >= power.requirements.nights 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {stats.nights}/{power.requirements.nights} nights
                              </span>
                            )}
                            {power.requirements.servants && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                stats.servants >= power.requirements.servants 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {stats.servants}/{power.requirements.servants} servants
                              </span>
                            )}
                            {power.requirements.relationship && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                stats.relationship >= power.requirements.relationship 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {stats.relationship}/{power.requirements.relationship} bond
                              </span>
                            )}
                            {power.requirements.turned && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                stats.turned >= power.requirements.turned 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {stats.turned}/{power.requirements.turned} turned
                              </span>
                            )}
                            {power.requirements.prerequisite && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                unlockedPowers.includes(power.requirements.prerequisite) 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                Requires: {power.requirements.prerequisite}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {isUnlocking && (
                          <p className="text-purple-400 text-sm mt-2">Awakening power...</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}