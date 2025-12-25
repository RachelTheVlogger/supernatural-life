import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function ServantIdentityRevelation({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  
  // Generate identity if not set
  const gender = servant.gender || ['man', 'woman', 'custom'][Math.floor(Math.random() * 3)];
  const sexuality = servant.sexuality || ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'questioning'][Math.floor(Math.random() * 7)];
  
  const handleReveal = async () => {
    setRevealing(true);
    
    setTimeout(async () => {
      try {
        await base44.entities.Servant.update(servant.id, {
          gender: gender,
          sexuality: sexuality,
          identity_revealed: true
        });
        
        await base44.entities.NightLog.create({
          entry: `${servant.name} opened up about who they are. Gender: ${gender}. Sexuality: ${sexuality}. You listened. You understood.`,
          category: 'interaction',
          intensity: 'moderate'
        });
        
        queryClient.invalidateQueries();
        setRevealed(true);
        
        setTimeout(() => {
          onClose();
        }, 3000);
      } catch (e) {
        console.error('Failed to reveal identity:', e);
      }
    }, 2000);
  };
  
  const getGenderLabel = (g) => {
    if (g === 'man') return 'a man';
    if (g === 'woman') return 'a woman';
    return 'non-binary';
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
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {revealed ? (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">
              You listened. You accepted them completely.
            </p>
          </div>
        ) : revealing ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <p className="text-gray-400">Listening...</p>
            </motion.div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">{servant.name} wants to talk</h2>
            <p className="text-gray-400 text-sm mb-6">
              They seem nervous. They want to tell you something about themselves.
            </p>
            
            <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-sm italic mb-3">
                "{vampireState?.preferred_title || 'Hey'}... I need to tell you something about me."
              </p>
              <p className="text-gray-300 text-sm italic mb-3">
                "I'm {getGenderLabel(gender)}. And... I'm {sexuality}."
              </p>
              <p className="text-gray-300 text-sm italic">
                "I hope that's okay. I just... needed you to know who I really am."
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleReveal}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl transition-all"
              >
                Listen & Accept
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}