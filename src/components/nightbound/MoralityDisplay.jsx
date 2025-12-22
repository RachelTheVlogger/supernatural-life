import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Skull, Scale, Flame } from 'lucide-react';

const MORALITY_PATHS = {
  humane: {
    label: 'Humane',
    color: 'from-blue-600 to-cyan-500',
    icon: Heart,
    description: 'You retain your humanity'
  },
  balanced: {
    label: 'Balanced',
    color: 'from-purple-600 to-pink-500',
    icon: Scale,
    description: 'Walking the line'
  },
  ruthless: {
    label: 'Ruthless',
    color: 'from-red-600 to-orange-500',
    icon: Flame,
    description: 'The beast grows stronger'
  },
  monster: {
    label: 'Monster',
    color: 'from-gray-900 to-red-900',
    icon: Skull,
    description: 'Humanity lost'
  }
};

export default function MoralityDisplay({ vampireState, compact = false }) {
  const humanity = vampireState.humanity ?? 50;
  const moralPath = vampireState.moral_path || 'balanced';
  const pathData = MORALITY_PATHS[moralPath];
  const Icon = pathData.icon;
  
  if (compact) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-purple-900/30">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm font-medium">{pathData.label}</span>
          <span className="text-gray-400 text-xs ml-auto">{humanity}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${humanity}%` }}
            transition={{ duration: 0.5 }}
            className={`h-2 bg-gradient-to-r ${pathData.color} rounded-full`}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-900/30">
      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5" />
        Humanity
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 font-medium">{pathData.label}</span>
            <span className="text-gray-400 text-sm">{humanity}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${humanity}%` }}
              transition={{ duration: 0.5 }}
              className={`h-3 bg-gradient-to-r ${pathData.color} rounded-full`}
            />
            
            {/* Threshold markers */}
            <div className="absolute inset-0 flex justify-between px-1">
              <div className="w-0.5 h-full bg-white/20" style={{ marginLeft: '10%' }} />
              <div className="w-0.5 h-full bg-white/20" style={{ marginLeft: '25%' }} />
              <div className="w-0.5 h-full bg-white/20" style={{ marginLeft: '75%' }} />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Monster</span>
            <span>Ruthless</span>
            <span>Balanced</span>
            <span>Humane</span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm italic">{pathData.description}</p>
        
        {/* Power availability hint */}
        <div className="bg-purple-950/20 border border-purple-800/30 rounded-lg p-3">
          <p className="text-xs text-purple-300">
            Your morality unlocks different powers:
          </p>
          <ul className="text-xs text-gray-400 mt-1 space-y-0.5">
            {humanity >= 60 && <li>• Humane powers available</li>}
            {humanity >= 25 && humanity <= 75 && <li>• Balanced powers available</li>}
            {humanity <= 40 && <li>• Ruthless powers available</li>}
            {humanity <= 15 && <li>• Monster powers available</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}