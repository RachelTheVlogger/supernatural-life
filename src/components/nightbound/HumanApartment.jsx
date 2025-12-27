import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Home, DollarSign, Star } from 'lucide-react';

export default function HumanApartment({ human, onClose }) {
  const [money, setMoney] = useState(2000);
  const [apartment, setApartment] = useState({ quality: 1, upgrades: [] });

  const upgrades = [
    { id: 'bed', name: 'Better Bed', cost: 300, quality: 0.3, description: 'Sleep better, feel better' },
    { id: 'kitchen', name: 'Kitchen Upgrade', cost: 500, quality: 0.4, description: 'Cook proper meals' },
    { id: 'desk', name: 'Work Desk', cost: 200, quality: 0.2, description: 'Productive workspace' },
    { id: 'decor', name: 'Nice Decor', cost: 250, quality: 0.25, description: 'Make it feel like home' },
    { id: 'security', name: 'Security System', cost: 400, quality: 0.3, description: 'Feel safer at home' },
    { id: 'tv', name: 'Entertainment Setup', cost: 600, quality: 0.35, description: 'Netflix and chill' },
    { id: 'gym', name: 'Home Gym', cost: 800, quality: 0.5, description: 'Work out at home' },
    { id: 'plants', name: 'Plants & Life', cost: 150, quality: 0.15, description: 'Brighten up the space' }
  ];

  const buyUpgrade = (upgrade) => {
    if (money < upgrade.cost) {
      alert('Not enough money!');
      return;
    }
    if (apartment.upgrades.find(u => u.id === upgrade.id)) {
      alert('Already have this!');
      return;
    }

    setMoney(prev => prev - upgrade.cost);
    setApartment({
      ...apartment,
      quality: apartment.quality + upgrade.quality,
      upgrades: [...apartment.upgrades, upgrade]
    });

    alert(`Purchased ${upgrade.name}!\n\nYour apartment quality increased.`);
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
        className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-amber-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-amber-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Your Apartment</h2>
              <p className="text-gray-400 text-sm">Upgrade your living space</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-white font-bold">${money}</p>
            <p className="text-gray-400 text-xs">Money</p>
          </div>
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-white font-bold">{apartment.quality.toFixed(1)}/5</p>
            <p className="text-gray-400 text-xs">Quality</p>
          </div>
        </div>

        <div className="space-y-3">
          {upgrades.map(upgrade => {
            const owned = apartment.upgrades.find(u => u.id === upgrade.id);
            return (
              <div key={upgrade.id} className={`rounded-xl p-4 border ${
                owned ? 'bg-green-950/40 border-green-500/30' : 'bg-gray-800/50 border-amber-500/30'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-bold">{upgrade.name}</h4>
                    <p className="text-gray-400 text-xs">{upgrade.description}</p>
                  </div>
                  <p className="text-yellow-400 font-bold">${upgrade.cost}</p>
                </div>
                {owned ? (
                  <p className="text-green-400 text-xs">✓ Installed</p>
                ) : (
                  <button
                    onClick={() => buyUpgrade(upgrade)}
                    disabled={money < upgrade.cost}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 text-white py-2 rounded-lg text-sm font-bold mt-2"
                  >
                    Purchase
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}