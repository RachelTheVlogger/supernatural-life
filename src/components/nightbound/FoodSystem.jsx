import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, UtensilsCrossed, Coffee, Apple, Cake, Wine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const GROCERY_ITEMS = [
  { name: 'Fresh Ingredients', icon: Apple, cost: 50, servings: 5 },
  { name: 'Gourmet Set', icon: UtensilsCrossed, cost: 120, servings: 10 },
  { name: 'Coffee & Pastries', icon: Coffee, cost: 30, servings: 3 },
  { name: 'Wine Collection', icon: Wine, cost: 200, servings: 8 },
  { name: 'Desserts', icon: Cake, cost: 60, servings: 4 }
];

const MEALS = [
  { name: 'Breakfast', servings: 1, icon: '🍳' },
  { name: 'Dinner', servings: 2, icon: '🍝' },
  { name: 'Romantic Dinner', servings: 3, icon: '🕯️' }
];

export default function FoodSystem({ servants, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('eat');
  const [ordering, setOrdering] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedServant, setSelectedServant] = useState(null);
  const [outcome, setOutcome] = useState('');

  const { data: inventory = [] } = useQuery({
    queryKey: ['foodInventory'],
    queryFn: () => base44.entities.Inventory.filter({ item_type: 'food' })
  });

  if (!servants || servants.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-white">No servants to cook with yet.</p>
          <button onClick={onClose} className="mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg">
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  const totalServings = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleOrder = async (item) => {
    setOrdering(true);

    setTimeout(async () => {
      const existing = inventory.find(i => i.item_name === item.name);
      
      if (existing) {
        await base44.entities.Inventory.update(existing.id, {
          quantity: (existing.quantity || 0) + item.servings
        });
      } else {
        await base44.entities.Inventory.create({
          item_name: item.name,
          item_type: 'food',
          quantity: item.servings
        });
      }

      await base44.entities.NightLog.create({
        entry: `Ordered ${item.name} online. ${item.servings} servings delivered.`,
        category: 'interaction',
        intensity: 'subtle'
      });

      queryClient.invalidateQueries();
      setOrdering(false);
    }, 2000);
  };

  const handleCook = async (meal, servant) => {
    if (totalServings < meal.servings) {
      alert('Not enough ingredients! Order groceries first.');
      return;
    }

    setCooking(true);
    setSelectedMeal(meal);
    setSelectedServant(servant);

    setTimeout(async () => {
      // Deduct servings
      let remaining = meal.servings;
      for (const item of inventory) {
        if (remaining <= 0) break;
        const deduct = Math.min(item.quantity, remaining);
        await base44.entities.Inventory.update(item.id, {
          quantity: item.quantity - deduct
        });
        remaining -= deduct;
      }

      const outcomes = {
        Breakfast: [
          `You made breakfast with ${servant.name}. Pancakes, coffee, morning light. They smiled. Perfect start.`,
          `Cooking together. ${servant.name} helped. You ate breakfast. Talked. Laughed. Simple happiness.`,
          `Breakfast for two. ${servant.name} said it tastes better when you make it.`
        ],
        Dinner: [
          `You cooked dinner with ${servant.name}. Wine. Good food. Better company.`,
          `Dinner together. ${servant.name} watched you cook. Kissed you while stirring. Almost burned it.`,
          `Homemade dinner. ${servant.name} said it's the best meal they've had. Not because of the food.`
        ],
        'Romantic Dinner': [
          `Candlelit dinner. You cooked together. Music. Wine. Kisses between courses. Perfect night.`,
          `Romantic dinner. ${servant.name} dressed up. You cooked their favorite. They said "I love you" over dessert.`,
          `Perfect evening. You made dinner together. Slow dancing in the kitchen. Food forgotten. Just you two.`
        ]
      };

      const result = outcomes[meal.name][Math.floor(Math.random() * outcomes[meal.name].length)];
      setOutcome(result);

      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + 10)
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setCooking(false);
        setSelectedMeal(null);
        setSelectedServant(null);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <UtensilsCrossed className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Food & Meals</h2>
            <p className="text-gray-400 text-sm">Vampires can eat too. Share meals together.</p>
          </div>
        </div>

        <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30 mb-6">
          <p className="text-white text-xl font-bold">{totalServings} servings</p>
          <p className="text-gray-400 text-xs">Available in pantry</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setTab('eat')} 
            className={`px-4 py-2 rounded-lg ${tab === 'eat' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Cook & Eat
          </button>
          <button 
            onClick={() => setTab('shop')} 
            className={`px-4 py-2 rounded-lg ${tab === 'shop' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Order Groceries
          </button>
        </div>

        {tab === 'eat' && !cooking && !outcome && (
          <div className="space-y-4">
            <h3 className="text-white font-bold">Cook a Meal</h3>
            {MEALS.map(meal => (
              <div key={meal.name} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{meal.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{meal.name}</h4>
                    <p className="text-gray-400 text-sm">Requires {meal.servings} servings</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {servants.map(servant => (
                    <button
                      key={servant.id}
                      onClick={() => handleCook(meal, servant)}
                      disabled={totalServings < meal.servings}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cook with {servant.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {cooking && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              👨‍🍳
            </motion.div>
            <p className="text-gray-300">Cooking {selectedMeal?.name} with {selectedServant?.name}...</p>
          </div>
        )}

        {outcome && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl mb-4"
            >
              🍽️
            </motion.div>
            <p className="text-gray-300 text-lg">{outcome}</p>
          </div>
        )}

        {tab === 'shop' && !ordering && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Order Online</h3>
            {GROCERY_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleOrder(item)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-green-400" />
                      <div>
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{item.servings} servings</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">${item.cost}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {ordering && (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🛒
            </motion.div>
            <p className="text-gray-300">Ordering groceries...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}