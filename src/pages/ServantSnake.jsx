import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, Zap, Droplets, Moon, Shield, Eye, Sword } from 'lucide-react';

const SNAKE_TYPES = [
  { type: 'shadow', name: 'Shadow Serpent', color: 'from-gray-900 to-black', ability: 'Stealth and illusions' },
  { type: 'venom', name: 'Venom Viper', color: 'from-purple-900 to-pink-900', ability: 'Poison and paralysis' },
  { type: 'blood', name: 'Blood Python', color: 'from-red-900 to-rose-900', ability: 'Blood magic enhancement' },
  { type: 'nightmare', name: 'Nightmare Cobra', color: 'from-indigo-900 to-purple-900', ability: 'Fear and mind control' }
];

const EVOLUTION_PATHS = {
  shadow: [
    { stage: 1, name: 'Shadow Hatchling', abilities: ['Blend with Shadows'], emoji: '🐍', color: 'from-gray-700 to-gray-900' },
    { stage: 2, name: 'Umbral Serpent', abilities: ['Blend with Shadows', 'Shadow Step'], emoji: '🐍✨', color: 'from-gray-800 to-black' },
    { stage: 3, name: 'Void Wyrm', abilities: ['Blend with Shadows', 'Shadow Step', 'Darkness Manipulation', 'Phase Through Walls'], emoji: '🐍🌑', color: 'from-black to-purple-950' }
  ],
  venom: [
    { stage: 1, name: 'Venom Hatchling', abilities: ['Toxic Bite'], emoji: '🐍', color: 'from-green-700 to-green-900' },
    { stage: 2, name: 'Poison Serpent', abilities: ['Toxic Bite', 'Paralysis Venom'], emoji: '🐍💚', color: 'from-green-800 to-emerald-950' },
    { stage: 3, name: 'Death Adder', abilities: ['Toxic Bite', 'Paralysis Venom', 'Acidic Spit', 'Plague Breath'], emoji: '🐍☠️', color: 'from-emerald-950 to-green-950' }
  ],
  blood: [
    { stage: 1, name: 'Blood Hatchling', abilities: ['Blood Scent'], emoji: '🐍', color: 'from-red-700 to-red-900' },
    { stage: 2, name: 'Crimson Serpent', abilities: ['Blood Scent', 'Healing Blood'], emoji: '🐍❤️', color: 'from-red-800 to-rose-950' },
    { stage: 3, name: 'Sanguis Drake', abilities: ['Blood Scent', 'Healing Blood', 'Blood Control', 'Life Drain'], emoji: '🐍🩸', color: 'from-rose-950 to-red-950' }
  ],
  nightmare: [
    { stage: 1, name: 'Nightmare Hatchling', abilities: ['Induce Fear'], emoji: '🐍', color: 'from-purple-700 to-purple-900' },
    { stage: 2, name: 'Terror Serpent', abilities: ['Induce Fear', 'Nightmare Vision'], emoji: '🐍💜', color: 'from-purple-800 to-indigo-950' },
    { stage: 3, name: 'Dread Basilisk', abilities: ['Induce Fear', 'Nightmare Vision', 'Mind Break', 'Petrifying Gaze'], emoji: '🐍👁️', color: 'from-indigo-950 to-purple-950' }
  ]
};

