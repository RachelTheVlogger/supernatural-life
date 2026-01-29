import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Check, Zap, Eye, Brain, Shield, Heart, Droplets, Moon, Wind, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HUNTER_VAMPIRE_PATHS = {
  hybrid: {
    name: 'Hybrid Path',
    icon: Zap,
    color: 'red',
    description: 'Blend hunter skills with vampire powers',
    powers: [
      { name: 'Enhanced Combat', desc: 'Combine speed with hunter precision', xp: 50, tier: 1 },
      { name: 'Tactical Compulsion', desc: 'Use vampire influence in fights', xp: 60, tier: 1 },
      { name: 'Daywalker Training', desc: 'Resist sunlight weakness', xp: 100, tier: 2, prerequisite: 'Enhanced Combat' },
      { name: 'Blood Tracker', desc: 'Sense vampires by their blood', xp: 80, tier: 2, prerequisite: 'Tactical Compulsion' },
      { name: 'Hybrid Supremacy', desc: 'Master of both worlds', xp: 200, tier: 3, prerequisite: 'Daywalker Training' }
    ]
  },
  power: {
    name: 'Path of Might',
    icon: Zap,
    color: 'yellow',
    description: 'Raw physical dominance',
    powers: [
      { name: 'Heightened Speed', desc: 'Move faster than the eye can follow', xp: 40, tier: 1 },
      { name: 'Heightened Strength', desc: 'Possess superhuman strength', xp: 40, tier: 1 },
      { name: 'Supernatural Reflexes', desc: 'Dodge attacks effortlessly', xp: 70, tier: 2, prerequisite: 'Heightened Speed' },
      { name: 'Regeneration', desc: 'Heal wounds rapidly', xp: 100, tier: 2, prerequisite: 'Heightened Strength' },
      { name: 'Ancient Form', desc: 'Transform into nightmare creature', xp: 150, tier: 3, prerequisite: 'Regeneration' }
    ]
  },
  mind: {
    name: 'Path of Persuasion',
    icon: Brain,
    color: 'purple',
    description: 'Master minds and wills',
    powers: [
      { name: 'Compulsion', desc: 'Force your will upon others', xp: 50, tier: 1 },
      { name: 'Emotional Imprint', desc: 'Plant feelings in their mind', xp: 60, tier: 1 },
      { name: 'Dream Walking', desc: 'Enter and manipulate dreams', xp: 80, tier: 2, prerequisite: 'Compulsion' },
      { name: 'Mind Reading', desc: 'Hear their thoughts clearly', xp: 90, tier: 2, prerequisite: 'Emotional Imprint' },
      { name: 'Mass Compulsion', desc: 'Control multiple minds at once', xp: 120, tier: 3, prerequisite: 'Mind Reading' },
      { name: 'Perfect Thrall', desc: 'Create unbreakable servants', xp: 180, tier: 4, prerequisite: 'Mass Compulsion' }
    ]
  },
  shadow: {
    name: 'Path of Shadow',
    icon: Eye,
    color: 'blue',
    description: 'Become invisible to all',
    powers: [
      { name: 'Night Sight', desc: 'See perfectly in darkness', xp: 40, tier: 1 },
      { name: 'Heightened Hearing', desc: 'Hear whispers from miles away', xp: 30, tier: 1 },
      { name: 'Mist Form', desc: 'Dissolve into fog', xp: 70, tier: 2, prerequisite: 'Night Sight' },
      { name: 'Silent Movement', desc: 'Your footsteps make no sound', xp: 60, tier: 2, prerequisite: 'Heightened Hearing' },
      { name: 'Veil of Darkness', desc: 'Bend shadows around yourself', xp: 100, tier: 3, prerequisite: 'Mist Form' },
      { name: 'Phantom Walk', desc: 'Phase through solid matter', xp: 150, tier: 4, prerequisite: 'Veil of Darkness' }
    ]
  },
  blood: {
    name: 'Path of Blood',
    icon: Droplets,
    color: 'crimson',
    description: 'Master blood magic',
    powers: [
      { name: 'Blood Memory', desc: 'Read memories through blood', xp: 70, tier: 1 },
      { name: 'Blood Scrying', desc: 'See through blood connections', xp: 60, tier: 1 },
      { name: 'Crimson Chains', desc: 'Create binding contracts in blood', xp: 90, tier: 2, prerequisite: 'Blood Scrying' },
      { name: 'Blood Puppetry', desc: 'Control bodies through their blood', xp: 120, tier: 3, prerequisite: 'Crimson Chains' },
      { name: 'Hemomancy', desc: 'Shape blood into weapons', xp: 160, tier: 4, prerequisite: 'Blood Puppetry' }
    ]
  },
  seduction: {
    name: 'Path of Seduction',
    icon: Heart,
    color: 'pink',
    description: 'Master desire and pleasure',
    powers: [
      { name: 'Intoxicating Presence', desc: 'Your scent becomes irresistible', xp: 50, tier: 1 },
      { name: 'Euphoric Touch', desc: 'Your touch brings overwhelming pleasure', xp: 60, tier: 2, prerequisite: 'Intoxicating Presence' },
      { name: 'Vampiric Glamour', desc: 'Appear as their deepest fantasy', xp: 90, tier: 3, prerequisite: 'Euphoric Touch' },
      { name: 'Ecstasy Bond', desc: 'Link pleasure directly to obedience', xp: 130, tier: 4, prerequisite: 'Vampiric Glamour' }
    ]
  },
  control: {
    name: 'Path of Domination',
    icon: Shield,
    color: 'red',
    description: 'Command absolute obedience',
    powers: [
      { name: 'Blood Bond', desc: 'Create unbreakable loyalty through feeding', xp: 60, tier: 1 },
      { name: 'Servant Network', desc: 'Your servants can sense each other', xp: 80, tier: 2, prerequisite: 'Blood Bond' },
      { name: 'Shared Senses', desc: 'See through your servants\' eyes', xp: 110, tier: 3, prerequisite: 'Servant Network' },
      { name: 'Hive Mind', desc: 'All your servants act as one', xp: 150, tier: 4, prerequisite: 'Shared Senses' }
    ]
  },
  immortal: {
    name: 'Path of Eternity',
    icon: Moon,
    color: 'gold',
    description: 'Transcend vampire limitations',
    powers: [
      { name: 'Twilight Resistance', desc: 'Endure dawn and dusk', xp: 80, tier: 1 },
      { name: 'Daywalker', desc: 'Move freely in sunlight', xp: 120, tier: 2, prerequisite: 'Twilight Resistance' },
      { name: 'Ageless', desc: 'Time cannot touch you', xp: 150, tier: 3, prerequisite: 'Daywalker' },
      { name: 'Immortal Ascension', desc: 'Become truly deathless', xp: 200, tier: 4, prerequisite: 'Ageless' }
    ]
  }
};

