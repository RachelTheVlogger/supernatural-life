import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap, Plus, Trash2, Target } from 'lucide-react';

const RIVAL_TYPES = {
  vampire: { label: 'Vampire', icon: '🦇', color: 'from-red-600 to-purple-600' },
  witch: { label: 'Witch', icon: '✨', color: 'from-purple-600 to-pink-600' },
  heretic: { label: 'Heretic', icon: '⚡', color: 'from-fuchsia-600 to-purple-600' },
  hunter: { label: 'Hunter', icon: '🎯', color: 'from-orange-600 to-red-600' }
};

export default function HereticRivalries({ heretic, onClose }) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRival, setSelectedRival] = useState(null);
  const [newRivalName, setNewRivalName] = useState('');
  const [newRivalType, setNewRivalType] = useState('vampire');
  const [newRivalReason, setNewRivalReason] = useState('');

  const { data: rivalries = [] } = useQuery({
    queryKey: ['heretic-rivalries', heretic.id],
    queryFn: async () => {
      try {
        return await base44.entities.HereticRivalry.filter({ heretic_id: heretic.id });
      } catch (e) {
        console.error('Failed to fetch rivalries:', e);
        return [];
      }
    },
    enabled: !!heretic?.id
  });

  const handleAddRival = async () => {
    if (!newRivalName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.HereticRivalry.create({
        heretic_id: heretic.id,
        name: newRivalName.trim(),
        type: newRivalType,
        conflict_reason: newRivalReason.trim(),
        hostility_level: 50,
        threat_level: 50
      });

      queryClient.invalidateQueries(['heretic-rivalries']);
      setNewRivalName('');
      setNewRivalReason('');
      setShowCreateForm(false);
    } catch (e) {
      console.error('Failed to create rival:', e);
    }
  };

  const handleUpdateRival = async (rivalId, updates) => {
    try {
      await base44.entities.HereticRivalry.update(rivalId, updates);
      queryClient.invalidateQueries(['heretic-rivalries']);
    } catch (e) {
      console.error('Failed to update rival:', e);
    }
  };

  const handleDeleteRival = async (rivalId) => {
    if (confirm('Resolve this rivalry?')) {
      try {
        await base44.entities.HereticRivalry.delete(rivalId);
        queryClient.invalidateQueries(['heretic-rivalries']);
      } catch (e) {
        console.error('Failed to delete rival:', e);
      }
    }
  };

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
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-red-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-red-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-red-400" />
              Rivalries & Enemies
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">Track your enemies and conflicts</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Add Rival Button */}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full bg-gradient-to-r from-red-900/60 to-orange-900/60 hover:from-red-900/80 hover:to-orange-900/80 border-2 border-red-500/50 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Rivalry
          </button>

          {/* Create Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-800 rounded-lg p-4 space-y-3"
              >
                <input
                  type="text"
                  value={newRivalName}
                  onChange={(e) => setNewRivalName(e.target.value)}
                  placeholder="Rival name..."
                  className="w-full bg-gray-700 border border-red-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  autoFocus
                />

                <select
                  value={newRivalType}
                  onChange={(e) => setNewRivalType(e.target.value)}
                  className="w-full bg-gray-700 border border-red-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {Object.entries(RIVAL_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>

                <textarea
                  value={newRivalReason}
                  onChange={(e) => setNewRivalReason(e.target.value)}
                  placeholder="Why are they your rival?"
                  className="w-full bg-gray-700 border border-red-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm h-20 resize-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRival}
                    disabled={!newRivalName.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rivalries List */}
          <div className="space-y-3">
            {rivalries.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No rivals yet.</p>
            ) : (
              rivalries.map(rival => {
                const typeInfo = RIVAL_TYPES[rival.type] || RIVAL_TYPES.vampire;
                const isSelected = selectedRival?.id === rival.id;

                return (
                  <motion.div
                    key={rival.id}
                    layout
                    className={`bg-gray-800 rounded-lg p-4 border transition-all ${
                      isSelected ? 'border-red-500 shadow-lg' : 'border-gray-700 hover:border-red-500/50'
                    }`}
                    onClick={() => setSelectedRival(isSelected ? null : rival)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div>
                            <h3 className="text-white font-medium">{rival.name}</h3>
                            <p className="text-gray-400 text-xs">{typeInfo.label}</p>
                          </div>
                        </div>

                        {rival.conflict_reason && (
                          <p className="text-gray-400 text-xs mb-2">Reason: {rival.conflict_reason}</p>
                        )}

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 mt-3 pt-3 border-t border-gray-700"
                            >
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Hostility</span>
                                  <span className="text-red-400">{rival.hostility_level || 50}/100</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    style={{ width: `${rival.hostility_level || 50}%` }}
                                    className="h-2 rounded-full bg-red-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Threat Level</span>
                                  <span className="text-orange-400">{rival.threat_level || 50}/100</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    style={{ width: `${rival.threat_level || 50}%` }}
                                    className="h-2 rounded-full bg-orange-500"
                                  />
                                </div>
                              </div>

                              <p className="text-gray-400 text-xs">
                                Confrontations: {rival.confrontations || 0}
                              </p>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateRival(rival.id, {
                                    confrontations: (rival.confrontations || 0) + 1,
                                    hostility_level: Math.min((rival.hostility_level || 50) + 10, 100)
                                  })}
                                  className="flex-1 bg-red-900/60 hover:bg-red-900/80 text-red-200 text-xs py-2 rounded transition-colors"
                                >
                                  <Zap className="w-3 h-3 inline mr-1" /> Confront
                                </button>
                                <button
                                  onClick={() => handleDeleteRival(rival.id)}
                                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs py-2 rounded transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 inline mr-1" /> Resolve
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}