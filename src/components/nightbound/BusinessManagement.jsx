import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShoppingCart, Star, TrendingUp, Zap, Package, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const JEWELRY_DESIGNS = {
  common: [
    { name: 'Simple Moon Pendant', materials: { silver: 2, moonstone: 1 }, basePrice: 25, time: 3000 },
    { name: 'Raven Charm', materials: { silver: 1, onyx: 1 }, basePrice: 20, time: 2500 },
    { name: 'Thorn Ring', materials: { silver: 2, chain: 1 }, basePrice: 22, time: 2500 }
  ],
  uncommon: [
    { name: 'Crescent Moon Choker', materials: { silver: 3, moonstone: 2, velvet: 1 }, basePrice: 45, time: 4000 },
    { name: 'Blood Drop Earrings', materials: { silver: 2, garnet: 2, chain: 1 }, basePrice: 50, time: 4000 },
    { name: 'Shadow Raven Necklace', materials: { silver: 3, onyx: 2, feather: 1 }, basePrice: 48, time: 4500 }
  ],
  rare: [
    { name: 'Vampire Kiss Choker', materials: { gold: 2, ruby: 2, velvet: 2, chain: 2 }, basePrice: 120, time: 6000 },
    { name: 'Lunar Eclipse Pendant', materials: { silver: 4, moonstone: 3, obsidian: 2, crystal: 1 }, basePrice: 110, time: 5500 },
    { name: 'Bone & Thorn Crown', materials: { silver: 3, bone: 3, amethyst: 2 }, basePrice: 125, time: 6000 }
  ],
  legendary: [
    { name: 'Eternal Night Collar', materials: { platinum: 3, bloodstone: 3, ruby: 2, velvet: 3, chain: 2 }, basePrice: 300, time: 9000 },
    { name: 'Deathless Beauty Ring', materials: { platinum: 2, sapphire: 3, moonstone: 3, crystal: 2 }, basePrice: 280, time: 8500 },
    { name: 'Immortal Devotion Set', materials: { gold: 4, ruby: 3, amethyst: 3, bone: 2, leather: 2 }, basePrice: 350, time: 10000 }
  ]
};

const MATERIAL_INFO = {
  silver: { name: 'Silver', cost: 10, icon: '🪙' },
  gold: { name: 'Gold', cost: 25, icon: '💰' },
  platinum: { name: 'Platinum', cost: 50, icon: '💎' },
  moonstone: { name: 'Moonstone', cost: 15, icon: '🌙' },
  onyx: { name: 'Onyx', cost: 12, icon: '⚫' },
  obsidian: { name: 'Obsidian', cost: 18, icon: '🖤' },
  garnet: { name: 'Garnet', cost: 20, icon: '🔴' },
  amethyst: { name: 'Amethyst', cost: 22, icon: '💜' },
  ruby: { name: 'Ruby', cost: 40, icon: '❤️' },
  sapphire: { name: 'Sapphire', cost: 45, icon: '💙' },
  bloodstone: { name: 'Bloodstone', cost: 60, icon: '🩸' },
  chain: { name: 'Chain', cost: 8, icon: '⛓️' },
  wire: { name: 'Wire', cost: 5, icon: '〰️' },
  leather: { name: 'Leather', cost: 12, icon: '🟤' },
  velvet: { name: 'Velvet', cost: 15, icon: '🎀' },
  bone: { name: 'Bone', cost: 30, icon: '🦴' },
  feather: { name: 'Feather', cost: 10, icon: '🪶' },
  crystal: { name: 'Crystal', cost: 35, icon: '💠' }
};

const WORKSHOP_UPGRADES = {
  quality_tools: { name: 'Quality Tools', icon: '🔨', maxLevel: 3, baseCost: 200, description: 'Increase item quality and price' },
  speed_bench: { name: 'Speed Bench', icon: '⚡', maxLevel: 3, baseCost: 250, description: 'Reduce crafting time by 25% per level' },
  rare_materials: { name: 'Rare Material Access', icon: '💎', maxLevel: 3, baseCost: 300, description: 'Unlock rare material orders' },
  display_case: { name: 'Display Case', icon: '✨', maxLevel: 3, baseCost: 180, description: 'Increase reputation gain by 20% per level' },
  marketing: { name: 'Marketing', icon: '📢', maxLevel: 3, baseCost: 220, description: 'Generate more orders automatically' }
};

const RARITY_COLORS = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  legendary: 'text-purple-400'
};

