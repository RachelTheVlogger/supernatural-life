import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Target, Zap, TrendingUp, Trash2, Shield, Eye, AlertCircle, ChevronRight, Calendar, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const HUNTER_SPECIALTIES = ['tracker', 'researcher', 'combatant', 'infiltrator'];
const HUNTER_NAMES = ['Marcus', 'Elena', 'Vincent', 'Sarah', 'James', 'Diana', 'Alexander', 'Rachel', 'Nathan', 'Victoria'];

const AVAILABLE_MISSIONS = [
  { id: 'patrol', name: 'Night Patrol', duration: '4h', expGain: 20, description: 'Scout the area for vampire activity' },
  { id: 'research', name: 'Research Vampires', duration: '6h', expGain: 35, description: 'Study vampire weaknesses and patterns' },
  { id: 'train', name: 'Combat Training', duration: '3h', expGain: 15, description: 'Improve fighting skills' },
  { id: 'investigate', name: 'Investigation', duration: '8h', expGain: 50, description: 'Deep dive into vampire movements' },
  { id: 'recon', name: 'Reconnaissance', duration: '5h', expGain: 30, description: 'Gather intelligence on targets' }
];

export default function HunterManagement({ onClose }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState('list'); // 'list', 'profile', 'recruit'
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [recruitData, setRecruitData] = useState({ name: '', specialty: 'tracker' });
  const [processing, setProcessing] = useState(false);

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['hunterNotes'],
    queryFn: async () => {
      try {
        return await base44.entities.HunterNote.list();
      } catch (e) {
        return [];
      }
    }
  });

  const handleRecruitHunter = async () => {
    if (!recruitData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    setProcessing(true);
    try {
      await base44.entities.Hunter.create({
        name: recruitData.name,
        specialty: recruitData.specialty,
        skill_level: Math.floor(Math.random() * 30) + 20,
        suspicion: 0,
        status: 'tracking',
        traits: [],
        experience: 0
      });

      await base44.entities.NightLog.create({
        entry: `Recruited ${recruitData.name} as a ${recruitData.specialty}. They've joined the hunt.`,
        category: 'hunting',
        intensity: 'significant'
      });

      queryClient.invalidateQueries(['hunters']);
      setRecruitData({ name: '', specialty: 'tracker' });
      setView('list');
    } catch (e) {
      console.error('Failed to recruit:', e);
    }
    setProcessing(false);
  };

  const handleDismissHunter = async (hunter) => {
    if (!confirm(`Dismiss ${hunter.name}? This cannot be undone.`)) return;

    setProcessing(true);
    try {
      await base44.entities.Hunter.delete(hunter.id);
      await base44.entities.NightLog.create({
        entry: `Dismissed ${hunter.name} from active duty.`,
        category: 'hunting',
        intensity: 'moderate'
      });
      queryClient.invalidateQueries(['hunters']);
      setView('list');
      setSelectedHunter(null);
    } catch (e) {
      console.error('Failed to dismiss:', e);
    }
    setProcessing(false);
  };

  const handleAssignMission = async (hunter, mission) => {
    setProcessing(true);
    try {
      const newExp = (hunter.experience || 0) + mission.expGain;
      await base44.entities.Hunter.update(hunter.id, {
        experience: newExp
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} completed ${mission.name}. Gained ${mission.expGain} experience.`,
        category: 'hunting',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to assign mission:', e);
    }
    setProcessing(false);
  };

  const hunterNotes = selectedHunter ? notes.filter(n => n.hunter_id === selectedHunter.id) : [];

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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Hunter Management</h2>
            <p className="text-gray-400">{hunters.length} active hunters</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'list'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            All Hunters
          </button>
          <button
            onClick={() => setView('recruit')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'recruit'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Recruit Hunter
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Hunter List View */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {hunters.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No hunters recruited yet</p>
                  <button
                    onClick={() => setView('recruit')}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Recruit First Hunter
                  </button>
                </div>
              ) : (
                hunters.map(hunter => (
                  <motion.button
                    key={hunter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setSelectedHunter(hunter);
                      setView('profile');
                    }}
                    className="w-full bg-black/40 border border-gray-700 hover:border-gray-600 rounded-xl p-6 text-left transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white text-xl font-bold">{hunter.name}</h3>
                          <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded capitalize">
                            {hunter.specialty}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded capitalize ${
                            hunter.status === 'tracking' ? 'bg-blue-900/50 text-blue-300' :
                            hunter.status === 'dead' ? 'bg-gray-900/50 text-gray-400' :
                            'bg-green-900/50 text-green-300'
                          }`}>
                            {hunter.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-gray-500 text-xs">Skill Level</p>
                            <p className="text-white font-bold">{hunter.skill_level}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Suspicion</p>
                            <p className="text-white font-bold">{hunter.suspicion}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Experience</p>
                            <p className="text-white font-bold">{hunter.experience || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Traits</p>
                            <p className="text-white font-bold">{hunter.traits?.length || 0}/3</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {/* Hunter Profile View */}
          {view === 'profile' && selectedHunter && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setView('list')}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← Back to List
              </button>

              {/* Profile Header */}
              <div className="bg-black/40 border border-gray-700 rounded-2xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">{selectedHunter.name}</h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-red-900/50 text-red-300 text-sm rounded capitalize">
                        {selectedHunter.specialty}
                      </span>
                      <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-sm rounded capitalize">
                        {selectedHunter.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissHunter(selectedHunter)}
                    disabled={processing}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <Target className="w-5 h-5 text-red-400 mb-2" />
                    <p className="text-gray-400 text-xs mb-1">Skill Level</p>
                    <p className="text-white text-2xl font-bold">{selectedHunter.skill_level}%</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mb-2" />
                    <p className="text-gray-400 text-xs mb-1">Suspicion</p>
                    <p className="text-white text-2xl font-bold">{selectedHunter.suspicion}%</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <Award className="w-5 h-5 text-purple-400 mb-2" />
                    <p className="text-gray-400 text-xs mb-1">Experience</p>
                    <p className="text-white text-2xl font-bold">{selectedHunter.experience || 0}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <Zap className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-gray-400 text-xs mb-1">Active Traits</p>
                    <p className="text-white text-2xl font-bold">{selectedHunter.traits?.length || 0}/3</p>
                  </div>
                </div>
              </div>

              {/* Active Traits */}
              {selectedHunter.traits && selectedHunter.traits.length > 0 && (
                <div className="bg-black/40 border border-gray-700 rounded-2xl p-6">
                  <h4 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Active Traits
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedHunter.traits.map(trait => (
                      <span key={trait} className="px-3 py-2 bg-purple-900/50 text-purple-300 rounded-lg text-sm capitalize">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mission Assignment */}
              <div className="bg-black/40 border border-gray-700 rounded-2xl p-6">
                <h4 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Assign Mission
                </h4>
                <div className="space-y-3">
                  {AVAILABLE_MISSIONS.map(mission => (
                    <button
                      key={mission.id}
                      onClick={() => handleAssignMission(selectedHunter, mission)}
                      disabled={processing}
                      className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors disabled:opacity-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-bold">{mission.name}</h5>
                        <div className="text-right">
                          <p className="text-green-400 text-sm font-bold">+{mission.expGain} EXP</p>
                          <p className="text-gray-500 text-xs">{mission.duration}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{mission.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hunt Notes */}
              <div className="bg-black/40 border border-gray-700 rounded-2xl p-6">
                <h4 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Hunt Notes ({hunterNotes.length})
                </h4>
                {hunterNotes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No notes recorded yet</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {hunterNotes.map(note => (
                      <div key={note.id} className="bg-gray-900/50 rounded-lg p-4">
                        {note.vampire_name && (
                          <p className="text-red-400 font-bold mb-2">Target: {note.vampire_name}</p>
                        )}
                        <p className="text-gray-300 text-sm">{note.content}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                          note.priority === 'critical' ? 'bg-red-900/50 text-red-300' :
                          note.priority === 'high' ? 'bg-orange-900/50 text-orange-300' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {note.priority || 'normal'} priority
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Recruit New Hunter */}
          {view === 'recruit' && (
            <motion.div
              key="recruit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-black/40 border border-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Recruit New Hunter</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Hunter Name</label>
                    <input
                      type="text"
                      value={recruitData.name}
                      onChange={(e) => setRecruitData({...recruitData, name: e.target.value})}
                      placeholder="Enter name..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {HUNTER_NAMES.map(name => (
                        <button
                          key={name}
                          onClick={() => setRecruitData({...recruitData, name})}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Specialty</label>
                    <div className="grid grid-cols-2 gap-3">
                      {HUNTER_SPECIALTIES.map(spec => (
                        <button
                          key={spec}
                          onClick={() => setRecruitData({...recruitData, specialty: spec})}
                          className={`p-4 rounded-lg border-2 transition-all capitalize ${
                            recruitData.specialty === spec
                              ? 'bg-red-900/50 border-red-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleRecruitHunter}
                      disabled={processing || !recruitData.name.trim()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Recruiting...' : 'Recruit Hunter'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}