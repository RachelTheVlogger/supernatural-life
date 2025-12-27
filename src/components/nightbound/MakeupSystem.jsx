import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShoppingBag, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MakeupSystem({ human, onClose, context = 'everyday' }) {
  const [activeTab, setActiveTab] = useState('apply');
  const [currentLook, setCurrentLook] = useState({
    foundation: null,
    eyeshadow: null,
    eyeliner: null,
    mascara: null,
    lipstick: null,
    blush: null,
    highlighter: null
  });
  const [inventory, setInventory] = useState([]);
  const [money, setMoney] = useState(500);
  const queryClient = useQueryClient();

  const makeupProducts = {
    foundation: [
      { id: 'f1', name: 'Light Coverage', price: 20, quality: 1, vibe: 'natural' },
      { id: 'f2', name: 'Full Coverage', price: 35, quality: 2, vibe: 'flawless' },
      { id: 'f3', name: 'HD Airbrush', price: 60, quality: 3, vibe: 'glamorous' }
    ],
    eyeshadow: [
      { id: 'e1', name: 'Nude Palette', price: 25, quality: 1, vibe: 'subtle' },
      { id: 'e2', name: 'Smokey Eye', price: 40, quality: 2, vibe: 'dramatic' },
      { id: 'e3', name: 'Glitter Bomb', price: 50, quality: 3, vibe: 'bold' },
      { id: 'e4', name: 'Dark Gothic', price: 45, quality: 3, vibe: 'dark' }
    ],
    eyeliner: [
      { id: 'l1', name: 'Basic Black', price: 15, quality: 1, vibe: 'classic' },
      { id: 'l2', name: 'Wing Perfection', price: 30, quality: 2, vibe: 'sharp' },
      { id: 'l3', name: 'Dramatic Wing', price: 40, quality: 3, vibe: 'fierce' }
    ],
    mascara: [
      { id: 'm1', name: 'Volumizing', price: 20, quality: 1, vibe: 'natural' },
      { id: 'm2', name: 'Length + Volume', price: 35, quality: 2, vibe: 'enhanced' },
      { id: 'm3', name: 'False Lash Effect', price: 50, quality: 3, vibe: 'dramatic' }
    ],
    lipstick: [
      { id: 'p1', name: 'Nude Pink', price: 15, quality: 1, vibe: 'natural' },
      { id: 'p2', name: 'Bold Red', price: 25, quality: 2, vibe: 'confident' },
      { id: 'p3', name: 'Deep Burgundy', price: 30, quality: 2, vibe: 'sultry' },
      { id: 'p4', name: 'Black Velvet', price: 35, quality: 3, vibe: 'gothic' },
      { id: 'p5', name: 'Liquid Matte Red', price: 40, quality: 3, vibe: 'bold' },
      { id: 'p6', name: 'Dark Purple', price: 38, quality: 3, vibe: 'dramatic' }
    ],
    blush: [
      { id: 'b1', name: 'Soft Pink', price: 18, quality: 1, vibe: 'natural' },
      { id: 'b2', name: 'Peachy Glow', price: 28, quality: 2, vibe: 'warm' },
      { id: 'b3', name: 'Deep Rose', price: 35, quality: 3, vibe: 'flushed' }
    ],
    highlighter: [
      { id: 'h1', name: 'Subtle Glow', price: 22, quality: 1, vibe: 'natural' },
      { id: 'h2', name: 'Champagne Shimmer', price: 40, quality: 2, vibe: 'radiant' },
      { id: 'h3', name: 'Blinding Highlight', price: 55, quality: 3, vibe: 'goddess' }
    ]
  };

  const presetLooks = {
    everyday: { name: 'Everyday Natural', bonus: 10, description: 'Simple and fresh' },
    date: { name: 'Date Night', bonus: 20, description: 'Romantic and alluring' },
    escort: { name: 'Professional Glam', bonus: 35, description: 'Polished and seductive' },
    club: { name: 'Club Makeup', bonus: 25, description: 'Bold and dramatic' },
    gothic: { name: 'Gothic Dark', bonus: 30, description: 'Dark and mysterious' },
    full_glam: { name: 'Full Glam', bonus: 40, description: 'Maximum impact' }
  };

  const buyProduct = (product) => {
    if (money < product.price) {
      alert('Not enough money!');
      return;
    }
    setMoney(prev => prev - product.price);
    setInventory([...inventory, product]);
  };

  const applyMakeup = async () => {
    const totalQuality = Object.values(currentLook).reduce((sum, item) => sum + (item?.quality || 0), 0);
    const lookBonus = presetLooks[context]?.bonus || 10;
    const finalBonus = totalQuality * 5 + lookBonus;

    let resultText = '';
    let obsessionGain = 0;
    let awarenessGain = 0;

    if (context === 'escort') {
      resultText = `You did your makeup for escort work.\n\n${currentLook.lipstick ? `Applied ${currentLook.lipstick.name}.` : ''}\n${currentLook.eyeshadow ? `${currentLook.eyeshadow.name} on your eyes.` : ''}\n${currentLook.highlighter ? `${currentLook.highlighter.name} catching the light.` : ''}\n\nYou look irresistible.\n\n+${finalBonus}% attractiveness to clients`;
      obsessionGain = 5;
    } else if (context === 'date') {
      resultText = `You spent an hour on your makeup.\n\nPerfect ${currentLook.lipstick?.name || 'lips'}. Flawless ${currentLook.eyeshadow?.name || 'eyes'}.\n\nYou look stunning. Dangerous.\n\n${human.romance_with_vampire ? 'They won\'t be able to resist.' : 'Ready to turn heads.'}`;
      obsessionGain = 8;
      awarenessGain = 3;
    } else if (context === 'gothic') {
      resultText = `Dark ${currentLook.lipstick?.name || 'lips'}. Dramatic ${currentLook.eyeshadow?.name || 'eyes'}.\n\nYou look like you belong to the night.\n\n${human.romance_with_vampire ? `${human.romance_with_vampire} would approve.` : 'Embracing the darkness.'}`;
      obsessionGain = 10;
      awarenessGain = 5;
    } else {
      resultText = `You did your makeup.\n\n${currentLook.lipstick ? currentLook.lipstick.name : 'Natural lips'}. ${currentLook.eyeshadow ? currentLook.eyeshadow.name : 'Clean eyes'}.\n\nYou feel confident.`;
      obsessionGain = 2;
    }

    await base44.entities.NightLog.create({
      entry: `${human.name} did their makeup (${context}): ${resultText}`,
      category: 'interaction',
      intensity: 'subtle'
    });

    if (obsessionGain > 0) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.min(100, (human.obsession_level || 0) + obsessionGain),
        awareness_level: Math.min(100, (human.awareness_level || 0) + awarenessGain)
      });
    }

    queryClient.invalidateQueries();
    alert(resultText);
  };

  const totalSpent = inventory.reduce((sum, item) => sum + item.price, 0);

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
        className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-pink-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Makeup</h2>
              <p className="text-gray-400 text-sm capitalize">{context} look</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Money display */}
        <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-3 mb-6">
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <p className="text-white font-bold">${money}</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 ${activeTab === 'apply' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Apply
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 ${activeTab === 'shop' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Shop
          </button>
        </div>

        {activeTab === 'apply' ? (
          <div className="space-y-4">
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">💄 Current Look</h3>
              <p className="text-gray-300 text-sm mb-3">Build your {context} makeup</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(currentLook).map(([type, item]) => (
                  <div key={type} className="bg-gray-900/50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs capitalize">{type}</p>
                    <p className="text-white font-medium text-xs">
                      {item ? item.name : 'None'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {Object.entries(makeupProducts).map(([category, products]) => {
              const owned = products.filter(p => inventory.find(i => i.id === p.id));
              if (owned.length === 0) return null;
              
              return (
                <div key={category}>
                  <h4 className="text-white font-bold text-sm mb-2 capitalize">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {owned.map(product => (
                      <button
                        key={product.id}
                        onClick={() => setCurrentLook({ ...currentLook, [category]: product })}
                        className={`text-left p-3 rounded-lg text-sm ${
                          currentLook[category]?.id === product.id
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs opacity-70">{product.vibe}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {inventory.length === 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                <p className="text-gray-400">No makeup products yet</p>
                <p className="text-gray-500 text-sm mt-1">Visit the shop to buy some</p>
              </div>
            )}

            {inventory.length > 0 && (
              <button
                onClick={applyMakeup}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
              >
                ✨ Apply Makeup
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(makeupProducts).map(([category, products]) => (
              <div key={category}>
                <h4 className="text-white font-bold mb-2 capitalize">💄 {category}</h4>
                <div className="space-y-2">
                  {products.map(product => {
                    const owned = inventory.find(i => i.id === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`rounded-lg p-3 border ${
                          owned ? 'bg-green-950/40 border-green-500/30' : 'bg-gray-800/50 border-pink-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{product.name}</p>
                            <p className="text-gray-400 text-xs capitalize">{product.vibe}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-sm">${product.price}</p>
                            <p className="text-yellow-400 text-xs">★ {product.quality}</p>
                          </div>
                        </div>
                        {owned ? (
                          <p className="text-green-400 text-xs">✓ Owned</p>
                        ) : (
                          <button
                            onClick={() => buyProduct(product)}
                            disabled={money < product.price}
                            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded-lg text-xs font-bold mt-2"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
              <p className="text-gray-300 text-sm text-center">
                Total spent: ${totalSpent}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}