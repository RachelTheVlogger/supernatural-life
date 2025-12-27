import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Flame, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function CasualHookups({ human, onClose }) {
  const [hookups, setHookups] = useState([]);
  const queryClient = useQueryClient();

  const findHookup = () => {
    const names = ['Alex', 'Jordan', 'Casey', 'Sam', 'Riley', 'Blake', 'Morgan', 'Taylor', 'Avery', 'Quinn'];
    const vibes = ['chill', 'wild', 'intense', 'fun', 'mysterious', 'experienced', 'shy', 'adventurous'];
    
    const hookup = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      vibe: vibes[Math.floor(Math.random() * vibes.length)],
      chemistry: Math.floor(Math.random() * 40) + 30,
      stamina: Math.floor(Math.random() * 100),
      times: 0
    };
    
    setHookups([...hookups, hookup]);
  };

  const meetUp = async (hookup) => {
    hookup.times += 1;
    
    const outcomes = [
      {
        text: `Met up with ${hookup.name}.\n\nNo talking. No feelings. Just physical.\n\nExactly what you needed.\n\nThey left right after. Perfect.`,
        chemistryGain: 5,
        obsessionLoss: 8
      },
      {
        text: `Quick hookup with ${hookup.name}.\n\nGood sex. No complications.\n\nYou both got what you wanted.\n\nSee you next time.`,
        chemistryGain: 8,
        obsessionLoss: 10
      },
      {
        text: `${hookup.name} came over.\n\nNo strings. No expectations.\n\nJust bodies and pleasure.\n\nClear your head. Feel human again.`,
        chemistryGain: 10,
        obsessionLoss: 12
      },
      {
        text: `Casual sex with ${hookup.name}.\n\nThey know the rules. You know the rules.\n\nNo feelings. Just fun.\n\nExactly what this needs to be.`,
        chemistryGain: 7,
        obsessionLoss: 9
      }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    hookup.chemistry = Math.min(100, hookup.chemistry + outcome.chemistryGain);

    // FWB helps reduce obsession
    if ((human.obsession_level || 0) > 0) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.max(0, (human.obsession_level || 0) - outcome.obsessionLoss)
      });
    }

    await base44.entities.NightLog.create({
      entry: `${human.name} had a casual hookup with ${hookup.name} - no strings attached`,
      category: 'interaction',
      intensity: 'subtle'
    });

    queryClient.invalidateQueries();
    alert(outcome.text);
    setHookups([...hookups]);
  };

  const blockHookup = (id) => {
    setHookups(hookups.filter(h => h.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto border border-orange-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Casual Hookups</h2>
              <p className="text-gray-400 text-sm">No strings attached</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-2">🔥 FWB Zone</h3>
          <p className="text-gray-300 text-sm">Just physical. No feelings. No drama.</p>
        </div>

        <button
          onClick={findHookup}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-xl font-bold mb-6"
        >
          Find Someone
        </button>

        {hookups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hookups yet</p>
        ) : (
          <div className="space-y-3">
            {hookups.map(hookup => (
              <div key={hookup.id} className="bg-gray-800/50 border border-orange-500/30 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-bold">{hookup.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">{hookup.vibe}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{hookup.times}x</span>
                </div>

                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-1">Chemistry</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${hookup.chemistry}%` }} className="h-2 bg-orange-500 rounded-full" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => meetUp(hookup)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-bold"
                  >
                    Meet Up
                  </button>
                  <button
                    onClick={() => blockHookup(hookup.id)}
                    className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Block
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}