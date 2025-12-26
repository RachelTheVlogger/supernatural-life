import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Droplets, Eye, Shield, Skull, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DoppelgangerHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const urlParams = new URLSearchParams(location.search);
  const doppelgangerId = urlParams.get('id');

  const { data: doppelgangers = [] } = useQuery({
    queryKey: ['doppelgangers'],
    queryFn: () => base44.entities.Doppelganger.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampireState = vampireStates[0];
  const doppelganger = doppelgangers.find(d => d.id === doppelgangerId) || doppelgangers[0];

  if (!doppelganger) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 to-black">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No doppelgängers found yet.</p>
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="mt-4 text-purple-400 hover:text-purple-300"
          >
            Search from Vampire Home →
          </button>
        </div>
      </div>
    );
  }

  const handleAction = async (action) => {
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

        if (vampireState) {
          await base44.entities.VampireState.update(vampireState.id, {
            vampire_power_level: Math.min(vampireState.vampire_power_level + powerGain, 100)
          });
        }

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
          protected_by: vampireState?.id,
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
        } else if (action === 'torment') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 15, -100)
        });

        const torments = [
          'You appeared in their dreams. Every night. Their nightmares now have your face.',
          'You killed someone they love. Made them watch. Their screams echo in your mind.',
          'You took their life. Piece by piece. Job. Friends. Hope. Until nothing remained.',
          'You compelled them to hurt themselves. Over and over. Breaking them slowly.',
          'You showed them their future. Death. Suffering. No escape. They wept.'
        ];
        message = torments[Math.floor(Math.random() * torments.length)];
        humanityChange = -8;
        } else if (action === 'stalk') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 5, -100)
        });

        const stalks = [
          'You watched them sleep. Every night. They sense someone watching but see nothing.',
          'You followed them everywhere. Work. Home. Dates. They feel paranoid now.',
          'You left them gifts. Cryptic notes. Photos of them they never knew existed.',
          'You stood outside their window. For hours. Just watching. Breathing.'
        ];
        message = stalks[Math.floor(Math.random() * stalks.length)];
        humanityChange = -3;
        } else if (action === 'save') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 25, 100),
          protected_by: vampireState.id
        });

        const saves = [
          'Hunters came for them. You slaughtered them all. Blood everywhere. They watched you kill for them.',
          'A vampire attacked. You tore them apart. Saved the doppelganger from turning. They owe you their life.',
          'They were dying. Accident. You gave them your blood to heal. Now they know what you are.',
          'A werewolf stalked them. You fought it off. Nearly died. They saw your monster form protecting them.'
        ];
        message = saves[Math.floor(Math.random() * saves.length)];
        humanityChange = 8;
        } else if (action === 'manipulate') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: (doppelganger.relationship_vampire || 0) + 10,
          is_aware: false
        });

        const manipulations = [
          'You compelled them. Made them forget their suspicions. Now they trust you completely.',
          'You orchestrated events. Made yourself their hero. They think you saved them. You created the danger.',
          'You gaslit them. Made them doubt their memories. Now they believe your version of reality.',
          'You isolated them from friends. Family. Now you\'re all they have left.'
        ];
        message = manipulations[Math.floor(Math.random() * manipulations.length)];
        humanityChange = -5;
        }

      if (humanityChange !== 0 && vampireState) {
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
      }, 4000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-black pb-24">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">{doppelganger.name}</h1>
            <p className="text-purple-400 text-lg">{doppelganger.bloodline} Bloodline</p>
            {doppelganger.is_vampire && <p className="text-red-400 mt-2">🦇 Vampire Doppelgänger</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-white font-bold mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Form:</span>
                <span className="text-white">{doppelganger.is_vampire ? '🦇 Vampire' : '👤 Human'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aware of Nature:</span>
                <span className="text-white">{doppelganger.is_aware ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Blood Power:</span>
                <span className="text-red-400">{doppelganger.power_level}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Times Bled:</span>
                <span className="text-white">{doppelganger.times_bled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Relationship:</span>
                <span className="text-purple-400">{doppelganger.relationship_vampire || 0}</span>
              </div>
              {doppelganger.protected_by && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Protection:</span>
                  <span className="text-blue-400">🛡️ Protected</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 max-h-[50vh] overflow-y-auto pr-2"
          >
            {!doppelganger.is_vampire && (
              <>
                <button
                  onClick={() => handleAction('blood')}
                  disabled={acting}
                  className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-500/50 rounded-xl py-4 text-white disabled:opacity-50"
                >
                  <Droplets className="w-5 h-5 inline mr-2" />
                  Drink Their Blood
                </button>
                <button
                  onClick={() => handleAction('turn')}
                  disabled={acting}
                  className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-500/50 rounded-xl py-4 text-white disabled:opacity-50"
                >
                  <Skull className="w-5 h-5 inline mr-2" />
                  Turn Them Into Vampire
                </button>
              </>
            )}
            <button
              onClick={() => handleAction('protect')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 border-2 border-blue-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Protect Them
            </button>
            {!doppelganger.is_aware && (
              <button
                onClick={() => handleAction('reveal')}
                disabled={acting}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-4 text-white disabled:opacity-50"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Tell Them The Truth
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
              <p className="text-gray-300 text-center leading-relaxed">{outcome}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}