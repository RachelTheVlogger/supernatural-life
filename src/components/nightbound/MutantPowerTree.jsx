import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Brain, Heart, Zap as LightningIcon, Dna, Droplet } from 'lucide-react';

const MUTANT_POWERS = {
  feral: [
    'Animal Instinct', 'Claw Strike', 'Enhanced Senses', 'Regeneration', 'Predator Form',
    'Pack Bond', 'Feral Scream', 'Primal Strength', 'Beast Mode', 'Alpha Dominance',
    'Wild Hunt', 'Savage Transformation', 'Untamed Fury', 'Natural Armor', 'Pack Leader'
  ],
  psychic: [
    'Mind Read', 'Telepathy', 'Telekinesis', 'Mental Block', 'Psychic Scream',
    'Mind Control', 'Illusion Cast', 'Thought Acceleration', 'Psychic Link', 'Hive Mind',
    'Memory Erase', 'Mental Fortress', 'Collective Consciousness', 'Psychic Blast', 'Omniscience'
  ],
  elemental: [
    'Flame Control', 'Ice Formation', 'Lightning Bolt', 'Earth Shake', 'Wind Gust',
    'Storm Calling', 'Inferno', 'Absolute Zero', 'Thunderstorm', 'Earthquakes',
    'Hurricane', 'Volcanic Eruption', 'Elemental Fusion', 'Nature Command', 'Cataclysm'
  ],
  healer: [
    'Wound Heal', 'Disease Cure', 'Bone Mend', 'Vitality Restore', 'Organ Regenerate',
    'Life Touch', 'Group Healing', 'Resurrection', 'Cellular Regeneration', 'Perfect Health',
    'Immortal Healing', 'Undying', 'Life Force Control', 'Cure All', 'Eternal Vitality'
  ],
  enhanced: [
    'Super Strength', 'Speed Burst', 'Enhanced Durability', 'Acute Senses', 'Muscle Control',
    'Titan Form', 'Light Speed', 'Unbreakable Skin', 'Super Reflexes', 'Perfect Body',
    'God Strength', 'Reality Speed', 'Diamond Skin', 'Hypersenses', 'Transcendent Form'
  ],
  shapeshifter: [
    'Form Shift', 'Perfect Copy', 'Partial Transform', 'Power Mimic', 'Animal Form',
    'Multiple Forms', 'Hybrid Shape', 'Ability Stealing', 'Mass Transformation', 'Adaptive Form',
    'Perfect Mimic', 'Infinite Forms', 'Evolution Form', 'Cosmic Shape', 'Ultimate Form'
  ],
  toxic: [
    'Poison Spit', 'Toxic Aura', 'Venom Injection', 'Contamination', 'Acid Secretion',
    'Toxin Cloud', 'Plague Carrier', 'Biohazard', 'Mutation Toxin', 'Unstoppable Poison',
    'Apocalypse Toxin', 'Life Eater', 'Corruption Field', 'Extinction Toxin', 'Oblivion'
  ]
};

export default function MutantPowerTree({ mutant }) {
  const powers = MUTANT_POWERS[mutant?.mutant_type] || [];
  const unlockedPowers = mutant?.unlocked_powers || [];
  
  const getIconForType = () => {
    const icons = {
      feral: Zap,
      psychic: Brain,
      elemental: Flame,
      healer: Heart,
      enhanced: LightningIcon,
      shapeshifter: Dna,
      toxic: Droplet
    };
    return icons[mutant?.mutant_type];
  };

  const getColorForType = () => {
    const colors = {
      feral: 'from-red-600 to-orange-500',
      psychic: 'from-purple-600 to-pink-500',
      elemental: 'from-blue-600 to-cyan-500',
      healer: 'from-green-600 to-emerald-500',
      enhanced: 'from-yellow-600 to-amber-500',
      shapeshifter: 'from-indigo-600 to-violet-500',
      toxic: 'from-green-700 to-lime-600'
    };
    return colors[mutant?.mutant_type];
  };

  const Icon = getIconForType();
  const colorClass = getColorForType();

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 mt-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <Icon className="w-5 h-5" />
        Mutant Powers ({unlockedPowers.length}/{powers.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
        {powers.map((power, idx) => {
          const unlocked = unlockedPowers.includes(power);
          const canUnlock = (mutant?.power_level || 0) >= (idx + 1) * 5;

          return (
            <motion.div
              key={idx}
              whileHover={unlocked || canUnlock ? { scale: 1.05 } : {}}
              className={`p-3 rounded-lg border transition-all ${
                unlocked
                  ? `bg-gradient-to-br ${colorClass} border-white/50 shadow-lg shadow-orange-500/20`
                  : canUnlock
                  ? 'bg-green-900/30 border-green-500/40 hover:border-green-500/60'
                  : 'bg-gray-800/40 border-gray-700/40 opacity-50'
              }`}
            >
              <p className={`text-xs font-semibold text-center leading-tight ${
                unlocked ? 'text-white' : canUnlock ? 'text-green-200' : 'text-gray-500'
              }`}>
                {power}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}