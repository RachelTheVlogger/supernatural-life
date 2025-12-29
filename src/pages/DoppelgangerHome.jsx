import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Droplets, Eye, Shield, Skull, Users, Brain, Zap, Heart, Flame, Crown, Ghost } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DoppelgangerMemories from '../components/nightbound/DoppelgangerMemories';
import DoppelgangerEvolution from '../components/nightbound/DoppelgangerEvolution';

export default function DoppelgangerHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showMemories, setShowMemories] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);

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

  React.useEffect(() => {
    if (doppelgangers.length === 0) {
      navigate(createPageUrl('Night'), { replace: true });
    }
  }, [doppelgangers.length, navigate]);

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
      } else if (action === 'bond') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 30, 100)
        });

        const bonds = [
          'You spent time with them. Really talked. Shared stories. They see you as a friend now.',
          'You showed them vulnerability. Your fears. Your pain. They feel connected to you.',
          'You trained together. Practiced abilities. Fighting side by side creates trust.',
          'You opened up about being a vampire. They listened without judgment. Understanding grew.'
        ];
        message = bonds[Math.floor(Math.random() * bonds.length)];
        humanityChange = 5;
      } else if (action === 'test') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          power_level: Math.min((doppelganger.power_level || 100) + 15, 150)
        });

        const tests = [
          'You tested their limits. Pushed them hard. They discovered new strength within.',
          'You made them face danger. They survived. Grew stronger from it.',
          'You challenged their reality. Made them question everything. Their mind expanded.',
          'You forced them to use their doppelgänger nature. They hate it. But they\'re more powerful now.'
        ];
        message = tests[Math.floor(Math.random() * tests.length)];
        humanityChange = -2;
      } else if (action === 'seduce') {
        const intimacy = Math.random();
        const relChange = intimacy > 0.7 ? 40 : intimacy > 0.4 ? 25 : 15;
        
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + relChange, 100)
        });

        const seductions = [
          'You seduced them. Slow. Deliberate. By the end, they were yours completely.',
          'Vampire charm overwhelmed them. They couldn\'t resist. Now they crave your touch.',
          'You made love to them. Supernatural passion. They\'ve never felt anything like it.',
          'You bit them during intimacy. The ecstasy. The danger. They\'re addicted to you now.'
        ];
        message = seductions[Math.floor(Math.random() * seductions.length)];
        humanityChange = -1;
      } else if (action === 'gift') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 20, 100)
        });

        const gifts = [
          'You gave them a gift. Something they\'ve always wanted. Their eyes lit up with joy.',
          'You shared your blood. Not to turn them. Just a taste. Power flowed through them.',
          'You taught them a secret. Vampire knowledge. Ancient wisdom. They\'re grateful.',
          'You introduced them to your world. Other supernaturals. They feel special. Chosen.'
        ];
        message = gifts[Math.floor(Math.random() * gifts.length)];
        humanityChange = 3;
      } else if (action === 'abandon') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 35, -100),
          protected_by: null
        });

        const abandonments = [
          'You left them. No explanation. No goodbye. They waited. You never came back.',
          'You pushed them away. Told them you don\'t care. The hurt in their eyes was real.',
          'You abandoned them to danger. They survived. Barely. They won\'t forget.',
          'You broke every promise. Disappeared from their life. They feel betrayed. Empty.'
        ];
        message = abandonments[Math.floor(Math.random() * abandonments.length)];
        humanityChange = -6;
      } else if (action === 'sacrifice') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 50, 100),
          protected_by: vampireState.id
        });

        const sacrifices = [
          'You sacrificed for them. Took a hunter\'s blade meant for them. Your blood. Their life.',
          'You gave up something precious. For their safety. They saw you bleed for them.',
          'You fought impossible odds. Nearly died. All to protect them. They owe you everything.',
          'You chose them over power. Over safety. They know what that cost you.'
        ];
        message = sacrifices[Math.floor(Math.random() * sacrifices.length)];
        humanityChange = 10;
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

          {/* Special System Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <button
              onClick={() => setShowMemories(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-2 border-purple-400/50 rounded-xl py-4 text-white font-bold"
            >
              <Brain className="w-6 h-6 inline mr-2" />
              Memories
            </button>
            <button
              onClick={() => setShowEvolution(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border-2 border-yellow-400/50 rounded-xl py-4 text-white font-bold"
            >
              <Zap className="w-6 h-6 inline mr-2" />
              Evolution
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"
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
              onClick={() => handleAction('bond')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-950/60 hover:from-blue-900/80 hover:to-cyan-950/80 border-2 border-cyan-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Bond With Them
            </button>
            <button
              onClick={() => handleAction('save')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-900/80 hover:to-green-950/80 border-2 border-green-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Save Them From Danger
            </button>
            <button
              onClick={() => handleAction('sacrifice')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-yellow-900/60 to-yellow-950/60 hover:from-yellow-900/80 hover:to-yellow-950/80 border-2 border-yellow-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Crown className="w-5 h-5 inline mr-2" />
              Sacrifice For Them
            </button>
            <button
              onClick={() => handleAction('gift')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-pink-900/60 to-pink-950/60 hover:from-pink-900/80 hover:to-pink-950/80 border-2 border-pink-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Give Them A Gift
            </button>
            <button
              onClick={() => handleAction('protect')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 border-2 border-blue-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Vow Protection
            </button>
            <button
              onClick={() => handleAction('seduce')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-rose-900/60 to-pink-950/60 hover:from-rose-900/80 hover:to-pink-950/80 border-2 border-rose-500/50 rounded-xl py-4 text-rose-300 disabled:opacity-50"
            >
              <Flame className="w-5 h-5 inline mr-2" />
              Seduce Them
            </button>
            <button
              onClick={() => handleAction('test')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-orange-900/60 to-orange-950/60 hover:from-orange-900/80 hover:to-orange-950/80 border-2 border-orange-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Test Their Limits
            </button>
            <button
              onClick={() => handleAction('stalk')}
              disabled={acting}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Stalk Them
            </button>
            <button
              onClick={() => handleAction('abandon')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-gray-900/60 to-gray-950/60 hover:from-gray-900/80 hover:to-gray-950/80 border-2 border-gray-600/40 rounded-xl py-4 text-gray-400 disabled:opacity-50"
            >
              <Ghost className="w-5 h-5 inline mr-2" />
              Abandon Them
            </button>
            <button
              onClick={() => handleAction('torment')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-red-950/60 to-red-950/80 hover:from-red-950/80 hover:to-red-950/100 border-2 border-red-600/40 rounded-xl py-4 text-red-400 disabled:opacity-50"
            >
              <Skull className="w-5 h-5 inline mr-2" />
              Torment Them
            </button>
            <button
              onClick={() => handleAction('manipulate')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-purple-950/60 to-purple-950/80 hover:from-purple-950/80 hover:to-purple-950/100 border-2 border-purple-600/40 rounded-xl py-4 text-purple-400 disabled:opacity-50"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Manipulate Them
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

        {showMemories && (
          <DoppelgangerMemories
            doppelganger={doppelganger}
            vampireState={vampireState}
            onClose={() => setShowMemories(false)}
          />
        )}

        {showEvolution && (
          <DoppelgangerEvolution
            doppelganger={doppelganger}
            vampireState={vampireState}
            onClose={() => setShowEvolution(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}