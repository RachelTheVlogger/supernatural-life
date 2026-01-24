import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, Users, Target, MessageCircle, Skull, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MISSIONS = [
  { id: 'spy', label: 'Spy on Someone', icon: Eye, duration: 2, risk: 'medium' },
  { id: 'infiltrate', label: 'Infiltrate Organization', icon: Users, duration: 3, risk: 'high' },
  { id: 'guard', label: 'Guard Location', icon: Shield, duration: 1, risk: 'low' },
  { id: 'messenger', label: 'Deliver Message', icon: MessageCircle, duration: 1, risk: 'low' },
  { id: 'assassinate', label: 'Eliminate Target', icon: Skull, duration: 2, risk: 'high' }
];

export default function ThrallSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedThrall, setSelectedThrall] = useState(null);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: thralls = [] } = useQuery({
    queryKey: ['thralls', vampireState?.id],
    queryFn: async () => {
      if (!vampireState?.id) return [];
      return await base44.entities.Thrall.filter({ vampire_id: vampireState.id });
    },
    enabled: !!vampireState?.id
  });

  const { data: npcs = [] } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const handleCreateThrall = async (npc) => {
    setCreating(true);

    setTimeout(async () => {
      try {
        await base44.entities.Thrall.create({
          name: npc.name,
          vampire_id: vampireState.id,
          gender: 'custom',
          control_level: 100,
          previous_occupation: npc.occupation,
          assigned_mission: 'none',
          useful_connections: [npc.location]
        });

        await base44.entities.NPC.delete(npc.id);

        await base44.entities.NightLog.create({
          entry: `You broke ${npc.name}'s mind completely. Free will erased. Thrall created. Perfect obedience.`,
          category: 'power',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Failed to create thrall:', e);
      }

      setCreating(false);
      setOutcome('');
    }, 2000);
  };

  const handleAssignMission = async (mission) => {
    setAssigning(true);

    setTimeout(async () => {
      const success = Math.random() > (mission.risk === 'high' ? 0.4 : mission.risk === 'medium' ? 0.2 : 0.1);

      try {
        if (success) {
          await base44.entities.Thrall.update(selectedThrall.id, {
            assigned_mission: mission.id,
            mission_progress: 0,
            times_used: (selectedThrall.times_used || 0) + 1,
            control_level: Math.max((selectedThrall.control_level || 100) - 5, 0)
          });

          setOutcome(`${selectedThrall.name} accepted the mission. They'll complete it without question.`);
        } else {
          await base44.entities.Thrall.update(selectedThrall.id, {
            breaking_point: Math.min((selectedThrall.breaking_point || 0) + 30, 100),
            control_level: Math.max((selectedThrall.control_level || 100) - 15, 0)
          });

          setOutcome(`Mission failed. ${selectedThrall.name} struggled. Control weakening. They're fighting back.`);
        }

        await base44.entities.NightLog.create({
          entry: `Thrall ${selectedThrall.name}: ${mission.label}. ${success ? 'Success' : 'Failed'}`,
          category: 'power',
          intensity: 'moderate'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Mission assignment failed:', e);
      }

      setTimeout(() => {
        setAssigning(false);
        setOutcome('');
        setSelectedThrall(null);
      }, 3000);
    }, 2000);
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

        <h2 className="text-2xl font-bold text-white mb-2">🧠 Thrall System</h2>
        <p className="text-gray-400 text-sm mb-6">
          Break their minds. Strip free will. Create perfectly obedient servants for tactical missions.
        </p>

        {creating || assigning ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {creating ? 'Breaking their mind...' : 'Sending on mission...'}
            </motion.p>
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <p className="text-gray-300">{outcome}</p>
          </div>
        ) : !selectedThrall ? (
          <>
            <h3 className="text-white font-medium mb-3">Your Thralls ({thralls.length})</h3>
            {thralls.length > 0 && (
              <div className="space-y-3 mb-6">
                {thralls.map(thrall => (
                  <button
                    key={thrall.id}
                    onClick={() => setSelectedThrall(thrall)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                  >
                    <h4 className="text-white font-medium">{thrall.name}</h4>
                    <p className="text-gray-400 text-sm">Was: {thrall.previous_occupation}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Control</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div
                              style={{ width: `${thrall.control_level || 0}%` }}
                              className="h-1.5 bg-purple-500 rounded-full"
                            />
                          </div>
                          <span className="text-purple-400">{thrall.control_level || 0}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Breaking Point</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div
                              style={{ width: `${thrall.breaking_point || 0}%` }}
                              className="h-1.5 bg-red-500 rounded-full"
                            />
                          </div>
                          <span className="text-red-400">{thrall.breaking_point || 0}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <h3 className="text-white font-medium mb-3">Create New Thrall</h3>
            {npcs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No NPCs available to enthrall</p>
            ) : (
              <div className="space-y-2">
                {npcs.slice(0, 3).map(npc => (
                  <button
                    key={npc.id}
                    onClick={() => handleCreateThrall(npc)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-3 text-left transition-colors"
                  >
                    <h4 className="text-white text-sm">{npc.name}</h4>
                    <p className="text-gray-400 text-xs">{npc.occupation} at {npc.location}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedThrall(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-3"
            >
              ← Back
            </button>

            <h3 className="text-white font-medium mb-3">Assign Mission to {selectedThrall.name}</h3>

            {MISSIONS.map(mission => {
              const Icon = mission.icon;
              return (
                <button
                  key={mission.id}
                  onClick={() => handleAssignMission(mission)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{mission.label}</h4>
                      <p className="text-gray-400 text-xs">
                        Duration: {mission.duration}d • Risk: {mission.risk}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}