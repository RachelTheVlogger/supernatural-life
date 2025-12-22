import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Flame, Skull } from 'lucide-react';

const MORALITY_PATHS = {
  humane: {
    label: 'Humane',
    color: 'from-blue-500 to-green-500',
    icon: Heart,
    description: 'You cling to your humanity'
  },
  balanced: {
    label: 'Balanced',
    color: 'from-purple-500 to-blue-500',
    icon: Heart,
    description: 'You walk the line between human and monster'
  },
  ruthless: {
    label: 'Ruthless',
    color: 'from-red-500 to-purple-500',
    icon: Flame,
    description: 'You embrace the beast within'
  },
  monster: {
    label: 'Monster',
    color: 'from-red-600 to-black',
    icon: Skull,
    description: 'Humanity is a distant memory'
  }
};

export default function MoralityDisplay({ vampireState, compact = false }) {
  const humanity = vampireState.humanity ?? 50;
  const path = vampireState.moral_path || 'balanced';
  const pathData = MORALITY_PATHS[path];
  const Icon = pathData.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <div className="flex-1 bg-gray-800 rounded-full h-2 w-24">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${humanity}%` }}
            className={`h-2 rounded-full bg-gradient-to-r ${pathData.color}`}
          />
        </div>
        <span className="text-xs text-gray-400">{Math.round(humanity)}</span>
      </div>
    );
  }

  return (
    <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 bg-gradient-to-r ${pathData.color} bg-clip-text text-transparent`} />
          <span className="text-white font-medium">{pathData.label}</span>
        </div>
        <span className="text-gray-400 text-sm">{Math.round(humanity)}/100</span>
      </div>
      
      <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${humanity}%` }}
          transition={{ duration: 0.5 }}
          className={`h-3 bg-gradient-to-r ${pathData.color}`}
        />
      </div>
      
      <p className="text-gray-400 text-xs italic">{pathData.description}</p>
      
      {/* Threshold indicators */}
      <div className="flex justify-between mt-3 text-xs">
        <span className={humanity >= 75 ? 'text-green-400' : 'text-gray-600'}>Humane</span>
        <span className={humanity >= 25 && humanity < 75 ? 'text-purple-400' : 'text-gray-600'}>Balanced</span>
        <span className={humanity < 25 ? 'text-red-400' : 'text-gray-600'}>Monster</span>
      </div>
    </div>
  );
}