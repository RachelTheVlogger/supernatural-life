import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Lock, CheckCircle, TrendingUp, Award, Zap, Target, Shield, Eye, Crosshair, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const SKILL_TREE = {
  combat: {
    name: 'Combat Mastery',
    icon: Crosshair,
    color: 'red',
    skills: [
      { id: 'basic_combat', name: 'Basic Combat', level: 1, xpCost: 0, description: 'Foundation combat skills', icon: Target, unlocked: true },
      { id: 'advanced_combat', name: 'Advanced Combat', level: 3, xpCost: 100, description: '+15% damage to vampires', icon: Zap, requires: 'basic_combat' },
      { id: 'master_combatant', name: 'Master Combatant', level: 5, xpCost: 250, description: '+30% damage, critical strikes', icon: Star, requires: 'advanced_combat' },
      { id: 'lethal_strikes', name: 'Lethal Strikes', level: 8, xpCost: 500, description: 'Instant kill chance on weakened vampires', icon: Crosshair, requires: 'master_combatant' }
    ]
  },
  tracking: {
    name: 'Tracking Expertise',
    icon: Eye,
    color: 'blue',
    skills: [
      { id: 'basic_tracking', name: 'Basic Tracking', level: 1, xpCost: 0, description: 'Can follow basic vampire trails', icon: Eye, unlocked: true },
      { id: 'enhanced_senses', name: 'Enhanced Senses', level: 2, xpCost: 80, description: 'Detect vampires from further away', icon: Eye, requires: 'basic_tracking' },
      { id: 'master_tracker', name: 'Master Tracker', level: 4, xpCost: 200, description: 'Reveal vampire safe houses', icon: Target, requires: 'enhanced_senses' },
      { id: 'sixth_sense', name: 'Sixth Sense', level: 7, xpCost: 400, description: 'Sense vampire presence automatically', icon: Star, requires: 'master_tracker' }
    ]
  },
  survival: {
    name: 'Survival Skills',
    icon: Shield,
    color: 'green',
    skills: [
      { id: 'basic_defense', name: 'Basic Defense', level: 1, xpCost: 0, description: 'Standard defensive training', icon: Shield, unlocked: true },
      { id: 'iron_will', name: 'Iron Will', level: 2, xpCost: 90, description: 'Resist vampire mind control', icon: Heart, requires: 'basic_defense' },
      { id: 'tactical_retreat', name: 'Tactical Retreat', level: 4, xpCost: 180, description: 'Always escape when outmatched', icon: Zap, requires: 'iron_will' },
      { id: 'immortal_hunter', name: 'Immortal Hunter', level: 10, xpCost: 800, description: 'Cannot be killed by vampires', icon: Star, requires: 'tactical_retreat' }
    ]
  },
  intelligence: {
    name: 'Intelligence Network',
    icon: Target,
    color: 'purple',
    skills: [
      { id: 'basic_intel', name: 'Basic Intel', level: 1, xpCost: 0, description: 'Gather information on vampires', icon: Eye, unlocked: true },
      { id: 'informant_network', name: 'Informant Network', level: 3, xpCost: 120, description: 'Build network of informants', icon: Target, requires: 'basic_intel' },
      { id: 'deep_cover', name: 'Deep Cover', level: 6, xpCost: 350, description: 'Infiltrate vampire circles', icon: Eye, requires: 'informant_network' },
      { id: 'master_spy', name: 'Master Spy', level: 9, xpCost: 650, description: 'Know all vampire locations instantly', icon: Star, requires: 'deep_cover' }
    ]
  }
};

const calculateLevel = (experience) => {
  // Level formula: level = floor(sqrt(experience / 50)) + 1
  return Math.floor(Math.sqrt(experience / 50)) + 1;
};

const experienceForNextLevel = (currentLevel) => {
  // XP needed for next level
  return Math.pow(currentLevel, 2) * 50;
};

