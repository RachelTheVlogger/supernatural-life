import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Camera, Palette, Pen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const CAREERS = {
  jewelry: { 
    name: 'Gothic Jewelry Designer', 
    icon: '💎', 
    description: 'Craft dark and beautiful jewelry pieces',
    color: 'from-purple-900/40 to-pink-900/40',
    borderColor: 'border-purple-500/50'
  },
  tattoo: { 
    name: 'Tattoo Artist', 
    icon: '🎨', 
    description: 'Create permanent art on skin',
    color: 'from-red-900/40 to-orange-900/40',
    borderColor: 'border-red-500/50'
  },
  author: { 
    name: 'Author', 
    icon: '📚', 
    description: 'Write and publish books professionally',
    color: 'from-gray-900/40 to-purple-900/40',
    borderColor: 'border-gray-500/50'
  }
};

export default function CareerSelector({ servant, onClose, onSelect }) {
  const queryClient = useQueryClient();

  const handleSelectCareer = async (careerType) => {
    const careerData = {
      servant_id: servant.id,
      jewelry_business_active: careerType === 'jewelry',
      tattoo_business_active: careerType === 'tattoo',
      author_career_active: careerType === 'author'
    };

    const existing = await base44.entities.ServantCareer.filter({ servant_id: servant.id });
    
    if (existing.length > 0) {
      await base44.entities.ServantCareer.update(existing[0].id, careerData);
    } else {
      await base44.entities.ServantCareer.create(careerData);
    }

    await base44.entities.NightLog.create({
      entry: `${servant.name} started a new career: ${CAREERS[careerType].name}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    onSelect(careerType);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Choose a Career</h2>
        <p className="text-gray-400 text-sm mb-6">What will {servant.name} pursue?</p>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(CAREERS).map(([key, career]) => (
            <button
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectCareer(key);
              }}
              className={`bg-gradient-to-br ${career.color} border-2 ${career.borderColor} rounded-xl p-6 text-center hover:scale-105 transition-all`}
            >
              <div className="text-5xl mb-3">{career.icon}</div>
              <h3 className="text-white font-bold mb-2">{career.name}</h3>
              <p className="text-gray-400 text-sm">{career.description}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}