const INTERACTIONS = [
  { id: 'feed', label: 'Feed Blood', icon: Droplets, bondGain: 5, powerGain: 3, outcome: 'feeds' },
  { id: 'cuddle', label: 'Cuddle Snake', icon: Heart, bondGain: 15, powerGain: 1, outcome: 'cuddles', affection: true },
  { id: 'play', label: 'Play Together', icon: Heart, bondGain: 12, powerGain: 2, outcome: 'plays', affection: true },
  { id: 'groom', label: 'Groom Scales', icon: Heart, bondGain: 10, powerGain: 1, outcome: 'grooms', affection: true },
  { id: 'train', label: 'Train Powers', icon: Zap, bondGain: 8, powerGain: 5, outcome: 'trains' },
  { id: 'bond', label: 'Deep Bond', icon: Heart, bondGain: 10, powerGain: 2, outcome: 'bonds' },
  { id: 'hunt', label: 'Hunt Together', icon: Moon, bondGain: 12, powerGain: 6, outcome: 'hunts' },
  { id: 'guard', label: 'Guard Duty', icon: Moon, bondGain: 6, powerGain: 4, outcome: 'guards', loyaltyGain: 8 },
  { id: 'scout', label: 'Scouting', icon: Moon, bondGain: 7, powerGain: 4, outcome: 'scouts', missionGain: true },
  { id: 'attack', label: 'Bite Attack Training', icon: Zap, bondGain: 5, powerGain: 7, outcome: 'attacks', combatGain: true }
];

