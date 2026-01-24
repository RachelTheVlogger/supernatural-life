import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const BASE_POWERS = [
  'Water Breathing', 'Nature Bond', 'Healing Touch', 'Plant Growth',
  'Animal Speech', 'Water Walking', 'Moonlight Aura', 'Spring Creation',
  'Weather Sense', 'Purification', 'Shape Water', 'Mist Form',
  'Rapid Healing', 'Nature Shield', 'Water Portal', 'Storm Calling',
  'Ocean Communion', 'Life Bloom', 'Sacred Ground', 'Tide Control',
  'Forest Whisper', 'Crystal Growth', 'River Dance', 'Deep Dive',
  'Eternal Youth', 'Nature\'s Wrath', 'Tsunami Summon', 'Gaia\'s Blessing',
  'Elemental Form', 'World Tree Connection', 'Nature\'s Avatar'
];

const POWER_PREFIXES = ['Enhanced', 'Greater', 'Supreme', 'Divine', 'Ancient', 'Primal', 'Mythic', 'Eternal', 'Cosmic', 'Sacred'];
const POWER_SUFFIXES = ['Mastery', 'Dominion', 'Ascension', 'Perfection', 'Transcendence', 'Apotheosis'];

const generatePowerTree = (maxLevel) => {
  const powers = [];
  
  BASE_POWERS.forEach((baseName, i) => {
    powers.push({ 
      id: `power_${i}`, 
      name: baseName, 
      unlockAt: i * 5,
      tier: Math.floor(i / 5)
    });
  });
  
  // Generate infinite powers beyond base
  let level = BASE_POWERS.length * 5;
  let tier = BASE_POWERS.length;
  while (level <= maxLevel + 50) {
    const prefix = POWER_PREFIXES[Math.floor(level / 50) % POWER_PREFIXES.length];
    const base = BASE_POWERS[Math.floor(Math.random() * BASE_POWERS.length)];
    const suffix = level % 100 === 0 ? ` ${POWER_SUFFIXES[Math.floor(level / 100) % POWER_SUFFIXES.length]}` : '';
    powers.push({
      id: `power_${level}`,
      name: `${prefix} ${base}${suffix}`,
      unlockAt: level,
      tier: tier
    });
    level += 5;
    if (level % 50 === 0) tier++;
  }
  
  return powers;
};

export default function NymphPowerTree({ nymph }) {
  const POWER_TREE = React.useMemo(() => 
    generatePowerTree(nymph?.nature_bond || 50), 
    [nymph?.nature_bond]
  );

  const groupedByTier = {};
  POWER_TREE.forEach(power => {
    const tier = power.tier || 0;
    if (!groupedByTier[tier]) groupedByTier[tier] = [];
    groupedByTier[tier].push(power);
  });

  const tiers = Object.keys(groupedByTier).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-teal-400" />
        Nymph Powers ({(nymph?.unlocked_powers || []).length}/{POWER_TREE.length})
      </h3>

      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {tiers.slice(0, 10).map(tier => (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="text-teal-400 text-xs font-bold mb-3 uppercase tracking-wider">
              Tier {tier + 1}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {groupedByTier[tier]?.slice(0, 12).map((power, idx) => {
                const unlocked = (nymph?.unlocked_powers || []).includes(power.name);
                const canUnlock = (nymph?.nature_bond || 0) >= power.unlockAt && !unlocked;

                return (
                  <motion.div
                    key={power.id}
                    whileHover={unlocked || canUnlock ? { scale: 1.05 } : {}}
                    className={`p-2 rounded-lg border transition-all cursor-default relative group ${
                      unlocked 
                        ? 'bg-teal-900/40 border-teal-500/60 shadow-lg shadow-teal-500/20' 
                        : canUnlock
                        ? 'bg-green-900/30 border-green-500/40 hover:border-green-500/60'
                        : 'bg-gray-800/40 border-gray-700/40 opacity-50'
                    }`}
                  >
                    <Zap className={`w-3 h-3 mb-1 ${
                      unlocked 
                        ? 'text-teal-400' 
                        : canUnlock 
                        ? 'text-green-400' 
                        : 'text-gray-600'
                    }`} />
                    <p className={`text-xs font-medium leading-tight ${
                      unlocked 
                        ? 'text-white' 
                        : canUnlock 
                        ? 'text-green-200' 
                        : 'text-gray-500'
                    }`}>
                      {power.name}
                    </p>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-950 border border-gray-700 rounded-lg p-2 whitespace-nowrap text-xs text-gray-300">
                      {unlocked ? '✓ Unlocked' : `Bond: ${power.unlockAt}`}
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