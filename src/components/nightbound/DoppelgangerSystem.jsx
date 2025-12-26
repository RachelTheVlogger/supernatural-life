import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Droplets, Eye, Shield, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BLOODLINES = ['Petrova', 'Salvatore', 'Bennett', 'Lockwood', 'Forbes'];

export default function DoppelgangerSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [searching, setSearching] = useState(false);
  const [selectedDoppelganger, setSelectedDoppelganger] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [acting, setActing] = useState(false);

  const { data: doppelgangers = [] } = useQuery({
    queryKey: ['doppelgangers'],
    queryFn: () => base44.entities.Doppelganger.list()
  });

  const handleSearch = async () => {
    setSearching(true);
    
    setTimeout(async () => {
      const chance = Math.random();
      
      if (chance < 0.3) {
        // Found one!
        const bloodline = BLOODLINES[Math.floor(Math.random() * BLOODLINES.length)];
        const names = ['Elena', 'Katherine', 'Stefan', 'Silas', 'Amara', 'Tom'];
        const name = names[Math.floor(Math.random() * names.length)];
        
        await base44.entities.Doppelganger.create({
          name,
          bloodline,
          is_aware: Math.random() > 0.7,
          location: 'Mystic Falls'
        });

        await base44.entities.NightLog.create({
          entry: `You discovered ${name} - a ${bloodline} doppelganger. Their blood pulses with ancient power.`,
          category: 'observation',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
        setOutcome(`Found ${name}! A ${bloodline} doppelganger. Rare. Powerful. Dangerous.`);
      } else {
        setOutcome('No doppelgangers found. They are incredibly rare.');
      }

      setTimeout(() => {
        setSearching(false);
        setOutcome('');
      }, 3000);
    }, 4000);
  };

  const handleAction = async (action, doppelganger) => {
    setActing(true);
    
    setTimeout(async () => {
      let message = '';
      let humanityChange = 0;
      
      if (action === 'blood') {
        const powerGain = Math.floor(20 + (doppelganger.power_level / 5));
        
        await base44.entities.Doppelganger.update(doppelganger.id, {
          times_bled: doppelganger.times_bled + 1,
          power_level: Math.max(doppelganger.power_level - 10, 20)
        });

        await base44.entities.VampireState.update(vampireState.id, {
          vampire_power_level: Math.min(vampireState.vampire_power_level + powerGain, 100)
        });

        message = `Their blood is PURE POWER. Ancient. Intoxicating. +${powerGain} vampire power. You feel invincible.`;
        humanityChange = -5;
      } else if (action === 'turn') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          is_vampire: true,
          power_level: 150
        });

        message = `You turned the doppelganger. Their vampire form is TERRIFYING. Unnaturally powerful. This changes everything.`;
        humanityChange = -10;
      } else if (action === 'protect') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          protected_by: vampireState.id,
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 30, 100)
        });

        message = `You vowed to protect them. Every supernatural creature will come for them. You against the world.`;
        humanityChange = 5;
      } else if (action === 'reveal') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          is_aware: true,
          relationship_vampire: (doppelganger.relationship_vampire || 0) - 20
        });

        message = `You told them the truth. They're a shadow. A copy. Destined to die for supernatural purposes. They look at you with horror.`;
      }

      if (humanityChange !== 0) {
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: Math.max(0, Math.min(100, vampireState.humanity + humanityChange))
        });
      }

      await base44.entities.NightLog.create({
        entry: message,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome(message);
      
      setTimeout(() => {
        setActing(false);
        setOutcome('');
        setSelectedDoppelganger(null);
      }, 4000);
    }, 2000);
  };

  if (selectedDoppelganger && !outcome && !acting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={() => setSelectedDoppelganger(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
        >
          <button onClick={() => setSelectedDoppelganger(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-2">{selectedDoppelganger.name}</h2>
          <p className="text-purple-400 mb-4">{selectedDoppelganger.bloodline} Bloodline</p>

          <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-white">{selectedDoppelganger.is_vampire ? '🦇 Vampire' : '👤 Human'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Aware:</span>
              <span className="text-white">{selectedDoppelganger.is_aware ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Blood Power:</span>
              <span className="text-red-400">{selectedDoppelganger.power_level}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Times Bled:</span>
              <span className="text-white">{selectedDoppelganger.times_bled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Relationship:</span>
              <span className="text-purple-400">{selectedDoppelganger.relationship_vampire || 0}</span>
            </div>
          </div>

          <div className="space-y-2">
            {!selectedDoppelganger.is_vampire && (
              <>
                <button
                  onClick={() => handleAction('blood', selectedDoppelganger)}
                  className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg py-3 text-red-300"
                >
                  <Droplets className="w-4 h-4 inline mr-2" />
                  Drink Their Blood
                </button>
                <button
                  onClick={() => handleAction('turn', selectedDoppelganger)}
                  className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-purple-300"
                >
                  <Skull className="w-4 h-4 inline mr-2" />
                  Turn Them
                </button>
              </>
            )}
            <button
              onClick={() => handleAction('protect', selectedDoppelganger)}
              className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg py-3 text-blue-300"
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Protect Them
            </button>
            {!selectedDoppelganger.is_aware && (
              <button
                onClick={() => handleAction('reveal', selectedDoppelganger)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-gray-300"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Tell Them The Truth
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={() => !searching && !acting && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {!searching && !acting && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">👥 Doppelgängers</h2>
        <p className="text-gray-400 text-sm mb-6">Supernatural doubles. Ancient bloodlines. Their blood is power.</p>

        {!outcome && (
          <>
            <button
              onClick={handleSearch}
              disabled={searching || acting}
              className="w-full bg-gradient-to-r from-purple-900/60 to-red-900/60 hover:from-purple-900/80 hover:to-red-900/80 border-2 border-purple-500/50 rounded-xl py-3 mb-6 text-white disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search for Doppelgängers'}
            </button>

            {doppelgangers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No doppelgängers found yet.</p>
                <p className="text-gray-500 text-sm mt-2">They are incredibly rare. Keep searching.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doppelgangers.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoppelganger(d)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-bold">{d.name}</h3>
                        <p className="text-purple-400 text-sm">{d.bloodline} Bloodline</p>
                      </div>
                      {d.is_vampire && <span className="text-red-400">🦇</span>}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-gray-400">Power: {d.power_level}%</span>
                      <span className="text-gray-400">Bled: {d.times_bled}x</span>
                      {d.protected_by && <span className="text-blue-400">🛡️ Protected</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {(searching || acting) && !outcome && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400">{searching ? 'Searching for doubles...' : 'Acting...'}</p>
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