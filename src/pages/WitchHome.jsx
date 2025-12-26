import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Flame, Droplets, Wind, Skull, Heart, Zap, Moon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SPELLS = {
  elemental: [
    { name: 'Ignite', icon: '🔥', element: 'fire', power: 20, description: 'Set things ablaze', cost: 15 },
    { name: 'Tsunami', icon: '🌊', element: 'water', power: 30, description: 'Summon water', cost: 25 },
    { name: 'Gale Force', icon: '💨', element: 'air', power: 25, description: 'Control wind', cost: 20 },
    { name: 'Earthquake', icon: '🪨', element: 'earth', power: 35, description: 'Shake the ground', cost: 30 }
  ],
  psychic: [
    { name: 'Mind Read', icon: '🧠', power: 20, description: 'Read thoughts', cost: 20 },
    { name: 'Memory Wipe', icon: '💭', power: 40, description: 'Erase memories', cost: 35 },
    { name: 'Illusion', icon: '👁️', power: 30, description: 'Create illusions', cost: 25 },
    { name: 'Telekinesis', icon: '🌀', power: 35, description: 'Move objects', cost: 30 }
  ],
  necromancy: [
    { name: 'Commune', icon: '👻', power: 25, description: 'Speak with dead', cost: 30 },
    { name: 'Raise Dead', icon: '🧟', power: 50, description: 'Animate corpse', cost: 50 },
    { name: 'Death Bolt', icon: '💀', power: 45, description: 'Drain life force', cost: 40 },
    { name: 'Soul Trap', icon: '🫧', power: 40, description: 'Bind a soul', cost: 35 }
  ],
  healing: [
    { name: 'Mend Wounds', icon: '✨', power: 25, description: 'Heal injuries', cost: 20 },
    { name: 'Purify', icon: '💫', power: 30, description: 'Remove toxins', cost: 25 },
    { name: 'Life Force', icon: '💖', power: 40, description: 'Restore vitality', cost: 35 },
    { name: 'Resurrection', icon: '🕊️', power: 60, description: 'Bring back to life', cost: 60 }
  ],
  dark_magic: [
    { name: 'Hex', icon: '🌑', power: 30, description: 'Curse someone', cost: 25 },
    { name: 'Blood Boil', icon: '🩸', power: 45, description: 'Boil blood', cost: 40 },
    { name: 'Shadow Bind', icon: '🕷️', power: 35, description: 'Trap in shadows', cost: 30 },
    { name: 'Pain Link', icon: '⛓️', power: 40, description: 'Share pain', cost: 35 }
  ]
};

const RITUALS = [
  { name: 'Full Moon Ritual', icon: '🌕', duration: 5000, powerBoost: 20, description: 'Amplify powers under full moon' },
  { name: 'Protection Circle', icon: '⭕', duration: 3000, powerBoost: 10, description: 'Ward off vampires' },
  { name: 'Scrying', icon: '🔮', duration: 4000, powerBoost: 0, description: 'See distant events' },
  { name: 'Channeling', icon: '⚡', duration: 6000, powerBoost: 30, description: 'Channel ancestral power' }
];