export default function BusinessManagement({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('orders');
  const [crafting, setCrafting] = useState(null);
  const [buying, setBuying] = useState(null);
  const [collectingPassive, setCollectingPassive] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(null);
  const [shippingOrder, setShippingOrder] = useState(null);

  const handleQuit = async () => {
    if (!confirm(`Quit the jewelry business? You can always start again later.`)) return;
    
    const career = await base44.entities.ServantCareer.filter({ servant_id: servant.id });
    if (career[0]) {
      await base44.entities.ServantCareer.update(career[0].id, {
        jewelry_business_active: false
      });
    }
    
    await base44.entities.NightLog.create({
      entry: `${servant.name} decided to close the jewelry business. Time for something new.`,
      category: 'interaction',
      intensity: 'subtle'
    });
    
    queryClient.invalidateQueries();
    onClose();
  };

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory', servant.id],
    queryFn: () => base44.entities.Inventory.filter({ servant_id: servant.id })
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', servant.id],
    queryFn: () => base44.entities.BusinessOrder.filter({ servant_id: servant.id }, '-created_date')
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', servant.id],
    queryFn: () => base44.entities.Review.filter({ servant_id: servant.id })
  });

  const { data: upgrades = [] } = useQuery({
    queryKey: ['upgrades', servant.id],
    queryFn: () => base44.entities.WorkshopUpgrade.filter({ servant_id: servant.id })
  });

  const { data: stats = [] } = useQuery({
    queryKey: ['stats', servant.id],
    queryFn: async () => {
      const existing = await base44.entities.BusinessStats.filter({ servant_id: servant.id });
      if (existing.length === 0) {
        const newStats = await base44.entities.BusinessStats.create({
          servant_id: servant.id,
          reputation: 50,
          total_sales: 0,
          revenue: 0,
          average_rating: 0,
          passive_income_rate: 0,
          last_passive_collection: new Date().toISOString()
        });
        return [newStats];
      }
      return existing;
    }
  });

  const [lastSeenOrderCount, setLastSeenOrderCount] = React.useState(orders.length);
  const [lastSeenReviewCount, setLastSeenReviewCount] = React.useState(reviews.length);
  
  React.useEffect(() => {
    if (orders.length > lastSeenOrderCount) {
      setLastSeenOrderCount(orders.length);
    }
  }, [orders.length]);
  
  React.useEffect(() => {
    if (reviews.length > lastSeenReviewCount) {
      setLastSeenReviewCount(reviews.length);
    }
  }, [reviews.length]);

  const businessStats = stats[0] || { reputation: 50, total_sales: 0, revenue: 0, average_rating: 0, passive_income_rate: 0 };

  // Auto-generate orders and starting inventory
  React.useEffect(() => {
    const initInventory = async () => {
      if (inventory.length === 0) {
        // Give starting materials
        const startingMaterials = ['silver', 'moonstone', 'onyx', 'chain', 'wire', 'garnet', 'amethyst'];
        for (const mat of startingMaterials) {
          await base44.entities.Inventory.create({
            servant_id: servant.id,
            material: mat,
            quantity: 20
          });
        }
        queryClient.invalidateQueries(['inventory']);
      }
    };
    
    const generateOrder = async () => {
      if (orders.length < 3) {
        const rarities = ['common', 'common', 'uncommon'];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];
        const designs = JEWELRY_DESIGNS[rarity];
        const design = designs[Math.floor(Math.random() * designs.length)];
        
        const names = ['Luna', 'Raven', 'Ash', 'Salem', 'Morticia', 'Wednesday', 'Elvira', 'Lilith'];
        const customerName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
        
        await base44.entities.BusinessOrder.create({
          servant_id: servant.id,
          customer_name: customerName,
          item: design.name,
          rarity: rarity,
          price: design.basePrice,
          crafting_time: design.time,
          status: 'pending',
          message: 'Looking forward to receiving this!'
        });
        
        queryClient.invalidateQueries(['orders']);
      }
    };
    
    initInventory();
    const interval = setInterval(generateOrder, 45000);
    if (orders.length === 0) generateOrder();
    
    return () => clearInterval(interval);
  }, [orders.length, inventory.length]);

  // Calculate passive income
  const calculatePassiveIncome = () => {
    if (!businessStats.last_passive_collection) return 0;
    const hoursPassed = (Date.now() - new Date(businessStats.last_passive_collection).getTime()) / (1000 * 60 * 60);
    return Math.floor(hoursPassed * businessStats.passive_income_rate);
  };

  const passiveIncome = calculatePassiveIncome();

  const handleCollectPassive = async () => {
    if (passiveIncome === 0) return;
    setCollectingPassive(true);
    
    setTimeout(async () => {
      await base44.entities.BusinessStats.update(businessStats.id, {
        revenue: businessStats.revenue + passiveIncome,
        last_passive_collection: new Date().toISOString()
      });
      
      await base44.entities.NightLog.create({
        entry: `${servant.name}'s business earned $${passiveIncome} while you were away.`,
        category: 'interaction',
        intensity: 'subtle'
      });
      
      queryClient.invalidateQueries(['stats']);
      queryClient.invalidateQueries(['logs']);
      setCollectingPassive(false);
    }, 1500);
  };

  const getUpgradeLevel = (type) => {
    const upgrade = upgrades.find(u => u.upgrade_type === type);
    return upgrade?.level || 0;
  };

  const canCraft = (design) => {
    return Object.entries(design.materials).every(([material, needed]) => {
      const inv = inventory.find(i => i.material === material);
      return inv && inv.quantity >= needed;
    });
  };

  const handleCraft = async (design, rarity, orderId) => {
    setCrafting(orderId);
    
    // Consume materials
    for (const [material, amount] of Object.entries(design.materials)) {
      const inv = inventory.find(i => i.material === material);
      if (inv) {
        await base44.entities.Inventory.update(inv.id, {
          quantity: inv.quantity - amount
        });
      }
    }

    // Apply speed upgrade
    const speedLevel = getUpgradeLevel('speed_bench');
    const craftTime = design.time * (1 - (speedLevel * 0.25));

    setTimeout(async () => {
      await base44.entities.BusinessOrder.update(orderId, {
        status: 'completed'
      });

      // Apply quality upgrade to price
      const qualityLevel = getUpgradeLevel('quality_tools');
      const priceBonus = 1 + (qualityLevel * 0.15);
      const finalPrice = Math.floor(design.basePrice * priceBonus);

      // Update stats
      const displayLevel = getUpgradeLevel('display_case');
      const repGain = Math.floor((5 + (rarity === 'legendary' ? 10 : rarity === 'rare' ? 5 : 0)) * (1 + displayLevel * 0.2));
      
      await base44.entities.BusinessStats.update(businessStats.id, {
        total_sales: businessStats.total_sales + 1,
        revenue: businessStats.revenue + finalPrice,
        reputation: Math.min(100, businessStats.reputation + repGain)
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} crafted ${design.name}. Sold for $${finalPrice}.`,
        category: 'interaction',
        intensity: 'subtle'
      });

      queryClient.invalidateQueries();
      setCrafting(null);
    }, craftTime);
  };

  const handleBuyMaterial = async (materialKey, amount) => {
    setBuying(materialKey);
    const material = MATERIAL_INFO[materialKey];
    
    setTimeout(async () => {
      const existing = inventory.find(i => i.material === materialKey);
      
      if (existing) {
        await base44.entities.Inventory.update(existing.id, {
          quantity: existing.quantity + amount
        });
      } else {
        await base44.entities.Inventory.create({
          servant_id: servant.id,
          material: materialKey,
          quantity: amount
        });
      }

      queryClient.invalidateQueries(['inventory']);
      setBuying(null);
    }, 1000);
  };

  const handlePurchaseUpgrade = async (upgradeType) => {
    const upgradeInfo = WORKSHOP_UPGRADES[upgradeType];
    const currentLevel = getUpgradeLevel(upgradeType);
    
    if (currentLevel >= upgradeInfo.maxLevel) return;
    
    const cost = upgradeInfo.baseCost * (currentLevel + 1);
    const existing = upgrades.find(u => u.upgrade_type === upgradeType);
    
    if (existing) {
      await base44.entities.WorkshopUpgrade.update(existing.id, {
        level: currentLevel + 1,
        cost: cost
      });
    } else {
      await base44.entities.WorkshopUpgrade.create({
        servant_id: servant.id,
        upgrade_type: upgradeType,
        level: 1,
        cost: cost
      });
    }

    // Marketing upgrade increases passive income
    if (upgradeType === 'marketing') {
      const newRate = businessStats.passive_income_rate + 10;
      await base44.entities.BusinessStats.update(businessStats.id, {
        passive_income_rate: newRate
      });
    }

    await base44.entities.NightLog.create({
      entry: `${servant.name} upgraded the workshop: ${upgradeInfo.name} Level ${currentLevel + 1}.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
  };

  const getInventory = (material) => {
    return inventory.find(i => i.material === material)?.quantity || 0;
  };

  const handleShipOrder = async (order, method = 'standard') => {
    const methods = {
      standard: { time: 0, bonus: 0, log: 'Standard shipping. 5-7 days.' },
      express: { time: 0, bonus: 5, log: 'Express shipping. Customer loves the speed!' },
      handDeliver: { time: 2000, bonus: 15, log: 'You delivered it personally. They were touched by the gesture.' }
    };
    
    const methodData = methods[method];
    
    if (method === 'handDeliver') {
      setShippingOrder(order.id);
      setTimeout(async () => {
        await base44.entities.BusinessOrder.update(order.id, { status: 'shipped' });
        
        if (methodData.bonus > 0) {
          const newRel = Math.min((servant.relationship || 0) + methodData.bonus, 100);
          await base44.entities.Servant.update(servant.id, { relationship: newRel });
        }
        
        await base44.entities.NightLog.create({
          entry: `${servant.name}: ${methodData.log}`,
          category: 'interaction',
          intensity: 'moderate'
        });
        
        queryClient.invalidateQueries();
        setShippingOrder(null);
      }, methodData.time);
    } else {
      await base44.entities.BusinessOrder.update(order.id, { status: 'shipped' });
      
      if (methodData.bonus > 0) {
        const newRel = Math.min((servant.relationship || 0) + methodData.bonus, 100);
        await base44.entities.Servant.update(servant.id, { relationship: newRel });
      }
      
      queryClient.invalidateQueries();
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const shippedOrders = orders.filter(o => o.status === 'shipped');

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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Gothic Jewelry Business</h2>
        <p className="text-gray-400 text-sm mb-6">Crafting darkness into beauty</p>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
            <p className="text-purple-400 text-xs">Reputation</p>
            <p className="text-white text-xl font-bold">{businessStats.reputation}/100</p>
          </div>
          <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
            <p className="text-green-400 text-xs">Total Sales</p>
            <p className="text-white text-xl font-bold">{businessStats.total_sales}</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <p className="text-blue-400 text-xs">Revenue</p>
            <p className="text-white text-xl font-bold">${businessStats.revenue}</p>
          </div>
          <div className="bg-yellow-950/30 rounded-lg p-3 border border-yellow-800/30">
            <p className="text-yellow-400 text-xs">Avg Rating</p>
            <p className="text-white text-xl font-bold">{businessStats.average_rating.toFixed(1)} ⭐</p>
          </div>
        </div>

        {/* Passive Income Collection */}
        {passiveIncome > 0 && (
          <motion.button
            onClick={handleCollectPassive}
            disabled={collectingPassive}
            className="w-full bg-gradient-to-r from-green-900/40 to-emerald-900/40 hover:from-green-900/60 hover:to-emerald-900/60 border-2 border-green-500/50 rounded-xl p-4 mb-6 transition-all disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Collect Passive Income</p>
                  <p className="text-gray-400 text-sm">${businessStats.passive_income_rate}/hour</p>
                </div>
              </div>
              <p className="text-green-400 text-2xl font-bold">+${passiveIncome}</p>
            </div>
          </motion.button>
        )}

        {/* Alerts */}
        {orders.length > lastSeenOrderCount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/40 border border-green-500/30 rounded-xl p-4 mb-4"
          >
            <p className="text-green-400 font-medium">🎉 New order received! Check the Orders tab.</p>
          </motion.div>
        )}
        
        {reviews.length > lastSeenReviewCount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-4 mb-4"
          >
            <p className="text-yellow-400 font-medium">⭐ New review received! Check the Reviews tab.</p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'craft', label: 'Craft', icon: Sparkles },
            { id: 'materials', label: 'Materials', icon: ShoppingCart },
            { id: 'upgrades', label: 'Upgrades', icon: Zap },
            { id: 'reviews', label: 'Reviews', icon: Star }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                if (id === 'orders') setLastSeenOrderCount(orders.length);
                if (id === 'reviews') setLastSeenReviewCount(reviews.length);
              }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap touch-manipulation flex items-center gap-2 relative ${
                tab === id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 active:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'orders' && orders.length > lastSeenOrderCount && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
              )}
              {id === 'reviews' && reviews.length > lastSeenReviewCount && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {tab === 'orders' && (
            <>
              <h3 className="text-white font-bold mb-3">Pending Orders ({pendingOrders.length})</h3>
              {pendingOrders.length === 0 && completedOrders.length === 0 && (
                <p className="text-gray-400 text-center py-8">No orders</p>
              )}
              
              {pendingOrders.length > 0 && pendingOrders.map(order => {
                  const designs = JEWELRY_DESIGNS[order.rarity] || [];
                  const design = designs.find(d => d.name === order.item);
                  if (!design) return null;
                  
                  const canMake = canCraft(design);
                  const isCrafting = crafting === order.id;
                  
                  return (
                    <div key={order.id} className="bg-gray-800 rounded-xl p-4 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className={`text-white font-medium ${RARITY_COLORS[order.rarity]}`}>
                            {order.item}
                          </h4>
                          <p className="text-gray-400 text-sm">{order.customer_name}</p>
                          <p className="text-gray-500 text-xs capitalize">{order.rarity} quality</p>
                        </div>
                        <p className="text-green-400 font-bold">${order.price}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {Object.entries(design.materials).map(([mat, amt]) => {
                          const have = getInventory(mat);
                          const hasEnough = have >= amt;
                          return (
                            <span key={mat} className={`text-xs px-2 py-1 rounded ${
                              hasEnough ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                            }`}>
                              {MATERIAL_INFO[mat]?.icon} {amt}/{have}
                            </span>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canMake && !isCrafting) {
                            handleCraft(design, order.rarity, order.id);
                          }
                        }}
                        disabled={!canMake || isCrafting}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg py-2 transition-colors disabled:opacity-50"
                      >
                        {isCrafting ? 'Crafting...' : canMake ? 'Craft Item' : 'Missing Materials'}
                      </button>
                    </div>
                  );
                })}
              
              {completedOrders.length > 0 && (
                <>
                  <h3 className="text-white font-bold mb-3 mt-6">Completed Orders ({completedOrders.length})</h3>
                  {completedOrders.map(order => (
                    <div key={order.id} className="bg-gray-800 rounded-xl p-4 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">{order.item}</h4>
                          <p className="text-gray-400 text-sm">{order.customer_name}</p>
                        </div>
                        <p className="text-green-400 font-bold">${order.price}</p>
                      </div>
                      
                      {showShippingOptions === order.id ? (
                        <div className="space-y-2 mt-3">
                          <button
                            onClick={() => {
                              handleShipOrder(order, 'standard');
                              setShowShippingOptions(null);
                            }}
                            className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm text-left touch-manipulation active:scale-95"
                          >
                            📦 Standard (5-7 days)
                          </button>
                          <button
                            onClick={() => {
                              handleShipOrder(order, 'express');
                              setShowShippingOptions(null);
                            }}
                            className="w-full bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded text-sm text-left touch-manipulation active:scale-95"
                          >
                            ⚡ Express (2-3 days) +5 relationship
                          </button>
                          <button
                            onClick={() => {
                              handleShipOrder(order, 'handDeliver');
                              setShowShippingOptions(null);
                            }}
                            className="w-full bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded text-sm text-left touch-manipulation active:scale-95"
                          >
                            🚶 Hand Deliver +15 relationship
                          </button>
                          <button
                            onClick={() => setShowShippingOptions(null)}
                            className="w-full bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-xs touch-manipulation active:scale-95"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowShippingOptions(order.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 mt-2 transition-colors touch-manipulation active:scale-95"
                        >
                          Ship Order
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}

              {shippedOrders.length > 0 && (
                <>
                  <h3 className="text-white font-bold mb-3 mt-6">Shipped Orders ({shippedOrders.length})</h3>
                  {shippedOrders.map(order => (
                    <div key={order.id} className="bg-gray-800/50 rounded-xl p-4 mb-3 border border-green-900/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium">{order.item}</h4>
                          <p className="text-gray-400 text-sm">{order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">${order.price}</p>
                          <p className="text-green-500 text-xs">✓ Shipped</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {tab === 'craft' && (
            <>
              {Object.entries(JEWELRY_DESIGNS).map(([rarity, designs]) => (
                <div key={rarity} className="mb-6">
                  <h3 className={`font-bold mb-3 capitalize ${RARITY_COLORS[rarity]}`}>{rarity} Designs</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {designs.map(design => {
                      const canMake = canCraft(design);
                      const isCrafting = crafting === design.name;
                      return (
                        <div key={design.name} className="bg-gray-800 rounded-xl p-4">
                          <h4 className={`font-medium mb-2 ${RARITY_COLORS[rarity]}`}>{design.name}</h4>
                          <p className="text-green-400 text-sm mb-2">${design.basePrice}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {Object.entries(design.materials).map(([mat, amt]) => {
                              const have = getInventory(mat);
                              const hasEnough = have >= amt;
                              return (
                                <span key={mat} className={`text-xs px-2 py-1 rounded ${
                                  hasEnough ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                                }`}>
                                  {MATERIAL_INFO[mat]?.icon} {amt}/{have}
                                </span>
                              );
                            })}
                          </div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!canMake || isCrafting) return;
                              
                              setCrafting(design.name);
                              
                              // Consume materials
                              for (const [material, amount] of Object.entries(design.materials)) {
                                const inv = inventory.find(i => i.material === material);
                                if (inv) {
                                  await base44.entities.Inventory.update(inv.id, {
                                    quantity: inv.quantity - amount
                                  });
                                }
                              }
                              
                              // Apply speed upgrade
                              const speedLevel = getUpgradeLevel('speed_bench');
                              const craftTime = design.time * (1 - (speedLevel * 0.25));
                              
                              setTimeout(async () => {
                                // Apply quality upgrade
                                const qualityLevel = getUpgradeLevel('quality_tools');
                                const priceBonus = 1 + (qualityLevel * 0.15);
                                const finalPrice = Math.floor(design.basePrice * priceBonus);
                                
                                // Add to inventory as finished piece (we can store it)
                                await base44.entities.NightLog.create({
                                  entry: `${servant.name} crafted ${design.name} for practice. Worth $${finalPrice}.`,
                                  category: 'interaction',
                                  intensity: 'subtle'
                                });
                                
                                const displayLevel = getUpgradeLevel('display_case');
                                const repGain = Math.floor(2 * (1 + displayLevel * 0.2));
                                
                                await base44.entities.BusinessStats.update(businessStats.id, {
                                  reputation: Math.min(100, businessStats.reputation + repGain)
                                });
                                
                                queryClient.invalidateQueries();
                                setCrafting(null);
                              }, craftTime);
                            }}
                            disabled={!canMake || isCrafting}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white text-sm rounded-lg py-2 transition-colors disabled:opacity-50"
                          >
                            {isCrafting ? 'Crafting...' : canMake ? 'Craft Now' : 'Missing Materials'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'materials' && (
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(MATERIAL_INFO).map(([key, info]) => {
                const current = getInventory(key);
                const isBuying = buying === key;
                
                return (
                  <div key={key} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{info.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-medium">{info.name}</h4>
                        <p className="text-gray-400 text-xs">${info.cost} each</p>
                      </div>
                    </div>
                    <p className="text-purple-400 text-sm mb-2">Stock: {current}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isBuying) handleBuyMaterial(key, 5);
                      }}
                      disabled={isBuying}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg py-2 transition-colors disabled:opacity-50"
                    >
                      {isBuying ? 'Buying...' : `Buy 5 ($${info.cost * 5})`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'upgrades' && (
            <div className="space-y-3">
              {Object.entries(WORKSHOP_UPGRADES).map(([key, upgrade]) => {
                const level = getUpgradeLevel(key);
                const cost = upgrade.baseCost * (level + 1);
                const maxed = level >= upgrade.maxLevel;
                
                return (
                  <div key={key} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{upgrade.icon}</span>
                        <div>
                          <h4 className="text-white font-medium">{upgrade.name}</h4>
                          <p className="text-gray-400 text-sm">{upgrade.description}</p>
                          <p className="text-purple-400 text-xs mt-1">Level {level}/{upgrade.maxLevel}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!maxed) handlePurchaseUpgrade(key);
                      }}
                      disabled={maxed}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg py-2 transition-colors disabled:opacity-50"
                    >
                      {maxed ? 'Max Level' : `Upgrade ($${cost})`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'reviews' && (
            <>
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reviews yet</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{review.customer_name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm italic">"{review.comment}"</p>
                  </div>
                ))
              )}
              
              <button
                onClick={handleQuit}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl py-3 transition-colors mt-4"
              >
                Quit Jewelry Business
              </button>
            </>
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {shippingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <p className="text-gray-300 text-lg">Delivering personally...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}