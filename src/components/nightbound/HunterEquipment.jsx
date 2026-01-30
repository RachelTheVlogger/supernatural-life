import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sword, Shield, Zap, ShoppingCart, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const EQUIPMENT_SHOP = {
  weapons: [
    { id: 'wooden_stake', name: 'Wooden Stake', power: 10, cost: 50, rarity: 'common', effects: [] },
    { id: 'silver_stake', name: 'Silver Stake', power: 25, cost: 200, rarity: 'uncommon', effects: ['vampiric_weakness'] },
    { id: 'crossbow', name: 'Crossbow', power: 15, cost: 100, rarity: 'common', effects: [] },
    { id: 'holy_crossbow', name: 'Holy Crossbow', power: 35, cost: 400, rarity: 'rare', effects: ['holy_damage'] },
    { id: 'uv_blade', name: 'UV Blade', power: 40, cost: 600, rarity: 'rare', effects: ['burn_vampires'] },
    { id: 'master_stake', name: 'Master\'s Stake', power: 60, cost: 1200, rarity: 'legendary', effects: ['vampiric_weakness', 'one_hit_fledgling'] }
  ],
  armor: [
    { id: 'leather_vest', name: 'Leather Vest', defense: 10, cost: 50, rarity: 'common', effects: [] },
    { id: 'kevlar_armor', name: 'Kevlar Armor', defense: 20, cost: 150, rarity: 'uncommon', effects: [] },
    { id: 'blessed_armor', name: 'Blessed Armor', defense: 35, cost: 400, rarity: 'rare', effects: ['vampire_resistance'] },
    { id: 'legendary_plate', name: 'Legendary Plate', defense: 50, cost: 1000, rarity: 'legendary', effects: ['vampire_resistance', 'regeneration'] }
  ],
  gadgets: [
    { id: 'uv_grenade', name: 'UV Grenade', power: 20, cost: 100, rarity: 'uncommon', effects: ['area_damage'] },
    { id: 'holy_water', name: 'Holy Water', power: 15, cost: 75, rarity: 'common', effects: ['burn'] },
    { id: 'tracker_device', name: 'Tracker Device', cost: 200, rarity: 'uncommon', effects: ['track_vampires'] },
    { id: 'night_goggles', name: 'Night Vision Goggles', cost: 150, rarity: 'uncommon', effects: ['night_vision'] }
  ]
};

const RARITY_COLORS = {
  common: 'gray',
  uncommon: 'green',
  rare: 'blue',
  legendary: 'purple'
};

