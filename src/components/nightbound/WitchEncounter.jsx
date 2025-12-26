import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Shield, Flame, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SPECIALTIES = {
  elemental: { icon: '🌊', name: 'Elemental Magic', color: 'blue' },
  psychic: { icon: '🔮', name: 'Psychic Magic', color: 'purple' },
  necromancy: { icon: '💀', name: 'Necromancy', color: 'green' },
  healing: { icon: '✨', name: 'Healing Magic', color: 'pink' },
  dark_magic: { icon: '🌑', name: 'Dark Magic', color: 'red' }
};

export default function WitchEncounter({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedWitch, setSelectedWitch] = useState(null);

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list('-created_date')
  });

  const handleEncounter = async () => {
    if (witches.length === 0) {
      // Generate first witch
      const names = ['Cassandra', 'Luna', 'Morgana', 'Willow', 'Raven'];
      const specialties = Object.keys(SPECIALTIES);
      const dispositions = ['hostile', 'wary', 'neutral', 'curious'];

      const witch = await base44.entities.Witch.create({
        name: names[Math.floor(Math.random() * names.length)],
        power_level: Math.floor(Math.random() * 20) + 75,
        specialty: specialties[Math.floor(Math.random() * specialties.length)],
        disposition: dispositions[Math.floor(Math.random() * dispositions.length)],
        knows_vampire_secret: false,
        can_suppress_vampire: true
      });

      queryClient.invalidateQueries(['witches']);
      setSelectedWitch(witch);
    } else {
      setSelectedWitch(witches[Math.floor(Math.random() * witches.length)]);
    }
  };

  const handleInteraction = async (action) => {
    if (!selectedWitch) return;
    setInteracting(true);

    const messages = {
      approach: [
        `You sense ${selectedWitch.name}'s power from across the street. She notices you immediately.`,
        `${selectedWitch.name} looks up from her book. Her eyes glow faintly. "Vampire," she says.`,
        `The air crackles with magic as ${selectedWitch.name} turns to face you.`
      ],
      negotiate: [
        `"What do you want, bloodsucker?" ${selectedWitch.name} asks warily.`,
        `${selectedWitch.name} listens to your offer. Her expression is unreadable.`,
        `"An alliance? With a vampire?" She considers it.`
      ],
      threaten: [
        `${selectedWitch.name} laughs. "You threaten me?" Magic crackles at her fingertips.`,
        `Before you can react, you're slammed against the wall by invisible force.`,
        `"Know your place, vampire." The pain is excruciating.`
      ],
      ally: [
        `${selectedWitch.name} nods slowly. "This could be... useful."`,
        `"Fine. But if you betray me, I'll make you wish you stayed dead."`,
        `A powerful ally secured. Her magic could prove invaluable.`
      ]
    };

    setTimeout(async () => {
      let relChange = 0;
      let dispChange = null;
      let newOutcome = '';

      if (action === 'approach') {
        relChange = Math.floor(Math.random() * 10) + 5;
        newOutcome = messages.approach[Math.floor(Math.random() * messages.approach.length)];
      } else if (action === 'negotiate') {
        if (selectedWitch.disposition === 'hostile') {
          relChange = -10;
          newOutcome = `${selectedWitch.name} refuses. "I don't work with monsters."`;
        } else {
          relChange = 15;
          dispChange = 'curious';
          newOutcome = messages.negotiate[Math.floor(Math.random() * messages.negotiate.length)];
        }
      } else if (action === 'threaten') {
        relChange = -30;
        dispChange = 'hostile';
        const humanityLoss = -5;
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: Math.max(0, vampireState.humanity + humanityLoss)
        });
        newOutcome = messages.threaten[Math.floor(Math.random() * messages.threaten.length)];
      } else if (action === 'ally') {
        if (selectedWitch.relationship < 30) {
          newOutcome = `${selectedWitch.name} shakes her head. "I don't trust you enough yet."`;
        } else {
          relChange = 25;
          dispChange = 'allied';
          newOutcome = messages.ally[Math.floor(Math.random() * messages.ally.length)];
        }
      }

      await base44.entities.Witch.update(selectedWitch.id, {
        relationship: Math.max(-100, Math.min(100, selectedWitch.relationship + relChange)),
        disposition: dispChange || selectedWitch.disposition,
        knows_vampire_secret: true,
        last_encounter: new Date().toISOString()
      });

      await base44.entities.NightLog.create({
        entry: newOutcome,
        category: 'interaction',
        intensity: action === 'threaten' ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries();
      setOutcome(newOutcome);

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
        setSelectedWitch(null);
      }, 3000);
    }, 1500);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Witch Encounters</h2>
            <p className="text-gray-400 text-sm">Powerful magic users. Bonnie Bennett level.</p>
          </div>
        </div>

        {!selectedWitch && !interacting && (
          <>
            <div className="grid gap-4 mb-6">
              {witches.map(witch => (
                <div key={witch.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{witch.name}</h3>
                      <p className="text-gray-400 text-sm">{SPECIALTIES[witch.specialty].name}</p>
                    </div>
                    <span className="text-3xl">{SPECIALTIES[witch.specialty].icon}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-900 rounded p-2">
                      <p className="text-gray-500 text-xs">Power</p>
                      <p className="text-purple-400 font-bold">{witch.power_level}/100</p>
                    </div>
                    <div className="bg-gray-900 rounded p-2">
                      <p className="text-gray-500 text-xs">Disposition</p>
                      <p className="text-white capitalize">{witch.disposition}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Relationship</span>
                      <span className="text-white">{witch.relationship}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        style={{ width: `${Math.max(0, (witch.relationship + 100) / 2)}%` }} 
                        className={`h-2 rounded-full ${
                          witch.relationship > 50 ? 'bg-green-500' :
                          witch.relationship > 0 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} 
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedWitch(witch)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg mt-2"
                  >
                    Interact
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleEncounter}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 rounded-xl"
            >
              {witches.length === 0 ? 'Encounter a Witch' : 'Find Another Witch'}
            </button>
          </>
        )}

        {selectedWitch && !interacting && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <span className="text-6xl mb-4 block">{SPECIALTIES[selectedWitch.specialty].icon}</span>
              <h3 className="text-white text-2xl font-bold mb-2">{selectedWitch.name}</h3>
              <p className="text-purple-400 mb-4">{SPECIALTIES[selectedWitch.specialty].name}</p>
              <p className="text-gray-300 text-sm mb-1">Power Level: {selectedWitch.power_level}/100</p>
              <p className="text-gray-300 text-sm capitalize">{selectedWitch.disposition}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleInteraction('approach')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
              >
                Approach Peacefully
              </button>
              <button
                onClick={() => handleInteraction('negotiate')}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
              >
                Negotiate
              </button>
              {selectedWitch.relationship >= 30 && (
                <button
                  onClick={() => handleInteraction('ally')}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl col-span-2"
                >
                  Propose Alliance
                </button>
              )}
              <button
                onClick={() => handleInteraction('threaten')}
                className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl col-span-2"
              >
                Threaten (Dangerous)
              </button>
            </div>

            <button
              onClick={() => setSelectedWitch(null)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
            >
              Back
            </button>
          </motion.div>
        )}

        {(interacting || outcome) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            {interacting && (
              <>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <p className="text-gray-400">Magic crackling in the air...</p>
              </>
            )}
            {outcome && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <p className="text-white text-lg">{outcome}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}