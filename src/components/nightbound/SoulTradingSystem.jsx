import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Skull, Zap, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function SoulTradingSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const { data: souls = [] } = useQuery({
    queryKey: ['souls'],
    queryFn: () => base44.entities.Soul.filter({ current_owner: vampireState.id })
  });

  const handleExtractSoul = async () => {
    setExtracting(true);
    
    const victims = ['Random Victim', 'Street Walker', 'Bar Patron', 'Night Jogger'];
    const qualities = ['pure', 'tainted', 'corrupted'];
    
    setTimeout(async () => {
      await base44.entities.Soul.create({
        original_owner: victims[Math.floor(Math.random() * victims.length)],
        current_owner: vampireState.id,
        quality: qualities[Math.floor(Math.random() * qualities.length)],
        power_level: 40 + Math.floor(Math.random() * 60),
        market_value: 100 + Math.floor(Math.random() * 900),
        extraction_date: new Date().toISOString()
      });

      await base44.entities.NightLog.create({
        entry: 'Soul extracted. Pure essence captured. The collection grows.',
        category: 'dark',
        intensity: 'extreme'
      });

      queryClient.invalidateQueries();
      setExtracting(false);
    }, 2000);
  };

  const handleConsumeSoul = async (soul) => {
    setProcessing(true);
    
    const powerGain = Math.floor(soul.power_level / 10);
    
    await base44.entities.VampireState.update(vampireState.id, {
      vampire_power_level: Math.min(100, (vampireState.vampire_power_level || 0) + powerGain)
    });

    await base44.entities.Soul.delete(soul.id);

    await base44.entities.NightLog.create({
      entry: `Consumed ${soul.original_owner}'s soul. Power surged. +${powerGain} Power`,
      category: 'dark',
      intensity: 'extreme'
    });

    queryClient.invalidateQueries();
    setProcessing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Soul Collection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleExtractSoul}
          disabled={extracting}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl mb-6 font-bold disabled:opacity-50"
        >
          {extracting ? 'Extracting...' : '👁️ Extract New Soul'}
        </button>

        <div className="space-y-3">
          <h3 className="text-white font-bold mb-3">Your Souls ({souls.length})</h3>
          {souls.map(soul => (
            <div key={soul.id} className="bg-gray-800 border border-purple-500/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-bold">{soul.original_owner}</p>
                  <p className="text-gray-400 text-sm capitalize">Quality: {soul.quality}</p>
                  <p className="text-purple-400 text-sm">Power: {soul.power_level}</p>
                </div>
                <p className="text-yellow-400 text-sm">Value: ${soul.market_value}</p>
              </div>
              <button
                onClick={() => handleConsumeSoul(soul)}
                disabled={processing}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm disabled:opacity-50"
              >
                Consume for Power (+{Math.floor(soul.power_level / 10)})
              </button>
            </div>
          ))}
          {souls.length === 0 && (
            <p className="text-gray-500 text-center py-8">No souls collected yet</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}