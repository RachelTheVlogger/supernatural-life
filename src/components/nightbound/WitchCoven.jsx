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

  const { data: covenMembers = [] } = useQuery({
    queryKey: ['covenMembers', witch.id],
    queryFn: async () => {
      const members = await base44.entities.CovenMember.filter({ coven_leader_id: witch.id });
      return members;
    }
  });

  const handleRecruit = async () => {
    setRecruiting(true);
    
    setTimeout(async () => {
      const name = WITCH_NAMES[Math.floor(Math.random() * WITCH_NAMES.length)];
      const specialties = ['elemental', 'psychic', 'necromancy', 'protection', 'divination', 'dark_magic'];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      await base44.entities.CovenMember.create({
        name,
        coven_leader_id: witch.id,
        specialty,
        power_level: Math.floor(Math.random() * 30) + 40,
        loyalty: Math.floor(Math.random() * 40) + 30
      });

      await base44.entities.NightLog.create({
        entry: `${name} joined your coven. A new ${specialty} witch.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`${name} joined your coven as a ${specialty} specialist.`);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setRecruiting(false);
        setOutcome('');
      }, 3000);
    }, 3000);
  };

  const handleRitual = async () => {
    if (covenMembers.length === 0) {
      alert('Need coven members to perform group ritual');
      return;
    }

    setRecruiting(true);
    
    setTimeout(async () => {
      const powerGain = covenMembers.length * 10 + Math.floor(Math.random() * 20);
      
      await base44.entities.Witch.update(witch.id, {
        power_level: witch.power_level + powerGain
      });

      await base44.entities.NightLog.create({
        entry: `Coven ritual performed. ${covenMembers.length} witches channeling together. Power surged.`,
        category: 'power',
        intensity: 'significant'
      });

      setOutcome(`Coven ritual complete! +${powerGain} power from ${covenMembers.length} witches.`);
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
        <p className="text-gray-400 text-sm mb-6">{covenMembers.length} witches in your circle</p>

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
                disabled={recruiting || covenMembers.length === 0}
                className="bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg py-3 text-pink-300 disabled:opacity-50"
              >
                Coven Ritual
              </button>
            </div>

            {covenMembers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No coven members yet. Recruit your first witch.</p>
            ) : (
              <div className="space-y-3">
                {covenMembers.map(member => (
                  <div key={member.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-bold">{member.name}</h3>
                        <p className="text-purple-400 text-sm capitalize">{member.specialty} witch</p>
                      </div>
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Power</p>
                        <p className="text-white font-bold">{member.power_level}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Loyalty</p>
                        <p className="text-white font-bold">{member.loyalty}%</p>
                      </div>
                    </div>
                  </div>
                ))}
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