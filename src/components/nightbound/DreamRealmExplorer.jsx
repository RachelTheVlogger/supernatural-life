import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Eye, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const REALM_TYPES = [
  { type: 'nightmare', emoji: '😱', desc: 'Feed on fear and terror' },
  { type: 'paradise', emoji: '🌸', desc: 'Create perfect fantasies' },
  { type: 'memory', emoji: '📸', desc: 'Explore past experiences' },
  { type: 'void', emoji: '⚫', desc: 'Endless nothingness' },
  { type: 'lucid', emoji: '✨', desc: 'Full control over reality' }
];

const DREAM_ACTIONS = [
  { id: 'explore', label: 'Explore Realm', desc: 'Discover secrets' },
  { id: 'construct', label: 'Create Construct', desc: 'Build dream objects' },
  { id: 'trap', label: 'Trap Visitor', desc: 'Keep someone here', warning: true },
  { id: 'merge', label: 'Merge Realms', desc: 'Combine dream worlds' },
  { id: 'stabilize', label: 'Stabilize Realm', desc: 'Prevent collapse' }
];

export default function DreamRealmExplorer({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState(null);

  const { data: realms = [] } = useQuery({
    queryKey: ['dreamRealms'],
    queryFn: () => base44.entities.DreamRealm.filter({ owner_id: vampireState.id })
  });

  const handleCreateRealm = async (type) => {
    setCreating(true);

    await base44.entities.DreamRealm.create({
      realm_name: `${vampireState.vampire_name}'s ${type} Realm`,
      owner_id: vampireState.id,
      realm_type: type,
      stability: 50
    });

    await base44.entities.NightLog.create({
      entry: `Dream realm created: ${type}. A new world born from your mind.`,
      category: 'supernatural',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setCreating(false);
  };

  const handleAction = async (action, realm) => {
    setExploring(true);

    setTimeout(async () => {
      const updates = {};

      if (action.id === 'stabilize') {
        updates.stability = Math.min(100, (realm.stability || 50) + 15);
      }

      if (action.id === 'construct') {
        updates.dream_constructs = [...(realm.dream_constructs || []), {
          name: 'Dream Object',
          type: 'construct',
          power: Math.floor(Math.random() * 100)
        }];
      }

      if (action.id === 'trap') {
        updates.can_trap_visitors = true;
      }

      await base44.entities.DreamRealm.update(realm.id, updates);

      await base44.entities.NightLog.create({
        entry: `Dream realm action: ${action.label} in ${realm.realm_name}.`,
        category: 'supernatural',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setExploring(false);
      setSelectedRealm(null);
    }, 2000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🌙 Dream Realms</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedRealm ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {REALM_TYPES.map(realm => (
                <button
                  key={realm.type}
                  onClick={() => handleCreateRealm(realm.type)}
                  disabled={creating}
                  className="bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/30 rounded-lg p-4 text-center transition-colors disabled:opacity-50"
                >
                  <p className="text-3xl mb-2">{realm.emoji}</p>
                  <p className="text-white text-sm font-bold capitalize">{realm.type}</p>
                  <p className="text-gray-400 text-xs mt-1">{realm.desc}</p>
                </button>
              ))}
            </div>

            <h3 className="text-white font-bold mb-3">Your Dream Realms</h3>
            <div className="space-y-3">
              {realms.map(realm => (
                <button
                  key={realm.id}
                  onClick={() => setSelectedRealm(realm)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors"
                >
                  <p className="text-white font-bold mb-1">{realm.realm_name}</p>
                  <p className="text-gray-400 text-sm capitalize">Type: {realm.realm_type}</p>
                  <div className="mt-2">
                    <p className="text-purple-400 text-xs mb-1">Stability: {realm.stability}%</p>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div style={{ width: `${realm.stability}%` }} className="h-1 rounded-full bg-purple-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div>
            <button
              onClick={() => setSelectedRealm(null)}
              className="text-purple-400 hover:text-purple-300 mb-4 text-sm"
            >
              ← Back
            </button>

            <h3 className="text-white text-xl font-bold mb-4">{selectedRealm.realm_name}</h3>

            <div className="space-y-3">
              {DREAM_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action, selectedRealm)}
                  disabled={exploring}
                  className={`w-full ${action.warning ? 'bg-red-900/60' : 'bg-purple-900/60'} hover:opacity-80 border border-purple-500/30 rounded-lg p-4 text-left disabled:opacity-50`}
                >
                  <p className="text-white font-bold">{action.label}</p>
                  <p className="text-gray-400 text-sm">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}