export default function HunterProgression({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTree, setSelectedTree] = useState('combat');
  const [processing, setProcessing] = useState(false);

  const currentExp = hunter.experience || 0;
  const currentLevel = calculateLevel(currentExp);
  const nextLevelExp = experienceForNextLevel(currentLevel);
  const currentLevelExp = experienceForNextLevel(currentLevel - 1);
  const expProgress = ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;

  // Get unlocked skills from hunter data
  const unlockedSkills = hunter.unlocked_skills || [];

  const handleUnlockSkill = async (skill) => {
    if (currentLevel < skill.level) {
      alert(`Requires level ${skill.level}`);
      return;
    }

    if (currentExp < skill.xpCost) {
      alert(`Requires ${skill.xpCost} experience points`);
      return;
    }

    // Check if prerequisite is unlocked
    if (skill.requires && !unlockedSkills.includes(skill.requires)) {
      alert('Prerequisite skill not unlocked');
      return;
    }

    if (unlockedSkills.includes(skill.id)) {
      alert('Already unlocked');
      return;
    }

    setProcessing(true);
    try {
      const newExp = currentExp - skill.xpCost;
      const newUnlockedSkills = [...unlockedSkills, skill.id];

      await base44.entities.Hunter.update(hunter.id, {
        experience: newExp,
        unlocked_skills: newUnlockedSkills
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} unlocked ${skill.name}! ${skill.description}`,
        category: 'hunting',
        intensity: 'significant'
      });

      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to unlock skill:', e);
    }
    setProcessing(false);
  };

  const currentTree = SKILL_TREE[selectedTree];
  const TreeIcon = currentTree.icon;

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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Hunter Progression</h2>
            <p className="text-gray-400">{hunter.name}'s Skills & Abilities</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Level & XP Display */}
        <div className="bg-black/40 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-white text-2xl font-bold">Level {currentLevel}</h3>
                <p className="text-gray-400 text-sm">Hunter Rank</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-2xl font-bold">{currentExp}</p>
              <p className="text-gray-400 text-sm">Total Experience</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress to Level {currentLevel + 1}</span>
              <span className="text-white font-medium">{Math.floor(expProgress)}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${expProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
            <p className="text-gray-500 text-xs text-center">
              {nextLevelExp - currentExp} XP needed for next level
            </p>
          </div>
        </div>

        {/* Skill Tree Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(SKILL_TREE).map(([key, tree]) => {
            const Icon = tree.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedTree(key)}
                className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedTree === key
                    ? `bg-${tree.color}-600 text-white`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tree.name}
              </button>
            );
          })}
        </div>

        {/* Skill Tree Display */}
        <div className="bg-black/40 border border-gray-700 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <TreeIcon className={`w-6 h-6 text-${currentTree.color}-400`} />
            <h3 className="text-white text-xl font-bold">{currentTree.name}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTree.skills.map((skill, index) => {
              const SkillIcon = skill.icon;
              const isUnlocked = unlockedSkills.includes(skill.id) || skill.unlocked;
              const canUnlock = currentLevel >= skill.level && currentExp >= skill.xpCost;
              const hasPrerequisite = !skill.requires || unlockedSkills.includes(skill.requires);

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl p-6 border-2 transition-all ${
                    isUnlocked
                      ? `bg-${currentTree.color}-950/30 border-${currentTree.color}-500`
                      : canUnlock && hasPrerequisite
                      ? 'bg-gray-800 border-gray-600 hover:border-gray-500 cursor-pointer'
                      : 'bg-gray-900 border-gray-800 opacity-60'
                  }`}
                  onClick={() => !isUnlocked && canUnlock && hasPrerequisite && handleUnlockSkill(skill)}
                >
                  {/* Unlock Status Icon */}
                  <div className="absolute top-4 right-4">
                    {isUnlocked ? (
                      <CheckCircle className={`w-6 h-6 text-${currentTree.color}-400`} />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  {/* Skill Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isUnlocked ? `bg-${currentTree.color}-600` : 'bg-gray-800'
                    }`}>
                      <SkillIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">{skill.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{skill.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`flex items-center gap-1 ${
                          currentLevel >= skill.level ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          <Star className="w-3 h-3" />
                          Level {skill.level}
                        </span>
                        {skill.xpCost > 0 && (
                          <span className={`flex items-center gap-1 ${
                            currentExp >= skill.xpCost ? 'text-blue-400' : 'text-gray-500'
                          }`}>
                            <TrendingUp className="w-3 h-3" />
                            {skill.xpCost} XP
                          </span>
                        )}
                      </div>

                      {!hasPrerequisite && (
                        <p className="text-red-400 text-xs mt-2">
                          Requires: {skill.requires?.replace(/_/g, ' ')}
                        </p>
                      )}

                      {!isUnlocked && canUnlock && hasPrerequisite && (
                        <button
                          disabled={processing}
                          className={`mt-3 px-4 py-2 bg-${currentTree.color}-600 hover:bg-${currentTree.color}-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50`}
                        >
                          Unlock Now
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
            <Award className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Skills Unlocked</p>
            <p className="text-white text-2xl font-bold">{unlockedSkills.length}</p>
          </div>
          <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
            <Star className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Current Level</p>
            <p className="text-white text-2xl font-bold">{currentLevel}</p>
          </div>
          <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
            <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Total XP</p>
            <p className="text-white text-2xl font-bold">{currentExp}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}