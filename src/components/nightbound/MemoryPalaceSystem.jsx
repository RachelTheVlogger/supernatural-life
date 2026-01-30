import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Eye, Edit, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MemoryPalaceSystem({ entity, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const { data: memories = [] } = useQuery({
    queryKey: ['memories', entity.id],
    queryFn: () => base44.entities.MemoryFragment.filter({ owner_id: entity.id })
  });

  const handleCreateMemory = async () => {
    setCreating(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a significant memory for ${entity.vampire_name || entity.name}. Make it emotional, detailed, and relevant to a supernatural being. Return title and full description.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          emotional_weight: { type: 'string' }
        }
      }
    });

    await base44.entities.MemoryFragment.create({
      owner_id: entity.id,
      title: result.title,
      description: result.description,
      memory_date: new Date().toISOString(),
      emotional_weight: result.emotional_weight || 'neutral'
    });

    queryClient.invalidateQueries();
    setCreating(false);
  };

  const handleEditMemory = async (memory) => {
    const newDesc = prompt('Edit memory:', memory.description);
    if (!newDesc) return;

    await base44.entities.MemoryFragment.update(memory.id, {
      description: newDesc,
      is_edited: true
    });

    await base44.entities.NightLog.create({
      entry: `Memory altered: ${memory.title}. The past rewritten.`,
      category: 'supernatural',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const getEmotionColor = (emotion) => {
    return {
      joyful: 'yellow',
      painful: 'red',
      traumatic: 'purple',
      bittersweet: 'blue',
      neutral: 'gray'
    }[emotion] || 'gray';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🧠 Memory Palace</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleCreateMemory}
          disabled={creating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl mb-6 font-bold disabled:opacity-50"
        >
          {creating ? 'Remembering...' : '💭 Capture New Memory'}
        </button>

        <div className="space-y-3">
          {memories.map(memory => {
            const color = getEmotionColor(memory.emotional_weight);
            return (
              <div key={memory.id} className={`bg-${color}-950/30 border border-${color}-500/30 rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-white font-bold mb-1">{memory.title}</p>
                    {memory.is_edited && <span className="text-yellow-400 text-xs">✏️ Edited</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMemory(memory.id === selectedMemory ? null : memory.id)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditMemory(memory)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {selectedMemory === memory.id && (
                  <div className="bg-black/40 rounded p-3 mt-3">
                    <p className="text-gray-300 text-sm leading-relaxed">{memory.description}</p>
                    <p className={`text-${color}-400 text-xs mt-2 capitalize`}>
                      Emotion: {memory.emotional_weight}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}