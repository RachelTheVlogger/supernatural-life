import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DLC_CATALOG = [
  { name: 'Werewolf', entity_type: 'Werewolf', icon: '🐺', category: 'creature', description: 'Moon-cursed shapeshifter with primal rage' }
];

export default function DLCStore({ onClose }) {
  const queryClient = useQueryClient();

  const { data: dlcs = [] } = useQuery({
    queryKey: ['dlcs'],
    queryFn: async () => {
      const existing = await base44.entities.DLC.list();
      if (existing.length === 0) {
        // Initialize DLCs
        await Promise.all(DLC_CATALOG.map(dlc => 
          base44.entities.DLC.create({
            name: dlc.name,
            entity_type: dlc.entity_type,
            icon: dlc.icon,
            category: dlc.category,
            description: dlc.description,
            unlocked: false
          })
        ));
        return await base44.entities.DLC.list();
      }
      return existing;
    },
    staleTime: 0
  });

  const handleUnlock = async (dlc) => {
    try {
      await base44.entities.DLC.update(dlc.id, { unlocked: true });
      await base44.entities.NightLog.create({
        entry: `DLC unlocked: ${dlc.name}. New creature available!`,
        category: 'milestone',
        intensity: 'significant'
      });
      await queryClient.invalidateQueries(['dlcs']);
    } catch (e) {
      console.error('Failed to unlock DLC:', e);
    }
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
        className="bg-gradient-to-br from-purple-950 to-gray-950 rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-purple-500/50"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">🎮 Free DLC</h2>
            <p className="text-purple-300 text-xs sm:text-sm mt-1">Unlock more supernatural creatures</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {dlcs.map(dlc => (
            <motion.div
              key={dlc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 border-2 transition-all ${
                dlc.unlocked
                  ? 'bg-green-950/40 border-green-500/50'
                  : 'bg-purple-950/40 border-purple-500/30 hover:border-purple-500/60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{dlc.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-base">{dlc.name}</h3>
                    <p className="text-gray-400 text-xs">{dlc.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => !dlc.unlocked && handleUnlock(dlc)}
                  disabled={dlc.unlocked}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap text-sm ${
                    dlc.unlocked
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {dlc.unlocked ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Unlock
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}