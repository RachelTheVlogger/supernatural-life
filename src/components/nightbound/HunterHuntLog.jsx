import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Eye, Edit2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function HunterHuntLog({ hunter, vampires, notes }) {
  const queryClient = useQueryClient();
  const [selectedVampire, setSelectedVampire] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [adding, setAdding] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const vampireNotes = notes.filter(n => n.hunter_id === hunter.id);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      await base44.entities.HunterNote.create({
        hunter_id: hunter.id,
        vampire_id: selectedVampire?.id,
        vampire_name: selectedVampire?.vampire_name,
        content: noteText,
        created_date: new Date().toISOString(),
        priority: 'normal'
      });

      setNoteText('');
      setSelectedVampire(null);
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to add note:', e);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await base44.entities.HunterNote.delete(noteId);
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to delete note:', e);
    }
  };

  const handleGenerateAINotes = async () => {
    if (!selectedVampire) {
      setNoteText('⚠️ Please select a vampire target first');
      return;
    }
    
    setGeneratingAI(true);
    setNoteText('Generating hunt notes...');
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${hunter.name}, a ${hunter.specialty} vampire hunter. Generate detailed hunt notes about the vampire "${selectedVampire.vampire_name}". Include observations, weaknesses, sightings, and strategies. Write in first person as the hunter. Keep it under 200 words.`
      });
      
      // Handle various response formats
      let noteContent = '';
      if (typeof result === 'string') {
        noteContent = result;
      } else if (result && typeof result === 'object') {
        noteContent = result.response || result.text || result.content || result.output || JSON.stringify(result);
      } else {
        noteContent = 'Unable to generate notes. Please try again.';
      }
      
      setNoteText(noteContent);
    } catch (e) {
      console.error('Failed to generate notes:', e);
      setNoteText('❌ Failed to generate AI notes. Please try manual entry.');
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 border border-blue-500/30 rounded-2xl p-6"
      >
        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Create Hunt Note
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Target Vampire</label>
            <select
              value={selectedVampire?.id || ''}
              onChange={(e) => {
                const v = vampires.find(v => v.id === e.target.value);
                setSelectedVampire(v);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select a target...</option>
              {vampires.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vampire_name} - Exposure: {v.exposure_level || 0}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Hunt Notes</label>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGenerateAINotes();
              }}
              disabled={generatingAI || !selectedVampire}
              className="mb-2 w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {generatingAI ? '⏳ Generating...' : '✨ AI Generate Notes'}
            </button>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Track habits, locations, weaknesses, patterns..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 touch-manipulation"
              rows={6}
            />
          </div>

          <button
            onClick={handleAddNote}
            disabled={!selectedVampire || !noteText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Save Note
          </button>
        </div>
      </motion.div>

      {/* Hunt Notes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-black/40 border border-gray-700/50 rounded-2xl p-6"
      >
        <h3 className="text-white text-lg font-bold mb-4">Hunt Progress ({vampireNotes.length})</h3>

        {vampireNotes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hunt notes yet. Start tracking your targets.</p>
        ) : (
          <div className="space-y-3">
            {vampireNotes.map(note => (
              <div
                key={note.id}
                className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">{note.vampire_name}</h4>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-300 text-sm mb-2">{note.content}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(note.created_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Active Targets Summary */}
      {vampires.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 border border-red-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Known Targets
          </h3>

          <div className="space-y-2">
            {vampires.slice(0, 5).map(v => (
              <div
                key={v.id}
                className="bg-red-950/20 border border-red-500/20 rounded-lg p-3 flex items-start justify-between"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{v.vampire_name}</p>
                  <p className="text-gray-400 text-sm capitalize">
                    Power: {v.vampire_power_level}% • Exposure: {v.exposure_level || 0}%
                  </p>
                </div>
                <span className="text-xs bg-red-900/60 text-red-300 px-2 py-1 rounded">
                  {v.moral_path || 'unknown'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}