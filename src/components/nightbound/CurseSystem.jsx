import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CURSES = [
  { name: 'Pain Curse', icon: '⚡', cost: 30, description: 'Inflict constant pain', duration: '1 week' },
  { name: 'Bad Luck', icon: '🍀', cost: 25, description: 'Everything goes wrong', duration: '2 weeks' },
  { name: 'Nightmares', icon: '😱', cost: 20, description: 'Haunted by terrible dreams', duration: '1 week' },
  { name: 'Illness', icon: '🤢', cost: 35, description: 'Unexplained sickness', duration: '2 weeks' },
  { name: 'Paranoia', icon: '👁️', cost: 28, description: 'Everyone seems against them', duration: '1 week' }
];

export default function CurseSystem({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCurse, setSelectedCurse] = useState(null);
  const [target, setTarget] = useState(null);
  const [casting, setCasting] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: npcs = [] } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const handleCurse = async () => {
    if (!witch || witch.power_level < selectedCurse.cost) {
      alert(`Need ${selectedCurse.cost} power!`);
      return;
    }

    setCasting(true);

    setTimeout(async () => {
      await base44.entities.Witch.update(witch.id, {
        power_level: witch.power_level - selectedCurse.cost
      });

      const outcomeText = `Cursed ${target.name} with ${selectedCurse.name}. ${selectedCurse.description}.`;
      setOutcome(outcomeText);

      await base44.entities.NightLog.create({
        entry: `${witch.name} cursed ${target.name}. ${selectedCurse.description}.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setCasting(false);
        setOutcome('');
        setSelectedCurse(null);
        setTarget(null);
      }, 3000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">💀 Curse Someone</h2>
        <p className="text-gray-400 text-sm mb-6">Dark magic with consequences</p>

        {!selectedCurse && !casting && !outcome && (
          <div className="space-y-3">
            <p className="text-red-400 text-sm mb-4">Choose a curse:</p>
            {CURSES.map(curse => (
              <button
                key={curse.name}
                onClick={() => setSelectedCurse(curse)}
                disabled={witch.power_level < curse.cost}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{curse.icon}</span>
                  <div>
                    <h3 className="text-white font-medium">{curse.name}</h3>
                    <p className="text-gray-400 text-xs">{curse.description}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-400">Cost: {curse.cost} power</span>
                  <span className="text-red-400">Duration: {curse.duration}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedCurse && !target && !casting && !outcome && (
          <div>
            <button
              onClick={() => setSelectedCurse(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>
            <p className="text-red-400 text-sm mb-4">Choose target for {selectedCurse.name}:</p>
            <div className="space-y-2">
              {npcs.map(npc => (
                <button
                  key={npc.id}
                  onClick={() => setTarget(npc)}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 text-left"
                >
                  <h3 className="text-white font-medium">{npc.name}</h3>
                  <p className="text-gray-400 text-xs capitalize">{npc.personality}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {target && !casting && !outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-red-500/30">
            <div className="text-center mb-4">
              <span className="text-6xl">{selectedCurse.icon}</span>
              <h3 className="text-white text-xl font-bold mt-2">Curse {target.name}</h3>
              <p className="text-red-400 text-sm mt-1">{selectedCurse.name}</p>
            </div>

            <div className="bg-red-900/30 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm">{selectedCurse.description}</p>
              <p className="text-red-400 text-xs mt-2">Duration: {selectedCurse.duration}</p>
              <p className="text-purple-400 text-xs">Cost: {selectedCurse.cost} power</p>
            </div>

            <button
              onClick={handleCurse}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
            >
              Cast Curse
            </button>
          </div>
        )}

        {casting && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mx-auto mb-4"
            >
              💀
            </motion.div>
            <p className="text-red-400">Casting dark magic...</p>
          </div>
        )}

        {outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-red-500/30 text-center">
            <p className="text-white">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}