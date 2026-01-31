import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Shield, Target, MapPin, Crown, TrendingUp, AlertCircle, Plus, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const WEREWOLF_ROLES = [
  { id: 'alpha', name: 'Alpha', icon: Crown, bonus: 'Commands respect, +30% pack strength' },
  { id: 'beta', name: 'Beta', icon: Shield, bonus: 'Protects territory, +20% defense' },
  { id: 'enforcer', name: 'Enforcer', icon: Target, bonus: 'Hunts intruders, +25% combat' },
  { id: 'scout', name: 'Scout', icon: MapPin, bonus: 'Expands territory, +15% scouting' },
  { id: 'omega', name: 'Omega', icon: Users, bonus: 'Pack harmony, +10% loyalty gain' }
];

const PACK_QUESTS = [
  { id: 'hunt_vampire', name: 'Hunt the Vampire', reward: '+50 territory, +20 strength', difficulty: 'hard', duration: 3 },
  { id: 'rival_pack', name: 'Challenge Rival Pack', reward: '+100 territory, Leadership', difficulty: 'extreme', duration: 5 },
  { id: 'expand_territory', name: 'Expand Territory', reward: '+30 territory, +10 resources', difficulty: 'medium', duration: 2 },
  { id: 'recruit_mission', name: 'Recruit Lone Wolves', reward: '+2 pack members', difficulty: 'easy', duration: 1 },
  { id: 'defend_home', name: 'Defend Against Hunters', reward: '+40 defense, +15 loyalty', difficulty: 'hard', duration: 2 }
];

const WEREWOLF_NAMES = [
  'Fenrir', 'Luna', 'Shadow', 'Kira', 'Magnus', 'Sage', 'Storm', 'Ash',
  'Blaze', 'Frost', 'Raven', 'Drake', 'Nova', 'Echo', 'Zara', 'Orion'
];

