import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MISSION_TEMPLATES = [
  {
    title: 'Coordinated Assault',
    description: 'Attack a vampire stronghold together',
    difficulty: 'high',
    required_hunters: 3,
    rewards: { exp: 500, funds: 2000 }
  },
  {
    title: 'Surveillance Operation',
    description: 'Monitor multiple vampire locations simultaneously',
    difficulty: 'medium',
    required_hunters: 2,
    rewards: { exp: 300, funds: 1000 }
  },
  {
    title: 'Rescue Mission',
    description: 'Extract civilians from vampire territory',
    difficulty: 'extreme',
    required_hunters: 4,
    rewards: { exp: 800, funds: 3000 }
  },
  {
    title: 'Intel Gathering',
    description: 'Infiltrate and gather intelligence on vampire operations',
    difficulty: 'medium',
    required_hunters: 2,
    rewards: { exp: 400, funds: 1500 }
  }
];

export default function TeamMissions({ hunter, team, onClose }) {
  const queryClient = useQueryClient();
  const [selectedMission, setSelectedMission] = useState(null);
  const [assignedHunters, setAssignedHunters] = useState([]);

  const { data: missions = [] } = useQuery({
    queryKey: ['teamMissions', team?.id],
    queryFn: () => base44.entities.TeamMission.filter({ team_id: team.id })
  });

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const teamMembers = hunters.filter(h => h.team_id === team?.id);
  const isLeader = team?.leader_id === hunter.id;

  const handleStartMission = async (template) => {
    if (!team) return;

    try {
      const newMission = await base44.entities.TeamMission.create({
        team_id: team.id,
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        required_hunters: template.required_hunters,
        assigned_hunters: assignedHunters,
        status: 'planning',
        rewards: template.rewards,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      await base44.entities.TeamMessage.create({
        team_id: team.id,
        sender_id: 'system',
        sender_name: 'System',
        content: `New mission started: ${template.title}`,
        message_type: 'mission_update'
      });

      queryClient.invalidateQueries();
      setSelectedMission(null);
      setAssignedHunters([]);
    } catch (e) {
      console.error('Failed to start mission:', e);
    }
  };

  const handleActivateMission = async (mission) => {
    if (mission.assigned_hunters.length < mission.required_hunters) {
      alert(`Need at least ${mission.required_hunters} hunters assigned`);
      return;
    }

    try {
      await base44.entities.TeamMission.update(mission.id, {
        status: 'active'
      });

      await base44.entities.TeamMessage.create({
        team_id: team.id,
        sender_id: hunter.id,
        sender_name: hunter.name,
        content: `Mission "${mission.title}" is now active!`,
        message_type: 'mission_update'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to activate mission:', e);
    }
  };

  const handleCompleteMission = async (mission) => {
    try {
      await base44.entities.TeamMission.update(mission.id, {
        status: 'completed',
        progress: 100
      });

      // Distribute rewards
      const expPerHunter = Math.floor(mission.rewards.exp / mission.assigned_hunters.length);
      for (const hunterId of mission.assigned_hunters) {
        const h = hunters.find(hunter => hunter.id === hunterId);
        if (h) {
          await base44.entities.Hunter.update(hunterId, {
            experience: (h.experience || 0) + expPerHunter,
            missions_completed: (h.missions_completed || 0) + 1
          });
        }
      }

      await base44.entities.HunterTeam.update(team.id, {
        missions_completed: (team.missions_completed || 0) + 1,
        reputation: (team.reputation || 0) + 50,
        team_funds: (team.team_funds || 0) + mission.rewards.funds
      });

      await base44.entities.TeamMessage.create({
        team_id: team.id,
        sender_id: 'system',
        sender_name: 'System',
        content: `Mission "${mission.title}" completed! +${mission.rewards.exp} EXP, +$${mission.rewards.funds}`,
        message_type: 'mission_update'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to complete mission:', e);
    }
  };

  const difficultyColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    extreme: 'text-red-400'
  };

  const statusIcons = {
    planning: Clock,
    active: Target,
    completed: CheckCircle,
    failed: AlertCircle
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Team Missions</h2>
            <p className="text-gray-400">{team?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Active Missions */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-bold mb-4">Active Missions</h3>
          {missions.filter(m => m.status !== 'completed').length === 0 ? (
            <p className="text-gray-400 text-center py-8">No active missions</p>
          ) : (
            <div className="space-y-3">
              {missions.filter(m => m.status !== 'completed').map(mission => {
                const StatusIcon = statusIcons[mission.status];
                return (
                  <div
                    key={mission.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-bold mb-1">{mission.title}</h4>
                        <p className="text-gray-400 text-sm">{mission.description}</p>
                      </div>
                      <StatusIcon className="w-5 h-5 text-blue-400" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-black/40 rounded p-2">
                        <p className="text-gray-400 text-xs">Difficulty</p>
                        <p className={`font-medium capitalize ${difficultyColors[mission.difficulty]}`}>
                          {mission.difficulty}
                        </p>
                      </div>
                      <div className="bg-black/40 rounded p-2">
                        <p className="text-gray-400 text-xs">Assigned</p>
                        <p className="text-white font-medium">
                          {mission.assigned_hunters.length}/{mission.required_hunters}
                        </p>
                      </div>
                      <div className="bg-black/40 rounded p-2">
                        <p className="text-gray-400 text-xs">Progress</p>
                        <p className="text-white font-medium">{mission.progress || 0}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {mission.status === 'planning' && isLeader && (
                        <button
                          onClick={() => handleActivateMission(mission)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                        >
                          Activate Mission
                        </button>
                      )}
                      {mission.status === 'active' && isLeader && (
                        <button
                          onClick={() => handleCompleteMission(mission)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                        >
                          Complete Mission
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Missions */}
        {isLeader && (
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Available Missions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {MISSION_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMission(template)}
                  className="bg-gray-800/50 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all"
                >
                  <h4 className="text-white font-bold mb-2">{template.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className={`${difficultyColors[template.difficulty]} font-medium capitalize`}>
                      {template.difficulty}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{template.required_hunters} hunters</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mission Planning Modal */}
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-10 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedMission(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-white text-xl font-bold mb-4">{selectedMission.title}</h3>
              <p className="text-gray-400 mb-4">{selectedMission.description}</p>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Assign Hunters ({assignedHunters.length}/{selectedMission.required_hunters})</p>
                <div className="space-y-2">
                  {teamMembers.map(member => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={assignedHunters.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedHunters([...assignedHunters, member.id]);
                          } else {
                            setAssignedHunters(assignedHunters.filter(id => id !== member.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-gray-400 text-xs capitalize">{member.specialty}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMission(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStartMission(selectedMission)}
                  disabled={assignedHunters.length < selectedMission.required_hunters}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded-lg"
                >
                  Start Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}