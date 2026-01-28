import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Eye, Zap, Target, Clock, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const NOTE_TEMPLATES = {
  tracking: [
    'Tracked {vampire} to the old district. Subject uses rooftops for transit, avoids main streets. Vulnerable between 3-4 AM.',
    'Followed {vampire} through the warehouse district. They feed on 2-3 victims per week, always alone.',
    'Subject exhibits heightened awareness. Noticed my surveillance at 200m distance. Recommend stealth approach.',
    '{vampire} frequents the downtown area, blends well with crowds. Overconfident in social settings.'
  ],
  weakness: [
    'Identified weakness: Emotional attachments. {vampire} visits the same human repeatedly.',
    '{vampire} shows unusual control, avoids unnecessary violence. Possible conscience to exploit.',
    'Subject hesitates before feeding. There may be humanity left. Could be turned or reasoned with.',
    'Standard vampire weaknesses apply: Avoids churches, running water, sunlight.'
  ],
  strategy: [
    'Best approach: Ambush at nest during dawn. Recommend silver-tipped crossbow, UV grenades.',
    'Set trap using known associate as bait. {vampire} won\'t resist protecting them.',
    'Direct confrontation too risky. Recommend surveillance for another week to find patterns.',
    '{vampire} has accomplices. Need backup for confrontation. Contact Council for support.'
  ],
  observation: [
    '{vampire} feeds exclusively on B+ blood type. Medical waste found near university.',
    'Subject leaves victims alive but memory-wiped. Methodical, not reckless.',
    'Witnessed {vampire} spare a hunter trainee. Motivation unclear - games or mercy?',
    'Physical profile: Fast, strong, disciplined. More dangerous than typical feral vampire.'
  ]
};

const QUICK_TAGS = [
  { id: 'feeding', label: 'Feeding Pattern', icon: '🩸' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'weakness', label: 'Weakness', icon: '⚡' },
  { id: 'behavior', label: 'Behavior', icon: '👁️' },
  { id: 'strategy', label: 'Strategy', icon: '🎯' }
];

export default function HunterHuntLog({ hunter, vampires, notes }) {
  const queryClient = useQueryClient();
  const [selectedVampire, setSelectedVampire] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [adding, setAdding] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const vampireNotes = notes.filter(n => n.hunter_id === hunter.id);

  const handleQuickNote = (category) => {
    if (!selectedVampire) {
      setNoteText('⚠️ Select a vampire target first');
      return;
    }

    const templates = NOTE_TEMPLATES[category] || NOTE_TEMPLATES.observation;
    const template = templates[Math.floor(Math.random() * templates.length)];
    const note = template.replace('{vampire}', selectedVampire.vampire_name);
    
    setNoteText(note);
    setShowTemplates(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedVampire) return;

    setAdding(true);
    try {
      await base44.entities.HunterNote.create({
        hunter_id: hunter.id,
        vampire_id: selectedVampire?.id,
        vampire_name: selectedVampire?.vampire_name,
        content: noteText,
        priority: 'normal'
      });

      setNoteText('');
      setSelectedVampire(null);
      queryClient.invalidateQueries(['hunterNotes']);
      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to add note:', e);
    }
    setAdding(false);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await base44.entities.HunterNote.delete(noteId);
      queryClient.invalidateQueries(['hunterNotes']);
    } catch (e) {
      console.error('Failed to delete note:', e);
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

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Target Vampire</label>
            <select
              value={selectedVampire?.id || ''}
              onChange={(e) => {
                const v = vampires.find(v => v.id === e.target.value);
                setSelectedVampire(v);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <option value="">Select a target...</option>
              {vampires.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vampire_name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Note Templates */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Quick Templates</label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag.id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleQuickNote(tag.id);
                  }}
                  disabled={!selectedVampire}
                  className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors touch-manipulation flex items-center justify-center gap-2"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Hunt Notes</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Track habits, locations, weaknesses, patterns... or use Quick Templates above"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 touch-manipulation"
              rows={6}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            />
          </div>

          <button
            onClick={handleAddNote}
            disabled={!selectedVampire || !noteText.trim() || adding}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Plus className="w-5 h-5" />
            {adding ? 'Saving...' : 'Save Note'}
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
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hunt notes yet.</p>
            <p className="text-gray-600 text-sm">Start tracking your targets above</p>
          </div>
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
                    className="text-gray-400 hover:text-red-400 active:text-red-300 transition-colors p-2 -m-2 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-300 text-sm mb-2 leading-relaxed">{note.content}</p>
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
            Known Targets ({vampires.length})
          </h3>

          <div className="space-y-2">
            {vampires.slice(0, 5).map(v => (
              <div
                key={v.id}
                className="bg-red-950/20 border border-red-500/20 rounded-lg p-3"
              >
                <p className="text-white font-medium">{v.vampire_name}</p>
                <p className="text-gray-400 text-sm">
                  Power: {v.vampire_power_level || 0}% • Exposure: {v.exposure_level || 0}%
                </p>
              </div>
            ))}
            {vampires.length > 5 && (
              <p className="text-gray-500 text-sm text-center py-2">
                +{vampires.length - 5} more targets
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}