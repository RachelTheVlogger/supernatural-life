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

const RELATIONSHIP_LEVELS = [
  { min: 0, max: 20, label: 'Wary', color: 'bg-gray-700' },
  { min: 21, max: 40, label: 'Curious', color: 'bg-blue-900/50' },
  { min: 41, max: 60, label: 'Trusting', color: 'bg-green-900/50' },
  { min: 61, max: 80, label: 'Devoted', color: 'bg-purple-900/50' },
  { min: 81, max: 100, label: 'Bound', color: 'bg-red-900/50' }
];

const getRelationshipLevel = (value) => {
  return RELATIONSHIP_LEVELS.find(level => value >= level.min && value <= level.max) || RELATIONSHIP_LEVELS[0];
};

export default function ServantsList({ onClose, servants, vampireState }) {
  const [selectedServant, setSelectedServant] = useState(null);

  if (!servants || servants.length === 0) {
    return null;
  }

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
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 touch-manipulation p-2"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-6">
            Servants
          </h2>
          
          <div className="space-y-3">
            {servants.slice(0, 1).map((servant, i) => (
              <motion.button
                key={servant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedServant(servant)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition-colors text-left"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-lg">
                      {servant.name}
                    </h3>
                    <p className="text-gray-400 text-sm capitalize">
                      {servant.variant} · {STAGE_NAMES[servant.obsession_stage - 1]}
                    </p>

                    {/* Relationship mini bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-1.5 max-w-[120px]">
                        <div
                          style={{ width: `${servant.relationship || 0}%` }}
                          className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-red-500"
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {getRelationshipLevel(servant.relationship || 0).label}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to={createPageUrl(`Messages?servant=${servant.id}`)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
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