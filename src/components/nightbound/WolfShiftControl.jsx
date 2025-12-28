import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function WolfShiftControl({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [shifting, setShifting] = useState(false);
  const [outcome, setOutcome] = useState('');

  const forms = [
    { id: 'human', name: 'Human Form', icon: '👤', desc: 'Pass as normal. Blend in.' },
    { id: 'eyes', name: 'Wolf Eyes', icon: '👁️', desc: 'Yellow eyes. Enhanced sight.' },
    { id: 'claws', name: 'Claws Extended', icon: '🩸', desc: 'Sharp claws. Deadly weapons.' },
    { id: 'fangs', name: 'Fangs Out', icon: '😬', desc: 'Elongated canines. Intimidating.' },
    { id: 'hybrid', name: 'Hybrid Form', icon: '🐺', desc: 'Half human, half wolf. Powerful.' },
    { id: 'wolf', name: 'Full Wolf', icon: '🐺', desc: 'Complete transformation. Primal.' }
  ];

  const handleShift = async (form) => {
    setShifting(true);

    setTimeout(async () => {
      const controlLevel = werewolf.wolf_control || 30;
      const requiredControl = {
        human: 0,
        eyes: 20,
        claws: 30,
        fangs: 30,
        hybrid: 50,
        wolf: 10
      };

      if (controlLevel < requiredControl[form.id] && form.id !== 'human' && form.id !== 'wolf') {
        setOutcome(`Not enough control! Need ${requiredControl[form.id]} control. Train more.`);
        setShifting(false);
        setTimeout(() => setOutcome(''), 3000);
        return;
      }

      const outcomes = {
        human: 'Bones crack back. Fur recedes. You look human again. But inside, the wolf waits.',
        eyes: 'Your eyes shift. Yellow. Predatory. Enhanced vision. You see EVERYTHING.',
        claws: 'Claws extend from fingertips. Sharp. Lethal. Ready to kill.',
        fangs: 'Your canines elongate. Fangs. You bare them. Everyone backs away.',
        hybrid: 'Transformation begins. Bones reshaping. Muscles expanding. Half human. Half beast. Perfect balance.',
        wolf: 'PAIN. Ecstasy. Your body explodes into wolf form. Four legs. Fur. Freedom. You are WOLF.'
      };

      const result = outcomes[form.id];
      setOutcome(result);

      await base44.entities.PlayerWerewolf.update(werewolf.id, {
        wolf_control: Math.min(100, controlLevel + 2)
      });

      await base44.entities.NightLog.create({
        entry: `${werewolf.name}: ${result}`,
        category: 'power',
        intensity: form.id === 'wolf' || form.id === 'hybrid' ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setShifting(false);
        setOutcome('');
      }, 3500);
    }, 2000);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-orange-950 to-amber-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-orange-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Shift Control</h2>
        <p className="text-orange-300 text-sm mb-6">
          Master your transformations. Shift at will.
        </p>

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-orange-500/30"
            >
              <p className="text-orange-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : shifting ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="text-6xl">🐺</div>
            </motion.div>
            <p className="text-orange-300 mt-4">Shifting...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-black/40 rounded-xl p-4 mb-4 border border-orange-500/30">
              <p className="text-gray-400 text-sm mb-2">Wolf Control: {werewolf.wolf_control || 30}/100</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  style={{ width: `${werewolf.wolf_control || 30}%` }}
                  className="h-2 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full"
                />
              </div>
            </div>

            {forms.map(form => {
              const requiredControl = {
                human: 0, eyes: 20, claws: 30, fangs: 30, hybrid: 50, wolf: 10
              };
              const canShift = (werewolf.wolf_control || 30) >= requiredControl[form.id];

              return (
                <button
                  key={form.id}
                  onClick={() => handleShift(form)}
                  disabled={!canShift && form.id !== 'human' && form.id !== 'wolf'}
                  className={`w-full rounded-xl p-4 text-left transition-all ${
                    canShift || form.id === 'human' || form.id === 'wolf'
                      ? 'bg-orange-900/40 hover:bg-orange-900/60 border border-orange-500/30'
                      : 'bg-gray-800/40 border border-gray-600/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{form.icon}</span>
                      <div>
                        <h4 className="text-white font-medium">{form.name}</h4>
                        <p className="text-gray-400 text-xs">{form.desc}</p>
                      </div>
                    </div>
                    {!canShift && form.id !== 'human' && form.id !== 'wolf' && (
                      <span className="text-gray-500 text-xs">Need {requiredControl[form.id]}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}