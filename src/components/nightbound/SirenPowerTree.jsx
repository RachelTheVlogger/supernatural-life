import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const BASE_POWERS = [
  'Hypnotic Song', 'Seductive Voice', 'Water Breathing', 'Enhanced Beauty',
  'Water Manipulation', 'Echo Location', 'Drowning Kiss', 'Tidal Emotions',
  'Aquatic Form', 'Mind Control', 'Storm Calling', 'Siren Scream',
  'Water Teleport', 'Memory Wash', 'Mass Charm', 'Tsunami Summon',
  'Illusion Casting', 'Water Healing', 'Eternal Youth', 'Ocean Communion',
  "Poseidon's Blessing", 'Deep Sea Form', 'Whirlpool Creation', 'Soul Singing',
  'Water Clone', 'Moon Tide Control', 'Kraken Summoning', 'Oceanic Avatar',
  'Mythic Form', 'Voice of Atlantis', 'Nymph Summoning'
];

const POWER_PREFIXES = ['Enhanced', 'Greater', 'Supreme', 'Divine', 'Ancient', 'Primal', 'Mythic', 'Eternal', 'Cosmic', 'Abyssal'];
const POWER_SUFFIXES = ['Mastery', 'Dominion', 'Ascension', 'Perfection', 'Transcendence', 'Apotheosis'];

const generatePowerTree = (maxLevel) => {
  const powers = [];
  const icons = [null]; // Using null for generic icon, will use Zap
  
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

export default function SirenPowerTree({ siren }) {
  const POWER_TREE = React.useMemo(() => 
    generatePowerTree(siren?.voice_power || 50), 
    [siren?.voice_power]
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
        <Zap className="w-5 h-5 text-cyan-400" />
        Siren Powers ({(siren?.unlocked_powers || []).length}/{POWER_TREE.length})
      </h3>

      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {tiers.slice(0, 10).map(tier => (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="text-cyan-400 text-xs font-bold mb-3 uppercase tracking-wider">
              Tier {tier + 1}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {groupedByTier[tier]?.slice(0, 12).map((power, idx) => {
                const unlocked = (siren?.unlocked_powers || []).includes(power.name);
                const canUnlock = (siren?.voice_power || 0) >= power.unlockAt && !unlocked;

                return (
                  <motion.div
                    key={power.id}
                    whileHover={unlocked || canUnlock ? { scale: 1.05 } : {}}
                    className={`p-2 rounded-lg border transition-all cursor-default relative group ${
                      unlocked 
                        ? 'bg-cyan-900/40 border-cyan-500/60 shadow-lg shadow-cyan-500/20' 
                        : canUnlock
                        ? 'bg-yellow-900/30 border-yellow-500/40 hover:border-yellow-500/60'
                        : 'bg-gray-800/40 border-gray-700/40 opacity-50'
                    }`}
                  >
                    <Zap className={`w-3 h-3 mb-1 ${
                      unlocked 
                        ? 'text-cyan-400' 
                        : canUnlock 
                        ? 'text-yellow-400' 
                        : 'text-gray-600'
                    }`} />
                    <p className={`text-xs font-medium leading-tight ${
                      unlocked 
                        ? 'text-white' 
                        : canUnlock 
                        ? 'text-yellow-200' 
                        : 'text-gray-500'
                    }`}>
                      {power.name}
                    </p>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-950 border border-gray-700 rounded-lg p-2 whitespace-nowrap text-xs text-gray-300">
                      {unlocked ? '✓ Unlocked' : `Voice: ${power.unlockAt}`}
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