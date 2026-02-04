import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, Map, Gem, Scroll, X, Fish, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DISCOVERIES = [
  { type: 'shipwreck', name: 'Spanish Galleon', treasure: 'Gold doubloons, ancient map', power: 5, story: 'Centuries-old wreck. Skeletons still at their posts. You took their gold. Their stories.' },
  { type: 'temple', name: 'Atlantean Temple', treasure: 'Trident fragment, forbidden knowledge', power: 15, story: 'Ruins of lost civilization. Glowing inscriptions. Ancient power seeping through stone.' },
  { type: 'shipwreck', name: 'Pirate Ship', treasure: 'Cursed treasure, captain\'s journal', power: 8, story: 'Black flag still flying underwater. Mutiny. Murder. Their ghosts whisper secrets.' },
  { type: 'graveyard', name: 'Sailor\'s Graveyard', treasure: 'Souls of the drowned', power: 12, story: 'Hundreds drowned here. Their spirits linger. You could bind them. Command them.' },
  { type: 'temple', name: 'Poseidon\'s Shrine', treasure: 'Divine blessing', power: 20, story: 'Temple of the Sea God. You knelt. Prayed. Power surged through you. Blessed.' },
  { type: 'cave', name: 'Pearl Caves', treasure: 'Black pearls, magical shells', power: 6, story: 'Bioluminescent cave. Pearls that glow with moonlight. Worth a fortune. Yours now.' },
  { type: 'shipwreck', name: 'Titanic Wreck', treasure: 'Memories of tragedy', power: 10, story: 'The famous wreck. Thousands died here. You absorbed their final moments. Overwhelming.' },
  { type: 'temple', name: 'Leviathan Tomb', treasure: 'Sea monster bones', power: 25, story: 'Ancient sea monster burial ground. Its power still lingers. You took a bone. Felt its strength.' }
];

export default function SirenUnderwater({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [exploring, setExploring] = useState(false);
  const [outcome, setOutcome] = useState('');

  const discoveries = siren.underwater_discoveries || [];

  const handleExplore = async () => {
    setExploring(true);

    setTimeout(async () => {
      const discovery = DISCOVERIES[Math.floor(Math.random() * DISCOVERIES.length)];
      const fullOutcome = `You dove deep. Found: ${discovery.name}. ${discovery.story} Treasure: ${discovery.treasure}`;

      setOutcome(fullOutcome);

      const newDiscoveries = [
        ...discoveries,
        {
          name: discovery.name,
          type: discovery.type,
          treasure: discovery.treasure,
          found_date: new Date().toISOString()
        }
      ];

      await base44.entities.Siren.update(siren.id, {
        underwater_discoveries: newDiscoveries,
        voice_power: (siren.voice_power || 50) + discovery.power,
        water_affinity: (siren.water_affinity || 50) + 3
      });

      await base44.entities.NightLog.create({
        entry: `Discovered ${discovery.name} underwater. ${discovery.treasure} claimed.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setExploring(false);
        setOutcome('');
      }, 5000);
    }, 3000);
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
        className="bg-gradient-to-br from-blue-950 to-indigo-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Underwater Exploration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {outcome ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 rounded-xl p-6 mb-6 border border-cyan-500/30"
          >
            <p className="text-cyan-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        ) : exploring ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4"
            >
              🌊
            </motion.div>
            <p className="text-cyan-400">Diving deep...</p>
          </div>
        ) : (
          <>
            <button
              onClick={handleExplore}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-900/80 hover:to-blue-900/80 border-2 border-cyan-500/50 rounded-xl py-6 px-6 flex items-center gap-3 mb-6 transition-all"
            >
              <Anchor className="w-6 h-6 text-cyan-400" />
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Explore the Depths</h3>
                <p className="text-cyan-300 text-sm">Discover shipwrecks, temples, and treasures</p>
              </div>
            </button>

            {/* Past Discoveries */}
            {discoveries.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-3">Your Discoveries ({discoveries.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {discoveries.map((d, i) => (
                    <div key={i} className="bg-black/40 rounded-lg p-3 border border-gray-600/30">
                      <div className="flex items-start gap-3">
                        {d.type === 'shipwreck' && <Skull className="w-5 h-5 text-gray-400 mt-0.5" />}
                        {d.type === 'temple' && <Scroll className="w-5 h-5 text-purple-400 mt-0.5" />}
                        {d.type === 'graveyard' && <Skull className="w-5 h-5 text-red-400 mt-0.5" />}
                        {d.type === 'cave' && <Gem className="w-5 h-5 text-yellow-400 mt-0.5" />}
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{d.name}</h4>
                          <p className="text-gray-400 text-xs">{d.treasure}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}