import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Zap, Users, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TEACHING_TOPICS = [
  'Explaining restraint',
  'Showing how to listen to hunger',
  'Demonstrating stillness',
  'Allowing them to observe feeding',
  'Practicing control together'
];

export default function ServantDetailModal({ servant, vampireState, onClose }) {
  const [teaching, setTeaching] = useState(false);
  const [turning, setTurning] = useState(false);
  const queryClient = useQueryClient();
  
  const handleTeach = async () => {
    setTeaching(true);
    
    setTimeout(async () => {
      const topic = TEACHING_TOPICS[Math.floor(Math.random() * TEACHING_TOPICS.length)];
      const newProgress = (servant.teaching_progress || 0) + 1;
      
      await base44.entities.Servant.update(servant.id, {
        teaching_progress: newProgress,
        obsession_stage: Math.min(servant.obsession_stage + (newProgress % 3 === 0 ? 1 : 0), 5)
      });
      
      await base44.entities.NightLog.create({
        entry: `You taught ${servant.name} about ${topic.toLowerCase()}.`,
        category: 'teaching',
        intensity: 'moderate'
      });
      
      // Chance to unlock teaching power
      if (Math.random() < 0.3 && !vampireState.unlocked_powers?.includes('Patient Teacher')) {
        const updatedPowers = [...(vampireState.unlocked_powers || []), 'Patient Teacher'];
        await base44.entities.VampireState.update(vampireState.id, {
          unlocked_powers: updatedPowers
        });
        
        await base44.entities.NightLog.create({
          entry: 'Through teaching, you discovered: Patient Teacher',
          category: 'power',
          intensity: 'significant'
        });
      }
      
      queryClient.invalidateQueries(['servants']);
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      setTeaching(false);
      onClose();
    }, 2000);
  };
  
  const handleTurn = async () => {
    setTurning(true);
    
    setTimeout(async () => {
      await base44.entities.Servant.update(servant.id, {
        is_turned: true,
        obsession_stage: 5
      });
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} has been turned. They are bound to you forever.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      // Unlock turning power
      if (!vampireState.unlocked_powers?.includes('The Gift')) {
        const updatedPowers = [...(vampireState.unlocked_powers || []), 'The Gift'];
        await base44.entities.VampireState.update(vampireState.id, {
          unlocked_powers: updatedPowers
        });
      }
      
      queryClient.invalidateQueries(['servants']);
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      setTurning(false);
      onClose();
    }, 3000);
  };
  
  const handleFeedOn = async () => {
    await base44.entities.NightLog.create({
      entry: `You fed on ${servant.name}. They trembled but did not pull away.`,
      category: 'feeding',
      intensity: 'moderate'
    });
    
    await base44.entities.Servant.update(servant.id, {
      obsession_stage: Math.min(servant.obsession_stage + 1, 5)
    });
    
    // Update hunger state
    await base44.entities.VampireState.update(vampireState.id, {
      hunger_state: 'sated',
      last_feed: new Date().toISOString()
    });
    
    // Chance to unlock feeding power
    if (Math.random() < 0.25 && !vampireState.unlocked_powers?.includes('Gentle Touch')) {
      const updatedPowers = [...(vampireState.unlocked_powers || []), 'Gentle Touch'];
      await base44.entities.VampireState.update(vampireState.id, {
        unlocked_powers: updatedPowers
      });
    }
    
    queryClient.invalidateQueries();
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {servant.name}
        </h2>
        <p className="text-gray-400 text-sm mb-6 capitalize">
          {servant.variant} · Stage {servant.obsession_stage}
        </p>
        
        {teaching || turning ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {teaching ? 'Teaching...' : 'Turning...'}
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleFeedOn}
              className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
            >
              <Heart className="w-5 h-5" />
              <span>Feed on {servant.name}</span>
            </button>
            
            <button
              onClick={handleTeach}
              className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5" />
              <span>Teach them</span>
            </button>
            
            {!servant.is_turned && servant.obsession_stage >= 4 && (
              <button
                onClick={handleTurn}
                className="w-full bg-red-900 hover:bg-red-800 text-white rounded-xl py-4 flex items-center gap-3 transition-colors"
              >
                <Zap className="w-5 h-5" />
                <span>Turn them</span>
              </button>
            )}
            
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">
                Teaching progress: {servant.teaching_progress || 0}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}