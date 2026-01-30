import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Skull, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MARKET_ITEMS = [
  { name: 'Cursed Dagger', type: 'weapon', price: 500, desc: 'Wounds never heal', rarity: 'rare' },
  { name: 'Soul Gem', type: 'artifact', price: 1000, desc: 'Contains trapped soul', rarity: 'legendary' },
  { name: 'Forbidden Grimoire', type: 'forbidden_knowledge', price: 800, desc: 'Dark magic secrets', rarity: 'rare' },
  { name: 'Vampire Blood Vial', type: 'potion', price: 300, desc: 'Temporary vampire powers', rarity: 'uncommon' },
  { name: 'Memory Eraser', type: 'spell', price: 600, desc: 'Erase specific memories', rarity: 'rare' },
  { name: 'Phoenix Feather', type: 'artifact', price: 2000, desc: 'Resurrect once', rarity: 'mythical', cursed: false }
];

export default function BlackMarketSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [buying, setBuying] = useState(null);

  const { data: marketItems = [] } = useQuery({
    queryKey: ['blackMarketItems'],
    queryFn: async () => {
      const existing = await base44.entities.BlackMarketItem.list();
      if (existing.length === 0) {
        // Initialize market
        await Promise.all(MARKET_ITEMS.map(item => 
          base44.entities.BlackMarketItem.create({
            item_name: item.name,
            item_type: item.type,
            description: item.desc,
            price: item.price,
            rarity: item.rarity,
            seller: 'Shadow Merchant',
            is_cursed: item.cursed !== false ? Math.random() > 0.7 : false,
            available: true
          })
        ));
        return await base44.entities.BlackMarketItem.list();
      }
      return existing;
    }
  });

  const handleBuy = async (item) => {
    const souls = await base44.entities.Soul.filter({ current_owner: vampireState.id });
    const totalValue = souls.reduce((sum, s) => sum + (s.market_value || 0), 0);

    if (totalValue < item.price) {
      alert(`Need ${item.price} soul value. You have ${totalValue}`);
      return;
    }

    setBuying(item.id);

    // Use souls to pay
    let remaining = item.price;
    for (const soul of souls) {
      if (remaining <= 0) break;
      await base44.entities.Soul.delete(soul.id);
      remaining -= soul.market_value;
    }

    await base44.entities.Inventory.create({
      item_name: item.item_name,
      item_type: item.item_type,
      quantity: 1,
      description: item.description
    });

    await base44.entities.BlackMarketItem.update(item.id, { available: false });

    await base44.entities.NightLog.create({
      entry: `Purchased ${item.item_name} from black market. ${item.is_cursed ? 'It feels... wrong.' : 'Power acquired.'}`,
      category: 'business',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setBuying(null);
  };

  const getRarityColor = (rarity) => {
    return {
      common: 'gray',
      uncommon: 'green',
      rare: 'blue',
      legendary: 'purple',
      mythical: 'yellow'
    }[rarity] || 'gray';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🌑 Black Market</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">Trade souls for forbidden items</p>

        <div className="space-y-3">
          {marketItems.filter(i => i.available).map(item => {
            const color = getRarityColor(item.rarity);
            return (
              <div key={item.id} className={`bg-${color}-950/30 border border-${color}-500/30 rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-bold">{item.item_name}</p>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                    <p className={`text-${color}-400 text-xs mt-1 capitalize`}>{item.rarity}</p>
                    {item.is_cursed && <p className="text-red-400 text-xs">⚠️ Cursed</p>}
                  </div>
                  <p className="text-yellow-400 font-bold">{item.price}</p>
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={buying === item.id}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded disabled:opacity-50"
                >
                  {buying === item.id ? 'Purchasing...' : 'Buy with Souls'}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}