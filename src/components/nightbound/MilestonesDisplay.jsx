import React from 'react';
import { motion } from 'framer-motion';
import { X, Award, Calendar, Users, Skull, Crown, Map, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const MILESTONE_DEFINITIONS = {
  years_10: { label: '10 Years Survived', icon: Calendar, reward: 'Veteran Status' },
  years_50: { label: '50 Years Survived', icon: Calendar, reward: 'Ancient Powers' },
  years_100: { label: 'Century Vampire', icon: Calendar, reward: 'Elder Respect' },
  years_500: { label: '500 Years', icon: Crown, reward: 'Legendary Status' },
  first_kill: { label: 'First Kill', icon: Skull, reward: 'Killer Instinct' },
  first_servant: { label: 'First Servant', icon: Users, reward: 'Master Title' },
  first_coven: { label: 'Form a Coven', icon: Users, reward: 'Leader Status' },
  territory_control: { label: 'Control Territory', icon: Map, reward: 'Domain Master' },
  council_seat: { label: 'Join the Council', icon: Crown, reward: 'Political Power' }
};

export default function MilestonesDisplay({ onClose, vampireState }) {
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list()
  });

  const achieved = milestones.filter(m => m.achieved);
  const pending = Object.keys(MILESTONE_DEFINITIONS).filter(key => 
    !milestones.find(m => m.milestone_type === key && m.achieved)
  );

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Immortal Milestones</h2>
        <p className="text-gray-400 text-sm mb-6">{achieved.length} of {Object.keys(MILESTONE_DEFINITIONS).length} achieved</p>

        <div className="mb-6">
          <h3 className="text-white font-bold mb-3">Achieved</h3>
          {achieved.length === 0 ? (
            <p className="text-gray-500 text-sm">No milestones yet. Your journey begins.</p>
          ) : (
            <div className="space-y-2">
              {achieved.map(m => {
                const def = MILESTONE_DEFINITIONS[m.milestone_type];
                const Icon = def.icon;
                return (
                  <div key={m.id} className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{def.label}</h4>
                        <p className="text-green-400 text-xs">{m.reward || def.reward}</p>
                      </div>
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-white font-bold mb-3">Locked</h3>
          <div className="space-y-2">
            {pending.map(key => {
              const def = MILESTONE_DEFINITIONS[key];
              const Icon = def.icon;
              return (
                <div key={key} className="bg-gray-800/50 rounded-lg p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <h4 className="text-gray-400 font-medium">{def.label}</h4>
                      <p className="text-gray-600 text-xs">{def.reward}</p>
                    </div>
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