export default function WitchHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [castingSpell, setCastingSpell] = useState(null);
  const [performingRitual, setPerformingRitual] = useState(null);
  const [spellOutcome, setSpellOutcome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('elemental');
  const [showSpellbook, setShowSpellbook] = useState(false);

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const witch = witches[0];
  const vampireState = vampireStates[0];

  const handleCastSpell = async (spell) => {
    if (!witch) return;
    if (witch.power_level < spell.cost) {
      alert(`Not enough power! Need ${spell.cost}, have ${witch.power_level}`);
      return;
    }

    setCastingSpell(spell);

    setTimeout(async () => {
      const success = Math.random() > 0.2;
      
      const outcomes = success ? [
        `${spell.name} cast successfully! Power surges through you.`,
        `The spell worked perfectly. ${spell.description}.`,
        `Magic flows naturally. ${spell.name} executed flawlessly.`,
        `Your power is growing. ${spell.name} was effortless.`
      ] : [
        `${spell.name} backfired! Power depleted.`,
        `The spell fizzled. Magic is unpredictable.`,
        `Lost control. ${spell.name} failed.`
      ];

      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      setSpellOutcome(outcome);

      const newPower = success 
        ? Math.min(100, witch.power_level - spell.cost + 5)
        : Math.max(0, witch.power_level - spell.cost - 10);

      await base44.entities.Witch.update(witch.id, {
        power_level: newPower
      });

      await base44.entities.NightLog.create({
        entry: `${witch.name} cast ${spell.name}. ${outcome}`,
        category: 'power',
        intensity: success ? 'moderate' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setCastingSpell(null);
        setSpellOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleRitual = async (ritual) => {
    if (!witch) return;
    setPerformingRitual(ritual);

    setTimeout(async () => {
      const powerGain = ritual.powerBoost + Math.floor(Math.random() * 10);
      
      await base44.entities.Witch.update(witch.id, {
        power_level: Math.min(100, witch.power_level + powerGain)
      });

      await base44.entities.NightLog.create({
        entry: `${witch.name} performed ${ritual.name}. Power increased by ${powerGain}.`,
        category: 'power',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setPerformingRitual(null);
    }, ritual.duration);
  };

  const handleSuppressVampire = async () => {
    if (!witch || !vampireState) return;

    setCastingSpell({ name: 'Suppress Vampire', icon: '🦇' });

    setTimeout(async () => {
      const vampirePowers = vampireState.unlocked_powers || [];
      const powerToSuppress = vampirePowers[Math.floor(Math.random() * vampirePowers.length)];

      if (powerToSuppress) {
        setSpellOutcome(`Temporarily suppressed vampire's ${powerToSuppress} ability!`);
      } else {
        setSpellOutcome('No vampire powers to suppress.');
      }

      await base44.entities.NightLog.create({
        entry: `${witch.name} suppressed vampire abilities. ${vampireState.vampire_name} weakened.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setCastingSpell(null);
        setSpellOutcome('');
      }, 3000);
    }, 2500);
  };

  if (!witch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950 to-black p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Witch Found</h2>
          <p className="text-gray-400 mb-6">Encounter a witch in the Vampire Home first.</p>
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
          >
            Return to Vampire Home
          </button>
        </div>
      </div>
    );
  }

  const categorySpells = SPELLS[witch.specialty] || SPELLS.elemental;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-purple-950 via-indigo-950 to-black">
      
      {/* Magic particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            Vampire View →
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">{witch.name}</h1>
            <p className="text-purple-300 capitalize">{witch.specialty} Witch</p>
            <p className={`text-sm mt-1 capitalize ${
              witch.disposition === 'hostile' ? 'text-red-400' :
              witch.disposition === 'allied' ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {witch.disposition}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{witch.power_level}</p>
              <p className="text-xs text-gray-400">Power Level</p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Heart className="w-6 h-6 text-pink-400 mb-2" />
              <p className="text-2xl font-bold text-white">{witch.relationship || 0}</p>
              <p className="text-xs text-gray-400">Relationship</p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Moon className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white capitalize">{witch.specialty}</p>
              <p className="text-xs text-gray-400">Specialty</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <button
              onClick={() => setShowSpellbook(true)}
              className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border-2 border-purple-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">📖</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Spellbook</h3>
                  <p className="text-gray-400 text-sm">Cast spells & magic</p>
                </div>
              </div>
            </button>

            {vampireState && (
              <button
                onClick={handleSuppressVampire}
                disabled={castingSpell}
                className="bg-gradient-to-r from-red-900/40 to-purple-900/40 hover:from-red-900/60 hover:to-purple-900/60 border-2 border-red-500/50 rounded-xl p-6 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🦇</span>
                  <div className="text-left">
                    <h3 className="text-white font-bold">Suppress Vampire</h3>
                    <p className="text-gray-400 text-sm">Weaken their powers</p>
                  </div>
                </div>
              </button>
            )}
          </motion.div>

          {/* Rituals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-white text-xl font-bold mb-4">Rituals</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {RITUALS.map(ritual => (
                <button
                  key={ritual.name}
                  onClick={() => handleRitual(ritual)}
                  disabled={performingRitual}
                  className="bg-gray-900/50 hover:bg-gray-800/50 border border-purple-800/30 rounded-xl p-4 text-left transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{ritual.icon}</span>
                    <h3 className="text-white font-medium">{ritual.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{ritual.description}</p>
                  {ritual.powerBoost > 0 && (
                    <p className="text-purple-400 text-xs mt-2">+{ritual.powerBoost} power</p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spellbook Modal */}
      <AnimatePresence>
        {showSpellbook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowSpellbook(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button onClick={() => setShowSpellbook(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-4">Spellbook</h2>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {Object.keys(SPELLS).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                      selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Spells */}
              <div className="grid md:grid-cols-2 gap-3">
                {SPELLS[selectedCategory].map(spell => (
                  <button
                    key={spell.name}
                    onClick={() => {
                      setShowSpellbook(false);
                      handleCastSpell(spell);
                    }}
                    disabled={castingSpell || witch.power_level < spell.cost}
                    className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{spell.icon}</span>
                        <h3 className="text-white font-medium">{spell.name}</h3>
                      </div>
                      <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                        {spell.cost}⚡
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{spell.description}</p>
                    <p className="text-purple-400 text-xs mt-2">Power: {spell.power}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {(castingSpell || performingRitual) && !spellOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <span className="text-6xl">{castingSpell?.icon || performingRitual?.icon || '✨'}</span>
              <p className="text-purple-400 text-lg mt-4">
                {castingSpell ? `Casting ${castingSpell.name}...` : `Performing ${performingRitual?.name}...`}
              </p>
            </motion.div>
          </motion.div>
        )}

        {spellOutcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center border-2 border-purple-500/50">
              <p className="text-white text-lg">{spellOutcome}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}