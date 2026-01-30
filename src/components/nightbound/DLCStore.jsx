import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function DLCStore({ onClose }) {
  const queryClient = useQueryClient();

  const { data: dlcs = [] } = useQuery({
    queryKey: ['dlcs'],
    queryFn: () => base44.entities.DLC.list(),
    staleTime: 0
  });

  const handleUnlock = async (dlc) => {
    try {
      await base44.entities.DLC.update(dlc.id, { unlocked: true });
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
        className="bg-gradient-to-br from-purple-950 to-gray-950 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-purple-500/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Free DLC</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Unlock new content and features - completely free!
        </p>

        <div className="space-y-4">
          {dlcs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No DLC available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for fairies, demons, and more!</p>
            </div>
          ) : (
            dlcs.map(dlc => (
              <motion.div
                key={dlc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-6 border-2 transition-all ${
                  dlc.unlocked
                    ? 'bg-green-950/40 border-green-500/50'
                    : 'bg-purple-950/40 border-purple-500/30 hover:border-purple-500/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{dlc.icon}</span>
                      <div>
                        <h3 className="text-white font-bold text-lg">{dlc.name}</h3>
                        <p className="text-gray-400 text-xs capitalize">{dlc.category}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{dlc.description}</p>
                  </div>
                  <button
                    onClick={() => !dlc.unlocked && handleUnlock(dlc)}
                    disabled={dlc.unlocked}
                    className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ml-4 ${
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
                        Unlock Free
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}