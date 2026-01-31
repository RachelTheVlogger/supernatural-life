import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Zap, Target, Wind, Shield, Flame, Eye, Users, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const WEREWOLF_ABILITIES = [
  // Tier 1 - Basic (unlocked at start or low requirements)
  {
    id: 'primal_howl',
    name: 'Primal Howl',
    icon: Wind,
    tier: 1,
    description: 'Unleash a terrifying howl that intimidates enemies and rallies pack members',
    rageCost: 20,
    cooldown: 2,
    effect: 'Frightens nearby enemies, +10% pack strength for 3 turns',
    unlockReq: { transformationControl: 0, nightsAsWolf: 0 }
  },
  {
    id: 'feral_rush',
    name: 'Feral Rush',
    icon: Target,
    tier: 1,
    description: 'Burst of supernatural speed to close distance with prey',
    rageCost: 15,
    cooldown: 1,
    effect: 'Instantly move to target location, next attack deals +50% damage',
    unlockReq: { transformationControl: 10, nightsAsWolf: 3 }
  },
  {
    id: 'blood_scent',
    name: 'Blood Scent',
    icon: Eye,
    tier: 1,
    description: 'Track wounded prey across vast distances',
    rageCost: 10,
    cooldown: 1,
    effect: 'Reveals all injured targets within territory, +20% hunting success',
    unlockReq: { transformationControl: 15, nightsAsWolf: 5 }
  },

  // Tier 2 - Intermediate
  {
    id: 'savage_leap',
    name: 'Savage Leap',
    icon: Zap,
    tier: 2,
    description: 'Launch yourself at enemies from incredible distances',
    rageCost: 30,
    cooldown: 3,
    effect: 'Jump attack dealing massive damage, stuns target for 1 turn',
    unlockReq: { transformationControl: 30, nightsAsWolf: 10, prerequisite: 'feral_rush' }
  },
  {
    id: 'pack_leader',
    name: 'Pack Leader',
    icon: Users,
    tier: 2,
    description: 'Inspire your pack with alpha presence',
    rageCost: 25,
    cooldown: 4,
    effect: 'All pack members gain +30% damage and +20% control for 5 turns',
    unlockReq: { transformationControl: 40, nightsAsWolf: 15, packRank: 'alpha' }
  },
  {
    id: 'regeneration',
    name: 'Lunar Regeneration',
    icon: Shield,
    tier: 2,
    description: 'Channel moon\'s power to heal rapidly',
    rageCost: 35,
    cooldown: 5,
    effect: 'Restore 50% health, cure wounds. Enhanced during full moon',
    unlockReq: { transformationControl: 35, nightsAsWolf: 12, humanity: 40 }
  },

  // Tier 3 - Advanced
  {
    id: 'berserker_rage',
    name: 'Berserker Rage',
    icon: Flame,
    tier: 3,
    description: 'Embrace pure bestial fury, losing control for devastating power',
    rageCost: 50,
    cooldown: 6,
    effect: '+100% damage, +50% speed, -50% control for 3 turns. Cannot cancel early',
    unlockReq: { transformationControl: 50, nightsAsWolf: 25, beastRage: 70 }
  },
  {
    id: 'alpha_dominance',
    name: 'Alpha Dominance',
    icon: Skull,
    tier: 3,
    description: 'Assert absolute dominance over all nearby werewolves',
    rageCost: 60,
    cooldown: 8,
    effect: 'Force enemy werewolves to submit. Pack members become fearless',
    unlockReq: { transformationControl: 60, nightsAsWolf: 30, packRank: 'alpha', kills: 20 }
  },
  {
    id: 'moonlight_blessing',
    name: 'Moonlight Blessing',
    icon: Shield,
    tier: 3,
    description: 'Temporarily resist the curse, maintaining human mind in wolf form',
    rageCost: 40,
    cooldown: 7,
    effect: 'Perfect control for 5 turns. Use vampire-like compulsion while in wolf form',
    unlockReq: { transformationControl: 70, nightsAsWolf: 35, humanity: 60 }
  },

  // Tier 4 - Master
  {
    id: 'apex_predator',
    name: 'Apex Predator',
    icon: Skull,
    tier: 4,
    description: 'Become the ultimate hunter - nothing escapes',
    rageCost: 80,
    cooldown: 10,
    effect: 'Guarantees successful hunt. Instant kill on wounded prey. Fear aura',
    unlockReq: { transformationControl: 80, nightsAsWolf: 50, kills: 50 }
  },
  {
    id: 'werewolf_king',
    name: 'Werewolf King',
    icon: Users,
    tier: 4,
    description: 'Command all werewolves in your territory as the undisputed ruler',
    rageCost: 100,
    cooldown: 12,
    effect: 'All werewolves in territory obey you. Form temporary alliances',
    unlockReq: { transformationControl: 90, nightsAsWolf: 60, packRank: 'alpha', territorySize: 50 }
  }
];

