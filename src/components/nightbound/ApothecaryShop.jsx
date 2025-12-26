import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CUSTOMERS = [
  { name: 'Nervous Student', need: 'Calming tea', pay: 50, icon: '🎓' },
  { name: 'Sick Elder', need: 'Healing potion', pay: 120, icon: '👴' },
  { name: 'Paranoid Woman', need: 'Protection charm', pay: 200, icon: '😰' },
  { name: 'Love-Sick Teen', need: 'Love potion', pay: 150, icon: '💔' },
  { name: 'Insomniac', need: 'Sleep draught', pay: 80, icon: '😴' },
  { name: 'Athlete', need: 'Strength tonic', pay: 100, icon: '💪' },
];

export default function ApothecaryShop({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState(null);
  const [serving, setServing] = useState(false);
  const [outcome, setOutcome] = useState('');

  if (!witch) {
    return null;
  }

  const getRandomCustomer = () => {
    return CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  };

  const handleServe = async () => {
    setServing(true);

    setTimeout(async () => {
      const success = Math.random() > 0.2;
      const payment = success ? customer.pay : Math.floor(customer.pay * 0.5);

      const outcomeText = success
        ? `Successfully served ${customer.name}. They paid $${payment} and left satisfied.`
        : `${customer.name} wasn't fully satisfied. Only paid $${payment}.`;

      setOutcome(outcomeText);

      await base44.entities.NightLog.create({
        entry: `${witch.name} served ${customer.name} at the apothecary. ${outcomeText}`,
        category: 'interaction',
        intensity: 'subtle'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setServing(false);
        setOutcome('');
        setCustomer(null);
      }, 3000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">🏪 Apothecary Shop</h2>
        <p className="text-gray-400 text-sm mb-6">Sell potions and charms to customers</p>

        {!customer && !serving && !outcome && (
          <div className="text-center">
            <button
              onClick={() => setCustomer(getRandomCustomer())}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-medium"
            >
              Wait for Customer
            </button>
          </div>
        )}

        {customer && !serving && !outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-green-500/30">
            <div className="text-center mb-4">
              <span className="text-6xl">{customer.icon}</span>
              <h3 className="text-white text-xl font-bold mt-2">{customer.name}</h3>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2">
                "I need <span className="text-purple-400">{customer.need}</span>..."
              </p>
              <p className="text-green-400 text-sm">Will pay: ${customer.pay}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleServe}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                Serve Customer
              </button>
              <button
                onClick={() => setCustomer(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg"
              >
                Turn Away
              </button>
            </div>
          </div>
        )}

        {serving && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mx-auto mb-4"
            >
              🧪
            </motion.div>
            <p className="text-purple-400">Preparing their order...</p>
          </div>
        )}

        {outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-purple-500/30 text-center">
            <p className="text-white text-lg">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}