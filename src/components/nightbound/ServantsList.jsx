import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, BookOpen, Zap, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import ServantDetailModal from './ServantDetailModal';

const VARIANT_DESCRIPTIONS = {
  devoted: 'Soft, earnest, emotionally anchored.',
  defiant: 'Controlled resistance through fascination.',
  dreamer: 'Detached, poetic, already half-gone.'
};

const STAGE_NAMES = ['Curious', 'Devoted', 'Dependent', 'Reverent', 'Bound'];

export default function ServantsList({ onClose, servants, vampireState }) {
  const [selectedServant, setSelectedServant] = useState(null);
  return (
    <>
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
          className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full relative max-h-[80vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-6">
            Servants
          </h2>
          
          <div className="space-y-3">
            {servants.map((servant, i) => (
              <motion.button
                key={servant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedServant(servant)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-colors text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-medium text-lg">
                      {servant.name}
                    </h3>
                    <p className="text-gray-400 text-sm capitalize">
                      {servant.variant} · {STAGE_NAMES[servant.obsession_stage - 1]}
                    </p>
                  </div>
                  
                  <Link 
                    to={createPageUrl(`Messages?servant=${servant.id}`)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
                
                {servant.is_turned && (
                  <span className="inline-block bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded">
                    Turned
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {selectedServant && (
        <ServantDetailModal
          servant={selectedServant}
          vampireState={vampireState}
          onClose={() => setSelectedServant(null)}
        />
      )}
    </>
  );
}