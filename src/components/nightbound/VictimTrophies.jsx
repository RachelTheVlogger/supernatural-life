import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const TROPHY_TYPES = [
  { type: 'jewelry', label: 'Jewelry', examples: ['wedding ring', 'necklace', 'bracelet', 'locket', 'earrings'] },
  { type: 'personal', label: 'Personal Items', examples: ['wallet', 'phone', 'keys', 'photo', 'diary'] },
  { type: 'clothing', label: 'Clothing', examples: ['scarf', 'jacket', 'hat', 'gloves', 'watch'] },
  { type: 'body', label: 'Body Parts', examples: ['lock of hair', 'tooth', 'finger', 'blood vial', 'bone fragment'] }
];

export default function VictimTrophies({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [hunting, setHunting] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState(null);

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      try {
        return await base44.entities.Inventory.list();
      } catch (e) {
        return [];
      }
    }
  });

  const trophies = inventory.filter(item => item.item_type === 'trophy');

  const generateVictimName = () => {
    const first = ['Sarah', 'Michael', 'Emma', 'James', 'Olivia', 'David', 'Sophia', 'Daniel', 'Ava', 'Chris'];
    const last = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  };

  const generateBackstory = (victimName, item) => {
    const stories = [
      `${victimName} was wearing this when you found them. They begged. You still took it.`,
      `Found on ${victimName}'s body after you drained them completely. A reminder of your power.`,
      `${victimName} tried to use this to defend themselves. It didn't work.`,
      `Taken from ${victimName} while they were still warm. The last thing they owned.`,
      `${victimName} clutched this as they died. Now it's yours forever.`,
      `You ripped this from ${victimName}'s neck. Their blood is still on it.`,
      `${victimName} thought this would protect them. They were wrong.`,
      `The only thing left of ${victimName}. Everything else is gone.`
    ];
    return stories[Math.floor(Math.random() * stories.length)];
  };

  const handleHunt = async () => {
    setHunting(true);
    
    setTimeout(async () => {
      try {
        const victimName = generateVictimName();
        const trophyType = TROPHY_TYPES[Math.floor(Math.random() * TROPHY_TYPES.length)];
        const item = trophyType.examples[Math.floor(Math.random() * trophyType.examples.length)];
        const backstory = generateBackstory(victimName, item);

        await base44.entities.Inventory.create({
          item_name: item,
          item_type: 'trophy',
          description: backstory,
          victim_name: victimName,
          acquired_date: new Date().toISOString()
        });

        await base44.entities.NightLog.create({
          entry: `You took ${victimName}'s ${item}. Another trophy for your collection. Another life taken.`,
          category: 'hunting',
          intensity: 'high'
        });

        // Decrease humanity
        if (vampireState.id) {
          const newHumanity = Math.max(0, (vampireState.humanity || 50) - 3);
          await base44.entities.VampireState.update(vampireState.id, {
            humanity: newHumanity
          });
        }

        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries(['vampireState']);
        queryClient.invalidateQueries(['logs']);
      } catch (e) {
        console.error('Failed to add trophy:', e);
      } finally {
        setHunting(false);
      }
    }, 2500);
  };

  const handleDiscard = async (trophy) => {
    if (confirm(`Discard ${trophy.item_name}? You can't undo this.`)) {
      try {
        await base44.entities.Inventory.delete(trophy.id);
        queryClient.invalidateQueries(['inventory']);
        setSelectedTrophy(null);
      } catch (e) {
        console.error('Failed to discard:', e);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-900/50"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-red-400 flex items-center gap-3">
              <Skull className="w-8 h-8" />
              Trophy Collection
            </h2>
            <p className="text-gray-400 text-sm mt-2">Possessions taken from those you've killed</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-950/30 rounded-lg p-4 border border-red-900/30">
            <p className="text-red-400 text-sm mb-1">Victims</p>
            <p className="text-white text-2xl font-bold">{trophies.length}</p>
          </div>
          <div className="bg-gray-950/30 rounded-lg p-4 border border-gray-700/30">
            <p className="text-gray-400 text-sm mb-1">Humanity Lost</p>
            <p className="text-white text-2xl font-bold">-{trophies.length * 3}</p>
          </div>
        </div>

        {/* Hunt Button */}
        <button
          onClick={handleHunt}
          disabled={hunting}
          className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 disabled:opacity-50 border-2 border-red-700/50 rounded-xl py-4 mb-6 transition-all"
        >
          <span className="text-white font-bold text-lg">
            {hunting ? 'Hunting...' : 'Hunt for a Trophy'}
          </span>
          <p className="text-red-300 text-xs mt-1">Kill someone and take their possession (-3 Humanity)</p>
        </button>

        {/* Trophy Collection */}
        {trophies.length === 0 ? (
          <div className="text-center py-12">
            <Skull className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Your collection is empty</p>
            <p className="text-gray-600 text-sm mt-2">Hunt and take trophies from your victims</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Your Collection ({trophies.length})</h3>
            {trophies.map(trophy => (
              <motion.button
                key={trophy.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedTrophy(trophy)}
                className="w-full bg-gray-900/60 hover:bg-gray-900/80 border border-red-900/30 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-red-300 font-medium capitalize">{trophy.item_name}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(trophy.acquired_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white text-sm font-medium mb-1">From: {trophy.victim_name}</p>
                <p className="text-gray-400 text-xs line-clamp-2">{trophy.description}</p>
              </motion.button>
            ))}
          </div>
        )}

        {/* Trophy Detail Modal */}
        <AnimatePresence>
          {selectedTrophy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
              onClick={() => setSelectedTrophy(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-xl p-6 max-w-md w-full border-2 border-red-900/50"
              >
                <h3 className="text-2xl font-bold text-red-400 mb-4 capitalize">
                  {selectedTrophy.item_name}
                </h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Victim</p>
                    <p className="text-white font-medium">{selectedTrophy.victim_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Taken</p>
                    <p className="text-white">
                      {new Date(selectedTrophy.acquired_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Memory</p>
                    <p className="text-gray-300 leading-relaxed">{selectedTrophy.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDiscard(selectedTrophy)}
                    className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 py-3 rounded-lg transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => setSelectedTrophy(null)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
        >
          Close Collection
        </button>
      </motion.div>
    </motion.div>
  );
}