import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, DollarSign, ShoppingCart, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const JEWELRY_ITEMS = [
  { name: 'Moon Phase Necklace', materials: { silver: 2, moonstone: 1, chain: 1 }, basePrice: 45 },
  { name: 'Raven Skull Ring', materials: { silver: 3, onyx: 1 }, basePrice: 55 },
  { name: 'Gothic Cross Pendant', materials: { silver: 2, chain: 1 }, basePrice: 40 },
  { name: 'Blood Moon Earrings', materials: { silver: 1, garnet: 2, wire: 1 }, basePrice: 35 },
  { name: 'Obsidian Choker', materials: { obsidian: 3, chain: 2 }, basePrice: 60 },
  { name: 'Vampire Bite Necklace', materials: { silver: 2, garnet: 1, chain: 1 }, basePrice: 50 },
  { name: 'Thorn Ring', materials: { silver: 2, onyx: 1 }, basePrice: 42 },
  { name: 'Crescent Bracelet', materials: { silver: 3, moonstone: 1, chain: 1 }, basePrice: 48 }
];

const MATERIAL_NAMES = {
  silver: 'Silver',
  moonstone: 'Moonstone',
  onyx: 'Onyx',
  obsidian: 'Obsidian',
  garnet: 'Garnet',
  amethyst: 'Amethyst',
  chain: 'Chain',
  wire: 'Wire'
};

export default function BusinessManagement({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [crafting, setCrafting] = useState(false);

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory', servant.id],
    queryFn: () => base44.entities.Inventory.filter({ servant_id: servant.id })
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', servant.id],
    queryFn: () => base44.entities.BusinessOrder.filter({ servant_id: servant.id })
  });

  const getInventoryAmount = (material) => {
    const item = inventory.find(i => i.material === material);
    return item?.quantity || 0;
  };

  const canCraft = (item) => {
    return Object.entries(item.materials).every(
      ([material, needed]) => getInventoryAmount(material) >= needed
    );
  };

  const handleCraft = async (item) => {
    if (!canCraft(item)) return;
    
    setCrafting(true);
    
    // Deduct materials
    for (const [material, amount] of Object.entries(item.materials)) {
      const invItem = inventory.find(i => i.material === material);
      if (invItem) {
        await base44.entities.Inventory.update(invItem.id, {
          quantity: invItem.quantity - amount
        });
      }
    }

    // Create order
    const price = customPrice ? parseInt(customPrice) : item.basePrice;
    const customerNames = ['Luna Shadow', 'Raven Night', 'Ash Darkwell', 'Salem Moon', 'Echo Void'];
    const messages = [
      'This is exactly what I was looking for!',
      'Can you make it extra dark?',
      'I love your work, been following for months',
      'Perfect for my collection',
      'Adding this to my altar'
    ];

    await base44.entities.BusinessOrder.create({
      servant_id: servant.id,
      customer_name: customerNames[Math.floor(Math.random() * customerNames.length)],
      item: item.name,
      price: price,
      status: 'crafting',
      message: messages[Math.floor(Math.random() * messages.length)]
    });

    await base44.entities.NightLog.create({
      entry: `Crafted ${item.name}. New order ready to ship.`,
      category: 'activity',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries(['inventory']);
    queryClient.invalidateQueries(['orders']);
    
    setTimeout(() => {
      setCrafting(false);
      setSelectedItem(null);
      setCustomPrice('');
    }, 2000);
  };

  const handleBuyMaterials = async () => {
    // Buy random materials
    const materials = ['silver', 'moonstone', 'onyx', 'obsidian', 'garnet', 'amethyst', 'chain', 'wire'];
    const toBuy = materials[Math.floor(Math.random() * materials.length)];
    const amount = Math.floor(Math.random() * 3) + 2;

    const existing = inventory.find(i => i.material === toBuy);
    if (existing) {
      await base44.entities.Inventory.update(existing.id, {
        quantity: existing.quantity + amount
      });
    } else {
      await base44.entities.Inventory.create({
        servant_id: servant.id,
        material: toBuy,
        quantity: amount
      });
    }

    queryClient.invalidateQueries(['inventory']);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'crafting');

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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Gothic Jewelry Business
        </h2>

        {/* Inventory Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-medium">Inventory</h3>
            <button
              onClick={handleBuyMaterials}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Buy Materials
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(MATERIAL_NAMES).map(([key, name]) => (
              <div key={key} className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">{name}</p>
                <p className="text-white text-lg font-bold">{getInventoryAmount(key)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Pending Orders ({pendingOrders.length})</h3>
            <div className="space-y-2">
              {pendingOrders.map(order => (
                <div key={order.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm">{order.item}</p>
                    <p className="text-gray-400 text-xs">{order.customer_name}</p>
                  </div>
                  <span className="text-purple-400">${order.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Craftable Items */}
        <div>
          <h3 className="text-white font-medium mb-3">Craft New Jewelry</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {JEWELRY_ITEMS.map((item) => {
              const craftable = canCraft(item);
              return (
                <div
                  key={item.name}
                  className={`bg-gray-800 rounded-xl p-4 ${craftable ? 'border-2 border-purple-500/30' : 'opacity-60'}`}
                >
                  <h4 className="text-white font-medium mb-2">{item.name}</h4>
                  <div className="text-gray-400 text-xs mb-2">
                    {Object.entries(item.materials).map(([material, amount]) => (
                      <span key={material} className="mr-2">
                        {MATERIAL_NAMES[material]}: {amount}
                        <span className={getInventoryAmount(material) >= amount ? 'text-green-400' : 'text-red-400'}>
                          {' '}({getInventoryAmount(material)})
                        </span>
                      </span>
                    ))}
                  </div>
                  <p className="text-purple-400 text-sm mb-3">Base: ${item.basePrice}</p>
                  
                  {selectedItem === item.name ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder={`Custom price (default: $${item.basePrice})`}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCraft(item)}
                          disabled={crafting}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {crafting ? 'Crafting...' : 'Craft'}
                        </button>
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedItem(item.name)}
                      disabled={!craftable}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {craftable ? 'Select' : 'Not enough materials'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}