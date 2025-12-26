import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Skull, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ARTIFACTS = [
  { name: 'Blood Dagger', type: 'weapon', power: '+20% damage in combat', rarity: 'uncommon', curse: 10 },
  { name: 'Amulet of Shadows', type: 'jewelry', power: 'Turn invisible for 5 minutes', rarity: 'rare', curse: 20 },
  { name: 'Grimoire of the Damned', type: 'book', power: 'Learn forbidden spells', rarity: 'legendary', curse: 50 },
  { name: 'Bone Crown', type: 'relic', power: 'Command lesser vampires', rarity: 'mythic', curse: 80 },
  { name: 'Cursed Mirror', type: 'cursed_object', power: 'See future visions', rarity: 'rare', curse: 40 }
];

export default function ArtifactCollection({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [searching, setSearching] = useState(false);
  const [using, setUsing] = useState(null);

  const { data: artifacts = [] } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () => base44.entities.Artifact.filter({ owner_id: vampireState.id })
  });

  const handleSearch = async () => {
    setSearching(true);
    
    setTimeout(async () => {
      const found = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];
      
      await base44.entities.Artifact.create({
        artifact_name: found.name,
        artifact_type: found.type,
        power_description: found.power,
        rarity: found.rarity,
        curse_level: found.curse,
        owner_id: vampireState.id,
        is_equipped: false
      });
      
      await base44.entities.NightLog.create({
        entry: `Found artifact: ${found.name}. ${found.power}`,
        category: 'power',
        intensity: found.rarity === 'mythic' ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries();
      setSearching(false);
    }, 3000);
  };

  const handleUse = async (artifact) => {
    setUsing(artifact.id);
    
    setTimeout(async () => {
      await base44.entities.Artifact.update(artifact.id, {
        times_used: artifact.times_used + 1,
        is_equipped: !artifact.is_equipped
      });
      
      const curseDamage = Math.floor(artifact.curse_level / 10);
      if (curseDamage > 0) {
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: Math.max(0, vampireState.humanity - curseDamage)
        });
      }
      
      await base44.entities.NightLog.create({
        entry: `Used ${artifact.artifact_name}. ${artifact.power_description}. ${curseDamage > 0 ? `Curse cost: -${curseDamage} humanity.` : ''}`,
        category: 'power',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      setUsing(null);
    }, 2000);
  };

  const rarityColors = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    legendary: 'text-purple-400',
    mythic: 'text-red-400'
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

        <h2 className="text-2xl font-bold text-white mb-2">⚡ Dark Artifacts</h2>
        <p className="text-gray-400 text-sm mb-6">Cursed objects of power</p>

        <button
          onClick={handleSearch}
          disabled={searching}
          className="w-full bg-gradient-to-r from-purple-900/40 to-red-900/40 hover:from-purple-900/60 hover:to-red-900/60 border-2 border-purple-500/50 rounded-xl p-4 mb-6 transition-all disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search for Artifacts'}
        </button>

        {artifacts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No artifacts collected yet</p>
        ) : (
          <div className="space-y-3">
            {artifacts.map(artifact => (
              <div key={artifact.id} className={`bg-gray-800 rounded-xl p-4 ${artifact.is_equipped ? 'border-2 border-purple-500' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`font-bold ${rarityColors[artifact.rarity]}`}>{artifact.artifact_name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{artifact.artifact_type}</p>
                    <p className="text-purple-300 text-sm mt-1">{artifact.power_description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 text-xs">Curse: {artifact.curse_level}</p>
                    <p className="text-gray-500 text-xs">Used: {artifact.times_used}</p>
                  </div>
                </div>

                {artifact.is_equipped && <p className="text-yellow-400 text-xs mb-2">✓ Equipped</p>}

                <button
                  onClick={() => handleUse(artifact)}
                  disabled={using}
                  className={`w-full rounded-lg py-2 text-sm transition-colors ${
                    artifact.is_equipped
                      ? 'bg-red-900/40 hover:bg-red-900/60 text-red-300'
                      : 'bg-purple-900/40 hover:bg-purple-900/60 text-purple-300'
                  } disabled:opacity-50`}
                >
                  {using === artifact.id ? 'Using...' : artifact.is_equipped ? 'Unequip' : 'Equip & Use'}
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}