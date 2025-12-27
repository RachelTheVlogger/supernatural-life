import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Eye, Wind, Brain, Moon, Target } from 'lucide-react';

const POWER_ICONS = {
  Compulsion: Brain,
  'Heightened Hearing': Eye,
  'Emotional Imprint': Target,
  'Lingering Presence': Moon,
  'Shadow Patience': Moon,
  'Night Sight': Eye,
  'Veiled Voice': Brain,
  'Blood Memory': Brain,
  Stillness: Wind,
  'Threshold Sense': Eye,
  'Scent Reading': Eye,
  'Time Dilation': Moon,
  'Presence Weight': Target,
  'Hunger Suppression': Wind,
  'Mutual Awareness': Brain,
  'Dream Reach': Moon,
  'Echo Step': Wind,
  'Silent Invitation': Brain,
  'Night Calm': Wind,
  'Binding Gaze': Eye,
  'Heightened Speed': Wind,
  'Heightened Strength': Zap
};

export default function PowersModal({ onClose, vampireState }) {
  if (!vampireState) {
    return null;
  }

  const unlockedPowers = vampireState.unlocked_powers || [];
  
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full relative max-h-[80vh] overflow-y-auto"
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
          Unlocked Powers
        </h2>
        
        {unlockedPowers.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            No powers unlocked yet. Continue your journey through the night.
          </p>
        ) : (
          <div className="space-y-3">
            {unlockedPowers.map((power, i) => {
              const Icon = POWER_ICONS[power] || Zap;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-4 flex items-center gap-3"
                >
                  <Icon className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">{power}</span>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">
            Powers unlock through your actions and choices. There is no limit to what you can become.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}