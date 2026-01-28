import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, Plus, X, UserPlus, Trash2, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HunterTeamManagement({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState('overview'); // overview, create, manage
  const [teamName, setTeamName] = useState('');
  const [specialization, setSpecialization] = useState('tactical');

  const { data: teams = [] } = useQuery({
    queryKey: ['hunterTeams'],
    queryFn: () => base44.entities.HunterTeam.list()
  });

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const myTeam = teams.find(t => t.member_ids?.includes(hunter.id));
  const isLeader = myTeam?.leader_id === hunter.id;
  const unassignedHunters = hunters.filter(h => !h.team_id);
  const teamMembers = hunters.filter(h => h.team_id === myTeam?.id);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;

    try {
      const newTeam = await base44.entities.HunterTeam.create({
        name: teamName,
        leader_id: hunter.id,
        member_ids: [hunter.id],
        specialization,
        formation_date: new Date().toISOString()
      });

      await base44.entities.Hunter.update(hunter.id, {
        team_id: newTeam.id,
        team_role: 'leader'
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} formed a new hunter team: ${teamName}`,
        category: 'hunting',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setView('overview');
      setTeamName('');
    } catch (e) {
      console.error('Failed to create team:', e);
    }
  };

  const handleRecruitHunter = async (recruitHunter) => {
    if (!myTeam || !isLeader) return;

    try {
      await base44.entities.Hunter.update(recruitHunter.id, {
        team_id: myTeam.id,
        team_role: 'member'
      });

      await base44.entities.HunterTeam.update(myTeam.id, {
        member_ids: [...(myTeam.member_ids || []), recruitHunter.id]
      });

      await base44.entities.TeamMessage.create({
        team_id: myTeam.id,
        sender_id: 'system',
        sender_name: 'System',
        content: `${recruitHunter.name} has joined the team!`,
        message_type: 'system'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to recruit:', e);
    }
  };

  const handleRemoveFromTeam = async (memberId) => {
    if (!myTeam || !isLeader || memberId === hunter.id) return;

    try {
      await base44.entities.Hunter.update(memberId, {
        team_id: null,
        team_role: null
      });

      await base44.entities.HunterTeam.update(myTeam.id, {
        member_ids: myTeam.member_ids.filter(id => id !== memberId)
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to remove member:', e);
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam) return;

    if (isLeader) {
      if (!confirm('As leader, leaving will disband the team. Continue?')) return;
      await base44.entities.HunterTeam.delete(myTeam.id);
      for (const memberId of myTeam.member_ids) {
        await base44.entities.Hunter.update(memberId, {
          team_id: null,
          team_role: null
        });
      }
    } else {
      await base44.entities.Hunter.update(hunter.id, {
        team_id: null,
        team_role: null
      });
      await base44.entities.HunterTeam.update(myTeam.id, {
        member_ids: myTeam.member_ids.filter(id => id !== hunter.id)
      });
    }

    queryClient.invalidateQueries();
  };

  const specializations = {
    assault: { icon: '⚔️', name: 'Assault', description: 'Direct combat specialists' },
    stealth: { icon: '🥷', name: 'Stealth', description: 'Silent infiltration experts' },
    research: { icon: '🔬', name: 'Research', description: 'Intelligence gathering focus' },
    tactical: { icon: '🎯', name: 'Tactical', description: 'Balanced coordination' }
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
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Hunter Teams</h2>
            <p className="text-gray-400">Coordinate with fellow hunters</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Overview
          </button>
          {!myTeam && (
            <button
              onClick={() => setView('create')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Create Team
            </button>
          )}
          {myTeam && isLeader && (
            <button
              onClick={() => setView('manage')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'manage' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Manage
            </button>
          )}
        </div>

        {/* Overview */}
        {view === 'overview' && (
          <div className="space-y-6">
            {myTeam ? (
              <>
                {/* Your Team */}
                <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-2xl font-bold mb-2">{myTeam.name}</h3>
                      <p className="text-blue-300 mb-2">
                        {specializations[myTeam.specialization]?.icon} {specializations[myTeam.specialization]?.name}
                      </p>
                      <p className="text-gray-400 text-sm">{specializations[myTeam.specialization]?.description}</p>
                    </div>
                    {isLeader && <Crown className="w-6 h-6 text-yellow-400" />}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">Reputation</p>
                      <p className="text-white text-xl font-bold">{myTeam.reputation || 0}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">Missions</p>
                      <p className="text-white text-xl font-bold">{myTeam.missions_completed || 0}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">Team Funds</p>
                      <p className="text-white text-xl font-bold">${myTeam.team_funds || 0}</p>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="text-white font-bold mb-3">Team Members ({teamMembers.length})</h4>
                    <div className="space-y-2">
                      {teamMembers.map(member => (
                        <div
                          key={member.id}
                          className="bg-black/40 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {member.name}
                              {member.id === myTeam.leader_id && <Crown className="w-4 h-4 text-yellow-400" />}
                            </p>
                            <p className="text-gray-400 text-sm capitalize">
                              {member.specialty} • Level {Math.floor(member.skill_level / 10)}
                            </p>
                          </div>
                          {isLeader && member.id !== hunter.id && (
                            <button
                              onClick={() => handleRemoveFromTeam(member.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleLeaveTeam}
                    className="w-full mt-6 bg-red-900/60 hover:bg-red-900/80 text-white py-3 rounded-lg transition-colors"
                  >
                    {isLeader ? 'Disband Team' : 'Leave Team'}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Not in a Team</h3>
                <p className="text-gray-400 mb-6">Form or join a team to take on harder missions</p>
                <button
                  onClick={() => setView('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Create Team
                </button>
              </div>
            )}

            {/* All Teams */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">All Teams</h3>
              <div className="space-y-3">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-bold">{team.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {specializations[team.specialization]?.icon} {specializations[team.specialization]?.name} • {team.member_ids?.length || 0} members
                        </p>
                      </div>
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Team */}
        {view === 'create' && (
          <div className="space-y-6">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Specialization</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(specializations).map(([key, spec]) => (
                  <button
                    key={key}
                    onClick={() => setSpecialization(key)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      specialization === key
                        ? 'border-blue-500 bg-blue-950/30'
                        : 'border-gray-700 bg-gray-800'
                    }`}
                  >
                    <p className="text-3xl mb-2">{spec.icon}</p>
                    <p className="text-white font-bold">{spec.name}</p>
                    <p className="text-gray-400 text-xs">{spec.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateTeam}
              disabled={!teamName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg transition-colors"
            >
              Create Team
            </button>
          </div>
        )}

        {/* Manage (Leader Only) */}
        {view === 'manage' && myTeam && isLeader && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Recruit Hunters</h3>
              {unassignedHunters.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No available hunters to recruit</p>
              ) : (
                <div className="space-y-2">
                  {unassignedHunters.map(h => (
                    <div
                      key={h.id}
                      className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">{h.name}</p>
                        <p className="text-gray-400 text-sm capitalize">
                          {h.specialty} • Skill: {h.skill_level}%
                        </p>
                      </div>
                      <button
                        onClick={() => handleRecruitHunter(h)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Recruit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}