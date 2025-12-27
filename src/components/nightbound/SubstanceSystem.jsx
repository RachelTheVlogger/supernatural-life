import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pill, Wine, Cigarette, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function SubstanceSystem({ human, onClose }) {
  const [addiction, setAddiction] = useState({
    alcohol: human.alcohol_addiction || 0,
    weed: human.weed_addiction || 0,
    pills: human.pills_addiction || 0,
    cigarettes: human.cigarette_addiction || 0
  });
  const queryClient = useQueryClient();

  const substances = [
    { 
      id: 'alcohol', 
      label: '🍷 Drink Alcohol', 
      icon: Wine,
      addictionGain: 3,
      stressRelief: 20,
      awarenessChange: -5,
      outcomes: [
        'You pour a drink. Then another.\n\nThe edges blur. Everything softer.\n\nYou needed this.',
        'Drunk texting. Bad idea.\n\nBut you do it anyway.\n\nWho cares anymore.',
        'Alcohol makes you forget. Temporarily.\n\nThe vampire thoughts fade.\n\nFor now.'
      ]
    },
    { 
      id: 'weed', 
      label: '🌿 Smoke Weed', 
      icon: Cigarette,
      addictionGain: 2,
      stressRelief: 25,
      awarenessChange: -10,
      outcomes: [
        'You light up. Inhale. Hold.\n\nEverything slows down. Quiets.\n\nPeace. Finally.',
        'High as fuck. Paranoid thoughts.\n\nAre they watching you right now?\n\nNo. Just the weed talking.',
        'Couch-locked. Munchies. Netflix.\n\nNormal human things.\n\nYou miss feeling normal.'
      ]
    },
    { 
      id: 'pills', 
      label: '💊 Take Pills', 
      icon: Pill,
      addictionGain: 5,
      stressRelief: 35,
      awarenessChange: -15,
      danger: 15,
      outcomes: [
        'Pills down. Water. Wait.\n\nNumbness spreads. Blissful nothing.\n\nYou chase this feeling.',
        'Too many pills. You know it.\n\nBut you don\'t care.\n\nAnything to stop thinking.',
        'Prescription not yours. Doesn\'t matter.\n\nThey work. That\'s all that matters.\n\nYou need more.'
      ]
    },
    { 
      id: 'cigarettes', 
      label: '🚬 Smoke Cigarettes', 
      icon: Cigarette,
      addictionGain: 2,
      stressRelief: 10,
      awarenessChange: 0,
      outcomes: [
        'Cigarette between your lips. Light it.\n\nNicotine hit. Small relief.\n\nIt helps. A little.',
        'Chain smoking on your balcony.\n\nWatching the night.\n\nLooking for them.',
        'Another pack empty already.\n\nYour lungs protest.\n\nYou light another anyway.'
      ]
    }
  ];

  const useSubstance = async (substance) => {
    const outcome = substance.outcomes[Math.floor(Math.random() * substance.outcomes.length)];
    
    const newAddiction = {
      ...addiction,
      [substance.id]: Math.min(100, addiction[substance.id] + substance.addictionGain)
    };
    setAddiction(newAddiction);

    const updates = {
      stress_level: Math.max(0, (human.stress_level || 50) - substance.stressRelief),
      awareness_level: Math.max(0, (human.awareness_level || 0) + substance.awarenessChange),
      [`${substance.id}_addiction`]: newAddiction[substance.id]
    };

    if (substance.danger) {
      updates.danger_level = Math.min(100, (human.danger_level || 0) + substance.danger);
    }

    await base44.entities.Human.update(human.id, updates);

    await base44.entities.NightLog.create({
      entry: `${human.name} used ${substance.label}. Addiction: ${newAddiction[substance.id]}%. ${newAddiction[substance.id] > 60 ? 'Becoming dependent.' : ''}`,
      category: 'interaction',
      intensity: newAddiction[substance.id] > 60 ? 'significant' : 'subtle'
    });

    queryClient.invalidateQueries();
    alert(outcome);
  };

  const getTotalAddiction = () => {
    return Math.floor((addiction.alcohol + addiction.weed + addiction.pills + addiction.cigarettes) / 4);
  };

  const totalAddiction = getTotalAddiction();

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
        className="bg-gradient-to-br from-gray-900/90 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Pill className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Substances</h2>
              <p className="text-gray-400 text-sm">Coping mechanisms</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall addiction */}
        <div className={`border rounded-xl p-4 mb-6 ${
          totalAddiction > 70 ? 'bg-red-950/40 border-red-500/30' :
          totalAddiction > 40 ? 'bg-orange-950/40 border-orange-500/30' :
          'bg-gray-800/50 border-gray-700'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Overall Addiction
            </span>
            <span className={`font-bold ${
              totalAddiction > 70 ? 'text-red-400' :
              totalAddiction > 40 ? 'text-orange-400' :
              'text-green-400'
            }`}>{totalAddiction}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              style={{ width: `${totalAddiction}%` }}
              className="h-2 bg-gradient-to-r from-purple-500 to-red-500 rounded-full"
            />
          </div>
          {totalAddiction > 70 && (
            <p className="text-red-400 text-xs mt-2 text-center">⚠️ Severely addicted. Need help.</p>
          )}
        </div>

        {totalAddiction > 50 && (
          <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-300 font-bold text-sm">Addiction Warning</p>
            </div>
            <p className="text-yellow-300 text-xs">
              You're becoming dependent. This isn't healthy. But it's easier than facing reality.
            </p>
          </div>
        )}

        {/* Individual substances */}
        <div className="space-y-3">
          {substances.map(substance => {
            const Icon = substance.icon;
            const level = addiction[substance.id];
            return (
              <div key={substance.id} className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-bold">{substance.label}</p>
                    <p className="text-gray-400 text-xs">
                      Stress relief: -{substance.stressRelief}%
                      {substance.danger && ` • Danger: +${substance.danger}%`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      level > 70 ? 'text-red-400' :
                      level > 40 ? 'text-orange-400' :
                      'text-gray-400'
                    }`}>{level}%</p>
                    <p className="text-gray-500 text-xs">Addiction</p>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                  <div 
                    style={{ width: `${level}%` }}
                    className="h-1.5 bg-purple-500 rounded-full"
                  />
                </div>

                <button
                  onClick={() => useSubstance(substance)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  Use
                </button>
              </div>
            );
          })}
        </div>

        {totalAddiction > 30 && (
          <div className="mt-6 bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-sm text-center">
              💭 Using substances to cope with vampire obsession
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}