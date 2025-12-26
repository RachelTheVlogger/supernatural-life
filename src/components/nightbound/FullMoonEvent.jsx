import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const MOON_EVENTS = [
  { id: 'resist', label: 'Resist the Change', result: 'You fought it. Sweat. Pain. Control maintained. But barely.', controlGain: 10, strengthLoss: 5 },
  { id: 'embrace', label: 'Embrace the Beast', result: 'You let go. The wolf took over. Power. Freedom. Blood.', strengthGain: 15, controlLoss: 10, kills: 3 },
  { id: 'hunt', label: 'Controlled Hunt', result: 'You guided the transformation. Hunted with precision. Beast and mind as one.', strengthGain: 10, controlGain: 5, kills: 2 },
  { id: 'howl', label: 'Howl and Summon', result: 'Your howl pierced the night. Others answered. The pack grows.', packGain: true },
  { id: 'rampage', label: 'Unleash Completely', result: 'Pure carnage. No control. Just hunger and rage. You are the monster.', strengthGain: 25, controlLoss: 20, kills: 8, dangerous: true }
];

export default function FullMoonEvent({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [choosing, setChoosing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleChoice = async (event) => {
    setChoosing(true);
    
    setTimeout(async () => {
      const updates = {};
      
      if (event.controlGain) updates.transformation_control = Math.min(100, (werewolf.transformation_control || 0) + event.controlGain);
      if (event.controlLoss) updates.transformation_control = Math.max(0, (werewolf.transformation_control || 0) - event.controlLoss);
      if (event.strengthGain) updates.wolf_strength = Math.min(100, (werewolf.wolf_strength || 0) + event.strengthGain);
      if (event.strengthLoss) updates.wolf_strength = Math.max(0, (werewolf.wolf_strength || 0) - event.strengthLoss);
      if (event.kills) updates.kills = (werewolf.kills || 0) + event.kills;
      if (event.packGain) updates.pack_members = (werewolf.pack_members || 0) + Math.floor(Math.random() * 2) + 1;
      
      await base44.entities.PlayerWerewolf.update(werewolf.id, updates);

      await base44.entities.NightLog.create({
        entry: `Full moon: ${event.result}`,
        category: 'interaction',
        intensity: event.dangerous ? 'significant' : 'moderate'
      });

      setOutcome(event.result);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        onClose();
      }, 4000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <Moon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">🌕 Full Moon</h2>
          <p className="text-gray-400">The moon calls. The beast awakens. How will you respond?</p>
        </div>

        {!outcome && !choosing && (
          <div className="space-y-3">
            {MOON_EVENTS.map(event => (
              <button
                key={event.id}
                onClick={() => handleChoice(event)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold">{event.label}</h3>
                  {event.dangerous && <span className="text-red-400 text-xs">⚠️ Dangerous</span>}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {event.controlGain && `+${event.controlGain} control `}
                  {event.controlLoss && `-${event.controlLoss} control `}
                  {event.strengthGain && `+${event.strengthGain} strength `}
                  {event.kills && `${event.kills} kills `}
                  {event.packGain && 'attract new wolves'}
                </p>
              </button>
            ))}
          </div>
        )}

        {choosing && !outcome && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-400">Transforming...</p>
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="py-8">
            <p className="text-gray-300 text-center text-lg leading-relaxed">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}