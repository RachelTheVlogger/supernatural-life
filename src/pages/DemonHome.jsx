import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Skull, FileText, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const DEMON_ACTIONS = [
  { id: 'tempt', label: 'Tempt Mortal', souls: 1, corruption: 5, desc: 'Offer forbidden desires' },
  { id: 'contract', label: 'Create Soul Contract', souls: 5, corruption: 15, desc: 'Trade wishes for souls' },
  { id: 'hellfire', label: 'Practice Hellfire', souls: 0, corruption: 10, desc: 'Master infernal flames' },
  { id: 'corrupt', label: 'Spread Corruption', souls: 2, corruption: 20, desc: 'Turn good to evil' },
  { id: 'redeem', label: 'Acts of Kindness', souls: 0, corruption: -15, desc: 'Path to redemption' },
  { id: 'summon', label: 'Summon Lesser Demons', souls: 3, corruption: 12, desc: 'Call forth minions' }
];

export default function DemonHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showContracts, setShowContracts] = useState(false);

  const { data: demons = [] } = useQuery({
    queryKey: ['demons'],
    queryFn: () => base44.entities.Demon.list()
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['soulContracts'],
    queryFn: () => base44.entities.SoulContract.list()
  });

  const demon = demons[0];
  const myContracts = contracts.filter(c => c.demon_id === demon?.id);

  const handleAction = async (action) => {
    if (!demon) return;
    setProcessing(true);

    setTimeout(async () => {
      const newSouls = (demon.souls_collected || 0) + action.souls;
      const newCorruption = Math.max(0, Math.min(100, (demon.corruption_level || 50) + action.corruption));

      await base44.entities.Demon.update(demon.id, {
        souls_collected: newSouls,
        corruption_level: newCorruption
      });

      if (action.id === 'contract') {
        const mortals = ['Sarah Chen', 'Marcus Brown', 'Elena Rodriguez', 'David Park'];
        const wishes = ['wealth', 'love', 'revenge', 'power', 'beauty', 'fame'];
        
        await base44.entities.SoulContract.create({
          demon_id: demon.id,
          mortal_name: mortals[Math.floor(Math.random() * mortals.length)],
          wish_granted: wishes[Math.floor(Math.random() * wishes.length)],
          price: 'your immortal soul',
          years_until_due: 10
        });
      }

      const outcomes = {
        tempt: ['Whispered in their ear. They agreed. Sin tastes sweet.', 'Another soul teetering on edge. You pushed them over.', 'Corruption spreads like wildfire. One temptation at a time.'],
        contract: ['Contract signed in blood. Their soul belongs to you now.', 'They wanted everything. You gave it. For a price.', 'Another fool traded eternity for fleeting pleasure.'],
        hellfire: ['Flames danced at your command. Infernal power perfected.', 'You summoned hellfire from nothing. Hell answers your call.', 'The fire of damnation burns brighter in your hands.'],
        corrupt: ['Innocence shattered. Virtue corrupted. Another soul claimed.', 'You turned saint to sinner. Goodness poisoned. Hell smiles.', 'Corruption spreads through them. Soon they\'ll be yours.'],
        redeem: ['An act of mercy. Strange feeling. Almost... human.', 'You helped without taking. Redemption\'s first step.', 'Kindness felt foreign. But not unwelcome. Grace whispers.'],
        summon: ['Lesser demons answered your call. An army grows.', 'You pulled them from hell. They obey absolutely.', 'Minions summoned. The infernal legion expands.']
      };

      setOutcome(outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)]);

      await base44.entities.NightLog.create({
        entry: `${demon.name}: ${outcomes[action.id][0]}`,
        category: 'demonic',
        intensity: action.id === 'contract' ? 'extreme' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-black to-red-950 p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-red-100 mb-2">{demon.name}</h1>
        <p className="text-red-300 text-sm mb-8">😈 {demon.demon_type.replace('_', ' ')} • {demon.is_fallen ? 'Fallen' : 'Infernal'}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
            <Skull className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-red-400 text-xs">Souls Collected</p>
            <p className="text-white text-2xl font-bold">{demon.souls_collected}</p>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
            <Flame className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-purple-400 text-xs">Corruption</p>
            <p className="text-white text-2xl font-bold">{demon.corruption_level}%</p>
          </div>
          <button
            onClick={() => setShowContracts(true)}
            className="bg-black/40 border border-yellow-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
          >
            <FileText className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-yellow-400 text-xs">Contracts</p>
            <p className="text-white text-2xl font-bold">{myContracts.length}</p>
          </button>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 rounded-xl p-8 text-center border border-red-500/30"
            >
              <p className="text-red-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          ) : processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="w-12 h-12 text-red-400 mx-auto" />
              </motion.div>
              <p className="text-red-300 mt-4">Corrupting...</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {DEMON_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action)}
                  className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-500/50 rounded-xl py-4 px-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-white font-bold">{action.label}</p>
                      <p className="text-red-300 text-xs">{action.desc}</p>
                    </div>
                    <div className="text-right text-xs">
                      {action.souls > 0 && <p className="text-yellow-400">+{action.souls} Souls</p>}
                      <p className={action.corruption > 0 ? 'text-red-400' : 'text-blue-400'}>
                        {action.corruption > 0 ? '+' : ''}{action.corruption} Corruption
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Contracts Modal */}
      {showContracts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setShowContracts(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Soul Contracts</h3>
            <div className="space-y-3">
              {myContracts.map(contract => (
                <div key={contract.id} className="bg-gray-800 border border-red-500/30 rounded-lg p-4">
                  <p className="text-white font-bold mb-1">{contract.mortal_name}</p>
                  <p className="text-gray-400 text-sm mb-2">Wish: {contract.wish_granted}</p>
                  <p className="text-red-400 text-sm">Years remaining: {contract.years_until_due}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}