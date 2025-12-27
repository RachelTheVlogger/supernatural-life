import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const SPECIAL_TYPES = [
  { id: 'omake', label: 'Omake (Bonus)', desc: 'Fun bonus chapter', icon: '🎁', fans: 200 },
  { id: 'spinoff', label: 'Spin-off', desc: 'Side story', icon: '🌟', fans: 400 },
  { id: 'holiday', label: 'Holiday Special', desc: 'Seasonal chapter', icon: '🎄', fans: 300 },
  { id: 'beach', label: 'Beach Episode', desc: 'Classic beach chapter', icon: '🏖️', fans: 350 },
  { id: 'backstory', label: 'Character Backstory', desc: 'Origin story', icon: '📜', fans: 280 }
];

export default function MangaSpecials({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle] = useState('');

  const handleCreateSpecial = async () => {
    if (!selectedType || !title.trim()) return;
    setCreating(true);

    const specials = career.special_editions || [];
    specials.push({
      id: Date.now().toString(),
      type: selectedType.id,
      title: title,
      fans_gained: selectedType.fans,
      date: new Date().toISOString()
    });

    await base44.entities.ServantCareer.update(career.id, {
      special_editions: specials,
      fans: (career.fans || 0) + selectedType.fans
    });

    await base44.entities.NightLog.create({
      entry: `${entityName} released "${title}" special edition! +${selectedType.fans} fans!`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries(['career']);
    setCreating(false);
    setTitle('');
    setSelectedType(null);
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
          <h3 className="text-white text-2xl font-bold">Special Editions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3">Create Special</h4>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SPECIAL_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg p-3 text-left transition-colors ${
                  selectedType?.id === type.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs opacity-80">{type.desc}</div>
                <div className="text-xs text-green-400 mt-1">+{type.fans} fans</div>
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Special title..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-3"
          />

          <button
            onClick={handleCreateSpecial}
            disabled={!selectedType || !title.trim() || creating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Release Special Edition'}
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-medium">Released Specials</h4>
          {(career?.special_editions || []).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No specials yet</p>
          ) : (
            [...(career.special_editions || [])].reverse().map(special => (
              <div key={special.id} className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border border-purple-500/30 rounded-lg p-3">
                <div className="flex justify-between">
                  <div>
                    <h5 className="text-white font-medium">{SPECIAL_TYPES.find(t => t.id === special.type)?.icon} {special.title}</h5>
                    <p className="text-gray-400 text-sm capitalize">{special.type}</p>
                  </div>
                  <p className="text-purple-400 text-sm">+{special.fans_gained} fans</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}