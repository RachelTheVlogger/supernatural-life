import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, DollarSign, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MERCH_OPTIONS = [
  { type: 'poster', name: 'Signed Poster', emoji: '🖼️', price: 20, cost: 5 },
  { type: 'tshirt', name: 'Custom T-Shirt', emoji: '👕', price: 30, cost: 10 },
  { type: 'mug', name: 'Coffee Mug', emoji: '☕', price: 15, cost: 5 },
  { type: 'sticker', name: 'Sticker Pack', emoji: '✨', price: 5, cost: 1 },
  { type: 'calendar', name: 'Wall Calendar', emoji: '📅', price: 25, cost: 8 },
  { type: 'polaroid', name: 'Polaroid Set', emoji: '📸', price: 40, cost: 10 },
  { type: 'underwear', name: 'Worn Underwear', emoji: '👙', price: 100, cost: 0 },
  { type: 'custom', name: 'Custom Item', emoji: '💎', price: 200, cost: 20 }
];

export default function OnlyFangsMerch({ servant, profile, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: merch = [] } = useQuery({
    queryKey: ['merch', servant.id],
    queryFn: () => base44.entities.MerchItem.filter({ servant_id: servant.id })
  });

  const handleCreate = async (merchOption) => {
    setCreating(true);

    setTimeout(async () => {
      const item = await base44.entities.MerchItem.create({
        servant_id: servant.id,
        item_name: merchOption.name,
        item_type: merchOption.type,
        price: merchOption.price,
        sales: 0,
        revenue: 0
      });

      // Immediate sales
      const initialSales = Math.floor(profile.subscriber_count * (Math.random() * 0.15 + 0.05));
      const revenue = initialSales * merchOption.price;

      await base44.entities.MerchItem.update(item.id, {
        sales: initialSales,
        revenue: revenue
      });

      await base44.entities.OnlyFangsProfile.update(profile.id, {
        revenue: profile.revenue + revenue
      });

      await base44.entities.NightLog.create({
        entry: `Launched ${merchOption.name}. Sold ${initialSales} units. Earned $${revenue}.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setCreating(false);
    }, 2000);
  };

  const totalMerchRevenue = merch.reduce((sum, m) => sum + (m.revenue || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Merch Store</h2>
        <p className="text-gray-400 text-sm mb-4">Total Revenue: ${totalMerchRevenue}</p>

        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {MERCH_OPTIONS.map(option => {
            const existing = merch.find(m => m.item_type === option.type);
            return (
              <button
                key={option.type}
                onClick={() => !existing && handleCreate(option)}
                disabled={existing || creating}
                className={`bg-gray-800 rounded-xl p-4 text-left transition-colors ${
                  existing ? 'opacity-50' : 'hover:bg-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">{option.emoji}</div>
                <h3 className="text-white font-medium mb-1">{option.name}</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-400">${option.price}</span>
                  {existing && <span className="text-purple-400">{existing.sales} sold</span>}
                </div>
              </button>
            );
          })}
        </div>

        {merch.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Current Merch
            </h3>
            <div className="space-y-2">
              {merch.map(item => {
                const option = MERCH_OPTIONS.find(o => o.type === item.item_type);
                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{option?.emoji} {item.item_name}</span>
                    <div className="text-right">
                      <p className="text-white">{item.sales} sold</p>
                      <p className="text-green-400">${item.revenue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}