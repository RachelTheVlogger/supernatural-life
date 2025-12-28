import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, ShoppingCart, Palette, TrendingUp, Package } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const WHOLESALE_BRANDS = [
  { id: 'huizi', name: 'HUIZI', pricePerSet: 2.5, minOrder: 10, desc: 'Leading manufacturer, 5000+ designs' },
  { id: 'colorstreet', name: 'Color Street', pricePerSet: 3.5, minOrder: 5, desc: '100% real nail polish strips' },
  { id: 'lilyfox', name: 'Lily & Fox', pricePerSet: 3.0, minOrder: 8, desc: '1000+ colors and patterns' },
  { id: 'generic', name: 'Generic Stock', pricePerSet: 1.5, minOrder: 20, desc: 'Budget-friendly designs' }
];

const DESIGN_CATEGORIES = [
  { id: 'gothic', name: 'Gothic/Dark', trending: true },
  { id: 'floral', name: 'Floral', trending: false },
  { id: 'abstract', name: 'Abstract Art', trending: true },
  { id: 'seasonal', name: 'Seasonal', trending: false },
  { id: 'glitter', name: 'Glitter/Sparkle', trending: true },
  { id: 'marble', name: 'Marble', trending: false },
  { id: 'animal', name: 'Animal Print', trending: false },
  { id: 'custom', name: 'Custom Design', trending: true }
];

