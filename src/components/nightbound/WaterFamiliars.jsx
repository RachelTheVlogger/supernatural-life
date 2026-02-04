import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fish, Waves, Heart, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const FAMILIAR_TYPES = [
  { id: 'dolphin', name: 'Dolphin', icon: '🐬', bond: 15, abilities: ['Echo location', 'Speed boost', 'Rescue assist'] },
  { id: 'seahorse', name: 'Giant Seahorse', icon: '🐴', bond: 10, abilities: ['Water breathing extension', 'Camouflage', 'Gentle nature'] },
  { id: 'octopus', name: 'Mystic Octopus', icon: '🐙', bond: 20, abilities: ['Ink cloud', 'Shapeshifting aid', 'Intelligence'] },
  { id: 'whale', name: 'Whale', icon: '🐋', bond: 30, abilities: ['Deep dive mastery', 'Sonic communication', 'Immense power'] },
  { id: 'serpent', name: 'Sea Serpent', icon: '🐉', bond: 40, abilities: ['Combat prowess', 'Treasure guardian', 'Fear inducement'] },
  { id: 'turtle', name: 'Ancient Turtle', icon: '🐢', bond: 12, abilities: ['Wisdom sharing', 'Longevity blessing', 'Protection'] },
  { id: 'jellyfish', name: 'Luminous Jellyfish', icon: '🪼', bond: 8, abilities: ['Bioluminescence', 'Venom defense', 'Beauty'] },
  { id: 'koi', name: 'Celestial Koi', icon: '🐟', bond: 15, abilities: ['Luck blessing', 'Harmony', 'Purification'] }
];

export default function WaterFamiliars({ nymph, onClose }) {
  const queryClient = useQueryClient();
  const [bonding, setBonding] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedFamiliar, setSelectedFamiliar] = useState(null);

  const familiars = nymph.water_familiars || [];

  const handleBond = async (familiar) => {
    const bondRequired = familiar.bond;
    const currentBond = nymph.nature_bond || 50;

    if (currentBond < bondRequired) {
      alert(`Need ${bondRequired} nature bond to bond with ${familiar.name}. Current: ${currentBond}`);
      return;
    }

    setBonding(true);

    setTimeout(async () => {
      setOutcome(`You reached out to the ${familiar.name}. ${familiar.icon} They approached. Curious. Trusting. You bonded. Soul to soul. They're yours now. Forever loyal.`);

      const newFamiliar = {
        type: familiar.id,
        name: familiar.name,
        bonded_date: new Date().toISOString(),
        loyalty: 100,
        power_contribution: familiar.bond
      };

      await base44.entities.WaterNymph.update(nymph.id, {
        water_familiars: [...familiars, newFamiliar],
        nature_bond: currentBond + familiar.bond,
        connection: Math.min(100, (nymph.connection || 50) + 10)
      });

      await base44.entities.NightLog.create({
        entry: `Bonded with ${familiar.name}. Nature's children recognize you.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setBonding(false);
        setOutcome('');
      }, 5000);
    }, 3000);
  };

  const handleInteractFamiliar = async (familiar, action) => {
    setBonding(true);

    setTimeout(async () => {
      const interactions = {
        play: `You played with your ${familiar.name}. Swimming together. Joy. Simple happiness. They nuzzled you affectionately.`,
        train: `You trained with your ${familiar.name}. Practicing abilities together. Power synchronized. Bond strengthened.`,
        mission: `You sent your ${familiar.name} on a task. They returned successful. Loyal. Capable. Perfect companion.`
      };

      setOutcome(interactions[action]);

      await base44.entities.NightLog.create({
        entry: interactions[action],
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setSelectedFamiliar(null);

      setTimeout(() => {
        setBonding(false);
        setOutcome('');
      }, 3000);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-teal-950 to-blue-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Water Familiars</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 rounded-xl p-4 mb-6 border border-teal-500/30"
          >
            <p className="text-teal-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {!selectedFamiliar ? (
          <>
            {/* Bond New Familiar */}
            <div className="mb-6">
              <h3 className="text-white font-bold mb-3">Bond with Creature</h3>
              <p className="text-gray-400 text-sm mb-4">Your nature bond: {nymph.nature_bond || 50}</p>
              <div className="space-y-2">
                {FAMILIAR_TYPES.map(f => {
                  const bonded = familiars.some(fam => fam.type === f.id);
                  const canBond = (nymph.nature_bond || 50) >= f.bond;

                  return (
                    <button
                      key={f.id}
                      onClick={() => !bonded && handleBond(f)}
                      disabled={bonded || !canBond || bonding}
                      className={`w-full rounded-xl p-4 text-left transition-all ${
                        bonded
                          ? 'bg-green-900/40 border border-green-500/30 opacity-60'
                          : !canBond
                          ? 'bg-gray-800/40 border border-gray-600/30 opacity-40'
                          : 'bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{f.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium">{f.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              !canBond ? 'bg-red-900/50 text-red-300' : 'bg-teal-900/50 text-teal-300'
                            }`}>
                              {f.bond} bond required
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">{f.abilities.join(' • ')}</p>
                          {bonded && <span className="text-xs text-green-400 mt-1 block">✓ Bonded</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Your Familiars */}
            {familiars.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-3">Your Bonded Companions ({familiars.length})</h3>
                <div className="space-y-2">
                  {familiars.map((f, i) => {
                    const familiarData = FAMILIAR_TYPES.find(ft => ft.id === f.type);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedFamiliar(f)}
                        className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-3 border border-teal-500/20 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{familiarData?.icon || '🐟'}</span>
                          <div>
                            <h4 className="text-teal-300 font-medium text-sm">{f.name}</h4>
                            <p className="text-gray-400 text-xs">Loyalty: {f.loyalty}%</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : selectedFamiliar && (
          <div>
            <button
              onClick={() => setSelectedFamiliar(null)}
              className="text-gray-400 hover:text-white mb-4 text-sm"
            >
              ← Back
            </button>

            <div className="bg-black/40 rounded-xl p-4 border border-teal-500/30 mb-6">
              <h3 className="text-white font-bold">{selectedFamiliar.name}</h3>
              <p className="text-gray-400 text-sm">Loyalty: {selectedFamiliar.loyalty}%</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleInteractFamiliar(selectedFamiliar, 'play')}
                disabled={bonding}
                className="w-full bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/30 rounded-xl py-3 px-4 transition-all disabled:opacity-50"
              >
                <Heart className="w-5 h-5 text-teal-400 inline mr-2" />
                <span className="text-white">Play Together</span>
              </button>

              <button
                onClick={() => handleInteractFamiliar(selectedFamiliar, 'train')}
                disabled={bonding}
                className="w-full bg-blue-900/60 hover:bg-blue-900/80 border border-blue-500/30 rounded-xl py-3 px-4 transition-all disabled:opacity-50"
              >
                <Zap className="w-5 h-5 text-blue-400 inline mr-2" />
                <span className="text-white">Train Abilities</span>
              </button>

              <button
                onClick={() => handleInteractFamiliar(selectedFamiliar, 'mission')}
                disabled={bonding}
                className="w-full bg-purple-900/60 hover:bg-purple-900/80 border border-purple-500/30 rounded-xl py-3 px-4 transition-all disabled:opacity-50"
              >
                <Fish className="w-5 h-5 text-purple-400 inline mr-2" />
                <span className="text-white">Send on Mission</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}