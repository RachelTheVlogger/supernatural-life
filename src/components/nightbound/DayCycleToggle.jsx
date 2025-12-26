import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function DayCycleToggle({ vampireState }) {
  const queryClient = useQueryClient();
  const [transitioning, setTransitioning] = React.useState(false);

  const toggleCycle = async () => {
    if (!vampireState || transitioning) return;
    
    setTransitioning(true);
    
    const newTime = vampireState.time_of_day === 'night' ? 'day' : 'night';
    
    await base44.entities.VampireState.update(vampireState.id, {
      time_of_day: newTime
    });

    await base44.entities.NightLog.create({
      entry: newTime === 'day' 
        ? 'Dawn breaks. The sun rises. Time to rest.'
        : 'Night falls. Darkness returns. Your time begins.',
      category: 'observation',
      intensity: 'subtle'
    });

    await queryClient.refetchQueries(['vampireState']);
    
    setTimeout(() => setTransitioning(false), 500);
  };

  const isDay = vampireState?.time_of_day === 'day';

  return (
    <motion.button
      onClick={toggleCycle}
      disabled={transitioning}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all ${
        isDay 
          ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/50'
          : 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/50'
      } ${transitioning ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: transitioning ? 360 : 0 }}
          transition={{ duration: 1 }}
        >
          {isDay ? (
            <Sun className="w-6 h-6 text-orange-400" />
          ) : (
            <Moon className="w-6 h-6 text-purple-400" />
          )}
        </motion.div>
        <div className="text-left">
          <h3 className="text-white font-bold">
            {transitioning ? 'Transitioning...' : isDay ? 'Switch to Night' : 'Switch to Day'}
          </h3>
          <p className="text-gray-400 text-xs">
            {isDay ? 'Wake when the sun sets' : 'Rest as the sun rises'}
          </p>
        </div>
      </div>
    </motion.button>
  );
}