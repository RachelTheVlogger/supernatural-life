import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Heart, Eye, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function VampireSnakeFamiliar({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState('');
  const [interacting, setInteracting] = useState(false);

  const { data: snakes = [] } = useQuery({
    queryKey: ['snakeFamiliars'],
    queryFn: async () => {
      try {
        // Check if entity exists, if not we'll create one
        return await base44.entities.SnakeFamiliar.list();
      } catch (e) {
        return [];
      }
    }
  });

  const mySnake = snakes.find(s => s.vampire_id === vampireState.id);

  const snakeTypes = [
    { id: 'shadow', name: 'Shadow Serpent', power: 'Stealth & Surveillance', icon: '🐍', color: 'from-gray-900 to-black' },
    { id: 'venom', name: 'Venom Viper', power: 'Paralytic Bite', icon: '🐍', color: 'from-green-900 to-emerald-900' },
    { id: 'blood', name: 'Blood Python', power: 'Blood Tracking', icon: '🐍', color: 'from-red-900 to-rose-900' },
    { id: 'nightmare', name: 'Nightmare Cobra', power: 'Fear Projection', icon: '🐍', color: 'from-purple-900 to-violet-900' }
  ];

  const handleGetSnake = async (type) => {
    setInteracting(true);

    try {
      const snake = snakeTypes.find(s => s.id === type);
      
      await base44.entities.SnakeFamiliar.create({
        vampire_id: vampireState.id,
        name: snake.name,
        type: type,
        bond_level: 10,
        power_level: 20,
        loyalty: 50,
        hunger: 30,
        missions_completed: 0
      });

      await base44.entities.NightLog.create({
        entry: `A ${snake.name} slithered from the shadows. Your familiar. Your spy. Your weapon.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome(`${snake.name} is now yours. Feed it blood. Train it. Use it.`);

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 3000);
    } catch (e) {
      console.error('Failed to create snake:', e);
      setInteracting(false);
    }
  };

  const handleInteraction = async (action) => {
    setInteracting(true);

    setTimeout(async () => {
      let result = '';
      let bondChange = 0;
      let powerChange = 0;

      switch (action) {
        case 'feed':
          result = `You fed ${mySnake.name} vampire blood. Its eyes glow red. Power courses through its scales.`;
          bondChange = Math.floor(Math.random() * 5) + 3;
          powerChange = Math.floor(Math.random() * 10) + 5;
          await base44.entities.SnakeFamiliar.update(mySnake.id, {
            hunger: Math.max(0, (mySnake.hunger || 50) - 30),
            bond_level: Math.min(100, (mySnake.bond_level || 0) + bondChange),
            power_level: Math.min(100, (mySnake.power_level || 0) + powerChange)
          });
          break;

        case 'train':
          result = `Training session. ${mySnake.name} learns to strike faster, hide better. A perfect predator.`;
          bondChange = Math.floor(Math.random() * 3) + 2;
          powerChange = Math.floor(Math.random() * 8) + 4;
          await base44.entities.SnakeFamiliar.update(mySnake.id, {
            bond_level: Math.min(100, (mySnake.bond_level || 0) + bondChange),
            power_level: Math.min(100, (mySnake.power_level || 0) + powerChange)
          });
          break;

        case 'spy':
          const spyResults = [
            'Your snake returns. It saw a hunter planning an ambush. You avoid the trap.',
            'The serpent brings information. A rival vampire\'s weakness. Useful.',
            'Your familiar spied on the witch. She knows you\'re watching. She smiled.',
            'The snake tracked a human. Found their home. Their routine. Their vulnerability.'
          ];
          result = spyResults[Math.floor(Math.random() * spyResults.length)];
          await base44.entities.SnakeFamiliar.update(mySnake.id, {
            missions_completed: (mySnake.missions_completed || 0) + 1
          });
          break;

        case 'hunt':
          result = `${mySnake.name} hunted. Brought back a paralyzed victim. Fresh blood for you.`;
          await base44.entities.SnakeFamiliar.update(mySnake.id, {
            missions_completed: (mySnake.missions_completed || 0) + 1,
            hunger: Math.min(100, (mySnake.hunger || 30) + 20)
          });
          await base44.entities.VampireState.update(vampireState.id, {
            hunger_state: 'sated'
          });
          break;

        case 'bond':
          result = `You and ${mySnake.name} share blood. Minds linking. You feel what it feels. See what it sees. Perfect symbiosis.`;
          bondChange = Math.floor(Math.random() * 10) + 5;
          await base44.entities.SnakeFamiliar.update(mySnake.id, {
            bond_level: Math.min(100, (mySnake.bond_level || 0) + bondChange),
            loyalty: Math.min(100, (mySnake.loyalty || 50) + 5)
          });
          break;
      }

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(result);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 3500);
    }, 2000);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-green-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Vampire Snake Familiar</h2>
        <p className="text-gray-400 text-sm mb-6">
          A serpent bound to you. Your spy. Your weapon. Your companion.
        </p>

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-green-500/30"
            >
              <p className="text-green-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : interacting ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="text-6xl">🐍</div>
            </motion.div>
          </div>
        ) : !mySnake ? (
          <div className="space-y-3">
            <p className="text-gray-300 mb-4">Choose your serpent familiar:</p>
            {snakeTypes.map(snake => (
              <button
                key={snake.id}
                onClick={() => handleGetSnake(snake.id)}
                className={`w-full bg-gradient-to-r ${snake.color} border border-green-500/30 rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{snake.icon}</span>
                    <div>
                      <h4 className="text-white font-bold">{snake.name}</h4>
                      <p className="text-gray-400 text-sm">{snake.power}</p>
                    </div>
                  </div>
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {/* Snake Stats */}
            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-green-500/30">
              <h3 className="text-white font-bold mb-3">{mySnake.name}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">Bond Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.bond_level}%` }} className="h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.bond_level}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Power Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.power_level}%` }} className="h-2 bg-red-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.power_level}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Loyalty</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.loyalty}%` }} className="h-2 bg-purple-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.loyalty}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Hunger</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.hunger}%` }} className="h-2 bg-orange-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.hunger}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3">Missions: {mySnake.missions_completed || 0}</p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleInteraction('feed')}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Skull className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">Feed Vampire Blood</p>
                    <p className="text-gray-400 text-xs">Increase power & bond</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('train')}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Train</p>
                    <p className="text-gray-400 text-xs">Improve abilities</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('spy')}
                className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Send to Spy</p>
                    <p className="text-gray-400 text-xs">Gather intelligence</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('hunt')}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Skull className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">Hunt for You</p>
                    <p className="text-gray-400 text-xs">Bring back prey</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('bond')}
                className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Deepen Bond</p>
                    <p className="text-gray-400 text-xs">Share blood & minds</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}