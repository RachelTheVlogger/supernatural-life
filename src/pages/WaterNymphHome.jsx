import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Droplets, Sparkles, Heart, Waves, Eye, Zap } from 'lucide-react';

export default function WaterNymphHome() {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { data: nymphs = [] } = useQuery({
    queryKey: ['waterNymphs'],
    queryFn: () => base44.entities.WaterNymph.list()
  });

  const nymph = nymphs[0];

  React.useEffect(() => {
    const initNymph = async () => {
      if (nymphs.length === 0 && !initialized) {
        setInitialized(true);
        const names = ['Naida', 'Brook', 'Cascade', 'Marina', 'Rivena'];
        await base44.entities.WaterNymph.create({
          name: names[Math.floor(Math.random() * names.length)],
          nature_bond: 50,
          water_purity: 100,
          creatures_befriended: 0
        });
        queryClient.invalidateQueries(['waterNymphs']);
      }
    };
    initNymph();
  }, [nymphs.length, initialized, queryClient]);

  const handleHealWaters = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = [
        'You purified the water. Clean. Clear. Life returns.',
        'Your touch healed the stream. Fish returned. Plants bloomed.',
        'Corruption cleansed. The water flows pure again.'
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);

      await base44.entities.WaterNymph.update(nymph.id, {
        water_purity: Math.min((nymph.water_purity || 100) + 5, 100),
        nature_bond: (nymph.nature_bond || 50) + 2
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleBefriend = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const creatures = ['deer', 'otter', 'swan', 'dragonfly', 'frog'];
      const creature = creatures[Math.floor(Math.random() * creatures.length)];
      
      setOutcome(`A ${creature} approached. You bonded. Nature recognizes you.`);

      await base44.entities.WaterNymph.update(nymph.id, {
        creatures_befriended: (nymph.creatures_befriended || 0) + 1,
        nature_bond: (nymph.nature_bond || 50) + 3
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleDance = async () => {
    setProcessing(true);

    setTimeout(async () => {
      setOutcome('You danced by the water. Moonlight reflected. Magic flowed through you.');

      await base44.entities.WaterNymph.update(nymph.id, {
        nature_bond: (nymph.nature_bond || 50) + 4
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!nymph) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-950 to-green-950 p-4">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-green-950 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-teal-400" />
            {nymph.name}
          </h1>
          <p className="text-teal-300">Water Nymph</p>
        </div>

        {/* Stats */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Nature Bond</span>
                <span className="text-green-400">{nymph.nature_bond || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  style={{ width: `${Math.min(((nymph.nature_bond || 0) / 200) * 100, 100)}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-green-600 to-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Water Purity</p>
                <p className="text-white text-2xl font-bold">{nymph.water_purity || 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Creatures Befriended</p>
                <p className="text-white text-2xl font-bold">{nymph.creatures_befriended || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {processing || outcome ? (
          <div className="bg-gray-900/50 rounded-2xl p-12 text-center">
            {processing ? (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-teal-400"
              >
                ...
              </motion.p>
            ) : (
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleHealWaters}
              className="w-full bg-gradient-to-r from-blue-900/60 to-teal-900/60 hover:from-blue-900/80 hover:to-teal-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Droplets className="w-5 h-5 text-blue-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Heal the Waters</h3>
                <p className="text-blue-300 text-sm">Purify. Cleanse. Restore nature.</p>
              </div>
            </button>

            <button
              onClick={handleBefriend}
              className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-green-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Befriend Creatures</h3>
                <p className="text-green-300 text-sm">Connect with nature's children.</p>
              </div>
            </button>

            <button
              onClick={handleDance}
              className="w-full bg-gradient-to-r from-teal-900/60 to-cyan-900/60 hover:from-teal-900/80 hover:to-cyan-900/80 border-2 border-teal-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Sparkles className="w-5 h-5 text-teal-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Moonlight Dance</h3>
                <p className="text-teal-300 text-sm">Dance by the water. Feel the magic.</p>
              </div>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}