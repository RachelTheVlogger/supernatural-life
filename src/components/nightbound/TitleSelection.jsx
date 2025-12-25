import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crown, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function TitleSelection({ vampireState, servant, onClose }) {
  const isFemale = vampireState.gender === 'female';
  
  const PRESET_TITLES = isFemale ? [
    { value: 'Mistress', label: 'Mistress' },
    { value: 'Mommy', label: 'Mommy' },
    { value: 'Lady', label: 'Lady' },
    { value: 'My Lady', label: 'My Lady' },
    { value: 'Owner', label: 'Owner' },
    { value: 'Queen', label: 'Queen' },
    { value: 'Goddess', label: 'Goddess' },
    { value: 'Boss', label: 'Boss' }
  ] : [
    { value: 'Sir', label: 'Sir' },
    { value: 'Master', label: 'Master' },
    { value: 'Daddy', label: 'Daddy' },
    { value: 'Lord', label: 'Lord' },
    { value: 'My Lord', label: 'My Lord' },
    { value: 'Owner', label: 'Owner' },
    { value: 'King', label: 'King' },
    { value: 'Boss', label: 'Boss' }
  ];
  const [customTitle, setCustomTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const currentTitle = vampireState.preferred_title || null;

  const handleSetTitle = async (title) => {
    setSaving(true);
    
    await base44.entities.VampireState.update(vampireState.id, {
      preferred_title: title
    });

    await base44.entities.NightLog.create({
      entry: `${servant.name} will now call you "${title}". The power dynamic shifts.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries(['vampireState']);
    queryClient.invalidateQueries(['logs']);
    
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Choose Your Title</h2>
        </div>

        {currentTitle && (
          <div className="mb-4 p-3 bg-purple-950/30 border border-purple-800/50 rounded-lg">
            <p className="text-purple-300 text-sm">
              Currently: <span className="font-bold">{currentTitle}</span>
            </p>
          </div>
        )}

        <p className="text-gray-400 text-sm mb-6">
          How should {servant.name} address you?
        </p>

        {saving ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              Setting...
            </motion.p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {PRESET_TITLES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleSetTitle(value)}
                  className={`p-3 rounded-xl transition-all border-2 ${
                    currentTitle === value
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{label}</span>
                    {currentTitle === value && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Custom Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter custom title..."
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none border-2 border-gray-700 focus:border-purple-500 transition-colors"
                  maxLength={20}
                />
              </div>
              
              <button
                onClick={() => customTitle.trim() && handleSetTitle(customTitle.trim())}
                disabled={!customTitle.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-xl py-3 transition-colors disabled:opacity-50"
              >
                Set Custom Title
              </button>

              {currentTitle && (
                <button
                  onClick={() => handleSetTitle(null)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl py-2 transition-colors text-sm"
                >
                  Remove Title
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}