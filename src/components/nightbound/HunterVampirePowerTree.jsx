import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Lock, Check, ChevronRight, Star, Droplets, Eye, Brain, Wind, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { VAMPIRE_POWERS } from './vampirePowersConfig';

// Icon mapping
const ICON_MAP = {
  Eye,
  Wind,
  Zap,
  Brain,
  Star
};

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
  const [selectedPower, setSelectedPower] = useState(null);
  const [training, setTraining] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [view, setView] = useState('overview'); // 'overview', 'training', 'power'

  const stage = hunter.vampire_stage || 1;
  const power = hunter.vampire_power_level || 0;
  const xp = hunter.experience || 0;
  const nights = hunter.nights_as_vampire || 0;
  const unlockedPowers = hunter.unlocked_powers || [];
  const powerUpgrades = hunter.power_upgrades || {};

  const handleUnlockPower = async (powerData) => {
    if (unlockedPowers.includes(powerData.id)) return;
    
    const newUnlocked = [...unlockedPowers, powerData.id];
    await base44.entities.Hunter.update(hunter.id, {
      unlocked_powers: newUnlocked
    });

    await base44.entities.NightLog.create({
      entry: `${hunter.name} unlocked ${powerData.name}. The power flows through you.`,
      category: 'power',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const canUpgrade = (powerId, upgrade) => {
    if (!unlockedPowers.includes(powerId)) return false;
    if (powerUpgrades[powerId]?.includes(upgrade.id)) return false;
    if (xp < upgrade.cost) return false;
    return true;
  };

  const handleTrain = async (action) => {
    setTraining(true);

    setTimeout(async () => {
      const newPower = Math.min(power + action.power, 100);
      const newXp = xp + action.xp;
      const newNights = nights + 1;

      let newStage = stage;
      if (newPower >= 25 && stage === 1) newStage = 2;
      if (newPower >= 50 && stage === 2) newStage = 3;
      if (newPower >= 75 && stage === 3) newStage = 4;

      const newUnlocked = [...unlockedPowers];
      Object.values(VAMPIRE_POWERS).forEach(p => {
        if (p.power <= newPower && p.stage <= newStage && !newUnlocked.includes(p.id)) {
          newUnlocked.push(p.id);
        }
      });

      await base44.entities.Hunter.update(hunter.id, {
        vampire_power_level: newPower,
        vampire_stage: newStage,
        nights_as_vampire: newNights,
        experience: newXp,
        unlocked_powers: newUnlocked
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
        const stageName = newStage === 2 ? 'Fledgling' : newStage === 3 ? 'Established' : 'Elder';
        msg += `\n\n🎉 Evolved to ${stageName}!`;
      }

      const newPowers = newUnlocked.filter(p => !unlockedPowers.includes(p));
      if (newPowers.length > 0) {
        msg += `\n\n✨ New powers: ${newPowers.map(id => VAMPIRE_POWERS[id]?.name).join(', ')}`;
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

  const handleUpgrade = async (powerId, upgrade) => {
    if (!canUpgrade(powerId, upgrade)) return;

    const newUpgrades = { ...powerUpgrades };
    if (!newUpgrades[powerId]) newUpgrades[powerId] = [];
    newUpgrades[powerId].push(upgrade.id);

    await base44.entities.Hunter.update(hunter.id, {
      experience: xp - upgrade.cost,
      power_upgrades: newUpgrades
    });

    await base44.entities.NightLog.create({
      entry: `${hunter.name} upgraded ${VAMPIRE_POWERS[powerId].name} → ${upgrade.name}. Power refined.`,
      category: 'power',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setSelectedPower(null);
  };

  const PowerCard = ({ powerData }) => {
    const Icon = ICON_MAP[powerData.icon] || Eye;
    const isUnlocked = unlockedPowers.includes(powerData.id);
    const upgrades = powerUpgrades[powerData.id] || [];

    const bgColor = {
      blue: 'bg-blue-950/30 border-blue-500/50',
      cyan: 'bg-cyan-950/30 border-cyan-500/50',
      red: 'bg-red-950/30 border-red-500/50',
      purple: 'bg-purple-950/30 border-purple-500/50',
      indigo: 'bg-indigo-950/30 border-indigo-500/50',
      pink: 'bg-pink-950/30 border-pink-500/50',
      violet: 'bg-violet-950/30 border-violet-500/50',
      gray: 'bg-gray-950/30 border-gray-500/50',
      yellow: 'bg-yellow-950/30 border-yellow-500/50'
    }[powerData.color] || 'bg-purple-950/30 border-purple-500/50';

    const textColor = {
      blue: 'text-blue-400',
      cyan: 'text-cyan-400',
      red: 'text-red-400',
      purple: 'text-purple-400',
      indigo: 'text-indigo-400',
      pink: 'text-pink-400',
      violet: 'text-violet-400',
      gray: 'text-gray-400',
      yellow: 'text-yellow-400'
    }[powerData.color] || 'text-purple-400';

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
          isUnlocked
            ? bgColor
            : 'bg-purple-950/20 border-purple-500/40'
        }`}
        onClick={() => !isUnlocked ? handleUnlockPower(powerData) : setSelectedPower(powerData.id)}
      >
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 ${textColor}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white font-bold">{powerData.name}</h4>
              {isUnlocked && <Check className="w-5 h-5 text-green-400" />}
              {!isUnlocked && !canUnlock && <Lock className="w-5 h-5 text-gray-500" />}
            </div>
            <p className="text-gray-400 text-sm mb-2">{powerData.desc}</p>
            {isUnlocked && upgrades.length > 0 && (
              <div className="flex gap-1">
                {upgrades.map(uid => (
                  <span key={uid} className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">
                    {powerData.upgrades.find(u => u.id === uid)?.name}
                  </span>
                ))}
              </div>
            )}
            {!isUnlocked && (
              <span className="text-xs text-purple-300 font-medium">Click to unlock</span>
            )}
          </div>
        </div>
      </motion.div>
    );
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
        className="bg-gradient-to-br from-rose-950 to-red-950 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-rose-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-rose-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold text-rose-100 mb-2">🩸 Vampire Evolution</h2>
        <p className="text-rose-300 text-sm mb-6">{hunter.name}'s path to power</p>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-black/40 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">Stage</p>
            <p className="text-rose-100 font-bold text-lg">
              {stage === 1 ? '🩸 Newborn' : stage === 2 ? '🌙 Fledgling' : stage === 3 ? '⚡ Established' : '👑 Elder'}
            </p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">Power</p>
            <p className="text-rose-100 font-bold text-lg">{power}/100</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">XP</p>
            <p className="text-rose-100 font-bold text-lg">{xp}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">Nights</p>
            <p className="text-rose-100 font-bold text-lg">{nights}</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded-lg transition-all ${view === 'overview' ? 'bg-rose-600 text-white' : 'bg-black/40 text-rose-300 hover:bg-black/60'}`}
          >
            Powers
          </button>
          <button
            onClick={() => setView('training')}
            className={`px-4 py-2 rounded-lg transition-all ${view === 'training' ? 'bg-rose-600 text-white' : 'bg-black/40 text-rose-300 hover:bg-black/60'}`}
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
              <div className="grid grid-cols-2 gap-3">
                {TRAINING_ACTIONS.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleTrain(action)}
                    className="bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl p-4 text-left transition-all"
                  >
                    <h4 className="text-rose-100 font-bold mb-1">{action.label}</h4>
                    <p className="text-rose-300 text-xs mb-2">{action.desc}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-rose-400">+{action.power} Power</span>
                      <span className="text-purple-400">+{action.xp} XP</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : selectedPower ? (
            <motion.div
              key="upgrade"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setSelectedPower(null)}
                className="text-rose-300 hover:text-rose-100 mb-4 text-sm"
              >
                ← Back
              </button>
              <div className="bg-black/40 rounded-xl p-6 border border-rose-500/30 mb-4">
                <h3 className="text-2xl font-bold text-rose-100 mb-2">{VAMPIRE_POWERS[selectedPower].name}</h3>
                <p className="text-rose-300 mb-4">{VAMPIRE_POWERS[selectedPower].desc}</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-rose-900/50 text-rose-300 px-3 py-1 rounded">Tier {VAMPIRE_POWERS[selectedPower].tier}</span>
                  <span className="text-xs bg-rose-900/50 text-rose-300 px-3 py-1 rounded">Stage {VAMPIRE_POWERS[selectedPower].stage}</span>
                </div>
              </div>
              <h4 className="text-rose-200 font-bold mb-3">Upgrade Paths</h4>
              <div className="space-y-3">
                {VAMPIRE_POWERS[selectedPower].upgrades.map(upgrade => {
                  const isUnlocked = powerUpgrades[selectedPower]?.includes(upgrade.id);
                  const canBuy = canUpgrade(selectedPower, upgrade);

                  return (
                    <div
                      key={upgrade.id}
                      className={`border-2 rounded-xl p-4 ${
                        isUnlocked
                          ? 'bg-green-950/30 border-green-500/50'
                          : canBuy
                          ? 'bg-purple-950/20 border-purple-500/40 cursor-pointer hover:bg-purple-950/30'
                          : 'bg-gray-900/40 border-gray-700/30 opacity-60'
                      }`}
                      onClick={() => canBuy && handleUpgrade(selectedPower, upgrade)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-white font-bold mb-1">{upgrade.name}</h5>
                          <p className="text-gray-400 text-sm">{upgrade.desc}</p>
                        </div>
                        {isUnlocked ? (
                          <Check className="w-6 h-6 text-green-400" />
                        ) : (
                          <span className={`text-sm px-3 py-1 rounded ${xp >= upgrade.cost ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
                            {upgrade.cost} XP
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-rose-200 font-bold mb-3">Tier 1 - Newborn Powers</h3>
                <div className="grid gap-3">
                  {Object.values(VAMPIRE_POWERS).filter(p => p.tier === 1).map(p => (
                    <PowerCard key={p.id} powerData={p} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-rose-200 font-bold mb-3">Tier 2 - Fledgling Powers</h3>
                <div className="grid gap-3">
                  {Object.values(VAMPIRE_POWERS).filter(p => p.tier === 2).map(p => (
                    <PowerCard key={p.id} powerData={p} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-rose-200 font-bold mb-3">Tier 3 - Established Powers</h3>
                <div className="grid gap-3">
                  {Object.values(VAMPIRE_POWERS).filter(p => p.tier === 3).map(p => (
                    <PowerCard key={p.id} powerData={p} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-rose-200 font-bold mb-3">Tier 4 - Elder Powers</h3>
                <div className="grid gap-3">
                  {Object.values(VAMPIRE_POWERS).filter(p => p.tier === 4).map(p => (
                    <PowerCard key={p.id} powerData={p} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}