export default function WerewolfPackManagement({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState('overview'); // overview, members, territories, quests, resources
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: pack } = useQuery({
    queryKey: ['werewolfPack', werewolf.pack_id],
    queryFn: async () => {
      if (!werewolf.pack_id) {
        // Create pack if doesn't exist
        const newPack = await base44.entities.WerewolfPack.create({
          pack_name: `${werewolf.name}'s Pack`,
          alpha_id: werewolf.id,
          member_ids: [werewolf.id],
          territory: 'Forest Territory',
          pack_strength: 50,
          pack_resources: 100,
          pack_defense: 30,
          active_quests: []
        });
        await base44.entities.Werewolf.update(werewolf.id, { pack_id: newPack.id });
        return newPack;
      }
      const packs = await base44.entities.WerewolfPack.list();
      return packs.find(p => p.id === werewolf.pack_id) || packs[0];
    }
  });

  const { data: allWerewolves = [] } = useQuery({
    queryKey: ['allWerewolves'],
    queryFn: () => base44.entities.Werewolf.list()
  });

  const packMembers = allWerewolves.filter(w => pack?.member_ids?.includes(w.id));

  const handleRecruit = async () => {
    if (!pack || pack.pack_resources < 50) {
      setOutcome('Not enough resources to recruit (need 50)');
      setTimeout(() => setOutcome(''), 2000);
      return;
    }

    setProcessing(true);

    setTimeout(async () => {
      const newName = WEREWOLF_NAMES[Math.floor(Math.random() * WEREWOLF_NAMES.length)];
      const newWolf = await base44.entities.Werewolf.create({
        name: newName,
        gender: Math.random() > 0.5 ? 'man' : 'woman',
        moon_phase: 'waxing',
        pack_rank: 'omega',
        transformation_control: Math.floor(Math.random() * 30) + 20,
        beast_rage: Math.floor(Math.random() * 40) + 30,
        pack_id: pack.id,
        loyalty: 60,
        assigned_role: 'omega',
        assigned_territory: 'Main Territory'
      });

      await base44.entities.WerewolfPack.update(pack.id, {
        member_ids: [...(pack.member_ids || []), newWolf.id],
        pack_resources: (pack.pack_resources || 0) - 50,
        pack_strength: (pack.pack_strength || 0) + 10
      });

      await base44.entities.NightLog.create({
        entry: `${newName} joined ${pack.pack_name}. Pack grows stronger.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`${newName} joined the pack!`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 2000);
    }, 1500);
  };

  const handleAssignRole = async (member, roleId) => {
    await base44.entities.Werewolf.update(member.id, {
      assigned_role: roleId
    });

    await base44.entities.NightLog.create({
      entry: `${member.name} assigned as ${WEREWOLF_ROLES.find(r => r.id === roleId)?.name}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setSelectedMember(null);
  };

  const handleStartQuest = async (quest) => {
    if (!pack) return;

    setProcessing(true);

    setTimeout(async () => {
      const activeQuests = pack.active_quests || [];
      activeQuests.push({ ...quest, turnsRemaining: quest.duration });

      await base44.entities.WerewolfPack.update(pack.id, {
        active_quests: activeQuests
      });

      setOutcome(`Quest started: ${quest.name}`);

      await base44.entities.NightLog.create({
        entry: `${pack.pack_name} embarked on: ${quest.name}`,
        category: 'quest',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 2000);
    }, 1000);
  };

  const handleAllocateResources = async (amount) => {
    if (!pack || pack.pack_resources + amount < 0) return;

    await base44.entities.WerewolfPack.update(pack.id, {
      pack_resources: (pack.pack_resources || 0) + amount
    });

    queryClient.invalidateQueries();
  };

  if (!pack) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      >
        <p className="text-white">Loading pack...</p>
      </motion.div>
    );
  }

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
        className="bg-gradient-to-br from-orange-950 to-gray-950 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-500/50"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-orange-100">🐺 {pack.pack_name}</h2>
            <p className="text-orange-300 text-sm mt-1">{packMembers.length} members • Territory: {pack.territory}</p>
          </div>
          <button onClick={onClose} className="text-orange-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pack Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-black/40 rounded-lg p-3 border border-orange-500/30">
            <p className="text-orange-400 text-xs">Strength</p>
            <p className="text-white font-bold text-xl">{pack.pack_strength || 0}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-green-500/30">
            <p className="text-green-400 text-xs">Resources</p>
            <p className="text-white font-bold text-xl">{pack.pack_resources || 0}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-blue-500/30">
            <p className="text-blue-400 text-xs">Defense</p>
            <p className="text-white font-bold text-xl">{pack.pack_defense || 0}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-purple-500/30">
            <p className="text-purple-400 text-xs">Territory Size</p>
            <p className="text-white font-bold text-xl">{werewolf.territory_size || 0} sq mi</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['overview', 'members', 'territories', 'quests', 'resources'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-lg transition-all capitalize ${
                view === tab
                  ? 'bg-orange-600 text-white'
                  : 'bg-black/40 text-orange-300 hover:bg-black/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 rounded-xl p-8 text-center border border-orange-500/30"
            >
              <p className="text-orange-100 text-lg">{outcome}</p>
            </motion.div>
          ) : processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Users className="w-12 h-12 text-orange-400 mx-auto" />
              </motion.div>
              <p className="text-orange-300 mt-4">Processing...</p>
            </motion.div>
          ) : view === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-4">
                <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="text-white font-bold mb-2">Pack Status</h3>
                  <p className="text-gray-400 text-sm mb-2">Alpha: {allWerewolves.find(w => w.id === pack.alpha_id)?.name || 'None'}</p>
                  <p className="text-gray-400 text-sm mb-2">Members: {packMembers.length}</p>
                  <p className="text-gray-400 text-sm">Active Quests: {pack.active_quests?.length || 0}</p>
                </div>

                <button
                  onClick={handleRecruit}
                  className="w-full bg-green-900/60 hover:bg-green-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center justify-center gap-3"
                >
                  <Plus className="w-5 h-5 text-green-300" />
                  <span className="text-white font-bold">Recruit New Member (50 resources)</span>
                </button>
              </div>
            </motion.div>
          ) : view === 'members' ? (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {selectedMember ? (
                <div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-orange-300 hover:text-orange-100 mb-4 text-sm"
                  >
                    ← Back to members
                  </button>
                  <div className="bg-black/40 rounded-xl p-6 border border-orange-500/30">
                    <h3 className="text-white font-bold text-xl mb-4">{selectedMember.name}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">Control</p>
                        <p className="text-white font-bold">{selectedMember.transformation_control}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Rage</p>
                        <p className="text-white font-bold">{selectedMember.beast_rage}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Loyalty</p>
                        <p className="text-white font-bold">{selectedMember.loyalty || 60}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Territory</p>
                        <p className="text-white font-bold">{selectedMember.assigned_territory || 'None'}</p>
                      </div>
                    </div>

                    <h4 className="text-orange-300 font-bold mb-3">Assign Role</h4>
                    <div className="space-y-2">
                      {WEREWOLF_ROLES.map(role => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.id}
                            onClick={() => handleAssignRole(selectedMember, role.id)}
                            className={`w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors ${
                              selectedMember.assigned_role === role.id ? 'ring-2 ring-orange-500' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-orange-400" />
                              <div>
                                <p className="text-white font-bold">{role.name}</p>
                                <p className="text-gray-400 text-xs">{role.bonus}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {packMembers.map(member => {
                    const role = WEREWOLF_ROLES.find(r => r.id === member.assigned_role);
                    const Icon = role?.icon || Users;
                    return (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="w-full bg-black/40 hover:bg-black/60 border border-orange-500/30 rounded-xl p-4 text-left transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-6 h-6 text-orange-400" />
                            <div>
                              <p className="text-white font-bold">{member.name}</p>
                              <p className="text-gray-400 text-sm">
                                {role?.name || 'No role'} • Loyalty: {member.loyalty || 60}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-blue-400">Control: {member.transformation_control}%</p>
                            <p className="text-red-400">Rage: {member.beast_rage}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : view === 'territories' ? (
            <motion.div key="territories" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-4">
                <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="text-white font-bold mb-2">Main Territory</h3>
                  <p className="text-gray-400 text-sm mb-3">{pack.territory}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-xs">Size</p>
                      <p className="text-white font-bold">{werewolf.territory_size || 0} sq mi</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Defense</p>
                      <p className="text-white font-bold">{pack.pack_defense || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="text-white font-bold mb-3">Assign Members to Territories</h3>
                  {packMembers.map(member => (
                    <div key={member.id} className="mb-2 p-3 bg-gray-800 rounded-lg">
                      <p className="text-white text-sm mb-1">{member.name}</p>
                      <input
                        type="text"
                        placeholder="Territory assignment..."
                        defaultValue={member.assigned_territory || ''}
                        onBlur={async (e) => {
                          await base44.entities.Werewolf.update(member.id, {
                            assigned_territory: e.target.value
                          });
                          queryClient.invalidateQueries();
                        }}
                        className="w-full bg-gray-900 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : view === 'quests' ? (
            <motion.div key="quests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-4">
                {pack.active_quests && pack.active_quests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-orange-300 font-bold mb-3">Active Quests</h3>
                    {pack.active_quests.map((quest, i) => (
                      <div key={i} className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 mb-2">
                        <p className="text-white font-bold">{quest.name}</p>
                        <p className="text-gray-400 text-sm">Turns remaining: {quest.turnsRemaining}</p>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="text-orange-300 font-bold mb-3">Available Quests</h3>
                {PACK_QUESTS.map(quest => (
                  <div
                    key={quest.id}
                    className="bg-black/40 border border-orange-500/30 rounded-xl p-4 mb-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-bold">{quest.name}</h4>
                        <p className="text-gray-400 text-sm mt-1">Reward: {quest.reward}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        quest.difficulty === 'easy' ? 'bg-green-900/50 text-green-300' :
                        quest.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                        quest.difficulty === 'hard' ? 'bg-orange-900/50 text-orange-300' :
                        'bg-red-900/50 text-red-300'
                      }`}>
                        {quest.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-3">Duration: {quest.duration} turns</p>
                    <button
                      onClick={() => handleStartQuest(quest)}
                      disabled={pack.active_quests?.some(q => q.id === quest.id)}
                      className={`w-full py-2 rounded-lg text-sm ${
                        pack.active_quests?.some(q => q.id === quest.id)
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      {pack.active_quests?.some(q => q.id === quest.id) ? 'Active' : 'Start Quest'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : view === 'resources' ? (
            <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-4">
                <div className="bg-black/40 rounded-xl p-6 border border-orange-500/30">
                  <h3 className="text-white font-bold text-xl mb-4">Pack Resources</h3>
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-2">Current Resources</p>
                    <p className="text-white text-4xl font-bold">{pack.pack_resources || 0}</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleAllocateResources(10)}
                      className="w-full bg-green-900/60 hover:bg-green-900/80 border border-green-500/50 rounded-lg py-3 px-4 flex items-center justify-between"
                    >
                      <span className="text-white font-bold">Hunt for Resources</span>
                      <Plus className="w-5 h-5 text-green-300" />
                    </button>

                    <button
                      onClick={() => handleAllocateResources(-20)}
                      disabled={pack.pack_resources < 20}
                      className="w-full bg-blue-900/60 hover:bg-blue-900/80 border border-blue-500/50 rounded-lg py-3 px-4 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-white font-bold">Strengthen Defenses (-20)</span>
                      <Shield className="w-5 h-5 text-blue-300" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
                  <h4 className="text-orange-300 font-bold mb-2">Resource Usage</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Recruit member: 50 resources</li>
                    <li>• Strengthen defense: 20 resources</li>
                    <li>• Expand territory: 30 resources</li>
                    <li>• Train member: 15 resources</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}