export default function HunterVampirePowerTree({ hunter, onClose }) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [unlocking, setUnlocking] = useState(null);
  const queryClient = useQueryClient();

  if (!hunter) return null;

  const unlockedPowers = hunter.unlocked_powers || [];
  const experience = hunter.experience || 0;

  const canUnlock = (power) => {
    if (unlockedPowers.includes(power.name)) return false;
    if (experience < power.xp) return false;
    if (power.prerequisite && !unlockedPowers.includes(power.prerequisite)) return false;
    return true;
  };

  const handleUnlock = async (power) => {
    if (!canUnlock(power)) return;

    setUnlocking(power.name);
    setTimeout(async () => {
      try {
        await base44.entities.Hunter.update(hunter.id, {
          experience: experience - power.xp,
          unlocked_powers: [...unlockedPowers, power.name],
          vampire_power_level: Math.min(100, (hunter.vampire_power_level || 0) + 5)
        });

        await base44.entities.NightLog.create({
          entry: `${hunter.name} unlocked ${power.name}. The vampire within grows stronger.`,
          category: 'power',
          intensity: 'significant'
        });

        queryClient.invalidateQueries(['hunters']);
      } catch (e) {
        console.error('Power unlock failed:', e);
      } finally {
        setUnlocking(null);
      }
    }, 1500);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">Vampire Evolution Paths</h2>
        <p className="text-gray-400 text-sm mb-6">Choose your path as a turned hunter-vampire.</p>

        {/* Stats Bar */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-gray-400 text-xs">Experience</p>
            <p className="text-white font-bold">{experience} XP</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Vampire Stage</p>
            <p className="text-white font-bold">{hunter.vampire_stage || 1}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Power Level</p>
            <p className="text-purple-400 font-bold">{hunter.vampire_power_level || 0}/100</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Powers</p>
            <p className="text-red-400 font-bold">{unlockedPowers.length}</p>
          </div>
        </div>

        {!selectedPath ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(HUNTER_VAMPIRE_PATHS).map(([key, path]) => {
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
              {HUNTER_VAMPIRE_PATHS[selectedPath].powers.map((power, i) => {
                const isUnlocked = unlockedPowers.includes(power.name);
                const canBeUnlocked = canUnlock(power);
                const isUnlocking = unlocking === power.name;
                const Icon = HUNTER_VAMPIRE_PATHS[selectedPath].icon;

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

                        <p className="text-gray-400 text-sm mb-3">{power.desc}</p>

                        {!isUnlocked && (
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              experience >= power.xp
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-gray-800 text-gray-400'
                            }`}>
                              {power.xp} XP
                            </span>
                            {power.prerequisite && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                unlockedPowers.includes(power.prerequisite)
                                  ? 'bg-green-900/50 text-green-300'
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                Requires: {power.prerequisite}
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