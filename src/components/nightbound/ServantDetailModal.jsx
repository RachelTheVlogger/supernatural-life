import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Zap, Users, Heart, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TEACHING_TOPICS = [
  'Explaining restraint',
  'Showing how to listen to hunger',
  'Demonstrating stillness',
  'Allowing them to observe feeding',
  'Practicing control together'
];

const LOCATIONS = [
  { name: 'Night walk through the city', outcomes: ['You walked together in silence.', 'They stayed close to you.', 'The night felt different with them beside you.'] },
  { name: 'Visit an abandoned building', outcomes: ['You explored together. They trusted you completely.', 'They followed you without question.', 'You shared the darkness.'] },
  { name: 'Go to a rooftop', outcomes: ['You watched the city together.', 'They leaned against you.', 'Time passed differently up there.'] },
  { name: 'Walk through the forest', outcomes: ['You moved between trees together.', 'They felt safer with you.', 'The forest accepted you both.'] },
  { name: 'Visit a cemetery', outcomes: ['You stood among the graves together.', 'They understood you better now.', 'Death felt less foreign to them.'] }
];

export default function ServantDetailModal({ servant, vampireState, onClose }) {
  const [teaching, setTeaching] = useState(false);
  const [turning, setTurning] = useState(false);
  const [goingOut, setGoingOut] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
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
  
  const handleGoOut = async (location) => {
    setGoingOut(true);
    setShowLocations(false);
    
    setTimeout(async () => {
      const outcome = location.outcomes[Math.floor(Math.random() * location.outcomes.length)];
      
      await base44.entities.NightLog.create({
        entry: `${location.name}: ${outcome}`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      await base44.entities.Servant.update(servant.id, {
        obsession_stage: Math.min(servant.obsession_stage + 1, 5)
      });
      
      // Chance to unlock exploration power
      if (Math.random() < 0.2 && !vampireState.unlocked_powers?.includes('Shared Journey')) {
        const updatedPowers = [...(vampireState.unlocked_powers || []), 'Shared Journey'];
        await base44.entities.VampireState.update(vampireState.id, {
          unlocked_powers: updatedPowers
        });
      }
      
      queryClient.invalidateQueries();
      setGoingOut(false);
      onClose();
    }, 2500);
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
        
        {teaching || turning || goingOut ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {teaching ? 'Teaching...' : turning ? 'Turning...' : '...'}
            </motion.p>
          </div>
        ) : showLocations ? (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">Where will you go?</p>
            {LOCATIONS.map((location, i) => (
              <button
                key={i}
                onClick={() => handleGoOut(location)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <p className="text-white text-sm">{location.name}</p>
              </button>
            ))}
            <button
              onClick={() => setShowLocations(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-3 text-gray-400 transition-colors"
            >
              Back
            </button>
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
            
            <button
              onClick={() => setShowLocations(true)}
              className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
            >
              <MapPin className="w-5 h-5" />
              <span>Go somewhere together</span>
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