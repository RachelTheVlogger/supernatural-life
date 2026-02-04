import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampireState = vampireStates[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">Configure your game experience</p>
          </div>
        </motion.div>

        {/* Content Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <Shield className="w-6 h-6 text-blue-400 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Content Filter</h2>
              <p className="text-gray-400 text-sm mb-4">
                Control the level of explicit content in the game
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                if (!vampireState?.id) return;
                try {
                  await base44.entities.VampireState.update(vampireState.id, {
                    content_filter: 'full'
                  });
                  queryClient.invalidateQueries(['vampireState']);
                } catch (e) {
                  console.error('Failed to update filter:', e);
                }
              }}
              className={`w-full text-left rounded-xl p-4 transition-all border-2 ${
                vampireState?.content_filter !== 'lite'
                  ? 'bg-purple-900/40 border-purple-500/50 ring-2 ring-purple-500/30'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <h3 className="text-white font-bold mb-1">🔥 Full Content</h3>
              <p className="text-gray-400 text-sm">
                All interactions available including explicit content
              </p>
            </button>

            <button
              onClick={async () => {
                if (!vampireState?.id) return;
                try {
                  await base44.entities.VampireState.update(vampireState.id, {
                    content_filter: 'lite'
                  });
                  queryClient.invalidateQueries(['vampireState']);
                } catch (e) {
                  console.error('Failed to update filter:', e);
                }
              }}
              className={`w-full text-left rounded-xl p-4 transition-all border-2 ${
                vampireState?.content_filter === 'lite'
                  ? 'bg-blue-900/40 border-blue-500/50 ring-2 ring-blue-500/30'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <h3 className="text-white font-bold mb-1">✨ Lite Mode</h3>
              <p className="text-gray-400 text-sm">
                Filters explicit BDSM and sexual content. Romance and vampire themes remain.
              </p>
            </button>
          </div>

          <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">
              <strong className="text-white">Note:</strong> Lite mode removes explicit sexual interactions while keeping vampire feeding, romance, and general gameplay intact.
            </p>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-950/20 border border-red-800/50 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <Trash2 className="w-6 h-6 text-red-400 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-300 mb-2">Danger Zone</h2>
              <p className="text-gray-400 text-sm mb-4">
                Irreversible actions - use with caution
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              if (confirm('Delete ALL game data? This will reset everything and cannot be undone.')) {
                try {
                  const entities = [
                    'VampireState', 'Servant', 'Witch', 'Siren', 'WaterNymph', 
                    'Hunter', 'NightLog', 'Quest', 'Werewolf', 'Demon', 'Angel',
                    'Ghost', 'Necromancer', 'Shapeshifter', 'BloodPlant', 'DrugCustomer'
                  ];
                  
                  for (const entity of entities) {
                    try {
                      const records = await base44.entities[entity].list();
                      for (const record of records) {
                        await base44.entities[entity].delete(record.id);
                      }
                    } catch (e) {
                      console.error(`Failed to delete ${entity}:`, e);
                    }
                  }
                  
                  queryClient.invalidateQueries();
                  navigate(createPageUrl('Home'));
                } catch (e) {
                  console.error('Failed to reset game:', e);
                }
              }
            }}
            className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-medium py-4 rounded-xl transition-colors"
          >
            Reset Entire Game
          </button>
        </motion.div>
      </div>
    </div>
  );
}