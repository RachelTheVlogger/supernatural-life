import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tantml:react-query';
import { format, addDays } from 'date-fns';

export default function AdvanceNight({ vampireState, onClose }) {
  const [advancing, setAdvancing] = useState(false);
  const queryClient = useQueryClient();
  
  // Calculate current game date
  const gameStartDate = vampireState.game_start_date 
    ? new Date(vampireState.game_start_date) 
    : new Date();
  const currentGameDate = addDays(gameStartDate, vampireState.nights_passed || 0);
  
  const handleAdvance = async () => {
    setAdvancing(true);
    
    setTimeout(async () => {
      // Advance night counter
      const newNight = (vampireState.nights_passed || 0) + 1;
      
      // Update vampire state
      await base44.entities.VampireState.update(vampireState.id, {
        nights_passed: newNight
      });
      
      // Log the night passing
      await base44.entities.NightLog.create({
        entry: `Night ${newNight} begins. The city sleeps. You do not.`,
        category: 'observation',
        intensity: 'subtle'
      });
      
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      
      setTimeout(() => {
        setAdvancing(false);
        onClose();
      }, 2000);
    }, 1500);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-8 max-w-md w-full relative border border-purple-900/30"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <Moon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Advance to Next Night</h2>
          
          <div className="bg-black/40 rounded-xl p-4 my-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <p className="text-gray-300">
                {format(currentGameDate, 'MMMM d, yyyy')}
              </p>
            </div>
            <p className="text-gray-400 text-sm">Current: Night {vampireState.nights_passed || 0}</p>
            <p className="text-purple-400 text-lg font-bold">Next: Night {(vampireState.nights_passed || 0) + 1}</p>
          </div>
          
          {advancing ? (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400 py-4"
            >
              Time passes...
            </motion.p>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6">
                Dawn approaches. Will you continue into another night?
              </p>
              
              <button
                onClick={handleAdvance}
                className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 rounded-xl py-4 text-white font-medium transition-all"
              >
                Advance Night
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}