import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Sparkles, Zap, Heart, Droplets, Wind } from 'lucide-react';

const POTIONS = [
  {
    id: 'strength',
    name: 'Strength Potion',
    icon: '💪',
    description: 'Enhance physical power temporarily',
    herbs: ['Dragon\'s blood resin', 'Iron', 'Sage'],
    duration: 3600,
    cost: 25,
    effects: '+50% strength for 1 hour'
  },
  {
    id: 'invisibility',
    name: 'Invisibility Potion',
    icon: '👻',
    description: 'Become invisible for short time',
    herbs: ['Moonstone dust', 'Forget-me-not', 'Nightshade'],
    duration: 1800,
    cost: 40,
    effects: 'Invisible for 30 mins'
  },
  {
    id: 'healing',
    name: 'Healing Draught',
    icon: '💚',
    description: 'Restore wounds and vitality',
    herbs: ['White willow bark', 'Yarrow', 'Lavender'],
    duration: 300,
    cost: 30,
    effects: 'Heal injuries instantly'
  },
  {
    id: 'wisdom',
    name: 'Wisdom Elixir',
    icon: '🧠',
    description: 'Sharpen mind and perception',
    herbs: ['Mugwort', 'Bay leaves', 'Rosemary'],
    duration: 7200,
    cost: 35,
    effects: '+40% intelligence for 2 hours'
  },
  {
    id: 'charm',
    name: 'Charm Potion',
    icon: '✨',
    description: 'Make others more attracted to you',
    herbs: ['Rose petals', 'Jasmine', 'Frankincense'],
    duration: 3600,
    cost: 28,
    effects: '+60% charisma for 1 hour'
  },
  {
    id: 'speed',
    name: 'Quicksilver Potion',
    icon: '⚡',
    description: 'Move with supernatural speed',
    herbs: ['Dandelion', 'Storm water', 'Lightning stone'],
    duration: 1800,
    cost: 38,
    effects: '+100% speed for 30 mins'
  },
  {
    id: 'dark_vision',
    name: 'Dark Vision Draught',
    icon: '🌑',
    description: 'See perfectly in darkness',
    herbs: ['Obsidian dust', 'Nightshade', 'Bat wing'],
    duration: 5400,
    cost: 32,
    effects: 'Perfect night vision for 90 mins'
  },
  {
    id: 'courage',
    name: 'Courage Tonic',
    icon: '🦁',
    description: 'Remove fear and doubt',
    herbs: ['Lion\'s mane', 'Nettle', 'Bloodstone'],
    duration: 3600,
    cost: 25,
    effects: 'Fearless for 1 hour'
  },
  {
    id: 'fortune',
    name: 'Fortune Elixir',
    icon: '🍀',
    description: 'Increase luck and chance',
    herbs: ['Four-leaf clover', 'Gold dust', 'Moonstone'],
    duration: 7200,
    cost: 45,
    effects: '+50% luck for 2 hours'
  },
  {
    id: 'rejuvenation',
    name: 'Rejuvenation Essence',
    icon: '🌟',
    description: 'Restore youth and vitality',
    herbs: ['Phoenix ash', 'Fresh blood', 'Moonwater'],
    duration: 10800,
    cost: 60,
    effects: 'Feel young and powerful for 3 hours'
  }
];

export default function AlchemySystem({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [selectedPotion, setSelectedPotion] = useState(null);
  const [brewing, setBrewing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [craftedPotions, setCraftedPotions] = useState({});

  const { data: herbs = [] } = useQuery({
    queryKey: ['witchHerbs', witch?.id],
    queryFn: async () => {
      if (!witch?.id) return [];
      return await base44.entities.WitchHerb.filter({ witch_id: witch.id });
    },
    enabled: !!witch?.id
  });

  const canCraft = (potion) => {
    // For demo: assume player has access if they have enough power
    return witch.power_level >= potion.cost;
  };

  const handleBrew = async (potion) => {
    if (!canCraft(potion)) {
      setOutcome(`Not enough power! Need ${potion.cost}, have ${witch.power_level}`);
      return;
    }

    setBrewing(true);
    setSelectedPotion(potion);

    setTimeout(async () => {
      const success = Math.random() > 0.15; // 85% success rate

      if (success) {
        setCraftedPotions(prev => ({
          ...prev,
          [potion.id]: (prev[potion.id] || 0) + 1
        }));

        setOutcome(`✨ Successfully brewed ${potion.name}! You now have ${(craftedPotions[potion.id] || 0) + 1}.`);

        try {
          const newPower = Math.max(witch.power_level - potion.cost, 0);
          await base44.entities.Witch.update(witch.id, {
            power_level: newPower
          });

          await base44.entities.NightLog.create({
            entry: `Brewed ${potion.name} successfully.`,
            category: 'power',
            intensity: 'moderate'
          });

          queryClient.invalidateQueries(['witches']);
        } catch (e) {
          console.error('Failed to update:', e);
        }
      } else {
        setOutcome(`⚠️ Brewing failed! The potion exploded. You wasted the ingredients.`);
      }

      setTimeout(() => {
        setBrewing(false);
        setOutcome('');
      }, 3000);
    }, 2500);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative border border-purple-500/30"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Alchemy Lab
        </h2>
        <p className="text-gray-400 text-sm mb-6">Brew powerful potions to enhance your abilities</p>

        {brewing || outcome ? (
          <div className="text-center py-12">
            {brewing ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <p className="text-3xl mb-2">🧪</p>
                <p className="text-purple-400">Brewing {selectedPotion?.name}...</p>
              </motion.div>
            ) : (
              <p className="text-gray-300 text-lg">{outcome}</p>
            )}
          </div>
        ) : (
          <>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-purple-500/20">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">Power</p>
                  <p className="text-white font-bold">{witch.power_level}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Potions Crafted</p>
                  <p className="text-white font-bold">{Object.values(craftedPotions).reduce((a, b) => a + b, 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Herbs Collected</p>
                  <p className="text-white font-bold">{herbs.length}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {POTIONS.map(potion => (
                <motion.button
                  key={potion.id}
                  onClick={() => handleBrew(potion)}
                  disabled={!canCraft(potion)}
                  className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 rounded-xl p-4 text-left transition-all border border-purple-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{potion.icon}</span>
                      <div>
                        <h3 className="text-white font-medium">{potion.name}</h3>
                        <p className="text-purple-400 text-xs">Cost: {potion.cost}⚡</p>
                      </div>
                    </div>
                    {craftedPotions[potion.id] > 0 && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        x{craftedPotions[potion.id]}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{potion.description}</p>
                  <p className="text-green-400 text-xs mb-2">✓ {potion.effects}</p>
                  <p className="text-yellow-400 text-xs">🌿 {potion.herbs.join(', ')}</p>
                </motion.button>
              ))}
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-6">
              <h3 className="text-white font-medium mb-2">💡 Tip</h3>
              <p className="text-gray-400 text-sm">
                Potions are powerful temporary enhancements. Gather herbs from nature to improve success rates. Higher power level grants access to more advanced potions.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}