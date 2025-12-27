import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function BloodAddiction({ vampireState, onClose }) {
  const [feeding, setFeeding] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const queryClient = useQueryClient();

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const { data: donors = [] } = useQuery({
    queryKey: ['donors'],
    queryFn: () => base44.entities.Donor.list()
  });

  const addictionLevel = vampireState.addiction_level || 0;
  const addictedTo = vampireState.addicted_to_person;
  const withdrawalSeverity = vampireState.withdrawal_severity || 0;
  const daysSinceLastFix = vampireState.days_since_last_fix || 0;

  const getAddictionStage = () => {
    if (addictionLevel < 20) return { stage: 'None', color: 'text-gray-400', bg: 'bg-gray-700' };
    if (addictionLevel < 40) return { stage: 'Developing', color: 'text-yellow-400', bg: 'bg-yellow-900/40' };
    if (addictionLevel < 60) return { stage: 'Dependent', color: 'text-orange-400', bg: 'bg-orange-900/40' };
    if (addictionLevel < 80) return { stage: 'Addicted', color: 'text-red-400', bg: 'bg-red-900/40' };
    return { stage: 'Severe Addiction', color: 'text-purple-400', bg: 'bg-purple-900/40' };
  };

  const feedOnAddiction = async (person) => {
    setFeeding(true);

    const isAddictedPerson = addictedTo === person.id;
    const intensityBoost = isAddictedPerson ? 3 : 1;
    const addictionIncrease = isAddictedPerson ? 15 : 5;

    const outcomes = [
      `You drink from ${person.name}. ${isAddictedPerson ? 'THE RUSH. Pure ecstasy floods through you. Nothing else matters. You need MORE.' : 'It satisfies, but something feels... missing. You crave THEM.'}`,
      `${person.name}'s blood hits your system. ${isAddictedPerson ? 'Perfect. Complete. This is what you needed. Your addiction deepens.' : 'Good, but not enough. Your thoughts drift to the one you truly crave.'}`,
      `You feed. ${isAddictedPerson ? 'Every cell in your body screams YES. You\'re chasing this high forever now.' : 'Functional. But you know whose blood would make you feel ALIVE.'}`
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    const newAddictionLevel = Math.min(100, addictionLevel + addictionIncrease);
    const newWithdrawal = isAddictedPerson ? 0 : Math.min(100, withdrawalSeverity + 10);

    await base44.entities.VampireState.update(vampireState.id, {
      addiction_level: newAddictionLevel,
      addicted_to_person: addictedTo || person.id,
      withdrawal_severity: newWithdrawal,
      days_since_last_fix: isAddictedPerson ? 0 : daysSinceLastFix + 1,
      hunger_state: 'sated'
    });

    await base44.entities.NightLog.create({
      entry: outcome,
      category: 'feeding',
      intensity: isAddictedPerson ? 'significant' : 'moderate'
    });

    setOutcome(outcome);
    queryClient.invalidateQueries(['vampireState']);
    
    setTimeout(() => {
      setFeeding(false);
      setOutcome(null);
    }, 3000);
  };

  const tryToResist = async () => {
    setFeeding(true);

    const resistChance = Math.max(10, 100 - addictionLevel);
    const success = Math.random() * 100 < resistChance;

    if (success) {
      const newLevel = Math.max(0, addictionLevel - 10);
      await base44.entities.VampireState.update(vampireState.id, {
        addiction_level: newLevel,
        withdrawal_severity: Math.min(100, withdrawalSeverity + 20)
      });

      setOutcome(`You resist. The craving tears at you. Withdrawal hits HARD. But you held back. Addiction reduced.`);
    } else {
      await base44.entities.VampireState.update(vampireState.id, {
        addiction_level: Math.min(100, addictionLevel + 5),
        withdrawal_severity: Math.min(100, withdrawalSeverity + 30)
      });

      setOutcome(`You tried to resist. Failed. The need consumes you. You're spiraling deeper into addiction.`);
    }

    await base44.entities.NightLog.create({
      entry: success ? 'Resisted the addiction. Barely.' : 'Failed to resist. Addiction stronger.',
      category: 'observation',
      intensity: 'significant'
    });

    queryClient.invalidateQueries(['vampireState']);
    
    setTimeout(() => {
      setFeeding(false);
      setOutcome(null);
    }, 3000);
  };

  const stage = getAddictionStage();
  const addictedPerson = [...servants, ...donors].find(p => p.id === addictedTo);

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
        className="bg-gradient-to-br from-red-950/40 to-purple-950/40 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Blood Addiction</h2>
              <p className="text-gray-400 text-sm">Dependency & cravings system</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Droplets className="w-16 h-16 text-red-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-200 text-lg italic">{outcome}</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Addiction Status */}
              <div className={`${stage.bg} border border-red-500/30 rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold">Addiction Status</h3>
                    <p className={`text-2xl font-bold ${stage.color}`}>{stage.stage}</p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${stage.color}`} />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Dependency Level</span>
                      <span className="text-white font-bold">{addictionLevel}%</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${addictionLevel}%` }} />
                    </div>
                  </div>

                  {withdrawalSeverity > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Withdrawal Severity</span>
                        <span className="text-orange-400 font-bold">{withdrawalSeverity}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${withdrawalSeverity}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {addictedPerson && (
                  <div className="mt-4 bg-red-950/40 rounded-lg p-3 border border-red-500/30">
                    <p className="text-red-300 text-sm font-bold">Addicted to: {addictedPerson.name}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {daysSinceLastFix > 0 ? `${daysSinceLastFix} days since last fix` : 'Recently fed on them'}
                    </p>
                  </div>
                )}
              </div>

              {/* Symptoms */}
              {withdrawalSeverity > 20 && (
                <div className="bg-orange-950/30 border border-orange-500/30 rounded-xl p-4">
                  <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Withdrawal Symptoms
                  </h3>
                  <div className="space-y-2">
                    {withdrawalSeverity > 20 && (
                      <p className="text-gray-300 text-sm">• Constant craving for THEIR blood specifically</p>
                    )}
                    {withdrawalSeverity > 40 && (
                      <p className="text-gray-300 text-sm">• Other blood doesn't satisfy like it used to</p>
                    )}
                    {withdrawalSeverity > 60 && (
                      <p className="text-gray-300 text-sm">• Obsessive thoughts about them. Can't focus.</p>
                    )}
                    {withdrawalSeverity > 80 && (
                      <p className="text-gray-300 text-sm">• Physical pain when feeding from anyone else</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-white font-bold">Feed or Resist</h3>

                {addictedPerson && (
                  <button
                    onClick={() => feedOnAddiction(addictedPerson)}
                    disabled={feeding}
                    className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 border-2 border-red-500/50"
                  >
                    🩸 Feed on {addictedPerson.name} (Your Addiction)
                  </button>
                )}

                {servants.filter(s => s.id !== addictedTo).slice(0, 3).map(servant => (
                  <button
                    key={servant.id}
                    onClick={() => feedOnAddiction(servant)}
                    disabled={feeding}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-all disabled:opacity-50 border border-gray-600"
                  >
                    Feed on {servant.name} (won't satisfy the craving)
                  </button>
                ))}

                {addictionLevel > 20 && (
                  <button
                    onClick={tryToResist}
                    disabled={feeding}
                    className="w-full bg-purple-900/60 hover:bg-purple-900/80 text-white py-3 rounded-xl transition-all disabled:opacity-50 border border-purple-500/30"
                  >
                    💪 Try to Resist ({Math.max(10, 100 - addictionLevel)}% chance)
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-300 text-sm">
                  <span className="font-bold">Warning:</span> Repeated feeding from the same person increases dependency. 
                  {addictionLevel > 50 && ' You\'re in deep. Breaking free will be painful.'}
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}