export default function HunterEquipment({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState('inventory');
  const [crafting, setCrafting] = useState(false);

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment', hunter.id],
    queryFn: () => base44.entities.HunterEquipment.filter({ hunter_id: hunter.id })
  });

  const { data: safeHouse } = useQuery({
    queryKey: ['safeHouse', hunter.id],
    queryFn: async () => {
      const houses = await base44.entities.SafeHouse.filter({ hunter_id: hunter.id });
      return houses[0] || null;
    }
  });

  const handleBuyEquipment = async (item, category) => {
    if ((hunter.experience || 0) < item.cost) {
      alert(`Need ${item.cost} XP`);
      return;
    }

    const armoryLevel = safeHouse?.armory_level || 0;
    const requiredLevel = item.rarity === 'legendary' ? 4 : item.rarity === 'rare' ? 3 : item.rarity === 'uncommon' ? 2 : 0;
    
    if (armoryLevel < requiredLevel) {
      alert(`Need Armory Level ${requiredLevel}`);
      return;
    }

    setCrafting(true);
    try {
      await Promise.all([
        base44.entities.HunterEquipment.create({
          hunter_id: hunter.id,
          name: item.name,
          type: category,
          subtype: item.id,
          power: item.power || 0,
          defense: item.defense || 0,
          special_effects: item.effects,
          rarity: item.rarity
        }),
        base44.entities.Hunter.update(hunter.id, {
          experience: (hunter.experience || 0) - item.cost
        })
      ]);
      queryClient.invalidateQueries(['equipment']);
      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to buy:', e);
    }
    setCrafting(false);
  };

  const handleEquip = async (item) => {
    const updateKey = item.type === 'weapon' ? 'equipped_weapon' : 'equipped_armor';
    try {
      await base44.entities.Hunter.update(hunter.id, { [updateKey]: item.id });
      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to equip:', e);
    }
  };

  const handleMaintain = async (item) => {
    if (item.durability >= 100) {
      alert('Already at max durability');
      return;
    }

    setCrafting(true);
    try {
      await base44.entities.HunterEquipment.update(item.id, {
        durability: 100
      });
      await base44.entities.Hunter.update(hunter.id, {
        experience: (hunter.experience || 0) + 5
      });
      await base44.entities.NightLog.create({
        entry: `${hunter.name} maintained their ${item.name}. Restored to perfect condition. +5 XP`,
        category: 'training',
        intensity: 'mild'
      });
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to maintain:', e);
    }
    setCrafting(false);
  };

  const handlePractice = async (item) => {
    if (item.type !== 'weapon') {
      alert('Can only practice with weapons');
      return;
    }

    setCrafting(true);
    try {
      const xpGain = 10 + Math.floor(item.power / 10);
      await base44.entities.Hunter.update(hunter.id, {
        experience: (hunter.experience || 0) + xpGain,
        skill_level: Math.min(100, (hunter.skill_level || 50) + 1)
      });
      await base44.entities.HunterEquipment.update(item.id, {
        durability: Math.max(0, (item.durability || 100) - 5)
      });
      await base44.entities.NightLog.create({
        entry: `${hunter.name} practiced with their ${item.name}. Skills improving. +${xpGain} XP, +1 Skill`,
        category: 'training',
        intensity: 'moderate'
      });
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to practice:', e);
    }
    setCrafting(false);
  };

  const weapons = equipment.filter(e => e.type === 'weapon');
  const armor = equipment.filter(e => e.type === 'armor');
  const gadgets = equipment.filter(e => e.type === 'gadget');

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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Equipment</h2>
            <p className="text-gray-400">XP: {hunter.experience || 0}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('inventory')}
            className={`px-4 py-2 rounded-lg ${view === 'inventory' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Inventory
          </button>
          <button
            onClick={() => setView('shop')}
            className={`px-4 py-2 rounded-lg ${view === 'shop' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Shop
          </button>
        </div>

        {view === 'inventory' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Sword className="w-5 h-5" /> Weapons
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weapons.map(item => (
                  <div key={item.id} className={`bg-${RARITY_COLORS[item.rarity]}-950/50 border border-${RARITY_COLORS[item.rarity]}-500/50 rounded-lg p-4`}>
                    <p className="text-white font-bold mb-1">{item.name}</p>
                    <p className="text-gray-400 text-sm">Power: {item.power}</p>
                    <p className="text-gray-400 text-sm">Durability: {item.durability || 100}%</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleEquip(item)}
                        className={`py-1 rounded text-xs ${
                          hunter.equipped_weapon === item.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {hunter.equipped_weapon === item.id ? 'Equipped' : 'Equip'}
                      </button>
                      <button
                        onClick={() => handlePractice(item)}
                        disabled={crafting}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-xs disabled:opacity-50"
                      >
                        Practice
                      </button>
                    </div>
                    <button
                      onClick={() => handleMaintain(item)}
                      disabled={crafting || item.durability >= 100}
                      className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white py-1 rounded text-xs disabled:opacity-50"
                    >
                      Maintain
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Armor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {armor.map(item => (
                  <div key={item.id} className={`bg-${RARITY_COLORS[item.rarity]}-950/50 border border-${RARITY_COLORS[item.rarity]}-500/50 rounded-lg p-4`}>
                    <p className="text-white font-bold mb-1">{item.name}</p>
                    <p className="text-gray-400 text-sm">Defense: {item.defense}</p>
                    <p className="text-gray-400 text-sm">Durability: {item.durability || 100}%</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleEquip(item)}
                        className={`py-1 rounded text-xs ${
                          hunter.equipped_armor === item.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {hunter.equipped_armor === item.id ? 'Equipped' : 'Equip'}
                      </button>
                      <button
                        onClick={() => handleMaintain(item)}
                        disabled={crafting || item.durability >= 100}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-1 rounded text-xs disabled:opacity-50"
                      >
                        Maintain
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'shop' && (
          <div className="space-y-6">
            {Object.entries(EQUIPMENT_SHOP).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-white font-bold mb-3 capitalize">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleBuyEquipment(item, category === 'gadgets' ? 'gadget' : category.slice(0, -1))}
                      disabled={crafting}
                      className={`bg-${RARITY_COLORS[item.rarity]}-950/30 border border-${RARITY_COLORS[item.rarity]}-500/30 rounded-lg p-4 text-left hover:bg-${RARITY_COLORS[item.rarity]}-950/50`}
                    >
                      <p className="text-white font-bold mb-1">{item.name}</p>
                      {item.power && <p className="text-gray-400 text-xs">Power: {item.power}</p>}
                      {item.defense && <p className="text-gray-400 text-xs">Defense: {item.defense}</p>}
                      <p className="text-yellow-400 text-sm mt-2">{item.cost} XP</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}