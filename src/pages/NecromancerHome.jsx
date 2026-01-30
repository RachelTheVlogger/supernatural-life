import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Users, Zap, BookOpen, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NECRO_ACTIONS = [
  { id: 'raise', label: 'Raise Dead', minions: 1, magic: 5, desc: 'Animate a corpse' },
  { id: 'soul', label: 'Drain Soul', magic: 10, life: -5, desc: 'Steal life force' },
  { id: 'command', label: 'Command Undead', magic: 3, desc: 'Direct your army' },
  { id: 'ritual', label: 'Death Ritual', magic: 15, life: -10, desc: 'Powerful necromancy' },
  { id: 'lich', label: 'Become Lich', magic: 20, life: -100, desc: 'Transform into undead immortal', warning: true },
  { id: 'research', label: 'Study Dark Arts', magic: 8, desc: 'Expand knowledge' }
];

const UNDEAD_TYPES = ['zombie', 'skeleton', 'ghoul', 'wight', 'death_knight'];

export default function NecromancerHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showArmy, setShowArmy] = useState(false);

  const { data: necromancers = [] } = useQuery({
    queryKey: ['necromancers'],
    queryFn: () => base44.entities.Necromancer.list()
  });

  const { data: minions = [] } = useQuery({
    queryKey: ['undeadMinions'],
    queryFn: () => base44.entities.UndeadMinion.list()
  });

  const necromancer = necromancers[0];
  const myMinions = minions.filter(m => m.master_id === necromancer?.id);

  const handleAction = async (action) => {
    if (!necromancer) return;
    setProcessing(true);

    setTimeout(async () => {
      const newMagic = Math.min(100, (necromancer.death_magic_level || 30) + action.magic);
      const newLife = Math.max(0, (necromancer.life_force || 100) + (action.life || 0));

      const updates = {
        death_magic_level: newMagic,
        life_force: newLife,
        undead_army_size: myMinions.length + (action.minions || 0)
      };

      if (action.id === 'lich' && newLife === 0) {
        updates.is_lich = true;
        updates.life_force = 0;
      }

      await base44.entities.Necromancer.update(necromancer.id, updates);

      if (action.id === 'raise') {
        const names = ['Corpse Walker', 'Death Servant', 'Bone Guard', 'Rotting Minion'];
        await base44.entities.UndeadMinion.create({
          name: names[Math.floor(Math.random() * names.length)],
          master_id: necromancer.id,
          undead_type: UNDEAD_TYPES[Math.floor(Math.random() * UNDEAD_TYPES.length)],
          combat_power: 20 + Math.floor(Math.random() * 30)
        });
      }

      const outcomes = {
        raise: ['Dead flesh obeyed. It rose. Your servant eternal.', 'Life sparked in cold corpse. Animation achieved. Army grows.', 'The dead walked at your command. Necromancy perfected.'],
        soul: ['Their soul screamed as you pulled it free. Power surged.', 'Life force drained. They aged decades in seconds. You grew stronger.', 'Soul extracted. Their essence now yours. Death magic feeds.'],
        command: ['Your army moved as one. Perfect obedience. Death\'s legion.', 'Undead responded instantly. Your will absolute over death.', 'Commands echoed through corpses. They march. They obey.'],
        ritual: ['Dark power flooded you. The ritual complete. Death bows to you.', 'Forbidden magic unleashed. Reality shuddered. You transcend.', 'The ritual succeeded. Ancient power yours. Taboos broken.'],
        lich: ['Your heart stopped. Phylactery glowed. You died. You live. Undead immortal.', 'Transformation complete. No pulse. No breath. Eternal existence.', 'You are lich. Death cannot claim you. Victory over mortality.'],
        research: ['Ancient texts revealed secrets. Knowledge of death expanded.', 'You learned forbidden spells. Power through understanding.', 'Death\'s mysteries unraveled. Your mastery grows.']
      };

      setOutcome(outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)]);

      await base44.entities.NightLog.create({
        entry: `${necromancer.name}: ${outcomes[action.id][0]}`,
        category: 'necromancy',
        intensity: action.id === 'lich' ? 'extreme' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!necromancer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No necromancer found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-gray-900 p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-purple-100 mb-2">{necromancer.name}</h1>
        <p className="text-purple-300 text-sm mb-8">
          💀 Necromancer • {necromancer.is_lich ? 'Lich (Immortal)' : 'Living'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
            <Zap className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-purple-400 text-xs">Death Magic</p>
            <p className="text-white text-2xl font-bold">{necromancer.death_magic_level}%</p>
          </div>
          <button
            onClick={() => setShowArmy(true)}
            className="bg-black/40 border border-green-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
          >
            <Users className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-green-400 text-xs">Undead Army</p>
            <p className="text-white text-2xl font-bold">{myMinions.length}</p>
          </button>
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
            <Skull className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-red-400 text-xs">Souls Bound</p>
            <p className="text-white text-2xl font-bold">{necromancer.souls_bound || 0}</p>
          </div>
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4">
            <Heart className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-blue-400 text-xs">Life Force</p>
            <p className="text-white text-2xl font-bold">{necromancer.life_force}%</p>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 rounded-xl p-8 text-center border border-purple-500/30"
            >
              <p className="text-purple-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          ) : processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Skull className="w-12 h-12 text-purple-400 mx-auto" />
              </motion.div>
              <p className="text-purple-300 mt-4">Channeling death magic...</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {NECRO_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action)}
                  className={`w-full ${
                    action.warning
                      ? 'bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-500/50'
                      : 'bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-500/50'
                  } rounded-xl py-4 px-6`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-white font-bold">{action.label}</p>
                      <p className="text-purple-300 text-xs">{action.desc}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-purple-400">+{action.magic} Magic</p>
                      {action.life && <p className="text-red-400">{action.life} Life</p>}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Undead Army Modal */}
      {showArmy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setShowArmy(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Undead Army</h3>
              <button onClick={() => setShowArmy(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {myMinions.map(minion => (
                <div key={minion.id} className="bg-gray-800 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-white font-bold">{minion.name}</p>
                      <p className="text-gray-400 text-sm capitalize">{minion.undead_type.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 text-sm">⚔️ Power: {minion.combat_power}</p>
                      <p className="text-purple-400 text-sm">🗡️ Kills: {minion.kills || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
              {myMinions.length === 0 && (
                <p className="text-gray-500 text-center py-8">No minions yet. Raise the dead.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}