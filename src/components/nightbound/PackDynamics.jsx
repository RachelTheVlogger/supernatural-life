import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Heart, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const WOLF_NAMES = ['Luna', 'Fenrir', 'Grey', 'Shadow', 'Storm', 'Ash', 'Raven', 'Blaze', 'Frost', 'Thunder'];

export default function PackDynamics({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: packMembers = [] } = useQuery({
    queryKey: ['packMembers', werewolf.id],
    queryFn: async () => {
      return await base44.entities.Werewolf.filter({ pack_leader_id: werewolf.id });
    }
  });

  const handleAddMember = async () => {
    setActing(true);
    
    setTimeout(async () => {
      const name = WOLF_NAMES[Math.floor(Math.random() * WOLF_NAMES.length)];
      const genders = ['male', 'female'];
      const ranks = ['beta', 'omega'];
      
      await base44.entities.Werewolf.create({
        name,
        pack_leader_id: werewolf.id,
        gender: genders[Math.floor(Math.random() * genders.length)],
        pack_rank: ranks[Math.floor(Math.random() * ranks.length)],
        loyalty: Math.floor(Math.random() * 40) + 40,
        strength: Math.floor(Math.random() * 30) + 30
      });

      await base44.entities.PlayerWerewolf.update(werewolf.id, {
        pack_members: (werewolf.pack_members || 0) + 1
      });

      await base44.entities.NightLog.create({
        entry: `${name} joined the pack. They bow to you as Alpha.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`${name} joined your pack!`);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setActing(false);
        setOutcome('');
      }, 3000);
    }, 3000);
  };

  const handleHunt = async () => {
    if (packMembers.length === 0) {
      alert('Need pack members to hunt together');
      return;
    }

    setActing(true);
    
    setTimeout(async () => {
      const kills = packMembers.length + Math.floor(Math.random() * 3);
      
      await base44.entities.PlayerWerewolf.update(werewolf.id, {
        kills: (werewolf.kills || 0) + kills,
        wolf_strength: Math.min(100, (werewolf.wolf_strength || 0) + 5)
      });

      await base44.entities.NightLog.create({
        entry: `Pack hunt successful. ${packMembers.length} wolves. ${kills} kills. Blood and moonlight.`,
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome(`Pack brought down ${kills} prey! Strength +5`);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setActing(false);
        setOutcome('');
      }, 3000);
    }, 4000);
  };

  const handleChooseMate = async (member) => {
    setActing(true);
    
    setTimeout(async () => {
      await base44.entities.Werewolf.update(member.id, {
        is_mate: true,
        loyalty: 100
      });

      await base44.entities.PlayerWerewolf.update(werewolf.id, {
        has_mate: true,
        mate_id: member.id
      });

      await base44.entities.NightLog.create({
        entry: `${member.name} became your mate. The bond is primal. Eternal.`,
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome(`${member.name} is now your mate. Bonded for life.`);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setActing(false);
        setOutcome('');
      }, 3500);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={() => !acting && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {!acting && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">🐺 Your Pack</h2>
        <p className="text-gray-400 text-sm mb-6">{packMembers.length} wolves follow you as Alpha</p>

        {!outcome && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleAddMember}
                disabled={acting}
                className="bg-orange-900/40 hover:bg-orange-900/60 border border-orange-500/30 rounded-lg py-3 text-orange-300 disabled:opacity-50"
              >
                Recruit Wolf
              </button>
              <button
                onClick={handleHunt}
                disabled={acting || packMembers.length === 0}
                className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg py-3 text-red-300 disabled:opacity-50"
              >
                Pack Hunt
              </button>
            </div>

            {packMembers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Lone wolf. Recruit members to build your pack.</p>
            ) : (
              <div className="space-y-3">
                {packMembers.map(member => (
                  <div key={member.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{member.name}</h3>
                          {member.is_mate && <Heart className="w-4 h-4 text-red-400" />}
                        </div>
                        <p className="text-orange-400 text-sm capitalize">{member.pack_rank} • {member.gender}</p>
                      </div>
                      <Zap className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div>
                        <p className="text-gray-500">Strength</p>
                        <p className="text-white font-bold">{member.strength}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Loyalty</p>
                        <p className="text-white font-bold">{member.loyalty}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Kills</p>
                        <p className="text-white font-bold">{member.kills || 0}</p>
                      </div>
                    </div>
                    {!werewolf.has_mate && !member.is_mate && member.loyalty >= 70 && (
                      <button
                        onClick={() => handleChooseMate(member)}
                        className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg py-2 text-pink-300 text-sm"
                      >
                        Choose as Mate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {acting && !outcome && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <p className="text-gray-400">Pack moves...</p>
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