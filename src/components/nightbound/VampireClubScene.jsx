import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crown, Droplets, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function VampireClubScene({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [visiting, setVisiting] = useState(null);

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const existing = await base44.entities.VampireClub.list();
      if (existing.length === 0) {
        // Create default clubs
        const defaultClubs = [
          { club_name: 'The Crimson Rose', location: 'Downtown', club_type: 'blood_bar', owner_name: 'Viktor', reputation: 0 },
          { club_name: 'Midnight Masquerade', location: 'Old Quarter', club_type: 'dance_club', owner_name: 'Lilith', reputation: 0 },
          { club_name: 'The Feeding Den', location: 'Underground', club_type: 'feeding_den', owner_name: 'Marcus', reputation: 0 }
        ];
        
        for (const club of defaultClubs) {
          await base44.entities.VampireClub.create(club);
        }
        
        return await base44.entities.VampireClub.list();
      }
      return existing;
    }
  });

  const handleVisit = async (club) => {
    setVisiting(club.id);
    
    setTimeout(async () => {
      const activities = [
        { name: 'Feed from willing donors', rep: 5, log: `Fed at ${club.club_name}. No mess. Professional.` },
        { name: 'Dance with other vampires', rep: 3, log: `Danced at ${club.club_name}. Made connections.` },
        { name: 'Network with elders', rep: 10, log: `Met vampire elders at ${club.club_name}. Respect earned.` },
        { name: 'Start a fight', rep: -15, log: `Started trouble at ${club.club_name}. Reputation damaged.` }
      ];
      
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const newRep = Math.max(0, Math.min(100, club.reputation + activity.rep));
      
      await base44.entities.VampireClub.update(club.id, {
        reputation: newRep,
        times_visited: club.times_visited + 1,
        vip_access: newRep >= 75
      });
      
      await base44.entities.NightLog.create({
        entry: activity.log,
        category: 'interaction',
        intensity: activity.rep < 0 ? 'significant' : 'subtle'
      });
      
      queryClient.invalidateQueries();
      setVisiting(null);
    }, 2500);
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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🍷 Vampire Nightlife</h2>
        <p className="text-gray-400 text-sm mb-6">Underground clubs where vampires gather</p>

        <div className="space-y-3">
          {clubs.map(club => (
            <div key={club.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-white font-bold">{club.club_name}</h3>
                  <p className="text-gray-400 text-sm capitalize">{club.club_type.replace('_', ' ')} • {club.location}</p>
                  <p className="text-gray-500 text-xs">Run by {club.owner_name}</p>
                  {club.vip_access && <p className="text-purple-400 text-xs mt-1">👑 VIP Access</p>}
                </div>
                <div className="text-right">
                  <p className="text-purple-400 text-sm">Rep: {club.reputation}/100</p>
                  <p className="text-gray-500 text-xs">Visits: {club.times_visited}</p>
                </div>
              </div>

              {club.banned ? (
                <div className="bg-red-900/30 rounded-lg p-2 text-center">
                  <p className="text-red-400 text-sm">🚫 Banned from this establishment</p>
                </div>
              ) : (
                <button
                  onClick={() => handleVisit(club)}
                  disabled={visiting}
                  className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 rounded-lg py-2 transition-colors disabled:opacity-50"
                >
                  {visiting === club.id ? 'At the club...' : 'Visit Club'}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}