import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaCollabs({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [collabName, setCollabName] = useState('');
  const [collabType, setCollabType] = useState('crossover');

  const handleCreateCollab = async () => {
    if (!collabName.trim()) return;
    setCreating(true);

    const collabs = career.collaborations_list || [];
    const fansGained = Math.floor(Math.random() * 500) + 300;

    collabs.push({
      id: Date.now().toString(),
      partner: collabName,
      type: collabType,
      fans_gained: fansGained,
      date: new Date().toISOString()
    });

    await base44.entities.ServantCareer.update(career.id, {
      collaborations_list: collabs,
      fans: (career.fans || 0) + fansGained
    });

    await base44.entities.NightLog.create({
      entry: `${entityName} collaborated with ${collabName}! +${fansGained} fans from crossover event!`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries(['career']);
    setCollabName('');
    setCreating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">Collaborations</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3">New Collaboration</h4>
          <input
            value={collabName}
            onChange={(e) => setCollabName(e.target.value)}
            placeholder="Partner name (another manga artist/series)"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-3"
          />
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { id: 'crossover', label: 'Crossover Event', icon: '🌟' },
              { id: 'guest', label: 'Guest Chapter', icon: '✨' },
              { id: 'joint', label: 'Joint Project', icon: '🤝' },
              { id: 'cameo', label: 'Character Cameo', icon: '👀' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setCollabType(type.id)}
                className={`rounded-lg p-3 transition-colors ${
                  collabType === type.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs">{type.label}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateCollab}
            disabled={!collabName.trim() || creating}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Start Collaboration'}
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-medium">Past Collaborations</h4>
          {(career?.collaborations_list || []).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No collaborations yet</p>
          ) : (
            [...(career.collaborations_list || [])].reverse().map(collab => (
              <div key={collab.id} className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border border-green-500/30 rounded-lg p-3">
                <div className="flex justify-between">
                  <div>
                    <h5 className="text-white font-medium">{collab.partner}</h5>
                    <p className="text-gray-400 text-sm capitalize">{collab.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">+{collab.fans_gained}</p>
                    <p className="text-gray-400 text-xs">fans</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}