import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Target, Shield, Eye, Wand2, Send } from 'lucide-react';

const GROUP_MISSIONS = [
  { id: 'coordinate_spy', label: 'Coordinate Spying', icon: Eye, description: 'All spies work together' },
  { id: 'mass_infiltrate', label: 'Mass Infiltration', icon: Users, description: 'Infiltrate multiple targets' },
  { id: 'protect_base', label: 'Protect Base', icon: Shield, description: 'Guard location in shifts' },
  { id: 'sabotage_network', label: 'Sabotage Network', icon: Wand2, description: 'Disrupt enemy operations' },
  { id: 'coordinated_kill', label: 'Coordinated Assassination', icon: Target, description: 'Work together for one kill' }
];

export default function ThrallArmy({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedMission, setSelectedMission] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: thralls = [] } = useQuery({
    queryKey: ['thralls', vampireState?.id],
    queryFn: async () => {
      if (!vampireState?.id) return [];
      return await base44.entities.Thrall.filter({ vampire_id: vampireState.id });
    },
    enabled: !!vampireState?.id
  });

  const handleGroupMission = async (mission) => {
    setProcessing(true);
    setSelectedMission(mission);

    setTimeout(async () => {
      const activeSpies = thralls.filter(t => t.role === 'spy').length;
      const activeAssassins = thralls.filter(t => t.role === 'assassin').length;
      const activeGuards = thralls.filter(t => t.role === 'guard').length;

      let success = false;
      let result = '';

      if (mission.id === 'coordinate_spy' && activeSpies >= 2) {
        const intelTypes = [
          'discovered rival vampire location',
          'exposed council secrets',
          'found enemy weakness',
          'revealed hunter network'
        ];
        result = `Your spy network coordinated perfectly. They ${intelTypes[Math.floor(Math.random() * intelTypes.length)]}.`;
        success = true;
      } else if (mission.id === 'mass_infiltrate' && activeSpies >= 3) {
        result = `Multiple locations infiltrated simultaneously. Your thrall network has deeply embedded itself in the city.`;
        success = true;
      } else if (mission.id === 'protect_base' && activeGuards >= 2) {
        result = `Your guards have fortified the location. No one gets in without your permission.`;
        success = true;
      } else if (mission.id === 'sabotage_network' && activeSpies >= 2 && activeAssassins >= 1) {
        result = `Coordinated sabotage. Enemies scramble. Their plans crumble.`;
        success = true;
      } else if (mission.id === 'coordinated_kill' && activeAssassins >= 2) {
        result = `Two assassins worked in perfect synchronization. Target eliminated with surgical precision.`;
        success = true;
      } else {
        result = `Insufficient specialized thralls for this mission. You need more ${mission.label.split(' ')[0].toLowerCase()} thralls.`;
        success = false;
      }

      if (success) {
        // Award XP to all thralls
        await Promise.all(
          thralls.map(t =>
            base44.entities.Thrall.update(t.id, {
              experience: (t.experience || 0) + 50,
              level: Math.floor(((t.experience || 0) + 50) / 100) + 1
            })
          )
        );
      }

      setOutcome(result);
      queryClient.invalidateQueries(['thralls']);

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedMission(null);
      }, 3000);
    }, 2000);
  };

  const spyCount = thralls.filter(t => t.role === 'spy').length;
  const assassinCount = thralls.filter(t => t.role === 'assassin').length;
  const guardCount = thralls.filter(t => t.role === 'guard').length;
  const seducerCount = thralls.filter(t => t.role === 'seducer').length;
  const messengerCount = thralls.filter(t => t.role === 'messenger').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Thrall Army ({thralls.length})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {processing || outcome ? (
            <div className="text-center py-12">
              {processing ? (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-purple-400"
                >
                  Coordinating mission...
                </motion.p>
              ) : (
                <p className="text-gray-300">{outcome}</p>
              )}
            </div>
          ) : (
            <>
              {/* Army Composition */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Spies</p>
                  <p className="text-white text-2xl font-bold">{spyCount}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Assassins</p>
                  <p className="text-white text-2xl font-bold">{assassinCount}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Guards</p>
                  <p className="text-white text-2xl font-bold">{guardCount}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Seducers</p>
                  <p className="text-white text-2xl font-bold">{seducerCount}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Messengers</p>
                  <p className="text-white text-2xl font-bold">{messengerCount}</p>
                </div>
              </div>

              {/* Group Missions */}
              <h3 className="text-white font-bold mb-3">Coordinated Missions</h3>
              <div className="space-y-2">
                {GROUP_MISSIONS.map(mission => {
                  const Icon = mission.icon;
                  return (
                    <motion.button
                      key={mission.id}
                      onClick={() => handleGroupMission(mission)}
                      className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm">{mission.label}</h4>
                          <p className="text-gray-400 text-xs">{mission.description}</p>
                        </div>
                        <Send className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Thrall List */}
              <h3 className="text-white font-bold mt-6 mb-3">Thrall Roster</h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {thralls.map(thrall => (
                  <div key={thrall.id} className="bg-gray-800 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{thrall.name}</h4>
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs">
                        {thrall.role === 'none' ? 'Unassigned' : thrall.role}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400">Level</p>
                        <p className="text-purple-400">{thrall.level || 1}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Loyalty</p>
                        <p className={thrall.loyalty > 70 ? 'text-green-400' : thrall.loyalty > 40 ? 'text-yellow-400' : 'text-red-400'}>
                          {thrall.loyalty || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Missions</p>
                        <p className="text-white">{(thrall.mission_successes || 0) + (thrall.mission_failures || 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}