import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TURN_ACTIONS = [
  { id: 'offer_eternity', label: 'Offer them eternity with you', icon: '💜' },
  { id: 'bite_transform', label: 'Bite and transform them', icon: '🦇' },
  { id: 'blood_exchange', label: 'Exchange blood as a binding ritual', icon: '🩸' }
];

const OUTCOMES = {
  offer_eternity: [
    `You pulled them close, eyes meeting theirs. "Spend eternity with me," you whispered. "Let me turn you. Let us be forever." They trembled, tears streaming down their face. "Yes," they breathed. "Yes."`,
    `You cupped their face, your voice soft but absolute. "I want you forever. Not just tonight. Forever." They kissed you desperately, surrendering completely to the promise of eternity together.`,
    `"Become like me," you whispered against their lips. "Walk the night with me. Be mine for all of time." They looked into your eyes with complete devotion and nodded.`
  ],
  bite_transform: [
    `You buried your fangs in their neck, drawing deep. The transformation began—their body arching as the vampire curse flowed through them. When it was done, they opened their eyes. Red eyes. Your eyes. "Welcome to forever," you breathed.`,
    `Your bite was swift and deep. Their scream became a moan as the venom spread through their veins. When the transformation finished, they gasped for breath—but didn't need it. They were changed. Perfect. Yours.`,
    `You sank your fangs into them and held them as the change took hold. Their body convulsed with new power, new hunger, new existence. When their eyes opened, they were crimson and ancient. Reborn.`
  ],
  blood_exchange: [
    `You opened your wrist and let them drink from you while you drank from them. Your blood mixing, binding you forever. When you finally pulled apart, you were no longer separate—you were one. Connected. Eternal.`,
    `Blood for blood, vein for vein. You exchanged the sacred liquid as they transformed, the ritual binding you together more powerfully than any vampire could imagine. When it was done, you were soulmates in the truest sense.`,
    `The ritual was ancient and intimate. Your blood in their mouth, their blood on your lips. The connection was instantaneous and absolute. They were your progeny now. Your eternal companion. Forever bound to you.`
  ]
};

export default function HunterTurnOptions({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleTurnAction = async (action) => {
    setProcessing(true);
    setSelectedAction(action);

    const outcomes = OUTCOMES[action.id];
    const selectedOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    setTimeout(async () => {
      try {
        await base44.entities.NightLog.create({
          entry: `${hunter.name}: ${selectedOutcome}`,
          category: 'interaction',
          intensity: 'critical'
        });

        setOutcome(selectedOutcome);

        // Turn the hunter
        setTimeout(async () => {
          try {
            await base44.entities.Hunter.update(hunter.id, {
              is_turned: true,
              vampire_stage: 1,
              status: 'recruited'
            });
            queryClient.invalidateQueries();
          } catch (e) {
            console.error('Failed to turn hunter:', e);
          }
        }, 3000);

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
          setSelectedAction(null);
          onClose?.();
        }, 6000);
      } catch (e) {
        console.error('Turn action failed:', e);
        setProcessing(false);
      }
    }, 1000);
  };

  if (processing && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-500/50"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-200 text-lg leading-relaxed italic"
          >
            {outcome}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-4xl">🦇</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-red-300 text-lg font-bold mb-4">Turn Options</h4>
      {TURN_ACTIONS.map((action, i) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => handleTurnAction(action)}
          className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg border-2 border-red-500/50 transition-all flex items-center gap-2"
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}