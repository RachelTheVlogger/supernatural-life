import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, DollarSign, Star, Award, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const TATTOO_STYLES = {
  traditional: { name: 'Traditional', price: 150, time: 3000, difficulty: 'Easy' },
  blackwork: { name: 'Blackwork', price: 200, time: 4000, difficulty: 'Medium' },
  japanese: { name: 'Japanese', price: 250, time: 5000, difficulty: 'Medium' },
  realism: { name: 'Realism', price: 350, time: 6000, difficulty: 'Hard' },
  gothic: { name: 'Gothic', price: 280, time: 5000, difficulty: 'Medium' },
  occult: { name: 'Occult', price: 300, time: 5500, difficulty: 'Hard' }
};

export default function TattooStudio({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('clients');
  const [tattooing, setTattooing] = useState(null);

  // TODO: Add entities for TattooClient, TattooStats, etc.
  // For now, placeholder UI

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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Tattoo Studio</h2>
        <p className="text-gray-400 text-sm mb-6">Creating permanent dark art</p>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-gray-400">Tattoo studio coming soon...</p>
          <p className="text-gray-500 text-sm mt-2">Full tattoo mechanics will be added in the next update</p>
        </div>
      </motion.div>
    </motion.div>
  );
}