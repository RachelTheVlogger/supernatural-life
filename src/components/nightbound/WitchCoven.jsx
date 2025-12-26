import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const WITCH_NAMES = ['Morgana', 'Elara', 'Seraphina', 'Luna', 'Raven', 'Willow', 'Sage', 'Nova', 'Eclipse', 'Aurora'];

export default function WitchCoven({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [recruiting, setRecruiting] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: currentWitch, refetch } = useQuery({
    queryKey: ['witch-coven-data', witch.id],
    queryFn: async () => {
      const witches = await base44.entities.Witch.list();
      return witches.find(w => w.id === witch.id) || witch;
    },
    initialData: witch,
    staleTime: 0
  });

  const handleRecruit = async () => {
    setRecruiting(true);
    
    setTimeout(async () => {
      const name = WITCH_NAMES[Math.floor(Math.random() * WITCH_NAMES.length)];
      const specialties = ['elemental', 'psychic', 'necromancy', 'protection', 'divination', 'dark_magic'];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      await base44.entities.Witch.update(witch.id, {
        coven_size: (currentWitch.coven_size || 0) + 1
      });

      await base44.entities.NightLog.create({
        entry: `${name} joined your coven. A new ${specialty} witch.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      await queryClient.invalidateQueries(['witches']);
      await queryClient.invalidateQueries(['witch-coven-data', witch.id]);
      await refetch();

      setOutcome(`${name} joined your coven as a ${specialty} specialist.`);
      
      setTimeout(() => {
        setRecruiting(false);
        setOutcome('');
      }, 2000);
    }, 3000);
  };

  const handleRitual = async () => {
    const covenSize = currentWitch.coven_size || 0;
    if (covenSize === 0) {
      alert('Need coven members to perform group ritual');
      return;
    }

    setRecruiting(true);
    
    setTimeout(async () => {
      const powerGain = covenSize * 10 + Math.floor(Math.random() * 20);
      
      await base44.entities.Witch.update(witch.id, {
        power_level: currentWitch.power_level + powerGain
      });

      await base44.entities.NightLog.create({
        entry: `Coven ritual performed. ${covenSize} witches channeling together. Power surged.`,
        category: 'power',
        intensity: 'significant'
      });

      setOutcome(`Coven ritual complete! +${powerGain} power from ${covenSize} witches.`);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setRecruiting(false);
        setOutcome('');
      }, 3000);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={() => !recruiting && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {!recruiting && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">🔮 Your Coven</h2>
        <p className="text-gray-400 text-sm mb-6">{currentWitch.coven_size || 0} witches in your circle</p>

        {!outcome && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleRecruit}
                disabled={recruiting}
                className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-purple-300 disabled:opacity-50"
              >
                Recruit Witch
              </button>
              <button
                onClick={handleRitual}
                disabled={recruiting || (currentWitch.coven_size || 0) === 0}
                className="bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg py-3 text-pink-300 disabled:opacity-50"
              >
                Coven Ritual
              </button>
            </div>

            {(currentWitch.coven_size || 0) === 0 ? (
              <p className="text-gray-400 text-center py-8">No coven members yet. Recruit your first witch.</p>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-white text-lg font-bold mb-1">{currentWitch.coven_size} Witches</p>
                <p className="text-gray-400 text-sm">Your coven grows in power and influence</p>
              </div>
            )}
          </>
        )}

        {recruiting && !outcome && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400">Channeling magic...</p>
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="py-8">
            <p className="text-gray-300 text-center leading-relaxed">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}