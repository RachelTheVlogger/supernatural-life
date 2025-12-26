import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const STONES = {
  lapis_lazuli: { name: 'Lapis Lazuli', cost: 500, charges: 10, icon: '💙' },
  moonstone: { name: 'Moonstone', cost: 750, charges: 20, icon: '🌙' },
  sunstone: { name: 'Sunstone', cost: 1000, charges: 30, icon: '☀️' },
  bloodstone: { name: 'Bloodstone', cost: 1500, charges: 50, icon: '🩸' }
};

export default function DaylightRingCrafting({ vampireState, witches, onClose }) {
  const queryClient = useQueryClient();
  const [crafting, setCrafting] = useState(false);
  const [selectedStone, setSelectedStone] = useState('lapis_lazuli');

  const { data: rings = [] } = useQuery({
    queryKey: ['daylightRings'],
    queryFn: () => base44.entities.DaylightRing.filter({ owner_id: vampireState.id })
  });

  const handleCraft = async () => {
    if (witches.length === 0) {
      alert('You need a witch to enchant the ring!');
      return;
    }

    setCrafting(true);
    
    setTimeout(async () => {
      const stone = STONES[selectedStone];
      
      await base44.entities.DaylightRing.create({
        owner_id: vampireState.id,
        stone_type: selectedStone,
        ring_type: stone.charges >= 30 ? 'enhanced' : 'basic',
        charges_remaining: stone.charges,
        crafted_by_witch: witches[0].id,
        is_active: false
      });
      
      await base44.entities.NightLog.create({
        entry: `${witches[0].name} enchanted a daylight ring with ${stone.name}. Sunlight protection granted.`,
        category: 'power',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      setCrafting(false);
    }, 3000);
  };

  const handleActivate = async (ring) => {
    await base44.entities.DaylightRing.update(ring.id, {
      is_active: !ring.is_active
    });
    
    queryClient.invalidateQueries();
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

        <h2 className="text-2xl font-bold text-white mb-2">☀️ Daylight Rings</h2>
        <p className="text-gray-400 text-sm mb-6">Walk in the sun without burning</p>

        {witches.length === 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">You need a witch to craft daylight rings!</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Craft New Ring</h3>
          <div className="space-y-3 mb-4">
            {Object.entries(STONES).map(([key, stone]) => (
              <button
                key={key}
                onClick={() => setSelectedStone(key)}
                className={`w-full rounded-xl p-4 text-left transition-colors ${
                  selectedStone === key
                    ? 'bg-purple-900/40 border-2 border-purple-500'
                    : 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{stone.icon} {stone.name}</p>
                    <p className="text-gray-400 text-sm">{stone.charges} days of protection</p>
                  </div>
                  <p className="text-purple-400">${stone.cost}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCraft}
            disabled={crafting || witches.length === 0}
            className="w-full bg-gradient-to-r from-yellow-900/40 to-orange-900/40 hover:from-yellow-900/60 hover:to-orange-900/60 border-2 border-yellow-500/50 rounded-xl p-4 transition-all disabled:opacity-50"
          >
            {crafting ? 'Crafting...' : 'Craft Ring'}
          </button>
        </div>

        {rings.length > 0 && (
          <>
            <h3 className="text-white font-bold mb-3">Your Rings</h3>
            <div className="space-y-3">
              {rings.map(ring => (
                <div key={ring.id} className={`bg-gray-800 rounded-xl p-4 ${ring.is_active ? 'border-2 border-yellow-500' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-medium">{STONES[ring.stone_type].icon} {STONES[ring.stone_type].name}</p>
                      <p className="text-gray-400 text-sm">{ring.charges_remaining} charges left</p>
                      {ring.is_active && <p className="text-yellow-400 text-xs mt-1">✓ Active</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleActivate(ring)}
                    className={`w-full rounded-lg py-2 text-sm transition-colors ${
                      ring.is_active
                        ? 'bg-red-900/40 hover:bg-red-900/60 text-red-300'
                        : 'bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300'
                    }`}
                  >
                    {ring.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}