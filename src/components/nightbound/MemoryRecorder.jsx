import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Play, Trash2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MemoryRecorder({ entity, onClose }) {
  const [recording, setRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [newMemory, setNewMemory] = useState({ title: '', description: '' });
  const [viewingMemory, setViewingMemory] = useState(null);
  const queryClient = useQueryClient();

  const { data: memories = [] } = useQuery({
    queryKey: ['memories', entity.id],
    queryFn: async () => {
      const allMemories = await base44.entities.Journal.filter({ 
        servant_id: entity.id 
      }, '-created_date');
      return allMemories.filter(m => m.title?.startsWith('🎥'));
    }
  });

  const startRecording = () => {
    setRecording(true);
    setRecordingProgress(0);
    const interval = setInterval(() => {
      setRecordingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRecording(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const saveMemory = async () => {
    if (!newMemory.title || !newMemory.description) return;

    await base44.entities.Journal.create({
      servant_id: entity.id,
      title: `🎥 ${newMemory.title}`,
      content: newMemory.description,
      mood: 'content'
    });

    queryClient.invalidateQueries(['memories']);
    setNewMemory({ title: '', description: '' });
    setRecordingProgress(0);
  };

  const deleteMemory = async (memoryId) => {
    await base44.entities.Journal.delete(memoryId);
    queryClient.invalidateQueries(['memories']);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Memory Recorder</h2>
              <p className="text-gray-400 text-sm">Capture and replay your moments</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {viewingMemory ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => setViewingMemory(null)}
                className="text-cyan-400 text-sm mb-4"
              >
                ← Back to memories
              </button>
              <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="text-white text-xl font-bold mb-4">{viewingMemory.title.replace('🎥 ', '')}</h3>
                <div className="bg-cyan-950/30 rounded-lg p-4 mb-4">
                  <p className="text-cyan-100 italic">Replaying memory...</p>
                </div>
                <p className="text-gray-300 whitespace-pre-line">{viewingMemory.content}</p>
              </div>
            </motion.div>
          ) : recordingProgress === 100 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-green-950/30 border border-green-500/30 rounded-xl p-4 mb-4">
                <p className="text-green-400">✓ Recording complete!</p>
              </div>
              <input
                type="text"
                placeholder="Memory title..."
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-cyan-500/30 focus:border-cyan-500 focus:outline-none"
              />
              <textarea
                placeholder="Describe what happened in this memory..."
                value={newMemory.description}
                onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                rows={6}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-cyan-500/30 focus:border-cyan-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRecordingProgress(0)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg"
                >
                  Discard
                </button>
                <button
                  onClick={saveMemory}
                  disabled={!newMemory.title || !newMemory.description}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Memory
                </button>
              </div>
            </motion.div>
          ) : recording ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-red-500 rounded-full animate-pulse" />
              </motion.div>
              <p className="text-white text-xl font-bold mb-2">RECORDING...</p>
              <div className="max-w-md mx-auto bg-gray-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">{recordingProgress}%</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={startRecording}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 rounded-xl font-bold text-lg mb-6 flex items-center justify-center gap-3"
              >
                <Video className="w-6 h-6" />
                Start Recording Memory
              </button>

              <h3 className="text-white font-bold mb-4">Saved Memories ({memories.length})</h3>
              <div className="space-y-3">
                {memories.map(memory => (
                  <div key={memory.id} className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{memory.title.replace('🎥 ', '')}</h4>
                      <p className="text-gray-400 text-sm">{new Date(memory.created_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingMemory(memory)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMemory(memory.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {memories.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No memories recorded yet</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}