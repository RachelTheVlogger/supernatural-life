import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Skull, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const AGING_MILESTONES = [
  { years: 50, power: 'Enhanced Speed', humanity: -5 },
  { years: 100, power: 'Mind Reading', humanity: -10 },
  { years: 200, power: 'Daylight Tolerance', humanity: -15 },
  { years: 500, power: 'Immortal Strength', humanity: -20 },
  { years: 1000, power: 'Ancient Wisdom', humanity: -25 }
];

export default function VampireAgingSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();

  const handleAgeForward = async (years) => {
    const newYears = vampireState.years_survived + years;
    const newHumanity = Math.max(0, vampireState.humanity - Math.floor(years / 10));
    
    // Check for milestone unlocks
    const unlockedPowers = [...(vampireState.unlocked_powers || [])];
    AGING_MILESTONES.forEach(milestone => {
      if (newYears >= milestone.years && !unlockedPowers.includes(milestone.power)) {
        unlockedPowers.push(milestone.power);
      }
    });
    
    await base44.entities.VampireState.update(vampireState.id, {
      years_survived: newYears,
      humanity: newHumanity,
      unlocked_powers: unlockedPowers
    });
    
    await base44.entities.NightLog.create({
      entry: `${years} years passed. You are ${newYears} years old. Memories fade. Power grows.`,
      category: 'power',
      intensity: 'significant'
    });
    
    queryClient.invalidateQueries();
  };

  const nextMilestone = AGING_MILESTONES.find(m => m.years > vampireState.years_survived);

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">⏳ Vampire Aging</h2>
        <p className="text-gray-400 text-sm mb-6">Centuries pass. You endure.</p>

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">Age as a Vampire</p>
            <p className="text-white text-4xl font-bold">{vampireState.years_survived} years</p>
          </div>
          
          {nextMilestone && (
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Next Milestone</p>
              <div className="flex justify-between items-center">
                <p className="text-white text-sm">{nextMilestone.power}</p>
                <p className="text-purple-400 text-sm">{nextMilestone.years} years</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleAgeForward(10)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl p-4 transition-colors"
          >
            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="font-medium">Age 10 Years</p>
            <p className="text-gray-400 text-xs">-1 humanity</p>
          </button>

          <button
            onClick={() => handleAgeForward(50)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl p-4 transition-colors"
          >
            <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="font-medium">Age 50 Years</p>
            <p className="text-gray-400 text-xs">-5 humanity</p>
          </button>

          <button
            onClick={() => handleAgeForward(100)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl p-4 transition-colors"
          >
            <Clock className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="font-medium">Age 100 Years</p>
            <p className="text-gray-400 text-xs">-10 humanity</p>
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-white font-bold mb-3">Unlocked Through Aging</h3>
          <div className="space-y-2">
            {AGING_MILESTONES.map(milestone => {
              const unlocked = vampireState.years_survived >= milestone.years;
              return (
                <div key={milestone.years} className={`rounded-lg p-3 ${unlocked ? 'bg-green-900/20' : 'bg-gray-800'}`}>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${unlocked ? 'text-green-400' : 'text-gray-400'}`}>
                      {unlocked ? '✓' : '🔒'} {milestone.power}
                    </p>
                    <p className={`text-xs ${unlocked ? 'text-green-400' : 'text-gray-500'}`}>
                      {milestone.years} years
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}