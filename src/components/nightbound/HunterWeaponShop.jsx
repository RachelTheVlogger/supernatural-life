import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const WEAPONS = [
  {
    id: 'silver_dagger',
    name: 'Silver Dagger',
    price: 1000,
    effectiveness: 60,
    desc: 'Burns vampire flesh on contact. Effective but limited range.',
    icon: '🗡️',
    supernaturalTypes: ['vampire', 'werewolf']
  },
  {
    id: 'crossbow_stakes',
    name: 'Crossbow with Stakes',
    price: 2500,
    effectiveness: 75,
    desc: 'Heart shot. One bolt, one vampire. Clean and efficient.',
    icon: '🏹',
    supernaturalTypes: ['vampire']
  },
  {
    id: 'holy_water',
    name: 'Holy Water (5 vials)',
    price: 500,
    effectiveness: 50,
    desc: 'Causes severe burns and weakens supernatural barriers.',
    icon: '🧪',
    supernaturalTypes: ['vampire', 'demon', 'witch']
  },
  {
    id: 'iron_chains',
    name: 'Iron Chains',
    price: 800,
    effectiveness: 40,
    desc: 'Restricts supernatural mobility. Painful for many beings.',
    icon: '⛓️',
    supernaturalTypes: ['fae', 'demon', 'werewolf']
  },
  {
    id: 'flamethrower',
    name: 'Flamethrower',
    price: 5000,
    effectiveness: 90,
    desc: 'Indiscriminate destruction. Burns everything.',
    icon: '🔥',
    supernaturalTypes: ['vampire', 'werewolf', 'witch', 'demon']
  },
  {
    id: 'uv_spotlight',
    name: 'Portable UV Spotlight',
    price: 1200,
    effectiveness: 70,
    desc: 'Daylight simulator. Incapacitates vampires instantly.',
    icon: '💡',
    supernaturalTypes: ['vampire']
  },
  {
    id: 'vervain_bullets',
    name: 'Vervain-Tipped Bullets',
    price: 1500,
    effectiveness: 65,
    desc: 'Weakens supernatural reflexes. Makes them mortal-slow.',
    icon: '🔫',
    supernaturalTypes: ['vampire', 'werewolf', 'demon']
  },
  {
    id: 'binding_circle',
    name: 'Binding Circle Kit',
    price: 2000,
    effectiveness: 80,
    desc: 'Trap supernatural beings inside. They cannot escape.',
    icon: '⭕',
    supernaturalTypes: ['demon', 'witch', 'fae']
  },
  {
    id: 'artifact_disruptor',
    name: 'Artifact Disruptor',
    price: 3500,
    effectiveness: 75,
    desc: 'Nullifies supernatural artifacts and enchantments.',
    icon: '📡',
    supernaturalTypes: ['witch', 'demon', 'artifact_users']
  },
  {
    id: 'mithril_armor',
    name: 'Mithril Combat Suit',
    price: 4000,
    effectiveness: 85,
    desc: 'Lightweight armor. Resists supernatural damage.',
    icon: '🛡️',
    supernaturalTypes: ['all']
  }
];

export default function HunterWeaponShop({ hunter, onClose, onPurchase }) {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState(5000);
  const [inventory, setInventory] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');

  const handlePurchase = async (weapon) => {
    if (currency < weapon.price) {
      setMessage('Not enough funds.');
      return;
    }

    setPurchasing(true);
    setTimeout(async () => {
      try {
        setCurrency(currency - weapon.price);
        setInventory([...inventory, weapon]);
        setMessage(`Purchased ${weapon.name}. +${weapon.effectiveness} effectiveness.`);
        
        if (onPurchase) {
          onPurchase(weapon);
        }

        setTimeout(() => setMessage(''), 3000);
      } catch (e) {
        console.error('Purchase failed:', e);
      }
      setPurchasing(false);
    }, 500);
  };

  const availableWeapons = WEAPONS.filter(w => !inventory.some(i => i.id === w.id));

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart className="w-6 h-6 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Weapon Armory</h2>
            <p className="text-gray-400 text-sm">{hunter.name}'s Arsenal</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Funds Available</span>
            <span className="text-yellow-400 font-bold text-lg">${currency}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Owned: {inventory.length}/{WEAPONS.length}</span>
            <span>Skill: {hunter.skill_level}%</span>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/60 border border-blue-500/30 rounded-lg p-3 mb-4 text-blue-300 text-sm"
          >
            {message}
          </motion.div>
        )}

        {inventory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Owned Weapons</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {inventory.map(w => (
                <div
                  key={w.id}
                  className="bg-green-900/20 border border-green-500/30 rounded-lg p-2 text-center"
                >
                  <span className="text-2xl">{w.icon}</span>
                  <p className="text-green-300 text-xs font-medium mt-1">{w.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-white font-medium mb-3">Available Weapons</h3>
        <div className="space-y-2">
          {availableWeapons.map(weapon => (
            <button
              key={weapon.id}
              onClick={() => handlePurchase(weapon)}
              disabled={currency < weapon.price || purchasing}
              className={`w-full rounded-lg p-4 text-left transition-colors ${
                currency < weapon.price
                  ? 'bg-gray-700/40 opacity-60 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{weapon.icon}</span>
                  <div>
                    <h4 className="text-white font-medium">{weapon.name}</h4>
                    <p className="text-gray-400 text-sm">{weapon.desc}</p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-yellow-400">vs: {weapon.supernaturalTypes.join(', ')}</span>
                      <span className="text-purple-400">Eff: {weapon.effectiveness}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-yellow-400 font-bold">${weapon.price}</p>
                  {currency < weapon.price && (
                    <p className="text-red-400 text-xs mt-1">Need ${weapon.price - currency}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}