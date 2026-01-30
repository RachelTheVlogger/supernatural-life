import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Skull, Zap, Sun } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ANGEL_ACTIONS = [
  { id: 'heal', label: 'Heal the Sick', grace: 5, power: 5, desc: 'Divine mercy' },
  { id: 'protect', label: 'Protect Innocent', grace: 3, power: 8, desc: 'Guardian duty' },
  { id: 'vanquish', label: 'Vanquish Demon', grace: 10, power: 15, desc: 'Holy war' },
  { id: 'bless', label: 'Bless Mortal', grace: 8, power: 6, desc: 'Grant divine favor' },
  { id: 'fall', label: 'Forbidden Action', grace: -20, power: 10, desc: 'Step toward darkness', warning: true },
  { id: 'judge', label: 'Judge the Wicked', grace: 5, power: 12, desc: 'Righteous punishment' }
];

export default function AngelHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: angels = [] } = useQuery({
    queryKey: ['angels'],
    queryFn: () => base44.entities.Angel.list()
  });

  const angel = angels[0];

  const handleAction = async (action) => {
    if (!angel) return;
    setProcessing(true);

    setTimeout(async () => {
      const newGrace = Math.max(0, Math.min(100, (angel.grace || 100) + action.grace));
      const newPower = Math.min(100, (angel.divine_power || 50) + action.power);
      const newFall = angel.fall_progress || 0;

      const updates = {
        grace: newGrace,
        divine_power: newPower
      };

      if (action.id === 'fall') {
        updates.fall_progress = Math.min(100, newFall + 10);
        if (newGrace <= 20) {
          updates.is_fallen = true;
          updates.angel_type = 'fallen';
        }
      }

      if (action.id === 'vanquish') {
        updates.demons_vanquished = (angel.demons_vanquished || 0) + 1;
      }

      await base44.entities.Angel.update(angel.id, updates);

      const outcomes = {
        heal: ['Divine light flowed through you. Their wounds closed. Grace replenished.', 'You touched them. Life returned. This is your purpose.', 'Healing energy poured from your hands. Pure. Holy. Right.'],
        protect: ['Wings manifested. You shielded them from harm. Guardian eternal.', 'Your light drove back darkness. They are safe under your watch.', 'Protection is duty. Duty is love. You will not fail them.'],
        vanquish: ['Holy fire consumed the demon. Screaming. Banished. Justice served.', 'Your blade cut through hellspawn. Righteous fury incarnate.', 'Demon blood evaporated in divine light. Evil purged.'],
        bless: ['You blessed them. Their path brightens. Heaven watches over them now.', 'Divine favor granted. They walk in light. Your gift given.', 'Your blessing shields them from darkness. Protected always.'],
        fall: ['You defied orders. Grace dimmed. The fall begins.', 'Forbidden action taken. Heaven\'s light fading. Darkness calls.', 'You chose free will over duty. The first step downward.'],
        judge: ['Judgment passed. The wicked punished. Justice absolute.', 'Your verdict final. They faced divine wrath. Balance restored.', 'Righteousness demands consequence. You delivered it.']
      };

      setOutcome(outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)]);

      await base44.entities.NightLog.create({
        entry: `${angel.name}: ${outcomes[action.id][0]}`,
        category: 'divine',
        intensity: action.id === 'fall' ? 'extreme' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!angel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-white/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No angel found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-white/5 to-yellow-900/20 p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-blue-100 mb-2">{angel.name}</h1>
        <p className="text-blue-300 text-sm mb-8">
          {angel.is_fallen ? '😈 Fallen Angel' : '😇 ' + angel.angel_type} • {angel.wings_visible ? 'Wings Manifested' : 'Human Form'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/10 border border-blue-400/30 rounded-lg p-4">
            <Sun className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-blue-400 text-xs">Grace</p>
            <p className="text-white text-2xl font-bold">{angel.grace}%</p>
          </div>
          <div className="bg-white/10 border border-yellow-400/30 rounded-lg p-4">
            <Zap className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-yellow-400 text-xs">Divine Power</p>
            <p className="text-white text-2xl font-bold">{angel.divine_power}%</p>
          </div>
          <div className="bg-white/10 border border-red-400/30 rounded-lg p-4">
            <Skull className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-red-400 text-xs">Fall Progress</p>
            <p className="text-white text-2xl font-bold">{angel.fall_progress || 0}%</p>
          </div>
          <div className="bg-white/10 border border-green-400/30 rounded-lg p-4">
            <Heart className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-green-400 text-xs">Saved</p>
            <p className="text-white text-2xl font-bold">{angel.mortals_saved || 0}</p>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 rounded-xl p-8 text-center border border-blue-400/30"
            >
              <p className="text-blue-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          ) : processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-blue-400 mx-auto" />
              </motion.div>
              <p className="text-blue-300 mt-4">Divine will...</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {ANGEL_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action)}
                  className={`w-full ${
                    action.warning 
                      ? 'bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-500/50' 
                      : 'bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 border-2 border-blue-500/50'
                  } rounded-xl py-4 px-6`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-white font-bold">{action.label}</p>
                      <p className="text-blue-300 text-xs">{action.desc}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className={action.grace > 0 ? 'text-blue-400' : 'text-red-400'}>
                        {action.grace > 0 ? '+' : ''}{action.grace} Grace
                      </p>
                      <p className="text-yellow-400">+{action.power} Power</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}