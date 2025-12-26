import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, ShoppingBag, Moon, Trees } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const HERBS = [
  { name: 'Vervain', icon: '🌿', forage: true, buy: true, price: 15, locations: ['Woods', 'Graveyard'] },
  { name: 'Bay Leaves', icon: '🍃', forage: true, buy: true, price: 10, locations: ['Forest', 'Market'] },
  { name: 'Sage', icon: '🌱', forage: true, buy: true, price: 12, locations: ['Hills', 'Meadow'] },
  { name: 'Lavender', icon: '💜', forage: true, buy: true, price: 10, locations: ['Garden', 'Fields'] },
  { name: 'Rosemary', icon: '🌿', forage: true, buy: true, price: 10, locations: ['Garden', 'Woods'] },
  { name: 'Mugwort', icon: '🌾', forage: true, buy: true, price: 15, locations: ['Roadside', 'Woods'] },
  { name: 'Belladonna', icon: '☠️', forage: true, buy: true, price: 30, locations: ['Dark Forest', 'Abandoned Places'], dangerous: true },
  { name: 'Nightshade', icon: '🌑', forage: true, buy: true, price: 30, locations: ['Graveyard', 'Ruins'], dangerous: true },
  { name: 'Wormwood', icon: '🌿', forage: true, buy: true, price: 20, locations: ['Cemetery', 'Old Church'] },
  { name: 'Jasmine', icon: '🌸', forage: true, buy: true, price: 12, locations: ['Garden', 'Market'] },
  { name: 'Moonstone', icon: '🌙', forage: true, buy: true, price: 50, locations: ['River', 'Cave'], rare: true },
  { name: 'Obsidian', icon: '🖤', forage: false, buy: true, price: 40, rare: true },
  { name: 'Salt', icon: '🧂', forage: false, buy: true, price: 5 },
  { name: 'Iron Shavings', icon: '⚙️', forage: false, buy: true, price: 15 },
  { name: 'Bone Dust', icon: '💀', forage: true, buy: true, price: 35, locations: ['Graveyard', 'Catacombs'], dangerous: true },
  { name: 'Graveyard Dirt', icon: '⚰️', forage: true, buy: true, price: 20, locations: ['Cemetery'] },
  { name: 'White Candles', icon: '🕯️', forage: false, buy: true, price: 8 },
  { name: 'Black Candles', icon: '🖤', forage: false, buy: true, price: 10 },
  { name: 'Dragon\'s Blood Resin', icon: '🐉', forage: false, buy: true, price: 45, rare: true },
  { name: 'Frankincense', icon: '✨', forage: false, buy: true, price: 25 },
  { name: 'Myrrh', icon: '💎', forage: false, buy: true, price: 25 }
];

export default function HerbGathering({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('forage');
  const [gathering, setGathering] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: inventory = [] } = useQuery({
    queryKey: ['witchHerbs'],
    queryFn: () => base44.entities.WitchHerb.filter({ witch_id: witch.id })
  });

  const handleForage = async (herb) => {
    setGathering(true);
    const location = herb.locations[Math.floor(Math.random() * herb.locations.length)];
    
    setTimeout(async () => {
      const success = herb.dangerous ? Math.random() > 0.3 : Math.random() > 0.15;
      const amount = success ? Math.floor(Math.random() * 3) + 2 : 0;
      
      if (success) {
        const existing = inventory.find(i => i.herb_name === herb.name);
        if (existing) {
          await base44.entities.WitchHerb.update(existing.id, {
            quantity: existing.quantity + amount
          });
        } else {
          await base44.entities.WitchHerb.create({
            witch_id: witch.id,
            herb_name: herb.name,
            quantity: amount
          });
        }
        
        setOutcome(`Found ${amount} ${herb.name} at ${location}!`);
      } else {
        setOutcome(herb.dangerous 
          ? `Searched ${location} but it was too dangerous. Found nothing.`
          : `Searched ${location} but found no ${herb.name}.`
        );
      }
      
      await base44.entities.NightLog.create({
        entry: `${witch.name} foraged for ${herb.name} at ${location}. ${success ? `Found ${amount}.` : 'Found nothing.'}`,
        category: 'interaction',
        intensity: 'subtle'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setGathering(false);
        setOutcome('');
      }, 2500);
    }, 2500);
  };

  const handleBuy = async (herb) => {
    const existing = inventory.find(i => i.herb_name === herb.name);
    const amount = Math.floor(Math.random() * 3) + 3;
    
    if (existing) {
      await base44.entities.WitchHerb.update(existing.id, {
        quantity: existing.quantity + amount
      });
    } else {
      await base44.entities.WitchHerb.create({
        witch_id: witch.id,
        herb_name: herb.name,
        quantity: amount
      });
    }
    
    await base44.entities.NightLog.create({
      entry: `${witch.name} bought ${amount} ${herb.name} for $${herb.price}.`,
      category: 'interaction',
      intensity: 'subtle'
    });
    
    queryClient.invalidateQueries();
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
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Herb Collection</h2>
        <p className="text-gray-400 text-sm mb-6">Gather or buy herbs for your spells</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('forage')}
            className={`flex-1 px-4 py-2 rounded-lg ${tab === 'forage' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <Trees className="w-4 h-4 inline mr-2" />
            Forage
          </button>
          <button
            onClick={() => setTab('buy')}
            className={`flex-1 px-4 py-2 rounded-lg ${tab === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Buy
          </button>
          <button
            onClick={() => setTab('inventory')}
            className={`flex-1 px-4 py-2 rounded-lg ${tab === 'inventory' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <Leaf className="w-4 h-4 inline mr-2" />
            Inventory
          </button>
        </div>

        {tab === 'forage' && !gathering && !outcome && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">
              Venture into the wild to gather herbs. Some locations are dangerous...
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {HERBS.filter(h => h.forage).map(herb => (
                <button
                  key={herb.name}
                  onClick={() => handleForage(herb)}
                  className={`bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all ${
                    herb.dangerous ? 'border border-red-500/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{herb.icon}</span>
                      <h3 className="text-white font-medium">{herb.name}</h3>
                    </div>
                    {herb.rare && <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">Rare</span>}
                    {herb.dangerous && <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">Risky</span>}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {herb.locations.join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'buy' && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">
              Purchase herbs from the occult shop
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {HERBS.map(herb => (
                <button
                  key={herb.name}
                  onClick={() => handleBuy(herb)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{herb.icon}</span>
                      <h3 className="text-white font-medium">{herb.name}</h3>
                    </div>
                    <span className="text-green-400 font-bold">${herb.price}</span>
                  </div>
                  {herb.rare && <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">Rare</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="space-y-3">
            {inventory.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No herbs collected yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {inventory.map(item => {
                  const herb = HERBS.find(h => h.name === item.herb_name);
                  return (
                    <div key={item.id} className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{herb?.icon || '🌿'}</span>
                          <div>
                            <h3 className="text-white font-medium">{item.herb_name}</h3>
                            <p className="text-gray-400 text-sm">×{item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {gathering && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🌿
            </motion.div>
            <p className="text-gray-300">Searching for herbs...</p>
          </div>
        )}

        {outcome && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl mb-4"
            >
              {gathering ? '🌿' : '✨'}
            </motion.div>
            <p className="text-gray-300 text-lg">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}