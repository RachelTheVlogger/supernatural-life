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
  const [selectedHerbToSell, setSelectedHerbToSell] = useState(null);
  const [sellAmount, setSellAmount] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [blendName, setBlendName] = useState('');
  const [mixing, setMixing] = useState(false);

  const { data: inventory = [] } = useQuery({
    queryKey: ['witchHerbs'],
    queryFn: () => base44.entities.WitchHerb.filter({ witch_id: witch.id })
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['herbCustomers'],
    queryFn: () => base44.entities.HerbCustomer.filter({ witch_id: witch.id })
  });

  const { data: blends = [] } = useQuery({
    queryKey: ['herbBlends'],
    queryFn: () => base44.entities.HerbBlend.filter({ witch_id: witch.id })
  });

  const handleForage = async (herb) => {
    setGathering(true);
    const location = herb.locations[Math.floor(Math.random() * herb.locations.length)];
    
    setTimeout(async () => {
      const success = herb.dangerous ? Math.random() > 0.2 : Math.random() > 0.1;
      const amount = success ? Math.floor(Math.random() * 4) + 3 : 0;
      
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
    const amount = Math.floor(Math.random() * 3) + 3;
    
    if (!confirm(`Buy ${amount} ${herb.name} for $${herb.price}?`)) {
      return;
    }

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
    
    await base44.entities.NightLog.create({
      entry: `${witch.name} bought ${amount} ${herb.name} for $${herb.price}.`,
      category: 'interaction',
      intensity: 'subtle'
    });
    
    queryClient.invalidateQueries();
  };

  const handleSellHerb = async (herb) => {
    const herbData = HERBS.find(h => h.name === herb.herb_name);
    const sellPrice = Math.floor(herbData.price * 2.5);
    const amountToSell = Math.min(sellAmount, herb.quantity);
    
    await base44.entities.WitchHerb.update(herb.id, {
      quantity: herb.quantity - amountToSell
    });

    // Maybe generate customer
    if (customers.length < 5 && Math.random() > 0.6) {
      const types = ['witch', 'hippie', 'spiritual', 'healer', 'occultist'];
      const names = ['Luna', 'Sage', 'Crystal', 'Raven', 'Ash', 'Ivy', 'Willow'];
      await base44.entities.HerbCustomer.create({
        witch_id: witch.id,
        customer_name: names[Math.floor(Math.random() * names.length)],
        customer_type: types[Math.floor(Math.random() * types.length)],
        favorite_herb: herb.herb_name,
        loyalty: 50,
        total_spent: sellPrice * amountToSell
      });
    }

    await base44.entities.NightLog.create({
      entry: `${witch.name} sold ${amountToSell} ${herb.herb_name} for $${sellPrice * amountToSell}.`,
      category: 'interaction',
      intensity: 'subtle'
    });

    queryClient.invalidateQueries();
    setSelectedHerbToSell(null);
    setSellAmount(1);
  };

  const handleConsumeHerb = async (herb) => {
    const herbData = HERBS.find(h => h.name === herb.herb_name);
    
    await base44.entities.WitchHerb.update(herb.id, {
      quantity: herb.quantity - 1
    });

    let effect = '';
    let powerGain = 0;

    if (['Vervain', 'Sage', 'Lavender'].includes(herb.herb_name)) {
      effect = 'You feel cleansed and protected.';
      powerGain = 5;
    } else if (['Belladonna', 'Nightshade', 'Wormwood'].includes(herb.herb_name)) {
      effect = 'Dark power surges through you. Intoxicating.';
      powerGain = 15;
    } else if (['Mugwort', 'Jasmine'].includes(herb.herb_name)) {
      effect = 'Your mind expands. Visions dance at the edges.';
      powerGain = 8;
    } else if (herb.herb_name === 'Moonstone') {
      effect = 'Lunar energy fills you. You feel the pull of the moon.';
      powerGain = 20;
    } else {
      effect = 'You absorbed the herb\'s essence.';
      powerGain = 3;
    }

    await base44.entities.Witch.update(witch.id, {
      power_level: Math.min((witch.power_level || 80) + powerGain, 100)
    });

    await base44.entities.NightLog.create({
      entry: `${witch.name} consumed ${herb.herb_name}. ${effect}`,
      category: 'power',
      intensity: 'moderate'
    });

    setOutcome(effect);
    queryClient.invalidateQueries();

    setTimeout(() => setOutcome(''), 2500);
  };

  const toggleIngredient = (herbName) => {
    if (selectedIngredients.includes(herbName)) {
      setSelectedIngredients(selectedIngredients.filter(h => h !== herbName));
    } else {
      setSelectedIngredients([...selectedIngredients, herbName]);
    }
  };

  const generateBlendEffect = (ingredients) => {
    const effects = [];
    const darkHerbs = ['Belladonna', 'Nightshade', 'Wormwood', 'Bone Dust'];
    const lightHerbs = ['Sage', 'Lavender', 'Vervain', 'White Candles'];
    const psychicHerbs = ['Mugwort', 'Jasmine', 'Moonstone'];
    const elementalHerbs = ['Bay Leaves', 'Rosemary', 'Dragon\'s Blood Resin'];

    const darkCount = ingredients.filter(h => darkHerbs.includes(h)).length;
    const lightCount = ingredients.filter(h => lightHerbs.includes(h)).length;
    const psychicCount = ingredients.filter(h => psychicHerbs.includes(h)).length;
    const elementalCount = ingredients.filter(h => elementalHerbs.includes(h)).length;

    if (darkCount >= 2) effects.push('Dark power surge');
    if (lightCount >= 2) effects.push('Protective aura');
    if (psychicCount >= 2) effects.push('Mind expansion');
    if (elementalCount >= 2) effects.push('Elemental mastery');
    if (darkCount && lightCount) effects.push('Chaotic balance');
    if (ingredients.length >= 5) effects.push('Overwhelming potency');

    const potency = Math.min(10, ingredients.length + darkCount * 2);
    const basePrice = ingredients.length * 50 + potency * 30;

    return {
      effect: effects.length > 0 ? effects.join(', ') : 'Mild herbal effect',
      potency,
      price: basePrice
    };
  };

  const handleMixBlend = async () => {
    if (selectedIngredients.length < 2 || !blendName.trim()) return;

    setMixing(true);

    // Consume herbs
    for (const herbName of selectedIngredients) {
      const herb = inventory.find(h => h.herb_name === herbName);
      if (herb && herb.quantity > 0) {
        await base44.entities.WitchHerb.update(herb.id, {
          quantity: herb.quantity - 1
        });
      }
    }

    const { effect, potency, price } = generateBlendEffect(selectedIngredients);

    await base44.entities.HerbBlend.create({
      witch_id: witch.id,
      blend_name: blendName.trim(),
      ingredients: selectedIngredients,
      effect,
      potency,
      quantity: 1,
      market_price: price
    });

    await base44.entities.NightLog.create({
      entry: `${witch.name} created a new blend: ${blendName}. ${effect}.`,
      category: 'interaction',
      intensity: 'significant'
    });

    setOutcome(`Created ${blendName}! ${effect}`);
    setSelectedIngredients([]);
    setBlendName('');
    queryClient.invalidateQueries();

    setTimeout(() => {
      setMixing(false);
      setOutcome('');
    }, 3000);
  };

  const handleTestBlend = async (blend) => {
    await base44.entities.HerbBlend.update(blend.id, {
      quantity: Math.max(0, blend.quantity - 1)
    });

    await base44.entities.Witch.update(witch.id, {
      power_level: Math.min((witch.power_level || 80) + blend.potency * 3, 100)
    });

    setOutcome(`Consumed ${blend.blend_name}. ${blend.effect}. Power ↑${blend.potency * 3}`);

    await base44.entities.NightLog.create({
      entry: `${witch.name} tested ${blend.blend_name}. ${blend.effect}.`,
      category: 'power',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setTimeout(() => setOutcome(''), 3000);
  };

  const handleSellBlend = async (blend) => {
    await base44.entities.HerbBlend.update(blend.id, {
      quantity: Math.max(0, blend.quantity - 1)
    });

    await base44.entities.NightLog.create({
      entry: `${witch.name} sold ${blend.blend_name} for $${blend.market_price}.`,
      category: 'interaction',
      intensity: 'subtle'
    });

    setOutcome(`Sold ${blend.blend_name} for $${blend.market_price}!`);
    queryClient.invalidateQueries();
    setTimeout(() => setOutcome(''), 2500);
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

        <div className="flex gap-2 mb-6 flex-wrap">
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
          <button
            onClick={() => setTab('sell')}
            className={`flex-1 px-4 py-2 rounded-lg ${tab === 'sell' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            💰 Sell
          </button>
          <button
            onClick={() => setTab('mix')}
            className={`flex-1 px-4 py-2 rounded-lg ${tab === 'mix' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🧪 Mix
          </button>
          <button
            onClick={() => setTab('blends')}
            className={`flex-1 px-4 py-2 rounded-lg ${tab === 'blends' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            ✨ Blends
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
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{herb?.icon || '🌿'}</span>
                          <div>
                            <h3 className="text-white font-medium">{item.herb_name}</h3>
                            <p className="text-gray-400 text-sm">×{item.quantity}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConsumeHerb(item)}
                        disabled={item.quantity < 1}
                        className="w-full bg-purple-900/50 hover:bg-purple-900/70 text-purple-300 px-3 py-1.5 rounded text-sm disabled:opacity-50"
                      >
                        Consume (boost power)
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'sell' && !selectedHerbToSell && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">
              Sell herbs to other witches, healers, and spiritual seekers
            </p>
            {inventory.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No herbs to sell</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {inventory.filter(h => h.quantity > 0).map(item => {
                  const herb = HERBS.find(h => h.name === item.herb_name);
                  const sellPrice = Math.floor(herb.price * 2.5);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedHerbToSell(item)}
                      className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{herb?.icon || '🌿'}</span>
                          <div>
                            <h3 className="text-white font-medium">{item.herb_name}</h3>
                            <p className="text-gray-400 text-xs">×{item.quantity} available</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-bold">${sellPrice}</span>
                      </div>
                      <p className="text-gray-500 text-xs">per unit</p>
                    </button>
                  );
                })}
              </div>
            )}
            {customers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-white font-medium mb-3">Regular Customers</h3>
                <div className="space-y-2">
                  {customers.map(c => (
                    <div key={c.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white text-sm">{c.customer_name}</p>
                        <p className="text-gray-400 text-xs capitalize">{c.customer_type} • Loves {c.favorite_herb}</p>
                      </div>
                      <p className="text-green-400 text-xs">${c.total_spent} spent</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedHerbToSell && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedHerbToSell(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Back
            </button>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">Sell {selectedHerbToSell.herb_name}</h3>
              <p className="text-gray-400 text-sm mb-4">Available: {selectedHerbToSell.quantity}</p>
              
              <label className="text-white text-sm block mb-2">Amount to sell:</label>
              <input
                type="number"
                min="1"
                max={selectedHerbToSell.quantity}
                value={sellAmount}
                onChange={(e) => setSellAmount(Math.min(parseInt(e.target.value) || 1, selectedHerbToSell.quantity))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4"
              />

              <p className="text-green-400 text-xl font-bold mb-4">
                Total: ${Math.floor(HERBS.find(h => h.name === selectedHerbToSell.herb_name).price * 2.5) * sellAmount}
              </p>

              <button
                onClick={() => handleSellHerb(selectedHerbToSell)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                Sell
              </button>
            </div>
          </div>
        )}

        {tab === 'mix' && !mixing && !outcome && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Combine herbs to create powerful custom blends. Experiment with different combinations!
            </p>

            <div>
              <label className="text-white font-medium mb-2 block">Blend Name:</label>
              <input
                type="text"
                value={blendName}
                onChange={(e) => setBlendName(e.target.value)}
                placeholder="e.g., Moonlit Elixir"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Select Ingredients ({selectedIngredients.length} selected):
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {inventory.filter(h => h.quantity > 0).map(herb => {
                  const herbData = HERBS.find(h => h.name === herb.herb_name);
                  const isSelected = selectedIngredients.includes(herb.herb_name);
                  return (
                    <button
                      key={herb.id}
                      onClick={() => toggleIngredient(herb.herb_name)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'bg-purple-600 border-purple-400' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl block mb-1">{herbData?.icon || '🌿'}</span>
                        <p className="text-white text-xs">{herb.herb_name}</p>
                        <p className="text-gray-400 text-xs">×{herb.quantity}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedIngredients.length >= 2 && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-purple-300 font-medium mb-2">Predicted Effects:</h3>
                <p className="text-gray-300 text-sm">{generateBlendEffect(selectedIngredients).effect}</p>
                <p className="text-purple-400 text-sm mt-2">Potency: {generateBlendEffect(selectedIngredients).potency}/10</p>
                <p className="text-green-400 text-sm">Market Value: ${generateBlendEffect(selectedIngredients).price}</p>
              </div>
            )}

            <button
              onClick={handleMixBlend}
              disabled={selectedIngredients.length < 2 || !blendName.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium"
            >
              Mix Blend
            </button>
          </div>
        )}

        {tab === 'blends' && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">
              Your custom herbal creations
            </p>
            {blends.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No blends created yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {blends.map(blend => (
                  <div key={blend.id} className="bg-gray-800 rounded-xl p-4 border-2 border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold">{blend.blend_name}</h3>
                      <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                        {blend.potency}/10
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{blend.effect}</p>
                    <p className="text-gray-500 text-xs mb-3">
                      🌿 {blend.ingredients.join(', ')}
                    </p>
                    <p className="text-gray-400 text-sm mb-3">Quantity: {blend.quantity}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestBlend(blend)}
                        disabled={blend.quantity < 1}
                        className="flex-1 bg-purple-900/50 hover:bg-purple-900/70 text-purple-300 px-3 py-2 rounded text-sm disabled:opacity-50"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleSellBlend(blend)}
                        disabled={blend.quantity < 1}
                        className="flex-1 bg-green-900/50 hover:bg-green-900/70 text-green-300 px-3 py-2 rounded text-sm disabled:opacity-50"
                      >
                        Sell ${blend.market_price}
                      </button>
                    </div>
                  </div>
                ))}
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