export default function WerewolfAbilities({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [using, setUsing] = useState(null);
  const [outcome, setOutcome] = useState('');

  const unlockedAbilities = werewolf.unlocked_powers || ['primal_howl'];
  const abilityCooldowns = werewolf.ability_cooldowns || {};

  const canUnlock = (ability) => {
    if (unlockedAbilities.includes(ability.id)) return false;

    const req = ability.unlockReq;
    if (req.prerequisite && !unlockedAbilities.includes(req.prerequisite)) return false;
    if (req.transformationControl && werewolf.transformation_control < req.transformationControl) return false;
    if (req.nightsAsWolf && (werewolf.nights_as_wolf || 0) < req.nightsAsWolf) return false;
    if (req.beastRage && werewolf.beast_rage < req.beastRage) return false;
    if (req.humanity && werewolf.humanity < req.humanity) return false;
    if (req.packRank && werewolf.pack_rank !== req.packRank) return false;
    if (req.kills && (werewolf.kills_in_wolf_form || 0) < req.kills) return false;
    if (req.territorySize && (werewolf.territory_size || 0) < req.territorySize) return false;

    return true;
  };

  const canUse = (ability) => {
    if (!unlockedAbilities.includes(ability.id)) return false;
    if (werewolf.beast_rage < ability.rageCost) return false;
    if (abilityCooldowns[ability.id] && abilityCooldowns[ability.id] > 0) return false;
    return true;
  };

  const handleUnlock = async (ability) => {
    if (!canUnlock(ability)) return;

    try {
      await base44.entities.Werewolf.update(werewolf.id, {
        unlocked_powers: [...unlockedAbilities, ability.id]
      });

      await base44.entities.NightLog.create({
        entry: `${werewolf.name} unlocked: ${ability.name}. ${ability.description}`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to unlock ability:', e);
    }
  };

  const handleUse = async (ability) => {
    if (!canUse(ability)) return;

    setUsing(ability.id);

    setTimeout(async () => {
      const newRage = Math.max(0, werewolf.beast_rage - ability.rageCost);
      const newCooldowns = { ...abilityCooldowns, [ability.id]: ability.cooldown };

      await base44.entities.Werewolf.update(werewolf.id, {
        beast_rage: newRage,
        ability_cooldowns: newCooldowns
      });

      const outcomes = {
        primal_howl: 'Your howl echoed for miles. Lesser creatures fled. Pack felt your presence.',
        feral_rush: 'You moved faster than sight. Prey couldn\'t react. Devastation.',
        blood_scent: 'Every wounded creature revealed. Their fear, your compass.',
        savage_leap: 'You soared through air. Impact crushed bones. Prey didn\'t stand.',
        pack_leader: 'The pack felt your will. United. Unstoppable. Your command absolute.',
        regeneration: 'Moonlight knit flesh. Wounds closed. The curse has benefits.',
        berserker_rage: 'Control shattered. Pure rage unleashed. Blood. Everywhere. Blood.',
        alpha_dominance: 'Other werewolves submitted. Throats bared. You are king.',
        moonlight_blessing: 'Human mind in wolf body. Perfect synthesis. You are both.',
        apex_predator: 'No escape. No mercy. You are death incarnate.',
        werewolf_king: 'Every wolf in territory bent knee. Your reign begins.'
      };

      setOutcome(outcomes[ability.id] || 'Power unleashed.');

      await base44.entities.NightLog.create({
        entry: `${werewolf.name} used ${ability.name}: ${outcomes[ability.id]}`,
        category: 'power',
        intensity: ability.tier >= 3 ? 'extreme' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setUsing(null);
        setOutcome('');
      }, 3000);
    }, 1500);
  };

  const getTierColor = (tier) => {
    return ['text-gray-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-orange-400'][tier] || 'text-gray-400';
  };

  const groupedAbilities = WEREWOLF_ABILITIES.reduce((acc, ability) => {
    if (!acc[ability.tier]) acc[ability.tier] = [];
    acc[ability.tier].push(ability);
    return acc;
  }, {});

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
        className="bg-gradient-to-br from-orange-950 to-gray-950 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-500/50"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-orange-100">🐺 Werewolf Abilities</h2>
            <p className="text-orange-300 text-sm mt-1">Unlock and use supernatural powers</p>
          </div>
          <button onClick={onClose} className="text-orange-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/40 rounded-lg p-3 border border-orange-500/30">
            <p className="text-orange-400 text-xs">Current Rage</p>
            <p className="text-white font-bold text-lg">{werewolf.beast_rage}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-blue-500/30">
            <p className="text-blue-400 text-xs">Control</p>
            <p className="text-white font-bold text-lg">{werewolf.transformation_control}%</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-purple-500/30">
            <p className="text-purple-400 text-xs">Abilities</p>
            <p className="text-white font-bold text-lg">{unlockedAbilities.length}/{WEREWOLF_ABILITIES.length}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 rounded-xl p-8 text-center border border-orange-500/30"
            >
              <p className="text-orange-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          ) : using ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap className="w-12 h-12 text-orange-400 mx-auto" />
              </motion.div>
              <p className="text-orange-300 mt-4">Using ability...</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAbilities).map(([tier, abilities]) => (
                <div key={tier}>
                  <h3 className={`font-bold mb-3 ${getTierColor(parseInt(tier))}`}>
                    Tier {tier} {tier === '1' ? '- Basic' : tier === '2' ? '- Intermediate' : tier === '3' ? '- Advanced' : '- Master'}
                  </h3>
                  <div className="space-y-3">
                    {abilities.map((ability) => {
                      const Icon = ability.icon;
                      const unlocked = unlockedAbilities.includes(ability.id);
                      const canUnlockNow = canUnlock(ability);
                      const canUseNow = canUse(ability);
                      const cooldown = abilityCooldowns[ability.id] || 0;

                      return (
                        <motion.div
                          key={ability.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border rounded-xl p-4 ${
                            unlocked
                              ? 'bg-green-950/20 border-green-800/50'
                              : canUnlockNow
                              ? 'bg-orange-950/20 border-orange-800/50 cursor-pointer hover:bg-orange-950/30'
                              : 'bg-gray-800/20 border-gray-700/50 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {unlocked ? (
                                <Check className="w-6 h-6 text-green-400" />
                              ) : canUnlockNow ? (
                                <Icon className="w-6 h-6 text-orange-400" />
                              ) : (
                                <Lock className="w-6 h-6 text-gray-500" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-bold ${getTierColor(ability.tier)}`}>
                                  {ability.name}
                                </h4>
                              </div>

                              <p className="text-gray-400 text-sm mb-2">{ability.description}</p>
                              <p className="text-blue-300 text-xs mb-3">Effect: {ability.effect}</p>

                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 rounded bg-red-900/50 text-red-300">
                                  Cost: {ability.rageCost} Rage
                                </span>
                                <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-300">
                                  Cooldown: {ability.cooldown} turns
                                </span>
                                {cooldown > 0 && (
                                  <span className="px-2 py-1 rounded bg-gray-900/50 text-gray-300">
                                    Ready in: {cooldown} turns
                                  </span>
                                )}
                              </div>

                              {!unlocked && (
                                <div className="mt-3 text-xs text-gray-500">
                                  Requirements:
                                  {ability.unlockReq.transformationControl && (
                                    <span className={`ml-2 ${werewolf.transformation_control >= ability.unlockReq.transformationControl ? 'text-green-400' : 'text-red-400'}`}>
                                      Control {ability.unlockReq.transformationControl}%
                                    </span>
                                  )}
                                  {ability.unlockReq.nightsAsWolf && (
                                    <span className={`ml-2 ${(werewolf.nights_as_wolf || 0) >= ability.unlockReq.nightsAsWolf ? 'text-green-400' : 'text-red-400'}`}>
                                      {ability.unlockReq.nightsAsWolf} nights
                                    </span>
                                  )}
                                  {ability.unlockReq.prerequisite && (
                                    <span className={`ml-2 ${unlockedAbilities.includes(ability.unlockReq.prerequisite) ? 'text-green-400' : 'text-red-400'}`}>
                                      Requires {WEREWOLF_ABILITIES.find(a => a.id === ability.unlockReq.prerequisite)?.name}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex gap-2 mt-3">
                                {!unlocked && canUnlockNow && (
                                  <button
                                    onClick={() => handleUnlock(ability)}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
                                  >
                                    Unlock
                                  </button>
                                )}
                                {unlocked && (
                                  <button
                                    onClick={() => handleUse(ability)}
                                    disabled={!canUseNow}
                                    className={`px-4 py-2 rounded-lg text-sm ${
                                      canUseNow
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    {cooldown > 0 ? `Cooldown: ${cooldown}` : 'Use'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}