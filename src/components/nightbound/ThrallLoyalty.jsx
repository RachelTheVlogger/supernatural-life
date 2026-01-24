import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, AlertTriangle, Gift, Zap } from 'lucide-react';

const LOYALTY_ACTIONS = [
  { id: 'reward', label: 'Give Reward', desc: '+15 loyalty', icon: Gift, loyaltyGain: 15 },
  { id: 'threaten', label: 'Reinforce Control', desc: '-20 rebellion', icon: Zap, rebellionLoss: 20 },
  { id: 'privilege', label: 'Grant Privilege', desc: '+10 loyalty, -5 rebellion', icon: Heart, loyaltyGain: 10, rebellionLoss: 5 }
];

export default function ThrallLoyalty({ thrall, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const betrayalRisk = thrall.betrayal_risk || 0;
  const hasBetrayed = thrall.has_betrayed || false;
  const loyalty = thrall.loyalty || 0;
  const rebellion = thrall.rebellion || 0;

  const handleLoyaltyAction = async (action) => {
    setProcessing(true);

    setTimeout(async () => {
      try {
        const newLoyalty = Math.min((loyalty + (action.loyaltyGain || 0)), 100);
        const newRebellion = Math.max((rebellion - (action.rebellionLoss || 0)), 0);
        const newBetrayal = Math.max(newRebellion - newLoyalty, 0);

        await base44.entities.Thrall.update(thrall.id, {
          loyalty: newLoyalty,
          rebellion: newRebellion,
          betrayal_risk: newBetrayal
        });

        const messages = {
          reward: `${thrall.name} accepted your gift gratefully. They seem more... devoted.`,
          threaten: `You reminded ${thrall.name} who controls them. They straightened up immediately.`,
          privilege: `${thrall.name} was grateful for the privilege. Their eyes showed renewed purpose.`
        };

        setOutcome(messages[action.id]);
        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Failed to update loyalty:', e);
      }

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 1500);
  };

  const checkBetrayal = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const willBetray = Math.random() * 100 < betrayalRisk;

      if (willBetray) {
        await base44.entities.Thrall.update(thrall.id, {
          has_betrayed: true,
          rebellion: 100
        });
        setOutcome(`${thrall.name} BETRAYED YOU! They've turned against you and fled with valuable secrets!`);
      } else {
        setOutcome(`${thrall.name} remained loyal despite their desire to rebel. Their control held.`);
      }

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl max-w-md w-full border border-purple-500/30"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400" />
            Manage Loyalty
          </h2>
          <p className="text-gray-400 text-sm mb-6">{thrall.name}</p>

          {processing || outcome ? (
            <div className="text-center py-8">
              {processing ? (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-purple-400"
                >
                  ...
                </motion.p>
              ) : (
                <p className="text-gray-300">{outcome}</p>
              )}
            </div>
          ) : (
            <>
              {/* Loyalty Meters */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Loyalty</span>
                    <span className={loyalty > 70 ? 'text-green-400' : loyalty > 40 ? 'text-yellow-400' : 'text-red-400'}>
                      {loyalty}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loyalty}%` }}
                      className="h-2 rounded-full bg-green-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Rebellion Desire</span>
                    <span className={rebellion > 60 ? 'text-red-400' : rebellion > 30 ? 'text-yellow-400' : 'text-green-400'}>
                      {rebellion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rebellion}%` }}
                      className="h-2 rounded-full bg-red-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Betrayal Risk</span>
                    <span className={betrayalRisk > 70 ? 'text-red-500 font-bold' : 'text-yellow-400'}>
                      {Math.round(betrayalRisk)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${betrayalRisk}%` }}
                      className="h-2 rounded-full bg-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Warning */}
              {betrayalRisk > 60 && !hasBetrayed && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-xs">
                    High betrayal risk! {thrall.name} may turn against you. Increase loyalty or reinforce control.
                  </p>
                </div>
              )}

              {hasBetrayed && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4 text-center">
                  <p className="text-red-300 font-bold text-sm">{thrall.name} HAS BETRAYED YOU</p>
                </div>
              )}

              {/* Loyalty Actions */}
              <h3 className="text-white font-medium text-sm mb-3">Actions</h3>
              <div className="space-y-2 mb-4">
                {LOYALTY_ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleLoyaltyAction(action)}
                      disabled={hasBetrayed}
                      className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg p-3 text-left transition-colors flex items-center gap-3"
                    >
                      <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{action.label}</p>
                        <p className="text-gray-400 text-xs">{action.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Check Betrayal Button */}
              {betrayalRisk > 30 && !hasBetrayed && (
                <button
                  onClick={checkBetrayal}
                  className="w-full bg-red-900/60 hover:bg-red-900/80 rounded-lg p-3 text-white font-medium text-sm transition-colors"
                >
                  Test Their Loyalty (Risk Betrayal)
                </button>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-2 text-gray-400 text-sm mt-3 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}