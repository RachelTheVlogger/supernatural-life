import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Check } from 'lucide-react';

export default function MusicEquipment({ onClose, onPurchase }) {
  const equipment = [
    { id: 'basic_mic', name: 'Basic USB Microphone', price: 50, quality: 20, owned: false },
    { id: 'pro_mic', name: 'Professional Studio Mic', price: 300, quality: 50, owned: false },
    { id: 'vintage_mic', name: 'Vintage Tube Microphone', price: 1500, quality: 90, owned: false },
    { id: 'acoustic_guitar', name: 'Acoustic Guitar', price: 200, quality: 30, owned: false },
    { id: 'electric_guitar', name: 'Electric Guitar + Amp', price: 800, quality: 60, owned: false },
    { id: 'keyboard', name: 'MIDI Keyboard', price: 400, quality: 45, owned: false },
    { id: 'drum_machine', name: 'Electronic Drum Machine', price: 600, quality: 55, owned: false },
    { id: 'audio_interface', name: 'Audio Interface', price: 250, quality: 40, owned: false },
    { id: 'studio_monitors', name: 'Studio Monitor Speakers', price: 500, quality: 50, owned: false },
    { id: 'home_studio', name: 'Complete Home Studio Setup', price: 5000, quality: 100, owned: false }
  ];

  const [ownedItems, setOwnedItems] = useState([]);

  const buyEquipment = (item) => {
    setOwnedItems([...ownedItems, item.id]);
    onPurchase(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🎸 Music Equipment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {equipment.map(item => {
            const isOwned = ownedItems.includes(item.id);
            return (
              <div key={item.id} className={`bg-gray-800/50 border rounded-xl p-4 ${
                isOwned ? 'border-green-500/50' : 'border-gray-700'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                        +{item.quality}% quality
                      </span>
                    </div>
                  </div>
                  {isOwned ? (
                    <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Owned
                    </div>
                  ) : (
                    <button
                      onClick={() => buyEquipment(item)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      ${item.price}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}