import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, Zap, Droplets, Moon } from 'lucide-react';

const SNAKE_TYPES = [
  { type: 'shadow', name: 'Shadow Serpent', color: 'from-gray-900 to-black', ability: 'Stealth and illusions' },
  { type: 'venom', name: 'Venom Viper', color: 'from-purple-900 to-pink-900', ability: 'Poison and paralysis' },
  { type: 'blood', name: 'Blood Python', color: 'from-red-900 to-rose-900', ability: 'Blood magic enhancement' },
  { type: 'nightmare', name: 'Nightmare Cobra', color: 'from-indigo-900 to-purple-900', ability: 'Fear and mind control' }
];

const INTERACTIONS = [
  { id: 'feed', label: 'Feed Blood', icon: Droplets, bondGain: 5, outcome: 'feeds' },
  { id: 'train', label: 'Train Powers', icon: Zap, bondGain: 8, outcome: 'trains' },
  { id: 'bond', label: 'Bond Together', icon: Heart, bondGain: 10, outcome: 'bonds' },
  { id: 'hunt', label: 'Hunt Together', icon: Moon, bondGain: 12, outcome: 'hunts' }
];

export default function ServantSnake() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [showAdopt, setShowAdopt] = useState(false);

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

  const handleInteraction = async (action) => {
    setInteracting(action.id);

    setTimeout(async () => {
      const outcomes = {
        feeds: [
          `Your snake coils around your wrist. You offer your blood. It drinks. The bond deepens. Your serpent glows with power.`,
          `Blood drips from your palm. The snake's fangs sink in gently. Taking what it needs. Sharing your vampire essence.`,
          `You feed your familiar. It hisses softly. Satisfied. The connection between you pulses stronger.`
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
        ]
      };

      const result = outcomes[action.outcome][Math.floor(Math.random() * outcomes[action.outcome].length)];
      setOutcome(result);

      const newBond = Math.min(100, snake.bond_level + action.bondGain);
      const newPower = Math.min(100, snake.power_level + Math.floor(Math.random() * 3) + 1);
      const newLoyalty = Math.min(100, snake.loyalty + 5);

      await base44.entities.SnakeFamiliar.update(snake.id, {
        bond_level: newBond,
        power_level: newPower,
        loyalty: newLoyalty,
        hunger: action.id === 'feed' ? 0 : Math.max(0, snake.hunger - 10),
        missions_completed: action.id === 'hunt' ? snake.missions_completed + 1 : snake.missions_completed
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} ${action.outcome} with their snake familiar. Bond: ${newBond}%`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(null);
        setOutcome('');
      }, 4000);
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
            <h1 className="text-3xl font-bold text-white mb-2">🐍 {snake.custom_name}</h1>
            <p className="text-gray-400 capitalize">{SNAKE_TYPES.find(s => s.type === snake.type)?.name}</p>
          </motion.div>

          <div className="bg-gray-900 rounded-xl p-6 mb-6">
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
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Size</p>
              <p className="text-white capitalize">{snake.size}</p>
            </div>
          </div>

          {!outcome ? (
            <div className="space-y-3">
              {INTERACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleInteraction(action)}
                  disabled={!!interacting}
                  className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg transition-all disabled:opacity-50"
                >
                  <action.icon className="w-5 h-5 text-white" />
                  <span className="text-base font-medium text-white">
                    {interacting === action.id ? 'Interacting...' : action.label}
                  </span>
                </motion.button>
              ))}
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