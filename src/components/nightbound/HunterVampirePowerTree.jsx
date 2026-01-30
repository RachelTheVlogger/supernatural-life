import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Lock, Check, ChevronRight, Star, Droplets, Eye, Brain, Wind, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { TURNED_HUNTER_POWER_PATHS } from './turnedHunterPowersConfig';

const TRAINING_ACTIONS = [
  { id: 'hunt', label: 'Hunt with Sire', power: 5, xp: 15, desc: 'Learn predator instincts' },
  { id: 'feed', label: 'Controlled Feeding', power: 3, xp: 10, desc: 'Don\'t kill the prey' },
  { id: 'speed', label: 'Speed Training', power: 4, xp: 12, desc: 'Blur through shadows' },
  { id: 'strength', label: 'Strength Training', power: 4, xp: 12, desc: 'Break steel bars' },
  { id: 'compulsion', label: 'Practice Compulsion', power: 6, xp: 18, desc: 'Bend human minds' },
  { id: 'meditate', label: 'Meditate on Power', power: 3, xp: 8, desc: 'Connect with vampire nature' },
  { id: 'spar', label: 'Spar with Sire', power: 7, xp: 20, desc: 'Combat training', special: 'Bond required: 50%' }
];

export default function HunterVampirePowerTree({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState(null);
  const [unlocking, setUnlocking] = useState(null);
  const [view, setView] = useState('overview'); // 'overview', 'training'
  const [training, setTraining] = useState(false);
  const [outcome, setOutcome] = useState('');

  const stage = hunter.vampire_stage || 1;
  const power = hunter.vampire_power_level || 0;
  const xp = hunter.experience || 0;
  const nights = hunter.nights_as_vampire || 0;
  const unlockedPowers = hunter.unlocked_powers || [];

  const canUnlock = (powerItem) => {
    if (unlockedPowers.includes(powerItem.name)) return false;
    
    const reqs = powerItem.requirements;
    if (reqs.prerequisite && !unlockedPowers.includes(reqs.prerequisite)) return false;
    
    return true;
  };

  const handleUnlock = async (powerItem) => {
    if (!canUnlock(powerItem)) return;
    
    setUnlocking(powerItem.name);
    setTimeout(async () => {
      try {
        const updatedPowers = [...unlockedPowers, powerItem.name];
        await base44.entities.Hunter.update(hunter.id, {
          unlocked_powers: updatedPowers
        });
        
        await base44.entities.NightLog.create({
          entry: `${hunter.name} awakened: ${powerItem.name}. ${powerItem.description}`,
          category: 'power',
          intensity: 'significant'
        });
        
        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Power unlock failed:', e);
      } finally {
        setUnlocking(null);
      }
    }, 2000);
  };

  const handleTrain = async (action) => {
    setTraining(true);

    setTimeout(async () => {
      const newPower = power + action.power;
      const newXp = xp + action.xp;
      const newNights = nights + 1;

      let newStage = stage;
      if (newPower >= 25 && stage === 1) newStage = 2;
      if (newPower >= 50 && stage === 2) newStage = 3;
      if (newPower >= 75 && stage === 3) newStage = 4;

      await base44.entities.Hunter.update(hunter.id, {
        vampire_power_level: newPower,
        vampire_stage: newStage,
        nights_as_vampire: newNights,
        experience: newXp
      });

      const messages = {
        hunt: ['Blood on your lips. The prey escaped. Control improving.', 'You moved like shadow. Like death. Natural predator.', 'The hunt sang in your veins. You are vampire.'],
        feed: ['Stopped before death. Control absolute. Your sire proud.', 'The human lives. Dazed. You grow stronger.', 'Perfect control. No deaths. No witnesses.'],
        speed: ['You blurred. Faster than sight. World a smear of color.', 'Speed beyond human. The night your playground.', 'Moved between heartbeats. Impossible speed.'],
        strength: ['Steel bent. Concrete cracked. Power incarnate.', 'Strength beyond mortal limits. Unstoppable.', 'You lifted the impossible. Crushed the unbreakable.'],
        compulsion: ['Their eyes glazed. "Yes." Complete obedience.', 'Mind bent. Will broken. Power absolute.', 'They obeyed without question. Puppet strings invisible.'],
        meditate: ['Connected to ancient power. Vampire within awakening.', 'Felt the centuries of power flowing through you.', 'The vampire inside growing. Merging. One.'],
        spar: ['Your sire tested you. You held your own. Pride in their eyes.', 'Combat like dance. Deadly. Beautiful. Learning fast.', 'Blood and bruises. Both smiling. This is training.']
      };

      let msg = messages[action.id][Math.floor(Math.random() * messages[action.id].length)];

      if (newStage > stage) {
        const stageNames = {
          2: 'Fledgling',
          3: 'Established',
          4: 'Elder'
        };
        msg += `\n\n🎉 Evolved to ${stageNames[newStage]}!`;
      }

      setOutcome(msg);

      await base44.entities.NightLog.create({
        entry: `${hunter.name}: ${msg}`,
        category: 'power',
        intensity: newStage > stage ? 'extreme' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setTraining(false);
        setOutcome('');
        setView('overview');
      }, 4000);
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
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-rose-950 to-red-950 rounded-2xl p-4 sm:p-6 pb-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-rose-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-rose-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-rose-100 mb-2">🩸 Vampire Evolution</h2>
        <p className="text-rose-300 text-xs sm:text-sm mb-4 sm:mb-6">{hunter.name}'s path to power</p>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-black/40 rounded-lg p-2 sm:p-3 border border-rose-500/30">
              <p className="text-rose-400 text-[10px] sm:text-xs">Stage</p>
              <p className="text-rose-100 font-bold text-sm sm:text-lg">
                {stage === 1 ? '🩸 Newborn' : stage === 2 ? '🌙 Fledgling' : stage === 3 ? '⚡ Established' : stage === 4 ? '👑 Elder' : stage === 5 ? '🌟 Ascendant' : stage === 6 ? '∞ Infinite' : '💀 Godlike'}
              </p>
            </div>
          <div className="bg-black/40 rounded-lg p-2 sm:p-3 border border-rose-500/30">
            <p className="text-rose-400 text-[10px] sm:text-xs">Power</p>
            <p className="text-rose-100 font-bold text-sm sm:text-lg">{power}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 sm:p-3 border border-rose-500/30">
            <p className="text-rose-400 text-[10px] sm:text-xs">XP</p>
            <p className="text-rose-100 font-bold text-sm sm:text-lg">{xp}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 sm:p-3 border border-rose-500/30">
            <p className="text-rose-400 text-[10px] sm:text-xs">Nights</p>
            <p className="text-rose-100 font-bold text-sm sm:text-lg">{nights}</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setView('overview')}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${view === 'overview' ? 'bg-rose-600 text-white' : 'bg-black/40 text-rose-300 hover:bg-black/60'}`}
          >
            Powers
          </button>
          <button
            onClick={() => setView('training')}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${view === 'training' ? 'bg-rose-600 text-white' : 'bg-black/40 text-rose-300 hover:bg-black/60'}`}
          >
            Training
          </button>
        </div>

        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 rounded-xl p-8 text-center border border-rose-500/30"
            >
              <p className="text-rose-100 text-lg leading-relaxed whitespace-pre-line">{outcome}</p>
            </motion.div>
          ) : training ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Droplets className="w-12 h-12 text-rose-400 mx-auto" />
              </motion.div>
              <p className="text-rose-300 mt-4">Training...</p>
            </motion.div>
          ) : view === 'training' ? (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRAINING_ACTIONS.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleTrain(action)}
                    className="bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl p-3 sm:p-4 text-left transition-all"
                  >
                    <h4 className="text-rose-100 font-bold mb-1 text-sm sm:text-base">{action.label}</h4>
                    <p className="text-rose-300 text-[10px] sm:text-xs mb-2">{action.desc}</p>
                    <div className="flex gap-2 text-[10px] sm:text-xs">
                      <span className="text-rose-400">+{action.power} Power</span>
                      <span className="text-purple-400">+{action.xp} XP</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : !selectedPath ? (
            <motion.div
              key="paths"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-3 gap-4"
            >
              {Object.entries(TURNED_HUNTER_POWER_PATHS).map(([key, path]) => {
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
            </motion.div>
          ) : (
            <motion.div
              key="tree"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={() => setSelectedPath(null)}
                className="text-rose-300 hover:text-rose-100 text-sm mb-4"
              >
                ← Back to Paths
              </button>

              <div className="space-y-3">
                {TURNED_HUNTER_POWER_PATHS[selectedPath].powers.map((powerItem, i) => {
                  const isUnlocked = unlockedPowers.includes(powerItem.name);
                  const canBeUnlocked = canUnlock(powerItem);
                  const isUnlockingThis = unlocking === powerItem.name;
                  const Icon = TURNED_HUNTER_POWER_PATHS[selectedPath].icon;

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
                      onClick={() => canBeUnlocked && !isUnlocked && handleUnlock(powerItem)}
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
                            <h4 className={`font-bold ${getTierColor(powerItem.tier)}`}>
                              {powerItem.name}
                            </h4>
                            <span className="text-xs text-gray-500">Tier {powerItem.tier}</span>
                          </div>

                          <p className="text-gray-400 text-sm mb-3">{powerItem.description}</p>

                          {!isUnlocked && powerItem.requirements.prerequisite && (
                            <div className="flex flex-wrap gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                unlockedPowers.includes(powerItem.requirements.prerequisite) 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                Requires: {powerItem.requirements.prerequisite}
                              </span>
                            </div>
                          )}

                          {isUnlockingThis && (
                            <p className="text-purple-400 text-sm mt-2">Awakening power...</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}