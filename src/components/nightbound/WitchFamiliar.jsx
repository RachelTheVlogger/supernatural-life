import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const FAMILIARS = [
  { type: 'cat', name: 'Shadow', icon: '🐱', power: 15, ability: 'Night vision & stealth' },
  { type: 'raven', name: 'Corvus', icon: '🐦‍⬛', power: 20, ability: 'Messenger & prophecy' },
  { type: 'owl', name: 'Athena', icon: '🦉', power: 18, ability: 'Wisdom & insight' },
  { type: 'snake', name: 'Serpent', icon: '🐍', power: 22, ability: 'Venom & transformation' },
  { type: 'toad', name: 'Hemlock', icon: '🐸', power: 16, ability: 'Potion enhancement' },
  { type: 'bat', name: 'Echo', icon: '🦇', power: 19, ability: 'Echo location & night flight' }
];

export default function WitchFamiliar({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [bonding, setBonding] = useState(null);
  const [outcome, setOutcome] = useState('');

  const familiar = witch.familiar_type ? FAMILIARS.find(f => f.type === witch.familiar_type) : null;

  const handleBond = async (familiarType) => {
    setBonding(familiarType);
    
    setTimeout(async () => {
      const chosen = FAMILIARS.find(f => f.type === familiarType.type);
      
      await base44.entities.Witch.update(witch.id, {
        familiar_type: chosen.type,
        familiar_bond: 50,
        power_level: witch.power_level + chosen.power
      });

      await base44.entities.NightLog.create({
        entry: `${chosen.name} bonded with you. Your familiar is here.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`${chosen.name} ${chosen.icon} is now your familiar! +${chosen.power} power`);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setBonding(null);
        setOutcome('');
      }, 3000);
    }, 3000);
  };

  const handleFeed = async () => {
    setBonding('feeding');
    
    setTimeout(async () => {
      const newBond = Math.min(100, (witch.familiar_bond || 0) + 10);
      
      await base44.entities.Witch.update(witch.id, {
        familiar_bond: newBond
      });

      setOutcome(`${familiar.name} is happy. Bond strengthened to ${newBond}%`);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setBonding(null);
        setOutcome('');
      }, 2500);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={() => !bonding && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {!bonding && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">🐾 Familiar Companion</h2>
        <p className="text-gray-400 text-sm mb-6">Every witch needs a magical companion</p>

        {!outcome && (
          <>
            {familiar ? (
              <div>
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-6 mb-6 text-center">
                  <span className="text-6xl mb-4 block">{familiar.icon}</span>
                  <h3 className="text-white text-2xl font-bold mb-2">{familiar.name}</h3>
                  <p className="text-purple-300 mb-4">{familiar.ability}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-white font-bold">{witch.familiar_bond}% Bond</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div style={{ width: `${witch.familiar_bond}%` }} className="bg-pink-500 h-2 rounded-full" />
                  </div>
                  <button
                    onClick={handleFeed}
                    className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg py-3 text-pink-300"
                  >
                    Feed & Bond
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400 text-center mb-4">Choose your familiar companion</p>
                {FAMILIARS.map(fam => (
                  <button
                    key={fam.type}
                    onClick={() => handleBond(fam)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{fam.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{fam.name}</h3>
                        <p className="text-gray-400 text-sm">{fam.ability}</p>
                      </div>
                      <span className="text-purple-400 text-sm">+{fam.power} power</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {bonding && !outcome && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-6xl">✨</span>
              <p className="text-gray-400 mt-4">Bonding...</p>
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="py-8">
            <p className="text-gray-300 text-center leading-relaxed">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}