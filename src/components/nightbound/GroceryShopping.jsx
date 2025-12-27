import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function GroceryShopping({ human, onClose }) {
  const [cart, setCart] = useState([]);
  const [money] = useState(human.money || 500);
  const queryClient = useQueryClient();

  const groceryItems = [
    { id: 'food_basic', name: 'Basic Groceries', price: 50, hunger: 30 },
    { id: 'food_good', name: 'Quality Meals', price: 100, hunger: 50 },
    { id: 'snacks', name: 'Snacks & Treats', price: 30, hunger: 15 },
    { id: 'alcohol', name: 'Wine & Beer', price: 40, stress: -10 },
    { id: 'coffee', name: 'Coffee', price: 15, energy: 10 },
    { id: 'energy_drinks', name: 'Energy Drinks', price: 25, energy: 20 },
    { id: 'cigarettes', name: 'Cigarettes', price: 35, stress: -5 },
    { id: 'comfort_food', name: 'Comfort Food', price: 45, stress: -15 }
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const checkout = async () => {
    const total = getTotal();
    
    if (total > money) {
      alert("Not enough money!");
      return;
    }

    let hungerChange = 0;
    let stressChange = 0;
    let energyChange = 0;

    cart.forEach(item => {
      if (item.hunger) hungerChange += item.hunger;
      if (item.stress) stressChange += item.stress;
      if (item.energy) energyChange += item.energy;
    });

    const outcomes = [
      `You bought groceries. Fridge stocked.\n\nBasic human maintenance.\n\nYou can survive another week.`,
      `Grocery shopping. Normal people do this.\n\nYou try to feel normal.\n\nIt doesn't work.`,
      `At the store. You see someone who looks like them.\n\nIt's not them.\n\nYou're seeing them everywhere.`,
      `You buy ${cart.length} items. Checkout awkward.\n\nCashier asks how you're doing.\n\n"Fine," you lie.`
    ];

    await base44.entities.Human.update(human.id, {
      money: money - total,
      hunger_level: Math.max(0, (human.hunger_level || 50) - hungerChange),
      stress_level: Math.max(0, (human.stress_level || 50) + stressChange),
      energy_level: Math.min(100, (human.energy_level || 50) + energyChange)
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} went grocery shopping. Spent $${total}. ${cart.length} items.`,
      category: 'interaction',
      intensity: 'subtle'
    });

    queryClient.invalidateQueries();
    alert(outcomes[Math.floor(Math.random() * outcomes.length)]);
    onClose();
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
        className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-green-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Grocery Store</h2>
              <p className="text-gray-400 text-sm">Basic human needs</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Money display */}
        <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Available Money</p>
            <p className="text-white font-bold text-2xl">${money}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Cart Total</p>
            <p className={`font-bold text-2xl ${getTotal() > money ? 'text-red-400' : 'text-green-400'}`}>
              ${getTotal()}
            </p>
          </div>
        </div>

        {/* Shopping cart */}
        {cart.length > 0 && (
          <div className="bg-gray-800/50 border border-green-500/30 rounded-xl p-4 mb-6">
            <p className="text-white font-bold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Your Cart ({cart.length} items)
            </p>
            <div className="space-y-2">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-900/50 rounded-lg p-2">
                  <span className="text-white text-sm">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 text-sm font-bold">${item.price}</span>
                    <button
                      onClick={() => removeFromCart(i)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {groceryItems.map(item => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-gray-800/50 border border-green-500/30 hover:bg-gray-700/50 rounded-xl p-4 text-left transition-all"
            >
              <p className="text-white font-bold text-sm">{item.name}</p>
              <p className="text-green-400 font-bold text-lg mt-1">${item.price}</p>
              <div className="text-xs text-gray-400 mt-2">
                {item.hunger && <p>• Hunger -{item.hunger}%</p>}
                {item.stress && <p>• Stress {item.stress}%</p>}
                {item.energy && <p>• Energy +{item.energy}%</p>}
              </div>
            </button>
          ))}
        </div>

        {getTotal() > money && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">Can't afford this cart</p>
            </div>
          </div>
        )}

        {/* Checkout */}
        <button
          onClick={checkout}
          disabled={cart.length === 0 || getTotal() > money}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Checkout (${getTotal()})
        </button>
      </motion.div>
    </motion.div>
  );
}