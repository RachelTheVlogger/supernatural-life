import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Heart, Moon, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function WitchFamiliarDeep({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState('');
  const [interacting, setInteracting] = useState(false);

  const { data: familiars = [] } = useQuery({
    queryKey: ['witchFamiliars'],
    queryFn: async () => {
      try {
        return await base44.entities.WitchFamiliar.list();
      } catch (e) {
        return [];
      }
    }
  });

  const myFamiliar = familiars.find(f => f.witch_id === witch.id);

  const familiarTypes = [
    { id: 'cat', name: 'Shadow Cat', power: 'Spell Channeling', icon: '🐈‍⬛', color: 'from-purple-900 to-black' },
    { id: 'raven', name: 'Moon Raven', power: 'Prophecy & Vision', icon: '🦅', color: 'from-indigo-900 to-black' },
    { id: 'owl', name: 'Wisdom Owl', power: 'Ancient Knowledge', icon: '🦉', color: 'from-blue-900 to-cyan-900' },
    { id: 'serpent', name: 'Mystic Serpent', power: 'Transformation Magic', icon: '🐍', color: 'from-green-900 to-emerald-900' }
  ];

  const handleGetFamiliar = async (type) => {
    setInteracting(true);

    try {
      const familiar = familiarTypes.find(f => f.id === type);
      
      await base44.entities.WitchFamiliar.create({
        witch_id: witch.id,
        name: familiar.name,
        type: type,
        bond_level: 15,
        magic_power: 25,
        loyalty: 60,
        missions_completed: 0
      });

      await base44.entities.NightLog.create({
        entry: `${familiar.name} appeared from the moonlight. Your familiar. Your magical companion.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome(`${familiar.name} is now bound to you. A true witch's companion.`);

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 3000);
    } catch (e) {
      console.error('Failed to create familiar:', e);
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
          result = `You fed ${myFamiliar.name} enchanted herbs. Magic flows between you. The bond strengthens.`;
          bondChange = Math.floor(Math.random() * 5) + 4;
          await base44.entities.WitchFamiliar.update(myFamiliar.id, {
            bond_level: Math.min(100, (myFamiliar.bond_level || 0) + bondChange),
            loyalty: Math.min(100, (myFamiliar.loyalty || 60) + 3)
          });
          break;

        case 'spell':
          result = `${myFamiliar.name} channels your spell. The magic amplifies. Stronger together than apart.`;
          powerChange = Math.floor(Math.random() * 10) + 8;
          await base44.entities.WitchFamiliar.update(myFamiliar.id, {
            magic_power: Math.min(100, (myFamiliar.magic_power || 0) + powerChange)
          });
          await base44.entities.Witch.update(witch.id, {
            magic_level: Math.min(100, (witch.magic_level || 50) + 5)
          });
          break;

        case 'ritual':
          result = `Full moon ritual. You and ${myFamiliar.name} dance under moonlight. Power surges through both of you.`;
          bondChange = Math.floor(Math.random() * 8) + 6;
          powerChange = Math.floor(Math.random() * 12) + 8;
          await base44.entities.WitchFamiliar.update(myFamiliar.id, {
            bond_level: Math.min(100, (myFamiliar.bond_level || 0) + bondChange),
            magic_power: Math.min(100, (myFamiliar.magic_power || 0) + powerChange)
          });
          break;

        case 'scout':
          const scoutResults = [
            `${myFamiliar.name} returns with news. A hunter nearby. You prepare defenses.`,
            `Your familiar found rare herbs in the forest. You harvest them together.`,
            `${myFamiliar.name} scouted the vampire's lair. Reports back their movements.`,
            `Strange magic detected. Your familiar warns you. Someone's casting nearby.`
          ];
          result = scoutResults[Math.floor(Math.random() * scoutResults.length)];
          await base44.entities.WitchFamiliar.update(myFamiliar.id, {
            missions_completed: (myFamiliar.missions_completed || 0) + 1
          });
          break;

        case 'merge':
          result = `You merge consciousness with ${myFamiliar.name}. See through their eyes. Feel their magic. Perfect union.`;
          bondChange = Math.floor(Math.random() * 12) + 10;
          await base44.entities.WitchFamiliar.update(myFamiliar.id, {
            bond_level: Math.min(100, (myFamiliar.bond_level || 0) + bondChange),
            loyalty: 100
          });
          break;

        case 'teach':
          result = `You teach ${myFamiliar.name} a new trick. They learn eagerly. Magic refined.`;
          powerChange = Math.floor(Math.random() * 8) + 5;
          await base44.entities.WitchFamiliar.update(myFamiliar.id, {
            magic_power: Math.min(100, (myFamiliar.magic_power || 0) + powerChange),
            bond_level: Math.min(100, (myFamiliar.bond_level || 0) + 3)
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
        className="bg-gradient-to-br from-purple-950 to-indigo-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-purple-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Witch's Familiar</h2>
        <p className="text-purple-300 text-sm mb-6">
          A magical companion. Bound by ancient rites.
        </p>

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-purple-500/30"
            >
              <p className="text-purple-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : interacting ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
            </motion.div>
          </div>
        ) : !myFamiliar ? (
          <div className="space-y-3">
            <p className="text-gray-300 mb-4">Call your familiar:</p>
            {familiarTypes.map(familiar => (
              <button
                key={familiar.id}
                onClick={() => handleGetFamiliar(familiar.id)}
                className={`w-full bg-gradient-to-r ${familiar.color} border border-purple-500/30 rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{familiar.icon}</span>
                    <div>
                      <h4 className="text-white font-bold">{familiar.name}</h4>
                      <p className="text-gray-400 text-sm">{familiar.power}</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {/* Familiar Stats */}
            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-purple-500/30">
              <h3 className="text-white font-bold mb-3">{myFamiliar.name}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">Bond Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${myFamiliar.bond_level}%` }} className="h-2 bg-purple-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{myFamiliar.bond_level}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Magic Power</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${myFamiliar.magic_power}%` }} className="h-2 bg-indigo-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{myFamiliar.magic_power}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Loyalty</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${myFamiliar.loyalty}%` }} className="h-2 bg-pink-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{myFamiliar.loyalty}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Missions</p>
                  <span className="text-white text-sm font-medium">{myFamiliar.missions_completed || 0}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleInteraction('feed')}
                className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Feed Enchanted Herbs</p>
                    <p className="text-gray-400 text-xs">Strengthen bond</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('spell')}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Cast Spell Together</p>
                    <p className="text-gray-400 text-xs">Amplify magic</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('ritual')}
                className="w-full bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-white font-medium">Moon Ritual</p>
                    <p className="text-gray-400 text-xs">Deep bonding</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('scout')}
                className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Send to Scout</p>
                    <p className="text-gray-400 text-xs">Gather information</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('merge')}
                className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="text-white font-medium">Merge Consciousness</p>
                    <p className="text-gray-400 text-xs">See through their eyes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInteraction('teach')}
                className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-white font-medium">Teach New Trick</p>
                    <p className="text-gray-400 text-xs">Refine magic</p>
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