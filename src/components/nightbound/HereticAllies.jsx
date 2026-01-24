import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Users, Plus, Trash2, MessageCircle } from 'lucide-react';

const ALLY_TYPES = {
  vampire: { label: 'Vampire', icon: '🦇', color: 'from-red-600 to-purple-600' },
  witch: { label: 'Witch', icon: '✨', color: 'from-purple-600 to-pink-600' },
  heretic: { label: 'Heretic', icon: '⚡', color: 'from-fuchsia-600 to-purple-600' },
  human: { label: 'Human', icon: '👤', color: 'from-gray-600 to-slate-600' },
  supernatural: { label: 'Supernatural', icon: '🌙', color: 'from-indigo-600 to-blue-600' }
};

export default function HereticAllies({ heretic, onClose }) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAlly, setSelectedAlly] = useState(null);
  const [newAllyName, setNewAllyName] = useState('');
  const [newAllyType, setNewAllyType] = useState('vampire');

  const { data: allies = [] } = useQuery({
    queryKey: ['heretic-allies', heretic.id],
    queryFn: async () => {
      try {
        return await base44.entities.HereticAlly.filter({ heretic_id: heretic.id });
      } catch (e) {
        console.error('Failed to fetch allies:', e);
        return [];
      }
    },
    enabled: !!heretic?.id
  });

  const handleAddAlly = async () => {
    if (!newAllyName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.HereticAlly.create({
        heretic_id: heretic.id,
        name: newAllyName.trim(),
        type: newAllyType,
        relationship_level: 0,
        trust: 50,
        loyalty: 50
      });

      queryClient.invalidateQueries(['heretic-allies']);
      setNewAllyName('');
      setShowCreateForm(false);
    } catch (e) {
      console.error('Failed to create ally:', e);
    }
  };

  const handleUpdateAlly = async (allyId, updates) => {
    try {
      await base44.entities.HereticAlly.update(allyId, updates);
      queryClient.invalidateQueries(['heretic-allies']);
      setSelectedAlly(null);
    } catch (e) {
      console.error('Failed to update ally:', e);
    }
  };

  const handleDeleteAlly = async (allyId) => {
    if (confirm('Remove this ally?')) {
      try {
        await base44.entities.HereticAlly.delete(allyId);
        queryClient.invalidateQueries(['heretic-allies']);
      } catch (e) {
        console.error('Failed to delete ally:', e);
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
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-purple-400" />
              Allies & Companions
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">Build bonds with others</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Add Ally Button */}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Ally
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
                  value={newAllyName}
                  onChange={(e) => setNewAllyName(e.target.value)}
                  placeholder="Ally name..."
                  className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  autoFocus
                />

                <select
                  value={newAllyType}
                  onChange={(e) => setNewAllyType(e.target.value)}
                  className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {Object.entries(ALLY_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAlly}
                    disabled={!newAllyName.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Allies List */}
          <div className="space-y-3">
            {allies.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No allies yet. Form bonds with others.</p>
            ) : (
              allies.map(ally => {
                const typeInfo = ALLY_TYPES[ally.type] || ALLY_TYPES.human;
                const isSelected = selectedAlly?.id === ally.id;

                return (
                  <motion.div
                    key={ally.id}
                    layout
                    className={`bg-gray-800 rounded-lg p-4 border transition-all ${
                      isSelected ? 'border-purple-500 shadow-lg' : 'border-gray-700 hover:border-purple-500/50'
                    }`}
                    onClick={() => setSelectedAlly(isSelected ? null : ally)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div>
                            <h3 className="text-white font-medium">{ally.name}</h3>
                            <p className="text-gray-400 text-xs">{typeInfo.label}</p>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 mt-3 pt-3 border-t border-gray-700"
                            >
                              {/* Relationship Bars */}
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Relationship</span>
                                  <span className="text-purple-400">{ally.relationship_level || 0}/100</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((ally.relationship_level || 0), 100)}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-2 rounded-full bg-purple-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Trust</span>
                                    <span className="text-blue-400">{ally.trust || 50}</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                      style={{ width: `${ally.trust || 50}%` }}
                                      className="h-1.5 rounded-full bg-blue-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Loyalty</span>
                                    <span className="text-green-400">{ally.loyalty || 50}</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                      style={{ width: `${ally.loyalty || 50}%` }}
                                      className="h-1.5 rounded-full bg-green-500"
                                    />
                                  </div>
                                </div>
                              </div>

                              <p className="text-gray-400 text-xs">
                                Interactions: {ally.interaction_count || 0}
                              </p>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateAlly(ally.id, {
                                    relationship_level: Math.min((ally.relationship_level || 0) + 10, 100),
                                    interaction_count: (ally.interaction_count || 0) + 1
                                  })}
                                  className="flex-1 bg-purple-900/60 hover:bg-purple-900/80 text-purple-200 text-xs py-2 rounded transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3 inline mr-1" /> Interact
                                </button>
                                <button
                                  onClick={() => handleDeleteAlly(ally.id)}
                                  className="flex-1 bg-red-900/60 hover:bg-red-900/80 text-red-200 text-xs py-2 rounded transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 inline mr-1" /> Remove
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