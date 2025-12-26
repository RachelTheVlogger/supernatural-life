import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const FORTUNES = [
  { type: 'Love', payment: 100, predictions: ['You will meet someone special soon', 'A past lover will return', 'Your current relationship will strengthen'] },
  { type: 'Money', payment: 150, predictions: ['Unexpected fortune coming your way', 'Investment will pay off', 'Be careful with spending'] },
  { type: 'Death', payment: 200, predictions: ['Someone close will pass', 'Danger lurks nearby', 'Avoid travel this week'] },
  { type: 'Future', payment: 120, predictions: ['Big change coming', 'You will move soon', 'New opportunity ahead'] }
];

export default function FortuneTelling({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState(null);
  const [reading, setReading] = useState(false);
  const [outcome, setOutcome] = useState('');

  if (!witch) {
    return null;
  }

  const handleReading = async () => {
    setReading(true);

    setTimeout(async () => {
      const prediction = customer.predictions[Math.floor(Math.random() * customer.predictions.length)];
      const outcomeText = `You told them: "${prediction}". They paid $${customer.payment}.`;

      setOutcome(outcomeText);

      await base44.entities.NightLog.create({
        entry: `${witch.name} did a ${customer.type} reading. ${outcomeText}`,
        category: 'interaction',
        intensity: 'subtle'
      });

      // Chance to gain power from divination
      if (Math.random() > 0.7) {
        await base44.entities.Witch.update(witch.id, {
          power_level: witch.power_level + 3
        });
      }

      queryClient.invalidateQueries();

      setTimeout(() => {
        setReading(false);
        setOutcome('');
        setCustomer(null);
      }, 4000);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">🔮 Fortune Telling</h2>
        <p className="text-gray-400 text-sm mb-6">Divine the future for customers</p>

        {!customer && !reading && !outcome && (
          <div className="space-y-3">
            {FORTUNES.map(fortune => (
              <button
                key={fortune.type}
                onClick={() => setCustomer(fortune)}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium">{fortune.type} Reading</h3>
                  <span className="text-green-400 text-sm">${fortune.payment}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {customer && !reading && !outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-purple-500/30">
            <div className="text-center mb-4">
              <span className="text-6xl">🔮</span>
              <h3 className="text-white text-xl font-bold mt-2">{customer.type} Reading</h3>
              <p className="text-green-400 text-sm mt-1">Payment: ${customer.payment}</p>
            </div>

            <button
              onClick={handleReading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
            >
              Perform Reading
            </button>
          </div>
        )}

        {reading && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mx-auto mb-4"
            >
              🔮
            </motion.div>
            <p className="text-purple-400">Gazing into the future...</p>
          </div>
        )}

        {outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-purple-500/30">
            <p className="text-white text-center">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}