export default function NailWrapsCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('shop'); // shop, design, sell, orders
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [orderingFrom, setOrderingFrom] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(10);

  const { data: career = [] } = useQuery({
    queryKey: ['career', servant.id],
    queryFn: () => base44.entities.ServantCareer.filter({ servant_id: servant.id })
  });

  const servantCareer = career[0];
  const reputation = servantCareer?.nail_wrap_reputation || 0;
  const customers = servantCareer?.nail_wrap_customers || 0;
  const revenue = servantCareer?.nail_wrap_revenue || 0;
  const inventory = servantCareer?.nail_wrap_inventory || {};
  const customDesigns = servantCareer?.nail_wrap_custom_designs || [];
  const socialFollowers = servantCareer?.nail_wrap_followers || 0;

  const totalInventory = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);

  const handleOrderStock = async (brand) => {
    if (orderQuantity < brand.minOrder) {
      setOutcome(`Minimum order is ${brand.minOrder} sets!`);
      setTimeout(() => setOutcome(''), 2000);
      return;
    }

    const totalCost = brand.pricePerSet * orderQuantity;
    
    setWorking(true);
    setTimeout(async () => {
      const newInventory = { ...inventory };
      const brandKey = `${brand.id}_stock`;
      newInventory[brandKey] = (newInventory[brandKey] || 0) + orderQuantity;

      const updates = {
        nail_wrap_inventory: newInventory,
        nail_wrap_revenue: (revenue || 0) - totalCost
      };

      if (servantCareer) {
        await base44.entities.ServantCareer.update(servantCareer.id, updates);
      } else {
        await base44.entities.ServantCareer.create({
          servant_id: servant.id,
          nail_wraps_active: true,
          ...updates
        });
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} ordered ${orderQuantity} sets from ${brand.name}. Invested $${totalCost.toFixed(2)}.`,
        category: 'interaction',
        intensity: 'subtle'
      });

      setOutcome(`Ordered ${orderQuantity} sets from ${brand.name}!\n\nCost: $${totalCost.toFixed(2)}\nDelivery: 2-3 days`);
      queryClient.invalidateQueries();
      setOrderingFrom(null);

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3000);
    }, 1500);
  };

  const handleCreateDesign = async (category) => {
    setWorking(true);

    setTimeout(async () => {
      const designNames = {
        gothic: ['Blood Moon', 'Coffin Nails', 'Vampire Bite', 'Cemetery Roses'],
        floral: ['Cherry Blossom', 'Wild Roses', 'Lavender Dreams', 'Sunflower Fields'],
        abstract: ['Chaos Theory', 'Cosmic Waves', 'Neon Burst', 'Paint Splatter'],
        seasonal: ['Autumn Leaves', 'Winter Frost', 'Spring Bloom', 'Summer Vibes'],
        glitter: ['Diamond Dust', 'Rose Gold Shimmer', 'Holographic Dreams', 'Galaxy Sparkle'],
        marble: ['Black Marble', 'Rose Quartz', 'Jade Stone', 'Gold Veins'],
        animal: ['Leopard Print', 'Snake Skin', 'Tiger Stripes', 'Zebra Pattern'],
        custom: ['Personalized', 'Photo Print', 'Name Custom', 'Event Special']
      };

      const randomName = designNames[category.id][Math.floor(Math.random() * designNames[category.id].length)];
      const designCost = category.id === 'custom' ? 50 : 25;
      const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100

      const newDesign = {
        id: Date.now().toString(),
        name: randomName,
        category: category.id,
        quality: qualityScore,
        created: new Date().toISOString(),
        sales: 0,
        pricePoint: category.trending ? 15 : 12
      };

      const newDesigns = [...customDesigns, newDesign];

      const updates = {
        nail_wrap_custom_designs: newDesigns,
        nail_wrap_revenue: (revenue || 0) - designCost,
        nail_wrap_reputation: Math.min(100, reputation + Math.floor(qualityScore / 10))
      };

      if (servantCareer) {
        await base44.entities.ServantCareer.update(servantCareer.id, updates);
      } else {
        await base44.entities.ServantCareer.create({
          servant_id: servant.id,
          nail_wraps_active: true,
          ...updates
        });
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} designed "${randomName}" nail wraps. Quality: ${qualityScore}/100`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Created "${randomName}"!\n\nQuality: ${qualityScore}/100\n${category.trending ? '🔥 Trending category!' : ''}\nDesign cost: $${designCost}`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3500);
    }, 3000);
  };

  const handleMarketOnSocial = async () => {
    setWorking(true);

    setTimeout(async () => {
      const engagement = Math.random() > 0.4 ? 'high' : 'low';
      const newFollowers = engagement === 'high' ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 20) + 5;
      const repGain = engagement === 'high' ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 4) + 1;

      const outcomes = {
        high: [
          `Your reel went viral! ${newFollowers} new followers. Comments flooding in.`,
          `That design photo hit the algorithm PERFECTLY. ${newFollowers} followers gained!`,
          `Your story got shared by a nail art page! ${newFollowers} new potential customers.`,
          `People are tagging friends. "${newFollowers} followers. Your DMs are exploding."`
        ],
        low: [
          `Decent reach. ${newFollowers} new followers. Keep posting consistently.`,
          `Some engagement. ${newFollowers} followers. Try trending sounds next time.`,
          `Post did okay. ${newFollowers} followers joined. Algorithm is tough today.`
        ]
      };

      const result = outcomes[engagement][Math.floor(Math.random() * outcomes[engagement].length)];

      const updates = {
        nail_wrap_followers: (socialFollowers || 0) + newFollowers,
        nail_wrap_reputation: Math.min(100, reputation + repGain)
      };

      if (servantCareer) {
        await base44.entities.ServantCareer.update(servantCareer.id, updates);
      }

      setOutcome(`${result}\n\n+${newFollowers} followers\n+${repGain} reputation`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3500);
    }, 2000);
  };

  const handleProcessOrders = async () => {
    if (totalInventory === 0 && customDesigns.length === 0) {
      setOutcome('You need inventory or custom designs to sell!');
      setTimeout(() => setOutcome(''), 2000);
      return;
    }

    setWorking(true);

    setTimeout(async () => {
      const orderCount = Math.min(Math.floor(socialFollowers / 20) + Math.floor(reputation / 10) + Math.floor(Math.random() * 5) + 1, 10);
      let totalSales = 0;
      let itemsSold = 0;

      // Sell from inventory or custom designs
      const newInventory = { ...inventory };
      let soldCustom = false;

      for (let i = 0; i < orderCount; i++) {
        // 60% chance to sell custom if available, 40% stock
        if (customDesigns.length > 0 && Math.random() > 0.4) {
          const design = customDesigns[Math.floor(Math.random() * customDesigns.length)];
          totalSales += design.pricePoint;
          soldCustom = true;
        } else {
          // Sell from stock
          const inventoryKeys = Object.keys(newInventory).filter(k => newInventory[k] > 0);
          if (inventoryKeys.length > 0) {
            const randomKey = inventoryKeys[Math.floor(Math.random() * inventoryKeys.length)];
            newInventory[randomKey]--;
            totalSales += Math.floor(Math.random() * 5) + 10; // $10-15
            itemsSold++;
          }
        }
      }

      const updates = {
        nail_wrap_inventory: newInventory,
        nail_wrap_customers: customers + orderCount,
        nail_wrap_revenue: revenue + totalSales,
        nail_wrap_reputation: Math.min(100, reputation + Math.floor(orderCount / 2))
      };

      if (servantCareer) {
        await base44.entities.ServantCareer.update(servantCareer.id, updates);
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} processed ${orderCount} nail wrap orders. Revenue: $${totalSales.toFixed(2)}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Processed ${orderCount} orders!\n\nRevenue: $${totalSales.toFixed(2)}\n${soldCustom ? '✨ Custom designs sold!' : ''}\nInventory used: ${itemsSold} sets`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3500);
    }, 2500);
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
        className="bg-gradient-to-br from-pink-950 to-purple-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-pink-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">💅 Nail Wraps Business</h2>
        <p className="text-pink-300 text-sm mb-6">Design, source, and sell nail wraps online</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <div className="bg-black/40 rounded-lg p-2 border border-pink-500/30">
            <p className="text-pink-400 text-xs">Reputation</p>
            <p className="text-white font-bold text-sm">{reputation}/100</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-pink-500/30">
            <p className="text-pink-400 text-xs">Followers</p>
            <p className="text-white font-bold text-sm">{socialFollowers}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-pink-500/30">
            <p className="text-pink-400 text-xs">Inventory</p>
            <p className="text-white font-bold text-sm">{totalInventory} sets</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-pink-500/30">
            <p className="text-pink-400 text-xs">Revenue</p>
            <p className="text-white font-bold text-sm">${revenue?.toFixed(0) || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'shop', label: 'Order Stock', icon: ShoppingCart },
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'sell', label: 'Marketing', icon: TrendingUp },
            { id: 'orders', label: 'Process Orders', icon: Package }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-black/30 text-pink-300 hover:bg-black/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {outcome ? (
          <div className="bg-black/40 rounded-xl p-6 border border-pink-500/30">
            <p className="text-pink-100 leading-relaxed whitespace-pre-line">{outcome}</p>
          </div>
        ) : working ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-pink-400 mx-auto" />
            </motion.div>
            <p className="text-pink-300 mt-4">Working...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'shop' && (
              <div>
                <h3 className="text-white font-bold mb-3">Wholesale Suppliers</h3>
                <p className="text-pink-300 text-sm mb-4">Order nail wrap stock from brands</p>
                <div className="space-y-3">
                  {WHOLESALE_BRANDS.map(brand => (
                    <div key={brand.id} className="bg-pink-900/40 border border-pink-500/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">{brand.name}</h4>
                          <p className="text-gray-400 text-sm">{brand.desc}</p>
                        </div>
                        <span className="text-green-400 font-bold">${brand.pricePerSet}/set</span>
                      </div>
                      <p className="text-pink-400 text-xs mb-3">Min order: {brand.minOrder} sets</p>
                      {orderingFrom === brand.id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            min={brand.minOrder}
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(parseInt(e.target.value) || brand.minOrder)}
                            className="w-full bg-black/40 border border-pink-500/30 rounded-lg px-3 py-2 text-white"
                            placeholder="Quantity"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOrderStock(brand)}
                              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg transition-colors"
                            >
                              Confirm (${(brand.pricePerSet * orderQuantity).toFixed(2)})
                            </button>
                            <button
                              onClick={() => setOrderingFrom(null)}
                              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setOrderingFrom(brand.id);
                            setOrderQuantity(brand.minOrder);
                          }}
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg transition-colors"
                        >
                          Order Stock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div>
                <h3 className="text-white font-bold mb-3">Create Custom Designs</h3>
                <p className="text-pink-300 text-sm mb-4">Design your own nail wraps to sell ($25-50 design cost)</p>
                <div className="grid grid-cols-2 gap-2">
                  {DESIGN_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCreateDesign(cat)}
                      className="bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-xl p-4 text-left transition-colors relative"
                    >
                      {cat.trending && (
                        <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded">
                          🔥 Trending
                        </span>
                      )}
                      <h4 className="text-white font-medium mb-1">{cat.name}</h4>
                      <p className="text-pink-400 text-xs">Create design</p>
                    </button>
                  ))}
                </div>
                {customDesigns.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-bold mb-3">Your Designs ({customDesigns.length})</h4>
                    <div className="space-y-2">
                      {customDesigns.slice(-5).reverse().map(design => (
                        <div key={design.id} className="bg-black/30 border border-pink-500/20 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{design.name}</p>
                              <p className="text-gray-400 text-xs capitalize">{design.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-pink-400 font-bold">${design.pricePoint}</p>
                              <p className="text-gray-500 text-xs">Quality: {design.quality}/100</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sell' && (
              <div>
                <h3 className="text-white font-bold mb-3">Social Media Marketing</h3>
                <p className="text-pink-300 text-sm mb-4">Build your following and attract customers</p>
                <button
                  onClick={handleMarketOnSocial}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-4 rounded-xl transition-colors mb-4"
                >
                  <h4 className="font-bold">📱 Post on Social Media</h4>
                  <p className="text-sm opacity-90">Instagram, TikTok, Facebook</p>
                </button>
                <div className="bg-black/30 border border-pink-500/20 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-3">Marketing Tips</h4>
                  <ul className="space-y-2 text-pink-300 text-sm">
                    <li>• Use trending sounds and hashtags</li>
                    <li>• Post nail application videos</li>
                    <li>• Share customer reviews and photos</li>
                    <li>• Collaborate with nail influencers</li>
                    <li>• Run giveaways to boost engagement</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-white font-bold mb-3">Process Online Orders</h3>
                <p className="text-pink-300 text-sm mb-4">Fulfill customer orders from your shop</p>
                <button
                  onClick={handleProcessOrders}
                  disabled={totalInventory === 0 && customDesigns.length === 0}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:opacity-50 text-white py-4 rounded-xl transition-colors mb-4"
                >
                  <h4 className="font-bold">📦 Process Orders</h4>
                  <p className="text-sm opacity-90">Ship out nail wraps</p>
                </button>
                <div className="bg-black/30 border border-pink-500/20 rounded-xl p-4">
                  <p className="text-pink-300 text-sm">
                    Orders based on: Social followers, reputation, and inventory availability
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Higher followers + reputation = more orders
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}