export default function ServantSnake() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [showAdopt, setShowAdopt] = useState(false);
  const [carrying, setCarrying] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const servantId = urlParams.get('id');

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const servant = servants.find(s => s.id === servantId);

  const { data: snakes = [] } = useQuery({
    queryKey: ['snakeFamiliars', servantId],
    queryFn: () => base44.entities.SnakeFamiliar.filter({ vampire_id: servantId }),
    enabled: !!servantId
  });

  const snake = snakes[0];

  const handleAdopt = async (type) => {
    await base44.entities.SnakeFamiliar.create({
      vampire_id: servantId,
      custom_name: `${servant.name}'s Serpent`,
      type: type,
      bond_level: 10,
      power_level: 20,
      loyalty: 50,
      hunger: 30,
      missions_completed: 0,
      unlocked_abilities: [],
      size: 'small'
    });

    await base44.entities.NightLog.create({
      entry: `${servant.name} adopted a ${SNAKE_TYPES.find(s => s.type === type).name}. A familiar bond begins.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setShowAdopt(false);
  };

  const getEvolutionStage = (power) => {
    if (power >= 70) return 3;
    if (power >= 40) return 2;
    return 1;
  };

  const handleInteraction = async (action) => {
    setInteracting(action.id);

    setTimeout(async () => {
      const outcomes = {
        feeds: [
          `Your snake coils around your wrist. You offer your blood. It drinks. The bond deepens. Your serpent glows with power.`,
          `Blood drips from your palm. The snake's fangs sink in gently. Taking what it needs. Sharing your vampire essence.`,
          `You feed your familiar. It hisses softly. Satisfied. The connection between you pulses stronger.`
        ],
        cuddles: [
          `You gather your snake close. It wraps around you. Warm. Content. Purring like thunder. Pure love.`,
          `Cuddle time. Your familiar coils in your lap. Scales smooth against your skin. Heart to heart. Perfect moment.`,
          `Your snake nuzzles into your neck. Safe. Loved. The bond between you radiates warmth. Unbreakable affection.`
        ],
        plays: [
          `You toss a shadow ball. Your snake chases it. Playful strikes. Laughter. Joy. Just enjoying each other.`,
          `Playtime! Your familiar weaves between your fingers. Happy hisses. Gentle bites. Pure fun.`,
          `You play hide and seek. Your snake finds you every time. Excited coils. Celebration. Bonding through play.`
        ],
        grooms: [
          `You carefully brush your snake's scales. Each one gleaming. Your familiar relaxes completely. Trust absolute.`,
          `Grooming session. You polish each scale with care. Your snake sighs contentedly. Beautiful. Loved.`,
          `You tend to your familiar's scales. Gentle touches. Appreciation. Your snake practically melts with happiness.`
        ],
        trains: [
          `You practice powers together. The snake mirrors your movements. Learning. Growing. Your abilities sync.`,
          `Training session. Your serpent strikes at shadows. Faster each time. You feel its progress as your own.`,
          `You channel energy through your familiar. It radiates power. Together you're stronger than apart.`
        ],
        bonds: [
          `You sit with your snake. It wraps around you. Protective. Loving. You understand each other without words.`,
          `Meditation together. Your minds link. You see through its eyes. Feel its thoughts. True companionship.`,
          `Your familiar nuzzles against you. Scales smooth and cool. Trust absolute. The bond unbreakable.`
        ],
        hunts: [
          `You hunt together in the night. Your snake strikes prey while you feed. Perfect teamwork. Primal connection.`,
          `The hunt. Your familiar tracks. You follow. Together you're an unstoppable predator team.`,
          `Hunting as one. The snake flushes out prey. You take them down. Share the blood. Partners in darkness.`
        ],
        guards: [
          `Your snake coils at the entrance. Watching. Waiting. Nothing gets past your vigilant guardian.`,
          `Guard duty complete. Your familiar spotted three threats. Hissed warnings. Kept you safe.`,
          `The serpent patrols silently. Eyes glowing in darkness. Your loyal protector never sleeps.`
        ],
        scouts: [
          `Your snake slithers ahead. Scouting the territory. Returns with knowledge of what lies ahead.`,
          `Reconnaissance successful. Your familiar mapped the area. Enemies located. Path clear.`,
          `The serpent scouts silently. No one sees it coming. Intelligence gathered. Mission complete.`
        ],
        attacks: [
          `Your snake strikes! Faster than before. Deadlier. Combat training paying off.`,
          `Attack drill. Your familiar demonstrates its bite. Precision. Power. Lethal efficiency.`,
          `Combat practice. The snake's venom flows stronger. Its fangs sharper. A weapon perfected.`
        ]
      };

      const result = outcomes[action.outcome][Math.floor(Math.random() * outcomes[action.outcome].length)];
      let message = result;

      const newBond = Math.min(100, snake.bond_level + action.bondGain);
      const newPower = Math.min(100, snake.power_level + action.powerGain);
      const newLoyalty = Math.min(100, snake.loyalty + (action.loyaltyGain || 5));
      
      const oldStage = getEvolutionStage(snake.power_level);
      const newStage = getEvolutionStage(newPower);
      
      const evolutionPath = EVOLUTION_PATHS[snake.type];
      const currentEvolution = evolutionPath[newStage - 1];
      const unlockedAbilities = currentEvolution.abilities;

      // Check for evolution
      if (newStage > oldStage) {
        message += `\n\n🐍 EVOLUTION! Your snake evolved into ${currentEvolution.name}! New abilities unlocked!`;
      }

      // Check for size growth
      let newSize = snake.size;
      if (newPower >= 80 && snake.size !== 'massive') {
        newSize = 'massive';
        message += `\n\n🐍 Your snake grew MASSIVE! Its presence intimidating.`;
      } else if (newPower >= 50 && snake.size === 'small') {
        newSize = 'large';
        message += `\n\n🐍 Your snake grew LARGE! More powerful than ever.`;
      } else if (newPower >= 30 && snake.size === 'small') {
        newSize = 'medium';
        message += `\n\n🐍 Your snake grew to MEDIUM size!`;
      }

      setOutcome(message);

      await base44.entities.SnakeFamiliar.update(snake.id, {
        bond_level: newBond,
        power_level: newPower,
        loyalty: newLoyalty,
        hunger: action.id === 'feed' ? 0 : Math.max(0, snake.hunger - 10),
        missions_completed: action.missionGain ? snake.missions_completed + 1 : snake.missions_completed,
        size: newSize,
        unlocked_abilities: unlockedAbilities
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} ${action.outcome} with their snake familiar. ${newStage > oldStage ? 'EVOLVED!' : ''}`,
        category: 'interaction',
        intensity: newStage > oldStage ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(null);
        setOutcome('');
      }, 5000);
    }, 2000);
  };

  if (!servant || !servant.is_turned) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Only vampire servants can have snake familiars</p>
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24" style={{
      background: 'linear-gradient(to bottom, #0f1419 0%, #1a0e1a 50%, #0a0014 100%)'
    }}>
      <button
        onClick={() => navigate(createPageUrl(`ServantHome?id=${servantId}`))}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {!snake ? (
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">🐍 Adopt Snake Familiar</h1>
            <p className="text-gray-400">Choose your serpent companion</p>
          </motion.div>

          <div className="space-y-4">
            {SNAKE_TYPES.map((type, i) => (
              <motion.button
                key={type.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleAdopt(type.type)}
                className={`w-full bg-gradient-to-r ${type.color} border-2 border-green-500/50 rounded-xl p-6 text-left hover:scale-105 transition-transform`}
              >
                <h3 className="text-white text-xl font-bold mb-2">{type.name}</h3>
                <p className="text-gray-300 text-sm">{type.ability}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-8xl mb-4">
              {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{snake.custom_name}</h1>
            <p className="text-gray-400 capitalize">{SNAKE_TYPES.find(s => s.type === snake.type)?.name}</p>
            
            <button
              onClick={() => setCarrying(!carrying)}
              className={`mt-3 px-6 py-2 rounded-lg font-medium transition-all ${
                carrying 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {carrying ? '🐍 Carrying with you' : 'Leave snake here'}
            </button>
            {carrying && (
              <p className="text-green-400 text-xs mt-2">Your snake is coiled around your arm, ready to assist</p>
            )}
          </motion.div>

          <div className={`bg-gradient-to-br ${EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].color} rounded-xl p-6 mb-6 border-2 border-green-500/50`}>
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-1">Evolution Stage {getEvolutionStage(snake.power_level)}/3</p>
              <p className="text-white text-lg font-bold">
                {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].name}
              </p>
              {getEvolutionStage(snake.power_level) < 3 && (
                <div className="mt-2">
                  <p className="text-purple-300 text-xs mb-1">Next: {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level)].name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}</span>
                    <span className="text-white">→</span>
                    <span className="text-3xl">{EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level)].emoji}</span>
                    <span className="text-gray-400 text-xs">at {getEvolutionStage(snake.power_level) === 1 ? '40' : '70'} power</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs">Bond</p>
                <p className="text-white text-xl font-bold">{snake.bond_level}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div style={{ width: `${snake.bond_level}%` }} className="h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Power</p>
                <p className="text-white text-xl font-bold">{snake.power_level}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div style={{ width: `${snake.power_level}%` }} className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Loyalty</p>
                <p className="text-white text-xl font-bold">{snake.loyalty}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Missions</p>
                <p className="text-white text-xl font-bold">{snake.missions_completed}</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 mb-3">
              <p className="text-gray-400 text-xs mb-1">Size</p>
              <p className="text-white capitalize">{snake.size}</p>
            </div>

            {/* Abilities Section */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-purple-200 font-bold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Unlocked Abilities
              </h3>
              <div className="space-y-2">
                {(snake.unlocked_abilities || EVOLUTION_PATHS[snake.type][0].abilities).map((ability, i) => (
                  <div key={i} className="bg-black/30 rounded-lg p-2 border border-purple-500/20">
                    <p className="text-purple-100 text-sm font-medium">✨ {ability}</p>
                  </div>
                ))}
              </div>
              {getEvolutionStage(snake.power_level) < 3 && (
                <p className="text-purple-300 text-xs mt-3">
                  Next evolution at {getEvolutionStage(snake.power_level) === 1 ? '40' : '70'} power
                </p>
              )}
            </div>
          </div>

          {!outcome ? (
            <div className="space-y-3">
              {INTERACTIONS.map((action, i) => {
                const ActionIcon = action.id === 'guard' ? Shield : action.id === 'scout' ? Eye : action.id === 'attack' ? Sword : action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleInteraction(action)}
                    disabled={!!interacting}
                    className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg transition-all disabled:opacity-50"
                  >
                    <ActionIcon className="w-5 h-5 text-white" />
                    <span className="text-base font-medium text-white">
                      {interacting === action.id ? 'Interacting...' : action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-2xl p-6 text-center"
            >
              <p className="text-gray-300 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}