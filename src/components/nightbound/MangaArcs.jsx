import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaArcs({ career, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newArc, setNewArc] = useState({ title: '', description: '', planned_chapters: 3 });

  const handleCreateArc = async () => {
    if (!newArc.title.trim()) return;
    setCreating(true);

    const arcs = career.story_arcs || [];
    arcs.push({
      id: Date.now().toString(),
      title: newArc.title,
      description: newArc.description,
      planned_chapters: newArc.planned_chapters,
      completed_chapters: 0,
      active: true,
      created_date: new Date().toISOString()
    });

    await base44.entities.ServantCareer.update(career.id, {
      story_arcs: arcs
    });

    queryClient.invalidateQueries(['career']);
    setNewArc({ title: '', description: '', planned_chapters: 3 });
    setCreating(false);
  };

  const handleCompleteArc = async (arcId) => {
    const arcs = (career.story_arcs || []).map(arc => 
      arc.id === arcId ? { ...arc, active: false } : arc
    );
    await base44.entities.ServantCareer.update(career.id, { story_arcs: arcs });
    queryClient.invalidateQueries(['career']);
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
          <h3 className="text-white text-2xl font-bold">Story Arcs</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3">Create New Arc</h4>
          <input
            value={newArc.title}
            onChange={(e) => setNewArc({...newArc, title: e.target.value})}
            placeholder="Arc title (e.g., 'Tournament Saga')"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-3"
          />
          <textarea
            value={newArc.description}
            onChange={(e) => setNewArc({...newArc, description: e.target.value})}
            placeholder="Arc description..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none mb-3"
            rows={3}
          />
          <div className="flex items-center gap-3 mb-3">
            <label className="text-gray-400 text-sm">Planned Chapters:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={newArc.planned_chapters}
              onChange={(e) => setNewArc({...newArc, planned_chapters: parseInt(e.target.value) || 3})}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-white w-20"
            />
          </div>
          <button
            onClick={handleCreateArc}
            disabled={!newArc.title.trim() || creating}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Arc'}
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-medium">Active Arcs</h4>
          {(career?.story_arcs || []).filter(arc => arc.active).map(arc => (
            <div key={arc.id} className="bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border border-blue-500/30 rounded-lg p-4">
              <h5 className="text-white font-bold mb-1">{arc.title}</h5>
              <p className="text-gray-400 text-sm mb-2">{arc.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-400 text-sm">
                  {arc.completed_chapters || 0} / {arc.planned_chapters} chapters
                </span>
                <button
                  onClick={() => handleCompleteArc(arc.id)}
                  className="bg-green-900/40 hover:bg-green-900/60 text-green-300 px-3 py-1 rounded text-sm"
                >
                  Complete Arc
                </button>
              </div>
            </div>
          ))}

          {(career?.story_arcs || []).filter(arc => !arc.active).length > 0 && (
            <>
              <h4 className="text-white font-medium mt-6">Completed Arcs</h4>
              {(career.story_arcs || []).filter(arc => !arc.active).map(arc => (
                <div key={arc.id} className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-3 opacity-70">
                  <h5 className="text-white font-medium">{arc.title}</h5>
                  <p className="text-gray-500 text-xs">✅ Completed</p>
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}