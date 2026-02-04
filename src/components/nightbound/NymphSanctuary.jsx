import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Droplets, Flower, Shield, TreePine, Heart, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const SANCTUARY_TYPES = [
  { id: 'waterfall', name: 'Sacred Waterfall', cost: 10, benefit: 'Healing powers +10, Purity +5', icon: Droplets },
  { id: 'spring', name: 'Enchanted Spring', cost: 15, benefit: 'Can heal supernaturals, Connection +8', icon: Sparkles },
  { id: 'grove', name: 'Moonlit Grove', cost: 12, benefit: 'Moon magic access, Nature Bond +7', icon: TreePine },
  { id: 'pond', name: 'Crystal Pond', cost: 8, benefit: 'Scrying ability, Purity +3', icon: Droplets },
  { id: 'garden', name: 'Underwater Garden', cost: 10, benefit: 'Plant growth mastery, Connection +6', icon: Flower },
  { id: 'temple', name: 'Nature Temple', cost: 20, benefit: 'Ultimate sanctuary, all stats +10', icon: Shield }
];

export default function NymphSanctuary({ nymph, onClose }) {
  const queryClient = useQueryClient();
  const [building, setBuilding] = useState(null);
  const [outcome, setOutcome] = useState('');

  const sanctuaries = nymph.sanctuaries || [];
  const availablePoints = Math.floor((nymph.nature_bond || 50) / 10);

  const handleBuild = async (sanctuary) => {
    if (availablePoints < sanctuary.cost) {
      alert('Not enough nature bond power. Keep connecting with nature to gain points.');
      return;
    }

    setBuilding(sanctuary.id);

    setTimeout(async () => {
      setOutcome(`You channeled nature's power. ${sanctuary.name} formed from pure magic. Sacred. Protected. Yours. ${sanctuary.benefit}`);

      const newSanctuaries = [
        ...sanctuaries,
        {
          type: sanctuary.id,
          name: sanctuary.name,
          created_date: new Date().toISOString(),
          power_level: 50
        }
      ];

      const updates = {
        sanctuaries: newSanctuaries,
        nature_bond: (nymph.nature_bond || 50) + (sanctuary.id === 'temple' ? 10 : 5),
        purity: Math.min(100, (nymph.purity || 100) + (sanctuary.id === 'temple' ? 10 : 3)),
        connection: Math.min(100, (nymph.connection || 50) + (sanctuary.id === 'temple' ? 10 : sanctuary.cost / 2))
      };

      await base44.entities.WaterNymph.update(nymph.id, updates);

      await base44.entities.NightLog.create({
        entry: `Created ${sanctuary.name}. Sacred ground established.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setBuilding(null);
        setOutcome('');
      }, 5000);
    }, 3000);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-teal-950 to-green-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Nature Sanctuaries</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-black/40 rounded-xl p-4 mb-6 border border-teal-500/30">
          <p className="text-teal-300 text-sm">Available Points: <span className="text-white font-bold">{availablePoints}</span></p>
          <p className="text-gray-400 text-xs mt-1">Gain points by increasing nature bond</p>
        </div>

        {outcome ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 rounded-xl p-6 mb-6 border border-teal-500/30"
          >
            <p className="text-teal-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        ) : building ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <p className="text-teal-400">Creating sanctuary...</p>
          </div>
        ) : (
          <>
            <h3 className="text-white font-bold mb-3">Build New Sanctuary</h3>
            <div className="space-y-3 mb-6">
              {SANCTUARY_TYPES.map(s => {
                const Icon = s.icon;
                const alreadyBuilt = sanctuaries.some(san => san.type === s.id);
                const canAfford = availablePoints >= s.cost;

                return (
                  <button
                    key={s.id}
                    onClick={() => !alreadyBuilt && canAfford && handleBuild(s)}
                    disabled={alreadyBuilt || !canAfford}
                    className={`w-full rounded-xl p-4 text-left transition-all ${
                      alreadyBuilt
                        ? 'bg-green-900/40 border-2 border-green-500/50 opacity-60'
                        : !canAfford
                        ? 'bg-gray-800/40 border-2 border-gray-600/50 opacity-40'
                        : 'bg-teal-900/60 hover:bg-teal-900/80 border-2 border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-teal-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-medium">{s.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            !canAfford ? 'bg-red-900/50 text-red-300' : 'bg-teal-900/50 text-teal-300'
                          }`}>
                            {s.cost} points
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mb-2">{s.benefit}</p>
                        {alreadyBuilt && <span className="text-xs text-green-400">✓ Built</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Existing Sanctuaries */}
            {sanctuaries.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-3">Your Sanctuaries ({sanctuaries.length})</h3>
                <div className="space-y-2">
                  {sanctuaries.map((s, i) => (
                    <div key={i} className="bg-black/40 rounded-lg p-3 border border-teal-500/20">
                      <h4 className="text-teal-300 font-medium text-sm">{s.name}</h4>
                      <p className="text-gray-400 text-xs">Power Level: {s.power_level || 50}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}