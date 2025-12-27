import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const MERCH_TYPES = [
  { id: 'poster', label: 'Character Poster', price: 15, icon: '🖼️' },
  { id: 'figure', label: 'Figure', price: 45, icon: '🎎' },
  { id: 'shirt', label: 'T-Shirt', price: 25, icon: '👕' },
  { id: 'mug', label: 'Coffee Mug', price: 12, icon: '☕' },
  { id: 'keychain', label: 'Keychain', price: 8, icon: '🔑' },
  { id: 'artbook', label: 'Art Book', price: 35, icon: '📚' }
];

export default function MangaMerch({ career, characters, onClose }) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreateMerch = async () => {
    if (!selectedType || !selectedChar) return;
    setCreating(true);

    const merch = career.merchandise || [];
    const sales = Math.floor(Math.random() * 50) + 20;
    const revenue = sales * selectedType.price;

    merch.push({
      id: Date.now().toString(),
      type: selectedType.id,
      character: selectedChar.name,
      price: selectedType.price,
      sales: sales,
      revenue: revenue,
      created_date: new Date().toISOString()
    });

    await base44.entities.ServantCareer.update(career.id, {
      merchandise: merch,
      income: (career.income || 0) + revenue
    });

    await base44.entities.NightLog.create({
      entry: `New merchandise: ${selectedChar.name} ${selectedType.label}! ${sales} sold, +$${revenue}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries(['career']);
    setCreating(false);
    setSelectedType(null);
    setSelectedChar(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">Merchandise Shop</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {characters.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Create characters first to make merchandise!</p>
        ) : (
          <>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-3">Create New Merch</h4>
              
              <p className="text-gray-400 text-sm mb-2">Select Type:</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MERCH_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`rounded-lg p-3 transition-colors ${
                      selectedType?.id === type.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                    <div className="text-xs opacity-80">${type.price}</div>
                  </button>
                ))}
              </div>

              <p className="text-gray-400 text-sm mb-2">Select Character:</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedChar(char)}
                    className={`rounded-lg p-3 text-left transition-colors ${
                      selectedChar?.id === char.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{char.name}</div>
                    <div className="text-xs opacity-80">{char.appearances || 0} appearances</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleCreateMerch}
                disabled={!selectedType || !selectedChar || creating}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Merchandise'}
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-medium">Your Merchandise</h4>
              {(career?.merchandise || []).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No merchandise yet</p>
              ) : (
                [...(career.merchandise || [])].reverse().map(item => (
                  <div key={item.id} className="bg-gradient-to-br from-yellow-950/40 to-orange-950/40 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-white font-medium">{MERCH_TYPES.find(t => t.id === item.type)?.icon} {item.character} {MERCH_TYPES.find(t => t.id === item.type)?.label}</h5>
                        <p className="text-gray-400 text-sm">${item.price} each</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${item.revenue}</p>
                        <p className="text-gray-400 text-xs">{item.sales} sold</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}