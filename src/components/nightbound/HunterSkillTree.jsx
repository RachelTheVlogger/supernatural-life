import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const BASE_SKILLS = [
  'Weapon Mastery', 'Vampire Lore', 'Combat Training', 'Tracking',
  'Holy Water Crafting', 'Stake Throwing', 'Tactical Planning', 'Evasion',
  'Supernatural Detection', 'Interrogation', 'Explosives', 'Chain Fighting',
  'Crossbow Mastery', 'Ancient Texts', 'Team Coordination', 'Vampire Psychology',
  'Daylight Advantage', 'Trap Setting', 'Weapon Enchantment', 'Leadership',
  'Curse Breaking', 'Beast Slaying', 'Sacrifice Knowledge', 'Relic Hunting',
  'Demon Banishing', 'Prophecy Reading', 'Immortal Combat', 'Final Stand'
];

const SKILL_PREFIXES = ['Enhanced', 'Advanced', 'Expert', 'Master', 'Supreme', 'Legendary', 'Divine', 'Ancient'];
const SKILL_SUFFIXES = ['Mastery', 'Expertise', 'Proficiency', 'Dominance', 'Supremacy'];

const generateSkillTree = (maxLevel) => {
  const skills = [];
  
  BASE_SKILLS.forEach((skillName, i) => {
    skills.push({ 
      id: `skill_${i}`, 
      name: skillName, 
      unlockAt: i * 5,
      tier: Math.floor(i / 5)
    });
  });
  
  // Generate infinite skills beyond base
  let level = BASE_SKILLS.length * 5;
  let tier = BASE_SKILLS.length;
  while (level <= maxLevel + 50) {
    const prefix = SKILL_PREFIXES[Math.floor(level / 50) % SKILL_PREFIXES.length];
    const base = BASE_SKILLS[Math.floor(Math.random() * BASE_SKILLS.length)];
    const suffix = level % 100 === 0 ? ` ${SKILL_SUFFIXES[Math.floor(level / 100) % SKILL_SUFFIXES.length]}` : '';
    skills.push({
      id: `skill_${level}`,
      name: `${prefix} ${base}${suffix}`,
      unlockAt: level,
      tier: tier
    });
    level += 5;
    if (level % 50 === 0) tier++;
  }
  
  return skills;
};

export default function HunterSkillTree({ hunter }) {
  const SKILL_TREE = React.useMemo(() => 
    generateSkillTree(hunter?.combat_skill || hunter?.knowledge_level || 50), 
    [hunter?.combat_skill, hunter?.knowledge_level]
  );

  const groupedByTier = {};
  SKILL_TREE.forEach(skill => {
    const tier = skill.tier || 0;
    if (!groupedByTier[tier]) groupedByTier[tier] = [];
    groupedByTier[tier].push(skill);
  });

  const tiers = Object.keys(groupedByTier).map(Number).sort((a, b) => a - b);
  const unlockedSkills = hunter?.unlocked_skills || [];

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-red-400" />
        Hunter Skills ({unlockedSkills.length}/{SKILL_TREE.length})
      </h3>

      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {tiers.slice(0, 10).map(tier => (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="text-red-400 text-xs font-bold mb-3 uppercase tracking-wider">
              Tier {tier + 1}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {groupedByTier[tier]?.slice(0, 12).map((skill, idx) => {
                const unlocked = unlockedSkills.includes(skill.name);
                const minLevel = Math.min(hunter?.combat_skill || 0, hunter?.knowledge_level || 0, hunter?.survival_skill || 0);
                const canUnlock = minLevel >= skill.unlockAt && !unlocked;

                return (
                  <motion.div
                    key={skill.id}
                    whileHover={unlocked || canUnlock ? { scale: 1.05 } : {}}
                    className={`p-2 rounded-lg border transition-all cursor-default relative group ${
                      unlocked 
                        ? 'bg-red-900/40 border-red-500/60 shadow-lg shadow-red-500/20' 
                        : canUnlock
                        ? 'bg-orange-900/30 border-orange-500/40 hover:border-orange-500/60'
                        : 'bg-gray-800/40 border-gray-700/40 opacity-50'
                    }`}
                  >
                    <Zap className={`w-3 h-3 mb-1 ${
                      unlocked 
                        ? 'text-red-400' 
                        : canUnlock 
                        ? 'text-orange-400' 
                        : 'text-gray-600'
                    }`} />
                    <p className={`text-xs font-medium leading-tight ${
                      unlocked 
                        ? 'text-white' 
                        : canUnlock 
                        ? 'text-orange-200' 
                        : 'text-gray-500'
                    }`}>
                      {skill.name}
                    </p>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-950 border border-gray-700 rounded-lg p-2 whitespace-nowrap text-xs text-gray-300">
                      {unlocked ? '✓ Unlocked' : `Level: ${skill.unlockAt}`}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {tiers.length > 10 && (
          <div className="text-center text-gray-500 text-xs pt-4">
            + {tiers.length - 10} more tiers available
          </div>
        )}
      </div>
    </div>
  );
}