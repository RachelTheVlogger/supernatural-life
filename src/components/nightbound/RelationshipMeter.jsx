import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function RelationshipMeter({ relationship = 0, maxRelationship = 100, compact = false }) {
  const percentage = Math.min(Math.max(relationship, 0), maxRelationship) / maxRelationship * 100;
  
  const getRelationshipLabel = (rel) => {
    if (rel < 0) return 'Hostile';
    if (rel < 20) return 'Disdain';
    if (rel < 40) return 'Wary';
    if (rel < 60) return 'Neutral';
    if (rel < 75) return 'Friendly';
    if (rel < 90) return 'Close';
    return 'Devoted';
  };

  const getColor = (rel) => {
    if (rel < 0) return 'from-red-600 to-red-500';
    if (rel < 20) return 'from-orange-600 to-orange-500';
    if (rel < 40) return 'from-yellow-600 to-yellow-500';
    if (rel < 60) return 'from-gray-600 to-gray-500';
    if (rel < 75) return 'from-green-600 to-green-500';
    if (rel < 90) return 'from-blue-600 to-blue-500';
    return 'from-pink-600 to-pink-500';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-pink-400" />
        <div className="flex-1">
          <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full bg-gradient-to-r ${getColor(relationship)}`}
            />
          </div>
        </div>
        <span className="text-xs text-gray-400">{relationship}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" />
          <span className="text-white font-medium">Relationship</span>
        </div>
        <span className={`text-sm font-bold ${
          relationship >= 60 ? 'text-green-400' : relationship >= 40 ? 'text-yellow-400' : 'text-orange-400'
        }`}>
          {getRelationshipLabel(relationship)}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, type: 'spring' }}
            className={`h-full bg-gradient-to-r ${getColor(relationship)}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Hostile</span>
          <span>{relationship} / {maxRelationship}</span>
          <span>Devoted</span>
        </div>
      </div>
    </div>
  );
}