import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Zap, Eye } from 'lucide-react';

const MUTATION_AESTHETICS = [
  {
    id: 'natural',
    name: 'Natural Form',
    description: 'Minimal visual changes. You remain mostly human.',
    cost: 0,
    icon: Eye,
    effectDescription: 'Standard mutation appearance',
    preview: 'subtle'
  },
  {
    id: 'crystalline',
    name: 'Crystalline',
    description: 'Your body shimmers with crystal formations. Sharp, geometric aesthetic.',
    cost: 50,
    icon: Sparkles,
    effectDescription: 'Body glows with crystalline patterns. Sharp angular aura.',
    preview: 'geometric'
  },
  {
    id: 'ethereal',
    name: 'Ethereal',
    description: 'Semi-transparent form with ghostly trails. Otherworldly presence.',
    cost: 75,
    icon: Zap,
    effectDescription: 'Floating aura with light trails. Translucent glow effect.',
    preview: 'ethereal'
  },
  {
    id: 'primal',
    name: 'Primal Beast',
    description: 'Emphasized animal features. Feral, raw power radiates.',
    cost: 100,
    icon: Crown,
    effectDescription: 'Enhanced claws, fangs visible. Wild energy pulses.',
    preview: 'aggressive'
  },
  {
    id: 'biomechanical',
    name: 'Biomechanical',
    description: 'Fusion of flesh and technology. Sleek, advanced appearance.',
    cost: 125,
    icon: Sparkles,
    effectDescription: 'Tech-infused circuits visible. Precise, calculated aura.',
    preview: 'metallic'
  },
  {
    id: 'shadow',
    name: 'Shadow Form',
    description: 'Darkness clings to you. A living shadow with glowing eyes.',
    cost: 150,
    icon: Eye,
    effectDescription: 'Wrapped in darkness. Eyes glow intensely. Menacing aura.',
    preview: 'dark'
  },
  {
    id: 'radiant',
    name: 'Radiant Light',
    description: 'Pure luminescence. You glow with inner power and warmth.',
    cost: 175,
    icon: Zap,
    effectDescription: 'Constant glow surrounds you. Healing light radiates.',
    preview: 'bright'
  },
  {
    id: 'liquid',
    name: 'Liquid Form',
    description: 'Body shifts between solid and fluid states. Ever-changing.',
    cost: 200,
    icon: Sparkles,
    effectDescription: 'Fluid movements. Body ripples with color. Water-like.',
    preview: 'flowing'
  },
  {
    id: 'geometric',
    name: 'Geometric Infinity',
    description: 'Mathematics made flesh. Sacred geometry surrounds you.',
    cost: 225,
    icon: Crown,
    effectDescription: 'Floating geometric shapes. Precise, complex patterns.',
    preview: 'abstract'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Entity',
    description: 'You channel the stars themselves. Universe embodied.',
    cost: 300,
    icon: Sparkles,
    effectDescription: 'Stars orbit you. Universe visible in your form. Cosmic waves.',
    preview: 'cosmic'
  }
];

export default function MutantAestheticsShop({ mutant, onSelectAesthetic, onBuyAesthetic }) {
  const [selectedAesthetic, setSelectedAesthetic] = React.useState(mutant?.mutation_aesthetic || 'natural');
  const [showDetails, setShowDetails] = React.useState(null);

  const unlockedAesthetics = mutant?.aesthetics_unlocked || ['natural'];

  const handleSelect = async (aesthetic) => {
    setSelectedAesthetic(aesthetic.id);
    await onSelectAesthetic(aesthetic.id);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6">
      <h3 className="text-white font-bold flex items-center gap-2 text-lg mb-6">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        Mutation Aesthetics
      </h3>

      {/* Current Aesthetic */}
      <div className="bg-gradient-to-r from-cyan-950 to-purple-950 rounded-lg p-4 mb-6">
        <p className="text-gray-400 text-xs uppercase mb-2">Current Aesthetic</p>
        <p className="text-white font-bold text-lg">
          {MUTATION_AESTHETICS.find(a => a.id === selectedAesthetic)?.name || 'Natural Form'}
        </p>
      </div>

      {/* Aesthetics Grid */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {MUTATION_AESTHETICS.map(aesthetic => {
          const IconComponent = aesthetic.icon;
          const isUnlocked = unlockedAesthetics.includes(aesthetic.id);
          const isSelected = selectedAesthetic === aesthetic.id;

          return (
            <motion.div
              key={aesthetic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/30'
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              <button
                onClick={() => setShowDetails(showDetails === aesthetic.id ? null : aesthetic.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-lg ${
                    isSelected ? 'bg-cyan-500/20' : 'bg-gray-700/50'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      isSelected ? 'text-cyan-400' : 'text-gray-400'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {aesthetic.name}
                      </h4>
                      {isUnlocked && (
                        <span className="text-xs px-2 py-1 rounded bg-green-900/50 text-green-300">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isSelected ? 'text-cyan-300' : 'text-gray-500'}`}>
                      {aesthetic.description}
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {showDetails === aesthetic.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-4"
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-2">VISUAL EFFECT</p>
                    <p className="text-gray-300 text-sm">{aesthetic.effectDescription}</p>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => handleSelect(aesthetic)}
                      className={`w-full py-2 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-cyan-600 text-white cursor-default'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Active' : 'Select'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(aesthetic)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-medium transition-all ${
                        canAfford
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? `Buy for ${aesthetic.cost}` : 'Not Enough Currency'}
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg text-xs text-gray-500">
        <p>💡 Earn cosmetic currency by completing missions and leveling up your mutations.</p>
      </div>
    </div>
  );
}